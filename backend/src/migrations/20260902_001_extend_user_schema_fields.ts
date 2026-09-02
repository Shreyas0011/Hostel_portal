/**
 * Migration: 20260902_001_extend_user_schema_fields
 *
 * Backfills new student fields onto existing `users` documents that
 * predate the v2 schema (section, roomBedRaw, house, foodStatus, doj)
 * and creates indexes for house + foodStatus.
 *
 * Run standalone:
 *   npx ts-node src/migrations/20260902_001_extend_user_schema_fields.ts up
 *   npx ts-node src/migrations/20260902_001_extend_user_schema_fields.ts down
 */

import { Db } from 'mongodb';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function up(db: Db): Promise<void> {
  const users = db.collection('users');

  const result = await users.updateMany(
    { role: 'student', section: { $exists: false } },
    {
      $set: {
        section:    '',
        roomBedRaw: '',
        house:      '',
        foodStatus: 'UNSPECIFIED',
        doj:        '',
        isDemo:     false,   // backfill — all pre-existing students are real
      },
    }
  );

  console.log(`[001 up] backfilled ${result.modifiedCount} existing student document(s)`);

  await users.createIndex({ house: 1 });
  await users.createIndex({ foodStatus: 1 });

  console.log('[001 up] indexes created: house, foodStatus');
}

export async function down(db: Db): Promise<void> {
  const users = db.collection('users');

  await users.updateMany(
    { role: 'student' },
    {
      $unset: {
        section:    '',
        roomBedRaw: '',
        house:      '',
        foodStatus: '',
        doj:        '',
        isDemo:     '',
      },
    }
  );

  await users.dropIndex('house_1').catch(() => {});
  await users.dropIndex('foodStatus_1').catch(() => {});

  console.log('[001 down] rolled back field additions on users collection');
}

if (require.main === module) {
  const direction = process.argv[2] === 'down' ? 'down' : 'up';
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_portal';
  const dbName = process.env.DB_NAME || 'hostel_portal';

  (async () => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    console.log(`[001] Running ${direction} against: ${dbName}`);
    if (direction === 'up') await up(db);
    else await down(db);
    await client.close();
    console.log('[001] Done.');
  })().catch((err) => {
    console.error('Migration 001 failed:', err.message);
    process.exit(1);
  });
}
