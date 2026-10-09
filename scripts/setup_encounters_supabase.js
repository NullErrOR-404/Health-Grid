const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function setupEncountersSchema() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    console.log('Creating public.encounters table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.encounters (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        doctor_id TEXT,
        appointment_id TEXT,
        status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
        stage TEXT NOT NULL DEFAULT 'overview',
        chief_complaint TEXT,
        hpi TEXT,
        physical_exam JSONB DEFAULT '{}'::jsonb,
        assessment TEXT,
        plan TEXT,
        patient_instructions TEXT,
        soap_note JSONB DEFAULT '{}'::jsonb,
        signed_by TEXT,
        sign_off_timestamp TIMESTAMPTZ,
        signature_hash TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Creating public.prescriptions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.prescriptions (
        id TEXT PRIMARY KEY,
        encounter_id TEXT,
        patient_id TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        duration TEXT,
        instructions TEXT,
        is_generic BOOLEAN DEFAULT true,
        jan_aushadhi_price NUMERIC(10,2) DEFAULT 0,
        branded_price NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Creating public.clinical_orders table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.clinical_orders (
        id TEXT PRIMARY KEY,
        encounter_id TEXT,
        patient_id TEXT NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        code TEXT,
        priority TEXT DEFAULT 'ROUTINE',
        status TEXT DEFAULT 'ORDERED',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Configuring Row Level Security (RLS) policies...');
    const tables = ['encounters', 'prescriptions', 'clinical_orders'];
    for (const table of tables) {
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);

      await client.query(`
        DROP POLICY IF EXISTS "Public select on ${table}" ON public.${table};
        CREATE POLICY "Public select on ${table}" ON public.${table} FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Public insert on ${table}" ON public.${table};
        CREATE POLICY "Public insert on ${table}" ON public.${table} FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "Public update on ${table}" ON public.${table};
        CREATE POLICY "Public update on ${table}" ON public.${table} FOR UPDATE USING (true) WITH CHECK (true);

        DROP POLICY IF EXISTS "Public delete on ${table}" ON public.${table};
        CREATE POLICY "Public delete on ${table}" ON public.${table} FOR DELETE USING (true);
      `);
      console.log(`✓ RLS policies configured for public.${table}`);
    }

    console.log('Schema migration completed successfully.');
  } catch (err) {
    console.error('Schema migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupEncountersSchema();
