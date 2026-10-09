const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function inspectUsers() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const userCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';");
  console.log('Users columns:');
  console.table(userCols.rows);

  const sampleUsers = await client.query("SELECT * FROM public.users LIMIT 5;");
  console.log('Sample Users:');
  console.table(sampleUsers.rows);

  await client.end();
}

inspectUsers().catch(console.error);
