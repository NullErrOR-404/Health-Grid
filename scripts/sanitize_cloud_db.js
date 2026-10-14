const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function sanitizeCloudDb() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to PostgreSQL for cloud database sanitization.');

  try {
    await client.query('BEGIN;');

    // 1. Purge all mock/fake appointments
    const delAppts = await client.query(`
      DELETE FROM public.appointments
      WHERE patient_health_id LIKE 'HG001%'
         OR patient_health_id LIKE 'HG-001%'
         OR patient_health_id = 'HG001245'
         OR patient_health_id = 'HG001244'
         OR patient_health_id = 'HG001243'
         OR patient_health_id = 'HG001242'
         OR patient_health_id = 'HG001241'
         OR patient_health_id = 'HG001240'
         OR patient_name IN ('Sameer Ahmed', 'Lakshmi Priya', 'Rajesh Kumar', 'Meena R', 'Arun Prakash', 'Fathima Begum', 'Vignesh S', 'Kavitha N', 'Suresh Babu', 'Priya Sharma')
         OR patient_health_id NOT IN ('HG-PP27BNQ', 'HG-64XBAAG', 'HG-VL4M5MK');
    `);
    console.log(`✓ Purged ${delAppts.rowCount} fake/unregistered appointments from public.appointments.`);

    // 2. Purge all mock IPD admissions
    const delIpd = await client.query(`
      DELETE FROM public.ipd_admissions
      WHERE patient_health_id NOT IN ('HG-PP27BNQ', 'HG-64XBAAG', 'HG-VL4M5MK');
    `);
    console.log(`✓ Purged ${delIpd.rowCount} fake admissions from public.ipd_admissions.`);

    // 3. Purge all fake emergency cases
    const delEr = await client.query(`
      DELETE FROM public.emergency_cases
      WHERE patient_health_id NOT IN ('HG-PP27BNQ', 'HG-64XBAAG', 'HG-VL4M5MK');
    `);
    console.log(`✓ Purged ${delEr.rowCount} fake casualty cases from public.emergency_cases.`);

    // 4. Sanitize all IPD beds: reset to Available, clear fake occupant names
    const updateBeds = await client.query(`
      UPDATE public.ipd_beds
      SET status = 'Available',
          current_patient_health_id = null,
          current_patient_name = null,
          updated_at = NOW();
    `);
    console.log(`✓ Sanitized ${updateBeds.rowCount} beds in public.ipd_beds: all reset to Available.`);

    // 5. Ensure IPD wards are clean
    const wards = await client.query(`SELECT ward_code, name, total_beds FROM public.ipd_wards;`);
    console.log('✓ Active Facility Wards:', wards.rows);

    // 6. Verify real patients
    const patients = await client.query(`SELECT id, health_id, full_name, email FROM public.patients;`);
    console.log('✓ Verified Real Patient Accounts in Cloud:', patients.rows);

    // 7. Verify doctors
    const doctors = await client.query(`SELECT id, name, department, designation FROM public.doctors LIMIT 5;`);
    console.log('✓ Verified Doctors in Cloud (Sample 5 of total):', doctors.rows);

    await client.query('COMMIT;');
    console.log('🎉 Cloud Database Sanitization Committed Successfully!');
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('❌ Sanitization failed, transaction rolled back:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

sanitizeCloudDb().catch(console.error);
