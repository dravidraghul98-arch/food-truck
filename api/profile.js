import pg from 'pg';

const { Client } = pg;

function getPgClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  return new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // GET: Fetch profile by id or email
  if (req.method === 'GET') {
    const { id, email } = req.query || {};
    if (!id && !email) {
      return res.status(400).json({ error: 'Missing id or email parameter' });
    }

    let client;
    try {
      client = getPgClient();
      await client.connect();

      let query = 'SELECT id, name, email, phone, created_at FROM public.profiles WHERE ';
      const values = [];

      if (id) {
        query += 'id = $1;';
        values.push(id);
      } else {
        query += 'LOWER(email) = LOWER($1);';
        values.push(email);
      }

      const dbRes = await client.query(query, values);
      await client.end();

      if (dbRes.rows.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const row = dbRes.rows[0];
      return res.status(200).json({
        success: true,
        profile: {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone || '',
          createdAt: row.created_at,
        },
      });
    } catch (err) {
      if (client) try { await client.end(); } catch {}
      console.error('API Profile GET Error:', err);
      return res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
  }

  // POST: Upsert profile (Insert / Update)
  if (req.method === 'POST') {
    const { id, name, email, phone } = body || {};

    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required profile fields (name, email)' });
    }

    const profileId = id || `usr-${Date.now()}`;
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanPhone = String(phone || '').trim();

    let client;
    try {
      client = getPgClient();
      await client.connect();

      // Upsert into public.profiles
      await client.query(
        `
        INSERT INTO public.profiles (id, name, email, phone)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone;
      `,
        [profileId, cleanName, cleanEmail, cleanPhone]
      );

      await client.end();

      const profileData = {
        id: profileId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      };

      const cookieVal = encodeURIComponent(JSON.stringify(profileData));
      res.setHeader('Set-Cookie', `arabian_delights_session_user=${cookieVal}; Path=/; Max-Age=604800; SameSite=Lax`);

      return res.status(200).json({
        success: true,
        profile: profileData,
      });
    } catch (err) {
      if (client) try { await client.end(); } catch {}
      console.error('API Profile POST Error:', err);
      return res.status(500).json({ error: 'Failed upserting profile', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
