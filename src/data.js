// src/data.js

// Mock data generator for 350 students
const FIRST_NAMES = [
  "Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Krishna", "Ishaan", "Shaurya", "Pranav", "Aryan",
  "Kabir", "Rohan", "Rahul", "Ananya", "Diya", "Isha", "Riya", "Aanya", "Kavya", "Sanya",
  "Pooja", "Neha", "Amit", "Sumit", "Vikram", "Sneha", "Aditi", "Meera", "Karan", "Siddharth",
  "Dev", "Rudra", "Varun", "Rishi", "Yash", "Tanvi", "Shruti", "Avani", "Ridhi", "Mehak"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Mehra", "Joshi", "Patel", "Reddy", "Rao", "Nair", "Iyer",
  "Singh", "Kumar", "Chawla", "Sen", "Das", "Roy", "Bose", "Mishra", "Pandey", "Choudhury",
  "Pillai", "Naidu", "Gill", "Kapoor", "Malhotra", "Mehta", "Bhat", "Dubey", "Trivedi", "Saxena"
];

const BLOCKS = ["A", "B", "C", "D"];

// Room sharing config: rooms ending in 01/02 = 3-sharing, 03/04 = 2-sharing
const SHARING_TYPE = { '01': 3, '02': 3, '03': 2, '04': 2 };
const BED_LABELS_2 = ['Bed A', 'Bed B'];
const BED_LABELS_3 = ['Bed A', 'Bed B', 'Bed C'];

function generateRandomStudent(index) {
  // Fixed demo student roster — ordered for reproducibility
  const ROSTER = [
    { firstName: 'Aarav',     lastName: 'Sharma',   usn: 'TCG2021CS001', course: 'B.E. Computer Science',    dept: 'CSE', year: 3, phone: '+91 98765 10001', parentEmail: 'rajesh.sharma@transcendgroup.org',  parentName: 'Rajesh Sharma'  },
    { firstName: 'Priya',     lastName: 'Nair',     usn: 'TCG2021EC002', course: 'B.E. Electronics',          dept: 'ECE', year: 3, phone: '+91 98765 10002', parentEmail: 'sunita.nair@transcendgroup.org',   parentName: 'Sunita Nair'    },
    { firstName: 'Vihaan',    lastName: 'Verma',    usn: 'TCG2022ME003', course: 'B.E. Mechanical',           dept: 'ME',  year: 2, phone: '+91 98765 10003', parentEmail: 'parent.vihaan.verma@hostel.edu',   parentName: 'Parent of Vihaan' },
    { firstName: 'Aditya',    lastName: 'Bhat',     usn: 'TCG2022CS004', course: 'B.E. Computer Science',    dept: 'CSE', year: 2, phone: '+91 98765 10004', parentEmail: 'parent.aditya.bhat@hostel.edu',    parentName: 'Parent of Aditya' },
    { firstName: 'Siddharth', lastName: 'Pillai',   usn: 'TCG2023EE005', course: 'B.E. Electrical',           dept: 'EE',  year: 1, phone: '+91 98765 10005', parentEmail: 'parent.siddharth.pillai@hostel.edu', parentName: 'Parent of Siddharth' },
    { firstName: 'Krishna',   lastName: 'Verma',    usn: 'TCG2022CS006', course: 'B.E. Computer Science',    dept: 'CSE', year: 2, phone: '+91 98765 10006', parentEmail: 'parent.krishna.verma@hostel.edu',  parentName: 'Parent of Krishna' },
    { firstName: 'Kavya',     lastName: 'Reddy',    usn: 'TCG2023CE007', course: 'B.E. Civil Engineering',    dept: 'CE',  year: 1, phone: '+91 98765 10007', parentEmail: 'parent.kavya.reddy@hostel.edu',    parentName: 'Parent of Kavya' },
  ];

  const entry = ROSTER[(index - 1) % ROSTER.length];
  const { firstName, lastName, usn, course, dept, year, phone, parentEmail, parentName } = entry;
  const name = `${firstName} ${lastName}`;

  const id = `STU${String(index).padStart(3, '0')}`;
  const block = BLOCKS[(index - 1) % BLOCKS.length];
  const floor = ((index - 1) % 4) + 1;
  const roomSuffix = ['01', '02', '03', '04'][(index - 1) % 4];
  const room = `${block}-${floor}${roomSuffix}`;
  const sharing = SHARING_TYPE[roomSuffix] || 2;
  const bedLabels = sharing === 3 ? BED_LABELS_3 : BED_LABELS_2;
  const bed = bedLabels[(index - 1) % bedLabels.length];

  // Use @transcendgroup.org for the first two flagship demo accounts
  const emailDomain = index <= 2 ? 'transcendgroup.org' : 'hostel.edu';
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;

  return {
    id,
    name,
    usn,
    room,
    block,
    bed,
    sharing,
    course,
    dept,
    year,
    email,
    phone,
    parentEmail,
    parentName,
    leaves: [],
    mealBookings: [],
    complaints: [],
    entryExitLogs: [],
    healthRecords: [],
    behaviourLogs: []
  };
}

