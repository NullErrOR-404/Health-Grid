const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function runTests() {
  await client.connect();
  console.log('✓ Connected to Supabase PostgreSQL for automated verification.\n');

  // Test 1: Verify public.roles table exists
  const tableCheck = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'roles';
  `);
  if (tableCheck.rows.length === 0) {
    throw new Error('FAIL: public.roles table does not exist!');
  }
  console.log('✓ PASS: public.roles table exists in PostgreSQL.');

  // Test 2: Verify gmch_admin has role 'superadmin'
  const gmchCheck = await client.query(`
    SELECT id, username, role, full_name, hospital_code, status 
    FROM public.roles 
    WHERE username = 'gmch_admin';
  `);
  if (gmchCheck.rows.length === 0) {
    throw new Error('FAIL: gmch_admin account not found in public.roles!');
  }
  const gmch = gmchCheck.rows[0];
  console.log('✓ PASS: gmch_admin record found:', gmch);
  if (gmch.role !== 'superadmin') {
    throw new Error(`FAIL: gmch_admin role is "${gmch.role}", expected "superadmin"!`);
  }
  console.log('✓ PASS: gmch_admin is confirmed as superadmin.');

  // Test 3: Test dynamic account creation with custom UUID and password
  const testUuid = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
  const testUsername = `test_nurse_${Date.now().toString().slice(-4)}`;
  const testPassword = 'TestPassword#2026';
  const testRole = 'nurse';

  console.log(`\nTesting dynamic account creation: @${testUsername} with UUID ${testUuid}...`);
  await client.query(`
    INSERT INTO public.roles (
      id, username, password, full_name, email, role, hospital_code, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE');
  `, [
    testUuid,
    testUsername,
    testPassword,
    'Nurse Kavitha Test',
    `${testUsername}@healthgrid.in`,
    testRole,
    'HG-H002'
  ]);

  const inserted = await client.query(`SELECT * FROM public.roles WHERE id = $1;`, [testUuid]);
  if (inserted.rows.length === 0) {
    throw new Error('FAIL: Dynamic account was not inserted into public.roles!');
  }
  console.log('✓ PASS: Dynamic account inserted successfully into Supabase:', {
    id: inserted.rows[0].id,
    username: inserted.rows[0].username,
    role: inserted.rows[0].role,
    full_name: inserted.rows[0].full_name
  });

  // Test 4: Verify querying all roles
  const allRoles = await client.query(`SELECT id, username, role, hospital_code FROM public.roles ORDER BY created_at;`);
  console.log(`\n✓ PASS: Retrieved all ${allRoles.rows.length} accounts from public.roles:`);
  console.table(allRoles.rows);

  // Test 5: Clean up test account
  await client.query(`DELETE FROM public.roles WHERE id = $1;`, [testUuid]);
  console.log('✓ PASS: Cleaned up test account successfully.');

  await client.end();
  console.log('\n=============================================');
  console.log('🎉 ALL DATABASE VERIFICATION TESTS PASSED 100%');
  console.log('=============================================\n');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
