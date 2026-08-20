import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: 'hostel_portal' });
  const user = await mongoose.connection.db!.collection('users').findOne({ email: 'chandanamahadimane@gmail.com' });
  console.log('User email:', user?.email);
  console.log('Password hash in DB:', user?.password);

  const testPass = 'Parent@000191';
  const match = await bcrypt.compare(testPass, user?.password);
  console.log(`bcrypt.compare("${testPass}", hash) => ${match}`);

  await mongoose.disconnect();
}

check().catch(console.error);