// Generate Date String in YYYY-MM-DD
export function getDateString(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format Date for Display
export function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Meal booking cutoff: 8:00 AM on the day before (24 hours before 8:00 AM on the target day)
const MEAL_BOOKING_CUTOFF_HOUR = 8;

export function getMealBookingDeadline(dateStr) {
  const targetDayCutoff = new Date(`${dateStr}T${String(MEAL_BOOKING_CUTOFF_HOUR).padStart(2, '0')}:00:00`);
  return targetDayCutoff.getTime() - (24 * 60 * 60 * 1000);
}

export function hasMealBookingDeadlinePassed(dateStr) {
  return Date.now() > getMealBookingDeadline(dateStr);
}

export function hasMealBeenRejected(student, dateStr, mealKey) {
  return !!(student.mealCancellations && student.mealCancellations.some(
    c => c.date === dateStr && c.meal === mealKey
  ));
}

export function formatMealBookingDeadline(dateStr) {
  const deadline = new Date(getMealBookingDeadline(dateStr));
  return deadline.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Check if a date falls in a student's approved or pending leaves
export function isStudentOnLeave(student, dateStr) {
  const targetTime = new Date(dateStr).getTime();
  return student.leaves.some(leave => {
    if (leave.status === 'rejected') return false;
    const start = new Date(leave.startDate).getTime();
    const end = new Date(leave.endDate).getTime();
    return targetTime >= start && targetTime <= end;
  });
}

// Check if a meal is booked/accepted for a student at a given date
export function isMealBooked(student, dateStr, mealKey) {
  // If student is on leave, they shouldn't have meals
  if (isStudentOnLeave(student, dateStr)) {
    return false;
  }
  // If explicitly rejected, it is not booked
  if (hasMealBeenRejected(student, dateStr, mealKey)) {
    return false;
  }
  // If deadline has passed, it is auto accepted
  if (hasMealBookingDeadlinePassed(dateStr)) {
    return true;
  }
  // Otherwise check if explicitly booked
  const booking = student.mealBookings.find(b => b.date === dateStr);
  return booking ? !!booking[mealKey] : false;
}

// Returns the acceptance type for a meal:
// 'manual'   – student explicitly accepted before deadline
// 'auto'     – deadline passed, not rejected → auto-accepted
// 'rejected' – explicitly rejected by student
// 'opted-out'– before deadline, not yet accepted
// 'leave'    – student is on leave
export function getMealAcceptanceType(student, dateStr, mealKey) {
  if (isStudentOnLeave(student, dateStr)) return 'leave';
  if (hasMealBeenRejected(student, dateStr, mealKey)) return 'rejected';
  const booking = student.mealBookings.find(b => b.date === dateStr);
  const explicitlyBooked = booking && !!booking[mealKey];
  if (explicitlyBooked) return 'manual';
  if (hasMealBookingDeadlinePassed(dateStr)) return 'auto';
  return 'opted-out';
}

const DB_VERSION = 'v7'; // bump this whenever seed data changes

// Initialize the Database
export function initDB() {
  const cachedVersion = localStorage.getItem('hostel_portal_db_version');
  const cached = localStorage.getItem('hostel_portal_db');

  if (cached && cachedVersion === DB_VERSION) {
    const parsed = JSON.parse(cached);
    if (parsed.length === 7) {
      parsed.forEach(student => {
        if (!student.complaints) student.complaints = [];
        if (!student.entryExitLogs) student.entryExitLogs = [];
        if (!student.bed) student.bed = 'Bed A';
        if (!student.sharing) student.sharing = 2;
        if (!student.behaviourLogs) student.behaviourLogs = [];
        if (!student.healthRecords) student.healthRecords = [];
      });
      return parsed;
    }
  }

  // Version mismatch or no cache — clear and re-seed
  localStorage.removeItem('hostel_portal_db');

  // Create 7 students (2 flagship demo + 5 supporting)
  const students = [];
  for (let i = 1; i <= 7; i++) {
    students.push(generateRandomStudent(i));
  }

  // Seed some active/upcoming leaves and meal bookings for a more realistic demo
  const today = getDateString(0);
  const tomorrow = getDateString(1);
  const dayAfter = getDateString(2);

  // Seed meals for all 7 students
  students.forEach((student) => {
    for (let offset = 0; offset < 7; offset++) {
      const date = getDateString(offset);
      if (Math.random() < 0.6) {
        student.mealBookings.push({
          date,
          breakfast: Math.random() < 0.8,
          lunch: Math.random() < 0.7,
          snacks: Math.random() < 0.5,
          dinner: Math.random() < 0.8
        });
      }
    }
  });

  // ── Behaviour Logs ──────────────────────────────────────────
  // STU001 – Aarav Sharma
  students[0].behaviourLogs = [
    { id: 'OB-STU001-1', date: getDateString(-5), category: 'Academic',   severity: 'positive', description: 'Represented the hostel in the inter-college quiz and won first place.',    recordedBy: 'Ramesh Kumar (Warden)' },
    { id: 'OB-STU001-2', date: getDateString(-2), category: 'Discipline', severity: 'warning',  description: 'Arrived 15 minutes late after check-in hours without prior notification.', recordedBy: 'Ramesh Kumar (Warden)' }
  ];
  // STU002 – Priya Nair
  students[1].behaviourLogs = [
    { id: 'OB-STU002-1', date: getDateString(-6), category: 'Academic',   severity: 'positive', description: 'Secured first rank in the department semester examinations.',             recordedBy: 'Anita Joseph (Warden)' },
    { id: 'OB-STU002-2', date: getDateString(-1), category: 'Social',     severity: 'positive', description: 'Organized a cultural fest committee meeting in the common room.',         recordedBy: 'Campus Admin' }
  ];
  // STU003 – Vihaan Verma
  students[2].behaviourLogs = [
    { id: 'OB-STU003-1', date: getDateString(-4), category: 'Social',     severity: 'positive', description: 'Volunteered to clean the hostel common room and organize the library.',   recordedBy: 'Campus Admin' }
  ];

  // ── Health Records ───────────────────────────────────────────
  // STU001 – Aarav Sharma
  students[0].healthRecords = [
    { id: 'HR-STU001-1', date: 'Mon, Jun 10', time: '09:30 AM', symptoms: 'Mild fever, headache', temperature: '99.2°F', status: 'Recovered', note: 'Given paracetamol. Advised rest for 1 day.' }
  ];
  // STU002 – Priya Nair
  students[1].healthRecords = [
    { id: 'HR-STU002-1', date: 'Wed, Jun 18', time: '11:00 AM', symptoms: 'Cold, sore throat',   temperature: '98.6°F', status: 'Recovered', note: 'Prescribed antihistamine. Fully recovered.' }
  ];

  // ── Complaints ───────────────────────────────────────────────
  // STU001 – Aarav Sharma
  students[0].complaints = [
    { id: 'CMP-STU001-1', category: 'Internet',     subject: 'Wi-Fi not working in Room A-101',    details: 'The Wi-Fi router on floor 1 Block A has been down since Monday morning.',         status: 'Pending', dateReported: getDateString(-3), attachments: [] },
    { id: 'CMP-STU001-2', category: 'Maintenance',  subject: 'Leaking tap in bathroom',            details: 'The bathroom tap in room A-101 has been leaking for 3 days.',                   status: 'Closed',  dateReported: getDateString(-8), attachments: [] }
  ];
  // STU002 – Priya Nair
  students[1].complaints = [
    { id: 'CMP-STU002-1', category: 'Mess',         subject: 'Food quality issue – dinner',        details: 'Dinner on Thursday was undercooked and tasted stale. Requests improvement.',     status: 'Pending', dateReported: getDateString(-2), attachments: [] }
  ];

  // ── Leaves ──────────────────────────────────────────────────
  // STU001 (Aarav): Approved outing today by parent
  students[0].leaves.push({
    id: 'LV-STU001-1', startDate: today, endDate: today,
    startTime: '09:00 AM', endTime: '06:00 PM',
    reason: 'Visiting local guardian', type: 'outing', submittedBy: 'parent', status: 'approved'
  });
  students[0].mealBookings = students[0].mealBookings.filter(b => b.date !== today);

  // STU002 (Priya): Pending leave request for tomorrow
  students[1].leaves.push({
    id: 'LV-STU002-1', startDate: tomorrow, endDate: dayAfter,
    startTime: '09:00 AM', endTime: '06:00 PM',
    reason: 'Going home for family function', type: 'leave', submittedBy: 'student', status: 'pending'
  });

  // STU003 (Vihaan): Rejected leave in history
  students[2].leaves.push({
    id: 'LV-STU003-1', startDate: today, endDate: today,
    startTime: '09:00 AM', endTime: '06:00 PM',
    reason: 'Shopping with friends', type: 'outing', submittedBy: 'student', status: 'rejected'
  });

  // ── Entry/Exit Logs ──────────────────────────────────────────
  const schedules = [
    [ // STU001 – Aarav: Early riser
      { type: 'exit',  h: 7,  m: 12, note: 'Morning walk / library' },
      { type: 'entry', h: 9,  m: 34, note: 'Returned after breakfast outing' },
      { type: 'exit',  h: 14, m: 5,  note: 'Afternoon class' },
      { type: 'entry', h: 17, m: 48, note: 'Back from college' },
    ],
    [ // STU002 – Priya: Regular schedule
      { type: 'exit',  h: 8,  m: 45, note: 'Left for morning lecture' },
      { type: 'entry', h: 13, m: 10, note: 'Returned for lunch' },
      { type: 'exit',  h: 15, m: 30, note: 'Lab session' },
      { type: 'entry', h: 18, m: 20, note: 'Back from lab' },
    ],
    [ // STU003 – Vihaan: Late morning
      { type: 'exit',  h: 10, m: 20, note: 'Went to market' },
      { type: 'entry', h: 12, m: 55, note: 'Returned before lunch' },
      { type: 'exit',  h: 16, m: 40, note: 'Evening outing with friends' },
      { type: 'entry', h: 20, m: 15, note: 'Night return to hostel' },
    ],
    [ // STU004 – Aditya: Currently OUTSIDE
      { type: 'exit',  h: 8,  m: 30, note: 'Left for sports practice' },
      { type: 'entry', h: 11, m: 10, note: 'Returned after practice' },
      { type: 'exit',  h: 15, m: 25, note: 'Left for tuition' },
      { type: 'entry', h: 18, m: 50, note: 'Back from tuition' },
    ],
    [ // STU005 – Siddharth: Regular
      { type: 'exit',  h: 9,  m: 5,  note: 'Went to canteen' },
      { type: 'entry', h: 9,  m: 45, note: 'Returned to hostel' },
      { type: 'exit',  h: 17, m: 0,  note: 'Evening gym' },
      { type: 'entry', h: 19, m: 20, note: 'Back from gym' },
    ],
    [ // STU006 – Krishna: Mid-day
      { type: 'exit',  h: 11, m: 35, note: 'Went to bank / ATM' },
      { type: 'entry', h: 13, m: 10, note: 'Back after lunch outing' },
      { type: 'exit',  h: 18, m: 0,  note: 'Evening walk' },
      { type: 'entry', h: 19, m: 45, note: 'Returned to hostel' },
    ],
    [ // STU007 – Kavya: Evening outing
      { type: 'exit',  h: 16, m: 0,  note: 'Went to stationery shop' },
      { type: 'entry', h: 18, m: 30, note: 'Returned after shopping' },
    ],
  ];

  const pad = n => String(n).padStart(2, '0');

  students.forEach((student, idx) => {
    const sch = schedules[idx] || schedules[0];
    const logs = [];
    for (let d = 2; d >= 0; d--) {
      const date = getDateString(-d);
      const isToday = d === 0;
      const isOutside = idx === 3; // Aditya stays outside last event
      sch.forEach((evt, eIdx) => {
        if (isOutside && isToday && eIdx === sch.length - 1) return;
        const minVariation = (d * 3 + eIdx * 2) % 9;
        const mm = (evt.m + minVariation) % 60;
        logs.push({
          id: `LOG-${student.id}-${d}-${eIdx}`,
          type: evt.type,
          timestamp: `${date}T${pad(evt.h)}:${pad(mm)}:00`,
          note: evt.note
        });
      });
    }
    student.entryExitLogs = logs;
  });

  saveDB(students);
  return students;
}


export function saveDB(students) {
  localStorage.setItem('hostel_portal_db', JSON.stringify(students));
  localStorage.setItem('hostel_portal_db_version', DB_VERSION);
}

// Apply leave for a student
export function applyLeave(studentId, startDate, endDate, reason, type = 'leave', submittedBy = 'student', startTime = '', endTime = '', isOvernight = false) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const leaveId = `LV-${Date.now()}`;
  const newLeave = {
    id: leaveId,
    startDate,
    endDate,
    reason,
    type, // 'leave' or 'outing'
    submittedBy, // 'student' or 'parent'
    status: submittedBy === 'parent' ? 'approved' : 'pending',
    startTime,
    endTime,
    isOvernight: !!isOvernight
  };

  student.leaves.push(newLeave);

  // If approved or pending, standard behavior is that they should not have meals.
  // We can automatically cancel existing meals for these dates to prevent food waste.
  let foodWasteCount = 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  student.mealBookings = student.mealBookings.filter(booking => {
    const bookingTime = new Date(booking.date).getTime();
    const isWithinLeave = bookingTime >= start && bookingTime <= end;
    if (isWithinLeave) {
      if (booking.breakfast) foodWasteCount++;
      if (booking.lunch) foodWasteCount++;
      if (booking.snacks) foodWasteCount++;
      if (booking.dinner) foodWasteCount++;
    }
    return !isWithinLeave;
  });

  // Track meal cancellations in statistics
  let avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '0', 10);
  avoidedMeals += foodWasteCount;
  localStorage.setItem('hostel_avoided_meals', avoidedMeals.toString());

  saveDB(students);
  return { students, leave: newLeave, avoidedCount: foodWasteCount };
}

