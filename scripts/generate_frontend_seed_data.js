const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function generate() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL.');

  const { rows: patients } = await client.query('SELECT * FROM public.patients ORDER BY health_id ASC;');
  console.log(`Fetched ${patients.length} patients from database.`);

  const { rows: appointments } = await client.query("SELECT * FROM public.appointments WHERE appointment_date = '2026-10-09' ORDER BY appointment_time ASC;");
  console.log(`Fetched ${appointments.length} appointments for today from database.`);

  const outputPath = path.join(__dirname, '../frontend/src/services/generatedPatientsData.ts');

  const content = `// ==============================================================================
// HealthGrid Authentic 50 Real Database Patients & Linked Appointments
// Generated directly from Supabase PostgreSQL public.patients & public.appointments
// Matches DB UUIDs, HealthIDs, Roles and Real Clinical Records
// ==============================================================================

export interface DatabasePatientRecord {
  id: string;
  health_id: string;
  full_name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  blood_group: string;
  phone_number: string;
  email: string;
  location: string;
  dob: string;
  chronic_conditions: string[];
  known_allergies: string[];
  current_medications: Array<{ name: string; dosage?: string; timing?: string }>;
  emergency_contacts: Array<{ name: string; relation: string; phone: string }>;
  role: string;
  created_at: string;
}

export interface DatabaseAppointmentRecord {
  id: string;
  appointment_id: string;
  patient_id: string;
  patient_health_id: string;
  patient_name: string;
  patient_phone: string;
  patient_age: number;
  patient_gender: string;
  doctor_id: string;
  doctor_name: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  reason_for_visit: string;
  notes: string;
  consultation_fee: number;
  payment_status: string;
  source: string;
}

export const AUTHENTIC_PATIENTS_50: DatabasePatientRecord[] = ${JSON.stringify(patients, null, 2)};

export const AUTHENTIC_APPOINTMENTS_TODAY: DatabaseAppointmentRecord[] = ${JSON.stringify(appointments, null, 2)};
`;

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`Successfully written ${patients.length} patients to ${outputPath}`);

  await client.end();
}

generate().catch(console.error);
