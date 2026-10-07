const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT doctor_code, name, department, specialization, opd_days, total_slots, booked_slots, status, reg_no FROM public.doctors WHERE doctor_code IS NOT NULL ORDER BY doctor_code ASC LIMIT 10;');
  console.log('TOP 10 DOCTORS IN DB:');
  console.table(res.rows);
  const statusCounts = await client.query('SELECT status, count(*) FROM public.doctors WHERE doctor_code IS NOT NULL GROUP BY status;');
  console.log('STATUS DISTRIBUTION:');
  console.table(statusCounts.rows);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