// Cancel a leave request
export function cancelLeave(studentId, leaveId) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  student.leaves = student.leaves.filter(l => l.id !== leaveId);
  saveDB(students);
  return students;
}

// Approve a leave
export function approveLeave(studentId, leaveId) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const leave = student.leaves.find(l => l.id === leaveId);
  if (leave) {
    leave.status = 'approved';
    
    // Make sure all meals on these dates are cleared
    const start = new Date(leave.startDate).getTime();
    const end = new Date(leave.endDate).getTime();
    
    let cancelledCount = 0;
    student.mealBookings = student.mealBookings.filter(booking => {
      const bookingTime = new Date(booking.date).getTime();
      const isWithinLeave = bookingTime >= start && bookingTime <= end;
      if (isWithinLeave) {
        if (booking.breakfast) cancelledCount++;
        if (booking.lunch) cancelledCount++;
        if (booking.snacks) cancelledCount++;
        if (booking.dinner) cancelledCount++;
      }
      return !isWithinLeave;
    });

    let avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '0', 10);
    avoidedMeals += cancelledCount;
    localStorage.setItem('hostel_avoided_meals', avoidedMeals.toString());
  }

  saveDB(students);
  return students;
}

// Reject a leave
export function rejectLeave(studentId, leaveId) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const leave = student.leaves.find(l => l.id === leaveId);
  if (leave) {
    leave.status = 'rejected';
  }

  saveDB(students);
  return students;
}

