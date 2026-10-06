const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function runMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    // 1. Doctors Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.doctors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL DEFAULT 'Consultant',
        qualification TEXT DEFAULT 'MBBS, MD',
        opd_room TEXT DEFAULT 'Room 101',
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Created doctors table');

    // 2. IPD Wards Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ipd_wards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ward_code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        ward_type TEXT NOT NULL,
        total_beds INTEGER NOT NULL DEFAULT 0,
        floor TEXT DEFAULT '1st Floor',
        department TEXT DEFAULT 'General Medicine',
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Created ipd_wards table');

    // 3. IPD Beds Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ipd_beds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bed_number TEXT UNIQUE NOT NULL,
        ward_id UUID REFERENCES public.ipd_wards(id) ON DELETE CASCADE,
        ward_code TEXT NOT NULL,
        bed_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance', 'Cleaning', 'Reserved')),
        current_patient_health_id TEXT,
        current_patient_name TEXT,
        daily_charge NUMERIC DEFAULT 1500,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Created ipd_beds table');

    // 4. IPD Admissions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ipd_admissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admission_number TEXT UNIQUE NOT NULL,
        patient_health_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_age INTEGER,
        patient_gender TEXT,
        patient_phone TEXT,
        bed_id UUID REFERENCES public.ipd_beds(id) ON DELETE SET NULL,
        bed_number TEXT NOT NULL,
        ward_code TEXT NOT NULL,
        ward_name TEXT NOT NULL,
        department TEXT NOT NULL DEFAULT 'General Medicine',
        doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
        doctor_name TEXT NOT NULL DEFAULT 'Dr. Mohamed',
        admission_date TIMESTAMPTZ NOT NULL DEFAULT now(),
        expected_discharge TIMESTAMPTZ,
        actual_discharge TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Discharged', 'Transferred', 'Planned Discharge')),
        diagnosis TEXT NOT NULL DEFAULT 'Dengue with thrombocytopenia',
        admission_type TEXT DEFAULT 'Emergency' CHECK (admission_type IN ('Emergency', 'Planned', 'OPD Transfer', 'ICU Step Down')),
        chief_complaint TEXT,
        insurance_status TEXT DEFAULT 'Active',
        total_estimate NUMERIC DEFAULT 25000,
        amount_paid NUMERIC DEFAULT 10000,
        discharge_summary JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Created ipd_admissions table');

    // 5. IPD Bed Transfers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ipd_bed_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admission_id UUID REFERENCES public.ipd_admissions(id) ON DELETE CASCADE,
        patient_health_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        from_bed_number TEXT NOT NULL,
        to_bed_number TEXT NOT NULL,
        from_ward_code TEXT NOT NULL,
        to_ward_code TEXT NOT NULL,
        transfer_reason TEXT NOT NULL,
        authorized_by TEXT NOT NULL DEFAULT 'Dr. Mohamed',
        status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Requested', 'Approved', 'Completed', 'Rejected')),
        transferred_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Created ipd_bed_transfers table');

    // 6. IPD Clinical Notes Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ipd_clinical_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admission_id UUID REFERENCES public.ipd_admissions(id) ON DELETE CASCADE,
        patient_health_id TEXT NOT NULL,
        note_type TEXT NOT NULL DEFAULT 'Doctor Round' CHECK (note_type IN ('Doctor Round', 'Nursing Observation', 'Consultation Note', 'Dietary Plan', 'Critical Alert')),
        author_name TEXT NOT NULL DEFAULT 'Dr. Mohamed',
        author_role TEXT NOT NULL DEFAULT 'Consultant Physician',
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Created ipd_clinical_notes table');

    // 7. IPD Doctor Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ipd_doctor_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admission_id UUID REFERENCES public.ipd_admissions(id) ON DELETE CASCADE,
        patient_health_id TEXT NOT NULL,
        order_type TEXT NOT NULL DEFAULT 'Medication' CHECK (order_type IN ('Medication', 'Lab Investigation', 'Radiology', 'Nursing Procedure', 'Diet')),
        description TEXT NOT NULL,
        ordered_by TEXT NOT NULL DEFAULT 'Dr. Mohamed',
        status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Administered', 'Completed', 'Discontinued')),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Created ipd_doctor_orders table');

    // Enable Row Level Security (RLS) and create public permissive policies for anon & authenticated roles
    const tables = ['doctors', 'ipd_wards', 'ipd_beds', 'ipd_admissions', 'ipd_bed_transfers', 'ipd_clinical_notes', 'ipd_doctor_orders'];
    for (const t of tables) {
      await client.query(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`);
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = '${t}' AND policyname = 'Allow public read access on ${t}'
          ) THEN
            CREATE POLICY "Allow public read access on ${t}" ON public.${t} FOR SELECT USING (true);
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = '${t}' AND policyname = 'Allow public insert access on ${t}'
          ) THEN
            CREATE POLICY "Allow public insert access on ${t}" ON public.${t} FOR INSERT WITH CHECK (true);
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = '${t}' AND policyname = 'Allow public update access on ${t}'
          ) THEN
            CREATE POLICY "Allow public update access on ${t}" ON public.${t} FOR UPDATE USING (true);
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = '${t}' AND policyname = 'Allow public delete access on ${t}'
          ) THEN
            CREATE POLICY "Allow public delete access on ${t}" ON public.${t} FOR DELETE USING (true);
          END IF;
        END
        $$;
      `);
      console.log(`RLS policies configured for ${t}`);
    }

    // Now seed doctors
    await client.query(`
      INSERT INTO public.doctors (name, department, designation, qualification, opd_room)
      VALUES 
        ('Dr. Mohamed', 'General Medicine', 'Senior Consultant Physician', 'MBBS, MD (Gen Med)', 'Room 101'),
        ('Dr. Priya', 'Critical Care / ICU', 'Chief Intensivist', 'MBBS, MD, IDCCM', 'ICU Bay A'),
        ('Dr. Arjun', 'Emergency Medicine', 'Lead Trauma Specialist', 'MBBS, MEM, MRCEM', 'Casualty 01'),
        ('Dr. Revathi', 'Cardiology', 'Senior Interventional Cardiologist', 'MBBS, MD, DM (Cardio)', 'Room 204'),
        ('Dr. Ananya', 'Pediatrics', 'Consultant Pediatrician', 'MBBS, DCH, DNB', 'Room 108'),
        ('Dr. Suresh', 'Orthopedics', 'Consultant Orthopedic Surgeon', 'MBBS, MS (Ortho)', 'Room 210')
      ON CONFLICT DO NOTHING;
    `);
    console.log('Seeded doctors');

    // Seed Wards
    const wardsData = [
      { code: 'GEN', name: 'General Ward', type: 'General Ward', beds: 40, floor: '1st Floor Wing A' },
      { code: 'SEMI', name: 'Semi-Private Ward', type: 'Semi-Private', beds: 30, floor: '2nd Floor Wing B' },
      { code: 'PRIV', name: 'Private Ward', type: 'Private Room', beds: 20, floor: '3rd Floor Wing C' },
      { code: 'ICU', name: 'Intensive Care Unit (ICU)', type: 'Critical Care', beds: 10, floor: '1st Floor Emergency Wing' },
      { code: 'HDU', name: 'High Dependency Unit (HDU)', type: 'Step-Down Care', beds: 10, floor: '2nd Floor Step-Down' }
    ];

    for (const w of wardsData) {
      await client.query(`
        INSERT INTO public.ipd_wards (ward_code, name, ward_type, total_beds, floor)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (ward_code) DO UPDATE 
        SET name = EXCLUDED.name, ward_type = EXCLUDED.ward_type, total_beds = EXCLUDED.total_beds, floor = EXCLUDED.floor;
      `, [w.code, w.name, w.type, w.beds, w.floor]);
    }
    console.log('Seeded wards');

    // Get ward IDs
    const wardRows = await client.query(`SELECT id, ward_code FROM public.ipd_wards;`);
    const wardMap = {};
    for (const r of wardRows.rows) {
      wardMap[r.ward_code] = r.id;
    }

    // Seed Beds matching reference photo
    const seedBeds = [
      // General Ward
      { bed: 'G-01', ward: 'GEN', type: 'General Ward', status: 'Available', patientId: null, patientName: null },
      { bed: 'G-02', ward: 'GEN', type: 'General Ward', status: 'Occupied', patientId: 'HG001245', patientName: 'Sameer Ahmed' },
      { bed: 'G-03', ward: 'GEN', type: 'General Ward', status: 'Available', patientId: null, patientName: null },
      { bed: 'G-04', ward: 'GEN', type: 'General Ward', status: 'Occupied', patientId: 'HG001244', patientName: 'Lakshmi Priya' },
      { bed: 'G-05', ward: 'GEN', type: 'General Ward', status: 'Occupied', patientId: 'HG001243', patientName: 'Rajesh Kumar' },
      { bed: 'G-06', ward: 'GEN', type: 'General Ward', status: 'Available', patientId: null, patientName: null },
      { bed: 'G-07', ward: 'GEN', type: 'General Ward', status: 'Occupied', patientId: 'HG001242', patientName: 'Meena R' },
      { bed: 'G-08', ward: 'GEN', type: 'General Ward', status: 'Occupied', patientId: 'HG001241', patientName: 'A. Prakash' },
      { bed: 'G-09', ward: 'GEN', type: 'General Ward', status: 'Available', patientId: null, patientName: null },
      { bed: 'G-10', ward: 'GEN', type: 'General Ward', status: 'Maintenance', patientId: null, patientName: null },
      
      // Semi-Private Ward
      { bed: 'SP-01', ward: 'SEMI', type: 'Semi-Private', status: 'Occupied', patientId: 'HG001239', patientName: 'Vignesh S' },
      { bed: 'SP-02', ward: 'SEMI', type: 'Semi-Private', status: 'Available', patientId: null, patientName: null },
      { bed: 'SP-03', ward: 'SEMI', type: 'Semi-Private', status: 'Occupied', patientId: 'HG001238', patientName: 'Kavitha N' },
      { bed: 'SP-04', ward: 'SEMI', type: 'Semi-Private', status: 'Available', patientId: null, patientName: null },
      { bed: 'SP-05', ward: 'SEMI', type: 'Semi-Private', status: 'Occupied', patientId: 'HG001237', patientName: 'Suresh Babu' },

      // Private Ward
      { bed: 'P-01', ward: 'PRIV', type: 'Private Room', status: 'Available', patientId: null, patientName: null },
      { bed: 'P-02', ward: 'PRIV', type: 'Private Room', status: 'Occupied', patientId: 'HG001236', patientName: 'Fathima Begum' },
      { bed: 'P-03', ward: 'PRIV', type: 'Private Room', status: 'Available', patientId: null, patientName: null },
      { bed: 'P-04', ward: 'PRIV', type: 'Private Room', status: 'Occupied', patientId: 'HG001235', patientName: 'Arun Karthik' },
      { bed: 'P-05', ward: 'PRIV', type: 'Private Room', status: 'Available', patientId: null, patientName: null },

      // ICU
      { bed: 'ICU-01', ward: 'ICU', type: 'Critical Care', status: 'Occupied', patientId: 'HG-PP27BNQ', patientName: 'Mohamed Sameen' },
      { bed: 'ICU-02', ward: 'ICU', type: 'Critical Care', status: 'Occupied', patientId: 'HG001240', patientName: 'K. Balaji' },
      { bed: 'ICU-03', ward: 'ICU', type: 'Critical Care', status: 'Available', patientId: null, patientName: null },

      // HDU
      { bed: 'HDU-01', ward: 'HDU', type: 'Step-Down Care', status: 'Occupied', patientId: 'HG001234', patientName: 'R. Soundarya' },
      { bed: 'HDU-02', ward: 'HDU', type: 'Step-Down Care', status: 'Available', patientId: null, patientName: null },
      { bed: 'HDU-03', ward: 'HDU', type: 'Step-Down Care', status: 'Available', patientId: null, patientName: null }
    ];

    for (const b of seedBeds) {
      const wardId = wardMap[b.ward];
      await client.query(`
        INSERT INTO public.ipd_beds (bed_number, ward_id, ward_code, bed_type, status, current_patient_health_id, current_patient_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (bed_number) DO UPDATE
        SET ward_id = EXCLUDED.ward_id,
            ward_code = EXCLUDED.ward_code,
            bed_type = EXCLUDED.bed_type,
            status = EXCLUDED.status,
            current_patient_health_id = EXCLUDED.current_patient_health_id,
            current_patient_name = EXCLUDED.current_patient_name;
      `, [b.bed, wardId, b.ward, b.type, b.status, b.patientId, b.patientName]);
    }
    console.log('Seeded beds');

    // Seed Active Admissions matching reference photo
    const activeAdmissions = [
      {
        admNo: 'IPD-20250928-001',
        healthId: 'HG001245',
        name: 'Sameer Ahmed',
        age: 20,
        gender: 'Male',
        phone: '+91 98765 43210',
        bedNumber: 'G-02',
        wardCode: 'GEN',
        wardName: 'General Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Mohamed',
        admDate: '2025-09-28 16:30:00+05:30',
        expDischarge: '2025-10-02 12:00:00+05:30',
        diagnosis: 'Dengue with thrombocytopenia',
        chiefComplaint: 'High grade fever with retro-orbital pain for 4 days, petechial rash, platelet count 42,000/mcL'
      },
      {
        admNo: 'IPD-20250927-004',
        healthId: 'HG001244',
        name: 'Lakshmi Priya',
        age: 34,
        gender: 'Female',
        phone: '+91 98765 67890',
        bedNumber: 'G-04',
        wardCode: 'GEN',
        wardName: 'General Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Mohamed',
        admDate: '2025-09-27 10:15:00+05:30',
        expDischarge: '2025-10-01 11:00:00+05:30',
        diagnosis: 'Acute Bronchial Asthma with secondary infection',
        chiefComplaint: 'Dyspnea, wheezing, SpO2 91% on room air'
      },
      {
        admNo: 'IPD-20250926-002',
        healthId: 'HG001243',
        name: 'Rajesh Kumar',
        age: 45,
        gender: 'Male',
        phone: '+91 98765 11223',
        bedNumber: 'G-05',
        wardCode: 'GEN',
        wardName: 'General Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Suresh',
        admDate: '2025-09-26 14:00:00+05:30',
        expDischarge: '2025-09-30 18:00:00+05:30',
        diagnosis: 'Right Tibial Fracture (Post-ORIF Stabilization)',
        chiefComplaint: 'Post-operative pain management and wound healing'
      },
      {
        admNo: 'IPD-20250928-003',
        healthId: 'HG001242',
        name: 'Meena R',
        age: 52,
        gender: 'Female',
        phone: '+91 98765 33445',
        bedNumber: 'G-07',
        wardCode: 'GEN',
        wardName: 'General Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Mohamed',
        admDate: '2025-09-28 09:00:00+05:30',
        expDischarge: '2025-10-03 14:00:00+05:30',
        diagnosis: 'Type 2 Diabetes with Diabetic Ketoacidosis (Stabilized)',
        chiefComplaint: 'Polydipsia, weakness, blood glucose 380 mg/dL upon arrival'
      },
      {
        admNo: 'IPD-20250929-001',
        healthId: 'HG001241',
        name: 'A. Prakash',
        age: 28,
        gender: 'Male',
        phone: '+91 98765 55667',
        bedNumber: 'G-08',
        wardCode: 'GEN',
        wardName: 'General Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Arjun',
        admDate: '2025-09-29 08:30:00+05:30',
        expDischarge: '2025-10-04 12:00:00+05:30',
        diagnosis: 'Acute Gastroenteritis with moderate dehydration',
        chiefComplaint: 'Severe nausea, vomiting and cramps for 24 hours'
      },
      {
        admNo: 'IPD-20250927-009',
        healthId: 'HG001239',
        name: 'Vignesh S',
        age: 31,
        gender: 'Male',
        phone: '+91 98765 77889',
        bedNumber: 'SP-01',
        wardCode: 'SEMI',
        wardName: 'Semi-Private Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Mohamed',
        admDate: '2025-09-27 18:00:00+05:30',
        expDischarge: '2025-10-02 10:00:00+05:30',
        diagnosis: 'Enteric Fever (Typhoid) with transaminitis',
        chiefComplaint: 'Step-ladder fever and abdominal pain'
      },
      {
        admNo: 'IPD-20250928-005',
        healthId: 'HG001238',
        name: 'Kavitha N',
        age: 41,
        gender: 'Female',
        phone: '+91 98765 99001',
        bedNumber: 'SP-03',
        wardCode: 'SEMI',
        wardName: 'Semi-Private Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Revathi',
        admDate: '2025-09-28 11:20:00+05:30',
        expDischarge: '2025-10-03 16:00:00+05:30',
        diagnosis: 'Hypertensive Urgency with Migraine',
        chiefComplaint: 'Severe occipital headache, BP 190/110 mmHg'
      },
      {
        admNo: 'IPD-20250926-007',
        healthId: 'HG001237',
        name: 'Suresh Babu',
        age: 58,
        gender: 'Male',
        phone: '+91 98765 22334',
        bedNumber: 'SP-05',
        wardCode: 'SEMI',
        wardName: 'Semi-Private Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Mohamed',
        admDate: '2025-09-26 15:45:00+05:30',
        expDischarge: '2025-09-30 11:00:00+05:30',
        diagnosis: 'Left Ureteric Calculus with Hydronephrosis',
        chiefComplaint: 'Severe colicky flank pain, microscopic hematuria'
      },
      {
        admNo: 'IPD-20250928-006',
        healthId: 'HG001236',
        name: 'Fathima Begum',
        age: 49,
        gender: 'Female',
        phone: '+91 98765 44556',
        bedNumber: 'P-02',
        wardCode: 'PRIV',
        wardName: 'Private Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Mohamed',
        admDate: '2025-09-28 13:00:00+05:30',
        expDischarge: '2025-10-04 15:00:00+05:30',
        diagnosis: 'Right Lower Lobe Pneumonia',
        chiefComplaint: 'Productive cough, chest pain on inspiration, fever'
      },
      {
        admNo: 'IPD-20250929-002',
        healthId: 'HG001235',
        name: 'Arun Karthik',
        age: 26,
        gender: 'Male',
        phone: '+91 98765 66778',
        bedNumber: 'P-04',
        wardCode: 'PRIV',
        wardName: 'Private Ward',
        dept: 'General Medicine',
        doctor: 'Dr. Priya',
        admDate: '2025-09-29 07:15:00+05:30',
        expDischarge: '2025-10-05 10:00:00+05:30',
        diagnosis: 'Acute Appendicitis (Pre-op observation)',
        chiefComplaint: 'Right iliac fossa tenderness and fever'
      },
      // Citizen profile Mohamed Sameen (user's real profile in Supabase)
      {
        admNo: 'IPD-20250929-003',
        healthId: 'HG-PP27BNQ',
        name: 'Mohamed Sameen',
        age: 20,
        gender: 'Male',
        phone: '+919384180516',
        bedNumber: 'ICU-01',
        wardCode: 'ICU',
        wardName: 'Intensive Care Unit (ICU)',
        dept: 'Critical Care / ICU',
        doctor: 'Dr. Priya',
        admDate: '2025-09-29 06:00:00+05:30',
        expDischarge: '2025-10-03 18:00:00+05:30',
        diagnosis: 'Acute Respiratory Distress with severe viral syndrome',
        chiefComplaint: 'High fever, severe breathlessness, SpO2 89% requiring high flow oxygen'
      }
    ];

    for (const a of activeAdmissions) {
      // Get bed id
      const bedRes = await client.query(`SELECT id FROM public.ipd_beds WHERE bed_number = $1;`, [a.bedNumber]);
      const bedId = bedRes.rows[0]?.id || null;

      await client.query(`
        INSERT INTO public.ipd_admissions (
          admission_number, patient_health_id, patient_name, patient_age, patient_gender, patient_phone,
          bed_id, bed_number, ward_code, ward_name, department, doctor_name,
          admission_date, expected_discharge, status, diagnosis, chief_complaint
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Active', $15, $16)
        ON CONFLICT (admission_number) DO UPDATE
        SET bed_id = EXCLUDED.bed_id,
            bed_number = EXCLUDED.bed_number,
            doctor_name = EXCLUDED.doctor_name,
            diagnosis = EXCLUDED.diagnosis,
            expected_discharge = EXCLUDED.expected_discharge;
      `, [
        a.admNo, a.healthId, a.name, a.age, a.gender, a.phone,
        bedId, a.bedNumber, a.wardCode, a.wardName, a.dept, a.doctor,
        a.admDate, a.expDischarge, a.diagnosis, a.chiefComplaint
      ]);
    }
    console.log('Seeded admissions');

    // Seed Clinical Notes and Doctor Orders for Sameer Ahmed (Bed G-02)
    const sameerAdmRes = await client.query(`SELECT id FROM public.ipd_admissions WHERE admission_number = 'IPD-20250928-001';`);
    if (sameerAdmRes.rows.length > 0) {
      const sameerAdmId = sameerAdmRes.rows[0].id;
      
      // Clinical notes
      await client.query(`
        INSERT INTO public.ipd_clinical_notes (admission_id, patient_health_id, note_type, author_name, author_role, content, created_at)
        VALUES
          ($1, 'HG001245', 'Doctor Round', 'Dr. Mohamed', 'Consultant Physician', 'Patient alert and oriented. Temperature down to 99.2 F. Platelets at 42,000/mcL. Continue IV hydration, strict monitoring of hematocrit and urine output. No active bleeding noted.', '2025-09-29 09:30:00+05:30'),
          ($1, 'HG001245', 'Nursing Observation', 'Nurse Shanthi', 'Staff Nurse - Gen Ward', 'Vitals logged at 06:00 AM: BP 118/78, Pulse 72 bpm, SpO2 99%. Patient tolerated oral fluids well. Platelet count repeat sample sent to lab.', '2025-09-29 06:30:00+05:30'),
          ($1, 'HG001245', 'Consultation Note', 'Dr. Priya', 'Chief Intensivist', 'Reviewed for ICU step-down criteria. Hemodynamically stable, no signs of plasma leakage. Safe to continue in General Ward under observation.', '2025-09-28 20:00:00+05:30')
        ON CONFLICT DO NOTHING;
      `, [sameerAdmId]);

      // Orders
      await client.query(`
        INSERT INTO public.ipd_doctor_orders (admission_id, patient_health_id, order_type, description, ordered_by, status, created_at)
        VALUES
          ($1, 'HG001245', 'Medication', 'IV Normal Saline 0.9% @ 75 ml/hr maintenance', 'Dr. Mohamed', 'Active', '2025-09-28 17:00:00+05:30'),
          ($1, 'HG001245', 'Medication', 'Tab Paracetamol 650mg SOS for temp > 100 F', 'Dr. Mohamed', 'Active', '2025-09-28 17:00:00+05:30'),
          ($1, 'HG001245', 'Lab Investigation', 'Complete Blood Count (CBC) with Platelet Count every 12 hours', 'Dr. Mohamed', 'Active', '2025-09-28 17:00:00+05:30'),
          ($1, 'HG001245', 'Diet', 'High fluid intake, soft bland diet, avoid NSAIDs/Aspirin', 'Dr. Mohamed', 'Active', '2025-09-28 17:00:00+05:30')
        ON CONFLICT DO NOTHING;
      `, [sameerAdmId]);
      console.log('Seeded Sameer Ahmed clinical notes and orders');
    }

    console.log('Migration and seeding completed successfully!');
    await client.end();
  } catch(err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
