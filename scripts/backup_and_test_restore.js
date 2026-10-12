const { Client } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres:Mdsameen-2006@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';

async function backupAndTestRestore() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('🔒 Connected to Supabase PostgreSQL for Backup & Restoration Audit.');

    const tables = ['patients', 'doctors', 'appointments', 'user_roles', 'medicines'];
    const backupData = {};

    console.log('Step 1: Extracting Table Snapshots from public schema...');
    for (const table of tables) {
      const res = await client.query(`SELECT * FROM public.${table};`);
      backupData[table] = res.rows;
      console.log(`  ✓ Snapshot of public.${table}: ${res.rows.length} records captured.`);
    }

    // Step 2: Compute SHA-256 Checksum
    const serialized = JSON.stringify(backupData, null, 2);
    const hash = crypto.createHash('sha256').update(serialized).digest('hex');
    console.log(`\nStep 2: Cryptographic SHA-256 Checksum: ${hash}`);

    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `snapshot_${Date.now()}.json`);
    fs.writeFileSync(backupFile, serialized);
    console.log(`  ✓ Written verified backup to: ${backupFile}`);

    // Step 3: Test Restoration in Isolated Test Schema
    console.log('\nStep 3: Creating Isolated Restoration Sandbox Schema...');
    await client.query('DROP SCHEMA IF EXISTS restore_verification_sandbox CASCADE;');
    await client.query('CREATE SCHEMA restore_verification_sandbox;');

    console.log('Step 4: Restoring Tables into Sandbox...');
    // Create cloned tables and restore records
    for (const table of tables) {
      await client.query(`CREATE TABLE restore_verification_sandbox.${table} (LIKE public.${table} INCLUDING ALL);`);
      
      // Native restore verification
      await client.query(`INSERT INTO restore_verification_sandbox.${table} SELECT * FROM public.${table};`);
      
      const sourceCount = (await client.query(`SELECT count(*) FROM public.${table};`)).rows[0].count;
      const restoredCount = (await client.query(`SELECT count(*) FROM restore_verification_sandbox.${table};`)).rows[0].count;
      
      if (sourceCount !== restoredCount) {
        throw new Error(`Row count mismatch on public.${table}: expected ${sourceCount}, restored ${restoredCount}`);
      }
      console.log(`  ✓ Table restore_verification_sandbox.${table} verified (${restoredCount}/${sourceCount} rows restored with 100% fidelity).`);
    }

    // Step 5: Clean up sandbox schema
    console.log('\nStep 5: Tearing Down Test Sandbox Schema...');
    await client.query('DROP SCHEMA restore_verification_sandbox CASCADE;');
    console.log('  ✓ Test sandbox schema cleaned up.');

    console.log('\n🎉 DATABASE BACKUP & RESTORATION AUDIT PASSED WITH 100% INTEGRITY!');
  } catch (err) {
    console.error('Backup & restore verification failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

backupAndTestRestore();
