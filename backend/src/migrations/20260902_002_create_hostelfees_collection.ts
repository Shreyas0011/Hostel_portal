/**
 * Migration: 20260902_002_create_hostelfees_collection
 *
 * Creates the `hostelfees` collection with a JSON schema validator and
 * a unique compound index on (studentId, academicYear).
 *
 * Run standalone:
 *   npx ts-node src/migrations/20260902_002_create_hostelfees_collection.ts up
 *   npx ts-node src/migrations/20260902_002_create_hostelfees_collection.ts down
 */

import { Db, MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function up(db: Db): Promise<void> {
  const existing = await db.listCollections({ name: 'hostelfees' }).toArray();

  if (existing.length === 0) {
    await db.createCollection('hostelfees', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['studentId', 'academicYear'],
          properties: {
            studentId:    { bsonType: 'string', description: 'FK -> User.usn' },
            academicYear: { bsonType: 'string', description: 'e.g. "2026-27"' },
            installments: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['label', 'amount'],
                properties: {
                  label:  { bsonType: 'string' },
                  amount: { bsonType: 'number' },
                  paidOn: { bsonType: ['date', 'null'] },
                },
              },
            },
            depositAmount:   { bsonType: ['number', 'null'] },
            depositRefunded: { bsonType: 'bool' },
          },
        },
      },
      validationLevel: 'moderate',
    });
    console.log('[002 up] created hostelfees collection');
  } else {
    console.log('[002 up] hostelfees collection already exists — skipping create');
  }

  const hostelfees = db.collection('hostelfees');
  await hostelfees.createIndex({ studentId: 1, academicYear: 1 }, { unique: true });
  console.log('[002 up] index created: (studentId, academicYear) unique');
}

export async function down(db: Db): Promise<void> {
  const existing = await db.listCollections({ name: 'hostelfees' }).toArray();
  if (existing.length > 0) {
    await db.collection('hostelfees').drop();
    console.log('[002 down] dropped hostelfees collection');
  }
}

if (require.main === module) {
  const direction = process.argv[2] === 'down' ? 'down' : 'up';
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_portal';
  const dbName = process.env.DB_NAME || 'hostel_portal';

  (async () => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    console.log(`[002] Running ${direction} against: ${dbName}`);
    if (direction === 'up') await up(db);
    else await down(db);
    await client.close();
    console.log('[002] Done.');
  })().catch((err) => {
    console.error('Migration 002 failed:', err.message);
    process.exit(1);
  });
}
