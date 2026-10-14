const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function purgeMockData() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to PostgreSQL for mock data purging.');

  try {
    await client.query('BEGIN;');

    // 1. Identify mock patient IDs
    const mockRes = await client.query(`
      SELECT id, health_id, full_name, email 
      FROM public.patients 
      WHERE health_id LIKE 'HG-001%' 
         OR (email LIKE '%@healthgrid.in' AND email != 'dr.mohamed@healthgrid.in');
    `);

    const mockIds = mockRes.rows.map(r => r.id);
    console.log(`Identified ${mockIds.length} mock patient records to purge.`);

    if (mockIds.length > 0) {
      const idList = mockIds.map(id => `'${id}'`).join(',');

      // 2. Delete dependent mock rows across clinical tables
      await client.query(`DELETE FROM public.clinical_orders WHERE patient_id IN (${idList});`);
      await client.query(`DELETE FROM public.prescriptions WHERE patient_id IN (${idList}) OR user_id IN (${idList});`);
      await client.query(`DELETE FROM public.encounters WHERE patient_id IN (${idList});`);
      await client.query(`DELETE FROM public.ipd_admissions WHERE patient_health_id LIKE 'HG-001%';`);
      await client.query(`DELETE FROM public.emergency_cases WHERE patient_id IN (${idList}) OR patient_health_id LIKE 'HG-001%';`);
      await client.query(`DELETE FROM public.appointments WHERE patient_id IN (${idList}) OR patient_health_id LIKE 'HG-001%';`);
      await client.query(`DELETE FROM public.user_roles WHERE user_id IN (${idList}) AND role = 'CITIZEN';`);

      // 3. Delete from public.patients
      const delPatients = await client.query(`DELETE FROM public.patients WHERE id IN (${idList});`);
      console.log(`Deleted ${delPatients.rowCount} mock rows from public.patients.`);
    }

    // 4. Ensure real authentic user Monesh is synced
    await client.query(`
      DELETE FROM public.patients WHERE id = '61e919d6-5862-4066-8396-0a077eeacc0e';
    `);
    await client.query(`
      INSERT INTO public.patients (
        id, health_id, full_name, email, phone_number, age, gender, blood_group, location, role, created_at, updated_at
      ) VALUES (
        '61e919d6-5862-4066-8396-0a077eeacc0e',
        'HG-64XBAAG',
        'Moneshdaran S',
        'moneshmd5@gmail.com',
        '+91 98765 43210',
        23,
        'Male',
        'O+',
        'Chennai, TN',
        'CITIZEN',
        NOW(),
        NOW()
      );
    `);

    await client.query(`
      DELETE FROM public.user_roles WHERE user_id = '61e919d6-5862-4066-8396-0a077eeacc0e';
    `);
    await client.query(`
      INSERT INTO public.user_roles (user_id, role, user_type, full_name)
      VALUES ('61e919d6-5862-4066-8396-0a077eeacc0e', 'CITIZEN', 'PATIENT', 'Moneshdaran S');
    `);

    await client.query('COMMIT;');
    console.log('Transaction committed successfully.');

    // 5. Final audit of public.patients
    const remaining = await client.query('SELECT id, health_id, full_name, email, role FROM public.patients ORDER BY full_name ASC;');
    console.log(`Remaining authentic accounts in public.patients (${remaining.rows.length}):`);
    console.table(remaining.rows);

  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('Error during purge, rolled back:', err);
  } finally {
    await client.end();
  }
}

purgeMockData().catch(console.error);
