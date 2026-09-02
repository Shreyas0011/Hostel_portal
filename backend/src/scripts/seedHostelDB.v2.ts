/**
 * seedHostelDB.v2.ts
 *
 * Seeds `users` (students + parents + staff + demo accounts) and `hostelfees`
 * from:
 *   - Hostel Info v2.csv   -> student/parent/room/house/food/fee data
 *   - Parent Credentials.csv -> parent login passwords
 *
 * FIXES FROM v1:
 *   - Student login email is the student's REAL personal email, not USN.
 *     USN remains the FK used everywhere else (hostelleaves, gatelogs, etc.)
 *   - parentName sourced from "PPOC Name" column, not a placeholder.
 *   - room/block/bed parsed and populated from "Room & Bed No" column.
 *   - New fields: section, house, foodStatus, doj, roomBedRaw.
 *   - hostelfees collection seeded from fee/deposit columns.
 *   - Email collision handling: parent email aliased with contactEmail fallback.
 *   - Sibling support: one parent email, multiple children -> linkedStudentIds.
 *   - Demo accounts added for quick testing (student + parent personas).
 *
 * Prerequisites:
 *   npx ts-node src/migrations/20260902_001_extend_user_schema_fields.ts up
 *   npx ts-node src/migrations/20260902_002_create_hostelfees_collection.ts up
 *
 * Usage:
 *   npx ts-node src/scripts/seedHostelDB.v2.ts              # DRY RUN
 *   npx ts-node src/scripts/seedHostelDB.v2.ts --execute    # writes to DB
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';
import { User } from '../models/User';
import { HostelFee } from '../models/HostelFee';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ── CONFIG ───────────────────────────────────────────────────────────────────
const EXECUTE      = process.argv.includes('--execute');
const MONGODB_URI  = process.env.MONGODB_URI!;
const DB_NAME      = process.env.DB_NAME || 'hostel_portal';
const HOSTEL_INFO  = path.resolve(__dirname, '../../Hostel Info v2.csv');
const PARENT_CREDS = path.resolve(__dirname, '../../Parent Credentials.csv');
const ACADEMIC_YEAR     = process.env.ACADEMIC_YEAR || '2026-27';
const SALT_ROUNDS        = 10;
const STUDENT_DEFAULT_PW = 'Student@123';

// ── HARDCODED STAFF ACCOUNTS (unchanged from v1) ─────────────────────────────
const STAFF_ACCOUNTS = [
  { name: 'Chief Warden Console',  email: 'warden@hostel.edu',              role: 'warden',      password: 'Warden@Hostel123',  firstLogin: false },
  { name: 'Vijayamma',             email: 'vijayamma@transcendgroup.org',   role: 'warden',      password: 'Warden@Girls123',   firstLogin: false },
  { name: 'Siddu',                 email: 'siddu@transcendgroup.org',       role: 'warden',      password: 'Warden@Boys123',    firstLogin: false },
  { name: 'Mess Manager Console',  email: 'messmanager@transcendgroup.org', role: 'messmanager', password: 'MessManager@3333',  firstLogin: false },
  { name: 'Hostel Admin',          email: 'admin@hostel.edu',               role: 'admin',       password: 'HostelAdmin@2026',  firstLogin: false },
  { name: 'Super Admin',           email: 'superadmin@hostel.edu',          role: 'superadmin',  password: 'SuperAdmin@2026',   firstLogin: false },
];

// ── DEMO ACCOUNTS ─────────────────────────────────────────────────────────────
// One demo student and one matched demo parent for quick testing.
// firstLogin: true so the password-change flow is exercised on first use.
const DEMO_STUDENT_USN   = 'DEMO001';
const DEMO_STUDENT_EMAIL = 'demo.student@transcendgroup.org';
const DEMO_PARENT_EMAIL  = 'demo.parent@transcendgroup.org';
const DEMO_PASSWORD      = 'DemoUser@2026';

// ── HELPERS ───────────────────────────────────────────────────────────────────
function deriveCourseDeptYear(division: string): { course: string; dept: string; year: number | undefined } {
  const yearMap: Record<string, number> = { I: 1, II: 2, III: 3 };
  const romanMatch = division.match(/^(I{1,3})\s/);
  const year = romanMatch ? yearMap[romanMatch[1]] : undefined;

  let course = 'Pre-University';
  if      (/BBA/i.test(division))    course = 'BBA';
  else if (/B\.?Com/i.test(division)) course = 'B.Com';
  else if (/PU/i.test(division))     course = 'Pre-University';

  // Check Honours BEFORE generic Com — ordering matters
  let dept = '';
  if      (/B\.?Com\s*-\s*H/i.test(division)) dept = 'Commerce (Honours)';
  else if (/Com/i.test(division))              dept = 'Commerce';
  else if (/Sci/i.test(division))              dept = 'Science';
  else if (/BBA/i.test(division))              dept = 'BBA';

  return { course, dept, year };
}

/**
 * Parses "8G2" -> floor "8", wing "G", bed "2"
 * room = "8G", block = "G", bed = "2"
 * Returns empty strings if the pattern doesn't match.
 */
