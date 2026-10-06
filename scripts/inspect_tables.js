const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, health_id, full_name, phone_number, age, gender FROM public.patients LIMIT 20;');
  console.log('PATIENTS IN DB:');
  console.table(res.rows);
  const docs = await client.query('SELECT id, name, department, designation FROM public.doctors;');
  console.log('DOCTORS IN DB:');
  console.table(docs.rows);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
