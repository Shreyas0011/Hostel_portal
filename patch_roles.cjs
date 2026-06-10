// patch_roles.cjs — applies all role-based tab expansions to main.js
// Uses exact CRLF patterns matching the original file
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'main.js');
let src = fs.readFileSync(filePath, 'utf8');

let patchCount = 0;

function patch(description, search, replace) {
  if (src.includes(search)) {
    src = src.replace(search, replace);
    console.log('✅', description);
    patchCount++;
  } else {
    console.warn('⚠️  NOT FOUND:', description);
  }
}

const N = '\r\n'; // CRLF

// ─── 1. STUDENT: add Health tab to sidebar nav ───────────────────────────────
patch(
  'Student sidebar: add Health nav item',
  `          <button class="nav-item \${state.studentActiveTab === 'complaints' ? 'active' : ''}" data-tab="complaints">${N}` +
  `            \${ICONS.complaint} Report Complaint${N}` +
  `          </button>${N}` +
  `        </nav>`,
  `          <button class="nav-item \${state.studentActiveTab === 'complaints' ? 'active' : ''}" data-tab="complaints">${N}` +
  `            \${ICONS.complaint} Report Complaint${N}` +
  `          </button>${N}` +
  `          <button class="nav-item \${state.studentActiveTab === 'health' ? 'active' : ''}" data-tab="health">${N}` +
  `            \${ICONS.shield} My Health Status${N}` +
  `          </button>${N}` +
  `        </nav>`
);

// ─── 2. STUDENT: update content router ───────────────────────────────────────
patch(
  'Student content router: add health branch',
  `        \${state.studentActiveTab === 'meals' ? renderMealsPlanner(student, false) : ${N}` +
  `          state.studentActiveTab === 'leave' ? renderLeaveSection(student, 'student') : ${N}` +
  `          renderComplaintsSection(student)}`,
  `        \${state.studentActiveTab === 'meals' ? renderMealsPlanner(student, false) : ${N}` +
  `          state.studentActiveTab === 'leave' ? renderLeaveSection(student, 'student') : ${N}` +
  `          state.studentActiveTab === 'health' ? renderHealthStatusSection(student, 'student') :${N}` +
  `          renderComplaintsSection(student)}`
);

// ─── 3. PARENT: add Health tab to sidebar nav ────────────────────────────────
patch(
  'Parent sidebar: add Health nav item',
  `          <button class="nav-item \${state.parentActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">${N}` +
  `            \${ICONS.users} Attendance & History${N}` +
  `          </button>${N}` +
  `        </nav>`,
  `          <button class="nav-item \${state.parentActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">${N}` +
  `            \${ICONS.users} Attendance & History${N}` +
  `          </button>${N}` +
  `          <button class="nav-item \${state.parentActiveTab === 'health' ? 'active' : ''}" data-tab="health">${N}` +
  `            \${ICONS.shield} Child's Health Records${N}` +
  `          </button>${N}` +
  `        </nav>`
);

// ─── 4. PARENT: update header h1 to include health title ─────────────────────
patch(
  'Parent header h1: add health title',
  `\${state.parentActiveTab === 'leave' ? 'Student Leave Application' : state.parentActiveTab === 'meals' ? "Child's Dining Planner" : "Attendance & History"}`,
  `\${state.parentActiveTab === 'leave' ? 'Student Leave Application' : state.parentActiveTab === 'meals' ? "Child's Dining Planner" : state.parentActiveTab === 'health' ? "Child's Health Records" : "Attendance & History"}`
);

// ─── 5. PARENT: update content router ────────────────────────────────────────
patch(
  'Parent content router: add health branch',
  `        \${state.parentActiveTab === 'leave' ? renderLeaveSection(student, 'parent') : ${N}` +
  `          state.parentActiveTab === 'meals' ? renderMealsPlanner(student, true) :${N}` +
  `          renderParentAttendanceSection(student)}`,
  `        \${state.parentActiveTab === 'leave' ? renderLeaveSection(student, 'parent') : ${N}` +
  `          state.parentActiveTab === 'meals' ? renderMealsPlanner(student, true) :${N}` +
  `          state.parentActiveTab === 'health' ? renderHealthStatusSection(student, 'parent') :${N}` +
  `          renderParentAttendanceSection(student)}`
);

// ─── 6. WARDEN: add Attendance & Health nav items ────────────────────────────
patch(
  'Warden sidebar: add Attendance & Health nav items',
  `          <button class="nav-item \${state.wardenActiveTab === 'beds' ? 'active' : ''}" data-tab="beds">${N}` +
  `            \${ICONS.key} Bed Assignments${N}` +
  `          </button>${N}` +
  `        </nav>`,
  `          <button class="nav-item \${state.wardenActiveTab === 'beds' ? 'active' : ''}" data-tab="beds">${N}` +
  `            \${ICONS.key} Bed Assignments${N}` +
  `          </button>${N}` +
  `          <button class="nav-item \${state.wardenActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">${N}` +
  `            \${ICONS.users} Gate &amp; Attendance${N}` +
  `          </button>${N}` +
  `          <button class="nav-item \${state.wardenActiveTab === 'health' ? 'active' : ''}" data-tab="health">${N}` +
  `            \${ICONS.shield} Health Logs${N}` +
  `          </button>${N}` +
  `        </nav>`
);

// ─── 7. WARDEN: update content router ────────────────────────────────────────
patch(
  'Warden content router: add attendance & health branches',
  `        \${state.wardenActiveTab === 'overview' ? renderWardenOverview(stats) : ${N}` +
  `          state.wardenActiveTab === 'leaves' ? renderWardenLeaves() : ${N}` +
  `          state.wardenActiveTab === 'beds' ? renderBedAssignments() :${N}` +
  `          renderWardenDirectory()}`,
  `        \${state.wardenActiveTab === 'overview' ? renderWardenOverview(stats) : ${N}` +
  `          state.wardenActiveTab === 'leaves' ? renderWardenLeaves() : ${N}` +
  `          state.wardenActiveTab === 'beds' ? renderBedAssignments() :${N}` +
  `          state.wardenActiveTab === 'attendance' ? renderWardenAttendanceView() :${N}` +
  `          state.wardenActiveTab === 'health' ? renderWardenHealthView() :${N}` +
  `          renderWardenDirectory()}`
);

// ─── 8. ADMIN: add Attendance & Health nav items ─────────────────────────────
patch(
  'Admin sidebar: add Attendance & Health nav items',
  `          <button class="nav-item \${state.adminActiveTab === 'leaves' ? 'active' : ''}" data-tab="leaves">${N}` +
  `            \${ICONS.calendar} Student Absence Logs${N}` +
  `          </button>${N}` +
  `        </nav>`,
  `          <button class="nav-item \${state.adminActiveTab === 'leaves' ? 'active' : ''}" data-tab="leaves">${N}` +
  `            \${ICONS.calendar} Student Absence Logs${N}` +
  `          </button>${N}` +
  `          <button class="nav-item \${state.adminActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">${N}` +
  `            \${ICONS.users} Gate &amp; Attendance${N}` +
  `          </button>${N}` +
  `          <button class="nav-item \${state.adminActiveTab === 'health' ? 'active' : ''}" data-tab="health">${N}` +
  `            \${ICONS.shield} Health Logs${N}` +
  `          </button>${N}` +
  `        </nav>`
);

// ── Write back ────────────────────────────────────────────────────────────────
fs.writeFileSync(filePath, src, 'utf8');
console.log(`\nDone — ${patchCount} patches applied.`);
