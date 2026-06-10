// patch_fix_all.cjs — fixes all health/attendance routing issues
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'main.js');
let src = fs.readFileSync(filePath, 'utf8');

let patchCount = 0;
const N = '\r\n';

function patch(description, search, replace) {
  if (src.includes(search)) {
    src = src.replace(search, replace);
    console.log('✅', description);
    patchCount++;
  } else {
    console.warn('⚠️  NOT FOUND:', description);
  }
}

// ─── FIX 1: Admin h1 — add attendance & health title handling ────────────────
patch(
  'Admin h1: handle attendance & health titles',
  `\${state.adminActiveTab === 'menu' ? 'Mess Menu Management' : state.adminActiveTab === 'leaves' ? 'Student Absence Registry' : 'Student Directory'}`,
  `\${state.adminActiveTab === 'menu' ? 'Mess Menu Management' : state.adminActiveTab === 'leaves' ? 'Student Absence Registry' : state.adminActiveTab === 'attendance' ? 'Gate & Attendance' : state.adminActiveTab === 'health' ? 'Health & Medical Logs' : 'Student Directory'}`
);

// ─── FIX 2: Admin content router — add attendance & health branches ───────────
patch(
  'Admin content router: add attendance & health',
  `        \` : state.adminActiveTab === 'leaves' ? renderWardenLeaves() : renderWardenDirectory()}`,
  `        \` : state.adminActiveTab === 'leaves' ? renderWardenLeaves() : state.adminActiveTab === 'attendance' ? renderWardenAttendanceView() : state.adminActiveTab === 'health' ? renderWardenHealthView() : renderWardenDirectory()}`
);

// ─── FIX 3: Admin attachEvents — add health/attendance event wiring ───────────
patch(
  'Admin attachEvents: add health & attendance event wiring',
  `  if (state.adminActiveTab === 'directory') {`,
  `  if (state.adminActiveTab === 'health') attachHealthViewEvents();\r\n  if (state.adminActiveTab === 'attendance') attachAttendanceViewEvents();\r\n\r\n  if (state.adminActiveTab === 'directory') {`
);

// ─── FIX 4: Warden attachEvents — add health/attendance event wiring ──────────
// Add calls right before the closing brace of attachWardenEvents
patch(
  'Warden attachEvents: add health & attendance event wiring',
  `  const detailModalClose = document.getElementById('btn-close-detail-modal');\r\n  if (detailModalClose) {\r\n    detailModalClose.addEventListener('click', () => {\r\n      const detailModal = document.getElementById('student-detail-modal');\r\n      if (detailModal) detailModal.classList.remove('active');\r\n    });\r\n  }\r\n}\r\n\r\n// Chart.js render function`,
  `  const detailModalClose = document.getElementById('btn-close-detail-modal');\r\n  if (detailModalClose) {\r\n    detailModalClose.addEventListener('click', () => {\r\n      const detailModal = document.getElementById('student-detail-modal');\r\n      if (detailModal) detailModal.classList.remove('active');\r\n    });\r\n  }\r\n\r\n  if (state.wardenActiveTab === 'health') attachHealthViewEvents();\r\n  if (state.wardenActiveTab === 'attendance') attachAttendanceViewEvents();\r\n\r\n  // btn-view-health from directory\r\n  document.querySelectorAll('.btn-view-health').forEach(btn => {\r\n    btn.addEventListener('click', (e) => {\r\n      const studentId = e.target.closest('.btn-view-health').dataset.stuId;\r\n      state.viewHealthStudentId = studentId;\r\n      if (state.currentView === 'warden') state.wardenActiveTab = 'health';\r\n      if (state.currentView === 'admin') state.adminActiveTab = 'health';\r\n      if (state.currentView === 'superadmin') state.superActiveTab = 'health';\r\n      render();\r\n    });\r\n  });\r\n\r\n  // btn-view-attendance from directory\r\n  document.querySelectorAll('.btn-view-attendance').forEach(btn => {\r\n    btn.addEventListener('click', (e) => {\r\n      const studentId = e.target.closest('.btn-view-attendance').dataset.stuId;\r\n      state.viewAttendanceStudentId = studentId;\r\n      if (state.currentView === 'warden') state.wardenActiveTab = 'attendance';\r\n      if (state.currentView === 'admin') state.adminActiveTab = 'attendance';\r\n      if (state.currentView === 'superadmin') state.superActiveTab = 'attendance';\r\n      render();\r\n    });\r\n  });\r\n}\r\n\r\n// Chart.js render function`
);

