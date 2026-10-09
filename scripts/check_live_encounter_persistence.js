const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function verifyPersistence() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL.');

    const encRes = await client.query('SELECT id, patient_id, status, signed_by, signature_hash, sign_off_timestamp FROM public.encounters LIMIT 5');
    console.log('\n--- PUBLIC.ENCOUNTERS ---');
    console.table(encRes.rows);

    const ordRes = await client.query('SELECT id, encounter_id, name, category, priority, status FROM public.clinical_orders LIMIT 10');
    console.log('\n--- PUBLIC.CLINICAL_ORDERS ---');
    console.table(ordRes.rows);

    const rxRes = await client.query('SELECT id, encounter_id, medicine_name, dosage, frequency, jan_aushadhi_price, branded_price FROM public.prescriptions LIMIT 10');
    console.log('\n--- PUBLIC.PRESCRIPTIONS ---');
    console.table(rxRes.rows);

  } catch (err) {
    console.error('Error during verification:', err.message);
  } finally {
    await client.end();
  }
}

verifyPersistence();
