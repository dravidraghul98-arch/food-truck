import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

function getPgClient() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.xctjbhnwefgcwlnbqoxh:Raghul%402008%21@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';
  return new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { email, password } = body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  let client;
  try {
    client = getPgClient();
    await client.connect();

    // Check user in auth.users
    const userRes = await client.query(
      `
      SELECT u.id, u.email, u.encrypted_password, u.raw_user_meta_data, u.created_at, p.name, p.phone
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.id
      WHERE LOWER(u.email) = $1;
    `,
      [cleanEmail]
    );

    let row = userRes.rows[0];
    let profileRow = null;

    if (!row) {
      // Fallback check public.profiles for registered profile records
      const profileRes = await client.query(
        'SELECT id, name, email, phone, created_at FROM public.profiles WHERE LOWER(email) = LOWER($1) LIMIT 1;',
        [cleanEmail]
      );
      if (profileRes.rows.length === 0) {
        await client.end();
        return res.status(401).json({
          success: false,
          error: 'No account found with this email. Please register first.',
        });
      }
      profileRow = profileRes.rows[0];
    }

    if (password && row && row.encrypted_password) {
      let validPass = false;
      if (row.encrypted_password.startsWith('$2a$') || row.encrypted_password.startsWith('$2b$')) {
        validPass = await bcrypt.compare(password, row.encrypted_password);
      } else {
        validPass = password === row.encrypted_password;
      }
      if (!validPass) {
        await client.end();
        return res.status(401).json({
          success: false,
          error: 'Incorrect email or password. Please try again.',
        });
      }
    }

    const user = {
      id: row ? row.id : profileRow.id,
      name: (row && (row.name || row.raw_user_meta_data?.name)) || (profileRow && profileRow.name) || cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: (row && (row.phone || row.raw_user_meta_data?.phone)) || (profileRow && profileRow.phone) || '',
      createdAt: row ? row.created_at : profileRow.created_at,
    };

    await client.end();

    // Set Session Cookie
    const cookieVal = encodeURIComponent(JSON.stringify(user));
    res.setHeader('Set-Cookie', `arabian_delights_session_user=${cookieVal}; Path=/; Max-Age=604800; SameSite=Lax`);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    if (client) try { await client.end(); } catch {}
    console.error('API Auth Login Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Database error during authentication. Please check database connection.',
    });
  }
}

