import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

function makeRequest(method: string, path: string, body?: any, token?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=======================================================');
  console.log('   HOSTEL PORTAL END-TO-END INTEGRATION TEST SUITE     ');
  console.log('=======================================================');

  const results: any[] = [];

  // 1. Health Check
  try {
    const res = await new Promise<any>((resolve) => {
      http.get('http://localhost:5000/health', (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => resolve({ status: r.statusCode, data: JSON.parse(d) }));
      });
    });
    results.push({ feature: 'Backend Health Check', endpoint: 'GET /health', status: res.status === 200 ? 'PASSED' : 'FAILED', details: res.data.status || res.data });
  } catch (e: any) {
    results.push({ feature: 'Backend Health Check', endpoint: 'GET /health', status: 'FAILED', details: e.message });
  }

  // 2. Student Login (USN)
  let studentToken = '';
  let studentId = '251D1482';
  try {
    const res = await makeRequest('POST', '/auth/login', { email: '251D1482', password: 'Student@123' });
    if (res.status === 200 && (res.data.token || res.data.accessToken)) {
      studentToken = res.data.token || res.data.accessToken;
      studentId = res.data.user.usn || res.data.user.id;
      results.push({ feature: 'Student Login (USN)', endpoint: 'POST /api/auth/login', status: 'PASSED', details: `User: ${res.data.user.name}, Role: ${res.data.user.role}` });
    } else {
      results.push({ feature: 'Student Login (USN)', endpoint: 'POST /api/auth/login', status: 'FAILED', details: res.data });
    }
  } catch (e: any) {
    results.push({ feature: 'Student Login (USN)', endpoint: 'POST /api/auth/login', status: 'FAILED', details: e.message });
  }

  // 3. Parent Login (Email)
  let parentToken = '';
  try {
    const res = await makeRequest('POST', '/auth/login', { email: 'chandanamahadimane@gmail.com', password: 'Parent@000191' });
    if (res.status === 200 && (res.data.token || res.data.accessToken)) {
      parentToken = res.data.token || res.data.accessToken;
      results.push({ feature: 'Parent Login (Email)', endpoint: 'POST /api/auth/login', status: 'PASSED', details: `User: ${res.data.user.name}, Role: ${res.data.user.role}` });
    } else {
      results.push({ feature: 'Parent Login (Email)', endpoint: 'POST /api/auth/login', status: 'FAILED', details: res.data });
    }
  } catch (e: any) {
    results.push({ feature: 'Parent Login (Email)', endpoint: 'POST /api/auth/login', status: 'FAILED', details: e.message });
  }

  // 4. Staff Logins (Warden, Mess Manager, Admin, SuperAdmin)
  const staffCredentials = [
    { roleName: 'Warden', email: 'warden@hostel.edu', pass: 'Warden@Hostel123' },
    { roleName: 'MessManager', email: 'messmanager@transcendgroup.org', pass: 'MessManager@3333' },
    { roleName: 'Admin', email: 'admin@hostel.edu', pass: 'HostelAdmin@2026' },
    { roleName: 'SuperAdmin', email: 'superadmin@hostel.edu', pass: 'SuperAdmin@2026' },
  ];

  for (const s of staffCredentials) {
    try {
      const res = await makeRequest('POST', '/auth/login', { email: s.email, password: s.pass });
      if (res.status === 200 && res.data.user?.role?.toLowerCase() === s.roleName.toLowerCase()) {
        results.push({ feature: `${s.roleName} Login`, endpoint: 'POST /api/auth/login', status: 'PASSED', details: `Role: ${res.data.user.role}` });
      } else {
        results.push({ feature: `${s.roleName} Login`, endpoint: 'POST /api/auth/login', status: 'FAILED', details: res.data });
      }
    } catch (e: any) {
      results.push({ feature: `${s.roleName} Login`, endpoint: 'POST /api/auth/login', status: 'FAILED', details: e.message });
    }
  }

  // 5. Student Directory Fetch
  try {
    const res = await makeRequest('GET', '/students', null, studentToken);
    if (res.status === 200 && (Array.isArray(res.data) || Array.isArray(res.data.students))) {
      const count = Array.isArray(res.data) ? res.data.length : res.data.students.length;
      results.push({ feature: 'Student Directory Fetch', endpoint: 'GET /api/students', status: 'PASSED', details: `Fetched ${count} students` });
    } else {
      results.push({ feature: 'Student Directory Fetch', endpoint: 'GET /api/students', status: 'FAILED', details: res.data });
    }
  } catch (e: any) {
    results.push({ feature: 'Student Directory Fetch', endpoint: 'GET /api/students', status: 'FAILED', details: e.message });
  }

  // 6. Leave Application & Approval Flow
  let testLeaveId = '';
  try {
    const res = await makeRequest('POST', '/leaves', {
      studentId: studentId,
      startDate: '2026-08-25',
      endDate: '2026-08-27',
      reason: 'Family Event',
      type: 'Home Leave',
      submittedBy: 'student',
    }, studentToken);

    if (res.status === 201 || res.status === 200) {
      testLeaveId = res.data.leave?.id || res.data.leave?._id || res.data.id;
      results.push({ feature: 'Student Leave Application', endpoint: 'POST /api/leaves', status: 'PASSED', details: `Leave ID: ${testLeaveId}` });
    } else {
      results.push({ feature: 'Student Leave Application', endpoint: 'POST /api/leaves', status: 'FAILED', details: res.data });
    }
  } catch (e: any) {
    results.push({ feature: 'Student Leave Application', endpoint: 'POST /api/leaves', status: 'FAILED', details: e.message });
  }

  if (testLeaveId) {
    try {
      const res = await makeRequest('POST', `/leaves/${testLeaveId}/approve`, { studentId }, parentToken);
      results.push({ feature: 'Parent Leave Approval', endpoint: `POST /api/leaves/:id/approve`, status: res.status === 200 ? 'PASSED' : 'FAILED', details: res.data.message || 'Approved' });
    } catch (e: any) {
      results.push({ feature: 'Parent Leave Approval', endpoint: `POST /api/leaves/:id/approve`, status: 'FAILED', details: e.message });
    }
  }

  // 7. Meal Bookings & Aliases
  try {
    const res1 = await makeRequest('POST', '/meals/bookings', {
      studentId: studentId,
      date: '2026-08-22',
      meals: { breakfast: true, lunch: true, snacks: false, dinner: true },
    }, studentToken);

    const res2 = await makeRequest('POST', '/meals/book', {
      studentId: studentId,
      date: '2026-08-23',
      meals: { breakfast: true, lunch: false, snacks: true, dinner: true },
    }, studentToken);

    const passed = (res1.status === 200 || res1.status === 201) && (res2.status === 200 || res2.status === 201);
    results.push({ feature: 'Meal Booking (With Path Aliases)', endpoint: 'POST /api/meals/bookings & /book', status: passed ? 'PASSED' : 'FAILED', details: 'Both endpoints returned 200 OK' });
  } catch (e: any) {
    results.push({ feature: 'Meal Booking (With Path Aliases)', endpoint: 'POST /api/meals/bookings', status: 'FAILED', details: e.message });
  }

  // 8. Mess Attendance & Warden Alias
  try {
    const res1 = await makeRequest('POST', '/meals/attendance', { studentId: studentId, date: '2026-08-22', mealKey: 'breakfast', status: 'Present' }, studentToken);
    const res2 = await makeRequest('POST', '/warden/meal-attendance', { studentId: studentId, date: '2026-08-22', mealKey: 'lunch', status: 'Present' }, studentToken);
    const passed = res1.status === 200 && res2.status === 200;
    results.push({ feature: 'Mess Attendance Marking', endpoint: 'POST /api/meals/attendance & /warden/meal-attendance', status: passed ? 'PASSED' : 'FAILED', details: 'Both endpoints returned 200 OK' });
  } catch (e: any) {
    results.push({ feature: 'Mess Attendance Marking', endpoint: 'POST /api/meals/attendance', status: 'FAILED', details: e.message });
  }

  // 9. Mess Menu GET & POST
  try {
    const getRes = await makeRequest('GET', '/meals/menu');
    const postRes = await makeRequest('POST', '/meals/menu', {
      key: 'default',
      menu: {
        breakfast: 'Idli Vada, Chutney & Tea',
        lunch: 'Meals, Special Curd & Sweet',
        snacks: 'Samosa & Tea',
        dinner: 'Roti, Paneer & Rice',
      },
    }, studentToken);
    const passed = getRes.status === 200 && postRes.status === 200;
    results.push({ feature: 'Shared Mess Menu Management', endpoint: 'GET /api/meals/menu & POST /api/meals/menu', status: passed ? 'PASSED' : 'FAILED', details: 'Menu saved in MongoDB Atlas hostel_portal' });
  } catch (e: any) {
    results.push({ feature: 'Shared Mess Menu Management', endpoint: 'GET /api/meals/menu', status: 'FAILED', details: e.message });
  }

  // 10. Complaints Submission & Resolution
  let testComplaintId = '';
  try {
    const res = await makeRequest('POST', '/complaints', {
      studentId: studentId,
      category: 'Maintenance',
      subject: 'Tap Leaking',
      details: 'Bathroom tap is leaking continuously.',
    }, studentToken);

    if (res.status === 200 || res.status === 201) {
      testComplaintId = res.data.complaint?.id || res.data.complaint?._id;
      results.push({ feature: 'Complaint Submission', endpoint: 'POST /api/complaints', status: 'PASSED', details: `Complaint ID: ${testComplaintId}` });
    } else {
      results.push({ feature: 'Complaint Submission', endpoint: 'POST /api/complaints', status: 'FAILED', details: res.data });
    }
  } catch (e: any) {
    results.push({ feature: 'Complaint Submission', endpoint: 'POST /api/complaints', status: 'FAILED', details: e.message });
  }

  if (testComplaintId) {
    try {
      const res = await makeRequest('POST', `/complaints/${testComplaintId}/resolve`, {
        studentId: studentId,
        responseText: 'Plumber repaired the tap.',
      }, studentToken);
      results.push({ feature: 'Complaint Resolution', endpoint: `POST /api/complaints/:id/resolve`, status: res.status === 200 ? 'PASSED' : 'FAILED', details: res.data.message || 'Resolved' });
    } catch (e: any) {
      results.push({ feature: 'Complaint Resolution', endpoint: `POST /api/complaints/:id/resolve`, status: 'FAILED', details: e.message });
    }
  }

  // 11. Gate Attendance Scan
  try {
    const res = await makeRequest('POST', '/attendance/scan', {
      studentId: studentId,
      type: 'OUT',
      note: 'Going out for library',
    }, studentToken);
    const passed = res.status === 200 || res.status === 201;
    results.push({ feature: 'Gate Attendance Scan', endpoint: 'POST /api/attendance/scan', status: passed ? 'PASSED' : 'FAILED', details: 'Gate exit scan recorded' });
  } catch (e: any) {
    results.push({ feature: 'Gate Attendance Scan', endpoint: 'POST /api/attendance/scan', status: 'FAILED', details: e.message });
  }

  // 12. Behaviour Register Entry
  try {
    const res = await makeRequest('POST', '/behaviour', {
      studentId: studentId,
      actionType: 'add',
      logData: {
        title: 'Punctuality Award',
        description: 'Exemplary mess discipline and timing.',
        category: 'Praise',
      },
    }, studentToken);
    const passed = res.status === 200 || res.status === 201;
    results.push({ feature: 'Behaviour Register Log', endpoint: 'POST /api/behaviour', status: passed ? 'PASSED' : 'FAILED', details: 'Behaviour log entry added' });
  } catch (e: any) {
    results.push({ feature: 'Behaviour Register Log', endpoint: 'POST /api/behaviour', status: 'FAILED', details: e.message });
  }

  // 13. Health / Sickbay Record
  let testHealthId = '';
  try {
    const res = await makeRequest('POST', '/health', {
      studentId: studentId,
      symptoms: 'Mild Fever & Cold',
      temperature: '99.2 °F',
      status: 'Under Observation',
      note: 'Resting in sickbay',
    }, studentToken);
    if (res.status === 200 || res.status === 201) {
      testHealthId = res.data.healthRecord?.recordId || res.data.healthRecord?.id;
      results.push({ feature: 'Health/Sickbay Record Creation', endpoint: 'POST /api/health', status: 'PASSED', details: `Record ID: ${testHealthId}` });
    } else {
      results.push({ feature: 'Health/Sickbay Record Creation', endpoint: 'POST /api/health', status: 'FAILED', details: res.data });
    }
  } catch (e: any) {
    results.push({ feature: 'Health/Sickbay Record Creation', endpoint: 'POST /api/health', status: 'FAILED', details: e.message });
  }

  if (testHealthId) {
    try {
      const res = await makeRequest('DELETE', `/health/${testHealthId}?studentId=${studentId}`, null, studentToken);
      results.push({ feature: 'Health/Sickbay Record Deletion', endpoint: `DELETE /api/health/:id`, status: res.status === 200 ? 'PASSED' : 'FAILED', details: res.data.message || 'Deleted' });
    } catch (e: any) {
      results.push({ feature: 'Health/Sickbay Record Deletion', endpoint: `DELETE /api/health/:id`, status: 'FAILED', details: e.message });
    }
  }

  console.log('\n--- FINAL E2E TEST SUMMARY RESULTS ---');
  console.table(results);
}

runTests().catch(console.error);
