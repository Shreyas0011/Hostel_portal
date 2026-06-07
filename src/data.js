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
  let firstName, lastName;
  if (index === 1) {
    firstName = "Aarav";
    lastName = "Sharma";
  } else if (index === 2) {
    firstName = "Vihaan";
    lastName = "Verma";
  } else if (index === 3) {
    firstName = "Aditya";
    lastName = "Bhat";
  } else if (index === 4) {
    firstName = "Siddharth";
    lastName = "Pillai";
  } else {
    firstName = "Krishna";
    lastName = "Verma";
  }
  const name = `${firstName} ${lastName}`;
  
  const id = `STU${String(index).padStart(3, '0')}`;
  const block = BLOCKS[index % BLOCKS.length];
  const floor = ((index - 1) % 4) + 1; // Floors 1 to 4
  // Alternate room suffix so we get mix of 2-sharing and 3-sharing
  const roomSuffix = ['01', '02', '03', '04'][index % 4];
  const room = `${block}-${floor}${roomSuffix}`;
  const sharing = SHARING_TYPE[roomSuffix] || 2;
  const bedLabels = sharing === 3 ? BED_LABELS_3 : BED_LABELS_2;
  const bed = bedLabels[index % bedLabels.length];

  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hostel.edu`;
  const phone = `+91 98765${index}4321`;
  
  return {
    id,
    name,
    room,
    block,
    bed,
    sharing,
    email,
    phone,
    leaves: [],
    mealBookings: [],
    complaints: [],
    entryExitLogs: [],
    healthRecords: []
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

const DB_VERSION = 'v4'; // bump this whenever seed data changes

// Initialize the Database
export function initDB() {
  const cachedVersion = localStorage.getItem('hostel_portal_db_version');
  const cached = localStorage.getItem('hostel_portal_db');

  if (cached && cachedVersion === DB_VERSION) {
    const parsed = JSON.parse(cached);
    if (parsed.length === 5) {
      parsed.forEach(student => {
        if (!student.complaints) student.complaints = [];
        if (!student.entryExitLogs) student.entryExitLogs = [];
        if (!student.bed) student.bed = 'Bed A';
        if (!student.sharing) student.sharing = 2;
      });
      return parsed;
    }
  }

  // Version mismatch or no cache — clear and re-seed
  localStorage.removeItem('hostel_portal_db');

  // Create 5 students
  const students = [];
  for (let i = 1; i <= 5; i++) {
    students.push(generateRandomStudent(i));
  }

  // Seed some active/upcoming leaves and meal bookings for a more realistic demo
  const today = getDateString(0);
  const tomorrow = getDateString(1);
  const dayAfter = getDateString(2);

  // Seed meals for all 5 students
  students.forEach((student, index) => {
    // Generate some meal bookings for the next 7 days
    for (let offset = 0; offset < 7; offset++) {
      const date = getDateString(offset);
      // Give ~60% probability of booking meals
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

  // Seed leaves for some students
  // Student 1 (Aarav Sharma - STU001): Approved outing today
  students[0].leaves.push({
    id: "LV-STU001-1",
    startDate: today,
    endDate: today,
    reason: "Visiting local guardian",
    type: "outing",
    submittedBy: "parent",
    status: "approved"
  });
  students[0].mealBookings = students[0].mealBookings.filter(b => b.date !== today);

  // Student 2 (Vihaan Verma - STU002): Pending leave tomorrow & dayAfter
  students[1].leaves.push({
    id: "LV-STU002-1",
    startDate: tomorrow,
    endDate: dayAfter,
    reason: "Going home for festival",
    type: "leave",
    submittedBy: "student",
    status: "pending"
  });

  // Student 3 (Aditya Bhat - STU003): Rejected leave in history
  students[2].leaves.push({
    id: "LV-STU003-1",
    startDate: today,
    endDate: today,
    reason: "Shopping with friends",
    type: "outing",
    submittedBy: "student",
    status: "rejected"
  });

  // Seed realistic randomized entry/exit logs for all students (last 3 days)
  // Per-student schedules: [{ type, hh, mm, note }] repeated across days
  const schedules = [
    // STU001 (Aarav): Early riser, back by evening
    [
      { type: 'exit',  h: 7,  m: 12, note: 'Morning walk / library' },
      { type: 'entry', h: 9,  m: 34, note: 'Returned after breakfast outing' },
      { type: 'exit',  h: 14, m: 5,  note: 'Afternoon class' },
      { type: 'entry', h: 17, m: 48, note: 'Back from college' },
    ],
    // STU002 (Vihaan): Late morning outing
    [
      { type: 'exit',  h: 10, m: 20, note: 'Went to market' },
      { type: 'entry', h: 12, m: 55, note: 'Returned before lunch' },
      { type: 'exit',  h: 16, m: 40, note: 'Evening outing with friends' },
      { type: 'entry', h: 20, m: 15, note: 'Night return to hostel' },
    ],
    // STU003 (Aditya): Currently OUTSIDE — last log today is 'exit'
    [
      { type: 'exit',  h: 8,  m: 30, note: 'Left for sports practice' },
      { type: 'entry', h: 11, m: 10, note: 'Returned after practice' },
      { type: 'exit',  h: 15, m: 25, note: 'Left for tuition' },
      { type: 'entry', h: 18, m: 50, note: 'Back from tuition' },
    ],
    // STU004 (Siddharth): Regular schedule
    [
      { type: 'exit',  h: 9,  m: 5,  note: 'Went to canteen' },
      { type: 'entry', h: 9,  m: 45, note: 'Returned to hostel' },
      { type: 'exit',  h: 17, m: 0,  note: 'Evening gym' },
      { type: 'entry', h: 19, m: 20, note: 'Back from gym' },
    ],
    // STU005 (Krishna): Mid-day outing
    [
      { type: 'exit',  h: 11, m: 35, note: 'Went to bank / ATM' },
      { type: 'entry', h: 13, m: 10, note: 'Back after lunch outing' },
      { type: 'exit',  h: 18, m: 0,  note: 'Evening walk' },
      { type: 'entry', h: 19, m: 45, note: 'Returned to hostel' },
    ],
  ];

  const pad = n => String(n).padStart(2, '0');

  students.forEach((student, idx) => {
    const sch = schedules[idx] || schedules[0];
    const logs = [];

    // Seed for last 3 days (oldest first so last entry = most recent)
    for (let d = 2; d >= 0; d--) {
      const date = getDateString(-d);

      // For STU003 on today only: only push exit at end, no final re-entry
      const isToday = d === 0;
      const isAditya = idx === 2;

      sch.forEach((evt, eIdx) => {
        // Aditya today: skip the last entry event so he's "outside"
        if (isAditya && isToday && eIdx === sch.length - 1) return;

        // Add slight day-based variation to avoid identical times each day
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
export function applyLeave(studentId, startDate, endDate, reason, type = 'leave', submittedBy = 'student') {
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
    status: submittedBy === 'parent' ? 'approved' : 'pending'
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
    // If student is on leave, they shouldn't have meals, but let's be double sure
    if (isStudentOnLeave(student, dateStr)) return;

    const booking = student.mealBookings.find(b => b.date === dateStr);
    if (booking) {
      if (booking.breakfast) breakfast++;
      if (booking.lunch) lunch++;
      if (booking.snacks) snacks++;
      if (booking.dinner) dinner++;
    }
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

