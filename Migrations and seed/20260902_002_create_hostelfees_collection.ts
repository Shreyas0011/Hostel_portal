/**
 * Migration: 20260902_002_create_hostelfees_collection
 *
 * Creates the new `hostelfees` collection (fee/deposit data was previously
 * discarded during seeding — it now lives here, separate from `users`,
 * following the same pattern as hostelleaves/gatelogs/etc: keyed by
 * studentId, its own lifecycle, easy to extend with more installments later
 * without touching the identity collection).
 *
 * Run with your project's migration runner, e.g.:
 *   npx migrate-mongo up
 * or standalone:
 *   npx ts-node migrations/20260902_002_create_hostelfees_collection.ts up
 */

import { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  const collections = await db.listCollections({ name: 'hostelfees' }).toArray();

  if (collections.length === 0) {
    await db.createCollection('hostelfees', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['studentId', 'academicYear'],
          properties: {
            studentId: { bsonType: 'string', description: 'FK -> User.usn' },
            academicYear: { bsonType: 'string', description: 'e.g. "2026-27"' },
            installments: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['label', 'amount'],
                properties: {
                  label: { bsonType: 'string' },
                  amount: { bsonType: 'number' },
                  paidOn: { bsonType: ['date', 'null'] },
                },
              },
            },
            depositAmount: { bsonType: ['number', 'null'] },
            depositRefunded: { bsonType: 'bool' },
          },
        },
      },
      validationLevel: 'moderate',
    });
    console.log('[migration up] created hostelfees collection');
  } else {
    console.log('[migration up] hostelfees collection already exists, skipping create');
  }

  const hostelfees = db.collection('hostelfees');
  await hostelfees.createIndex({ studentId: 1, academicYear: 1 }, { unique: true });

  console.log('[migration up] index created: (studentId, academicYear) unique');
}

export async function down(db: Db): Promise<void> {
  const collections = await db.listCollections({ name: 'hostelfees' }).toArray();
  if (collections.length > 0) {
    await db.collection('hostelfees').drop();
    console.log('[migration down] dropped hostelfees collection');
  }
}

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
