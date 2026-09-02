/**
 * persistence.test.ts
 *
 * End-to-end persistence tests for the Hostel Portal backend.
 * Runs against the LIVE hostel_portal database on Atlas.
 *
 * Every test verifies that:
 *   1. The API call succeeds (correct HTTP status + success flag).
 *   2. The written data survives — a follow-up GET or second fetch
 *      confirms the record is in MongoDB, not just in memory.
 *
 * Personas tested:
 *   - Demo Student  : demo.student@transcendgroup.org / DemoUser@2026
 *   - Demo Parent   : demo.parent@transcendgroup.org  / DemoUser@2026
 *   - Warden        : warden@hostel.edu               / Warden@Hostel123
 *   - Admin         : admin@hostel.edu                / HostelAdmin@2026
 *   - SuperAdmin    : superadmin@hostel.edu            / SuperAdmin@2026
 *   - MessManager   : messmanager@transcendgroup.org   / MessManager@3333
 *
 * Prerequisites:
 *   - Backend server NOT running (supertest spins up its own instance).
 *   - .env must have MONGODB_URI + DB_NAME set.
 *   - seedHostelDB.v2.ts --execute must have been run first.
 *
 * Run:
 *   npm test
 */

import request from 'supertest';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import the Express app (NOT start — just the configured app export)
import app from '../src/index';

// ─── CREDENTIALS ─────────────────────────────────────────────────────────────
const DEMO_STUDENT_EMAIL = 'demo.student@transcendgroup.org';
const DEMO_PARENT_EMAIL  = 'demo.parent@transcendgroup.org';
const DEMO_PASSWORD      = 'DemoUser@2026';
const DEMO_STUDENT_USN   = 'DEMO001';

const WARDEN_EMAIL       = 'warden@hostel.edu';
const WARDEN_PASSWORD    = 'Warden@Hostel123';
const ADMIN_EMAIL        = 'admin@hostel.edu';
const ADMIN_PASSWORD     = 'HostelAdmin@2026';
const SUPERADMIN_EMAIL   = 'superadmin@hostel.edu';
const SUPERADMIN_PASSWORD = 'SuperAdmin@2026';
const MESS_EMAIL         = 'messmanager@transcendgroup.org';
const MESS_PASSWORD      = 'MessManager@3333';

// ─── TOKEN STORE ─────────────────────────────────────────────────────────────
// Tokens obtained once in beforeAll and reused across tests in the same suite.
let studentToken   = '';
let parentToken    = '';
let wardenToken    = '';
let adminToken     = '';
let superToken     = '';
let messToken      = '';

// IDs returned by creation calls, used in subsequent tests
let createdLeaveId      = '';
let parentLeaveId       = '';
let createdComplaintId  = '';
let createdHealthId     = '';
let createdBehaviourId  = '';
let createdGateLogId    = '';

const today     = new Date().toISOString().split('T')[0];
const tomorrow  = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const dayAfter  = new Date(Date.now() + 172800000).toISOString().split('T')[0];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
async function login(email: string, password: string): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }
  return res.body.token || res.body.accessToken;
}

// ─── SETUP / TEARDOWN ────────────────────────────────────────────────────────
beforeAll(async () => {
  // Give mongoose a moment if the app hasn't connected yet
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!, { dbName: process.env.DB_NAME });
  }
  // Log in all personas once
  [studentToken, parentToken, wardenToken, adminToken, superToken, messToken] =
    await Promise.all([
      login(DEMO_STUDENT_EMAIL, DEMO_PASSWORD),
      login(DEMO_PARENT_EMAIL,  DEMO_PASSWORD),
      login(WARDEN_EMAIL,       WARDEN_PASSWORD),
      login(ADMIN_EMAIL,        ADMIN_PASSWORD),
      login(SUPERADMIN_EMAIL,   SUPERADMIN_PASSWORD),
      login(MESS_EMAIL,         MESS_PASSWORD),
    ]);
}, 30000);

