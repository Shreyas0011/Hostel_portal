/**
 * seedHostelDB.v2.ts
 *
 * Seeds `users` (students + parents + staff) and `hostelfees` from:
 *   - Hostel Info v2.csv   -> student, parent, room, house, food, fee data
 *   - Parent Credentials.csv -> parent login passwords (falls back to
 *                                `Parent@{USN}` for anyone not listed)
 *
 * FIXES FROM v1:
 *   - Student login `email` is now the student's REAL personal email
 *     (from "Student Email ID"), not the USN. `usn` remains the FK used
 *     everywhere else in the system.
 *   - parentName is the actual name from "PPOC Name", not a placeholder.
 *   - room/block/bed are now parsed and populated, not left blank.
 *   - New fields populated: section, house, foodStatus, doj, roomBedRaw.
 *   - New collection `hostelfees` seeded from the fee/deposit columns.
 *
 * Prerequisite: run the migrations first so the schema/collection/indexes
 * exist —
 *   npx ts-node migrations/20260902_001_extend_user_schema_fields.ts up
 *   npx ts-node migrations/20260902_002_create_hostelfees_collection.ts up
 *
 * Usage:
 *   npx ts-node src/scripts/seedHostelDB.v2.ts              # DRY RUN
 *   npx ts-node src/scripts/seedHostelDB.v2.ts --execute     # writes to DB
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';
import { User } from '../models/User';
import { HostelFee } from '../models/HostelFee';

// ── CONFIG ──────────────────────────────────────────────────────────────
const EXECUTE = process.argv.includes('--execute');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_portal';
const HOSTEL_INFO_PATH = process.env.HOSTEL_INFO_CSV || path.join(__dirname, '../../Hostel Info v2.csv');
const PARENT_CREDS_PATH = process.env.PARENT_CREDS_CSV || path.join(__dirname, '../../Parent Credentials.csv');
const ACADEMIC_YEAR = process.env.ACADEMIC_YEAR || '2026-27';
const SALT_ROUNDS = 10;
const STUDENT_DEFAULT_PASSWORD = 'Student@123';

// ── HARDCODED STAFF ACCOUNTS (unchanged from v1) ────────────────────────
const STAFF_ACCOUNTS = [
  { name: 'Chief Warden Console', email: 'warden@hostel.edu', role: 'warden', password: 'Warden@Hostel123' },
  { name: 'Vijayamma', email: 'vijayamma@transcendgroup.org', role: 'warden', password: 'Warden@Girls123' },
  { name: 'Siddu', email: 'siddu@transcendgroup.org', role: 'warden', password: 'Warden@Boys123' },
  { name: 'Mess Manager Console', email: 'messmanager@transcendgroup.org', role: 'messmanager', password: 'MessManager@3333' },
  { name: 'Hostel Admin', email: 'admin@hostel.edu', role: 'admin', password: 'HostelAdmin@2026' },
  { name: 'Super Admin', email: 'superadmin@hostel.edu', role: 'superadmin', password: 'SuperAdmin@2026' },
];

// ── HELPERS ──────────────────────────────────────────────────────────────
function deriveCourseDeptYear(division: string): { course: string; dept: string; year: number | undefined } {
  const yearMap: Record<string, number> = { I: 1, II: 2, III: 3 };
  const romanMatch = division.match(/^(I{1,3})\s/);
  const year = romanMatch ? yearMap[romanMatch[1]] : undefined;

  let course = 'Pre-University';
  if (/BBA/i.test(division)) course = 'BBA';
  else if (/B\.?Com/i.test(division)) course = 'B.Com';
  else if (/PU/i.test(division)) course = 'Pre-University';

  // NOTE: check the more specific "Honours" pattern BEFORE the generic
  // "Com" pattern — this was the ordering bug flagged in the v1 review.
  let dept = '';
  if (/B\.?Com\s*-\s*H/i.test(division)) dept = 'Commerce (Honours)';
  else if (/Com/i.test(division)) dept = 'Commerce';
  else if (/Sci/i.test(division)) dept = 'Science';
  else if (/BBA/i.test(division)) dept = 'BBA';

  return { course, dept, year };
}

/**
 * Parses the raw "Room & Bed No" string, e.g. "8G2" -> floor 8, wing G, bed 2.
 * Format observed across the source data: <floor digits><wing letter><bed digits>.
 * Falls back gracefully (raw value preserved in roomBedRaw regardless) if the
 * pattern doesn't match — verify this assumption against real room-numbering
 * conventions before trusting `block`/`room`/`bed` for anything critical.
 */
function parseRoomBed(raw: string): { block: string; room: string; bed: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+)([A-Za-z]+)(\d+)$/);
  if (!match) return { block: '', room: '', bed: '' };
  const [, floor, wing, bedNum] = match;
  return { block: wing.toUpperCase(), room: `${floor}${wing.toUpperCase()}`, bed: bedNum };
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

