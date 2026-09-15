import express from 'express';
import pg from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Razorpay from 'razorpay';

dotenv.config();

const { Client } = pg;
const app = express();

// ============================================================
// 1. SECURITY MIDDLEWARE (HELMET & RATE LIMITING)
// ============================================================

// Apply HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP in dev to allow Vite HMR and local scripts
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: '10kb' })); // Restrict payload size to prevent DOS payload attacks

// Rate Limiters for Sensitive Operations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

const bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit each IP to 30 booking requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking requests from this IP. Please try again shortly.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

app.use('/api/', apiLimiter);

// ============================================================
// 2. DATABASE & SANITIZATION UTILITIES
// ============================================================

const DB_CONNECTION = process.env.DATABASE_URL;

function getPgClient() {
  if (!DB_CONNECTION) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }
  return new Client({
    connectionString: DB_CONNECTION,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
  });
}

// Input Sanitization Helpers
function sanitizeString(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLen)
    .replace(/[<>]/g, ''); // Strip dangerous HTML tags to prevent XSS
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 100;
}

function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s+\-()]{7,20}$/;
  return phoneRegex.test(phone.trim());
}

// ============================================================
// 3. AUTHENTICATION ENDPOINTS (WITH BCRYPT HASHING)
// ============================================================

// User Registration Endpoint
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { name, email, phone, password } = req.body;

  const cleanName = sanitizeString(name, 60);
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = sanitizeString(phone, 20);

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  let client;
  try {
    client = getPgClient();
    await client.connect();

    // Check if user already exists
    const existingRes = await client.query('SELECT id FROM auth.users WHERE LOWER(email) = $1;', [cleanEmail]);
    if (existingRes.rows.length > 0) {
      await client.end();
      // Generic message to prevent email enumeration where desired, or clear user notification
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password with bcrypt (cost factor 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = crypto.randomUUID();
    const userName = cleanName || cleanEmail.split('@')[0];
    const userPhone = cleanPhone || '+91 98427 12345';

    // Insert user into auth.users in Supabase PostgreSQL securely with hashed password
    await client.query(
      `
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        $1,
        'authenticated',
        'authenticated',
        $2,
        $3,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('name', $4::text, 'phone', $5::text),
        NOW(),
        NOW()
      );
    `,
      [userId, cleanEmail, hashedPassword, userName, userPhone]
    );

    // Ensure profile row exists in public.profiles
    await client.query(
      `
      INSERT INTO public.profiles (id, name, email, phone)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    `,
      [userId, userName, cleanEmail, userPhone]
    );

    await client.end();

    const userObj = {
      id: userId,
      name: userName,
      email: cleanEmail,
      phone: userPhone,
      createdAt: new Date().toISOString(),
    };

    return res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('Registration error:', err);
    if (client) try { await client.end(); } catch (e) {}
    return res.status(500).json({ error: 'Registration failed due to a server error. Please try again later.' });
  }
});