// ─── FIX 5: Admin attachEvents — also add btn-view-health/attendance handlers ─
patch(
  'Admin attachEvents: add btn-view-health/attendance handlers',
  `    const closeDetailModalBtn = document.getElementById('btn-close-detail-modal');\r\n    if (closeDetailModalBtn) {\r\n      closeDetailModalBtn.addEventListener('click', () => {\r\n        document.getElementById('student-detail-modal').classList.remove('active');\r\n      });\r\n    }\r\n  }\r\n}\r\n\r\n// View template: SUPER ADMIN`,
  `    const closeDetailModalBtn = document.getElementById('btn-close-detail-modal');\r\n    if (closeDetailModalBtn) {\r\n      closeDetailModalBtn.addEventListener('click', () => {\r\n        document.getElementById('student-detail-modal').classList.remove('active');\r\n      });\r\n    }\r\n\r\n    // btn-view-health from admin directory\r\n    document.querySelectorAll('.btn-view-health').forEach(btn => {\r\n      btn.addEventListener('click', (e) => {\r\n        const studentId = e.target.closest('.btn-view-health').dataset.stuId;\r\n        state.viewHealthStudentId = studentId;\r\n        state.adminActiveTab = 'health';\r\n        render();\r\n      });\r\n    });\r\n\r\n    // btn-view-attendance from admin directory\r\n    document.querySelectorAll('.btn-view-attendance').forEach(btn => {\r\n      btn.addEventListener('click', (e) => {\r\n        const studentId = e.target.closest('.btn-view-attendance').dataset.stuId;\r\n        state.viewAttendanceStudentId = studentId;\r\n        state.adminActiveTab = 'attendance';\r\n        render();\r\n      });\r\n    });\r\n  }\r\n}\r\n\r\n// View template: SUPER ADMIN`
);

// ─── FIX 6: Superadmin — add attendance & health nav items ────────────────────
patch(
  'Superadmin sidebar: add attendance & health nav items',
  `          <button class="nav-item \${state.superActiveTab === 'database' ? 'active' : ''}" data-tab="database">\r\n            \${ICONS.waste} Database Controls\r\n          </button>\r\n        </nav>`,
  `          <button class="nav-item \${state.superActiveTab === 'database' ? 'active' : ''}" data-tab="database">\r\n            \${ICONS.waste} Database Controls\r\n          </button>\r\n          <button class="nav-item \${state.superActiveTab === 'directory' ? 'active' : ''}" data-tab="directory">\r\n            \${ICONS.users} Student Directory\r\n          </button>\r\n          <button class="nav-item \${state.superActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">\r\n            \${ICONS.users} Gate &amp; Attendance\r\n          </button>\r\n          <button class="nav-item \${state.superActiveTab === 'health' ? 'active' : ''}" data-tab="health">\r\n            \${ICONS.shield} Health Logs\r\n          </button>\r\n        </nav>`
);

// ─── FIX 7: Superadmin h1 — add attendance, health, directory titles ──────────
patch(
  'Superadmin h1: handle all tab titles',
  `\${state.superActiveTab === 'dashboard' ? 'Master System Dashboard' : state.superActiveTab === 'logs' ? 'System Activity Logs' : 'Database Maintenance'}`,
  `\${state.superActiveTab === 'dashboard' ? 'Master System Dashboard' : state.superActiveTab === 'logs' ? 'System Activity Logs' : state.superActiveTab === 'directory' ? 'Student Directory' : state.superActiveTab === 'attendance' ? 'Gate & Attendance' : state.superActiveTab === 'health' ? 'Health & Medical Logs' : 'Database Maintenance'}`
);

// ─── FIX 8: Superadmin content router — add directory, attendance & health ─────
patch(
  'Superadmin content router: add directory/attendance/health',
  `        \`}\r\n      </main>\r\n    </div>\r\n  \`;\r\n}\r\n\r\nfunction attachSuperadminEvents()`,
  `        \` : state.superActiveTab === 'directory' ? renderWardenDirectory() : state.superActiveTab === 'attendance' ? renderWardenAttendanceView() : state.superActiveTab === 'health' ? renderWardenHealthView() : ''}\r\n      </main>\r\n    </div>\r\n  \`;\r\n}\r\n\r\nfunction attachSuperadminEvents()`
);

// Write back
fs.writeFileSync(filePath, src, 'utf8');
console.log(`\nDone — ${patchCount} patches applied.`);
