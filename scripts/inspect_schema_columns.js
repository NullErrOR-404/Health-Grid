const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const tables = ['patients', 'appointments', 'encounters', 'prescriptions', 'clinical_orders', 'user_roles', 'doctors', 'emergency_cases', 'ipd_beds', 'ipd_admissions', 'medicines'];
  
  for (const table of tables) {
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [table]);
    console.log(`\n=== Table: public.${table} (${res.rows.length} columns) ===`);
    console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  }
  
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
