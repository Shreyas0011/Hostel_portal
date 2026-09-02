// src/api/axios.js
import axios from 'axios';
import * as db from '../utils/db';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://hostel-portal-jvga.onrender.com/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

// Setup mock adapter to process requests locally via localStorage database only when mock is explicitly enabled/defaulted
if (useMock) {
  axiosInstance.defaults.adapter = async function (config) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 0));

  const url = config.url || '';
  const method = config.method ? config.method.toLowerCase() : 'get';
  const data = config.data && typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  const params = config.params || {};

  let students = db.initDB();

  try {
    // 1. Auth Endpoint
    if (url.includes('/auth/login') && method === 'post') {
      const { email, password } = data;
      const normalizedEmail = email.toLowerCase();

      // ── Warden & Staff accounts (PIN-based, handled via loginThunk with mapped creds) ──
      // NOTE: Passwords are loaded from environment variables in production.
      // The VITE_STAFF_PASS_* vars must be set in your .env file.
      const WARDENS = {
        'warden@hostel.edu':              { password: import.meta.env.VITE_STAFF_PASS_WARDEN_CHIEF    || 'warden123',        id: 'WDN-01', name: 'Chief Warden Console', empId: 'EMP-WDN-001', block: 'All Blocks',  phone: '+91 98400 11001', role: 'Warden' },
        'vijayamma@transcendgroup.org':   { password: import.meta.env.VITE_STAFF_PASS_WARDEN_GIRLS    || 'Warden@Girls',     id: 'WDN-02', name: 'Vijayamma',            empId: 'EMP-WDN-002', block: 'Girls Hostel', phone: '+91 98400 11002', role: 'Warden' },
        'siddu@transcendgroup.org':       { password: import.meta.env.VITE_STAFF_PASS_WARDEN_BOYS     || 'Warden@Boys',      id: 'WDN-03', name: 'Siddu',                empId: 'EMP-WDN-003', block: 'Boys Hostel',  phone: '+91 98400 11003', role: 'Warden' },
        'messmanager@transcendgroup.org': { password: import.meta.env.VITE_STAFF_PASS_MESS_MANAGER    || 'MessManager@3333', id: 'MM-01',  name: 'Mess Manager',         empId: 'EMP-MM-001',  block: 'Campus Mess',  phone: '+91 98400 11004', role: 'MessManager' },
      };
      if (WARDENS[normalizedEmail]) {
        const w = WARDENS[normalizedEmail];
        if (password === w.password) {
          return { data: { accessToken: 'warden-token', user: { id: w.id, name: w.name, email: normalizedEmail, role: w.role || 'Warden', empId: w.empId, block: w.block, phone: w.phone } }, status: 200, statusText: 'OK', headers: {}, config };
        }
        throw new Error('Incorrect password');
      }

      // ── Admin accounts ──
      const ADMINS = {
        'admin@hostel.edu':              { password: import.meta.env.VITE_STAFF_PASS_ADMIN_CHIEF  || 'admin123',  id: 'ADM-01', name: 'Campus Admin Console', empId: 'EMP-ADM-001', dept: 'Administration' },
        'admin1@transcendgroup.org':     { password: import.meta.env.VITE_STAFF_PASS_ADMIN_1      || 'Admin@123', id: 'ADM-02', name: 'Admin One',            empId: 'EMP-ADM-002', dept: 'Administration' },
        'admin2@transcendgroup.org':     { password: import.meta.env.VITE_STAFF_PASS_ADMIN_2      || 'Admin@123', id: 'ADM-03', name: 'Admin Two',            empId: 'EMP-ADM-003', dept: 'Administration' },
      };
      if (ADMINS[normalizedEmail]) {
        const a = ADMINS[normalizedEmail];
        if (password === a.password) {
          return { data: { accessToken: 'admin-token', user: { id: a.id, name: a.name, email: normalizedEmail, role: 'Admin', empId: a.empId, dept: a.dept } }, status: 200, statusText: 'OK', headers: {}, config };
        }
        throw new Error('Incorrect password');
      }

      // ── SuperAdmin accounts ──
      const SUPERADMINS = {
        'superadmin@hostel.edu':              { password: import.meta.env.VITE_STAFF_PASS_SUPERADMIN_CHIEF || 'super123',       id: 'SAD-01', name: 'Super Admin Control', empId: 'EMP-SAD-001' },
        'siddharthkt@transcendgroup.org':     { password: import.meta.env.VITE_STAFF_PASS_SUPERADMIN_1    || 'Transcend@2026', id: 'SAD-02', name: 'Siddharth K T',       empId: 'EMP-SAD-002' },
        'shwethas@transcendgroup.org':        { password: import.meta.env.VITE_STAFF_PASS_SUPERADMIN_2    || 'Transcend@2026', id: 'SAD-03', name: 'Shwetha S',           empId: 'EMP-SAD-003' },
        'superadmin1@transcendgroup.org':     { password: import.meta.env.VITE_STAFF_PASS_SUPERADMIN_3    || 'SuperAdmin@123', id: 'SAD-04', name: 'Super Admin One',     empId: 'EMP-SAD-004' },
        'superadmin2@transcendgroup.org':     { password: import.meta.env.VITE_STAFF_PASS_SUPERADMIN_4    || 'SuperAdmin@123', id: 'SAD-05', name: 'Super Admin Two',     empId: 'EMP-SAD-005' },
      };
      if (SUPERADMINS[normalizedEmail]) {
        const s = SUPERADMINS[normalizedEmail];
        if (password === s.password) {
          return { data: { accessToken: 'superadmin-token', user: { id: s.id, name: s.name, email: normalizedEmail, role: 'SuperAdmin', empId: s.empId } }, status: 200, statusText: 'OK', headers: {}, config };
        }
        throw new Error('Incorrect password');
      }

      // ── Parent accounts ──
      // Dynamic lookup from student database:
      const matchingStudent = students.find(s => s.parentEmail && s.parentEmail.toLowerCase() === normalizedEmail);
      if (matchingStudent) {
        if (password === 'Parent@123' || password === 'password') {
          return {
            data: {
              accessToken: 'parent-token',
              user: {
                id: 'parent-' + matchingStudent.id,
                name: matchingStudent.parentName || ('Parent of ' + matchingStudent.name),
                email: normalizedEmail,
                role: 'Parent',
                studentId: matchingStudent.id
              }
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          };
        }
        throw new Error('Incorrect password');
      }

      // Legacy parent.* pattern (fallback)
      if (normalizedEmail.startsWith('parent.')) {
        const studentEmailPart = normalizedEmail.replace('parent.', '');
        const student = students.find(s => s.email.toLowerCase() === studentEmailPart);
        if (student) {
          if (password === 'password' || password === 'Parent@123') {
            return { data: { accessToken: 'parent-token', user: { id: 'parent-' + student.id, name: 'Parent of ' + student.name.split(' ')[0], email: normalizedEmail, role: 'Parent', studentId: student.id } }, status: 200, statusText: 'OK', headers: {}, config };
          }
          throw new Error('Incorrect password');
        }
        throw new Error('Invalid parent email address');
      }

      // ── Student accounts ──
      // @transcendgroup.org students use password 'Student@123'; legacy @hostel.edu use 'password'
      const student = students.find(s => 
        (s.email && s.email.toLowerCase() === normalizedEmail) || 
        (s.usn && s.usn.toLowerCase() === normalizedEmail) ||
        (normalizedEmail === 'ksaichandana81@gmail.com' && (s.usn === '251P2209' || s.email?.toLowerCase() === 'ksaichandana81@gmail.com'))
      );
      if (student) {
        const expectedPassword = 'Student@123';
        if (password === expectedPassword) {
          return { data: { accessToken: 'student-token', user: { id: student.id, name: student.name, email: student.email, role: 'Student', room: student.room, block: student.block, usn: student.usn, course: student.course, dept: student.dept, year: student.year } }, status: 200, statusText: 'OK', headers: {}, config };
        }
        throw new Error('Incorrect password');
      }
      throw new Error('Invalid credentials');
    }

    if (url.includes('/auth/logout') && method === 'post') {
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 2. Student Endpoints
    if (url.match(/\/students\/STU[0-9]+$/) && method === 'get') {
      const match = url.match(/\/students\/(STU[0-9]+)$/);
      const studentId = match ? match[1] : '';
      const student = students.find(s => s.id === studentId);
      if (student) {
        return { data: student, status: 200, statusText: 'OK', headers: {}, config };
      }
      throw new Error('Student not found');
    }

    if (url.includes('/students') && method === 'post') {
      const { name, block, room, email, phone, photo } = data;
      const nextIdNum = students.length + 1;
      const newStudent = {
        id: `STU${String(nextIdNum).padStart(3, '0')}`,
        name,
        room,
        block,
        email,
        phone,
        photo: photo || '',
        leaves: [],
        mealBookings: [],
        complaints: [],
        entryExitLogs: [],
        healthRecords: [],
        behaviourLogs: []
      };
      students.push(newStudent);
      db.saveDB(students);
      return { data: newStudent, status: 201, statusText: 'Created', headers: {}, config };
    }

    if (url.includes('/students') && method === 'get') {
      return { data: students, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 3. Parent Endpoints
    if (url.includes('/parents/ward') && method === 'get') {
      const studentId = url.split('/').pop();
      const student = students.find(s => s.id === studentId);
      if (student) {
        return { data: student, status: 200, statusText: 'OK', headers: {}, config };
      }
      throw new Error('Ward not found');
    }

    // 4. Warden/Stats Endpoints
    if (url.includes('/warden/stats') && method === 'get') {
      const stats = db.getWardenDashboardStats(students);
      return { data: stats, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/warden/beds') && method === 'get') {
      const beds = db.getBedAssignments(students);
      return { data: beds, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/warden/meal-attendance') && method === 'post') {
      const { studentId, date, mealKey, status } = data;
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      if (!student.mealAttendance) {
        student.mealAttendance = [];
      }

      const attendanceEntry = student.mealAttendance.find(a => a.date === date);
      if (attendanceEntry) {
        if (status === null || status === undefined || status === '') {
          delete attendanceEntry[mealKey];
        } else {
          attendanceEntry[mealKey] = status;
        }
      } else if (status !== null && status !== undefined && status !== '') {
        const newAttendance = { date };
        newAttendance[mealKey] = status;
        student.mealAttendance.push(newAttendance);
      }

      db.saveDB(students);
      students = db.initDB();
      return { data: { success: true, students }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 5. Meals Endpoints
    if (url.includes('/meals/menu') && method === 'get') {
      const raw = localStorage.getItem('hostel_mess_menu');
      const menu = raw ? JSON.parse(raw) : {
        default: {
          breakfast: 'Masala Dosa, Chutney, Sambhar & Coffee',
          lunch: 'Jeera Rice, Dal Fry, Roti, Aloo Gobi & Buttermilk',
          snacks: 'Veg Samosa, Green Chutney & Tea',
          dinner: 'Veg Biryani, Raita, Paneer Butter Masala & Gulab Jamun'
        }
      };
      return { data: menu, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/meals/menu/reset') && method === 'post') {
      localStorage.removeItem('hostel_mess_menu');
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/meals/menu') && method === 'post') {
      const { key, menu } = data;
      const raw = localStorage.getItem('hostel_mess_menu');
      let store = raw ? JSON.parse(raw) : {};
      if (store.breakfast && !store.default) {
        store = { default: store };
      }
      store[key] = menu;
      localStorage.setItem('hostel_mess_menu', JSON.stringify(store));
      return { data: store, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/meals/bookings') && method === 'post') {
      const { studentId, date, meals, cancellationDetails } = data;
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      if (db.isStudentOnLeave(student, date)) {
        throw new Error("Cannot book meals while on leave!");
      }

      if (db.hasMealBookingDeadlinePassed(date)) {
        const existingBooking = student.mealBookings.find(b => b.date === date) || {
          breakfast: false,
          lunch: false,
          snacks: false,
          dinner: false
        };
        if (cancellationDetails) {
          throw new Error("Cannot reject meal: the 8:00 AM deadline has passed.");
        }
        for (const key of ['breakfast', 'lunch', 'snacks', 'dinner']) {
          if (existingBooking[key] && !meals[key]) {
            throw new Error(`Cannot reject ${key}: the 8:00 AM deadline has passed.`);
          }
          if (!existingBooking[key] && meals[key] && db.hasMealBeenRejected(student, date, key)) {
            throw new Error(`Cannot accept ${key}: meal was already rejected and deadline has passed.`);
          }
        }
      }

      const idx = student.mealBookings.findIndex(b => b.date === date);
      if (idx >= 0) {
        student.mealBookings[idx] = { date, ...meals };
      } else {
        student.mealBookings.push({ date, ...meals });
      }

      if (cancellationDetails) {
        if (!student.mealCancellations) student.mealCancellations = [];
        student.mealCancellations.push({
          id: `CAN-${Date.now()}`,
          date,
          meal: cancellationDetails.meal,
          reason: cancellationDetails.reason,
          timestamp: new Date().toISOString()
        });
        let avoided = parseInt(localStorage.getItem('hostel_avoided_meals') || '0', 10);
        localStorage.setItem('hostel_avoided_meals', (avoided + 1).toString());
      }

      db.saveDB(students);
      // Reload students in DB
      students = db.initDB();
      return { data: { success: true, students }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 7. Complaint Endpoints
    if (url.match(/\/complaints\/[A-Za-z0-9-]+\/resolve$/) && method === 'post') {
      const match = url.match(/\/complaints\/([A-Za-z0-9-]+)\/resolve$/);
      const complaintId = match ? match[1] : '';
      const { studentId, responseText } = data;
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      const complaint = student.complaints.find(c => c.id === complaintId);
      if (complaint) {
        complaint.status = 'Closed';
        complaint.response = responseText || 'Resolved by Administrator';
      }

      db.saveDB(students);
      students = db.initDB();
      return { data: { success: true, students }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/complaints') && method === 'post') {
      const { studentId, category, subject, details } = data;
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      if (!student.complaints) student.complaints = [];
      const newComplaint = {
        id: `CMP-${studentId}-${Date.now().toString().slice(-4)}`,
        category,
        subject,
        details,
        status: 'Pending',
        dateReported: db.getDateString(0)
      };

      student.complaints.push(newComplaint);
      db.saveDB(students);
      students = db.initDB();
      return { data: { success: true, students, complaint: newComplaint }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 8. Health Endpoints
    if (url.includes('/health') && method === 'post') {
      const { studentId, recordId, symptoms, temperature, status, note } = data;
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      if (!student.healthRecords) student.healthRecords = [];

      if (recordId) {
        const rec = student.healthRecords.find(r => r.id === recordId);
        if (rec) {
          rec.symptoms = symptoms;
          rec.temperature = temperature;
          rec.status = status;
          rec.note = note;
        }
      } else {
        const d = new Date();
        student.healthRecords.push({
          id: 'HR-' + Date.now(),
          date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          symptoms,
          temperature,
          status,
          note
        });
      }

      db.saveDB(students);
      students = db.initDB();
      return { data: { success: true, students }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/health\/[A-Za-z0-9-]+$/) && method === 'delete') {
      const studentId = params.studentId;
      const match = url.match(/\/health\/([A-Za-z0-9-]+)$/);
      const recordId = match ? match[1] : '';
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      student.healthRecords = student.healthRecords.filter(r => r.id !== recordId);
      db.saveDB(students);
      students = db.initDB();
      return { data: { success: true, students }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 9. Behaviour Endpoints
    if (url.includes('/behaviour') && method === 'post') {
      const { studentId, logData, actionType } = data;
      const res = db.updateBehaviourLog(studentId, logData, actionType);
      if (res && res.success) {
        students = db.initDB();
        return { data: { success: true, students }, status: 200, statusText: 'OK', headers: {}, config };
      }
      throw new Error('Failed to update behaviour log');
    }

    // 6. Leave Endpoints
    if (url.match(/\/leaves\/[A-Za-z0-9-]+\/cancel$/) && method === 'post') {
      const match = url.match(/\/leaves\/([A-Za-z0-9-]+)\/cancel$/);
      const leaveId = match ? match[1] : '';
      const { studentId } = data;
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      student.leaves = student.leaves.filter(l => l.id !== leaveId);
      db.saveDB(students);
      students = db.initDB();
      return { data: { success: true, students }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/leaves\/[A-Za-z0-9-]+\/approve$/) && method === 'post') {
      const match = url.match(/\/leaves\/([A-Za-z0-9-]+)\/approve$/);
      const leaveId = match ? match[1] : '';
      const { studentId } = data;
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      const leave = student.leaves.find(l => l.id === leaveId);
      if (leave) {
        leave.status = 'approved';
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

      db.saveDB(students);
      students = db.initDB();
      return { data: { success: true, students }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/leaves\/[A-Za-z0-9-]+\/reject$/) && method === 'post') {
      const match = url.match(/\/leaves\/([A-Za-z0-9-]+)\/reject$/);
      const leaveId = match ? match[1] : '';
      const { studentId } = data;
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      const leave = student.leaves.find(l => l.id === leaveId);
      if (leave) {
        leave.status = 'rejected';
      }

      db.saveDB(students);
      students = db.initDB();
      return { data: { success: true, students }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/leaves') && method === 'post') {
      const { studentId, startDate, endDate, reason, type, submittedBy, startTime, endTime, isOvernight } = data;
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      const leaveId = `LV-${Date.now()}`;
      const newLeave = {
        id: leaveId,
        startDate,
        endDate,
        reason,
        type,
        submittedBy,
        status: submittedBy === 'parent' ? 'approved' : 'pending',
        startTime,
        endTime,
        isOvernight: !!isOvernight
      };

      if (!student.leaves) student.leaves = [];
      student.leaves.push(newLeave);

      let foodWasteCount = 0;
      if (newLeave.status === 'approved') {
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

        let avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '0', 10);
        avoidedMeals += foodWasteCount;
        localStorage.setItem('hostel_avoided_meals', avoidedMeals.toString());
      }

      db.saveDB(students);
      students = db.initDB();
      return { data: { success: true, students, leave: newLeave, avoidedCount: foodWasteCount }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 11. Attendance Endpoints
    if (url.includes('/attendance/scan') && method === 'post') {
      const { studentId, type, note } = data;
      const res = db.logEntryExit(studentId, type, note);
      if (res) {
        students = db.initDB();
        return { data: { success: true, students, log: res.log }, status: 200, statusText: 'OK', headers: {}, config };
      }
      throw new Error('Failed to log scan');
    }




    throw new Error('Route not matched: ' + url);
  } catch (error) {
    return Promise.reject({
      response: {
        data: { message: error.message || 'Internal Server Error' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
      }
    });
  }
};
}

// Request interceptor for Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hostel_portal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session/auth error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('hostel_portal_token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
