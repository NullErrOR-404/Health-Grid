const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function setupDoctor() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to PostgreSQL.');

  await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  const email = 'dr.mohamed@healthgrid.in';
  const password = 'Doctor#123';
  const doctorAuthId = 'cb41d3d7-cdae-4f55-b32d-ec4d78085400';

  // 1. Ensure user in auth.users
  await client.query(`
    UPDATE auth.users
    SET encrypted_password = crypt($1, gen_salt('bf')),
        email_confirmed_at = NOW(),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}',
        raw_user_meta_data = '{"full_name":"Dr. Mohamed","role":"DOCTOR","user_type":"CLINICIAN","specialty":"General Medicine","hospital":"Apollo Clinic, Chennai"}',
        updated_at = NOW()
    WHERE id = $2;
  `, [password, doctorAuthId]);
  console.log('Updated auth.users credentials.');

  // 2. Ensure public.user_roles has the DOCTOR role mapped
  await client.query('DELETE FROM public.user_roles WHERE user_id = $1 OR email = $2', [doctorAuthId, email]);
  await client.query(`
    INSERT INTO public.user_roles (user_id, role, user_type, email, full_name, assigned_by)
    VALUES ($1, 'DOCTOR', 'CLINICIAN', $2, 'Dr. Mohamed', 'SYSTEM');
  `, [doctorAuthId, email]);
  console.log('Updated public.user_roles.');

  // 3. Ensure public.doctors has Dr. Mohamed with doctorAuthId
  await client.query(`
    INSERT INTO public.doctors (
      id, name, department, designation, qualification, opd_room, is_available, status, total_slots, booked_slots, role, experience_years
    ) VALUES (
      $1, 'Dr. Mohamed', 'General Medicine', 'Senior Consultant Physician', 'MBBS, MD (Gen Med), MRCP', 'Room 101', true, 'Available', 25, 12, 'DOCTOR', 12
    )
    ON CONFLICT (id)
    DO UPDATE SET
      name = 'Dr. Mohamed',
      department = 'General Medicine',
      designation = 'Senior Consultant Physician',
      qualification = 'MBBS, MD (Gen Med), MRCP',
      opd_room = 'Room 101',
      is_available = true,
      status = 'Available',
      role = 'DOCTOR';
  `, [doctorAuthId]);

  // 4. Update appointments to link to Dr. Mohamed
  const apptRes = await client.query(`
    UPDATE public.appointments 
    SET doctor_id = $1
    WHERE doctor_name ILIKE '%Mohamed%' OR doctor_id = 'fb4867dc-b213-46b7-85a9-c0a7cd03988c';
  `, [doctorAuthId]);
  console.log(`Updated ${apptRes.rowCount} appointments to doctor_id ${doctorAuthId}.`);

  // 5. Test password verification
  const testRes = await client.query(`
    SELECT (encrypted_password = crypt($1, encrypted_password)) AS matches
    FROM auth.users
    WHERE id = $2;
  `, [password, doctorAuthId]);
  console.log('Password verified successfully in PostgreSQL:', testRes.rows[0]?.matches);

  await client.end();
}

setupDoctor().catch(console.error);
