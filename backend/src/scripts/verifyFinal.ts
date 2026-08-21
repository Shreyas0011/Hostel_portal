import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

if (dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {}
}

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verify() {
  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: 'hostel_portal',
      serverSelectionTimeoutMS: 8000,
    });
    console.log('Connected!');
    const db = mongoose.connection.db!;
    const dbName = db.databaseName;
    const usersColl = db.collection('users');

    const students = await usersColl.countDocuments({ role: 'student' });
    const parents = await usersColl.countDocuments({ role: 'parent' });
    const wardens = await usersColl.countDocuments({ role: 'warden' });
    const messManagers = await usersColl.countDocuments({ role: 'messmanager' });
    const admins = await usersColl.countDocuments({ role: 'admin' });
    const superadmins = await usersColl.countDocuments({ role: 'superadmin' });
    const totalUsers = await usersColl.countDocuments();

    console.log('=======================================================');
    console.log('   HOSTEL PORTAL DATABASE IMPORT VERIFICATION          ');
    console.log('=======================================================');
    console.log(`Database Name:          ${dbName}`);
    console.log(`Student Accounts:       ${students}`);
    console.log(`Parent Accounts:        ${parents}`);
    console.log(`Warden Accounts:        ${wardens}`);
    console.log(`Mess Manager Accounts:  ${messManagers}`);
    console.log(`Admin Accounts:         ${admins}`);
    console.log(`SuperAdmin Accounts:    ${superadmins}`);
    console.log(`-------------------------------------------------------`);
    console.log(`Total Users in DB:      ${totalUsers}`);
    console.log('=======================================================');

    await mongoose.disconnect();
  } catch (err: any) {
    console.error('❌ Connection Error:', err.message);
  }
}

verify();
