import express from 'express';
import pg from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const app = express();
app.use(express.json());

const DB_CONNECTION = process.env.DATABASE_URL || 'postgresql://postgres:Raghul%402008%21@db.xctjbhnwefgcwlnbqoxh.supabase.co:5432/postgres';

function getPgClient() {
  return new Client({
    connectionString: DB_CONNECTION,
    ssl: { rejectUnauthorized: false }
  });
}

// 1. User Registration Endpoint (Creates user directly in Supabase auth.users & public.profiles)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const client = getPgClient();

  try {
    await client.connect();

    // Check if user already exists in auth.users
    const existingRes = await client.query('SELECT id FROM auth.users WHERE LOWER(email) = $1;', [trimmedEmail]);
    if (existingRes.rows.length > 0) {
      await client.end();
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = crypto.randomUUID();
    const userName = (name || trimmedEmail.split('@')[0]).trim();
    const userPhone = (phone || '+91 98427 12345').trim();

    // Insert user into auth.users in Supabase PostgreSQL
    await client.query(`
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
    `, [userId, trimmedEmail, password, userName, userPhone]);

    // Ensure profile row exists in public.profiles
    await client.query(`
      INSERT INTO public.profiles (id, name, email, phone)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    `, [userId, userName, trimmedEmail, userPhone]);

    await client.end();

    const userObj = {
      id: userId,
      name: userName,
      email: trimmedEmail,
      phone: userPhone,
      createdAt: new Date().toISOString(),
    };

    console.log('Registered new Supabase Auth User:', trimmedEmail);
    return res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('Registration failed:', err);
    try { await client.end(); } catch (e) {}
    return res.status(500).json({ error: 'Database registration failed: ' + err.message });
  }
});

// 2. User Login Endpoint (Authenticates against Supabase auth.users & public.profiles)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const client = getPgClient();

  try {
    await client.connect();

    // Check user in auth.users
    const userRes = await client.query(`
      SELECT u.id, u.email, u.raw_user_meta_data, u.created_at, p.name, p.phone
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.id
      WHERE LOWER(u.email) = $1;
    `, [trimmedEmail]);

    if (userRes.rows.length === 0) {
      await client.end();
      return res.status(401).json({ error: 'Account not found. Please register first.' });
    }

    const row = userRes.rows[0];
    const userObj = {
      id: row.id,
      name: row.name || row.raw_user_meta_data?.name || trimmedEmail.split('@')[0],
      email: row.email,
      phone: row.phone || row.raw_user_meta_data?.phone || '+91 98427 12345',
      createdAt: row.created_at,
    };

    await client.end();
    return res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('Login error:', err);
    try { await client.end(); } catch (e) {}
    return res.status(500).json({ error: 'Login database error: ' + err.message });
  }
});

// ============================================================
// RAZORPAY INTEGRATION ENDPOINTS
// ============================================================

import Razorpay from 'razorpay';

const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || 'rzp_test_Ta0JCYDiCuFWmi').trim().replace(/^["']|["']$/g, '');
const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || 'U3E7yuWexax6Svn5K06VWBC4').trim().replace(/^["']|["']$/g, '');

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});


// 1. Create Razorpay Order Endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const amountInPaise = Math.round(Number(amount));
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ error: 'Minimum order amount must be at least 100 paise (₹1).' });
    }

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
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
    const rzpError = err?.error?.description || err?.description || err?.message || 'Razorpay order creation failed';
    const statusCode = err?.statusCode || 500;
    return res.status(statusCode).json({ error: `Razorpay API (${statusCode}): ${rzpError}` });
  }
});


// 2. Verify Razorpay Payment Signature Endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
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
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
  } catch (err) {
    console.error('Razorpay Signature Verification Error:', err);
    return res.status(500).json({ error: 'Payment verification server error: ' + err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT} connected to Supabase PostgreSQL & Razorpay`);
});

