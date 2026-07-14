import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const verify = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/facility_portal';
    await mongoose.connect(mongoUri, { dbName: 'facility_portal' });
    console.log('✅ Connected to MongoDB for verification.');

    const totalStudents = await User.countDocuments({ role: 'student' });
    console.log(`Total students in DB with role 'student': ${totalStudents}`);

    if (totalStudents > 0) {
      console.log('\nSample Student Records:');
      const samples = await User.find({ role: 'student' }).limit(3);
      samples.forEach((student, index) => {
        console.log(`\n--- Sample ${index + 1} ---`);
        console.log(`Name:            ${student.name}`);
        console.log(`Email:           ${student.email}`);
        console.log(`USN/Enrollment:  ${student.usn}`);
        console.log(`Role:            ${student.role}`);
        console.log(`Room/Bed/Block:  ${student.room} / ${student.bed} / ${student.block}`);
        console.log(`Sharing/Course:  ${student.sharing} / ${student.course}`);
        console.log(`Parent Relation: ${student.parentRelation}`);
        console.log(`Parent Name:     ${student.parentName}`);
        console.log(`Parent Email:    ${student.parentEmail}`);
        console.log(`Parent Phone:    ${student.parentPhone}`);
        console.log(`Phone:           ${student.phone}`);
      });
    }

    await mongoose.connection.close();
    console.log('\nVerification complete. Connection closed.');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  }
};

verify();