// Update meals for a student
export function updateMealBookings(studentId, dateStr, meals, cancellationDetails = null) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  // Verify they are not on leave
  if (isStudentOnLeave(student, dateStr)) {
    return { success: false, error: "Cannot book meals while on leave!" };
  }

  const crossed = hasMealBookingDeadlinePassed(dateStr);

  if (crossed) {
    const existingBooking = student.mealBookings.find(b => b.date === dateStr) || {
      breakfast: false,
      lunch: false,
      snacks: false,
      dinner: false
    };

    if (cancellationDetails) {
      return { success: false, error: "Cannot reject meal: the 8:00 AM deadline has passed." };
    }
    for (const key of ['breakfast', 'lunch', 'snacks', 'dinner']) {
      if (existingBooking[key] && !meals[key]) {
        return { success: false, error: `Cannot reject ${key}: the 8:00 AM deadline has passed.` };
      }
    }

    for (const key of ['breakfast', 'lunch', 'snacks', 'dinner']) {
      if (!existingBooking[key] && meals[key]) {
        if (hasMealBeenRejected(student, dateStr, key)) {
          return { success: false, error: `Cannot accept ${key}: meal was already rejected and deadline has passed.` };
        }
      }
    }
  }

  const existingBookingIndex = student.mealBookings.findIndex(b => b.date === dateStr);
  
  if (existingBookingIndex >= 0) {
    student.mealBookings[existingBookingIndex] = {
      date: dateStr,
      ...meals
    };
  } else {
    student.mealBookings.push({
      date: dateStr,
      ...meals
    });
  }

  if (cancellationDetails) {
    if (!student.mealCancellations) {
      student.mealCancellations = [];
    }
    student.mealCancellations.push({
      id: `CAN-${Date.now()}`,
      date: dateStr,
      meal: cancellationDetails.meal,
      reason: cancellationDetails.reason,
      timestamp: new Date().toISOString()
    });

    // Increment avoided meals stats
    let avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '0', 10);
    avoidedMeals += 1;
    localStorage.setItem('hostel_avoided_meals', avoidedMeals.toString());
  }

  saveDB(students);
  return { success: true, students };
}

