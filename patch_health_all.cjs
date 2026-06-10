const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'main.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add viewHealthStudentId to state
content = content.replace(
  "viewAttendanceStudentId: null,",
  "viewAttendanceStudentId: null,\n  viewHealthStudentId: null,"
);

// 2. Insert new helpers before initApp or at a good spot like before renderWardenAttendanceView
const healthHelpers = `
function renderHealthStatusSection(student, role) {
  const isStudent = role === 'student';
  const records = student.healthRecords || [];
  const sortedRecords = [...records].reverse();

  return \`
    <div class="dashboard-grid">
      \${isStudent ? \`
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">\${ICONS.shield} Report Health Status</h2>
        </div>
        <form id="health-status-form" style="display:flex; flex-direction:column; gap:15px; margin-top:15px;">
          <div>
            <label class="form-label">Current Symptoms</label>
            <input type="text" id="health-symptoms" class="form-input" placeholder="e.g., Fever, Cough, Headache" required>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
            <div>
              <label class="form-label">Body Temperature</label>
              <input type="text" id="health-temp" class="form-input" placeholder="e.g., 98.6°F">
            </div>
            <div>
              <label class="form-label">Current Status</label>
              <select id="health-status" class="form-input">
                <option value="Resting in Room">Resting in Room</option>
                <option value="Needs Medical Attention">Needs Medical Attention</option>
                <option value="Visiting Hospital">Visiting Hospital</option>
                <option value="Recovered">Recovered / Normal</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label">Additional Notes</label>
            <textarea id="health-note" class="form-input" rows="2" placeholder="Any medication taken or extra details?"></textarea>
          </div>
          <button type="submit" class="btn-primary" style="margin-top:10px;">Submit Health Report</button>
        </form>
      </div>
      \` : ''}

      <div class="dashboard-panel \${!isStudent ? 'dashboard-full' : ''}">
        <div class="panel-header">
          <h2 class="panel-title">\${ICONS.settings} Health & Medical History</h2>
          <span style="font-size:12px; color:var(--text-secondary);">\${records.length} records</span>
        </div>
        <div style="margin-top:15px; display:flex; flex-direction:column; gap:12px; max-height:500px; overflow-y:auto;">
          \${sortedRecords.length === 0 ? \`
            <div class="empty-state">
              \${ICONS.shield}
              <p>No health issues reported. Student is healthy!</p>
            </div>
          \` : sortedRecords.map(r => \`
            <div style="background:#f9fafb; border:1px solid var(--border-color); border-radius:8px; padding:15px; position:relative;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div>
                  <strong style="color:var(--text-primary); font-size:14px;">\${r.symptoms}</strong>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">\${r.date} at \${r.time}</div>
                </div>
                <span class="badge \${r.status === 'Recovered' ? 'approved' : r.status === 'Needs Medical Attention' ? 'rejected' : 'pending'}">\${r.status}</span>
              </div>
              <div style="display:flex; gap:15px; font-size:13px; color:var(--text-secondary); margin-bottom:8px;">
                <span><strong>Temp:</strong> \${r.temperature || 'Not recorded'}</span>
              </div>
              \${r.note ? \`<div style="background:#f3f4f6; padding:10px; border-radius:6px; font-size:13px; color:var(--text-primary); border-left:3px solid var(--primary);">\${r.note}</div>\` : ''}
            </div>
          \`).join('')}
        </div>
      </div>
    </div>
  \`;
}

function renderWardenHealthView() {
  const defaultStudent = state.db[0];
  const selectedStudentId = state.viewHealthStudentId || defaultStudent.id;
  const student = state.db.find(s => s.id === selectedStudentId) || defaultStudent;
  
  const options = state.db.map(s => \`<option value="\${s.id}" \${s.id === student.id ? 'selected' : ''}>\${s.id} - \${s.name}</option>\`).join('');

  return \`
    <div class="dashboard-panel dashboard-full" style="margin-bottom: 20px;">
      <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
        <h2 class="panel-title">\${ICONS.shield} Health & Medical Logs</h2>
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">Select Student:</label>
          <select id="health-student-select" class="filter-select" style="min-width: 250px;">
            \${options}
          </select>
        </div>
      </div>
    </div>
    
    \${renderHealthStatusSection(student, 'admin')}
  \`;
}

function attachHealthViewEvents() {
  const selectEl = document.getElementById('health-student-select');
  if (selectEl) {
    selectEl.addEventListener('change', (e) => {
      state.viewHealthStudentId = e.target.value;
      render();
    });
  }

  // Handle form submission for student role
  const healthForm = document.getElementById('health-status-form');
  if (healthForm && state.currentStudentId) {
    healthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const student = state.db.find(s => s.id === state.currentStudentId);
      if (!student) return;

      if (!student.healthRecords) student.healthRecords = [];

      const symptoms = document.getElementById('health-symptoms').value;
      const temperature = document.getElementById('health-temp').value;
      const status = document.getElementById('health-status').value;
      const note = document.getElementById('health-note').value;

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

      saveDB(state.db);
      showToast('Health status updated successfully!', 'success');
      render();
    });
  }
}
`;

