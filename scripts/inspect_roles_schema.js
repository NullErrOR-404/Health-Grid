const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  console.log('Public tables:', tables.rows.map(r => r.table_name));

  const roleTables = tables.rows.filter(r => r.table_name.includes('role') || r.table_name.includes('user'));
  console.log('Role/user tables:', roleTables);

  for (const t of roleTables) {
    try {
      const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t.table_name}';`);
      console.log(`Columns for ${t.table_name}:`, cols.rows);
      const rows = await client.query(`SELECT * FROM public.${t.table_name} LIMIT 5;`);
      console.log(`Sample rows for ${t.table_name}:`, rows.rows);
    } catch (e) {
      console.log(`Error checking ${t.table_name}:`, e.message);
    }
  }

  await client.end();
}

main().catch(console.error);
