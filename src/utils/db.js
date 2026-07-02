// src/utils/db.js

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

const SHARING_TYPE = { '01': 3, '02': 3, '03': 2, '04': 2 };
const BED_LABELS_2 = ['Bed A', 'Bed B'];
const BED_LABELS_3 = ['Bed A', 'Bed B', 'Bed C'];

function generateRandomStudent(index) {
  const ROSTER = [
    { firstName: 'Aarav',     lastName: 'Sharma',  usn: 'TCG2021CS001', course: 'B.E. Computer Science', dept: 'CSE', year: 3, phone: '+91 98765 10001', parentEmail: 'rajesh.sharma@transcendgroup.org', parentName: 'Rajesh Sharma', photo: '' },
    { firstName: 'Priya',     lastName: 'Nair',    usn: 'TCG2021EC002', course: 'B.E. Electronics',       dept: 'ECE', year: 3, phone: '+91 98765 10002', parentEmail: 'sunita.nair@transcendgroup.org',   parentName: 'Sunita Nair', photo: '' },
    { firstName: 'Vihaan',   lastName: 'Verma',   usn: 'TCG2022ME003', course: 'B.E. Mechanical',        dept: 'ME',  year: 2, phone: '+91 98765 10003', parentEmail: 'parent.vihaan.verma@hostel.edu',   parentName: 'Parent of Vihaan', photo: '' },
    { firstName: 'Aditya',   lastName: 'Bhat',    usn: 'TCG2022CS004', course: 'B.E. Computer Science', dept: 'CSE', year: 2, phone: '+91 98765 10004', parentEmail: 'parent.aditya.bhat@hostel.edu',    parentName: 'Parent of Aditya', photo: '' },
    { firstName: 'Siddharth',lastName: 'Pillai',  usn: 'TCG2023EE005', course: 'B.E. Electrical',        dept: 'EE',  year: 1, phone: '+91 98765 10005', parentEmail: 'parent.siddharth.pillai@hostel.edu', parentName: 'Parent of Siddharth', photo: '' },
    { firstName: 'Krishna',  lastName: 'Verma',   usn: 'TCG2022CS006', course: 'B.E. Computer Science', dept: 'CSE', year: 2, phone: '+91 98765 10006', parentEmail: 'parent.krishna.verma@hostel.edu',  parentName: 'Parent of Krishna', photo: '' },
    { firstName: 'Kavya',    lastName: 'Reddy',   usn: 'TCG2023CE007', course: 'B.E. Civil Engineering', dept: 'CE',  year: 1, phone: '+91 98765 10007', parentEmail: 'parent.kavya.reddy@hostel.edu',    parentName: 'Parent of Kavya', photo: '' },
  ];

  const entry = ROSTER[(index - 1) % ROSTER.length];
  const { firstName, lastName, usn, course, dept, year, phone, parentEmail, parentName, photo } = entry;
  const name = `${firstName} ${lastName}`;

  const id = `STU${String(index).padStart(3, '0')}`;
  const block = BLOCKS[(index - 1) % BLOCKS.length];
  const floor = ((index - 1) % 4) + 1;
  const roomSuffix = ['01', '02', '03', '04'][(index - 1) % 4];
  const room = `${block}-${floor}${roomSuffix}`;
  const sharing = SHARING_TYPE[roomSuffix] || 2;
  const bedLabels = sharing === 3 ? BED_LABELS_3 : BED_LABELS_2;
  const bed = bedLabels[(index - 1) % bedLabels.length];

  // First 2 flagship accounts use @transcendgroup.org; rest use @hostel.edu
  const emailDomain = index <= 2 ? 'transcendgroup.org' : 'hostel.edu';
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;

  return {
    id, name, usn, room, block, bed, sharing,
    course, dept, year, email, phone, parentEmail, parentName, photo,
    leaves: [], mealBookings: [], complaints: [],
    entryExitLogs: [], healthRecords: [], behaviourLogs: []
  };
}