/**
 * Produces a login email that doesn't collide with anything already
 * claimed. Tries a Gmail-style "+parent" alias first (delivers to the same
 * inbox on Gmail/most modern providers; worth confirming for non-Gmail
 * domains in your dataset), then falls back to a USN-qualified alias if
 * even that's taken. Never mutates `claimed` itself — caller registers the
 * chosen email once it's settled on.
 */
function resolveCollidingEmail(desired: string, claimed: Map<string, EmailClaim>, usn: string): string {
  const [local, domain] = desired.split('@');
  const candidates = [`${local}+parent@${domain}`, `${local}+parent.${usn.toLowerCase()}@${domain}`];
  for (const candidate of candidates) {
    if (!claimed.has(candidate)) return candidate;
  }
  // Extremely unlikely fallback if both candidates are somehow also taken.
  return `${local}+parent.${usn.toLowerCase()}.${Date.now()}@${domain}`;
}

interface EmailClaim {
  email: string;
  role: string;
  usn?: string;
}

function readCsv(filePath: string): string[][] {
  if (!fs.existsSync(filePath)) throw new Error(`CSV file not found: ${filePath}`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const records: string[][] = parse(raw, { skip_empty_lines: true });
  return records.slice(1); // drop header row
}

interface ParsedStudentRow {
  usn: string;
  name: string;
  division: string;
  section: string;
  newExisting: string;
  doj: string;
  smobile: string;
  parentName: string;
  pmobile: string;
  relation: string;
  gender: string;
  dob: string;
  studentEmail: string;
  parentEmail: string;
  address: string;
  allergies: string;
  roomBedRaw: string;
  house: string;
  foodStatusRaw: string;
  feeInstallment1: string;
  depositAmount: string;
}

function parseHostelInfoRow(cols: string[]): ParsedStudentRow | null {
  // Column order matches "Hostel Info v2.csv":
  // 0 SN, 1 Enrollment No, 2 Student Name, 3 Division, 4 Sec, 5 New/Existing,
  // 6 DOJ, 7 S Mobile No, 8 PPOC Name, 9 PPOC Mobile No, 10 Relation,
  // 11 Gender, 12 DOB, 13 Student Email ID, 14 P-Reg-Email ID, 15 Address,
  // 16 Any Allergies, 17 Room & Bed No, 18 House, 19 Food Status,
  // 20 Fee Installment 1, 21 Deposit Amount
  const usn = (cols[1] || '').trim().toUpperCase();
  const name = (cols[2] || '').trim();
  const studentEmail = (cols[13] || '').trim().toLowerCase();
  if (!usn || !name) return null;
  if (!studentEmail) {
    console.warn(`  ⚠ Skipping ${usn} (${name}) — no Student Email ID, cannot create login`);
    return null;
  }

  return {
    usn,
    name,
    division: (cols[3] || '').trim(),
    section: (cols[4] || '').trim(),
    newExisting: (cols[5] || '').trim(),
    doj: (cols[6] || '').trim(),
    smobile: (cols[7] || '').trim(),
    parentName: (cols[8] || '').trim(),
    pmobile: (cols[9] || '').trim(),
    relation: (cols[10] || '').trim() || 'Parent',
    gender: (cols[11] || '').trim(),
    dob: (cols[12] || '').trim(),
    studentEmail,
    parentEmail: (cols[14] || '').trim().toLowerCase(),
    address: (cols[15] || '').trim(),
    allergies: (cols[16] || '').trim(),
    roomBedRaw: (cols[17] || '').trim(),
    house: (cols[18] || '').trim(),
    foodStatusRaw: (cols[19] || '').trim(),
    feeInstallment1: (cols[20] || '').trim(),
    depositAmount: (cols[21] || '').trim(),
  };
}

function parseParentCredsRow(cols: string[]): { usn: string; parentEmail: string; password: string } | null {
  if (cols.length < 5) return null;
  const usn = (cols[2] || '').trim().toUpperCase();
  const parentEmail = (cols[3] || '').trim().toLowerCase();
  const password = (cols[4] || '').trim();
  if (!usn && !parentEmail) return null;
  return { usn, parentEmail, password };
}

// ── MAIN ─────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== seedHostelDB.v2.ts ===  mode: ${EXECUTE ? 'EXECUTE (writes to DB)' : 'DRY RUN (no writes)'}\n`);

  const hostelInfoRows = readCsv(HOSTEL_INFO_PATH);
  const parentCredsRows = fs.existsSync(PARENT_CREDS_PATH) ? readCsv(PARENT_CREDS_PATH) : [];

  const students = hostelInfoRows.map(parseHostelInfoRow).filter((r): r is ParsedStudentRow => r !== null);

  const passwordByUsn = new Map<string, string>();
  const passwordByParentEmail = new Map<string, string>();
  for (const cols of parentCredsRows) {
    const parsed = parseParentCredsRow(cols);
    if (!parsed) continue;
    if (parsed.usn) passwordByUsn.set(parsed.usn, parsed.password);
    if (parsed.parentEmail) passwordByParentEmail.set(parsed.parentEmail, parsed.password);
  }

  // ── validation report ──────────────────────────────────────────────
  const usnCounts = new Map<string, number>();
  const studentEmailCounts = new Map<string, number>();
  for (const s of students) {
    usnCounts.set(s.usn, (usnCounts.get(s.usn) || 0) + 1);
    studentEmailCounts.set(s.studentEmail, (studentEmailCounts.get(s.studentEmail) || 0) + 1);
  }
  const dupUsns = [...usnCounts.entries()].filter(([, c]) => c > 1).map(([u]) => u);
  const dupStudentEmails = [...studentEmailCounts.entries()].filter(([, c]) => c > 1).map(([e]) => e);
  const unparsedRoomBed = students.filter((s) => s.roomBedRaw && !parseRoomBed(s.roomBedRaw).block).map((s) => `${s.usn} ("${s.roomBedRaw}")`);

  console.log(`Students parsed: ${students.length}`);
  if (dupUsns.length) console.log(`  ⚠ Duplicate USNs: ${dupUsns.join(', ')}`);
  if (dupStudentEmails.length) console.log(`  ⚠ Duplicate student login emails: ${dupStudentEmails.join(', ')} — these WILL collide on the unique email index`);
  if (unparsedRoomBed.length) console.log(`  ⚠ Room/bed strings that didn't match the expected pattern (left blank): ${unparsedRoomBed.join(', ')}`);
  console.log('');

  // ── build user + fee documents ─────────────────────────────────────
  // Every login email is resolved and registered BEFORE any document is
  // built, so collisions (e.g. a parent using the same address as their
  // own child's student login) are caught deterministically up front —
  // never discovered mid-write, where the old script's findOne-then-update
  // could silently overwrite the wrong account.
  type UserDoc = Record<string, any>;
  const usersToUpsert: UserDoc[] = [];
  const feesToUpsert: Record<string, any>[] = [];
  const claimedEmails = new Map<string, EmailClaim>();
  const emailCollisions: string[] = [];

  // Pass 1 — register staff emails (fixed, lowest collision risk, but
  // registered first since they're non-negotiable identities).
  for (const staff of STAFF_ACCOUNTS) {
    const email = staff.email.toLowerCase();
    claimedEmails.set(email, { email, role: staff.role });
  }

  // Pass 2 — register every student's own login email. Already validated
  // unique against each other earlier in this run; if a dup somehow slips
  // through here, the second student silently loses their account, so fail
  // loudly instead.
  for (const s of students) {
    if (claimedEmails.has(s.studentEmail)) {
      throw new Error(`Fatal: student email ${s.studentEmail} (${s.usn}) collides with an already-claimed login. Aborting before any writes.`);
    }
    claimedEmails.set(s.studentEmail, { email: s.studentEmail, role: 'student', usn: s.usn });
  }

  // Pass 3 — build student documents (their own email is now guaranteed safe).
  for (const s of students) {
    const { course, dept, year } = deriveCourseDeptYear(s.division);
    const { block, room, bed } = parseRoomBed(s.roomBedRaw);
    const foodStatus = normalizeFoodStatus(s.foodStatusRaw);
    const isNewStudent = s.newExisting.toLowerCase().includes('new');

    usersToUpsert.push({
      name: s.name,
      email: s.studentEmail, // ← FIX: was s.usn.toLowerCase() in v1
      passwordPlain: STUDENT_DEFAULT_PASSWORD,
      role: 'student',
      usn: s.usn,
      studentId: s.usn,
      division: s.division,
      section: s.section,
      roomBedRaw: s.roomBedRaw,
      block,
      room,
      bed,
      course,
      dept,
      year,
      phone: s.smobile,
      parentPhone: s.pmobile,
      parentEmail: s.parentEmail,
      parentName: s.parentName || `Parent of ${s.name}`, // ← FIX: real name, placeholder only if truly missing
      parentRelation: s.relation,
      gender: s.gender,
      dob: s.dob,
      address: s.address,
      allergies: s.allergies,
      isNewStudent,
      house: s.house,
      foodStatus,
      doj: s.doj,
      firstLogin: true,
    });

    // fee record (only if there's something to store)
    const installment1 = parseAmount(s.feeInstallment1);
    const deposit = parseAmount(s.depositAmount);
    if (installment1 !== null || deposit !== null) {
      const installments = [];
      if (installment1 !== null) installments.push({ label: 'First', amount: installment1, paidOn: null });
      feesToUpsert.push({
        studentId: s.usn,
        academicYear: ACADEMIC_YEAR,
        installments,
        depositAmount: deposit,
      });
    }
  }

  // Pass 4 — build parent documents, keyed by their ORIGINAL address so
  // siblings sharing one parent email get ONE account (linkedStudentIds),
  // not a duplicate or a spurious collision.
  const parentAccountByOriginalEmail = new Map<string, { doc: UserDoc }>();

  for (const s of students) {
    if (!s.parentEmail) continue;

    const existingParent = parentAccountByOriginalEmail.get(s.parentEmail);
    if (existingParent) {
      // Sibling case: same family, another child already created this
      // parent's account — link this student instead of duplicating.
      existingParent.doc.linkedStudentIds.push(s.usn);
      continue;
    }

    let loginEmail = s.parentEmail;
    let contactEmail: string | undefined;

    if (claimedEmails.has(s.parentEmail)) {
      const clash = claimedEmails.get(s.parentEmail)!;
      loginEmail = resolveCollidingEmail(s.parentEmail, claimedEmails, s.usn);
      contactEmail = s.parentEmail;
      emailCollisions.push(
        `${s.usn} (${s.name}): parent email "${s.parentEmail}" already used by ${clash.role} account${clash.usn ? ` (${clash.usn})` : ''} — parent login set to "${loginEmail}" instead, real address kept in contactEmail`
      );
    }

    claimedEmails.set(loginEmail, { email: loginEmail, role: 'parent', usn: s.usn });

    const parentPassword = passwordByUsn.get(s.usn) || passwordByParentEmail.get(s.parentEmail) || `Parent@${s.usn}`;
    const doc: UserDoc = {
      name: s.parentName || `Parent of ${s.name}`,
      email: loginEmail,
      contactEmail: contactEmail || '',
      passwordPlain: parentPassword,
      role: 'parent',
      studentId: s.usn,
      linkedStudentIds: [s.usn],
      firstLogin: true,
    };
    usersToUpsert.push(doc);
    parentAccountByOriginalEmail.set(s.parentEmail, { doc });
  }

  for (const staff of STAFF_ACCOUNTS) {
    usersToUpsert.push({
      name: staff.name,
      email: staff.email.toLowerCase(),
      passwordPlain: staff.password,
      role: staff.role,
      firstLogin: false,
    });
  }

  console.log(`Total user accounts to upsert: ${usersToUpsert.length}`);
  console.log(`  - students: ${students.length}`);
  console.log(`  - parents:  ${usersToUpsert.length - students.length - STAFF_ACCOUNTS.length}`);
  console.log(`  - staff:    ${STAFF_ACCOUNTS.length}`);
  console.log(`Fee records to upsert: ${feesToUpsert.length}`);
  if (emailCollisions.length) {
    console.log(`\n⚠ Resolved ${emailCollisions.length} email collision(s) — parent login aliased, real address preserved in contactEmail:`);
    for (const c of emailCollisions) console.log(`    - ${c}`);
  }
  console.log('');

  if (!EXECUTE) {
    console.log('--- DRY RUN: sample of accounts that would be created/updated ---');
    for (const u of usersToUpsert.slice(0, 5)) {
      console.log(`  [${u.role}] login: ${u.email}  name: ${u.name}${u.room ? `  room: ${u.room}${u.bed}` : ''}`);
    }
    console.log(`  ... and ${usersToUpsert.length - 5} more\n`);
    console.log('--- DRY RUN: sample fee records ---');
    for (const f of feesToUpsert.slice(0, 3)) {
      console.log(`  ${f.studentId}: installments=${JSON.stringify(f.installments)} deposit=${f.depositAmount}`);
    }
    console.log('\nNo database writes performed. Re-run with --execute to apply.');
    return;
  }

  // ── execute ───────────────────────────────────────────────────────
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to ${MONGO_URI}`);

  let usersCreated = 0;
  let usersUpdated = 0;

  for (const u of usersToUpsert) {
    const { passwordPlain, ...doc } = u;
    const hashed = await bcrypt.hash(passwordPlain, SALT_ROUNDS);
    const existing = await User.findOne({ email: doc.email });

    if (existing) {
      await User.updateOne({ email: doc.email }, { $set: { ...doc, password: hashed } });
      usersUpdated++;
    } else {
      await User.create({ ...doc, password: hashed });
      usersCreated++;
    }
  }

  let feesCreated = 0;
  let feesUpdated = 0;
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

  console.log(`\nUsers   — created: ${usersCreated}, updated: ${usersUpdated}`);
  console.log(`Fees    — created: ${feesCreated}, updated: ${feesUpdated}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
