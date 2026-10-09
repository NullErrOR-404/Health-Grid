const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function fixPatientsRls() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL.');

    console.log('Adding SELECT policy on public.patients...');
    await client.query(`
      DROP POLICY IF EXISTS "Public can view patients directory" ON public.patients;
      CREATE POLICY "Public can view patients directory" ON public.patients
        FOR SELECT
        USING (true);
    `);
    console.log('✓ Public can view patients directory policy applied successfully.');

    const res = await client.query('SELECT count(*) FROM public.patients;');
    console.log('Total patients in database:', res.rows[0].count);
  } catch (err) {
    console.error('RLS policy update error:', err);
  } finally {
    await client.end();
  }
}

fixPatientsRls();