export function getDateString(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

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

export function isStudentOnLeave(student, dateStr) {
  if (!student || !student.leaves) return false;
  const targetTime = new Date(dateStr).getTime();
  return student.leaves.some(leave => {
    if (leave.status === 'rejected') return false;
    const start = new Date(leave.startDate).getTime();
    const end = new Date(leave.endDate).getTime();
    return targetTime >= start && targetTime <= end;
  });
}

export function isMealBooked(student, dateStr, mealKey) {
  if (!student) return false;
  if (isStudentOnLeave(student, dateStr)) {
    return false;
  }
  if (hasMealBeenRejected(student, dateStr, mealKey)) {
    return false;
  }
  if (hasMealBookingDeadlinePassed(dateStr)) {
    return true;
  }
  if (!student.mealBookings) return false;
  const booking = student.mealBookings.find(b => b.date === dateStr);
  return booking ? !!booking[mealKey] : false;
}

export function getMealAcceptanceType(student, dateStr, mealKey) {
  if (!student) return 'opted-out';
  if (isStudentOnLeave(student, dateStr)) return 'leave';
  if (hasMealBeenRejected(student, dateStr, mealKey)) return 'rejected';
  if (!student.mealBookings) return hasMealBookingDeadlinePassed(dateStr) ? 'auto' : 'opted-out';
  const booking = student.mealBookings.find(b => b.date === dateStr);
  const explicitlyBooked = booking && !!booking[mealKey];
  if (explicitlyBooked) return 'manual';
  if (hasMealBookingDeadlinePassed(dateStr)) return 'auto';
  return 'opted-out';
}

const DB_VERSION = 'v9'; // bumped: new student roster with @transcendgroup.org

export function initDB() {
  const cachedVersion = localStorage.getItem('hostel_portal_db_version');
  const cached = localStorage.getItem('hostel_portal_db');

  if (cached && cachedVersion === DB_VERSION) {
    const parsed = JSON.parse(cached);
    if (parsed.length >= 7) {
      parsed.forEach(student => {
        if (!student.leaves) student.leaves = [];
        if (!student.mealBookings) student.mealBookings = [];
        if (!student.complaints) student.complaints = [];
        if (!student.entryExitLogs) student.entryExitLogs = [];
        if (!student.healthRecords) student.healthRecords = [];
        if (!student.behaviourLogs) student.behaviourLogs = [];
        if (!student.bed) student.bed = 'Bed A';
        if (!student.sharing) student.sharing = 2;
      });
      return parsed;
    }
  }

  localStorage.removeItem('hostel_portal_db');

  // Create 7 students
  const students = [];
  for (let i = 1; i <= 7; i++) {
    students.push(generateRandomStudent(i));
  }

  const today = getDateString(0);
  const tomorrow = getDateString(1);
  const dayAfter = getDateString(2);

  // Seed meals
  students.forEach(student => {
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

  // Behaviour logs
  students[0].behaviourLogs = [
    { id: 'OB-STU001-1', date: getDateString(-5), category: 'Academic',   severity: 'positive', description: 'Represented the hostel in the inter-college quiz and won first place.',    recordedBy: 'Ramesh Kumar (Warden)' },
    { id: 'OB-STU001-2', date: getDateString(-2), category: 'Discipline', severity: 'warning',  description: 'Arrived 15 minutes late after check-in hours without prior notification.', recordedBy: 'Ramesh Kumar (Warden)' }
  ];
  students[1].behaviourLogs = [
    { id: 'OB-STU002-1', date: getDateString(-6), category: 'Academic',   severity: 'positive', description: 'Secured first rank in the department semester examinations.',             recordedBy: 'Anita Joseph (Warden)' },
    { id: 'OB-STU002-2', date: getDateString(-1), category: 'Social',     severity: 'positive', description: 'Organized a cultural fest committee meeting in the common room.',         recordedBy: 'Campus Admin' }
  ];
  students[2].behaviourLogs = [
    { id: 'OB-STU003-1', date: getDateString(-4), category: 'Social',     severity: 'positive', description: 'Volunteered to clean the hostel common community room and organize the books.', recordedBy: 'Campus Admin' }
  ];

  // Health records
  students[0].healthRecords = [
    { id: 'HR-STU001-1', date: 'Mon, Jun 10', time: '09:30 AM', symptoms: 'Mild fever, headache', temperature: '99.2°F', status: 'Recovered', note: 'Given paracetamol. Advised rest for 1 day.' }
  ];
  students[1].healthRecords = [
    { id: 'HR-STU002-1', date: 'Wed, Jun 18', time: '11:00 AM', symptoms: 'Cold, sore throat',   temperature: '98.6°F', status: 'Recovered', note: 'Prescribed antihistamine. Fully recovered.' }
  ];

  // Complaints
  students[0].complaints = [
    { id: 'CMP-STU001-1', category: 'Internet',    subject: 'Wi-Fi not working in Room A-101', details: 'The Wi-Fi router on floor 1 Block A has been down since Monday morning.', status: 'Pending', dateReported: getDateString(-3), attachments: [] },
    { id: 'CMP-STU001-2', category: 'Maintenance', subject: 'Leaking tap in bathroom',          details: 'The bathroom tap in room A-101 has been leaking for 3 days.',             status: 'Closed',  dateReported: getDateString(-8), attachments: [] }
  ];
  students[1].complaints = [
    { id: 'CMP-STU002-1', category: 'Mess', subject: 'Food quality issue – dinner', details: 'Dinner on Thursday was undercooked and tasted stale.', status: 'Pending', dateReported: getDateString(-2), attachments: [] }
  ];

  // Leaves
  students[0].leaves.push({ id: 'LV-STU001-1', startDate: today,    endDate: today,    startTime: '09:00 AM', endTime: '06:00 PM', reason: 'Visiting local guardian',      type: 'outing', submittedBy: 'parent',  status: 'approved' });
  students[0].mealBookings = students[0].mealBookings.filter(b => b.date !== today);
  students[1].leaves.push({ id: 'LV-STU002-1', startDate: tomorrow, endDate: dayAfter, startTime: '09:00 AM', endTime: '06:00 PM', reason: 'Going home for family function', type: 'leave',  submittedBy: 'student', status: 'pending'  });
  students[2].leaves.push({ id: 'LV-STU003-1', startDate: today,    endDate: today,    startTime: '09:00 AM', endTime: '06:00 PM', reason: 'Shopping with friends',          type: 'outing', submittedBy: 'student', status: 'rejected' });

  // Entry/Exit schedules
  const schedules = [
    [ { type:'exit',h:7,m:12,note:'Morning walk / library'}, {type:'entry',h:9,m:34,note:'Returned after breakfast outing'}, {type:'exit',h:14,m:5,note:'Afternoon class'}, {type:'entry',h:17,m:48,note:'Back from college'} ],
    [ { type:'exit',h:8,m:45,note:'Left for morning lecture'}, {type:'entry',h:13,m:10,note:'Returned for lunch'}, {type:'exit',h:15,m:30,note:'Lab session'}, {type:'entry',h:18,m:20,note:'Back from lab'} ],
    [ { type:'exit',h:10,m:20,note:'Went to market'}, {type:'entry',h:12,m:55,note:'Returned before lunch'}, {type:'exit',h:16,m:40,note:'Evening outing with friends'}, {type:'entry',h:20,m:15,note:'Night return to hostel'} ],
    [ { type:'exit',h:8,m:30,note:'Left for sports practice'}, {type:'entry',h:11,m:10,note:'Returned after practice'}, {type:'exit',h:15,m:25,note:'Left for tuition'}, {type:'entry',h:18,m:50,note:'Back from tuition'} ],
    [ { type:'exit',h:9,m:5,note:'Went to canteen'}, {type:'entry',h:9,m:45,note:'Returned to hostel'}, {type:'exit',h:17,m:0,note:'Evening gym'}, {type:'entry',h:19,m:20,note:'Back from gym'} ],
    [ { type:'exit',h:11,m:35,note:'Went to bank / ATM'}, {type:'entry',h:13,m:10,note:'Back after lunch outing'}, {type:'exit',h:18,m:0,note:'Evening walk'}, {type:'entry',h:19,m:45,note:'Returned to hostel'} ],
    [ { type:'exit',h:16,m:0,note:'Went to stationery shop'}, {type:'entry',h:18,m:30,note:'Returned after shopping'} ],
  ];

  const pad = n => String(n).padStart(2, '0');
  students.forEach((student, idx) => {
    const sch = schedules[idx] || schedules[0];
    const logs = [];
    for (let d = 2; d >= 0; d--) {
      const date = getDateString(-d);
      const isToday = d === 0;
      const isOutside = idx === 3; // Aditya is currently outside
      sch.forEach((evt, eIdx) => {
        if (isOutside && isToday && eIdx === sch.length - 1) return;
        const mm = (evt.m + (d * 3 + eIdx * 2) % 9) % 60;
        logs.push({ id: `LOG-${student.id}-${d}-${eIdx}`, type: evt.type, timestamp: `${date}T${pad(evt.h)}:${pad(mm)}:00`, note: evt.note });
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

  const avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '142', 10);

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
    type,
    timestamp,
    note: note || (type === 'entry' ? 'Hostel entry' : 'Hostel exit')
  };

  student.entryExitLogs.push(logEntry);
  saveDB(students);
  return { students, log: logEntry };
}

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