function parseRoomBed(raw: string): { block: string; room: string; bed: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { block: '', room: '', bed: '' };
  const match = trimmed.match(/^(\d+)([A-Za-z]+)(\d+)$/);
  if (!match) return { block: '', room: '', bed: '' };
  const [, floor, wing, bedNum] = match;
  return {
    block: wing.toUpperCase(),
    room:  `${floor}${wing.toUpperCase()}`,
    bed:   bedNum,
  };
}

function normalizeFoodStatus(raw: string): 'WITH_FOOD' | 'WITHOUT_FOOD' | 'UNSPECIFIED' {
  const v = raw.trim().toLowerCase();
  if (!v || v === '-') return 'UNSPECIFIED';
  if (v.includes('without')) return 'WITHOUT_FOOD';
  return 'WITH_FOOD';
}

function parseAmount(raw: string): number | null {
  const v = raw.trim().replace(/,/g, '');
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

interface EmailClaim { role: string; usn?: string; }

function resolveCollidingEmail(
  desired: string,
  claimed: Map<string, EmailClaim>,
  usn: string
): string {
  const [local, domain] = desired.split('@');
  const candidates = [
    `${local}+parent@${domain}`,
    `${local}+parent.${usn.toLowerCase()}@${domain}`,
  ];
  for (const c of candidates) {
    if (!claimed.has(c)) return c;
  }
  return `${local}+parent.${usn.toLowerCase()}.${Date.now()}@${domain}`;
}

function readCsvRows(filePath: string): string[][] {
  if (!fs.existsSync(filePath)) throw new Error(`CSV not found: ${filePath}`);
  const raw  = fs.readFileSync(filePath, 'utf-8');
  const rows = parse(raw, { skip_empty_lines: true }) as string[][];
  return rows.slice(1); // drop header row
}

interface StudentRow {
  usn: string; name: string; division: string; section: string;
  newExisting: string; doj: string; smobile: string;
  parentName: string; pmobile: string; relation: string;
  gender: string; dob: string; studentEmail: string; parentEmail: string;
  address: string; allergies: string; roomBedRaw: string;
  house: string; foodStatusRaw: string;
  feeInstallment1: string; depositAmount: string;
}

function parseStudentRow(cols: string[]): StudentRow | null {
  // Column order for "Hostel Info v2.csv":
  // 0 SN | 1 Enrollment No | 2 Student Name | 3 Division | 4 Sec | 5 New/Existing
  // 6 DOJ | 7 S Mobile No | 8 PPOC Name | 9 PPOC Mobile No | 10 Relation
  // 11 Gender | 12 DOB | 13 Student Email ID | 14 P-Reg-Email ID | 15 Address
  // 16 Any Allergies | 17 Room & Bed No | 18 House | 19 Food Status
  // 20 Fee Installment 1 | 21 Deposit Amount
  const usn          = (cols[1] || '').trim().toUpperCase();
  const name         = (cols[2] || '').trim();
  const studentEmail = (cols[13] || '').trim().toLowerCase();

  if (!usn || !name) return null;

  if (!studentEmail) {
    console.warn(`  ⚠ SKIP ${usn} (${name}) — missing Student Email ID, cannot create login`);
    return null;
  }

  return {
    usn,
    name,
    division:       (cols[3]  || '').trim(),
    section:        (cols[4]  || '').trim(),
    newExisting:    (cols[5]  || '').trim(),
    doj:            (cols[6]  || '').trim(),
    smobile:        (cols[7]  || '').trim(),
    parentName:     (cols[8]  || '').trim(),
    pmobile:        (cols[9]  || '').trim(),
    relation:       (cols[10] || '').trim() || 'Parent',
    gender:         (cols[11] || '').trim(),
    dob:            (cols[12] || '').trim(),
    studentEmail,
    parentEmail:    (cols[14] || '').trim().toLowerCase(),
    address:        (cols[15] || '').trim(),
    allergies:      (cols[16] || '').trim(),
    roomBedRaw:     (cols[17] || '').trim(),
    house:          (cols[18] || '').trim(),
    foodStatusRaw:  (cols[19] || '').trim(),
    feeInstallment1:(cols[20] || '').trim(),
    depositAmount:  (cols[21] || '').trim(),
  };
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n=================================================');
  console.log('  seedHostelDB.v2.ts');
  console.log(`  Mode:     ${EXECUTE ? 'EXECUTE — writing to DB' : 'DRY RUN — no writes'}`);
  console.log(`  Database: ${DB_NAME}`);
  console.log('=================================================\n');

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in .env — aborting before any work');
  }

  // ── 1. Parse CSVs ───────────────────────────────────────────────────────────
  const hostelRows   = readCsvRows(HOSTEL_INFO);
  const parentCredsRows = fs.existsSync(PARENT_CREDS) ? readCsvRows(PARENT_CREDS) : [];

  const students = hostelRows
    .map(parseStudentRow)
    .filter((r): r is StudentRow => r !== null);

  const passwordByUsn    = new Map<string, string>();
  const passwordByPEmail = new Map<string, string>();
  for (const cols of parentCredsRows) {
    if (cols.length < 5) continue;
    const usn   = (cols[2] || '').trim().toUpperCase();
    const email = (cols[3] || '').trim().toLowerCase();
    const pw    = (cols[4] || '').trim();
    if (usn && pw)   passwordByUsn.set(usn, pw);
    if (email && pw) passwordByPEmail.set(email, pw);
  }

  // ── 2. Validation report ────────────────────────────────────────────────────
  const usnCount   = new Map<string, number>();
  const sEmailCount = new Map<string, number>();
  for (const s of students) {
    usnCount.set(s.usn, (usnCount.get(s.usn) || 0) + 1);
    sEmailCount.set(s.studentEmail, (sEmailCount.get(s.studentEmail) || 0) + 1);
  }
  const dupUsns    = [...usnCount.entries()].filter(([, c]) => c > 1).map(([u]) => u);
  const dupEmails  = [...sEmailCount.entries()].filter(([, c]) => c > 1).map(([e]) => e);
  const badRoomBed = students
    .filter(s => s.roomBedRaw && !parseRoomBed(s.roomBedRaw).block)
    .map(s => `${s.usn} ("${s.roomBedRaw}")`);

  console.log(`Students parsed from CSV:       ${students.length}`);
  if (dupUsns.length)
    console.log(`  ⚠ Duplicate USNs:            ${dupUsns.join(', ')}`);
  if (dupEmails.length)
    console.log(`  ⚠ Duplicate student emails:  ${dupEmails.join(', ')} — WILL collide on unique index`);
  if (badRoomBed.length)
    console.log(`  ⚠ Unparseable Room/Bed (left blank): ${badRoomBed.join(', ')}`);

  // Abort if student email duplicates exist — they'd crash the unique index
  if (dupEmails.length) {
    throw new Error(
      `Fatal: duplicate student login emails detected (${dupEmails.join(', ')}). ` +
      `Fix the CSV before seeding.`
    );
  }

  // ── 3. Build user documents ─────────────────────────────────────────────────
  type UserDoc = Record<string, any>;
  const usersToUpsert: UserDoc[] = [];
  const feesToUpsert: Record<string, any>[] = [];
  const claimedEmails = new Map<string, EmailClaim>();
  const collisionLog: string[] = [];

  // Register staff + demo emails first (fixed identities, highest priority)
  for (const s of STAFF_ACCOUNTS) {
    claimedEmails.set(s.email.toLowerCase(), { role: s.role });
  }
  claimedEmails.set(DEMO_STUDENT_EMAIL, { role: 'student', usn: DEMO_STUDENT_USN });
  claimedEmails.set(DEMO_PARENT_EMAIL,  { role: 'parent' });

  // Register every student email — abort loudly on any collision with staff/demo
  for (const s of students) {
    if (claimedEmails.has(s.studentEmail)) {
      throw new Error(
        `Fatal: student email ${s.studentEmail} (${s.usn}) collides with an already-claimed ` +
        `login. Aborting before any writes.`
      );
    }
    claimedEmails.set(s.studentEmail, { role: 'student', usn: s.usn });
  }

  // Build student documents
  for (const s of students) {
    const { course, dept, year } = deriveCourseDeptYear(s.division);
    const { block, room, bed }   = parseRoomBed(s.roomBedRaw);
    const foodStatus = normalizeFoodStatus(s.foodStatusRaw);
    const isNewStudent = s.newExisting.toLowerCase().includes('new');

    usersToUpsert.push({
      name:           s.name,
      email:          s.studentEmail,
      passwordPlain:  STUDENT_DEFAULT_PW,
      role:           'student',
      usn:            s.usn,
      studentId:      s.usn,
      division:       s.division,
      section:        s.section,
      roomBedRaw:     s.roomBedRaw,
      block,
      room,
      bed,
      course,
      dept,
      year,
      phone:          s.smobile,
      parentPhone:    s.pmobile,
      parentEmail:    s.parentEmail,
      parentName:     s.parentName || `Parent of ${s.name}`,
      parentRelation: s.relation,
      gender:         s.gender,
      dob:            s.dob,
      address:        s.address,
      allergies:      s.allergies,
      isNewStudent,
      house:          s.house,
      foodStatus,
      doj:            s.doj,
      isActive:       true,
      firstLogin:     true,
    });

    // Fee record
    const inst1    = parseAmount(s.feeInstallment1);
    const deposit  = parseAmount(s.depositAmount);
    if (inst1 !== null || deposit !== null) {
      const installments = inst1 !== null
        ? [{ label: 'First', amount: inst1, paidOn: null }]
        : [];
      feesToUpsert.push({
        studentId:    s.usn,
        academicYear: ACADEMIC_YEAR,
        installments,
        depositAmount: deposit,
      });
    }
  }

  // Build parent documents (sibling-aware, collision-resolved)
  const parentByOriginalEmail = new Map<string, UserDoc>();

  for (const s of students) {
    if (!s.parentEmail) continue;

    const existing = parentByOriginalEmail.get(s.parentEmail);
    if (existing) {
      // Sibling: append student to existing parent account
      existing.linkedStudentIds.push(s.usn);
      continue;
    }

    let loginEmail   = s.parentEmail;
    let contactEmail = '';

    if (claimedEmails.has(s.parentEmail)) {
      const clash = claimedEmails.get(s.parentEmail)!;
      loginEmail   = resolveCollidingEmail(s.parentEmail, claimedEmails, s.usn);
      contactEmail = s.parentEmail;
      collisionLog.push(
        `${s.usn} (${s.name}): parent email "${s.parentEmail}" already claimed by ` +
        `${clash.role}${clash.usn ? ` (${clash.usn})` : ''} — ` +
        `parent login aliased to "${loginEmail}", real address in contactEmail`
      );
    }

    claimedEmails.set(loginEmail, { role: 'parent', usn: s.usn });

    const parentPw = passwordByUsn.get(s.usn)
      || passwordByPEmail.get(s.parentEmail)
      || `Parent@${s.usn}`;

    const doc: UserDoc = {
      name:             s.parentName || `Parent of ${s.name}`,
      email:            loginEmail,
      contactEmail,
      passwordPlain:    parentPw,
      role:             'parent',
      studentId:        s.usn,
      linkedStudentIds: [s.usn],
      isActive:         true,
      firstLogin:       true,
    };
    usersToUpsert.push(doc);
    parentByOriginalEmail.set(s.parentEmail, doc);
  }

  // Staff accounts
  for (const s of STAFF_ACCOUNTS) {
    usersToUpsert.push({
      name:          s.name,
      email:         s.email.toLowerCase(),
      passwordPlain: s.password,
      role:          s.role,
      isActive:      true,
      firstLogin:    s.firstLogin,
    });
  }

  // Demo student account
  usersToUpsert.push({
    name:           'Demo Student',
    email:          DEMO_STUDENT_EMAIL,
    passwordPlain:  DEMO_PASSWORD,
    role:           'student',
    usn:            DEMO_STUDENT_USN,
    studentId:      DEMO_STUDENT_USN,
    division:       'II PU - Com',
    section:        '12A',
    room:           '1G',
    block:          'G',
    bed:            '1',
    roomBedRaw:     '1G1',
    house:          'GC',
    foodStatus:     'WITH_FOOD',
    gender:         'Female',
    isActive:       true,
    firstLogin:     true,
    isDemo:         true,   // excluded from all reporting, occupancy counts, dashboards
  });

  // Demo parent account (linked to demo student)
  usersToUpsert.push({
    name:             'Demo Parent',
    email:            DEMO_PARENT_EMAIL,
    passwordPlain:    DEMO_PASSWORD,
    role:             'parent',
    studentId:        DEMO_STUDENT_USN,
    linkedStudentIds: [DEMO_STUDENT_USN],
    isActive:         true,
    firstLogin:       true,
    isDemo:           true,   // excluded from all reporting
  });

  // ── 4. Summary ──────────────────────────────────────────────────────────────
  const parentCount = usersToUpsert.filter(u => u.role === 'parent').length;
  const staffCount  = STAFF_ACCOUNTS.length;
  const demoCount   = 2;

  console.log(`\n--- SEED SUMMARY ---`);
  console.log(`Students:      ${students.length}`);
  console.log(`Parents:       ${parentCount - 1} real + 1 demo`);
  console.log(`Staff:         ${staffCount} (hardcoded)`);
  console.log(`Demo accounts: ${demoCount} (demo student + demo parent)`);
  console.log(`Total users:   ${usersToUpsert.length}`);
  console.log(`Fee records:   ${feesToUpsert.length}`);

  if (collisionLog.length) {
    console.log(`\n⚠  Email collision(s) resolved — ${collisionLog.length} parent login(s) aliased:`);
    for (const c of collisionLog) console.log(`   - ${c}`);
  }
  console.log('');

  if (!EXECUTE) {
    console.log('--- DRY RUN: first 5 user accounts that would be upserted ---');
    for (const u of usersToUpsert.slice(0, 5)) {
      const roomStr = u.room ? `  room: ${u.room}${u.bed}` : '';
      console.log(`  [${u.role.padEnd(12)}] ${u.email}  |  ${u.name}${roomStr}`);
    }
    console.log(`  ... and ${usersToUpsert.length - 5} more`);

    console.log('\n--- DRY RUN: first 3 fee records ---');
    for (const f of feesToUpsert.slice(0, 3)) {
      console.log(`  ${f.studentId}: installments=${JSON.stringify(f.installments)}  deposit=${f.depositAmount}`);
    }

    console.log('\n--- DEMO ACCOUNTS (for testing) ---');
    console.log(`  Student login:  ${DEMO_STUDENT_EMAIL}  |  password: [masked]`);
    console.log(`  Parent login:   ${DEMO_PARENT_EMAIL}   |  password: [masked]`);
    console.log(`  (All staff logins unchanged from v1)\n`);

    console.log('No database writes performed. Re-run with --execute to apply.\n');
    return;
  }

  // ── 5. Execute writes ───────────────────────────────────────────────────────
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log(`Connected to ${DB_NAME}`);

  let usersCreated = 0;
  let usersUpdated = 0;

  for (const u of usersToUpsert) {
    const { passwordPlain, ...doc } = u;
    const hashed   = await bcrypt.hash(passwordPlain, SALT_ROUNDS);
    const existing = await User.findOne({ email: doc.email });

    if (existing) {
      await User.updateOne({ email: doc.email }, { $set: { ...doc, password: hashed } });
      usersUpdated++;
    } else {
      await User.create({ ...doc, password: hashed });
      usersCreated++;
    }
  }

  let feesCreated  = 0;
  let feesUpdated  = 0;
  for (const f of feesToUpsert) {
    const existing = await HostelFee.findOne({ studentId: f.studentId, academicYear: f.academicYear });
    if (existing) {
      await HostelFee.updateOne({ _id: existing._id }, { $set: f });
      feesUpdated++;
    } else {
      await HostelFee.create(f);
      feesCreated++;
    }
  }

  console.log(`\nUsers  — created: ${usersCreated},  updated: ${usersUpdated}`);
  console.log(`Fees   — created: ${feesCreated},  updated: ${feesUpdated}`);
  console.log('\n--- DEMO ACCOUNTS SEEDED ---');
  console.log(`  Student: ${DEMO_STUDENT_EMAIL}  |  password: [masked — check .env or script constant]`);
  console.log(`  Parent:  ${DEMO_PARENT_EMAIL}   |  password: [masked]`);

  await mongoose.disconnect();
  console.log('\nSeed complete.\n');
}

main().catch((err) => {
  console.error('\nSeed script failed:', err.message);
  process.exit(1);
});
