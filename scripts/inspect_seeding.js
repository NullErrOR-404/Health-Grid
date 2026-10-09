const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function inspect() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  console.log('Tables in public schema:');
  console.table(tables.rows);

  const patientCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'patients';");
  console.log('Patients columns:');
  console.table(patientCols.rows);

  const doctorCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'doctors';");
  console.log('Doctors columns:');
  console.table(doctorCols.rows);

  await client.end();
}

inspect().catch(console.error);
