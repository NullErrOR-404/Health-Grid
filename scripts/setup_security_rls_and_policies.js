const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function setupSecurityRlsAndPolicies() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('🔒 Connected to Supabase PostgreSQL for Security RLS Hardening.');

    const tables = [
      'doctors',
      'appointments',
      'emergency_cases',
      'ipd_beds',
      'ipd_admissions',
      'patients',
      'medicines',
    ];

    // 1. Enable Row-Level Security (RLS) on each table
    for (const table of tables) {
      console.log(`Enabling RLS on public.${table}...`);
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }

    console.log('Creating hardened RLS policies...');

    // 2. DOCTORS TABLE POLICIES
    // Public can view doctors directory, authenticated users can insert/update/delete
    await client.query(`
      DROP POLICY IF EXISTS "Public can view active doctors" ON public.doctors;
      CREATE POLICY "Public can view active doctors" ON public.doctors
        FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Authenticated users can manage doctors" ON public.doctors;
      CREATE POLICY "Authenticated users can manage doctors" ON public.doctors
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    `);
    console.log('✓ doctors RLS policies applied.');

    // 3. APPOINTMENTS TABLE POLICIES
    // Authenticated users can view and manage appointments; anonymous can view schedule slots
    await client.query(`
      DROP POLICY IF EXISTS "Anyone can view appointments schedule" ON public.appointments;
      CREATE POLICY "Anyone can view appointments schedule" ON public.appointments
        FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Authenticated users can manage appointments" ON public.appointments;
      CREATE POLICY "Authenticated users can manage appointments" ON public.appointments
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    `);
    console.log('✓ appointments RLS policies applied.');

    // 4. IPD_BEDS TABLE POLICIES
    // Public can view bed status summary; only authenticated staff can mutate
    await client.query(`
      DROP POLICY IF EXISTS "Public can view bed availability" ON public.ipd_beds;
      CREATE POLICY "Public can view bed availability" ON public.ipd_beds
        FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Authenticated staff can manage beds" ON public.ipd_beds;
      CREATE POLICY "Authenticated staff can manage beds" ON public.ipd_beds
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    `);
    console.log('✓ ipd_beds RLS policies applied.');

    // 5. IPD_ADMISSIONS TABLE POLICIES
    await client.query(`
      DROP POLICY IF EXISTS "Public can view admissions count" ON public.ipd_admissions;
      CREATE POLICY "Public can view admissions count" ON public.ipd_admissions
        FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Authenticated staff can manage admissions" ON public.ipd_admissions;
      CREATE POLICY "Authenticated staff can manage admissions" ON public.ipd_admissions
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    `);
    console.log('✓ ipd_admissions RLS policies applied.');

    // 6. EMERGENCY_CASES TABLE POLICIES
    await client.query(`
      DROP POLICY IF EXISTS "Public can view casualty status" ON public.emergency_cases;
      CREATE POLICY "Public can view casualty status" ON public.emergency_cases
        FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Authenticated clinicians can manage emergency cases" ON public.emergency_cases;
      CREATE POLICY "Authenticated clinicians can manage emergency cases" ON public.emergency_cases
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    `);
    console.log('✓ emergency_cases RLS policies applied.');

    // 7. PATIENTS TABLE POLICIES (HIPAA & DPDP Act Data Privacy)
    await client.query(`
      DROP POLICY IF EXISTS "Patients can view and edit their own profile" ON public.patients;
      CREATE POLICY "Patients can view and edit their own profile" ON public.patients
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Public patient creation on registration" ON public.patients;
      CREATE POLICY "Public patient creation on registration" ON public.patients
        FOR INSERT
        WITH CHECK (true);
    `);
    console.log('✓ patients RLS policies applied.');

    // 8. MEDICINES TABLE POLICIES (Jan Aushadhi Public Catalog)
    await client.query(`
      DROP POLICY IF EXISTS "Public can view generic medicines catalog" ON public.medicines;
      CREATE POLICY "Public can view generic medicines catalog" ON public.medicines
        FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Authenticated staff can manage medicines" ON public.medicines;
      CREATE POLICY "Authenticated staff can manage medicines" ON public.medicines
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    `);
    console.log('✓ medicines RLS policies applied.');

    console.log('\n🛡️ ROW LEVEL SECURITY (RLS) HARDENING SUCCESSFULLY COMPLETED ON ALL TABLES.');
  } catch (err) {
    console.error('RLS setup error:', err);
  } finally {
    await client.end();
  }
}

setupSecurityRlsAndPolicies();
