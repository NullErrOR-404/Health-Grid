const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function runMigrationAndSeed() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    // 1. Ensure doctors table has Dr. Karthik and Dr. Nivetha
    const extraDoctors = [
      { name: 'Dr. Karthik', department: 'Orthopaedics', designation: 'Senior Consultant', qualification: 'MBBS, MS Ortho', opd_room: 'Room 204' },
      { name: 'Dr. Nivetha', department: 'Dermatology', designation: 'Consultant Dermatologist', qualification: 'MBBS, MD DVL', opd_room: 'Room 108' }
    ];

    for (const doc of extraDoctors) {
      await client.query(`
        INSERT INTO public.doctors (name, department, designation, qualification, opd_room, is_available)
        SELECT $1, $2, $3, $4, $5, true
        WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = $1);
      `, [doc.name, doc.department, doc.designation, doc.qualification, doc.opd_room]);
    }
    console.log('Doctors verified/updated.');

    // Fetch doctors mapping
    const doctorsRes = await client.query('SELECT id, name, department FROM public.doctors;');
    const doctorMap = {};
    for (const d of doctorsRes.rows) {
      doctorMap[d.name] = d;
    }

    // 2. Upsert Reference Patients in public.patients
    const referencePatients = [
      {
        health_id: 'HG001245',
        full_name: 'Sameer Ahmed',
        phone_number: '+91 98765 43210',
        age: 20,
        gender: 'Male',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        blood_group: 'B+',
        chronic_conditions: ['None'],
        known_allergies: ['Penicillin']
      },
      {
        health_id: 'HG001244',
        full_name: 'Lakshmi Priya',
        phone_number: '+91 98765 43211',
        age: 34,
        gender: 'Female',
        avatar_url: '',
        blood_group: 'O+',
        chronic_conditions: ['Hypertension'],
        known_allergies: ['Sulfa drugs']
      },
      {
        health_id: 'HG001243',
        full_name: 'Rajesh Kumar',
        phone_number: '+91 98765 43212',
        age: 45,
        gender: 'Male',
        avatar_url: '',
        blood_group: 'A+',
        chronic_conditions: ['Type 2 Diabetes'],
        known_allergies: ['None']
      },
      {
        health_id: 'HG001242',
        full_name: 'Meena R',
        phone_number: '+91 98765 43213',
        age: 28,
        gender: 'Female',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        blood_group: 'B-',
        chronic_conditions: ['None'],
        known_allergies: ['Dust / Pollen']
      },
      {
        health_id: 'HG001241',
        full_name: 'Arun Prakash',
        phone_number: '+91 98765 43214',
        age: 62,
        gender: 'Male',
        avatar_url: '',
        blood_group: 'AB+',
        chronic_conditions: ['Osteoarthritis'],
        known_allergies: ['NSAIDs']
      },
      {
        health_id: 'HG001240',
        full_name: 'Fathima Begum',
        phone_number: '+91 98765 43215',
        age: 50,
        gender: 'Female',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        blood_group: 'O-',
        chronic_conditions: ['Dyslipidemia'],
        known_allergies: ['None']
      },
      {
        health_id: 'HG001239',
        full_name: 'Vignesh S',
        phone_number: '+91 98765 43216',
        age: 36,
        gender: 'Male',
        avatar_url: '',
        blood_group: 'A-',
        chronic_conditions: ['Psoriasis'],
        known_allergies: ['None']
      },
      {
        health_id: 'HG001238',
        full_name: 'Kavitha N',
        phone_number: '+91 98765 43217',
        age: 40,
        gender: 'Female',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
        blood_group: 'B+',
        chronic_conditions: ['Hypothyroidism'],
        known_allergies: ['None']
      },
      {
        health_id: 'HG001237',
        full_name: 'Suresh Babu',
        phone_number: '+91 98765 43218',
        age: 55,
        gender: 'Male',
        avatar_url: '',
        blood_group: 'O+',
        chronic_conditions: ['Chronic Kidney Disease (Stage 2)'],
        known_allergies: ['Contrast Dye']
      },
      {
        health_id: 'HG001236',
        full_name: 'Divya R',
        phone_number: '+91 98765 43219',
        age: 31,
        gender: 'Female',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
        blood_group: 'A+',
        chronic_conditions: ['Mild Asthma'],
        known_allergies: ['Aspirin']
      },
      {
        health_id: 'HG-PP27BNQ',
        full_name: 'Mohamed Sameen',
        phone_number: '+91 93841 80516',
        age: 20,
        gender: 'Male',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        blood_group: 'B+',
        chronic_conditions: ['None'],
        known_allergies: ['None']
      }
    ];

    const patientMap = {};
    for (const pat of referencePatients) {
      const existing = await client.query('SELECT id FROM public.patients WHERE health_id = $1 LIMIT 1;', [pat.health_id]);
      let patId;
      if (existing.rows.length > 0) {
        patId = existing.rows[0].id;
        await client.query(`
          UPDATE public.patients SET
            full_name = $2, phone_number = $3, age = $4, gender = $5, avatar_url = $6, blood_group = $7,
            chronic_conditions = $8, known_allergies = $9
          WHERE id = $1;
        `, [patId, pat.full_name, pat.phone_number, pat.age, pat.gender, pat.avatar_url, pat.blood_group, pat.chronic_conditions, pat.known_allergies]);
      } else {
        const ins = await client.query(`
          INSERT INTO public.patients (
            health_id, full_name, phone_number, age, gender, avatar_url, blood_group, chronic_conditions, known_allergies
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id;
        `, [pat.health_id, pat.full_name, pat.phone_number, pat.age, pat.gender, pat.avatar_url, pat.blood_group, pat.chronic_conditions, pat.known_allergies]);
        patId = ins.rows[0].id;
      }
      patientMap[pat.health_id] = { id: patId, health_id: pat.health_id, full_name: pat.full_name };
    }
    console.log('Reference patients upserted.');

    // 3. Create public.appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        appointment_id TEXT UNIQUE NOT NULL,
        patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
        patient_health_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_phone TEXT,
        patient_age INTEGER,
        patient_gender TEXT,
        patient_avatar TEXT,
        doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
        doctor_name TEXT NOT NULL,
        department TEXT NOT NULL,
        appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        appointment_time TEXT NOT NULL,
        appointment_type TEXT NOT NULL DEFAULT 'Consultation',
        status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (
          status IN ('Scheduled', 'Confirmed', 'Checked In', 'Waiting', 'In Consultation', 'Completed', 'Cancelled', 'No Show')
        ),
        checked_in_at TIMESTAMPTZ,
        source TEXT DEFAULT 'Online Booking',
        reason_for_visit TEXT,
        notes TEXT,
        clinical_observations TEXT,
        cancellation_reason TEXT,
        rescheduled_from TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Created public.appointments table.');

    // 4. Configure RLS Policies
    await client.query(`
      ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Permissive appointments access" ON public.appointments;
      CREATE POLICY "Permissive appointments access" ON public.appointments
        FOR ALL USING (true) WITH CHECK (true);
    `);
    console.log('RLS configured for appointments.');

    // 5. Add to realtime publication if not already added
    try {
      await client.query(`
        ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
      `);
      console.log('Added public.appointments to supabase_realtime');
    } catch (e) {
      if (e.message && e.message.includes('already in publication')) {
        console.log('public.appointments already in publication');
      } else {
        console.log('Publication notice:', e.message);
      }
    }

    // 6. Clear and seed appointments matching reference image
    await client.query('DELETE FROM public.appointments;');

    // Reference table date: 2025-09-29 or today
    const todayStr = '2025-09-29';

    const seedAppointments = [
      {
        appointment_id: 'APPT250929001',
        health_id: 'HG001245',
        patient_name: 'Sameer Ahmed',
        patient_phone: '+91 98765 43210',
        patient_age: 20,
        patient_gender: 'Male',
        patient_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        doctor_name: 'Dr. Mohamed',
        department: 'General Medicine',
        appointment_date: todayStr,
        appointment_time: '09:00 AM',
        appointment_type: 'Consultation',
        status: 'Checked In',
        checked_in_at: '2025-09-29T08:52:00Z',
        source: 'Online Booking',
        reason_for_visit: 'Persistent low-grade fever with mild headache for 3 days.',
        notes: 'Patient arrived 8 min early. Temperature 99.1°F recorded at triage.'
      },
      {
        appointment_id: 'APPT250929002',
        health_id: 'HG001244',
        patient_name: 'Lakshmi Priya',
        patient_phone: '+91 98765 43211',
        patient_age: 34,
        patient_gender: 'Female',
        patient_avatar: '',
        doctor_name: 'Dr. Revathi',
        department: 'Cardiology',
        appointment_date: todayStr,
        appointment_time: '09:30 AM',
        appointment_type: 'Follow-up',
        status: 'Waiting',
        checked_in_at: '2025-09-29T09:25:00Z',
        source: 'Online Booking',
        reason_for_visit: 'Follow-up on post-angioplasty medication adherence and BP evaluation.',
        notes: 'ECG report from last month attached in documents.'
      },
      {
        appointment_id: 'APPT250929003',
        health_id: 'HG001243',
        patient_name: 'Rajesh Kumar',
        patient_phone: '+91 98765 43212',
        patient_age: 45,
        patient_gender: 'Male',
        patient_avatar: '',
        doctor_name: 'Dr. Arjun',
        department: 'Diabetology',
        appointment_date: todayStr,
        appointment_time: '10:00 AM',
        appointment_type: 'Consultation',
        status: 'Waiting',
        checked_in_at: '2025-09-29T09:50:00Z',
        source: 'Online Booking',
        reason_for_visit: 'Fasting blood glucose fluctuations and periodic dizziness.',
        notes: 'HbA1c test requested by nurse.'
      },
      {
        appointment_id: 'APPT250929004',
        health_id: 'HG001242',
        patient_name: 'Meena R',
        patient_phone: '+91 98765 43213',
        patient_age: 28,
        patient_gender: 'Female',
        patient_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        doctor_name: 'Dr. Priya',
        department: 'Gynaecology',
        appointment_date: todayStr,
        appointment_time: '10:30 AM',
        appointment_type: 'Consultation',
        status: 'In Consultation',
        checked_in_at: '2025-09-29T10:15:00Z',
        source: 'Walk-in',
        reason_for_visit: 'Routine trimester prenatal checkup and ultrasound scan review.',
        notes: 'Currently in consultation room with Dr. Priya.'
      },
      {
        appointment_id: 'APPT250929005',
        health_id: 'HG001241',
        patient_name: 'Arun Prakash',
        patient_phone: '+91 98765 43214',
        patient_age: 62,
        patient_gender: 'Male',
        patient_avatar: '',
        doctor_name: 'Dr. Karthik',
        department: 'Orthopaedics',
        appointment_date: todayStr,
        appointment_time: '11:00 AM',
        appointment_type: 'Follow-up',
        status: 'Waiting',
        checked_in_at: '2025-09-29T10:45:00Z',
        source: 'Online Booking',
        reason_for_visit: 'Right knee mobility stiffness post physiotherapy exercises.',
        notes: 'X-ray knee AP/Lateral scheduled.'
      },
      {
        appointment_id: 'APPT250929006',
        health_id: 'HG001240',
        patient_name: 'Fathima Begum',
        patient_phone: '+91 98765 43215',
        patient_age: 50,
        gender: 'Female',
        patient_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        doctor_name: 'Dr. Mohamed',
        department: 'General Medicine',
        appointment_date: todayStr,
        appointment_time: '11:30 AM',
        appointment_type: 'Consultation',
        status: 'Scheduled',
        checked_in_at: null,
        source: 'Online Booking',
        reason_for_visit: 'Chronic fatigue and seasonal allergic rhinitis evaluation.',
        notes: 'Confirmed via automated SMS reminder.'
      },
      {
        appointment_id: 'APPT250929007',
        health_id: 'HG001239',
        patient_name: 'Vignesh S',
        patient_phone: '+91 98765 43216',
        patient_age: 36,
        patient_gender: 'Male',
        patient_avatar: '',
        doctor_name: 'Dr. Nivetha',
        department: 'Dermatology',
        appointment_date: todayStr,
        appointment_time: '12:00 PM',
        appointment_type: 'Consultation',
        status: 'Scheduled',
        checked_in_at: null,
        source: 'Online Booking',
        reason_for_visit: 'Dry erythematous patches on bilateral elbows and scalp.',
        notes: 'Patient requested topical prescription advice.'
      },
      {
        appointment_id: 'APPT250929008',
        health_id: 'HG001238',
        patient_name: 'Kavitha N',
        patient_phone: '+91 98765 43217',
        patient_age: 40,
        patient_gender: 'Female',
        patient_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
        doctor_name: 'Dr. Arjun',
        department: 'Endocrinology',
        appointment_date: todayStr,
        appointment_time: '12:30 PM',
        appointment_type: 'Follow-up',
        status: 'Confirmed',
        checked_in_at: null,
        source: 'Online Booking',
        reason_for_visit: 'Thyroid profile adjustment and TSH evaluation.',
        notes: 'Reports ready on LIS portal.'
      },
      {
        appointment_id: 'APPT250929009',
        health_id: 'HG001237',
        patient_name: 'Suresh Babu',
        patient_phone: '+91 98765 43218',
        patient_age: 55,
        patient_gender: 'Male',
        patient_avatar: '',
        doctor_name: 'Dr. Priya',
        department: 'Nephrology',
        appointment_date: todayStr,
        appointment_time: '01:00 PM',
        appointment_type: 'Consultation',
        status: 'Confirmed',
        checked_in_at: null,
        source: 'Online Booking',
        reason_for_visit: 'Serum creatinine monitoring and dietary salt review.',
        notes: 'Hydration advisory given during last visit.'
      },
      {
        appointment_id: 'APPT250929010',
        health_id: 'HG001236',
        patient_name: 'Divya R',
        patient_phone: '+91 98765 43219',
        patient_age: 31,
        patient_gender: 'Female',
        patient_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
        doctor_name: 'Dr. Karthik',
        department: 'Pulmonology',
        appointment_date: todayStr,
        appointment_time: '01:30 PM',
        appointment_type: 'Consultation',
        status: 'Scheduled',
        checked_in_at: null,
        source: 'Online Booking',
        reason_for_visit: 'Nocturnal cough and seasonal wheezing exacerbation.',
        notes: 'Spirometry test pre-booked.'
      },
      // Citizen profile account Mohamed Sameen
      {
        appointment_id: 'APPT250929011',
        health_id: 'HG-PP27BNQ',
        patient_name: 'Mohamed Sameen',
        patient_phone: '+91 93841 80516',
        patient_age: 20,
        patient_gender: 'Male',
        patient_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        doctor_name: 'Dr. Mohamed',
        department: 'General Medicine',
        appointment_date: todayStr,
        appointment_time: '02:00 PM',
        appointment_type: 'Consultation',
        status: 'Confirmed',
        checked_in_at: null,
        source: 'Mobile App',
        reason_for_visit: 'Comprehensive preventive annual health screening and blood test consultation.',
        notes: 'Booked directly via HealthGrid Citizen Mobile App.'
      },
      // Cancelled / No show cases to calibrate metrics
      {
        appointment_id: 'APPT250929012',
        health_id: 'HG001245',
        patient_name: 'Anitha S',
        patient_phone: '+91 98765 43220',
        patient_age: 29,
        patient_gender: 'Female',
        patient_avatar: '',
        doctor_name: 'Dr. Revathi',
        department: 'Cardiology',
        appointment_date: todayStr,
        appointment_time: '08:30 AM',
        appointment_type: 'Consultation',
        status: 'Cancelled',
        checked_in_at: null,
        source: 'Online Booking',
        cancellation_reason: 'Patient rescheduled due to travel conflict.',
        reason_for_visit: 'Palpitations after aerobic exercise.',
        notes: 'Cancelled 2 hours before slot.'
      },
      {
        appointment_id: 'APPT250929013',
        health_id: 'HG001243',
        patient_name: 'Prakash Raj',
        patient_phone: '+91 98765 43221',
        patient_age: 48,
        patient_gender: 'Male',
        patient_avatar: '',
        doctor_name: 'Dr. Mohamed',
        department: 'General Medicine',
        appointment_date: todayStr,
        appointment_time: '08:45 AM',
        appointment_type: 'Consultation',
        status: 'No Show',
        checked_in_at: null,
        source: 'Online Booking',
        cancellation_reason: 'Did not arrive within 30 min of scheduled time.',
        reason_for_visit: 'Routine lipid panel review.',
        notes: 'Two reminder calls unanswered.'
      },
      // Upcoming appointments
      {
        appointment_id: 'APPT250930001',
        health_id: 'HG001245',
        patient_name: 'Sameer Ahmed',
        patient_phone: '+91 98765 43210',
        patient_age: 20,
        patient_gender: 'Male',
        patient_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        doctor_name: 'Dr. Mohamed',
        department: 'General Medicine',
        appointment_date: '2025-09-30',
        appointment_time: '10:00 AM',
        appointment_type: 'Follow-up',
        status: 'Scheduled',
        checked_in_at: null,
        source: 'Online Booking',
        reason_for_visit: 'Follow-up review of blood culture results.',
        notes: 'Scheduled next day.'
      },
      {
        appointment_id: 'APPT251001001',
        health_id: 'HG-PP27BNQ',
        patient_name: 'Mohamed Sameen',
        patient_phone: '+91 93841 80516',
        patient_age: 20,
        patient_gender: 'Male',
        patient_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        doctor_name: 'Dr. Arjun',
        department: 'Diabetology',
        appointment_date: '2025-10-01',
        appointment_time: '11:00 AM',
        appointment_type: 'Consultation',
        status: 'Scheduled',
        checked_in_at: null,
        source: 'Mobile App',
        reason_for_visit: 'Dietary metabolism counseling and fitness biometric review.',
        notes: 'Booked on citizen profile.'
      },
      // Past appointments
      {
        appointment_id: 'APPT250928001',
        health_id: 'HG001244',
        patient_name: 'Lakshmi Priya',
        patient_phone: '+91 98765 43211',
        patient_age: 34,
        patient_gender: 'Female',
        patient_avatar: '',
        doctor_name: 'Dr. Revathi',
        department: 'Cardiology',
        appointment_date: '2025-09-28',
        appointment_time: '02:00 PM',
        appointment_type: 'Consultation',
        status: 'Completed',
        checked_in_at: '2025-09-28T13:50:00Z',
        source: 'Online Booking',
        reason_for_visit: 'Cardiac stress test interpretation.',
        notes: 'Completed. Normal sinus rhythm.'
      }
    ];

    for (const a of seedAppointments) {
      const patId = patientMap[a.health_id]?.id || null;
      const doc = doctorMap[a.doctor_name];
      const docId = doc?.id || null;

      await client.query(`
        INSERT INTO public.appointments (
          appointment_id, patient_id, patient_health_id, patient_name, patient_phone,
          patient_age, patient_gender, patient_avatar, doctor_id, doctor_name, department,
          appointment_date, appointment_time, appointment_type, status, checked_in_at,
          source, reason_for_visit, notes, cancellation_reason
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        );
      `, [
        a.appointment_id, patId, a.health_id, a.patient_name, a.patient_phone,
        a.patient_age, a.patient_gender, a.patient_avatar || '',
        docId, a.doctor_name, a.department,
        a.appointment_date, a.appointment_time, a.appointment_type, a.status, a.checked_in_at,
        a.source, a.reason_for_visit, a.notes, a.cancellation_reason || null
      ]);
    }

    console.log(`Successfully seeded ${seedAppointments.length} appointments.`);

    const countRes = await client.query('SELECT count(*) FROM public.appointments;');
    console.log('Total appointments in database:', countRes.rows[0].count);

  } catch (err) {
    console.error('Error during migration/seed:', err);
    throw err;
  } finally {
    await client.end();
  }
}

runMigrationAndSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
