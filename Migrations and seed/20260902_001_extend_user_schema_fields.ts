/**
 * Migration: 20260902_001_extend_user_schema_fields
 *
 * Adds new student-facing fields to the `users` collection:
 *   - section       (from CSV "Sec")
 *   - roomBedRaw    (raw "8G2" style string, kept verbatim as a safety net)
 *   - block         (parsed wing letter, e.g. "G" / "B")
 *   - room          (parsed floor+wing, e.g. "8G")
 *   - bed           (parsed trailing bed number)
 *   - house         (e.g. "GC" / "SS" / "RS")
 *   - foodStatus    (normalized enum: 'WITH_FOOD' | 'WITHOUT_FOOD' | 'UNSPECIFIED')
 *   - doj           (date of joining, stored as plain string like `dob`)
 *
 * MongoDB is schemaless, so this migration does NOT alter the Mongoose schema
 * file (that's a code change, see models/User.ts) — its job is to:
 *   1. Backfill sensible defaults on EXISTING documents that predate these
 *      fields, so old records don't have `undefined` where the app now
 *      expects a value.
 *   2. Create any new indexes these fields need.
 *
 * Run with your project's migration runner, e.g.:
 *   npx migrate-mongo up
 * or standalone:
 *   npx ts-node migrations/20260902_001_extend_user_schema_fields.ts up
 */

import { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  const users = db.collection('users');

  // Backfill defaults for any pre-existing student documents that don't yet
  // have these fields. New inserts from the v2 seed script will already
  // populate them directly.
  const result = await users.updateMany(
    { role: 'student', section: { $exists: false } },
    {
      $set: {
        section: '',
        roomBedRaw: '',
        block: '',
        room: '',
        bed: '',
        house: '',
        foodStatus: 'UNSPECIFIED',
        doj: '',
      },
    }
  );

  console.log(`[migration up] backfilled ${result.modifiedCount} existing student document(s)`);

  // Helpful for lookups/reporting by house or food status; not unique.
  await users.createIndex({ house: 1 });
  await users.createIndex({ foodStatus: 1 });

  console.log('[migration up] indexes created: house, foodStatus');
}

export async function down(db: Db): Promise<void> {
  const users = db.collection('users');

  await users.updateMany(
    { role: 'student' },
    {
      $unset: {
        section: '',
        roomBedRaw: '',
        house: '',
        foodStatus: '',
        doj: '',
      },
    }
  );

  await users.dropIndex('house_1').catch(() => {});
  await users.dropIndex('foodStatus_1').catch(() => {});

  console.log('[migration down] rolled back field additions on users collection');
}

// Allow running directly: `npx ts-node this-file.ts up|down`
if (require.main === module) {
  const { MongoClient } = require('mongodb');
  const direction = process.argv[2] === 'down' ? 'down' : 'up';
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_portal';

  (async () => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    if (direction === 'up') await up(db);
    else await down(db);
    await client.close();
  })().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
