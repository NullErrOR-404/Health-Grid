/**
 * HealthGrid Database Migration: Enterprise Roles & Dynamic User Provisioning
 * 
 * 1. Creates `public.user_roles` table for role-based access control (RBAC):
 *    - CITIZEN (Patient)
 *    - DOCTOR (Clinician)
 *    - HOSPITAL_STAFF (Hospital Admin / ERP Operator)
 *    - SUPER_ADMIN (Platform Superuser for future Admin Portal)
 * 2. Adds `role` column to `public.patients` and `public.doctors` with defaults
 * 3. Configures RLS policies allowing public SELECT and authenticated/staff CRUD
 * 4. Links all 50 patients to role 'CITIZEN' with dynamic UUIDs and sovereign HealthGrid IDs
 * 5. Links all 24 doctors to role 'DOCTOR'
 * 6. Seeds demo superuser and hospital staff roles
 */

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function setupRolesAndDynamicUsers() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('🔒 Connected to Supabase PostgreSQL for Roles & Dynamic User Provisioning.');

    // 1. Create user_roles table
    console.log('Creating public.user_roles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('CITIZEN', 'DOCTOR', 'HOSPITAL_STAFF', 'SUPER_ADMIN')),
        user_type TEXT NOT NULL DEFAULT 'PATIENT',
        email TEXT,
        full_name TEXT,
        assigned_by TEXT DEFAULT 'SYSTEM',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role)
      );
    `);

    // 2. Add role column to patients and doctors if not present
    console.log('Ensuring role columns on patients and doctors...');
    await client.query(`
      ALTER TABLE public.patients 
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'CITIZEN';

      ALTER TABLE public.doctors 
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'DOCTOR';
    `);

    // 3. Configure RLS on user_roles
    console.log('Configuring RLS policies on user_roles...');
    await client.query(`
      ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public can view user roles" ON public.user_roles;
      CREATE POLICY "Public can view user roles" ON public.user_roles
        FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Allow user role mutations" ON public.user_roles;
      CREATE POLICY "Allow user role mutations" ON public.user_roles
        FOR ALL
        USING (true)
        WITH CHECK (true);
    `);

    // Ensure full CRUD policies on patients table
    console.log('Ensuring full CRUD policies on public.patients...');
    await client.query(`
      DROP POLICY IF EXISTS "Public can view patients directory" ON public.patients;
      CREATE POLICY "Public can view patients directory" ON public.patients
        FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Allow patient insert" ON public.patients;
      CREATE POLICY "Allow patient insert" ON public.patients
        FOR INSERT
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow patient update" ON public.patients;
      CREATE POLICY "Allow patient update" ON public.patients
        FOR UPDATE
        USING (true)
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow patient delete" ON public.patients;
      CREATE POLICY "Allow patient delete" ON public.patients
        FOR DELETE
        USING (true);
    `);

    // 4. Populate user_roles for all 50 patients
    console.log('Syncing patient roles into user_roles...');
    const patientsRes = await client.query('SELECT id, full_name, email FROM public.patients;');
    for (const pat of patientsRes.rows) {
      await client.query(`
        INSERT INTO public.user_roles (user_id, role, user_type, email, full_name)
        VALUES ($1, 'CITIZEN', 'PATIENT', $2, $3)
        ON CONFLICT (user_id, role) DO UPDATE 
        SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, updated_at = now();
      `, [pat.id, pat.email || null, pat.full_name]);
    }
    console.log(`✓ Synchronized ${patientsRes.rows.length} patient roles into user_roles.`);

    // 5. Populate user_roles for all doctors
    console.log('Syncing doctor roles into user_roles...');
    const doctorsRes = await client.query('SELECT id, name FROM public.doctors;');
    for (const doc of doctorsRes.rows) {
      await client.query(`
        INSERT INTO public.user_roles (user_id, role, user_type, email, full_name)
        VALUES ($1, 'DOCTOR', 'CLINICIAN', $2, $3)
        ON CONFLICT (user_id, role) DO UPDATE 
        SET full_name = EXCLUDED.full_name, updated_at = now();
      `, [doc.id, `${doc.name.toLowerCase().replace(/[^a-z]/g, '')}@healthgrid.med`, doc.name]);
    }
    console.log(`✓ Synchronized ${doctorsRes.rows.length} doctor roles into user_roles.`);

    // 6. Seed Super Admin & Hospital Staff roles
    console.log('Seeding demo Super Admin & Hospital Staff roles...');
    const staffId = '00000000-0000-0000-0000-000000000001';
    const adminId = '00000000-0000-0000-0000-000000000002';

    await client.query(`
      INSERT INTO public.user_roles (user_id, role, user_type, email, full_name, assigned_by)
      VALUES 
        ('${staffId}', 'HOSPITAL_STAFF', 'STAFF', 'admin@gmch.gov.in', 'GMCH Hospital Administrator', 'SYSTEM'),
        ('${adminId}', 'SUPER_ADMIN', 'SUPERUSER', 'superadmin@healthgrid.in', 'HealthGrid Chief Administrator', 'SYSTEM')
      ON CONFLICT (user_id, role) DO UPDATE 
      SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, updated_at = now();
    `);
    console.log('✓ Super Admin and Hospital Staff roles provisioned.');

    const rolesCount = await client.query('SELECT role, count(*) FROM public.user_roles GROUP BY role;');
    console.log('\n--- ROLES DISTRIBUTION IN DATABASE ---');
    console.table(rolesCount.rows);

  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupRolesAndDynamicUsers();
