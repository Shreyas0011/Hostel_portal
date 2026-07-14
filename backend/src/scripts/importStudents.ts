import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User';

// Load environmental variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CSV_PATH = path.resolve(__dirname, '../../Hostel Info.csv');

// Double-quote aware CSV parser
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Helpers mirroring the frontend student generation logic
function getDivisionBlock(gender: string, division: string): string {
  if (gender.trim().toLowerCase() === 'female') {
    return division.includes('I PU') ? 'A' : 'B';
  } else {
    return division.includes('I PU') ? 'C' : 'D';
  }
}

function getSharing(index: number): number {
  return (index % 2) === 0 ? 2 : 3;
}

function calculateAllocation(index: number, gender: string, division: string) {
  const block = getDivisionBlock(gender, division);
  const sharing = getSharing(index);
  const floor = ((index - 1) % 4) + 1;
  const roomSuffix = sharing === 3 ? ['01', '02'][(index - 1) % 2] : ['03', '04'][(index - 1) % 2];
  const room = `${block}-${floor}${roomSuffix}`;
  
  const bedLabels = sharing === 3 ? ['Bed A', 'Bed B', 'Bed C'] : ['Bed A', 'Bed B'];
  const bed = bedLabels[(index - 1) % bedLabels.length];
  
  return { block, sharing, room, bed };
}

function calculateAcademic(division: string) {
  let year = 1;
  if (division.includes('II ')) year = 2;
  else if (division.includes('III ')) year = 3;

  let course = 'Pre-University';
  let dept = division.includes('SCI') ? 'Science' : 'Commerce';
  if (division.includes('B.Com')) {
    course = 'B.Com';
    dept = 'Commerce';
  } else if (division.includes('BBA')) {
    course = 'BBA';
    dept = 'Management';
  }
  
  return { year, course, dept };
}

const importStudents = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/facility_portal';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { dbName: 'facility_portal' });
    console.log('✅ Connected to MongoDB.');

    if (!fs.existsSync(CSV_PATH)) {
      console.error(`Error: CSV file not found at ${CSV_PATH}`);
      process.exit(1);
    }

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length < 2) {
      console.error('Error: CSV file is empty or missing data lines.');
      process.exit(1);
    }

    // Hash default password
    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const headers = parseCSVLine(lines[0]);
    console.log('Detected CSV Headers:', headers.slice(0, 14));

    const bulkOps: any[] = [];
    let skippedCount = 0;
    let validCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length < 12) {
        console.warn(`Line ${i + 1}: Skipped due to insufficient columns (${row.length} found, expected at least 12).`);
        skippedCount++;
        continue;
      }

      const snStr = row[0];
      const enrollmentNo = row[1];
      const studentName = row[2];
      const division = row[3];
      const newOrExisting = row[4];
      const sec = row[5];
      const sMobileNo = row[6];
      const pRegMob = row[7];
      const relation = row[8];
      const gender = row[9];
      const dob = row[10];
      const pRegEmail = row[11];
      const address = row[12];
      const allergies = row[13] || '';

      const sn = parseInt(snStr, 10);

      // Validate required fields
      if (!enrollmentNo || enrollmentNo.trim().length === 0) {
        console.warn(`Line ${i + 1}: Skipped due to missing Enrollment Number.`);
        skippedCount++;
        continue;
      }

      if (!studentName || studentName.trim().length === 0) {
        console.warn(`Line ${i + 1}: Skipped due to missing Student Name for USN ${enrollmentNo}.`);
        skippedCount++;
        continue;
      }

      if (!pRegEmail || pRegEmail.trim().length === 0 || !pRegEmail.includes('@')) {
        console.warn(`Line ${i + 1}: Skipped due to invalid/missing Parent/Register Email ID (${pRegEmail}) for USN ${enrollmentNo}.`);
        skippedCount++;
        continue;
      }

      validCount++;

      const cleanedName = studentName.trim();
      const cleanedEmail = pRegEmail.trim().toLowerCase();
      const cleanedUsn = enrollmentNo.trim().toUpperCase();

      // Determine allocations based on serial number index or fallback to loop index
      const allocationIndex = isNaN(sn) ? validCount : sn;
      const { block, sharing, room, bed } = calculateAllocation(allocationIndex, gender, division);
      const { year, course, dept } = calculateAcademic(division);

      const studentDoc = {
        name: cleanedName,
        email: cleanedEmail,
        role: 'student',
        isActive: true,
        firstLogin: true,
        // Student specific attributes
        usn: cleanedUsn,
        division: division.trim(),
        room,
        block,
        bed,
        sharing,
        course,
        dept,
        year,
        phone: sMobileNo ? sMobileNo.trim() : '',
        parentPhone: pRegMob ? pRegMob.trim() : '',
        parentEmail: cleanedEmail,
        parentName: `Parent of ${cleanedName}`,
        parentRelation: relation.trim() || 'Parent',
        gender: gender.trim(),
        dob: dob.trim(),
        address: address ? address.trim() : '',
        allergies: allergies ? allergies.trim() : '',
        isNew: newOrExisting.trim().toLowerCase() === 'new',
      };

      // Upsert logic: Create if not exists, update fields if exists
      // Using $setOnInsert for password so we don't reset password if user already exists
      bulkOps.push({
        updateOne: {
          filter: { usn: cleanedUsn },
          update: {
            $set: studentDoc,
            $setOnInsert: { password: hashedPassword }
          },
          upsert: true
        }
      });
    }

    console.log(`Processing ${bulkOps.length} upserts...`);
    if (bulkOps.length > 0) {
      const result = await User.bulkWrite(bulkOps);
      console.log('✅ Bulk write operation completed successfully.');
      console.log(`- Matched count: ${result.matchedCount}`);
      console.log(`- Modified count: ${result.modifiedCount}`);
      console.log(`- Upserted count: ${result.upsertedCount}`);
    }

    console.log(`Summary: Imported ${validCount} students successfully, Skipped ${skippedCount} rows.`);
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Critical error during student import:', error.message);
    process.exit(1);
  }
};

importStudents();
