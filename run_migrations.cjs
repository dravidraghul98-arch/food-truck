const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Raghul%402008%21@db.xctjbhnwefgcwlnbqoxh.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database for migration...');

    // 1. Create Profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
      CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT TO authenticated, anon USING (true);
      DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
      CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated, anon WITH CHECK (true);
      DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
      CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
      ALTER TABLE public.profiles REPLICA IDENTITY FULL;
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
          ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
          END IF;
        END IF;
      END $$;
    `);
    console.log('Profiles table created, secured & enabled for Realtime.');

    // 2. Trigger for new auth users
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, name, email, phone)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'phone', '')
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `);
    console.log('Auth user creation trigger configured.');

    // 3. Create Food Items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.food_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC NOT NULL,
        description TEXT,
        image TEXT,
        available BOOLEAN DEFAULT TRUE,
        type TEXT NOT NULL DEFAULT 'non-veg',
        badge TEXT,
        spicy_level INT DEFAULT 0,
        prep_time_minutes INT DEFAULT 10,
        rating NUMERIC DEFAULT 4.5,
        ingredients TEXT[],
        calories TEXT,
        add_ons JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Food items viewable by everyone" ON public.food_items;
      CREATE POLICY "Food items viewable by everyone" ON public.food_items FOR SELECT TO authenticated, anon USING (true);
      DROP POLICY IF EXISTS "Food items manageable by all" ON public.food_items;
      CREATE POLICY "Food items manageable by all" ON public.food_items FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
    `);
    console.log('Food items table created.');

    // 4. Create Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        food_item_id TEXT,
        food_item_snapshot JSONB NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        selected_add_ons JSONB DEFAULT '[]'::jsonb,
        item_base_price NUMERIC NOT NULL,
        add_ons_total NUMERIC NOT NULL,
        total_amount NUMERIC NOT NULL,
        pickup_date TEXT NOT NULL,
        pickup_time TEXT NOT NULL,
        special_instructions TEXT,
        status TEXT NOT NULL DEFAULT 'Confirmed',
        payment_method TEXT NOT NULL DEFAULT 'UPI',
        payment_status TEXT NOT NULL DEFAULT 'PAID',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Bookings viewable by everyone" ON public.bookings;
      CREATE POLICY "Bookings viewable by everyone" ON public.bookings FOR SELECT TO authenticated, anon USING (true);
      DROP POLICY IF EXISTS "Bookings insertable by everyone" ON public.bookings;
      CREATE POLICY "Bookings insertable by everyone" ON public.bookings FOR INSERT TO authenticated, anon WITH CHECK (true);
      DROP POLICY IF EXISTS "Bookings updatable by everyone" ON public.bookings;
      CREATE POLICY "Bookings updatable by everyone" ON public.bookings FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
    `);
    console.log('Bookings table created.');

    // 5. Enable Realtime & Replica Identity Full on Bookings
    await client.query(`
      ALTER TABLE public.bookings REPLICA IDENTITY FULL;
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
          ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
          END IF;
        END IF;
      END $$;
    `);
    console.log('Realtime publication and REPLICA IDENTITY FULL enabled on bookings table.');

    // 6. Create Customer Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.customer_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Messages viewable by everyone" ON public.customer_messages;
      CREATE POLICY "Messages viewable by everyone" ON public.customer_messages FOR SELECT TO authenticated, anon USING (true);
      DROP POLICY IF EXISTS "Messages insertable by everyone" ON public.customer_messages;
      CREATE POLICY "Messages insertable by everyone" ON public.customer_messages FOR INSERT TO authenticated, anon WITH CHECK (true);
      DROP POLICY IF EXISTS "Messages updatable by everyone" ON public.customer_messages;
      CREATE POLICY "Messages updatable by everyone" ON public.customer_messages FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
      ALTER TABLE public.customer_messages REPLICA IDENTITY FULL;
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'customer_messages'
          ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_messages;
          END IF;
        END IF;
      END $$;
    `);
    console.log('Customer messages table created and enabled for Realtime.');

    // 7. Grant permissions to anon and authenticated roles
    await client.query(`
      GRANT USAGE ON SCHEMA public TO anon, authenticated;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
    `);
    console.log('Schema access granted to anon and authenticated roles.');

    // 7. Check if API keys are stored in vault or config
    const keyRes = await client.query(`
      SELECT name, decrypted_secret FROM vault.decrypted_secrets WHERE name LIKE '%anon%' OR name LIKE '%key%' LIMIT 10;
    `).catch(() => null);

    if (keyRes && keyRes.rows.length > 0) {
      console.log('Vault secrets:', keyRes.rows);
    }

    await client.end();
    console.log('MIGRATION_COMPLETED_SUCCESSFULLY');
  } catch (err) {
    console.error('MIGRATION_FAILED:', err);
    process.exit(1);
  }
}

run();
