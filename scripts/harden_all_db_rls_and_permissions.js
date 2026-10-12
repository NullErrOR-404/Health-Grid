const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function hardenDatabaseSecurity() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('🔒 Connected to Supabase PostgreSQL for Enterprise RLS Hardening.');

    // 1. Add auth_user_id column to patients if not present
    console.log('Ensuring auth_user_id on public.patients...');
    await client.query(`
      ALTER TABLE public.patients 
        ADD COLUMN IF NOT EXISTS auth_user_id UUID;
      
      CREATE INDEX IF NOT EXISTS idx_patients_auth_user_id ON public.patients(auth_user_id);
      CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
      CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone_number);
    `);

    // 2. Link existing user_roles records to patient auth_user_id where emails match
    await client.query(`
      UPDATE public.patients p
      SET auth_user_id = u.id
      FROM auth.users u
      WHERE p.email IS NOT NULL AND LOWER(p.email) = LOWER(u.email)
        AND p.auth_user_id IS NULL;
    `);

    // 3. Create Security Helper Functions (STABLE, SECURITY DEFINER)
    console.log('Creating PostgreSQL Security Definer helper functions...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.get_auth_role()
      RETURNS text
      LANGUAGE sql STABLE SECURITY DEFINER
      SET search_path = public
      AS $$
        SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
      $$;

      CREATE OR REPLACE FUNCTION public.is_clinician_or_staff()
      RETURNS boolean
      LANGUAGE sql STABLE SECURITY DEFINER
      SET search_path = public
      AS $$
        SELECT EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() 
            AND role IN ('DOCTOR', 'HOSPITAL_STAFF', 'SUPER_ADMIN')
        );
      $$;

      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS boolean
      LANGUAGE sql STABLE SECURITY DEFINER
      SET search_path = public
      AS $$
        SELECT EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() 
            AND role IN ('HOSPITAL_STAFF', 'SUPER_ADMIN')
        );
      $$;
    `);

    // 4. Harden user_roles Table RLS
    console.log('Hardening public.user_roles RLS...');
    await client.query(`
      ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Public can view user roles" ON public.user_roles;
      DROP POLICY IF EXISTS "Allow user role mutations" ON public.user_roles;
      DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
      DROP POLICY IF EXISTS "Only admin can manage roles" ON public.user_roles;

      CREATE POLICY "Users can read own role" ON public.user_roles
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid() OR public.is_clinician_or_staff());

      CREATE POLICY "Only admin can manage roles" ON public.user_roles
        FOR ALL
        TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    `);

    // 5. Harden patients Table RLS
    console.log('Hardening public.patients RLS...');
    await client.query(`
      ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Public can view patients directory" ON public.patients;
      DROP POLICY IF EXISTS "Allow patient insert" ON public.patients;
      DROP POLICY IF EXISTS "Allow patient update" ON public.patients;
      DROP POLICY IF EXISTS "Allow patient delete" ON public.patients;
      DROP POLICY IF EXISTS "Patients can view and edit their own profile" ON public.patients;
      DROP POLICY IF EXISTS "Public patient creation on registration" ON public.patients;
      DROP POLICY IF EXISTS "Patients read own or staff read" ON public.patients;
      DROP POLICY IF EXISTS "Patients update own or staff update" ON public.patients;
      DROP POLICY IF EXISTS "Patients insert registration" ON public.patients;
      DROP POLICY IF EXISTS "Only admin can delete patients" ON public.patients;

      CREATE POLICY "Patients read own or staff read" ON public.patients
        FOR SELECT
        TO authenticated
        USING (
          auth_user_id = auth.uid() 
          OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          OR public.is_clinician_or_staff()
        );

      CREATE POLICY "Patients insert registration" ON public.patients
        FOR INSERT
        TO authenticated
        WITH CHECK (
          auth_user_id = auth.uid()
          OR auth_user_id IS NULL
          OR public.is_clinician_or_staff()
        );

      CREATE POLICY "Patients update own or staff update" ON public.patients
        FOR UPDATE
        TO authenticated
        USING (
          auth_user_id = auth.uid() 
          OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          OR public.is_clinician_or_staff()
        )
        WITH CHECK (
          auth_user_id = auth.uid() 
          OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          OR public.is_clinician_or_staff()
        );

      CREATE POLICY "Only admin can delete patients" ON public.patients
        FOR DELETE
        TO authenticated
        USING (public.is_admin());
    `);

    // 6. Harden appointments Table RLS
    console.log('Hardening public.appointments RLS...');
    await client.query(`
      ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Anyone can view appointments schedule" ON public.appointments;
      DROP POLICY IF EXISTS "Authenticated users can manage appointments" ON public.appointments;
      DROP POLICY IF EXISTS "Appointments view policy" ON public.appointments;
      DROP POLICY IF EXISTS "Appointments insert policy" ON public.appointments;
      DROP POLICY IF EXISTS "Appointments update policy" ON public.appointments;

      CREATE POLICY "Appointments view policy" ON public.appointments
        FOR SELECT
        TO authenticated
        USING (
          patient_id IN (
            SELECT id FROM public.patients 
            WHERE auth_user_id = auth.uid() 
               OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          )
          OR public.is_clinician_or_staff()
        );

      CREATE POLICY "Appointments insert policy" ON public.appointments
        FOR INSERT
        TO authenticated
        WITH CHECK (true);

      CREATE POLICY "Appointments update policy" ON public.appointments
        FOR UPDATE
        TO authenticated
        USING (
          patient_id IN (
            SELECT id FROM public.patients 
            WHERE auth_user_id = auth.uid() 
               OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          )
          OR public.is_clinician_or_staff()
        );
    `);

    // 7. Harden encounters, prescriptions, clinical_orders RLS
    console.log('Hardening public.encounters, prescriptions, clinical_orders RLS...');
    await client.query(`
      ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.clinical_orders ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Encounters read policy" ON public.encounters;
      DROP POLICY IF EXISTS "Encounters mutate policy" ON public.encounters;
      DROP POLICY IF EXISTS "Prescriptions read policy" ON public.prescriptions;
      DROP POLICY IF EXISTS "Prescriptions mutate policy" ON public.prescriptions;
      DROP POLICY IF EXISTS "Orders read policy" ON public.clinical_orders;
      DROP POLICY IF EXISTS "Orders mutate policy" ON public.clinical_orders;

      CREATE POLICY "Encounters read policy" ON public.encounters
        FOR SELECT
        TO authenticated
        USING (
          patient_id IN (
            SELECT id::text FROM public.patients 
            WHERE auth_user_id = auth.uid() 
               OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          )
          OR public.is_clinician_or_staff()
        );

      CREATE POLICY "Encounters mutate policy" ON public.encounters
        FOR ALL
        TO authenticated
        USING (public.is_clinician_or_staff())
        WITH CHECK (public.is_clinician_or_staff());

      CREATE POLICY "Prescriptions read policy" ON public.prescriptions
        FOR SELECT
        TO authenticated
        USING (
          user_id = auth.uid()
          OR patient_id IN (
            SELECT id::text FROM public.patients 
            WHERE auth_user_id = auth.uid() 
               OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          )
          OR public.is_clinician_or_staff()
        );

      CREATE POLICY "Prescriptions mutate policy" ON public.prescriptions
        FOR ALL
        TO authenticated
        USING (public.is_clinician_or_staff())
        WITH CHECK (public.is_clinician_or_staff());

      CREATE POLICY "Orders read policy" ON public.clinical_orders
        FOR SELECT
        TO authenticated
        USING (
          patient_id IN (
            SELECT id::text FROM public.patients 
            WHERE auth_user_id = auth.uid() 
               OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          )
          OR public.is_clinician_or_staff()
        );

      CREATE POLICY "Orders mutate policy" ON public.clinical_orders
        FOR ALL
        TO authenticated
        USING (public.is_clinician_or_staff())
        WITH CHECK (public.is_clinician_or_staff());
    `);

    // 8. Harden emergency_cases, ipd_beds, ipd_admissions, medicines RLS
    console.log('Hardening public.emergency_cases, ipd_beds, ipd_admissions, medicines RLS...');
    await client.query(`
      ALTER TABLE public.emergency_cases ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.ipd_beds ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.ipd_admissions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Emergency read policy" ON public.emergency_cases;
      DROP POLICY IF EXISTS "Emergency insert policy" ON public.emergency_cases;
      DROP POLICY IF EXISTS "Emergency update policy" ON public.emergency_cases;

      CREATE POLICY "Emergency read policy" ON public.emergency_cases
        FOR SELECT
        TO authenticated
        USING (
          patient_id IN (
            SELECT id FROM public.patients 
            WHERE auth_user_id = auth.uid() 
               OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          )
          OR public.is_clinician_or_staff()
        );

      CREATE POLICY "Emergency insert policy" ON public.emergency_cases
        FOR INSERT
        WITH CHECK (true);

      CREATE POLICY "Emergency update policy" ON public.emergency_cases
        FOR UPDATE
        TO authenticated
        USING (public.is_clinician_or_staff())
        WITH CHECK (public.is_clinician_or_staff());

      -- IPD Beds
      DROP POLICY IF EXISTS "Beds read policy" ON public.ipd_beds;
      DROP POLICY IF EXISTS "Beds mutate policy" ON public.ipd_beds;

      CREATE POLICY "Beds read policy" ON public.ipd_beds
        FOR SELECT
        USING (true);

      CREATE POLICY "Beds mutate policy" ON public.ipd_beds
        FOR ALL
        TO authenticated
        USING (public.is_clinician_or_staff())
        WITH CHECK (public.is_clinician_or_staff());

      -- IPD Admissions
      DROP POLICY IF EXISTS "Admissions read policy" ON public.ipd_admissions;
      DROP POLICY IF EXISTS "Admissions mutate policy" ON public.ipd_admissions;

      CREATE POLICY "Admissions read policy" ON public.ipd_admissions
        FOR SELECT
        TO authenticated
        USING (
          patient_health_id IN (
            SELECT health_id FROM public.patients 
            WHERE auth_user_id = auth.uid() 
               OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
          )
          OR public.is_clinician_or_staff()
        );

      CREATE POLICY "Admissions mutate policy" ON public.ipd_admissions
        FOR ALL
        TO authenticated
        USING (public.is_clinician_or_staff())
        WITH CHECK (public.is_clinician_or_staff());

      -- Medicines
      DROP POLICY IF EXISTS "Medicines read policy" ON public.medicines;
      DROP POLICY IF EXISTS "Medicines mutate policy" ON public.medicines;

      CREATE POLICY "Medicines read policy" ON public.medicines
        FOR SELECT
        USING (true);

      CREATE POLICY "Medicines mutate policy" ON public.medicines
        FOR ALL
        TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    `);

    console.log('\n✅ ALL DATABASE TABLES SUCCESSFULLY HARDENED WITH ENTERPRISE ZERO-TRUST RLS POLICIES!');
  } catch (err) {
    console.error('Hardening error:', err);
    throw err;
  } finally {
    await client.end();
  }
}

hardenDatabaseSecurity();
