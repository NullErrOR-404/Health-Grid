const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function patchPrescriptions() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL.');

    await client.query(`
      ALTER TABLE public.prescriptions 
      ADD COLUMN IF NOT EXISTS encounter_id TEXT,
      ADD COLUMN IF NOT EXISTS patient_id TEXT,
      ADD COLUMN IF NOT EXISTS medicine_name TEXT,
      ADD COLUMN IF NOT EXISTS dosage TEXT,
      ADD COLUMN IF NOT EXISTS frequency TEXT,
      ADD COLUMN IF NOT EXISTS duration TEXT,
      ADD COLUMN IF NOT EXISTS instructions TEXT,
      ADD COLUMN IF NOT EXISTS is_generic BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS jan_aushadhi_price NUMERIC(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS branded_price NUMERIC(10,2) DEFAULT 0;
    `);

    // Ensure id has a default gen_random_uuid() or allows uuid string
    await client.query(`
      ALTER TABLE public.prescriptions 
      ALTER COLUMN id SET DEFAULT gen_random_uuid();
    `);

    // In case id is UUID, allow text or alter type to TEXT if needed
    await client.query(`
      ALTER TABLE public.prescriptions 
      ALTER COLUMN id TYPE TEXT;
    `);

    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions'
    `);
    console.log('\nUpdated public.prescriptions columns:');
    console.table(cols.rows);

  } catch (err) {
    console.error('Error patching prescriptions:', err.message);
  } finally {
    await client.end();
  }
}

patchPrescriptions();