// Get analytics for a specific date
export function getAnalyticsForDate(students, dateStr) {
  let breakfast = 0;
  let lunch = 0;
  let snacks = 0;
  let dinner = 0;

  students.forEach(student => {
    if (isMealBooked(student, dateStr, 'breakfast')) breakfast++;
    if (isMealBooked(student, dateStr, 'lunch')) lunch++;
    if (isMealBooked(student, dateStr, 'snacks')) snacks++;
    if (isMealBooked(student, dateStr, 'dinner')) dinner++;
  });

  return { breakfast, lunch, snacks, dinner };
}

// Get overall stats for Warden Overview
export function getWardenDashboardStats(students) {
  const total = students.length;
  const todayStr = getDateString(0);
  const tomorrowStr = getDateString(1);

  let onLeaveToday = 0;
  students.forEach(student => {
    if (isStudentOnLeave(student, todayStr)) {
      onLeaveToday++;
    }
  });

  let pendingLeaves = 0;
  students.forEach(student => {
    student.leaves.forEach(leave => {
      if (leave.status === 'pending') {
        pendingLeaves++;
      }
    });
  });

  const todayMeals = getAnalyticsForDate(students, todayStr);
  const tomorrowMeals = getAnalyticsForDate(students, tomorrowStr);

  const avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '142', 10); // default mock offset

  return {
    totalStudents: total,
    inHostel: total - onLeaveToday,
    onLeaveToday,
    pendingLeaves,
    todayMeals,
    tomorrowMeals,
    avoidedMeals
  };
}

