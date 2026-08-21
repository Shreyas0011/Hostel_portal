import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import dns from 'dns';

if (dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {}
}

import { User } from '../models/User';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const HOSTEL_INFO_CSV = path.resolve(__dirname, '../../Hostel Info.csv');
const PARENT_CREDS_CSV = path.resolve(__dirname, '../../Parent Credentials.csv');

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

export async function runHostelSeed(isDryRun: boolean = true) {
  const targetDbName = process.env.DB_NAME || 'hostel_portal';
  const mongoURI = process.env.MONGODB_URI;

  console.log(`=======================================================`);
  console.log(`   HOSTEL PORTAL INDEPENDENT DATABASE SEED & VALIDATOR `);
  console.log(`=======================================================`);
  console.log(`Target Database Name: ${targetDbName}`);
  console.log(`Execution Mode:       ${isDryRun ? 'DRY-RUN (No DB Writes)' : 'REAL IMPORT'}`);
  console.log(`-------------------------------------------------------\n`);

  if (!fs.existsSync(HOSTEL_INFO_CSV)) {
    throw new Error(`Source CSV not found at: ${HOSTEL_INFO_CSV}`);
  }
  if (!fs.existsSync(PARENT_CREDS_CSV)) {
    throw new Error(`Source Parent CSV not found at: ${PARENT_CREDS_CSV}`);
  }

  // 1. Read Parent Passwords Map from Parent Credentials.csv
  const parentCredsContent = fs.readFileSync(PARENT_CREDS_CSV, 'utf8');
  const parentCredsLines = parentCredsContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const parentPasswordMap = new Map<string, string>(); // key: USN or parent email -> password

  for (let i = 1; i < parentCredsLines.length; i++) {
    const cols = parseCSVLine(parentCredsLines[i]);
    if (cols.length >= 5) {
      const usn = cols[2]?.replace(/\r/g, '').trim().toUpperCase();
      const parentEmail = cols[3]?.replace(/\r/g, '').trim().toLowerCase();
      const generatedPassword = cols[4]?.replace(/\r/g, '').trim();
      if (usn && generatedPassword) {
        parentPasswordMap.set(usn, generatedPassword);
      }
      if (parentEmail && generatedPassword) {
        parentPasswordMap.set(parentEmail, generatedPassword);
      }
    }
  }

  // 2. Read Student & Parent records from Hostel Info.csv
  const infoContent = fs.readFileSync(HOSTEL_INFO_CSV, 'utf8');
  const infoLines = infoContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const studentRecordsToCreate: any[] = [];
  const parentRecordsToCreate: any[] = [];
  const usnSet = new Set<string>();
  const duplicateUSNs: string[] = [];
  const parentEmailSet = new Set<string>();
  const duplicateParentEmails: string[] = [];
  const missingRequiredFields: string[] = [];

  for (let i = 1; i < infoLines.length; i++) {
    const cols = parseCSVLine(infoLines[i]);
    const sn = cols[0];
    const enrollementNo = cols[1];
    const studentName = cols[2];
    const division = cols[3];
    const newExisting = cols[4];
    const sec = cols[5];
    const sMobileNo = cols[6];
    const pRegMob = cols[7];
    const relation = cols[8];
    const gender = cols[9];
    const dob = cols[10];
    const pRegEmail = cols[11];
    const address = cols[12];
    const allergies = cols[13];

    // Filter out trailing blank lines
    if (!enrollementNo || !studentName) {
      continue;
    }

    const usnKey = enrollementNo.toUpperCase();
    if (usnSet.has(usnKey)) {
      duplicateUSNs.push(usnKey);
    } else {
      usnSet.add(usnKey);
    }

    // Check missing fields
    if (!pRegEmail) {
      missingRequiredFields.push(`Row ${i + 1} (${studentName} - ${usnKey}): Missing Parent Email`);
    }

    if (pRegEmail) {
      const parentEmailKey = pRegEmail.toLowerCase();
      if (parentEmailSet.has(parentEmailKey)) {
        duplicateParentEmails.push(parentEmailKey);
      } else {
        parentEmailSet.add(parentEmailKey);
      }

      const parentPassword = parentPasswordMap.get(usnKey) || parentPasswordMap.get(parentEmailKey) || `Parent@${usnKey}`;

      parentRecordsToCreate.push({
        usn: usnKey,
        studentId: usnKey,
        name: `Parent of ${studentName}`,
        email: parentEmailKey,
        phone: pRegMob || '',
        parentRelation: relation || 'Parent',
        rawPassword: parentPassword,
        role: 'parent',
      });
    }

    studentRecordsToCreate.push({
      usn: usnKey,
      studentId: usnKey,
      name: studentName,
      email: usnKey, // Student login uses USN as identifier
      phone: sMobileNo || '',
      parentPhone: pRegMob || '',
      parentEmail: pRegEmail ? pRegEmail.toLowerCase() : '',
      parentRelation: relation || 'Parent',
      gender: gender || '',
      division: division || '',
      dob: dob || '',
      address: address || '',
      allergies: allergies || '',
      isNewStudent: (newExisting || '').toLowerCase().includes('new'),
      // Room, Block, Bed initialized as unassigned (null/empty) per user directive
      room: '',
      block: '',
      bed: '',
      rawPassword: 'Student@123',
      role: 'student',
    });
  }

  // 3. Staff Accounts
  const staffAccountsToCreate = [
    { name: 'Chief Warden Console', email: 'warden@hostel.edu', role: 'warden', rawPassword: 'Warden@Hostel123', block: 'All Blocks' },
    { name: 'Vijayamma', email: 'vijayamma@transcendgroup.org', role: 'warden', rawPassword: 'Warden@Girls123', block: 'Girls Hostel' },
    { name: 'Siddu', email: 'siddu@transcendgroup.org', role: 'warden', rawPassword: 'Warden@Boys123', block: 'Boys Hostel' },
    { name: 'Mess Manager Console', email: 'messmanager@transcendgroup.org', role: 'messmanager', rawPassword: 'MessManager@3333', block: 'Campus Mess' },
    { name: 'Hostel Admin', email: 'admin@hostel.edu', role: 'admin', rawPassword: 'HostelAdmin@2026', block: 'Campus Admin' },
    { name: 'Super Admin', email: 'superadmin@hostel.edu', role: 'superadmin', rawPassword: 'SuperAdmin@2026', block: 'Super Console' },
  ];

  // 4. Output Dry-Run Summary Report
  console.log(`--- DRY-RUN VALIDATION REPORT ---`);
  console.log(`Target Database:                   ${targetDbName}`);
  console.log(`Total Student Accounts to Create:  ${studentRecordsToCreate.length}`);
  console.log(`Total Parent Accounts to Create:   ${parentRecordsToCreate.length}`);
  console.log(`Total Staff Accounts to Create:    ${staffAccountsToCreate.length}`);
  console.log(`Duplicate USNs Found in CSV:       ${duplicateUSNs.length} ${duplicateUSNs.length ? JSON.stringify(duplicateUSNs) : ''}`);
  console.log(`Duplicate Parent Emails Found:     ${duplicateParentEmails.length} ${duplicateParentEmails.length ? JSON.stringify(duplicateParentEmails) : ''}`);
  console.log(`Missing Required Fields:           ${missingRequiredFields.length} ${missingRequiredFields.length ? JSON.stringify(missingRequiredFields) : ''}`);
  console.log(`Room/Block/Bed Allocation:         Unassigned / Null (Requires manual/verified allocation)`);
  console.log(`Password Hashing:                  bcrypt (Round 10)`);
  console.log(`=======================================================\n`);

  if (isDryRun) {
    console.log(`[DRY-RUN COMPLETE] No records were created or modified in MongoDB.`);
    console.log(`To execute the actual database import, run with --execute argument after explicit approval.`);
    return;
  }

  // Real Import Logic (Only executed if isDryRun === false)
  if (!mongoURI) throw new Error('MONGODB_URI environment variable is missing.');

  console.log(`Connecting to MongoDB Atlas target database: ${targetDbName}...`);
  let connected = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await mongoose.connect(mongoURI, { dbName: targetDbName, serverSelectionTimeoutMS: 15000 });
      connected = true;
      break;
    } catch (err: any) {
      console.warn(`⚠️ Connection attempt ${attempt}/5 failed: ${err.message}. Retrying in 2 seconds...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  if (!connected) throw new Error('Failed to connect to MongoDB Atlas after 5 attempts.');
  console.log(`✅ Connected successfully to '${targetDbName}'.`);

  let createdStudents = 0;
  let createdParents = 0;
  let createdStaff = 0;

  // Seed Staff
  for (const s of staffAccountsToCreate) {
    const existing = await User.findOne({ email: s.email.toLowerCase() });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(s.rawPassword, 10);
      await User.create({
        name: s.name,
        email: s.email.toLowerCase(),
        password: hashedPassword,
        role: s.role as any,
        block: s.block,
        isActive: true,
        firstLogin: false,
      });
      createdStaff++;
    }
  }

  // Seed Students (Idempotent by USN)
  for (const st of studentRecordsToCreate) {
    const existing = await User.findOne({ usn: st.usn });
    const hashedPassword = await bcrypt.hash(st.rawPassword, 10);

    if (!existing) {
      await User.create({
        usn: st.usn,
        studentId: st.studentId,
        name: st.name,
        email: st.email.toLowerCase(),
        password: hashedPassword,
        phone: st.phone,
        parentPhone: st.parentPhone,
        parentEmail: st.parentEmail,
        parentRelation: st.parentRelation,
        gender: st.gender,
        division: st.division,
        dob: st.dob,
        address: st.address,
        allergies: st.allergies,
        isNewStudent: st.isNewStudent,
        room: '',
        block: '',
        bed: '',
        role: 'student',
        isActive: true,
        firstLogin: true,
      });
      createdStudents++;
    }
  }

  // Seed Parents (Idempotent by email)
  for (const p of parentRecordsToCreate) {
    const existing = await User.findOne({ email: p.email.toLowerCase(), role: 'parent' });
    const hashedPassword = await bcrypt.hash(p.rawPassword, 10);

    if (!existing) {
      await User.create({
        name: p.name,
        email: p.email.toLowerCase(),
        password: hashedPassword,
        phone: p.phone,
        parentRelation: p.parentRelation,
        studentId: p.studentId,
        role: 'parent',
        isActive: true,
        firstLogin: false,
      });
      createdParents++;
    } else {
      existing.password = hashedPassword;
      await existing.save();
    }
  }

  console.log(`✅ [REAL IMPORT COMPLETE] Created ${createdStudents} students, ${createdParents} parents, ${createdStaff} staff in '${targetDbName}' database.`);
  await mongoose.disconnect();
}

// CLI Execution Wrapper
if (require.main === module) {
  const isExecute = process.argv.includes('--execute');
  runHostelSeed(!isExecute)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed script error:', err.message);
      process.exit(1);
    });
}
