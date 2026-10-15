const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL.');

  // 1. Create public.roles table
  console.log('Creating or updating public.roles table...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'superadmin',
      hospital_code TEXT DEFAULT 'HG-H002',
      status TEXT DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // Enable RLS and add public access policies
  await client.query(`
    ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_select_policy'
      ) THEN
        CREATE POLICY roles_select_policy ON public.roles FOR SELECT USING (true);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_insert_policy'
      ) THEN
        CREATE POLICY roles_insert_policy ON public.roles FOR INSERT WITH CHECK (true);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_update_policy'
      ) THEN
        CREATE POLICY roles_update_policy ON public.roles FOR UPDATE USING (true) WITH CHECK (true);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_delete_policy'
      ) THEN
        CREATE POLICY roles_delete_policy ON public.roles FOR DELETE USING (true);
      END IF;
    END
    $$;
  `);

  // 2. Ensure user_roles table allows 'superadmin' / 'SUPER_ADMIN' role
  console.log('Checking user_roles constraints...');
  try {
    await client.query(`
      ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
    `);
  } catch (err) {
    console.log('Note on user_roles_role_check:', err.message);
  }

  // 3. Upsert gmch_admin into public.roles
  console.log('Upserting gmch_admin into public.roles...');
  await client.query(`
    INSERT INTO public.roles (
      id,
      username,
      password,
      full_name,
      email,
      role,
      hospital_code,
      status
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      'gmch_admin',
      'GMCH#Hospital2026',
      'GMCH Medical Superintendent (Super Admin)',
      'admin@gmch.gov.in',
      'superadmin',
      'HG-H002',
      'ACTIVE'
    )
    ON CONFLICT (username) DO UPDATE SET
      password = EXCLUDED.password,
      role = 'superadmin',
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      hospital_code = EXCLUDED.hospital_code,
      status = 'ACTIVE',
      updated_at = now();
  `);

  // Also seed initial test hospital accounts so roles management has clear live records
  const initialAccounts = [
    {
      id: '00000000-0000-0000-0000-000000000002',
      username: 'mmc_admin',
      password: 'MMC#Hospital2026',
      full_name: 'MMC Medical Superintendent',
      email: 'admin@mmc.gov.in',
      role: 'admin',
      hospital_code: 'HG-H001',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      username: 'stanley_admin',
      password: 'Stanley#Hospital2026',
      full_name: 'Stanley Medical Superintendent',
      email: 'admin@stanley.gov.in',
      role: 'admin',
      hospital_code: 'HG-H003',
    },
    {
      id: 'cb41d3d7-cdae-4f55-b32d-ec4d78085400',
      username: 'dr_mohamed',
      password: 'Doctor#123',
      full_name: 'Dr. Mohamed (Senior Physician)',
      email: 'dr.mohamed@healthgrid.in',
      role: 'doctor',
      hospital_code: 'HG-H002',
    }
  ];

  for (const acc of initialAccounts) {
    await client.query(`
      INSERT INTO public.roles (
        id, username, password, full_name, email, role, hospital_code, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        hospital_code = EXCLUDED.hospital_code,
        status = 'ACTIVE',
        updated_at = now();
    `, [acc.id, acc.username, acc.password, acc.full_name, acc.email, acc.role, acc.hospital_code]);
  }

  // 4. Also upsert into public.user_roles for backward compatibility
  await client.query(`
    INSERT INTO public.user_roles (
      id,
      user_id,
      role,
      user_type,
      email,
      full_name,
      assigned_by
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000001',
      'SUPER_ADMIN',
      'ADMIN',
      'admin@gmch.gov.in',
      'GMCH Medical Superintendent (Super Admin)',
      'SYSTEM'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'SUPER_ADMIN',
      user_type = 'ADMIN',
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      updated_at = now();
  `);

  // 5. Verify records in public.roles
  const res = await client.query('SELECT id, username, role, full_name, hospital_code FROM public.roles ORDER BY created_at;');
  console.log('Records in public.roles:');
  console.table(res.rows);

  await client.end();
  console.log('Migration completed successfully!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
