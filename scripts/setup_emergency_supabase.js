const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function runEmergencyMigrationAndSeed() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    // 1. Ensure doctors table has Dr. Priya
    const extraDoctors = [
      { name: 'Dr. Priya', department: 'Emergency Medicine', designation: 'Emergency Physician', qualification: 'MBBS, MD Emergency Medicine', opd_room: 'Casualty Room 1' }
    ];

    for (const doc of extraDoctors) {
      await client.query(`
        INSERT INTO public.doctors (name, department, designation, qualification, opd_room, is_available)
        SELECT $1, $2, $3, $4, $5, true
        WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = $1);
      `, [doc.name, doc.department, doc.designation, doc.qualification, doc.opd_room]);
    }
    console.log('Emergency doctors verified.');

    // Fetch doctors mapping
    const doctorsRes = await client.query('SELECT id, name, department FROM public.doctors;');
    const doctorMap = {};
    for (const d of doctorsRes.rows) {
      doctorMap[d.name] = d;
    }

    // 2. Create emergency_cases table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.emergency_cases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        case_number TEXT UNIQUE NOT NULL,
        patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
        patient_health_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_phone TEXT,
        patient_age INTEGER,
        patient_gender TEXT,
        patient_avatar TEXT,
        triage_level TEXT NOT NULL CHECK (triage_level IN ('Red', 'Yellow', 'Green', 'Black')),
        status TEXT NOT NULL CHECK (status IN ('Waiting', 'In Treatment', 'Observation', 'Discharged', 'Transferred', 'Triage')),
        arrival_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        mode_of_arrival TEXT NOT NULL CHECK (mode_of_arrival IN ('Ambulance', 'Walk-in', 'Wheelchair', 'Private Vehicle')),
        chief_complaint TEXT NOT NULL,
        assigned_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
        assigned_doctor_name TEXT NOT NULL,
        er_location TEXT NOT NULL,
        accompanied_by TEXT,
        allergies TEXT DEFAULT 'No known allergies',
        latest_vitals JSONB DEFAULT '{"bp":"120/80","hr":72,"spo2":98,"temp":37.0,"time":"10:00 AM"}',
        vitals_history JSONB DEFAULT '[]',
        treatment_orders JSONB DEFAULT '[]',
        clinical_notes JSONB DEFAULT '[]',
        investigations_ordered JSONB DEFAULT '[]',
        discharged_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE public.emergency_cases DROP CONSTRAINT IF EXISTS emergency_cases_status_check;
      ALTER TABLE public.emergency_cases ADD CONSTRAINT emergency_cases_status_check CHECK (status IN ('Waiting', 'In Treatment', 'Observation', 'Discharged', 'Transferred', 'Triage'));
    `);
    console.log('Table public.emergency_cases ensured.');

    // 3. Configure RLS Policies
    await client.query(`
      ALTER TABLE public.emergency_cases ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Permissive emergency_cases select" ON public.emergency_cases;
      CREATE POLICY "Permissive emergency_cases select" ON public.emergency_cases FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Permissive emergency_cases insert" ON public.emergency_cases;
      CREATE POLICY "Permissive emergency_cases insert" ON public.emergency_cases FOR INSERT WITH CHECK (true);
      DROP POLICY IF EXISTS "Permissive emergency_cases update" ON public.emergency_cases;
      CREATE POLICY "Permissive emergency_cases update" ON public.emergency_cases FOR UPDATE USING (true);
      DROP POLICY IF EXISTS "Permissive emergency_cases delete" ON public.emergency_cases;
      CREATE POLICY "Permissive emergency_cases delete" ON public.emergency_cases FOR DELETE USING (true);
    `);
    console.log('RLS policies configured for emergency_cases.');

    // 4. Enroll in supabase_realtime
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public' 
            AND tablename = 'emergency_cases'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_cases;
        END IF;
      END $$;
    `);
    console.log('Enrolled in supabase_realtime publication.');

    // 5. Fetch patients mapping
    const patientsRes = await client.query('SELECT id, health_id, full_name, phone_number, age, gender, avatar_url FROM public.patients;');
    const patientMap = {};
    for (const p of patientsRes.rows) {
      if (p.health_id) patientMap[p.health_id] = p;
    }

    // 6. Build the 32 cases + 12 discharged cases (calibrated exactly to Emergency ERP ref.png)
    // Reference UI:
    // Total ER Patients: 32 (with 18% increase badge)
    // Critical (Red): 6
    // In Treatment: 18
    // Waiting: 5
    // Observation: 4 (Tab count)
    // Discharged: 12 (Tab count)
    const emergencyCasesToSeed = [
      // 1. Sameer Ahmed (Red, 20/M, 09:05 AM, In Treatment, Dr. Mohamed)
      {
        case_number: 'ER-250929-001',
        patient_health_id: 'HG001245',
        patient_name: 'Sameer Ahmed',
        patient_phone: '+91 98765 43210',
        patient_age: 20,
        patient_gender: 'Male',
        patient_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        triage_level: 'Red',
        status: 'In Treatment',
        arrival_time: '2025-09-29T09:05:00Z',
        mode_of_arrival: 'Ambulance',
        chief_complaint: 'Chest pain, breathing difficulty',
        assigned_doctor_name: 'Dr. Mohamed',
        er_location: 'ER - Bed 3',
        accompanied_by: 'Brother',
        allergies: 'No known allergies',
        latest_vitals: { bp: '160/100', hr: 110, spo2: 92, temp: 36.8, time: '10:15 AM' },
        vitals_history: [
          { bp: '165/105', hr: 118, spo2: 90, temp: 36.8, time: '09:08 AM', note: 'Ambulance handover' },
          { bp: '160/100', hr: 110, spo2: 92, temp: 36.8, time: '10:15 AM', note: 'Post sublingual nitroglycerin' }
        ],
        treatment_orders: [
          { order: 'Oxygen 4L/min via nasal cannula', time: '09:10 AM', status: 'Active' },
          { order: 'Tab Aspirin 300mg chewed STAT', time: '09:12 AM', status: 'Completed' },
          { order: 'IV Cannula 18G & Normal Saline KVO', time: '09:15 AM', status: 'Completed' }
        ],
        investigations_ordered: [
          { test: 'STAT 12-Lead ECG', ordered_at: '09:07 AM', status: 'Completed', result: 'ST Elevation V2-V4' },
          { test: 'Troponin-I Rapid Quantitative', ordered_at: '09:10 AM', status: 'In Progress', result: 'Pending Lab' }
        ],
        clinical_notes: [
          { author: 'Dr. Mohamed', role: 'Emergency Physician', time: '09:20 AM', note: 'Suspected acute anterior wall STEMI. Interventional cardiology on-call notified for cath lab standby.' }
        ]
      },
      // 2. Lakshmi Priya (Red, 34/F, 09:20 AM, In Treatment, Dr. Revathi)
      {
        case_number: 'ER-250929-002',
        patient_health_id: 'HG001244',
        patient_name: 'Lakshmi Priya',
        patient_phone: '+91 98765 43211',
        patient_age: 34,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Red',
        status: 'In Treatment',
        arrival_time: '2025-09-29T09:20:00Z',
        mode_of_arrival: 'Ambulance',
        chief_complaint: 'Severe abdominal pain',
        assigned_doctor_name: 'Dr. Revathi',
        er_location: 'Resuscitation Bay 2',
        accompanied_by: 'Husband',
        allergies: 'Sulfa drugs',
        latest_vitals: { bp: '140/90', hr: 104, spo2: 96, temp: 38.2, time: '09:35 AM' },
        vitals_history: [
          { bp: '140/90', hr: 104, spo2: 96, temp: 38.2, time: '09:25 AM', note: 'Triage' }
        ],
        treatment_orders: [
          { order: 'IV Tramadol 50mg slow infusion', time: '09:30 AM', status: 'Completed' },
          { order: 'IV Pantoprazole 40mg STAT', time: '09:32 AM', status: 'Completed' }
        ],
        investigations_ordered: [
          { test: 'STAT USG Abdomen & Pelvis', ordered_at: '09:25 AM', status: 'Completed', result: 'Ruptured ectopic ruled out, acute appendicitis suspected' }
        ],
        clinical_notes: [
          { author: 'Dr. Revathi', role: 'Consultant', time: '09:40 AM', note: 'Rebound tenderness at McBurney point. Surgical consult requested.' }
        ]
      },
      // 3. Rajesh Kumar (Yellow, 45/M, 09:45 AM, Waiting, Dr. Arjun)
      {
        case_number: 'ER-250929-003',
        patient_health_id: 'HG001243',
        patient_name: 'Rajesh Kumar',
        patient_phone: '+91 98765 43212',
        patient_age: 45,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'Waiting',
        arrival_time: '2025-09-29T09:45:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'High fever, vomiting',
        assigned_doctor_name: 'Dr. Arjun',
        er_location: 'ER - Bed 5',
        accompanied_by: 'Wife',
        allergies: 'None',
        latest_vitals: { bp: '130/85', hr: 98, spo2: 97, temp: 39.1, time: '09:50 AM' },
        vitals_history: [
          { bp: '130/85', hr: 98, spo2: 97, temp: 39.1, time: '09:50 AM', note: 'Triage vitals' }
        ],
        treatment_orders: [
          { order: 'IV Paracetamol 1g infusion', time: '09:55 AM', status: 'Active' },
          { order: 'IV Ondansetron 4mg STAT', time: '09:55 AM', status: 'Completed' }
        ],
        investigations_ordered: [
          { test: 'Complete Blood Count & Dengue NS1', ordered_at: '09:52 AM', status: 'In Progress', result: 'Awaiting' }
        ],
        clinical_notes: [
          { author: 'Dr. Arjun', role: 'Senior Resident', time: '10:00 AM', note: 'Febrile episode since 3 days. Hydration underway.' }
        ]
      },
      // 4. Meena R (Red, 28/F, 10:10 AM, In Treatment, Dr. Priya)
      {
        case_number: 'ER-250929-004',
        patient_health_id: 'HG001242',
        patient_name: 'Meena R',
        patient_phone: '+91 98765 43213',
        patient_age: 28,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Red',
        status: 'In Treatment',
        arrival_time: '2025-09-29T10:10:00Z',
        mode_of_arrival: 'Ambulance',
        chief_complaint: 'Road traffic accident (RTA)',
        assigned_doctor_name: 'Dr. Priya',
        er_location: 'Trauma Bay 1',
        accompanied_by: 'Paramedic',
        allergies: 'No known allergies',
        latest_vitals: { bp: '90/60', hr: 122, spo2: 91, temp: 36.5, time: '10:20 AM' },
        vitals_history: [
          { bp: '90/60', hr: 122, spo2: 91, temp: 36.5, time: '10:12 AM', note: 'Primary trauma survey' }
        ],
        treatment_orders: [
          { order: 'C-spine collar placed', time: '10:11 AM', status: 'Completed' },
          { order: 'Dual 16G IV access with Ringer Lactate 1000ml rapid bolus', time: '10:14 AM', status: 'Active' }
        ],
        investigations_ordered: [
          { test: 'STAT eFAST Trauma Ultrasound', ordered_at: '10:15 AM', status: 'Completed', result: 'Free fluid in Morison pouch' },
          { test: 'Crossmatch 4 Units PRBC', ordered_at: '10:16 AM', status: 'Active', result: 'Blood bank notified' }
        ],
        clinical_notes: [
          { author: 'Dr. Priya', role: 'Trauma Team Lead', time: '10:25 AM', note: 'Blunt abdominal trauma with hemorrhagic shock. Ortho & General Surgery standing by.' }
        ]
      },
      // 5. Arun Prakash (Green, 62/M, 10:25 AM, Observation, Dr. Karthik)
      {
        case_number: 'ER-250929-005',
        patient_health_id: 'HG001241',
        patient_name: 'Arun Prakash',
        patient_phone: '+91 98765 43214',
        patient_age: 62,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'Observation',
        arrival_time: '2025-09-29T10:25:00Z',
        mode_of_arrival: 'Wheelchair',
        chief_complaint: 'Fall injury, minor head trauma',
        assigned_doctor_name: 'Dr. Karthik',
        er_location: 'Observation Bed 2',
        accompanied_by: 'Son',
        allergies: 'Aspirin',
        latest_vitals: { bp: '138/82', hr: 76, spo2: 98, temp: 36.9, time: '10:45 AM' },
        vitals_history: [
          { bp: '138/82', hr: 76, spo2: 98, temp: 36.9, time: '10:30 AM', note: 'Stable triage' }
        ],
        treatment_orders: [
          { order: 'Ice pack application to frontal contusion', time: '10:35 AM', status: 'Completed' },
          { order: 'Neurological checks Q30min', time: '10:40 AM', status: 'Active' }
        ],
        investigations_ordered: [
          { test: 'Non-contrast CT Brain STAT', ordered_at: '10:32 AM', status: 'Completed', result: 'No intracranial hemorrhage or skull fracture' }
        ],
        clinical_notes: [
          { author: 'Dr. Karthik', role: 'Consultant', time: '10:50 AM', note: 'GCS 15/15. Pupil reflexes normal. Under 4-hour observation.' }
        ]
      },
      // 6. Fathima Begum (Yellow, 50/F, 10:40 AM, Waiting, Dr. Mohamed)
      {
        case_number: 'ER-250929-006',
        patient_health_id: 'HG001240',
        patient_name: 'Fathima Begum',
        patient_phone: '+91 98765 43215',
        patient_age: 50,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'Waiting',
        arrival_time: '2025-09-29T10:40:00Z',
        mode_of_arrival: 'Private Vehicle',
        chief_complaint: 'Breathlessness',
        assigned_doctor_name: 'Dr. Mohamed',
        er_location: 'ER - Bed 7',
        accompanied_by: 'Daughter',
        allergies: 'Dust/Pollen',
        latest_vitals: { bp: '145/92', hr: 102, spo2: 94, temp: 37.1, time: '10:50 AM' },
        vitals_history: [
          { bp: '145/92', hr: 102, spo2: 94, temp: 37.1, time: '10:42 AM', note: 'Triage assessment' }
        ],
        treatment_orders: [
          { order: 'Nebulization with Salbutamol + Ipratropium', time: '10:46 AM', status: 'Completed' },
          { order: 'Oxygen 2L/min nasal prongs', time: '10:45 AM', status: 'Active' }
        ],
        investigations_ordered: [
          { test: 'Portable Chest X-Ray', ordered_at: '10:45 AM', status: 'In Progress', result: 'Pending Radiology' }
        ],
        clinical_notes: [
          { author: 'Dr. Mohamed', role: 'Casualty Incharge', time: '10:55 AM', note: 'Acute exacerbation of bronchial asthma. Responding positively to bronchodilators.' }
        ]
      },
      // 7. Vignesh S (Green, 36/M, 11:05 AM, In Treatment, Dr. Nivetha)
      {
        case_number: 'ER-250929-007',
        patient_health_id: 'HG001239',
        patient_name: 'Vignesh S',
        patient_phone: '+91 98765 43216',
        patient_age: 36,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'In Treatment',
        arrival_time: '2025-09-29T11:05:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Laceration (hand injury)',
        assigned_doctor_name: 'Dr. Nivetha',
        er_location: 'Minor OT Bed 1',
        accompanied_by: 'Friend',
        allergies: 'No known allergies',
        latest_vitals: { bp: '124/80', hr: 80, spo2: 99, temp: 36.7, time: '11:15 AM' },
        vitals_history: [
          { bp: '124/80', hr: 80, spo2: 99, temp: 36.7, time: '11:08 AM', note: 'Initial check' }
        ],
        treatment_orders: [
          { order: 'Local wound cleaning & 2% Lignocaine infiltration', time: '11:15 AM', status: 'Completed' },
          { order: 'Suturing with Ethilon 4-0 (5 interrupted sutures)', time: '11:25 AM', status: 'Active' },
          { order: 'Inj Tetanus Toxoid 0.5ml IM', time: '11:20 AM', status: 'Completed' }
        ],
        investigations_ordered: [
          { test: 'X-Ray Right Hand AP/Oblique', ordered_at: '11:10 AM', status: 'Completed', result: 'No foreign body, no fracture' }
        ],
        clinical_notes: [
          { author: 'Dr. Nivetha', role: 'Dermatologist/ER', time: '11:30 AM', note: 'Superficial palmar cut from broken glass. Tendon sheath intact.' }
        ]
      },
      // 8. Kavitha N (Yellow, 40/F, 11:20 AM, Waiting, Dr. Arjun)
      {
        case_number: 'ER-250929-008',
        patient_health_id: 'HG001238',
        patient_name: 'Kavitha N',
        patient_phone: '+91 98765 43217',
        patient_age: 40,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'Waiting',
        arrival_time: '2025-09-29T11:20:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'High blood pressure',
        assigned_doctor_name: 'Dr. Arjun',
        er_location: 'ER - Bed 8',
        accompanied_by: 'Self',
        allergies: 'NSAIDs',
        latest_vitals: { bp: '175/105', hr: 92, spo2: 98, temp: 37.0, time: '11:28 AM' },
        vitals_history: [
          { bp: '175/105', hr: 92, spo2: 98, temp: 37.0, time: '11:22 AM', note: 'Hypertensive urgency triage' }
        ],
        treatment_orders: [
          { order: 'Tab Amlodipine 5mg oral STAT', time: '11:26 AM', status: 'Completed' },
          { order: 'Quiet room rest with BP check Q15min', time: '11:27 AM', status: 'Active' }
        ],
        investigations_ordered: [
          { test: 'Serum Creatinine & Electrolytes', ordered_at: '11:25 AM', status: 'In Progress', result: 'Awaiting' },
          { test: 'Urinalysis for Proteinuria', ordered_at: '11:25 AM', status: 'In Progress', result: 'Awaiting' }
        ],
        clinical_notes: [
          { author: 'Dr. Arjun', role: 'Senior Resident', time: '11:35 AM', note: 'Asymptomatic severe hypertension. No end-organ damage symptoms. Monitoring response.' }
        ]
      },
      // 9. Suresh Babu (Green, 55/M, 11:45 AM, Observation, Dr. Priya)
      {
        case_number: 'ER-250929-009',
        patient_health_id: 'HG001237',
        patient_name: 'Suresh Babu',
        patient_phone: '+91 98765 43218',
        patient_age: 55,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'Observation',
        arrival_time: '2025-09-29T11:45:00Z',
        mode_of_arrival: 'Wheelchair',
        chief_complaint: 'General weakness',
        assigned_doctor_name: 'Dr. Priya',
        er_location: 'Observation Bed 4',
        accompanied_by: 'Spouse',
        allergies: 'No known allergies',
        latest_vitals: { bp: '118/76', hr: 72, spo2: 97, temp: 36.6, time: '11:55 AM' },
        vitals_history: [
          { bp: '118/76', hr: 72, spo2: 97, temp: 36.6, time: '11:48 AM', note: 'Triage evaluation' }
        ],
        treatment_orders: [
          { order: 'Oral Rehydration Solution (ORS) 500ml', time: '11:50 AM', status: 'Completed' },
          { order: 'IV 5% Dextrose 500ml slow infusion', time: '11:55 AM', status: 'Active' }
        ],
        investigations_ordered: [
          { test: 'Random Blood Glucose (RBG)', ordered_at: '11:47 AM', status: 'Completed', result: '68 mg/dL (Mild hypoglycemia)' }
        ],
        clinical_notes: [
          { author: 'Dr. Priya', role: 'Emergency Physician', time: '12:05 PM', note: 'Post-prandial delayed weakness. Hypoglycemia resolved with glucose intake. Observing for 2 hours.' }
        ]
      },
      // 10. Divya R (Green, 31/F, 12:10 PM, Waiting, Dr. Karthik)
      {
        case_number: 'ER-250929-010',
        patient_health_id: 'HG001236',
        patient_name: 'Divya R',
        patient_phone: '+91 98765 43219',
        patient_age: 31,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'Waiting',
        arrival_time: '2025-09-29T12:10:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Allergic reaction',
        assigned_doctor_name: 'Dr. Karthik',
        er_location: 'ER - Bed 10',
        accompanied_by: 'Sister',
        allergies: 'Seafood',
        latest_vitals: { bp: '120/78', hr: 88, spo2: 99, temp: 37.2, time: '12:18 PM' },
        vitals_history: [
          { bp: '120/78', hr: 88, spo2: 99, temp: 37.2, time: '12:12 PM', note: 'Initial vitals' }
        ],
        treatment_orders: [
          { order: 'Inj Avil (Pheniramine) 22.75mg IV STAT', time: '12:16 PM', status: 'Completed' },
          { order: 'Inj Hydrocortisone 100mg IV STAT', time: '12:18 PM', status: 'Completed' }
        ],
        investigations_ordered: [
          { test: 'Vital signs continuous monitor', ordered_at: '12:15 PM', status: 'Active', result: 'Airway patent, no stridor' }
        ],
        clinical_notes: [
          { author: 'Dr. Karthik', role: 'Consultant', time: '12:25 PM', note: 'Mild urticarial rash following lunch. No bronchospasm or angioedema. Stable.' }
        ]
      },
      // Cases 11 to 32: Additional Active cases distributed to hit:
      // Red: 6 total (Sameer, Lakshmi, Meena + 3 more: ER-011, ER-012, ER-013)
      // In Treatment: 18 total (Sameer, Lakshmi, Meena, Vignesh + 14 more)
      // Waiting: 5 total (Rajesh, Fathima, Kavitha, Divya + 1 more: ER-014)
      // Observation: 4 total (Arun, Suresh + 2 more: ER-015, ER-016)
      // Total active cases = 32!
      {
        case_number: 'ER-250929-011',
        patient_health_id: 'HG001246',
        patient_name: 'Karthik Raja',
        patient_phone: '+91 98765 43230',
        patient_age: 52,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Red',
        status: 'In Treatment',
        arrival_time: '2025-09-29T08:30:00Z',
        mode_of_arrival: 'Ambulance',
        chief_complaint: 'Acute left-sided stroke symptoms',
        assigned_doctor_name: 'Dr. Mohamed',
        er_location: 'Resuscitation Bay 1',
        accompanied_by: 'Wife',
        allergies: 'None',
        latest_vitals: { bp: '185/110', hr: 96, spo2: 95, temp: 37.1, time: '09:00 AM' }
      },
      {
        case_number: 'ER-250929-012',
        patient_health_id: 'HG001247',
        patient_name: 'Ananya S',
        patient_phone: '+91 98765 43231',
        patient_age: 19,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Red',
        status: 'In Treatment',
        arrival_time: '2025-09-29T08:50:00Z',
        mode_of_arrival: 'Ambulance',
        chief_complaint: 'Severe anaphylaxis after bee sting',
        assigned_doctor_name: 'Dr. Priya',
        er_location: 'Resuscitation Bay 3',
        accompanied_by: 'Mother',
        allergies: 'Insect venom',
        latest_vitals: { bp: '85/55', hr: 130, spo2: 89, temp: 36.6, time: '09:10 AM' }
      },
      {
        case_number: 'ER-250929-013',
        patient_health_id: 'HG001248',
        patient_name: 'Balamurugan P',
        patient_phone: '+91 98765 43232',
        patient_age: 48,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Red',
        status: 'In Treatment',
        arrival_time: '2025-09-29T09:15:00Z',
        mode_of_arrival: 'Ambulance',
        chief_complaint: 'Massive upper GI bleed (Hematemesis)',
        assigned_doctor_name: 'Dr. Revathi',
        er_location: 'Trauma Bay 2',
        accompanied_by: 'Brother',
        allergies: 'None',
        latest_vitals: { bp: '95/60', hr: 115, spo2: 94, temp: 36.9, time: '09:30 AM' }
      },
      {
        case_number: 'ER-250929-014',
        patient_health_id: 'HG001249',
        patient_name: 'Sangeetha M',
        patient_phone: '+91 98765 43233',
        patient_age: 38,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'Waiting',
        arrival_time: '2025-09-29T12:00:00Z',
        mode_of_arrival: 'Private Vehicle',
        chief_complaint: 'Suspected renal colic with flank pain',
        assigned_doctor_name: 'Dr. Arjun',
        er_location: 'ER - Bed 9',
        accompanied_by: 'Husband',
        allergies: 'None',
        latest_vitals: { bp: '135/85', hr: 90, spo2: 98, temp: 37.0, time: '12:05 PM' }
      },
      {
        case_number: 'ER-250929-015',
        patient_health_id: 'HG001250',
        patient_name: 'Ramesh V',
        patient_phone: '+91 98765 43234',
        patient_age: 65,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'Observation',
        arrival_time: '2025-09-29T10:00:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Transient dizziness and mild dehydration',
        assigned_doctor_name: 'Dr. Karthik',
        er_location: 'Observation Bed 1',
        accompanied_by: 'Daughter',
        allergies: 'None',
        latest_vitals: { bp: '110/70', hr: 68, spo2: 98, temp: 36.8, time: '10:15 AM' }
      },
      {
        case_number: 'ER-250929-016',
        patient_health_id: 'HG001251',
        patient_name: 'Saranya K',
        patient_phone: '+91 98765 43235',
        patient_age: 24,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'Observation',
        arrival_time: '2025-09-29T10:30:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Acute gastritis post-spicy meal',
        assigned_doctor_name: 'Dr. Nivetha',
        er_location: 'Observation Bed 3',
        accompanied_by: 'Self',
        allergies: 'None',
        latest_vitals: { bp: '116/74', hr: 75, spo2: 99, temp: 36.9, time: '10:40 AM' }
      },
      // Cases 17 to 27: In Treatment cases (to complete 18 total In Treatment)
      {
        case_number: 'ER-250929-017',
        patient_health_id: 'HG001252',
        patient_name: 'Vijay Anand',
        patient_phone: '+91 98765 43236',
        patient_age: 41,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'In Treatment',
        arrival_time: '2025-09-29T09:30:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Deep laceration right forearm',
        assigned_doctor_name: 'Dr. Nivetha',
        er_location: 'ER - Bed 11',
        accompanied_by: 'Coworker',
        allergies: 'None',
        latest_vitals: { bp: '128/82', hr: 84, spo2: 98, temp: 36.8, time: '09:45 AM' }
      },
      {
        case_number: 'ER-250929-018',
        patient_health_id: 'HG001253',
        patient_name: 'Geetha L',
        patient_phone: '+91 98765 43237',
        patient_age: 58,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'In Treatment',
        arrival_time: '2025-09-29T09:40:00Z',
        mode_of_arrival: 'Ambulance',
        chief_complaint: 'COPD exacerbation with wheezing',
        assigned_doctor_name: 'Dr. Mohamed',
        er_location: 'ER - Bed 12',
        accompanied_by: 'Son',
        allergies: 'Penicillin',
        latest_vitals: { bp: '142/88', hr: 98, spo2: 93, temp: 37.2, time: '09:55 AM' }
      },
      {
        case_number: 'ER-250929-019',
        patient_health_id: 'HG001254',
        patient_name: 'Manoj Kumar',
        patient_phone: '+91 98765 43238',
        patient_age: 33,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'In Treatment',
        arrival_time: '2025-09-29T09:50:00Z',
        mode_of_arrival: 'Private Vehicle',
        chief_complaint: 'Acute lower limb fracture (closed)',
        assigned_doctor_name: 'Dr. Karthik',
        er_location: 'ER - Bed 14',
        accompanied_by: 'Brother',
        allergies: 'None',
        latest_vitals: { bp: '130/84', hr: 90, spo2: 99, temp: 36.7, time: '10:05 AM' }
      },
      {
        case_number: 'ER-250929-020',
        patient_health_id: 'HG001255',
        patient_name: 'Deepa Narayanan',
        patient_phone: '+91 98765 43239',
        patient_age: 29,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'In Treatment',
        arrival_time: '2025-09-29T10:00:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Intractable migraine with vomiting',
        assigned_doctor_name: 'Dr. Arjun',
        er_location: 'ER - Bed 15',
        accompanied_by: 'Spouse',
        allergies: 'None',
        latest_vitals: { bp: '122/78', hr: 82, spo2: 98, temp: 36.9, time: '10:15 AM' }
      },
      {
        case_number: 'ER-250929-021',
        patient_health_id: 'HG001256',
        patient_name: 'Chandran T',
        patient_phone: '+91 98765 43240',
        patient_age: 70,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'In Treatment',
        arrival_time: '2025-09-29T10:15:00Z',
        mode_of_arrival: 'Ambulance',
        chief_complaint: 'Congestive heart failure fluid overload',
        assigned_doctor_name: 'Dr. Revathi',
        er_location: 'ER - Bed 16',
        accompanied_by: 'Daughter',
        allergies: 'None',
        latest_vitals: { bp: '150/95', hr: 100, spo2: 92, temp: 37.0, time: '10:30 AM' }
      },
      {
        case_number: 'ER-250929-022',
        patient_health_id: 'HG001257',
        patient_name: 'Swathi R',
        patient_phone: '+91 98765 43241',
        patient_age: 26,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'In Treatment',
        arrival_time: '2025-09-29T10:30:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Acute sprained ankle following slip',
        assigned_doctor_name: 'Dr. Karthik',
        er_location: 'ER - Bed 17',
        accompanied_by: 'Self',
        allergies: 'None',
        latest_vitals: { bp: '118/75', hr: 78, spo2: 99, temp: 36.6, time: '10:45 AM' }
      },
      {
        case_number: 'ER-250929-023',
        patient_health_id: 'HG001258',
        patient_name: 'Balaji K',
        patient_phone: '+91 98765 43242',
        patient_age: 44,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'In Treatment',
        arrival_time: '2025-09-29T10:45:00Z',
        mode_of_arrival: 'Private Vehicle',
        chief_complaint: 'Diabetic ketoacidosis warning signs',
        assigned_doctor_name: 'Dr. Arjun',
        er_location: 'ER - Bed 18',
        accompanied_by: 'Wife',
        allergies: 'None',
        latest_vitals: { bp: '132/86', hr: 104, spo2: 96, temp: 37.3, time: '11:00 AM' }
      },
      {
        case_number: 'ER-250929-024',
        patient_health_id: 'HG001259',
        patient_name: 'Pooja V',
        patient_phone: '+91 98765 43243',
        patient_age: 22,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'In Treatment',
        arrival_time: '2025-09-29T11:00:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Minor thermal burn on forearm from cooking',
        assigned_doctor_name: 'Dr. Nivetha',
        er_location: 'ER - Bed 19',
        accompanied_by: 'Mother',
        allergies: 'None',
        latest_vitals: { bp: '115/72', hr: 76, spo2: 99, temp: 36.7, time: '11:10 AM' }
      },
      {
        case_number: 'ER-250929-025',
        patient_health_id: 'HG001260',
        patient_name: 'Gopalakrishnan S',
        patient_phone: '+91 98765 43244',
        patient_age: 68,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'In Treatment',
        arrival_time: '2025-09-29T11:15:00Z',
        mode_of_arrival: 'Wheelchair',
        chief_complaint: 'Acute urinary retention with pain',
        assigned_doctor_name: 'Dr. Mohamed',
        er_location: 'ER - Bed 20',
        accompanied_by: 'Son',
        allergies: 'None',
        latest_vitals: { bp: '144/90', hr: 88, spo2: 97, temp: 37.0, time: '11:25 AM' }
      },
      {
        case_number: 'ER-250929-026',
        patient_health_id: 'HG001261',
        patient_name: 'Revathi Murugan',
        patient_phone: '+91 98765 43245',
        patient_age: 37,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'In Treatment',
        arrival_time: '2025-09-29T11:30:00Z',
        mode_of_arrival: 'Private Vehicle',
        chief_complaint: 'Severe vertigo with nystagmus',
        assigned_doctor_name: 'Dr. Priya',
        er_location: 'ER - Bed 21',
        accompanied_by: 'Husband',
        allergies: 'None',
        latest_vitals: { bp: '128/80', hr: 82, spo2: 98, temp: 36.8, time: '11:40 AM' }
      },
      {
        case_number: 'ER-250929-027',
        patient_health_id: 'HG001262',
        patient_name: 'Naveen Kumar',
        patient_phone: '+91 98765 43246',
        patient_age: 30,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'In Treatment',
        arrival_time: '2025-09-29T11:45:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Corneal foreign body sensation',
        assigned_doctor_name: 'Dr. Nivetha',
        er_location: 'ER - Bed 22',
        accompanied_by: 'Self',
        allergies: 'None',
        latest_vitals: { bp: '122/76', hr: 74, spo2: 99, temp: 36.7, time: '11:55 AM' }
      },
      // Cases 28 to 32: Triage / Rapid Assessment cases (totaling 32 active patients in casualty)
      {
        case_number: 'ER-250929-028',
        patient_health_id: 'HG001263',
        patient_name: 'Karpagam S',
        patient_phone: '+91 98765 43247',
        patient_age: 51,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'Triage',
        arrival_time: '2025-09-29T12:00:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Palpitations with anxiety',
        assigned_doctor_name: 'Dr. Revathi',
        er_location: 'Triage Bay 1',
        accompanied_by: 'Daughter',
        allergies: 'None',
        latest_vitals: { bp: '136/86', hr: 110, spo2: 98, temp: 36.9, time: '12:10 PM' }
      },
      {
        case_number: 'ER-250929-029',
        patient_health_id: 'HG001264',
        patient_name: 'Dinesh Babu',
        patient_phone: '+91 98765 43248',
        patient_age: 39,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'Triage',
        arrival_time: '2025-09-29T12:15:00Z',
        mode_of_arrival: 'Private Vehicle',
        chief_complaint: 'Suspected acute pancreatitis',
        assigned_doctor_name: 'Dr. Arjun',
        er_location: 'Triage Bay 2',
        accompanied_by: 'Friend',
        allergies: 'None',
        latest_vitals: { bp: '138/88', hr: 94, spo2: 97, temp: 37.4, time: '12:25 PM' }
      },
      {
        case_number: 'ER-250929-030',
        patient_health_id: 'HG001265',
        patient_name: 'Usha Rani',
        patient_phone: '+91 98765 43249',
        patient_age: 46,
        patient_gender: 'Female',
        patient_avatar: '',
        triage_level: 'Green',
        status: 'Triage',
        arrival_time: '2025-09-29T12:20:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Epistaxis (nosebleed) controlled with packing',
        assigned_doctor_name: 'Dr. Karthik',
        er_location: 'Triage Bay 3',
        accompanied_by: 'Husband',
        allergies: 'None',
        latest_vitals: { bp: '140/88', hr: 84, spo2: 98, temp: 36.8, time: '12:30 PM' }
      },
      {
        case_number: 'ER-250929-031',
        patient_health_id: 'HG001266',
        patient_name: 'Mohanraj P',
        patient_phone: '+91 98765 43250',
        patient_age: 35,
        patient_gender: 'Male',
        patient_avatar: '',
        triage_level: 'Yellow',
        status: 'Triage',
        arrival_time: '2025-09-29T12:30:00Z',
        mode_of_arrival: 'Ambulance',
        chief_complaint: 'Syncope episode at workplace',
        assigned_doctor_name: 'Dr. Priya',
        er_location: 'Triage Bay 4',
        accompanied_by: 'Colleague',
        allergies: 'None',
        latest_vitals: { bp: '105/65', hr: 62, spo2: 98, temp: 36.6, time: '12:40 PM' }
      },
      {
        case_number: 'ER-250929-032',
        patient_health_id: 'HG-PP27BNQ',
        patient_name: 'Mohamed Sameen',
        patient_phone: '+91 93841 80516',
        patient_age: 20,
        patient_gender: 'Male',
        patient_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        triage_level: 'Green',
        status: 'Triage',
        arrival_time: '2025-09-29T12:40:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Mild fever and dehydration post-sports',
        assigned_doctor_name: 'Dr. Mohamed',
        er_location: 'Triage Bay 5',
        accompanied_by: 'Self',
        allergies: 'No known allergies',
        latest_vitals: { bp: '120/78', hr: 78, spo2: 99, temp: 37.1, time: '12:45 PM' }
      }
    ];

    // Seed 12 Discharged cases (for the Discharged tab count)
    for (let i = 1; i <= 12; i++) {
      emergencyCasesToSeed.push({
        case_number: `ER-250928-${String(i).padStart(3, '0')}`,
        patient_health_id: `HG-DISCH-${i}`,
        patient_name: `Discharged Patient ${i}`,
        patient_phone: `+91 98765 990${String(i).padStart(2, '0')}`,
        patient_age: 25 + (i * 3),
        patient_gender: i % 2 === 0 ? 'Female' : 'Male',
        patient_avatar: '',
        triage_level: i % 3 === 0 ? 'Yellow' : 'Green',
        status: 'Discharged',
        arrival_time: '2025-09-28T08:00:00Z',
        mode_of_arrival: 'Walk-in',
        chief_complaint: 'Minor ailment resolved in casualty',
        assigned_doctor_name: 'Dr. Mohamed',
        er_location: 'Discharged',
        accompanied_by: 'Family',
        allergies: 'None',
        latest_vitals: { bp: '120/80', hr: 72, spo2: 99, temp: 36.8, time: '02:00 PM' },
        discharged_at: '2025-09-28T14:30:00Z'
      });
    }

    console.log(`Seeding ${emergencyCasesToSeed.length} emergency cases...`);

    for (const ec of emergencyCasesToSeed) {
      const patientId = patientMap[ec.patient_health_id]?.id || null;
      const doctorId = doctorMap[ec.assigned_doctor_name]?.id || null;

      await client.query(`
        INSERT INTO public.emergency_cases (
          case_number, patient_id, patient_health_id, patient_name, patient_phone,
          patient_age, patient_gender, patient_avatar, triage_level, status,
          arrival_time, mode_of_arrival, chief_complaint, assigned_doctor_id, assigned_doctor_name,
          er_location, accompanied_by, allergies, latest_vitals, vitals_history,
          treatment_orders, clinical_notes, investigations_ordered, discharged_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (case_number) DO UPDATE SET
          patient_name = EXCLUDED.patient_name,
          triage_level = EXCLUDED.triage_level,
          status = EXCLUDED.status,
          chief_complaint = EXCLUDED.chief_complaint,
          er_location = EXCLUDED.er_location,
          latest_vitals = EXCLUDED.latest_vitals,
          updated_at = NOW();
      `, [
        ec.case_number,
        patientId,
        ec.patient_health_id,
        ec.patient_name,
        ec.patient_phone || '',
        ec.patient_age || 30,
        ec.patient_gender || 'Male',
        ec.patient_avatar || '',
        ec.triage_level,
        ec.status,
        ec.arrival_time,
        ec.mode_of_arrival,
        ec.chief_complaint,
        doctorId,
        ec.assigned_doctor_name,
        ec.er_location,
        ec.accompanied_by || '',
        ec.allergies || 'No known allergies',
        JSON.stringify(ec.latest_vitals || {}),
        JSON.stringify(ec.vitals_history || []),
        JSON.stringify(ec.treatment_orders || []),
        JSON.stringify(ec.clinical_notes || []),
        JSON.stringify(ec.investigations_ordered || []),
        ec.discharged_at || null
      ]);
    }

    console.log('Successfully seeded all 44 emergency cases (32 active ER census + 12 discharged)!');

    // Quick verification query
    const countRes = await client.query(`
      SELECT 
        status, 
        triage_level, 
        COUNT(*) as count 
      FROM public.emergency_cases 
      GROUP BY status, triage_level;
    `);
    console.log('Emergency cases summary in Supabase:');
    console.table(countRes.rows);

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

runEmergencyMigrationAndSeed();