// Report a student complaint
export function reportComplaint(studentId, category, subject, details) {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  if (!student.complaints) student.complaints = [];

  const newComplaint = {
    id: `CMP-${studentId}-${Date.now().toString().slice(-4)}`,
    category,
    subject,
    details,
    status: 'Pending',
    dateReported: getDateString(0)
  };

  student.complaints.push(newComplaint);
  saveDB(students);
  return { students, complaint: newComplaint };
}

// Log a hostel entry or exit event (ID-card scan)
export function logEntryExit(studentId, type, note = '') {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  if (!student.entryExitLogs) student.entryExitLogs = [];

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const logEntry = {
    id: `LOG-${studentId}-${Date.now()}`,
    type, // 'entry' | 'exit'
    timestamp,
    note: note || (type === 'entry' ? 'Hostel entry' : 'Hostel exit')
  };

  student.entryExitLogs.push(logEntry);
  saveDB(students);
  return { students, log: logEntry };
}

// Get bed assignments grouped by room
export function getBedAssignments(students) {
  const rooms = {};
  students.forEach(s => {
    if (!rooms[s.room]) {
      rooms[s.room] = { room: s.room, block: s.block, sharing: s.sharing || 2, occupants: [] };
    }
    rooms[s.room].occupants.push({ id: s.id, name: s.name, bed: s.bed || 'Bed A' });
  });
  return Object.values(rooms).sort((a, b) => a.room.localeCompare(b.room));
}


// Add, update or delete behaviour log
export function updateBehaviourLog(studentId, logData, actionType = 'add') {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  if (!student.behaviourLogs) {
    student.behaviourLogs = [];
  }

  if (actionType === 'add') {
    const newLog = {
      id: `OB-${studentId}-${Date.now()}`,
      date: logData.date || getDateString(0),
      category: logData.category,
      severity: logData.severity,
      description: logData.description,
      recordedBy: logData.recordedBy || 'System'
    };
    student.behaviourLogs.push(newLog);
  } else if (actionType === 'edit') {
    const logIndex = student.behaviourLogs.findIndex(l => l.id === logData.id);
    if (logIndex >= 0) {
      student.behaviourLogs[logIndex] = {
        ...student.behaviourLogs[logIndex],
        category: logData.category,
        severity: logData.severity,
        description: logData.description,
        date: logData.date || student.behaviourLogs[logIndex].date
      };
    }
  } else if (actionType === 'delete') {
    student.behaviourLogs = student.behaviourLogs.filter(l => l.id !== logData.id);
  }

  saveDB(students);
  return { success: true, students };
}