// User Login Endpoint
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  const cleanEmail = (email || '').trim().toLowerCase();

  if (!isValidEmail(cleanEmail) || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Invalid email or password format.' });
  }

  let client;
  try {
    client = getPgClient();
    await client.connect();

    const userRes = await client.query(
      `
      SELECT u.id, u.email, u.encrypted_password, u.raw_user_meta_data, u.created_at, p.name, p.phone
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.id
      WHERE LOWER(u.email) = $1;
    `,
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      await client.end();
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const row = userRes.rows[0];

    // Verify password with bcrypt
    let isPasswordValid = false;
    if (row.encrypted_password) {
      if (row.encrypted_password.startsWith('$2a$') || row.encrypted_password.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(password, row.encrypted_password);
      } else {
        // Fallback for legacy plain text entries during transition
        isPasswordValid = password === row.encrypted_password;
      }
    }

    if (!isPasswordValid) {
      await client.end();
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userObj = {
      id: row.id,
      name: row.name || row.raw_user_meta_data?.name || cleanEmail.split('@')[0],
      email: row.email,
      phone: row.phone || row.raw_user_meta_data?.phone || '+91 98427 12345',
      createdAt: row.created_at,
    };

    await client.end();
    return res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('Login error:', err);
    if (client) try { await client.end(); } catch (e) {}
    return res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

// ============================================================
// 4. SERVER-SIDE PRICE CALCULATION & BOOKING VALIDATION
// ============================================================

// Base food price catalog for server-side verification
const SERVER_FOOD_PRICES = {
  'food-1': { price: 140, name: 'Schezwan Chicken Shawarma' },
  'food-2': { price: 120, name: 'Classic Arabian Chicken Shawarma' },
  'food-3': { price: 150, name: 'Cheese Burst Roll Shawarma' },
  'food-4': { price: 130, name: 'Mexican Spiced Shawarma' },
  'food-5': { price: 160, name: 'BBQ Smoked Chicken Shawarma' },
  'food-6': { price: 110, name: 'Falafel Veggie Shawarma Roll' },
  'food-7': { price: 240, name: 'Arabian Delights Special Plate' },
  'food-8': { price: 210, name: 'Classic Chicken Shawarma Plate' },
  'food-9': { price: 230, name: 'Hummus & Grilled Meat Plate' },
  'food-10': { price: 220, name: 'Loaded French Fries Shawarma Plate' },
  'food-11': { price: 180, name: 'Special Chicken Fried Rice' },
  'food-12': { price: 200, name: 'Schezwan Triple Fried Rice' },
  'food-13': { price: 160, name: 'Crispy Grilled Chicken Wings (6 pcs)' },
  'food-14': { price: 140, name: 'Authentic Garlic Toum & Pita Pack' },
};

const SERVER_ADDON_PRICES = {
  'Extra Garlic Toum Dip': 20,
  'Double Meat Portion': 40,
  'Melted Cheddar Cheese': 25,
  'Pickled Jalapeños & Olives': 15,
  'Extra Pita Bread (2 pcs)': 20,
  'Crispy French Fries (Small)': 30,
};

app.post('/api/bookings/calculate-price', (req, res) => {
  try {
    const { foodItemId, quantity, selectedAddOns } = req.body;

    const foodItem = SERVER_FOOD_PRICES[foodItemId];
    if (!foodItem) {
      return res.status(400).json({ error: 'Invalid food item selected.' });
    }

    const qty = Math.max(1, Math.min(20, Number(quantity) || 1));
    const basePrice = foodItem.price;
    let addOnsTotal = 0;

    if (Array.isArray(selectedAddOns)) {
      selectedAddOns.forEach((addonName) => {
        if (SERVER_ADDON_PRICES[addonName]) {
          addOnsTotal += SERVER_ADDON_PRICES[addonName];
        }
      });
    }

    const itemTotal = (basePrice + addOnsTotal) * qty;

    return res.json({
      success: true,
      foodItemId,
      foodName: foodItem.name,
      basePrice,
      addOnsTotal,
      quantity: qty,
      totalAmount: itemTotal,
    });
  } catch (err) {
    console.error('Price calculation error:', err);
    return res.status(500).json({ error: 'Server error calculating booking price.' });
  }
});

// ============================================================
// 5. RAZORPAY INTEGRATION ENDPOINTS
// ============================================================

const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TcGGzLVv9bjvnB').trim().replace(/^["']|["']$/g, '');
const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || 'c558sM3K9ecNM5WJfsgqUL8F').trim().replace(/^["']|["']$/g, '');

let razorpay = null;
if (razorpayKeyId && razorpayKeySecret) {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

// Diagnostic Endpoint: Check Razorpay Key Status
app.get('/api/razorpay/check-key', async (req, res) => {
  if (!razorpayKeyId || !razorpayKeySecret) {
    return res.json({
      configured: false,
      valid: false,
      message: 'Razorpay keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing in environment variables (.env).',
    });
  }

  if (!razorpay) {
    return res.json({
      configured: false,
      valid: false,
      message: 'Razorpay SDK failed to initialize.',
    });
  }

  try {
    // Attempt a lightweight test order creation to verify credentials
    const testOrder = await razorpay.orders.create({ amount: 100, currency: 'INR', receipt: 'key_check' });
    return res.json({
      configured: true,
      valid: true,
      key_id: razorpayKeyId,
      message: 'Razorpay test credentials are valid and active.',
      test_order_id: testOrder.id,
    });
  } catch (err) {
    const isAuthError = err && (err.statusCode === 401 || (err.error && err.error.code === 'BAD_REQUEST_ERROR'));
    return res.status(200).json({
      configured: true,
      valid: false,
      key_id: razorpayKeyId,
      error_code: isAuthError ? 'INVALID_RAZORPAY_KEY' : 'RAZORPAY_ERROR',
      message: isAuthError
        ? 'Razorpay API Key ID or Secret in .env is invalid/expired. Please update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env with valid credentials from dashboard.razorpay.com.'
        : (err.message || 'Error communicating with Razorpay servers.'),
    });
  }
});

// Create Razorpay Order Endpoint
app.post('/api/create-order', bookingLimiter, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        error: 'Payment gateway configuration is missing on server.',
        code: 'MISSING_RAZORPAY_CONFIG',
      });
    }

    const { amount, currency = 'INR', receipt } = req.body;

    const amountInPaise = Math.round(Number(amount));
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ error: 'Minimum order amount must be at least ₹1 (100 paise).' });
    }

    const options = {
      amount: amountInPaise,
      currency,
      receipt: sanitizeString(receipt || `rcpt_${Date.now()}`, 40),
    };

    const order = await razorpay.orders.create(options);
    return res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
    });
  } catch (err) {
    console.error('Razorpay Order Creation Error:', err);
    const isAuthError = err && (err.statusCode === 401 || (err.error && err.error.code === 'BAD_REQUEST_ERROR'));
    if (isAuthError) {
      return res.status(401).json({
        error: 'Razorpay API Key ID or Secret in .env is invalid or expired. Please update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env with active credentials from dashboard.razorpay.com.',
        code: 'INVALID_RAZORPAY_KEY',
        key_id: razorpayKeyId,
      });
    }
    return res.status(500).json({ error: 'Payment gateway processing error.' });
  }
});

// Verify Razorpay Payment Signature Endpoint
app.post('/api/verify-payment', bookingLimiter, async (req, res) => {
  try {
    if (!razorpayKeySecret) {
      return res.status(500).json({ error: 'Payment secret not configured on server.' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment verification fields.' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid payment signature verification failed.' });
    }
  } catch (err) {
    console.error('Razorpay Signature Verification Error:', err);
    return res.status(500).json({ error: 'Payment verification error.' });
  }
});

// Start Express Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Security Layer] API Server running on port ${PORT} with Helmet & Rate Limiting active.`);
});
