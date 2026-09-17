import pg from 'pg';

const { Client } = pg;

function getPgClient() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://postgres.xctjbhnwefgcwlnbqoxh:Raghul%402008%21@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';
  return new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  let client;
  try {
    client = getPgClient();
    await client.connect();

    // Query public.profiles
    const profilesRes = await client.query(
      'SELECT id, name, email, phone, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 20;'
    );

    // Query auth.users
    let authUsers = [];
    try {
      const authRes = await client.query(
        "SELECT id, email, raw_user_meta_data->>'name' as meta_name, raw_user_meta_data->>'phone' as meta_phone, created_at FROM auth.users ORDER BY created_at DESC LIMIT 20;"
      );
      authUsers = authRes.rows;
    } catch (e) {
      console.warn('Could not query auth.users:', e.message);
    }

    await client.end();

    return res.status(200).json({
      success: true,
      total_profiles: profilesRes.rows.length,
      profiles: profilesRes.rows,
      auth_users: authUsers,
    });
  } catch (err) {
    if (client) try { await client.end(); } catch {}
    console.error('Check DB Error:', err);
    return res.status(500).json({
      error: 'Failed querying database',
      details: err.message,
    });
  }
}