content = content.replace('function renderWardenAttendanceView() {', healthHelpers + '\nfunction renderWardenAttendanceView() {');

// 3. Update Student View Nav & Content
content = content.replace(
  '<button class="nav-item ${state.studentActiveTab === \'complaints\' ? \'active\' : \'\'}" data-tab="complaints">\n            ${ICONS.complaint} Talk to Us\n          </button>',
  `<button class="nav-item \${state.studentActiveTab === 'complaints' ? 'active' : ''}" data-tab="complaints">
            \${ICONS.complaint} Talk to Us
          </button>
          <button class="nav-item \${state.studentActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            \${ICONS.shield} Health Status
          </button>`
);
content = content.replace(
  "state.studentActiveTab === 'complaints' ? 'Talk to Us / Feedback' : 'Hostel Leaves Request'",
  "state.studentActiveTab === 'complaints' ? 'Talk to Us / Feedback' : state.studentActiveTab === 'health' ? 'Health Status' : 'Hostel Leaves Request'"
);
content = content.replace(
  "state.studentActiveTab === 'complaints' ? renderComplaintsSection(student) : renderLeaveSection(student, 'student')",
  "state.studentActiveTab === 'complaints' ? renderComplaintsSection(student) : state.studentActiveTab === 'health' ? renderHealthStatusSection(student, 'student') : renderLeaveSection(student, 'student')"
);

// 4. Update Parent View Nav & Content
content = content.replace(
  '<button class="nav-item ${state.parentActiveTab === \'attendance\' ? \'active\' : \'\'}" data-tab="attendance">\n            ${ICONS.users} Attendance & History\n          </button>',
  `<button class="nav-item \${state.parentActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            \${ICONS.users} Attendance & History
          </button>
          <button class="nav-item \${state.parentActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            \${ICONS.shield} Health Records
          </button>`
);
content = content.replace(
  "state.parentActiveTab === 'attendance' ? 'Attendance & History'",
  "state.parentActiveTab === 'attendance' ? 'Attendance & History' : state.parentActiveTab === 'health' ? 'Health Records'"
);
content = content.replace(
  "state.parentActiveTab === 'attendance' ? renderParentAttendanceSection(student) :",
  "state.parentActiveTab === 'attendance' ? renderParentAttendanceSection(student) : state.parentActiveTab === 'health' ? renderHealthStatusSection(student, 'parent') :"
);

// 5. Update Warden, Admin, Superadmin Nav & Content
// Warden
content = content.replace(
  '<button class="nav-item ${state.wardenActiveTab === \'attendance\' ? \'active\' : \'\'}" data-tab="attendance">\n            ${ICONS.shield} Gate & Attendance\n          </button>',
  `<button class="nav-item \${state.wardenActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            \${ICONS.shield} Gate & Attendance
          </button>
          <button class="nav-item \${state.wardenActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            \${ICONS.settings} Health Logs
          </button>`
);
content = content.replace(
  "state.wardenActiveTab === 'attendance' ? 'Gate & Movement Attendance'",
  "state.wardenActiveTab === 'health' ? 'Health & Medical Logs' : state.wardenActiveTab === 'attendance' ? 'Gate & Movement Attendance'"
);
content = content.replace(
  "state.wardenActiveTab === 'attendance' ? renderWardenAttendanceView() :",
  "state.wardenActiveTab === 'health' ? renderWardenHealthView() : state.wardenActiveTab === 'attendance' ? renderWardenAttendanceView() :"
);