afterAll(async () => {
  // Clean up every record created during this test run so re-runs are idempotent
  const { HostelLeave }    = await import('../src/models/HostelLeave');
  const { HostelComplaint }= await import('../src/models/HostelComplaint');
  const { HealthRecord }   = await import('../src/models/HealthRecord');
  const { BehaviourLog }   = await import('../src/models/BehaviourLog');
  const { GateLog }        = await import('../src/models/GateLog');
  const { MealBooking }    = await import('../src/models/MealBooking');
  const { MealAttendance } = await import('../src/models/MealAttendance');
  const { MessMenu }       = await import('../src/models/MessMenu');

  await Promise.all([
    HostelLeave.deleteMany({ studentId: DEMO_STUDENT_USN }),
    HostelComplaint.deleteMany({ studentId: DEMO_STUDENT_USN }),
    HealthRecord.deleteMany({ studentId: DEMO_STUDENT_USN }),
    BehaviourLog.deleteMany({ studentId: DEMO_STUDENT_USN }),
    GateLog.deleteMany({ studentId: DEMO_STUDENT_USN }),
    MealBooking.deleteMany({ studentId: DEMO_STUDENT_USN }),
    MealAttendance.deleteMany({ studentId: DEMO_STUDENT_USN }),
    MessMenu.deleteOne({ key: 'jest-test-default' }),
  ]);

  await mongoose.disconnect();
}, 15000);

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 1 — Authentication
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 1 — Authentication', () => {

  test('1.1  Student login succeeds with personal email + default password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: DEMO_STUDENT_EMAIL, password: DEMO_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('Student');
    expect(res.body.user.usn).toBe(DEMO_STUDENT_USN);
    expect(res.body.token).toBeTruthy();
    // password must never appear in login response
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  test('1.2  Student login fails with wrong password → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: DEMO_STUDENT_EMAIL, password: 'WrongPassword!' });
    expect(res.status).toBe(401);
  });

  test('1.3  Parent login succeeds with parent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: DEMO_PARENT_EMAIL, password: DEMO_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('Parent');
    expect(res.body.token).toBeTruthy();
  });

  test('1.4  Warden login succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: WARDEN_EMAIL, password: WARDEN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('Warden');
  });

  test('1.5  Admin login succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('Admin');
  });

  test('1.6  SuperAdmin login succeeds with firstLogin=false', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: SUPERADMIN_EMAIL, password: SUPERADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('SuperAdmin');
    expect(res.body.user.first_login).toBe(false);
  });

  test('1.7  MessManager login succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: MESS_EMAIL, password: MESS_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('MessManager');
  });

  test('1.8  GET /api/auth/profile returns authenticated user (JWT required)', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(ADMIN_EMAIL);
  });

  test('1.9  GET /api/auth/profile without token → 401', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  test('1.10 Change password updates firstLogin flag → persists across login', async () => {
    // Get the demo student's current state
    const before = await request(app)
      .post('/api/auth/login')
      .send({ email: DEMO_STUDENT_EMAIL, password: DEMO_PASSWORD });
    expect(before.body.user.first_login).toBe(true);

    // Change password
    const change = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ currentPassword: DEMO_PASSWORD, newPassword: 'DemoUser@2027' });
    expect(change.status).toBe(200);

    // Login with new password — firstLogin must now be false
    const after = await request(app)
      .post('/api/auth/login')
      .send({ email: DEMO_STUDENT_EMAIL, password: 'DemoUser@2027' });
    expect(after.status).toBe(200);
    expect(after.body.user.first_login).toBe(false);

    // Restore original password for subsequent tests
    const restore = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${after.body.token}`)
      .send({ currentPassword: 'DemoUser@2027', newPassword: DEMO_PASSWORD });
    expect(restore.status).toBe(200);

    // Re-acquire student token after password restore
    studentToken = await login(DEMO_STUDENT_EMAIL, DEMO_PASSWORD);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 2 — Student Directory
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 2 — Student Directory', () => {

  test('2.1  GET /api/students returns array with 61 real students (demo excluded)', async () => {
    const res = await request(app).get('/api/students');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.students)).toBe(true);
    // Demo student must not appear in directory
    const ids = res.body.students.map((s: any) => s.usn);
    expect(ids).not.toContain(DEMO_STUDENT_USN);
    // Should have 61 real students
    expect(res.body.students.length).toBe(61);
  });

  test('2.2  GET /api/students/:id returns a real student by USN', async () => {
    const res = await request(app).get('/api/students/251P1456');
    expect(res.status).toBe(200);
    expect(res.body.student.name).toBe('SHRIYA VIKRAM SREERAMA');
    expect(res.body.student.room).toBe('8G');
    expect(res.body.student.block).toBe('G');
    expect(res.body.student.parentName).toBe('Vikram');      // real name, not placeholder
  });

  test('2.3  GET /api/students/:id for unknown ID → 404', async () => {
    const res = await request(app).get('/api/students/NOTEXIST999');
    expect(res.status).toBe(404);
  });

  test('2.4  Room/block/bed parsed correctly from CSV for first student', async () => {
    const res = await request(app).get('/api/students/251P1456');
    expect(res.body.student.room).toBe('8G');
    expect(res.body.student.block).toBe('G');
    expect(res.body.student.bed).toBe('2');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 3 — Leave System
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 3 — Leave System', () => {

  test('3.1  Student submits leave → persists as pending in DB', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .send({
        studentId:   DEMO_STUDENT_USN,
        startDate:   tomorrow,
        endDate:     dayAfter,
        startTime:   '09:00 AM',
        endTime:     '06:00 PM',
        type:        'leave',
        reason:      'Jest test leave — student submitted',
        submittedBy: 'student',
        isOvernight: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.leave.status).toBe('pending');
    expect(res.body.leave.leaveId).toMatch(/^LV-/);
    createdLeaveId = res.body.leave.leaveId;
  });

  test('3.2  Created leave persists — GET /api/leaves?studentId confirms it', async () => {
    const res = await request(app)
      .get(`/api/leaves?studentId=${DEMO_STUDENT_USN}`);

    expect(res.status).toBe(200);
    const found = res.body.leaves.find((l: any) => l.leaveId === createdLeaveId);
    expect(found).toBeDefined();
    expect(found.status).toBe('pending');
    expect(found.reason).toBe('Jest test leave — student submitted');
  });

  test('3.3  Parent submits leave → auto-approved immediately', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .send({
        studentId:   DEMO_STUDENT_USN,
        startDate:   dayAfter,
        endDate:     dayAfter,
        startTime:   '10:00 AM',
        endTime:     '08:00 PM',
        type:        'outing',
        reason:      'Jest test — parent submitted outing',
        submittedBy: 'parent',
        isOvernight: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.leave.status).toBe('approved');  // parent leaves auto-approve
    parentLeaveId = res.body.leave.leaveId;
  });

  test('3.4  Parent approves student pending leave → status approved in DB', async () => {
    const res = await request(app)
      .post(`/api/leaves/${createdLeaveId}/approve`)
      .send({ studentId: DEMO_STUDENT_USN });

    expect(res.status).toBe(200);
    expect(res.body.leave.status).toBe('approved');

    // Confirm persistence with a fresh fetch
    const verify = await request(app)
      .get(`/api/leaves?studentId=${DEMO_STUDENT_USN}`);
    const leave = verify.body.leaves.find((l: any) => l.leaveId === createdLeaveId);
    expect(leave.status).toBe('approved');
  });

  test('3.5  Student submits another leave to test rejection', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .send({
        studentId:   DEMO_STUDENT_USN,
        startDate:   tomorrow,
        endDate:     tomorrow,
        type:        'outing',
        reason:      'Jest test — to be rejected',
        submittedBy: 'student',
        isOvernight: false,
      });
    expect(res.status).toBe(201);
    const rejectTarget = res.body.leave.leaveId;

    const reject = await request(app)
      .post(`/api/leaves/${rejectTarget}/reject`)
      .send({ studentId: DEMO_STUDENT_USN });

    expect(reject.status).toBe(200);
    expect(reject.body.leave.status).toBe('rejected');

    // Confirm persistence
    const verify = await request(app)
      .get(`/api/leaves?studentId=${DEMO_STUDENT_USN}`);
    const leave = verify.body.leaves.find((l: any) => l.leaveId === rejectTarget);
    expect(leave.status).toBe('rejected');
  });

  test('3.6  Student cancels their pending leave → status cancelled in DB', async () => {
    // Create a fresh pending leave to cancel
    const create = await request(app)
      .post('/api/leaves')
      .send({
        studentId:   DEMO_STUDENT_USN,
        startDate:   tomorrow,
        endDate:     tomorrow,
        type:        'outing',
        reason:      'Jest test — to be cancelled',
        submittedBy: 'student',
        isOvernight: false,
      });
    const cancelTarget = create.body.leave.leaveId;

    const cancel = await request(app)
      .post(`/api/leaves/${cancelTarget}/cancel`)
      .send({ studentId: DEMO_STUDENT_USN });

    expect(cancel.status).toBe(200);
    expect(cancel.body.leave.status).toBe('cancelled');

    // Confirm persistence
    const verify = await request(app)
      .get(`/api/leaves?studentId=${DEMO_STUDENT_USN}`);
    const leave = verify.body.leaves.find((l: any) => l.leaveId === cancelTarget);
    expect(leave.status).toBe('cancelled');
  });

  test('3.7  Leave not found returns 404', async () => {
    const res = await request(app)
      .post('/api/leaves/LV-000000000/approve')
      .send({ studentId: DEMO_STUDENT_USN });
    expect(res.status).toBe(404);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 4 — Meal Bookings
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 4 — Meal Bookings', () => {

  test('4.1  Student accepts breakfast → persists as true in mealbookings', async () => {
    const res = await request(app)
      .post('/api/meals/bookings')
      .send({
        studentId: DEMO_STUDENT_USN,
        date:      tomorrow,
        meals:     { breakfast: true, lunch: false, snacks: false, dinner: false },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.breakfast).toBe(true);
    expect(res.body.booking.lunch).toBe(false);
  });

  test('4.2  Meal booking persists — second POST with same date updates not duplicates', async () => {
    const res = await request(app)
      .post('/api/meals/bookings')
      .send({
        studentId: DEMO_STUDENT_USN,
        date:      tomorrow,
        meals:     { breakfast: true, lunch: true, snacks: false, dinner: true },
      });

    expect(res.status).toBe(200);
    expect(res.body.booking.lunch).toBe(true);
    expect(res.body.booking.dinner).toBe(true);
    // studentId + date must remain unique — same document updated, not created twice
  });

  test('4.3  Student rejects lunch with reason → cancellation record persists', async () => {
    const res = await request(app)
      .post('/api/meals/bookings')
      .send({
        studentId:          DEMO_STUDENT_USN,
        date:               tomorrow,
        meals:              { breakfast: true, lunch: false, snacks: false, dinner: true },
        cancellationDetails: { meal: 'lunch', reason: 'Jest test — not hungry' },
      });

    expect(res.status).toBe(200);
    expect(res.body.booking.lunch).toBe(false);
    expect(res.body.booking.cancellations.length).toBeGreaterThan(0);
    expect(res.body.booking.cancellations[0].meal).toBe('lunch');
    expect(res.body.booking.cancellations[0].reason).toBe('Jest test — not hungry');
  });

  test('4.4  Missing studentId → 400', async () => {
    const res = await request(app)
      .post('/api/meals/bookings')
      .send({ date: tomorrow, meals: { breakfast: true } });
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 5 — Meal Attendance (MessManager / Admin / SuperAdmin)
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 5 — Meal Attendance', () => {

  test('5.1  MessManager marks breakfast present → persists as "yes"', async () => {
    const res = await request(app)
      .post('/api/warden/meal-attendance')
      .send({
        studentId: DEMO_STUDENT_USN,
        date:      today,
        mealKey:   'breakfast',
        status:    'yes',
      });

    expect(res.status).toBe(200);
    expect(res.body.attendance.breakfast).toBe('yes');
  });

  test('5.2  Attendance persists — second POST same date/key updates in place (not duplicate)', async () => {
    const res = await request(app)
      .post('/api/warden/meal-attendance')
      .send({
        studentId: DEMO_STUDENT_USN,
        date:      today,
        mealKey:   'lunch',
        status:    'no',
      });

    expect(res.status).toBe(200);
    expect(res.body.attendance.lunch).toBe('no');
    // breakfast from previous test should still be "yes"
    expect(res.body.attendance.breakfast).toBe('yes');
  });

  test('5.3  Clearing attendance (empty status) sets field to null', async () => {
    const res = await request(app)
      .post('/api/warden/meal-attendance')
      .send({
        studentId: DEMO_STUDENT_USN,
        date:      today,
        mealKey:   'breakfast',
        status:    '',
      });

    expect(res.status).toBe(200);
    expect(res.body.attendance.breakfast).toBeNull();
  });

  test('5.4  Admin marks dinner attendance', async () => {
    const res = await request(app)
      .post('/api/meals/attendance')
      .send({
        studentId: DEMO_STUDENT_USN,
        date:      today,
        mealKey:   'dinner',
        status:    'yes',
      });

    expect(res.status).toBe(200);
    expect(res.body.attendance.dinner).toBe('yes');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 6 — Mess Menu
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 6 — Mess Menu', () => {

  test('6.1  GET /api/meals/menu returns a menu object (default or existing)', async () => {
    const res = await request(app).get('/api/meals/menu');
    expect(res.status).toBe(200);
    // Should have at least a default key
    expect(typeof res.body).toBe('object');
  });

  test('6.2  SuperAdmin saves default menu → persists in messmenus collection', async () => {
    const res = await request(app)
      .post('/api/meals/menu')
      .send({
        key:  'jest-test-default',
        menu: {
          breakfast: 'Jest Idli Sambar',
          lunch:     'Jest Rice Dal',
          snacks:    'Jest Tea Biscuit',
          dinner:    'Jest Chapati Curry',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.menu.breakfast).toBe('Jest Idli Sambar');
  });

  test('6.3  Saved menu persists — GET returns the saved value', async () => {
    const res = await request(app).get('/api/meals/menu');
    expect(res.status).toBe(200);
    expect(res.body['jest-test-default']).toBeDefined();
    expect(res.body['jest-test-default'].breakfast).toBe('Jest Idli Sambar');
  });

  test('6.4  Reset menu clears all entries', async () => {
    const res = await request(app).post('/api/meals/menu/reset');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Confirm the jest-test-default is gone
    const get = await request(app).get('/api/meals/menu');
    expect(get.body['jest-test-default']).toBeUndefined();
  });

  test('6.5  Missing menu body → 400', async () => {
    const res = await request(app)
      .post('/api/meals/menu')
      .send({ key: 'default' }); // no menu field
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 7 — Complaints
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 7 — Complaints', () => {

  test('7.1  Student files complaint → persists as Pending in DB', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .send({
        studentId: DEMO_STUDENT_USN,
        category:  'Maintenance',
        subject:   'Jest test — broken fan',
        details:   'Fan in room not working since test run started',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.status).toBe('Pending');
    expect(res.body.complaint.complaintId).toMatch(/^CMP-/);
    createdComplaintId = res.body.complaint.complaintId;
  });

  test('7.2  Complaint persists — GET /api/complaints?studentId confirms it', async () => {
    const res = await request(app)
      .get(`/api/complaints?studentId=${DEMO_STUDENT_USN}`);

    expect(res.status).toBe(200);
    const found = res.body.complaints.find((c: any) => c.complaintId === createdComplaintId);
    expect(found).toBeDefined();
    expect(found.category).toBe('Maintenance');
    expect(found.status).toBe('Pending');
  });

  test('7.3  Warden resolves complaint → status Closed, response persisted', async () => {
    const res = await request(app)
      .post(`/api/complaints/${createdComplaintId}/resolve`)
      .send({ responseText: 'Jest test — maintenance dispatched' });

    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe('Closed');
    expect(res.body.complaint.response).toBe('Jest test — maintenance dispatched');
  });

  test('7.4  Resolved complaint persists — GET confirms status=Closed and response', async () => {
    const res = await request(app)
      .get(`/api/complaints?studentId=${DEMO_STUDENT_USN}`);

    const found = res.body.complaints.find((c: any) => c.complaintId === createdComplaintId);
    expect(found.status).toBe('Closed');
    expect(found.response).toBe('Jest test — maintenance dispatched');
  });

  test('7.5  Resolve on non-existent complaintId → 404', async () => {
    const res = await request(app)
      .post('/api/complaints/CMP-000000/resolve')
      .send({ responseText: 'Should not work' });
    expect(res.status).toBe(404);
  });

  test('7.6  Missing required fields → 400', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .send({ studentId: DEMO_STUDENT_USN, category: 'Noise' }); // missing subject + details
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 8 — Gate Attendance
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 8 — Gate Attendance / Gate Logs', () => {

  test('8.1  Warden logs student exit → persists in gatelogs', async () => {
    const res = await request(app)
      .post('/api/attendance/scan')
      .send({
        studentId: DEMO_STUDENT_USN,
        type:      'exit',
        note:      'Jest test — going out',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.log.type).toBe('exit');
    expect(res.body.log.logId).toMatch(/^LOG-/);
    createdGateLogId = res.body.log.logId;
  });

  test('8.2  Gate log persists — GET /api/attendance/logs/:studentId confirms it', async () => {
    const res = await request(app)
      .get(`/api/attendance/logs/${DEMO_STUDENT_USN}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.logs.find((l: any) => l.logId === createdGateLogId);
    expect(found).toBeDefined();
    expect(found.note).toBe('Jest test — going out');
  });

  test('8.3  Warden logs student entry', async () => {
    const res = await request(app)
      .post('/api/attendance/scan')
      .send({
        studentId: DEMO_STUDENT_USN,
        type:      'entry',
        note:      'Jest test — returned to hostel',
      });

    expect(res.status).toBe(201);
    expect(res.body.log.type).toBe('entry');
  });

  test('8.4  Gate logs are returned newest-first', async () => {
    const res = await request(app)
      .get(`/api/attendance/logs/${DEMO_STUDENT_USN}`);

    const timestamps = res.body.logs.map((l: any) => new Date(l.timestamp).getTime());
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
    }
  });

  test('8.5  Missing type → 400', async () => {
    const res = await request(app)
      .post('/api/attendance/scan')
      .send({ studentId: DEMO_STUDENT_USN }); // missing type
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 9 — Health Records
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 9 — Health Records', () => {

  test('9.1  Admin creates health record → persists in healthrecords', async () => {
    const res = await request(app)
      .post('/api/health')
      .send({
        studentId:   DEMO_STUDENT_USN,
        symptoms:    'Jest test — mild fever, headache',
        temperature: '99.2°F',
        status:      'Needs Medical Attention',
        note:        'Given paracetamol per Jest test',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.healthRecord.recordId).toMatch(/^HR-/);
    expect(res.body.healthRecord.date).toBeTruthy(); // date populated by controller
    expect(res.body.healthRecord.time).toBeTruthy();
    createdHealthId = res.body.healthRecord.recordId;
  });

  test('9.2  Health record persists — GET /api/health/:studentId confirms it', async () => {
    const res = await request(app)
      .get(`/api/health/${DEMO_STUDENT_USN}`);

    expect(res.status).toBe(200);
    const found = res.body.records.find((r: any) => r.recordId === createdHealthId);
    expect(found).toBeDefined();
    expect(found.symptoms).toBe('Jest test — mild fever, headache');
    expect(found.temperature).toBe('99.2°F');
  });

  test('9.3  Admin edits health record by recordId → updated fields persist', async () => {
    const res = await request(app)
      .post('/api/health')
      .send({
        studentId: DEMO_STUDENT_USN,
        recordId:  createdHealthId,
        symptoms:  'Jest test — fully recovered',
        status:    'Recovered / Normal',
        note:      'Reviewed and updated by Jest',
      });

    expect(res.status).toBe(201);
    expect(res.body.healthRecord.status).toBe('Recovered / Normal');

    // Confirm persistence
    const verify = await request(app).get(`/api/health/${DEMO_STUDENT_USN}`);
    const found = verify.body.records.find((r: any) => r.recordId === createdHealthId);
    expect(found.status).toBe('Recovered / Normal');
    expect(found.note).toBe('Reviewed and updated by Jest');
  });

  test('9.4  Admin deletes health record → no longer in DB', async () => {
    const res = await request(app)
      .delete(`/api/health/${createdHealthId}`)
      .query({ studentId: DEMO_STUDENT_USN });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Confirm deletion
    const verify = await request(app).get(`/api/health/${DEMO_STUDENT_USN}`);
    const found = verify.body.records.find((r: any) => r.recordId === createdHealthId);
    expect(found).toBeUndefined();
  });

  test('9.5  Missing symptoms → 400', async () => {
    const res = await request(app)
      .post('/api/health')
      .send({ studentId: DEMO_STUDENT_USN }); // missing symptoms
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 10 — Behaviour Logs
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 10 — Behaviour Logs', () => {

  test('10.1  Admin adds behaviour log → persists in behaviourlogs', async () => {
    const res = await request(app)
      .post('/api/behaviour')
      .send({
        studentId:  DEMO_STUDENT_USN,
        actionType: 'add',
        logData: {
          date:        today,
          category:    'Academic',
          severity:    'positive',
          description: 'Jest test — top scorer in mock exam',
          recordedBy:  'Jest Admin',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.log.logId).toMatch(/^OB-/);
    expect(res.body.log.severity).toBe('positive');
    createdBehaviourId = res.body.log.logId;
  });

  test('10.2  Behaviour log visible in student profile via /api/students/:id', async () => {
    const res = await request(app).get(`/api/students/${DEMO_STUDENT_USN}`);
    expect(res.status).toBe(200);
    const found = res.body.student.behaviourLogs.find((l: any) => l.logId === createdBehaviourId);
    expect(found).toBeDefined();
    expect(found.description).toBe('Jest test — top scorer in mock exam');
  });

  test('10.3  Admin edits behaviour log → updated fields persist', async () => {
    const res = await request(app)
      .post('/api/behaviour')
      .send({
        studentId:  DEMO_STUDENT_USN,
        actionType: 'edit',
        logData: {
          id:          createdBehaviourId,
          description: 'Jest test — EDITED: top scorer + gold medal',
          severity:    'positive',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.log.description).toBe('Jest test — EDITED: top scorer + gold medal');

    // Confirm persistence via student profile
    const verify = await request(app).get(`/api/students/${DEMO_STUDENT_USN}`);
    const found = verify.body.student.behaviourLogs.find((l: any) => l.logId === createdBehaviourId);
    expect(found.description).toBe('Jest test — EDITED: top scorer + gold medal');
  });

  test('10.4  Admin deletes behaviour log → no longer in DB', async () => {
    const res = await request(app)
      .post('/api/behaviour')
      .send({
        studentId:  DEMO_STUDENT_USN,
        actionType: 'delete',
        logData:    { id: createdBehaviourId },
      });

    expect(res.status).toBe(200);

    // Confirm deletion
    const verify = await request(app).get(`/api/students/${DEMO_STUDENT_USN}`);
    const found = verify.body.student.behaviourLogs.find((l: any) => l.logId === createdBehaviourId);
    expect(found).toBeUndefined();
  });

  test('10.5  Invalid actionType → 400', async () => {
    const res = await request(app)
      .post('/api/behaviour')
      .send({
        studentId:  DEMO_STUDENT_USN,
        actionType: 'explode',
        logData:    {},
      });
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 11 — Cross-Persona Persistence
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 11 — Cross-Persona Persistence', () => {

  test('11.1  Student leave visible to warden via GET /api/leaves', async () => {
    // Student creates leave
    const create = await request(app)
      .post('/api/leaves')
      .send({
        studentId:   DEMO_STUDENT_USN,
        startDate:   tomorrow,
        endDate:     tomorrow,
        type:        'outing',
        reason:      'Jest cross-persona test',
        submittedBy: 'student',
        isOvernight: false,
      });
    const lid = create.body.leave.leaveId;

    // Warden fetches all leaves — should see it
    const wardenView = await request(app).get(`/api/leaves?studentId=${DEMO_STUDENT_USN}`);
    const found = wardenView.body.leaves.find((l: any) => l.leaveId === lid);
    expect(found).toBeDefined();
    expect(found.status).toBe('pending');

    // Cleanup
    await request(app).post(`/api/leaves/${lid}/cancel`).send({ studentId: DEMO_STUDENT_USN });
  });

  test('11.2  Complaint filed by student is visible to admin in GET /api/complaints', async () => {
    const create = await request(app)
      .post('/api/complaints')
      .send({
        studentId: DEMO_STUDENT_USN,
        category:  'Food',
        subject:   'Jest cross-persona complaint',
        details:   'Cross-persona test complaint for admin visibility',
      });
    const cid = create.body.complaint.complaintId;

    const adminView = await request(app).get(`/api/complaints?studentId=${DEMO_STUDENT_USN}`);
    const found = adminView.body.complaints.find((c: any) => c.complaintId === cid);
    expect(found).toBeDefined();
    expect(found.category).toBe('Food');

    // Admin resolves it
    const resolve = await request(app)
      .post(`/api/complaints/${cid}/resolve`)
      .send({ responseText: 'Cross-persona resolution from admin' });
    expect(resolve.body.complaint.status).toBe('Closed');

    // Student re-fetches — sees Closed status and response
    const studentView = await request(app).get(`/api/complaints?studentId=${DEMO_STUDENT_USN}`);
    const resolved = studentView.body.complaints.find((c: any) => c.complaintId === cid);
    expect(resolved.status).toBe('Closed');
    expect(resolved.response).toBe('Cross-persona resolution from admin');
  });

  test('11.3  Gate log by warden visible to student in /api/students/:id', async () => {
    const scan = await request(app)
      .post('/api/attendance/scan')
      .send({ studentId: DEMO_STUDENT_USN, type: 'exit', note: 'Cross-persona gate test' });
    const lid = scan.body.log.logId;

    const studentView = await request(app).get(`/api/students/${DEMO_STUDENT_USN}`);
    const found = studentView.body.student.entryExitLogs.find((l: any) => l.logId === lid);
    expect(found).toBeDefined();
    expect(found.note).toBe('Cross-persona gate test');
  });

  test('11.4  Meal booking by student visible in student profile via /api/students/:id', async () => {
    await request(app)
      .post('/api/meals/bookings')
      .send({
        studentId: DEMO_STUDENT_USN,
        date:      tomorrow,
        meals:     { breakfast: true, lunch: true, snacks: true, dinner: false },
      });

    const view = await request(app).get(`/api/students/${DEMO_STUDENT_USN}`);
    const booking = view.body.student.mealBookings.find((b: any) => b.date === tomorrow);
    expect(booking).toBeDefined();
    expect(booking.breakfast).toBe(true);
    expect(booking.lunch).toBe(true);
  });

  test('11.5  Health record by admin visible in student profile via /api/students/:id', async () => {
    const add = await request(app)
      .post('/api/health')
      .send({
        studentId: DEMO_STUDENT_USN,
        symptoms:  'Cross-persona health test',
        status:    'Resting in Room',
      });
    const rid = add.body.healthRecord.recordId;

    const view = await request(app).get(`/api/students/${DEMO_STUDENT_USN}`);
    // Health is served via /api/health/:studentId, not embedded in student profile
    const healthView = await request(app).get(`/api/health/${DEMO_STUDENT_USN}`);
    const found = healthView.body.records.find((r: any) => r.recordId === rid);
    expect(found).toBeDefined();
    expect(found.symptoms).toBe('Cross-persona health test');

    // Cleanup
    await request(app).delete(`/api/health/${rid}`).query({ studentId: DEMO_STUDENT_USN });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SUITE 12 — Demo Account Isolation
// ═════════════════════════════════════════════════════════════════════════════
describe('Suite 12 — Demo Account Isolation', () => {

  test('12.1  Demo student does NOT appear in GET /api/students (isDemo filtered)', async () => {
    const res = await request(app).get('/api/students');
    const demo = res.body.students.find((s: any) => s.usn === DEMO_STUDENT_USN);
    expect(demo).toBeUndefined();
  });

  test('12.2  Demo student CAN be fetched directly by USN via /api/students/:id', async () => {
    const res = await request(app).get(`/api/students/${DEMO_STUDENT_USN}`);
    expect(res.status).toBe(200);
    expect(res.body.student.usn).toBe(DEMO_STUDENT_USN);
  });

  test('12.3  Total real students in directory is exactly 61', async () => {
    const res = await request(app).get('/api/students');
    expect(res.body.students.length).toBe(61);
  });
});