// Admin
content = content.replace(
  '<button class="nav-item ${state.adminActiveTab === \'attendance\' ? \'active\' : \'\'}" data-tab="attendance">\n            ${ICONS.shield} Gate & Attendance\n          </button>',
  `<button class="nav-item \${state.adminActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            \${ICONS.shield} Gate & Attendance
          </button>
          <button class="nav-item \${state.adminActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            \${ICONS.settings} Health Logs
          </button>`
);
content = content.replace(
  "state.adminActiveTab === 'attendance' ? 'Gate & Movement Attendance'",
  "state.adminActiveTab === 'health' ? 'Health & Medical Logs' : state.adminActiveTab === 'attendance' ? 'Gate & Movement Attendance'"
);
content = content.replace(
  "state.adminActiveTab === 'attendance' ? renderWardenAttendanceView() :",
  "state.adminActiveTab === 'health' ? renderWardenHealthView() : state.adminActiveTab === 'attendance' ? renderWardenAttendanceView() :"
);

// Superadmin
content = content.replace(
  '<button class="nav-item ${state.superActiveTab === \'attendance\' ? \'active\' : \'\'}" data-tab="attendance">\n            ${ICONS.shield} Gate & Attendance\n          </button>',
  `<button class="nav-item \${state.superActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            \${ICONS.shield} Gate & Attendance
          </button>
          <button class="nav-item \${state.superActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            \${ICONS.settings} Health Logs
          </button>`
);
content = content.replace(
  "state.superActiveTab === 'attendance' ? 'Gate & Movement Attendance'",
  "state.superActiveTab === 'health' ? 'Health & Medical Logs' : state.superActiveTab === 'attendance' ? 'Gate & Movement Attendance'"
);
content = content.replace(
  "state.superActiveTab === 'attendance' ? renderWardenAttendanceView() :",
  "state.superActiveTab === 'health' ? renderWardenHealthView() : state.superActiveTab === 'attendance' ? renderWardenAttendanceView() :"
);

// 6. Update Student Directory Table to include "Med Record" button next to Gate Record
const dirTdOld = '<button class="table-btn btn-view-attendance" data-stu-id="${s.id}" style="background:#e0e7ff; color:#4338ca; border-color:#c7d2fe;">Gate Record</button>';
const dirTdNew = '<button class="table-btn btn-view-health" data-stu-id="${s.id}" style="background:#fee2e2; color:#991b1b; border-color:#fecaca;">Med Record</button>\n                    <button class="table-btn btn-view-attendance" data-stu-id="${s.id}" style="background:#e0e7ff; color:#4338ca; border-color:#c7d2fe;">Gate Record</button>';
content = content.replace(dirTdOld, dirTdNew);

// 7. Update attachDirectoryEvents
const dirEventsOld = "document.querySelectorAll('.btn-view-attendance').forEach(btn => {";
const dirEventsNew = `document.querySelectorAll('.btn-view-health').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.target.dataset.stuId;
      state.viewHealthStudentId = studentId;
      if (state.currentView === 'warden') state.wardenActiveTab = 'health';
      if (state.currentView === 'admin') state.adminActiveTab = 'health';
      if (state.currentView === 'superadmin') state.superActiveTab = 'health';
      render();
    });
  });\n\n  document.querySelectorAll('.btn-view-attendance').forEach(btn => {`;
content = content.replace(dirEventsOld, dirEventsNew);

// 8. Call attachHealthViewEvents
content = content.replace(
  "if (state.studentActiveTab === 'leaves') attachLeaveFormEvents('student');",
  "if (state.studentActiveTab === 'health') attachHealthViewEvents();\n  if (state.studentActiveTab === 'leaves') attachLeaveFormEvents('student');"
);
content = content.replace(
  "if (state.wardenActiveTab === 'attendance') attachAttendanceViewEvents();",
  "if (state.wardenActiveTab === 'health') attachHealthViewEvents();\n  if (state.wardenActiveTab === 'attendance') attachAttendanceViewEvents();"
);
content = content.replace(
  "if (state.adminActiveTab === 'attendance') attachAttendanceViewEvents();",
  "if (state.adminActiveTab === 'health') attachHealthViewEvents();\n  if (state.adminActiveTab === 'attendance') attachAttendanceViewEvents();"
);
content = content.replace(
  "if (state.superActiveTab === 'attendance') attachAttendanceViewEvents();",
  "if (state.superActiveTab === 'health') attachHealthViewEvents();\n  if (state.superActiveTab === 'attendance') attachAttendanceViewEvents();"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully applied Health patch.');
