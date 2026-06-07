import './style.css';
import { 
  initDB, 
  saveDB, 
  getDateString, 
  formatDisplayDate, 
  isStudentOnLeave, 
  applyLeave, 
  cancelLeave, 
  approveLeave, 
  rejectLeave, 
  updateMealBookings, 
  getAnalyticsForDate, 
  getWardenDashboardStats,
  reportComplaint,
  logEntryExit,
  getBedAssignments
} from './data.js';

// SVG Icon set (Feather Icons implementation)
const ICONS = {
  home: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  calendar: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  coffee: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
  shield: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  users: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  logout: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  search: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  plus: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  alert: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  check: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  x: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  user: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  lock: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  waste: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  settings: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  key: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>`,
  complaint: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="7" x2="12" y2="11"></line><line x1="12" y1="14" x2="12.01" y2="14"></line></svg>`
};

// Global App State
const state = {
  db: [],
  currentView: 'login', // 'login' | 'student' | 'parent' | 'warden' | 'admin' | 'superadmin'
  currentStudentId: null,
  viewAttendanceStudentId: null,
  viewHealthStudentId: null,
  loginTab: 'student', // 'student' | 'parent' | 'warden' | 'admin' | 'superadmin'
  studentActiveTab: 'meals', // 'meals' | 'leave'
  parentActiveTab: 'leave', // 'leave' | 'meals'
  wardenActiveTab: 'overview', // 'overview' | 'leaves' | 'directory'
  adminActiveTab: 'menu', // 'menu' | 'leaves' | 'directory'
  superActiveTab: 'dashboard', // 'dashboard' | 'logs' | 'database'
  
  // Student Directory State
  directorySearch: '',
  directoryBlockFilter: 'all',
  directoryStatusFilter: 'all',
  directoryPage: 1,
  directoryPageSize: 10
};

// Chart.js instance holder
let mealChartInstance = null;

// Force Light theme classes clean
document.documentElement.className = '';

// Toast Notification Helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = ICONS.check;
  if (type === 'error') icon = ICONS.x;
  if (type === 'warning') icon = ICONS.alert;
  if (type === 'info') icon = ICONS.shield;

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);
  
  // Trigger animation reflow
  setTimeout(() => toast.classList.add('active'), 10);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Router & View Renderer
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  if (state.currentView === 'login') {
    app.innerHTML = renderLoginView();
    attachLoginEvents();
  } else if (state.currentView === 'student') {
    app.innerHTML = renderStudentDashboard();
    attachStudentEvents();
  } else if (state.currentView === 'parent') {
    app.innerHTML = renderParentDashboard();
    attachParentEvents();
  } else if (state.currentView === 'warden') {
    app.innerHTML = renderWardenDashboard();
    attachWardenEvents();
    if (state.wardenActiveTab === 'overview') {
      renderWardenChart();
    }
  } else if (state.currentView === 'admin') {
    app.innerHTML = renderAdminDashboard();
    attachAdminEvents();
  } else if (state.currentView === 'superadmin') {
    app.innerHTML = renderSuperadminDashboard();
    attachSuperadminEvents();
  }
}

// View template: LOGIN
function renderLoginView() {
  return `
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo">
          ${ICONS.shield}
          <span>TRANSCEND HOSTEL</span>
        </div>
        <p class="login-subtitle">Facility & Dining Management System</p>
        
        <div id="login-form-area" style="margin-top: 20px;">
          <div class="login-form-group">
            <label class="login-label">Email Address / Warden PIN</label>
            <input type="text" id="login-identifier" class="login-input" placeholder="e.g., student@hostel.edu or 1234" value="aarav.sharma@hostel.edu">
          </div>
          <div class="login-form-group" style="margin-top: 15px;">
            <label class="login-label">Password</label>
            <input type="password" id="login-password" class="login-input" placeholder="••••••••" value="password">

          </div>
          <button id="btn-unified-login" class="btn-login" style="margin-top: 20px; background:var(--primary);">Sign In</button>
        </div>
        
        <div class="login-quick-demo">
          <p class="demo-title">Quick Demo Logins</p>
          <div class="demo-buttons" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;">
            <button class="demo-btn" id="demo-student" style="padding: 8px 4px;">
              <span class="role" style="font-size:10px;">Student</span>
            </button>
            <button class="demo-btn" id="demo-parent" style="padding: 8px 4px;">
              <span class="role" style="font-size:10px;">Parent</span>
            </button>
            <button class="demo-btn" id="demo-warden" style="padding: 8px 4px;">
              <span class="role" style="font-size:10px;">Warden</span>
            </button>
            <button class="demo-btn" id="demo-admin" style="padding: 8px 4px; border-color: rgba(139, 92, 246, 0.3);">
              <span class="role" style="font-size:10px; color:#8b5cf6;">Admin</span>
            </button>
            <button class="demo-btn" id="demo-super" style="padding: 8px 4px; border-color: rgba(236, 72, 153, 0.3);">
              <span class="role" style="font-size:10px; color:#ec4899;">Super</span>
            </button>
          </div>
        </div>
        
        <div class="login-footer" style="margin-top: 25px; text-align: center; font-size: 11px; color: var(--text-muted); line-height: 1.6; border-top: 1px solid rgba(226, 232, 240, 0.1); padding-top: 15px;">
          <p style="margin: 0; font-weight: 500;">Owned by Transcend group of institutions</p>
          <p style="margin: 2px 0 0 0; opacity: 0.8;">Developed by Start Smart by SE</p>
        </div>
      </div>
    </div>
  `;
}

function attachLoginEvents() {
  // Unified login event
  const unifiedLoginBtn = document.getElementById('btn-unified-login');
  if (unifiedLoginBtn) {
    unifiedLoginBtn.addEventListener('click', () => {
      const email = document.getElementById('login-identifier').value.trim();
      const password = document.getElementById('login-password').value.trim();

      if (!email) {
        showToast('Please enter your email or PIN.', 'warning');
        return;
      }

      // Check Warden PIN login first
      if (email === '1234') {
        state.currentView = 'warden';
        state.wardenActiveTab = 'overview';
        showToast('Logged in as Hostel Warden', 'success');
        render();
        return;
      }

      if (!password) {
        showToast('Please enter your password.', 'warning');
        return;
      }

      const normalizedEmail = email.toLowerCase();

      // Check Campus Admin
      if (normalizedEmail === 'admin@hostel.edu') {
        if (password === 'admin123') {
          state.currentView = 'admin';
          state.adminActiveTab = 'menu';
          showToast('Logged in as Campus Admin', 'success');
          render();
        } else {
          showToast('Incorrect password.', 'error');
        }
        return;
      }

      // Check Super Admin
      if (normalizedEmail === 'superadmin@hostel.edu') {
        if (password === 'super123') {
          state.currentView = 'superadmin';
          state.superActiveTab = 'dashboard';
          showToast('Logged in as Super Admin', 'success');
          render();
        } else {
          showToast('Incorrect password.', 'error');
        }
        return;
      }

      // Check Parent
      if (normalizedEmail.startsWith('parent.')) {
        const studentEmailPart = normalizedEmail.replace('parent.', '');
        const student = state.db.find(s => s.email.toLowerCase() === studentEmailPart);
        if (student) {
          if (password === 'password') {
            state.currentStudentId = student.id;
            state.currentView = 'parent';
            state.parentActiveTab = 'leave';
            showToast('Welcome to the Parent Portal!', 'success');
            render();
          } else {
            showToast('Incorrect password.', 'error');
          }
        } else {
          showToast('Invalid parent email address.', 'error');
        }
        return;
      }

      // Otherwise, check Student
      const student = state.db.find(s => s.email.toLowerCase() === normalizedEmail);
      if (student) {
        if (password === 'password') {
          state.currentStudentId = student.id;
          state.currentView = 'student';
          state.studentActiveTab = 'meals';
          showToast('Welcome to the Student Portal!', 'success');
          render();
        } else {
          showToast('Incorrect password.', 'error');
        }
        return;
      }

      // If nothing matched
      showToast('Invalid credentials.', 'error');
    });
  }

  // Quick Demo Buttons
  const demoStudent = document.getElementById('demo-student');
  if (demoStudent) {
    demoStudent.addEventListener('click', () => {
      state.currentStudentId = 'STU001';
      state.currentView = 'student';
      state.studentActiveTab = 'meals';
      showToast('Logged in as Aarav Sharma (Room B-101)', 'success');
      render();
    });
  }

  const demoParent = document.getElementById('demo-parent');
  if (demoParent) {
    demoParent.addEventListener('click', () => {
      state.currentStudentId = 'STU001';
      state.currentView = 'parent';
      state.parentActiveTab = 'leave';
      showToast('Logged in as Parent of Aarav Sharma', 'success');
      render();
    });
  }

  const demoWarden = document.getElementById('demo-warden');
  if (demoWarden) {
    demoWarden.addEventListener('click', () => {
      state.currentView = 'warden';
      state.wardenActiveTab = 'overview';
      showToast('Logged in as Hostel Warden', 'success');
      render();
    });
  }

  const demoAdmin = document.getElementById('demo-admin');
  if (demoAdmin) {
    demoAdmin.addEventListener('click', () => {
      state.currentView = 'admin';
      state.adminActiveTab = 'menu';
      showToast('Logged in as Campus Admin', 'success');
      render();
    });
  }

  const demoSuper = document.getElementById('demo-super');
  if (demoSuper) {
    demoSuper.addEventListener('click', () => {
      state.currentView = 'superadmin';
      state.superActiveTab = 'dashboard';
      showToast('Logged in as Super Admin', 'success');
      render();
    });
  }
}

// View template: STUDENT PORTAL
function renderStudentDashboard() {
  const student = state.db.find(s => s.id === state.currentStudentId);
  if (!student) return `<div>Error: Student not found.</div>`;

  const todayStr = getDateString(0);
  const onLeaveToday = isStudentOnLeave(student, todayStr);

  return `
    <div class="dashboard-layout">
      <!-- Mobile Toggle -->
      <div style="position:fixed; top:15px; left:15px; z-index:999;">
        <button id="mobile-toggle" class="mobile-menu-toggle">
          ${ICONS.home}
        </button>
      </div>

      <!-- Sidebar -->
      <aside id="dashboard-sidebar" class="sidebar">
        <div class="sidebar-brand">
          ${ICONS.shield}
          <span>Hostel Student</span>
        </div>
        
        <div class="sidebar-profile">
          <div class="profile-avatar">${student.name.split(' ').map(n => n[0]).join('')}</div>
          <div class="profile-info">
            <span class="profile-name">${student.name}</span>
            <span class="profile-role">Room ${student.room} • ${student.id}</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <button class="nav-item ${state.studentActiveTab === 'meals' ? 'active' : ''}" data-tab="meals">
            ${ICONS.coffee} Meal Booking
          </button>
          <button class="nav-item ${state.studentActiveTab === 'leave' ? 'active' : ''}" data-tab="leave">
            ${ICONS.calendar} Apply Leave
          </button>
          <button class="nav-item ${state.studentActiveTab === 'complaints' ? 'active' : ''}" data-tab="complaints">
            ${ICONS.complaint} Talk to Us
          </button>
          <button class="nav-item ${state.studentActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            ${ICONS.shield} My Health Status
          </button>
        </nav>
        
        <div class="sidebar-footer">
          <button id="btn-logout" class="btn-logout">
            ${ICONS.logout} Logout
          </button>
        </div>
      </aside>

      <!-- Main Panel -->
      <main class="main-content">
        <header class="header-container">
          <div class="header-title-section">
            <h1>${state.studentActiveTab === 'meals' ? 'Dining & Meal Booking' : state.studentActiveTab === 'leave' ? 'Leave Requests' : state.studentActiveTab === 'health' ? 'My Health Status' : 'Talk to Us'}</h1>
            <p>Hostel Student Facility Portal • Block ${student.block}</p>
          </div>
          
          <div>
            ${onLeaveToday ? 
              `<span class="badge rejected" style="font-size:13px; padding: 8px 16px;">🏢 Currently On Leave</span>` : 
              `<span class="badge approved" style="font-size:13px; padding: 8px 16px;">🏠 Present in Hostel</span>`
            }
          </div>
        </header>

        ${state.studentActiveTab === 'meals' ? renderMealsPlanner(student, false) : 
          state.studentActiveTab === 'leave' ? renderLeaveSection(student, 'student') : 
          state.studentActiveTab === 'health' ? renderHealthStatusSection(student, 'student') :
          renderComplaintsSection(student)}
      </main>
    </div>

    <!-- Custom Modal for Meal Cancellation Reason -->
    <div id="meal-cancel-modal" class="modal-overlay">
      <div class="modal-container" style="max-width: 400px; padding: 25px;">
        <div class="modal-header">
          <h3 class="modal-title">Meal Cancellation</h3>
          <button type="button" id="btn-close-meal-modal" class="modal-close">&times;</button>
        </div>
        <form id="meal-cancel-form" style="display: flex; flex-direction: column; gap: 15px;">
          <input type="hidden" id="meal-cancel-date">
          <input type="hidden" id="meal-cancel-meal">
          
          <div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
              Please state the reason for cancelling <strong id="meal-cancel-name-text"></strong> on <strong id="meal-cancel-date-text"></strong>:
            </p>
            <textarea id="meal-cancel-reason" class="form-textarea" required placeholder="e.g. Dining outside / unwell / parent visiting..." style="width: 100%; height: 90px; resize: none; margin-top: 5px; box-sizing: border-box;"></textarea>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" id="btn-cancel-meal-cancel" class="btn-reject" style="padding: 8px 16px; margin: 0;">Cancel</button>
            <button type="submit" class="btn-approve" style="background: var(--danger); padding: 8px 16px; margin: 0;">Confirm Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderComplaintsSection(student) {
  const complaints = student.complaints || [];

  return `
    <div class="dashboard-grid">
      <!-- Report Complaint Form -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.complaint} File New Complaint</h2>
        </div>
        
        <form id="student-complaint-form" style="padding:15px 0; display:flex; flex-direction:column; gap:15px;">
          <div class="form-group">
            <label class="form-label" for="complaint-category">Category</label>
            <select id="complaint-category" class="form-input" required>
              <option value="Maintenance">Room Maintenance & Repair</option>
              <option value="Mess">Mess & Food Quality</option>
              <option value="Internet">Wi-Fi & Internet</option>
              <option value="Electricity">Water & Electricity</option>
              <option value="Housekeeping">Housekeeping & Cleaning</option>
              <option value="Security">Safety & Security</option>
              <option value="Others">Others</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="complaint-subject">Subject</label>
            <input type="text" id="complaint-subject" class="form-input" placeholder="e.g. Wi-Fi router not working" required>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="complaint-details">Complaint Description Details</label>
            <textarea id="complaint-details" class="form-textarea" placeholder="Describe the issue in detail..." required style="height:100px;"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Attach Images <span style="font-weight:400; color:var(--text-muted); font-size:11px;">(Optional — max 3 photos)</span></label>
            <div id="complaint-image-dropzone" class="complaint-image-dropzone" onclick="document.getElementById('complaint-image-input').click()">
              <input type="file" id="complaint-image-input" accept="image/*" multiple style="display:none;">
              <div class="dropzone-inner" id="dropzone-placeholder">
                <svg viewBox="0 0 24 24" width="36" height="36" stroke="var(--primary)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7;"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p style="margin:8px 0 2px; font-weight:600; color:var(--text-primary); font-size:13px;">Click to upload or drag photos here</p>
                <p style="margin:0; font-size:11px; color:var(--text-muted);">JPG, PNG, WEBP • Up to 3 images • 5MB each</p>
              </div>
              <div id="complaint-image-previews" class="complaint-image-previews" style="display:none;"></div>
            </div>
          </div>
          
          <button type="submit" class="btn-primary" style="margin-top:10px; font-weight:700;">Submit Complaint</button>
        </form>
      </div>

      <!-- Recent Complaints List -->
      <div class="dashboard-panel">
        <div class="panel-header" style="justify-content:space-between;">
          <h2 class="panel-title">${ICONS.alert} Submitted Complaints</h2>
          <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">${complaints.length} Total</span>
        </div>
        
        <div class="complaints-list" style="margin-top:15px; display:flex; flex-direction:column; gap:12px; max-height:450px; overflow-y:auto; padding-right:5px;">
          ${complaints.length === 0 ? `
            <div class="empty-state">
              ${ICONS.check}
              <p>No complaints reported. Everything is running smoothly!</p>
            </div>
          ` : [...complaints].reverse().map(c => `
            <div style="background:#fff; border:1px solid var(--border-color); border-radius:8px; padding:15px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <span class="badge" style="background:#f3f4f6; color:var(--text-primary); font-size:10px; font-weight:700; margin-bottom:4px; display:inline-block; text-transform:uppercase;">
                    ${c.category}
                  </span>
                  <h4 style="margin:2px 0; font-size:14px; font-weight:700; color:var(--text-primary);">${c.subject}</h4>
                  <span style="font-size:11px; color:var(--text-secondary);">${c.id} • Reported on ${formatDisplayDate(c.dateReported)}</span>
                </div>
                <span class="badge ${c.status.toLowerCase() === 'pending' ? 'pending' : 'approved'}" style="font-size:11px; padding:4px 8px;">
                  ${c.status}
                </span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); line-height:1.4; margin:0; font-style:italic;">"${c.details}"</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function attachStudentEvents() {
  const sidebar = document.getElementById('dashboard-sidebar');
  const mobileToggle = document.getElementById('mobile-toggle');

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-item').dataset.tab;
      state.studentActiveTab = tab;
      if (sidebar) sidebar.classList.remove('mobile-open');
      render();
    });
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.currentView = 'login';
      state.currentStudentId = null;
      render();
    });
  }

  // Meal action icon buttons (Book / Cancel)
  document.querySelectorAll('.meal-action-icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const button = e.target.closest('.meal-action-icon-btn');
      if (!button) return;
      
      const date = button.dataset.date;
      const meal = button.dataset.meal;
      const mealName = button.dataset.mealName;
      const action = button.dataset.action; // 'book' | 'cancel'
      
      const student = state.db.find(s => s.id === state.currentStudentId);
      if (!student) return;

      const booking = student.mealBookings.find(b => b.date === date) || {
        date,
        breakfast: false,
        lunch: false,
        snacks: false,
        dinner: false
      };

      if (action === 'cancel') {
        const modal = document.getElementById('meal-cancel-modal');
        if (modal) {
          document.getElementById('meal-cancel-date').value = date;
          document.getElementById('meal-cancel-meal').value = meal;
          document.getElementById('meal-cancel-name-text').innerText = mealName;
          document.getElementById('meal-cancel-date-text').innerText = formatDisplayDate(date);
          document.getElementById('meal-cancel-reason').value = '';
          modal.classList.add('active');
        }
      } else {
        booking[meal] = true;
        const res = updateMealBookings(student.id, date, {
          breakfast: booking.breakfast,
          lunch: booking.lunch,
          snacks: booking.snacks,
          dinner: booking.dinner
        });

        if (res && res.success) {
          state.db = res.students;
          showToast(`${mealName} meal booked!`, 'success');
          render();
        } else {
          showToast(res ? res.error : 'Failed to book meal', 'error');
        }
      }
    });
  });

  // Modal Close Events for Meal Cancellation
  const cancelModal = document.getElementById('meal-cancel-modal');
  const closeMealModalBtn = document.getElementById('btn-close-meal-modal');
  const cancelMealCancelBtn = document.getElementById('btn-cancel-meal-cancel');
  
  const closeCancelModal = () => {
    if (cancelModal) cancelModal.classList.remove('active');
  };

  if (closeMealModalBtn) closeMealModalBtn.addEventListener('click', closeCancelModal);
  if (cancelMealCancelBtn) cancelMealCancelBtn.addEventListener('click', closeCancelModal);

  const mealCancelForm = document.getElementById('meal-cancel-form');
  if (mealCancelForm) {
    mealCancelForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const date = document.getElementById('meal-cancel-date').value;
      const meal = document.getElementById('meal-cancel-meal').value;
      const reason = document.getElementById('meal-cancel-reason').value;
      
      const student = state.db.find(s => s.id === state.currentStudentId);
      if (!student) return;

      const booking = student.mealBookings.find(b => b.date === date) || {
        date,
        breakfast: false,
        lunch: false,
        snacks: false,
        dinner: false
      };

      booking[meal] = false; // Cancel

      const res = updateMealBookings(student.id, date, {
        breakfast: booking.breakfast,
        lunch: booking.lunch,
        snacks: booking.snacks,
        dinner: booking.dinner
      }, {
        meal,
        reason
      });

      if (res && res.success) {
        state.db = res.students;
        closeCancelModal();
        showToast(`${meal.charAt(0).toUpperCase() + meal.slice(1)} meal cancelled successfully!`, 'success');
        render();
      } else {
        showToast(res ? res.error : 'Failed to cancel meal', 'error');
      }
    });
  }

  attachLeaveFormEvents('student');

  if (state.studentActiveTab === 'health') attachHealthViewEvents();
  if (state.studentActiveTab === 'complaints') {
    const complaintForm = document.getElementById('student-complaint-form');
    if (complaintForm) {
      complaintForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('complaint-category').value;
        const subject = document.getElementById('complaint-subject').value;
        const details = document.getElementById('complaint-details').value;
        
        const res = reportComplaint(state.currentStudentId, category, subject, details);
        if (res) {
          state.db = res.students;
          showToast("Complaint submitted successfully!", "success");
          render();
        } else {
          showToast("Failed to file complaint.", "error");
        }
      });
    }

    // --- Image upload placeholder logic ---
    let selectedFiles = [];

    function renderImagePreviews() {
      const previewsEl = document.getElementById('complaint-image-previews');
      const placeholder = document.getElementById('dropzone-placeholder');
      if (!previewsEl || !placeholder) return;

      if (selectedFiles.length === 0) {
        previewsEl.style.display = 'none';
        placeholder.style.display = 'flex';
        return;
      }
      placeholder.style.display = 'none';
      previewsEl.style.display = 'flex';
      previewsEl.innerHTML = selectedFiles.map((file, i) => {
        const url = URL.createObjectURL(file);
        return `
          <div class="complaint-img-thumb" style="position:relative;">
            <img src="${url}" alt="Preview ${i+1}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; border:1.5px solid var(--border-color); display:block;">
            <button type="button" class="remove-img-btn" data-idx="${i}" title="Remove" style="position:absolute; top:-7px; right:-7px; background:#ef4444; color:#fff; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; font-size:13px; line-height:1; display:flex; align-items:center; justify-content:center; padding:0;">×</button>
          </div>
        `;
      }).join('') + (selectedFiles.length < 3 ? `
        <div class="add-more-thumb" onclick="document.getElementById('complaint-image-input').click()" title="Add more" style="width:80px; height:80px; border-radius:8px; border:2px dashed var(--border-color); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; color:var(--text-muted); font-size:11px; gap:4px;">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add more
        </div>` : '');

      // Attach remove handlers
      previewsEl.querySelectorAll('.remove-img-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx);
          selectedFiles.splice(idx, 1);
          renderImagePreviews();
        });
      });
    }

    const fileInput = document.getElementById('complaint-image-input');
    const dropzone = document.getElementById('complaint-image-dropzone');

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const newFiles = Array.from(fileInput.files);
        const remaining = 3 - selectedFiles.length;
        if (newFiles.length > remaining) {
          showToast(`You can attach up to 3 images. ${remaining} slot(s) remaining.`, 'warning');
        }
        selectedFiles = [...selectedFiles, ...newFiles.slice(0, remaining)];
        fileInput.value = '';
        renderImagePreviews();
      });
    }

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        const remaining = 3 - selectedFiles.length;
        if (droppedFiles.length > remaining) {
          showToast(`You can attach up to 3 images. ${remaining} slot(s) remaining.`, 'warning');
        }
        selectedFiles = [...selectedFiles, ...droppedFiles.slice(0, remaining)];
        renderImagePreviews();
      });
    }
  }
}

// View template: PARENT PORTAL
function renderParentDashboard() {
  const student = state.db.find(s => s.id === state.currentStudentId);
  if (!student) return `<div>Error: Student not found.</div>`;

  const todayStr = getDateString(0);
  const onLeaveToday = isStudentOnLeave(student, todayStr);

  return `
    <div class="dashboard-layout">
      <!-- Mobile Toggle -->
      <div style="position:fixed; top:15px; left:15px; z-index:999;">
        <button id="mobile-toggle" class="mobile-menu-toggle">
          ${ICONS.home}
        </button>
      </div>

      <!-- Sidebar -->
      <aside id="dashboard-sidebar" class="sidebar">
        <div class="sidebar-brand">
          ${ICONS.shield}
          <span>Hostel Parent</span>
        </div>
        
        <div class="sidebar-profile">
          <div class="profile-avatar">P</div>
          <div class="profile-info">
            <span class="profile-name">Parent of ${student.name.split(' ')[0]}</span>
            <span class="profile-role">Room ${student.room} • ${student.id}</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <button class="nav-item ${state.parentActiveTab === 'leave' ? 'active' : ''}" data-tab="leave">
            ${ICONS.calendar} Request Leave
          </button>
          <button class="nav-item ${state.parentActiveTab === 'meals' ? 'active' : ''}" data-tab="meals">
            ${ICONS.coffee} View Mess Menu
          </button>
          <button class="nav-item ${state.parentActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            ${ICONS.users} Attendance & History
          </button>
          <button class="nav-item ${state.parentActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            ${ICONS.shield} Child's Health Records
          </button>
        </nav>
        
        <div class="sidebar-footer">
          <button id="btn-logout" class="btn-logout">
            ${ICONS.logout} Logout
          </button>
        </div>
      </aside>

      <!-- Main Panel -->
      <main class="main-content">
        <header class="header-container">
          <div class="header-title-section">
            <h1>${state.parentActiveTab === 'leave' ? 'Student Leave Application' : state.parentActiveTab === 'meals' ? "Child's Dining Planner" : state.parentActiveTab === 'health' ? "Child's Health Records" : "Attendance & History"}</h1>
            <p>Parent Control Portal • Student: ${student.name} (${student.id})</p>
          </div>
          
          <div>
            ${onLeaveToday ? 
              `<span class="badge rejected" style="font-size:13px; padding: 8px 16px;">🏢 Currently On Leave</span>` : 
              `<span class="badge approved" style="font-size:13px; padding: 8px 16px;">🏠 Present in Hostel</span>`
            }
          </div>
        </header>

        ${state.parentActiveTab === 'leave' ? renderLeaveSection(student, 'parent') : 
          state.parentActiveTab === 'meals' ? renderMealsPlanner(student, true) :
          state.parentActiveTab === 'health' ? renderHealthStatusSection(student, 'parent') :
          renderParentAttendanceSection(student)}
      </main>
    </div>
  `;
}

function renderParentAttendanceSection(student) {
  const logs = [...(student.entryExitLogs || [])].reverse(); // newest first
  const lastLog = logs[0];
  const isCurrentlyIn = lastLog ? lastLog.type === 'entry' : true;

  // Today's logs
  const todayStr = getDateString(0);
  const todayLogs = logs.filter(l => l.timestamp.startsWith(todayStr));

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  function formatLogDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return `
    <div class="dashboard-grid">
      <!-- Entry/Exit Status (Read-only for parents) -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.shield} Hostel Gate — Movement Status</h2>
        </div>

        <div class="scan-status-banner ${isCurrentlyIn ? 'in-hostel' : 'out-hostel'}">
          <div class="scan-status-dot"></div>
          <div>
            <span class="scan-status-label">${isCurrentlyIn ? '🏠 Currently Inside Hostel' : '🚶 Currently Outside'}</span>
            ${lastLog ? `<span class="scan-status-time">Last scan: ${formatLogDate(lastLog.timestamp)} at ${formatTime(lastLog.timestamp)}</span>` : '<span class="scan-status-time">No movement recorded yet</span>'}
          </div>
        </div>

        <!-- ID Card Visual (display only) -->
        <div class="id-card-wrapper">
          <div class="id-card">
            <div class="id-card-top">
              <div class="id-card-avatar">${student.name.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <div class="id-card-name">${student.name}</div>
                <div class="id-card-detail">${student.id} • Room ${student.room}</div>
                <div class="id-card-detail">Block ${student.block} • ${student.bed || 'Bed A'}</div>
              </div>
            </div>
            <div class="id-card-barcode">
              <div class="barcode-lines"></div>
              <span style="font-size:10px; color:var(--text-muted); letter-spacing:3px;">${student.id}</span>
            </div>
          </div>
        </div>

        <!-- Today's summary -->
        <div style="margin-top:18px; background:#f9fafb; border-radius:8px; padding:14px; border:1px solid var(--border-color);">
          <p style="font-size:12px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:10px;">Today's Movements (${todayLogs.length} events)</p>
          ${todayLogs.length === 0 ? `<p style="font-size:13px; color:var(--text-muted); text-align:center; padding:10px 0;">No gate activity recorded today</p>` : todayLogs.map(l => `
            <div style="display:flex; align-items:center; gap:10px; padding:6px 0; border-bottom:1px solid var(--border-color);">
              <span class="entry-exit-dot ${l.type}"></span>
              <span style="font-size:13px; font-weight:600; color:${l.type === 'entry' ? '#047857' : '#b91c1c'}; min-width:44px;">${l.type === 'entry' ? 'IN' : 'OUT'}</span>
              <span style="font-size:13px; color:var(--text-primary);">${formatTime(l.timestamp)}</span>
              <span style="font-size:12px; color:var(--text-muted); flex:1; text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${l.note}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Full Entry/Exit History Timeline -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.calendar} Full Movement History</h2>
          <span style="font-size:12px; color:var(--text-secondary);">${logs.length} records</span>
        </div>

        <div class="exit-log-timeline" style="max-height:480px; overflow-y:auto; padding-right:5px;">
          ${logs.length === 0 ? `
            <div class="empty-state">
              ${ICONS.shield}
              <p>No entry/exit events recorded yet.</p>
            </div>
          ` : logs.map((l, idx) => {
            const isEntry = l.type === 'entry';
            const showDateHeader = idx === 0 || !logs[idx-1].timestamp.startsWith(l.timestamp.slice(0,10));
            return `
              ${showDateHeader ? `<div class="timeline-date-header">${formatLogDate(l.timestamp)}</div>` : ''}
              <div class="timeline-event ${isEntry ? 'entry' : 'exit'}">
                <div class="timeline-dot ${isEntry ? 'entry' : 'exit'}"></div>
                <div class="timeline-content">
                  <div class="timeline-type">${isEntry ? '↩ Entry' : '↪ Exit'}</div>
                  <div class="timeline-time">${formatTime(l.timestamp)}</div>
                  <div class="timeline-note">${l.note}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function attachParentEvents() {
  const sidebar = document.getElementById('dashboard-sidebar');
  const mobileToggle = document.getElementById('mobile-toggle');

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-item').dataset.tab;
      state.parentActiveTab = tab;
      if (sidebar) sidebar.classList.remove('mobile-open');
      render();
    });
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.currentView = 'login';
      state.currentStudentId = null;
      render();
    });
  }

  attachLeaveFormEvents('parent');
  if (state.parentActiveTab === 'health') attachHealthViewEvents();
}

// SHARED TEMPLATE: Meals planner (Disabled/Read-only for Parents)
function renderMealsPlanner(student, isReadOnly) {
  const menu = JSON.parse(localStorage.getItem('hostel_mess_menu')) || {
    breakfast: "Masala Dosa, Chutney, Sambhar & Coffee",
    lunch: "Jeera Rice, Dal Fry, Roti, Aloo Gobi & Buttermilk",
    snacks: "Veg Samosa, Green Chutney & Tea",
    dinner: "Veg Biryani, Raita, Paneer Butter Masala & Gulab Jamun"
  };

  let daysHTML = '';
  
  for (let offset = 0; offset < 7; offset++) {
    const dateStr = getDateString(offset);
    const displayDate = formatDisplayDate(dateStr);
    const onLeave = isStudentOnLeave(student, dateStr);
    
    let leaveStatusText = '';
    let isPending = false;
    
    const matchingLeave = student.leaves.find(leave => {
      if (leave.status === 'rejected') return false;
      const start = new Date(leave.startDate).getTime();
      const end = new Date(leave.endDate).getTime();
      const target = new Date(dateStr).getTime();
      return target >= start && target <= end;
    });

    if (matchingLeave) {
      isPending = matchingLeave.status === 'pending';
      const label = matchingLeave.type === 'outing' ? 'Going Out' : 'On Leave';
      leaveStatusText = isPending ? `${label} Pending` : label;
    }

    const booking = student.mealBookings.find(b => b.date === dateStr) || {
      breakfast: false,
      lunch: false,
      snacks: false,
      dinner: false
    };

    daysHTML += `
      <div class="meal-day-card ${onLeave ? 'on-leave' : ''}">
        <div class="meal-day-header">
          <div>
            <div class="meal-day-title">${offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : displayDate.split(',')[0]}</div>
            <div class="meal-day-date">${displayDate.split(',')[1]}</div>
          </div>
          ${onLeave ? (isPending ? `<span class="meal-pending-badge">${leaveStatusText}</span>` : `<span class="meal-leave-badge">${leaveStatusText}</span>`) : ''}
        </div>
        
        ${onLeave ? `
          <div class="meal-locked-msg">
            ${ICONS.lock}
            <h4>Meal Booking Locked</h4>
            <span>Meals are disabled because student has active/pending ${matchingLeave && matchingLeave.type === 'outing' ? 'outing' : 'leave'} on this date.</span>
          </div>
        ` : `
          <div class="meal-options-list">
            ${(() => {
              const makeMealRow = (mealName, mealKey, mealMenu, mealTime) => {
                const isBooked = booking[mealKey];
                return `
                  <div class="meal-option-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                    <div class="meal-label-info">
                      <span class="meal-name" style="font-weight: 700; color: var(--text-primary); display: block; font-size: 14px;">${mealName}</span>
                      <span style="font-size: 11px; color: var(--text-secondary); display: block; font-weight: 500; margin: 2px 0; max-width: 180px;">${mealMenu}</span>
                      <span class="meal-time" style="font-size: 11px; color: var(--text-muted); font-weight: 600;">${mealTime}</span>
                    </div>
                    <div class="meal-action-container" style="display: flex; align-items: center; gap: 8px;">
                      <span class="meal-status-symbol ${isBooked ? 'booked' : 'cancelled'}" title="${isBooked ? 'Booked' : 'Not Booked'}">
                        ${isBooked ? '✓' : '✗'}
                      </span>
                      ${!isReadOnly ? `
                        ${isBooked ? `
                          <button class="meal-action-icon-btn cancel-btn" 
                                  data-date="${dateStr}" 
                                  data-meal="${mealKey}" 
                                  data-meal-name="${mealName}"
                                  data-action="cancel"
                                  title="Cancel Meal">
                            ${ICONS.x}
                          </button>
                        ` : `
                          <button class="meal-action-icon-btn book-btn" 
                                  data-date="${dateStr}" 
                                  data-meal="${mealKey}" 
                                  data-meal-name="${mealName}"
                                  data-action="book"
                                  title="Book Meal">
                            ${ICONS.check}
                          </button>
                          <button class="meal-action-icon-btn cancel-btn" 
                                  data-date="${dateStr}" 
                                  data-meal="${mealKey}" 
                                  data-meal-name="${mealName}"
                                  data-action="cancel"
                                  title="Cancel Meal">
                            ${ICONS.x}
                          </button>
                        `}
                      ` : ''}
                    </div>
                  </div>
                `;
              };
              return [
                makeMealRow('Breakfast', 'breakfast', menu.breakfast, '07:30 AM - 09:00 AM'),
                makeMealRow('Lunch', 'lunch', menu.lunch, '12:30 PM - 02:00 PM'),
                makeMealRow('Snacks', 'snacks', menu.snacks, '04:30 PM - 05:30 PM'),
                makeMealRow('Dinner', 'dinner', menu.dinner, '07:30 PM - 09:00 PM')
              ].join('');
            })()}
          </div>
        `}
      </div>
    `;
  }

  return `
    <div class="dashboard-panel">
      <div class="panel-header">
        <h2 class="panel-title">${ICONS.coffee} 7-Day Dining Schedule</h2>
        <span style="font-size:12px; color:var(--text-secondary);">${isReadOnly ? "View Only Mode (Parents cannot toggle child's meals)" : 'Changes are saved automatically'}</span>
      </div>
      
      <div class="meal-planner-grid">
        ${daysHTML}
      </div>
    </div>
  `;
}

// SHARED TEMPLATE: Leave application section
function renderLeaveSection(student, role) {
  const sortedLeaves = [...student.leaves].sort((a,b) => new Date(b.startDate) - new Date(a.startDate));

  return `
    <div class="dashboard-grid">
      <!-- Apply Leave Panel -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.calendar} ${role === 'parent' ? 'Request Leave/Outing for Child' : 'Request Leave/Outing'}</h2>
        </div>
        
        <div class="leave-alert-banner">
          ${ICONS.alert}
          <div>
            <h4>Notice for Leave Food Cancellations</h4>
            <p>Applying leave or outing will automatically cancel and hide breakfast, lunch, snacks, and dinner options for the selected dates, helping prevent food wastage in the mess.</p>
          </div>
        </div>

        <form id="leave-request-form">
          <div class="form-grid">
            <div>
              <label class="form-label" for="leave-start-date">Start Date</label>
              <input type="date" id="leave-start-date" class="form-input" required min="${getDateString(0)}">
            </div>
            <div>
              <label class="form-label" for="leave-end-date">End Date</label>
              <input type="date" id="leave-end-date" class="form-input" required min="${getDateString(0)}">
            </div>
            <div class="form-group-full">
              <label class="form-label" for="leave-type">Request Type</label>
              <select id="leave-type" class="form-input" required>
                <option value="leave">On Leave (Hostel Exit)</option>
                <option value="outing">Going Out (Day Outing / Local Outing)</option>
              </select>
            </div>
            <div class="form-group-full">
              <label class="form-label" for="leave-reason">Reason</label>
              <textarea id="leave-reason" class="form-textarea" required placeholder="${role === 'parent' ? 'Describe the reason for your child\'s request...' : 'Describe the reason for your request...' }"></textarea>
            </div>
          </div>
          <button type="submit" class="btn-primary">${ICONS.plus} Submit Request</button>
        </form>
      </div>

      <!-- History of leaves -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">Request History</h2>
        </div>
        
        <div class="history-list">
          ${sortedLeaves.length === 0 ? `
            <div class="empty-state">
              ${ICONS.calendar}
              <p>No requests found</p>
            </div>
          ` : sortedLeaves.map(leave => `
            <div class="history-item">
              <div class="history-details">
                <span class="history-dates">${formatDisplayDate(leave.startDate)} to ${formatDisplayDate(leave.endDate)}</span>
                <span style="font-size:11px; font-weight:600; color:var(--primary); text-transform:uppercase; margin-bottom:4px; display:block;">
                  Type: ${leave.type === 'outing' ? 'Going Out' : 'On Leave'}
                </span>
                <span class="history-reason">"${leave.reason}"</span>
                <span style="font-size:11px; color:var(--text-secondary); display:block; margin-top:2px;">Submitted by: ${leave.submittedBy === 'parent' ? 'Parent' : 'Student'}</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
                <span class="badge ${leave.status}">
                  ${leave.status === 'pending' ? 'Pending Parent' : leave.status}
                </span>
                ${leave.status === 'pending' ? `
                  ${role === 'parent' && leave.submittedBy === 'student' ? `
                    <div style="display:inline-flex; gap:6px; margin-top:4px;">
                      <button class="table-btn btn-reject parent-reject-btn" style="padding:4px 8px; font-size:11px;" data-stu-id="${student.id}" data-leave-id="${leave.id}">Reject</button>
                      <button class="table-btn btn-approve parent-approve-btn" style="padding:4px 8px; font-size:11px; color:white;" data-stu-id="${student.id}" data-leave-id="${leave.id}">Approve</button>
                    </div>
                  ` : `
                    <button class="btn-cancel-leave" data-leave-id="${leave.id}">Cancel</button>
                  `}
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function attachLeaveFormEvents(role) {
  // Leave Submit
  const leaveForm = document.getElementById('leave-request-form');
  if (leaveForm) {
    leaveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const startDate = document.getElementById('leave-start-date').value;
      const endDate = document.getElementById('leave-end-date').value;
      const type = document.getElementById('leave-type').value;
      const reason = document.getElementById('leave-reason').value;

      if (new Date(startDate) > new Date(endDate)) {
        showToast('End Date cannot be before Start Date.', 'error');
        return;
      }

      const res = applyLeave(state.currentStudentId, startDate, endDate, reason, type, role);
      if (res) {
        state.db = res.students;
        showToast(`${type === 'outing' ? 'Outing' : 'Leave'} request submitted. Avoided wasting ${res.avoidedCount} meals!`, 'success');
        render();
      } else {
        showToast('Error applying for leave', 'error');
      }
    });
  }

  // Cancel Pending Leave
  document.querySelectorAll('.btn-cancel-leave').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const leaveId = e.target.dataset.leaveId;
      const updatedStudents = cancelLeave(state.currentStudentId, leaveId);
      if (updatedStudents) {
        state.db = updatedStudents;
        showToast('Request cancelled', 'info');
        render();
      }
    });
  });

  // Parent Approve Button
  document.querySelectorAll('.parent-approve-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.target.dataset.stuId;
      const leaveId = e.target.dataset.leaveId;
      const updated = approveLeave(studentId, leaveId);
      if (updated) {
        state.db = updated;
        showToast("Child's request approved and meals locked.", 'success');
        render();
      }
    });
  });

  // Parent Reject Button
  document.querySelectorAll('.parent-reject-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.target.dataset.stuId;
      const leaveId = e.target.dataset.leaveId;
      const updated = rejectLeave(studentId, leaveId);
      if (updated) {
        state.db = updated;
        showToast("Child's request rejected.", 'info');
        render();
      }
    });
  });
}

function renderHealthStatusSection(student, role) {
  const isStudent = role === 'student';
  const records = student.healthRecords || [];
  const sortedRecords = [...records].reverse();

  return `
    <div class="dashboard-grid">
      ${isStudent ? `
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.shield} Report Health Status</h2>
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
      ` : ''}

      <div class="dashboard-panel ${!isStudent ? 'dashboard-full' : ''}">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.settings} Health & Medical History</h2>
          <span style="font-size:12px; color:var(--text-secondary);">${records.length} records</span>
        </div>
        <div style="margin-top:15px; display:flex; flex-direction:column; gap:12px; max-height:500px; overflow-y:auto;">
          ${sortedRecords.length === 0 ? `
            <div class="empty-state">
              ${ICONS.shield}
              <p>No health issues reported. Student is healthy!</p>
            </div>
          ` : sortedRecords.map(r => `
            <div style="background:#f9fafb; border:1px solid var(--border-color); border-radius:8px; padding:15px; position:relative;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div>
                  <strong style="color:var(--text-primary); font-size:14px;">${r.symptoms}</strong>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${r.date} at ${r.time}</div>
                </div>
                <span class="badge ${r.status === 'Recovered' ? 'approved' : r.status === 'Needs Medical Attention' ? 'rejected' : 'pending'}">${r.status}</span>
              </div>
              <div style="display:flex; gap:15px; font-size:13px; color:var(--text-secondary); margin-bottom:8px;">
                <span><strong>Temp:</strong> ${r.temperature || 'Not recorded'}</span>
              </div>
              ${r.note ? `<div style="background:#f3f4f6; padding:10px; border-radius:6px; font-size:13px; color:var(--text-primary); border-left:3px solid var(--primary);">${r.note}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderWardenHealthView() {
  const defaultStudent = state.db[0];
  const selectedStudentId = state.viewHealthStudentId || (defaultStudent ? defaultStudent.id : null);
  const student = state.db.find(s => s.id === selectedStudentId) || defaultStudent;
  if (!student) return '<div class="dashboard-panel"><p>No students found.</p></div>';
  
  const options = state.db.map(s => `<option value="${s.id}" ${s.id === student.id ? 'selected' : ''}>${s.id} - ${s.name}</option>`).join('');

  return `
    <div class="dashboard-panel dashboard-full" style="margin-bottom: 20px;">
      <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
        <h2 class="panel-title">${ICONS.shield} Health & Medical Logs</h2>
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">Select Student:</label>
          <select id="health-student-select" class="filter-select" style="min-width: 250px;">
            ${options}
          </select>
        </div>
      </div>
    </div>
    
    ${renderHealthStatusSection(student, 'admin')}
  `;
}

function attachHealthViewEvents() {
  const selectEl = document.getElementById('health-student-select');
  if (selectEl) {
    selectEl.addEventListener('change', (e) => {
      state.viewHealthStudentId = e.target.value;
      render();
    });
  }

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

function renderWardenAttendanceView() {
  const defaultStudent = state.db[0];
  const selectedStudentId = state.viewAttendanceStudentId || (defaultStudent ? defaultStudent.id : null);
  const student = state.db.find(s => s.id === selectedStudentId) || defaultStudent;
  if (!student) return '<div class="dashboard-panel"><p>No students found.</p></div>';

  const options = state.db.map(s => `<option value="${s.id}" ${s.id === student.id ? 'selected' : ''}>${s.id} - ${s.name}</option>`).join('');

  return `
    <div class="dashboard-panel dashboard-full" style="margin-bottom: 20px;">
      <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
        <h2 class="panel-title">${ICONS.users} Gate & Movement Attendance</h2>
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">Select Student:</label>
          <select id="attendance-student-select" class="filter-select" style="min-width: 250px;">
            ${options}
          </select>
        </div>
      </div>
    </div>
    
    ${renderParentAttendanceSection(student)}
  `;
}

function attachAttendanceViewEvents() {
  const selectEl = document.getElementById('attendance-student-select');
  if (selectEl) {
    selectEl.addEventListener('change', (e) => {
      state.viewAttendanceStudentId = e.target.value;
      render();
    });
  }
}

// View template: WARDEN DASHBOARD
function renderWardenDashboard() {
  const stats = getWardenDashboardStats(state.db);

  return `
    <div class="dashboard-layout">
      <!-- Mobile Toggle -->
      <div style="position:fixed; top:15px; left:15px; z-index:999;">
        <button id="mobile-toggle" class="mobile-menu-toggle">
          ${ICONS.home}
        </button>
      </div>

      <!-- Sidebar -->
      <aside id="dashboard-sidebar" class="sidebar">
        <div class="sidebar-brand">
          ${ICONS.shield}
          <span>Hostel Warden</span>
        </div>
        
        <div class="sidebar-profile">
          <div class="profile-avatar">W</div>
          <div class="profile-info">
            <span class="profile-name">Chief Warden Console</span>
            <span class="profile-role">Transcend Campus</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <button class="nav-item ${state.wardenActiveTab === 'overview' ? 'active' : ''}" data-tab="overview">
            ${ICONS.home} General Overview
          </button>
          <button class="nav-item ${state.wardenActiveTab === 'leaves' ? 'active' : ''}" data-tab="leaves">
            ${ICONS.calendar} Student Absence Logs
          </button>
          <button class="nav-item ${state.wardenActiveTab === 'directory' ? 'active' : ''}" data-tab="directory">
            ${ICONS.users} Student Directory
          </button>
          <button class="nav-item ${state.wardenActiveTab === 'beds' ? 'active' : ''}" data-tab="beds">
            ${ICONS.key} Bed Assignments
          </button>
          <button class="nav-item ${state.wardenActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            ${ICONS.users} Gate &amp; Attendance
          </button>
          <button class="nav-item ${state.wardenActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            ${ICONS.shield} Health Logs
          </button>
        </nav>
        
        <div class="sidebar-footer">
          <button id="btn-logout" class="btn-logout">
            ${ICONS.logout} Logout
          </button>
        </div>
      </aside>

      <!-- Main Panel -->
      <main class="main-content">
        <header class="header-container">
          <div class="header-title-section">
            <h1>${state.wardenActiveTab === 'overview' ? 'Dashboard Overview' : state.wardenActiveTab === 'leaves' ? 'Student Absence Registry' : state.wardenActiveTab === 'beds' ? 'Room & Bed Assignments' : 'Student Directory'}</h1>
            <p>Admin Control Panel • 5 Student Capacity</p>
          </div>
          
          <div style="display:flex; gap:10px;">
            ${state.wardenActiveTab === 'directory' ? `<button class="btn-primary" id="btn-add-student-modal">${ICONS.plus} Add Student</button>` : ''}
          </div>
        </header>

        <!-- Stats row (General statistics) -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">${ICONS.users}</div>
            <div class="stat-details">
              <span class="stat-label">Total Students</span>
              <span class="stat-value">${stats.totalStudents}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">${ICONS.home}</div>
            <div class="stat-details">
              <span class="stat-label">Active In Hostel</span>
              <span class="stat-value">${stats.inHostel}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon danger">${ICONS.calendar}</div>
            <div class="stat-details">
              <span class="stat-label">Active On Leave Today</span>
              <span class="stat-value">${stats.onLeaveToday}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">${ICONS.waste}</div>
            <div class="stat-details">
              <span class="stat-label">Wastage Avoided</span>
              <span class="stat-value">${stats.avoidedMeals} plates</span>
            </div>
          </div>
        </div>

        ${state.wardenActiveTab === 'overview' ? renderWardenOverview(stats) : 
          state.wardenActiveTab === 'leaves' ? renderWardenLeaves() : 
          state.wardenActiveTab === 'beds' ? renderBedAssignments() :
          state.wardenActiveTab === 'attendance' ? renderWardenAttendanceView() :
          state.wardenActiveTab === 'health' ? renderWardenHealthView() :
          renderWardenDirectory()}
      </main>

      <!-- Student Detail Modal -->
      <div id="student-detail-modal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-student-name">Student Details</h3>
            <button class="modal-close" id="btn-close-detail-modal">${ICONS.x}</button>
          </div>
          <div id="modal-student-content" style="display:flex; flex-direction:column; gap:15px;">
            <!-- filled dynamically -->
          </div>
        </div>
      </div>

      <!-- Add Student Modal -->
      <div id="add-student-modal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">Register New Student</h3>
            <button class="modal-close" id="btn-close-add-modal">${ICONS.x}</button>
          </div>
          <form id="add-student-form">
            <div class="form-grid">
              <div class="form-group-full">
                <label class="form-label" for="new-student-name">Full Name</label>
                <input type="text" id="new-student-name" class="form-input" required placeholder="John Doe">
              </div>
              <div>
                <label class="form-label" for="new-student-block">Block</label>
                <select id="new-student-block" class="form-input" required>
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                  <option value="D">Block D</option>
                </select>
              </div>
              <div>
                <label class="form-label" for="new-student-room">Room Number</label>
                <input type="text" id="new-student-room" class="form-input" required placeholder="A-102">
              </div>
              <div class="form-group-full">
                <label class="form-label" for="new-student-email">Email Address</label>
                <input type="email" id="new-student-email" class="form-input" required placeholder="john.doe@hostel.edu">
              </div>
              <div class="form-group-full">
                <label class="form-label" for="new-student-phone">Contact Number</label>
                <input type="text" id="new-student-phone" class="form-input" required placeholder="+91 9876543210">
              </div>
            </div>
            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
              <button type="button" class="btn-secondary" id="btn-cancel-add-student">Cancel</button>
              <button type="submit" class="btn-primary">Register Student</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function renderWardenOverview(stats) {
  // Grab pending leaves
  const pendingLeaves = [];
  state.db.forEach(student => {
    student.leaves.forEach(leave => {
      if (leave.status === 'pending') {
        pendingLeaves.push({
          studentId: student.id,
          studentName: student.name,
          studentRoom: student.room,
          ...leave
        });
      }
    });
  });

  return `
    <div class="dashboard-grid">
      <!-- Meal Bookings chart -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.coffee} Mess Dining Count (Today vs Tomorrow)</h2>
        </div>
        
        <div class="chart-container">
          <canvas id="meal-chart"></canvas>
        </div>
      </div>

      <!-- Quick Leave Registry (Awaiting Parent Approval) -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.calendar} Pending Parent Approvals</h2>
        </div>
        
        <div class="approval-list">
          ${pendingLeaves.length === 0 ? `
            <div class="empty-state">
              ${ICONS.check}
              <p>All student leave requests approved/processed by parents!</p>
            </div>
          ` : pendingLeaves.slice(0, 3).map(req => `
            <div class="approval-item">
              <div class="approval-header">
                <div class="approval-student">
                  <span class="approval-name">${req.studentName}</span>
                  <span class="approval-room">Room ${req.studentRoom} • ${req.studentId}</span>
                  <span style="font-size:11px; font-weight:600; color:var(--primary); text-transform:uppercase; margin-top:2px;">
                    ${req.type === 'outing' ? 'Going Out' : 'On Leave'}
                  </span>
                </div>
                <span class="approval-dates">${formatDisplayDate(req.startDate)} - ${formatDisplayDate(req.endDate)}</span>
              </div>
              <p class="approval-reason">"${req.reason}"</p>
              <div class="approval-actions" style="justify-content:space-between; align-items:center;">
                <span style="font-size:11px; color:var(--text-secondary);">Submitted by: student</span>
                <span class="badge pending" style="font-size:10px; padding:4px 8px;">Awaiting Parent</span>
              </div>
            </div>
          `).join('')}
          ${pendingLeaves.length > 3 ? `
            <button class="btn-secondary" style="width:100%; padding:10px;" id="btn-go-to-leaves">View All Requests (${pendingLeaves.length})</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderWardenLeaves() {
  const leaves = [];
  state.db.forEach(student => {
    student.leaves.forEach(leave => {
      leaves.push({
        studentId: student.id,
        studentName: student.name,
        studentRoom: student.room,
        ...leave
      });
    });
  });

  leaves.sort((a,b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.startDate) - new Date(a.startDate);
  });

  return `
    <div class="dashboard-panel dashboard-full">
      <div class="panel-header">
        <h2 class="panel-title">${ICONS.calendar} Leave Requests Register</h2>
        <span style="font-size:12px; color:var(--text-secondary);">${leaves.length} total leaves in logs</span>
      </div>

      <div class="directory-table-wrapper">
        <table class="directory-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Room</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Status</th>
              <th style="text-align:right;">Submitter</th>
            </tr>
          </thead>
          <tbody>
            ${leaves.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align:center; padding:30px; color:var(--text-secondary);">No leave logs found</td>
              </tr>
            ` : leaves.map(l => `
              <tr>
                <td><strong>${l.studentName}</strong><br><span style="font-size:11px; color:var(--text-muted);">${l.studentId}</span></td>
                <td>Room ${l.studentRoom}</td>
                <td>
                  <span style="font-size:12px; font-weight:600; color:var(--primary);">${formatDisplayDate(l.startDate)} - ${formatDisplayDate(l.endDate)}</span><br>
                  <span style="font-size:10px; font-weight:600; text-transform:uppercase; color:var(--text-secondary);">${l.type === 'outing' ? 'Going Out' : 'On Leave'}</span>
                </td>
                <td style="max-width:250px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${l.reason}">"${l.reason}"</td>
                <td><span class="badge ${l.status}">${l.status === 'pending' ? 'Pending Parent' : l.status}</span></td>
                <td style="text-align:right; text-transform:capitalize; font-size:13px; font-weight:500;">
                  ${l.submittedBy || 'student'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderWardenDirectory() {
  let filtered = state.db.filter(student => {
    const term = state.directorySearch.toLowerCase();
    const matchesSearch = student.id.toLowerCase().includes(term) || 
                          student.name.toLowerCase().includes(term) || 
                          student.room.toLowerCase().includes(term);
                          
    const matchesBlock = state.directoryBlockFilter === 'all' || student.block === state.directoryBlockFilter;
    
    let matchesStatus = true;
    if (state.directoryStatusFilter !== 'all') {
      const onLeave = isStudentOnLeave(student, getDateString(0));
      matchesStatus = state.directoryStatusFilter === 'leave' ? onLeave : !onLeave;
    }
    
    return matchesSearch && matchesBlock && matchesStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / state.directoryPageSize) || 1;
  if (state.directoryPage > totalPages) state.directoryPage = totalPages;
  
  const startIndex = (state.directoryPage - 1) * state.directoryPageSize;
  const paginated = filtered.slice(startIndex, startIndex + state.directoryPageSize);

  return `
    <div class="dashboard-panel dashboard-full">
      <div class="panel-header">
        <h2 class="panel-title">${ICONS.users} Hostel Residents Directory</h2>
      </div>

      <div class="filter-row">
        <div class="search-input-wrapper">
          ${ICONS.search}
          <input type="text" id="dir-search" class="search-input" placeholder="Search by name, ID, room..." value="${state.directorySearch}">
        </div>
        
        <div class="filter-actions">
          <select id="dir-block-filter" class="filter-select">
            <option value="all" ${state.directoryBlockFilter === 'all' ? 'selected' : ''}>All Blocks</option>
            <option value="A" ${state.directoryBlockFilter === 'A' ? 'selected' : ''}>Block A</option>
            <option value="B" ${state.directoryBlockFilter === 'B' ? 'selected' : ''}>Block B</option>
            <option value="C" ${state.directoryBlockFilter === 'C' ? 'selected' : ''}>Block C</option>
            <option value="D" ${state.directoryBlockFilter === 'D' ? 'selected' : ''}>Block D</option>
          </select>
          
          <select id="dir-status-filter" class="filter-select">
            <option value="all" ${state.directoryStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="active" ${state.directoryStatusFilter === 'active' ? 'selected' : ''}>In Hostel</option>
            <option value="leave" ${state.directoryStatusFilter === 'leave' ? 'selected' : ''}>On Leave</option>
          </select>
        </div>
      </div>

      <div class="directory-table-wrapper">
        <table class="directory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Room</th>
              <th>Block</th>
              <th>Status</th>
              <th>Contact Info</th>
              <th style="text-align:right;">Profile Log</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align:center; padding:30px; color:var(--text-secondary);">No students match the criteria</td>
              </tr>
            ` : paginated.map(s => {
              const onLeave = isStudentOnLeave(s, getDateString(0));
              return `
                <tr>
                  <td><strong>${s.id}</strong></td>
                  <td>${s.name}</td>
                  <td>${s.room}</td>
                  <td><span class="student-block-badge">Block ${s.block}</span></td>
                  <td>
                    <span class="student-status-badge">
                      <span class="status-dot ${onLeave ? 'leave' : 'active'}"></span>
                      ${onLeave ? 'On Leave' : 'In Hostel'}
                    </span>
                  </td>
                  <td style="font-size:12px; color:var(--text-secondary);">${s.email}<br>${s.phone}</td>
                  <td style="text-align:right;">
                    <button class="table-btn btn-view-health" data-stu-id="${s.id}" style="background:#fee2e2; color:#991b1b; border-color:#fecaca; margin-right:4px;">Med</button>
                    <button class="table-btn btn-view-attendance" data-stu-id="${s.id}" style="background:#e0e7ff; color:#4338ca; border-color:#c7d2fe; margin-right:4px;">Gate</button>
                    <button class="table-btn btn-view-student" data-stu-id="${s.id}">Log</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="pagination-container">
        <div class="pagination-info">
          Showing ${totalItems === 0 ? 0 : startIndex + 1} to ${Math.min(startIndex + state.directoryPageSize, totalItems)} of ${totalItems} students
        </div>
        
        <div class="pagination-buttons">
          <button class="table-btn" id="btn-page-prev" ${state.directoryPage === 1 ? 'disabled' : ''}>Prev</button>
          <button class="table-btn" id="btn-page-next" ${state.directoryPage === totalPages ? 'disabled' : ''}>Next</button>
        </div>
      </div>
    </div>
  `;
}

function renderBedAssignments() {
  const rooms = getBedAssignments(state.db);

  // Separate by sharing type
  const doubleRooms = rooms.filter(r => r.sharing === 2);
  const tripleRooms = rooms.filter(r => r.sharing === 3);

  function roomCard(r) {
    const maxBeds = r.sharing;
    const bedLabels = maxBeds === 3 ? ['Bed A', 'Bed B', 'Bed C'] : ['Bed A', 'Bed B'];
    const occupantMap = {};
    r.occupants.forEach(o => { occupantMap[o.bed] = o; });

    const bedsHTML = bedLabels.map(label => {
      const occ = occupantMap[label];
      return `
        <div class="bed-slot ${occ ? 'occupied' : 'vacant'}">
          <div class="bed-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 9h20"/><path d="M2 9v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9"/></svg>
          </div>
          <div class="bed-info">
            <span class="bed-label">${label}</span>
            ${occ ? `
              <span class="bed-occupant-name">${occ.name}</span>
              <span class="bed-occupant-id">${occ.id}</span>
            ` : `
              <span class="bed-vacant">Vacant</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="room-card">
        <div class="room-card-header">
          <div>
            <span class="room-number">Room ${r.room}</span>
            <span class="room-block-badge">Block ${r.block}</span>
          </div>
          <span class="room-sharing-badge ${maxBeds === 2 ? 'two-sharing' : 'three-sharing'}">
            ${maxBeds}-Sharing
          </span>
        </div>
        <div class="bed-slots">
          ${bedsHTML}
        </div>
        <div class="room-occupancy-bar">
          <div class="room-occupancy-fill" style="width:${Math.round((r.occupants.length / maxBeds) * 100)}%"></div>
        </div>
        <span class="room-occupancy-label">${r.occupants.length}/${maxBeds} Occupied</span>
      </div>
    `;
  }

  return `
    <div class="dashboard-panel dashboard-full">
      <div class="panel-header" style="flex-wrap:wrap; gap:12px;">
        <h2 class="panel-title">${ICONS.key} Room & Bed Assignment Matrix</h2>
        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <span style="font-size:12px; color:var(--text-secondary);">${rooms.length} Rooms • ${state.db.length} Students</span>
          <span class="room-sharing-badge two-sharing" style="font-size:11px;">2-Sharing: ${doubleRooms.length} rooms</span>
          <span class="room-sharing-badge three-sharing" style="font-size:11px;">3-Sharing: ${tripleRooms.length} rooms</span>
        </div>
      </div>

      ${tripleRooms.length > 0 ? `
        <div style="margin-bottom:28px;">
          <h3 style="font-size:14px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <span style="width:10px; height:10px; border-radius:50%; background:#8b5cf6; display:inline-block;"></span>
            Three-Sharing Rooms
          </h3>
          <div class="rooms-grid">
            ${tripleRooms.map(r => roomCard(r)).join('')}
          </div>
        </div>
      ` : ''}

      ${doubleRooms.length > 0 ? `
        <div>
          <h3 style="font-size:14px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <span style="width:10px; height:10px; border-radius:50%; background:var(--primary); display:inline-block;"></span>
            Two-Sharing Rooms
          </h3>
          <div class="rooms-grid">
            ${doubleRooms.map(r => roomCard(r)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function attachWardenEvents() {
  const sidebar = document.getElementById('dashboard-sidebar');
  const mobileToggle = document.getElementById('mobile-toggle');
  
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-item').dataset.tab;
      state.wardenActiveTab = tab;
      if (sidebar) sidebar.classList.remove('mobile-open');
      render();
    });
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.currentView = 'login';
      state.currentStudentId = null;
      render();
    });
  }

  const goToLeavesBtn = document.getElementById('btn-go-to-leaves');
  if (goToLeavesBtn) {
    goToLeavesBtn.addEventListener('click', () => {
      state.wardenActiveTab = 'leaves';
      render();
    });
  }

  const dirSearchInput = document.getElementById('dir-search');
  if (dirSearchInput) {
    dirSearchInput.addEventListener('input', (e) => {
      state.directorySearch = e.target.value;
      state.directoryPage = 1;
      render();
      const input = document.getElementById('dir-search');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  const blockFilter = document.getElementById('dir-block-filter');
  if (blockFilter) {
    blockFilter.addEventListener('change', (e) => {
      state.directoryBlockFilter = e.target.value;
      state.directoryPage = 1;
      render();
    });
  }

  const statusFilter = document.getElementById('dir-status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      state.directoryStatusFilter = e.target.value;
      state.directoryPage = 1;
      render();
    });
  }

  const prevBtn = document.getElementById('btn-page-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.directoryPage > 1) {
        state.directoryPage--;
        render();
      }
    });
  }

  const nextBtn = document.getElementById('btn-page-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      state.directoryPage++;
      render();
    });
  }

  const addStudentModalBtn = document.getElementById('btn-add-student-modal');
  const addStudentModal = document.getElementById('add-student-modal');
  const closeAddModalBtn = document.getElementById('btn-close-add-modal');
  const cancelAddBtn = document.getElementById('btn-cancel-add-student');
  const addForm = document.getElementById('add-student-form');

  if (addStudentModalBtn && addStudentModal) {
    addStudentModalBtn.addEventListener('click', () => {
      addStudentModal.classList.add('active');
    });
  }

  const closeAddModal = () => {
    if (addStudentModal) addStudentModal.classList.remove('active');
    if (addForm) addForm.reset();
  };

  if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddModal);
  if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddModal);

  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('new-student-name').value;
      const block = document.getElementById('new-student-block').value;
      const room = document.getElementById('new-student-room').value;
      const email = document.getElementById('new-student-email').value;
      const phone = document.getElementById('new-student-phone').value;

      const newId = `STU${String(state.db.length + 1).padStart(3, '0')}`;
      
      const newStudent = {
        id: newId,
        name,
        room,
        block,
        email,
        phone,
        leaves: [],
        mealBookings: []
      };

      state.db.push(newStudent);
      saveDB(state.db);
      
      showToast(`Registered student ${name} under ID ${newId}!`, 'success');
      closeAddModal();
      render();
    });
  }

  document.querySelectorAll('.btn-view-health').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.target.dataset.stuId;
        state.viewHealthStudentId = studentId;
        if (state.currentView === 'warden') state.wardenActiveTab = 'health';
        if (state.currentView === 'admin') state.adminActiveTab = 'health';
        if (state.currentView === 'superadmin') state.superActiveTab = 'health';
        render();
      });
    });

    document.querySelectorAll('.btn-view-attendance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.target.dataset.stuId;
        state.viewAttendanceStudentId = studentId;
        if (state.currentView === 'warden') state.wardenActiveTab = 'attendance';
        if (state.currentView === 'admin') state.adminActiveTab = 'attendance';
        if (state.currentView === 'superadmin') state.superActiveTab = 'attendance';
        render();
      });
    });

    document.querySelectorAll('.btn-view-student').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.target.dataset.stuId;
      const student = state.db.find(s => s.id === studentId);
      if (!student) return;

      const detailModal = document.getElementById('student-detail-modal');
      const modalName = document.getElementById('modal-student-name');
      const modalContent = document.getElementById('modal-student-content');

      if (detailModal && modalName && modalContent) {
        modalName.innerText = `Student Profile: ${student.name}`;
        
        const activeTodayOnLeave = isStudentOnLeave(student, getDateString(0));
        
        const leavesHTML = student.leaves.length === 0 
          ? '<p style="font-size:13px; color:var(--text-muted);">No leave requests registered.</p>'
          : student.leaves.map(l => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-input); padding:8px 12px; border-radius:4px; font-size:13px;">
                <span>
                  <strong>${formatDisplayDate(l.startDate)} - ${formatDisplayDate(l.endDate)}</strong><br>
                  <span style="font-size:10px; font-weight:600; color:var(--primary); text-transform:uppercase; display:block; margin:2px 0;">Type: ${l.type === 'outing' ? 'Going Out' : 'On Leave'}</span>
                  <span style="font-size:11px; color:var(--text-secondary);">"${l.reason}"</span>
                </span>
                <span class="badge ${l.status}" style="font-size:10px; padding:3px 8px;">${l.status}</span>
              </div>
            `).join('');

        const mealsHTML = student.mealBookings.length === 0
          ? '<p style="font-size:13px; color:var(--text-muted);">No meals booked for the upcoming week.</p>'
          : student.mealBookings.map(b => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-input); padding:8px 12px; border-radius:4px; font-size:13px; margin-bottom:6px;">
                <span><strong>${formatDisplayDate(b.date)}</strong></span>
                <span style="font-size:11px; color:var(--primary);">
                  ${[
                    b.breakfast ? 'Breakfast' : '',
                    b.lunch ? 'Lunch' : '',
                    b.snacks ? 'Snacks' : '',
                    b.dinner ? 'Dinner' : ''
                  ].filter(Boolean).join(', ') || 'No Meals Selected'}
                </span>
              </div>
            `).join('');

        modalContent.innerHTML = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; border-bottom:1px solid var(--border-color); padding-bottom:15px;">
            <div>
              <span style="font-size:12px; color:var(--text-muted);">Roll Number</span><br>
              <strong>${student.id}</strong>
            </div>
            <div>
              <span style="font-size:12px; color:var(--text-muted);">Room & Block</span><br>
              <strong>Room ${student.room} (Block ${student.block})</strong>
            </div>
            <div>
              <span style="font-size:12px; color:var(--text-muted);">Email</span><br>
              <span style="font-size:13px;">${student.email}</span>
            </div>
            <div>
              <span style="font-size:12px; color:var(--text-muted);">Phone</span><br>
              <span style="font-size:13px;">${student.phone}</span>
            </div>
            <div style="grid-column:span 2; margin-top:5px;">
              <span style="font-size:12px; color:var(--text-muted);">Mess Status Today</span><br>
              ${activeTodayOnLeave 
                ? '<span class="badge rejected" style="font-size:11px; padding:4px 10px; margin-top:4px;">On Leave - Mess Closed</span>' 
                : '<span class="badge approved" style="font-size:11px; padding:4px 10px; margin-top:4px;">Present - Mess Active</span>'}
            </div>
          </div>
          
          <div style="max-height: 150px; overflow-y: auto;">
            <h4 style="font-size:14px; margin-bottom:8px;">Leaves History</h4>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${leavesHTML}
            </div>
          </div>

          <div style="max-height: 150px; overflow-y: auto;">
            <h4 style="font-size:14px; margin-bottom:8px;">Meal Bookings Log</h4>
            <div>
              ${mealsHTML}
            </div>
          </div>
        `;

        detailModal.classList.add('active');
      }
    });
  });

  if (state.wardenActiveTab === 'health') attachHealthViewEvents();
  if (state.wardenActiveTab === 'attendance') attachAttendanceViewEvents();
  const detailModalClose = document.getElementById('btn-close-detail-modal');
  if (detailModalClose) {
    detailModalClose.addEventListener('click', () => {
      const detailModal = document.getElementById('student-detail-modal');
      if (detailModal) detailModal.classList.remove('active');
    });
  }

  if (state.wardenActiveTab === 'health') attachHealthViewEvents();
  if (state.wardenActiveTab === 'attendance') attachAttendanceViewEvents();

  // btn-view-health from directory
  document.querySelectorAll('.btn-view-health').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.target.closest('.btn-view-health').dataset.stuId;
      state.viewHealthStudentId = studentId;
      if (state.currentView === 'warden') state.wardenActiveTab = 'health';
      if (state.currentView === 'admin') state.adminActiveTab = 'health';
      if (state.currentView === 'superadmin') state.superActiveTab = 'health';
      render();
    });
  });

  // btn-view-attendance from directory
  document.querySelectorAll('.btn-view-attendance').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.target.closest('.btn-view-attendance').dataset.stuId;
      state.viewAttendanceStudentId = studentId;
      if (state.currentView === 'warden') state.wardenActiveTab = 'attendance';
      if (state.currentView === 'admin') state.adminActiveTab = 'attendance';
      if (state.currentView === 'superadmin') state.superActiveTab = 'attendance';
      render();
    });
  });
}

// Chart.js render function
function renderWardenChart() {
  const ctx = document.getElementById('meal-chart');
  if (!ctx) return;

  const todayStr = getDateString(0);
  const tomorrowStr = getDateString(1);

  const todayMeals = getAnalyticsForDate(state.db, todayStr);
  const tomorrowMeals = getAnalyticsForDate(state.db, tomorrowStr);

  if (mealChartInstance) {
    mealChartInstance.destroy();
  }

  const gridColor = 'rgba(0, 0, 0, 0.05)';
  const labelColor = '#4b5563';

  mealChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
      datasets: [
        {
          label: 'Today',
          data: [todayMeals.breakfast, todayMeals.lunch, todayMeals.snacks, todayMeals.dinner],
          backgroundColor: 'rgba(79, 70, 229, 0.85)',
          borderColor: '#4f46e5',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Tomorrow',
          data: [tomorrowMeals.breakfast, tomorrowMeals.lunch, tomorrowMeals.snacks, tomorrowMeals.dinner],
          backgroundColor: 'rgba(124, 58, 237, 0.85)',
          borderColor: '#7c3aed',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor
          },
          ticks: {
            color: labelColor,
            font: {
              family: 'Outfit',
              size: 12
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: labelColor,
            font: {
              family: 'Outfit',
              size: 12,
              weight: 'bold'
            }
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: labelColor,
            font: {
              family: 'Outfit',
              size: 13
            }
          }
        },
        tooltip: {
          bodyFont: {
            family: 'Outfit'
          },
          titleFont: {
            family: 'Outfit'
          }
        }
      }
    }
  });
}

// View template: ADMIN DASHBOARD
function renderAdminDashboard() {
  const menu = JSON.parse(localStorage.getItem('hostel_mess_menu')) || {
    breakfast: "Masala Dosa, Chutney, Sambhar & Coffee",
    lunch: "Jeera Rice, Dal Fry, Roti, Aloo Gobi & Buttermilk",
    snacks: "Veg Samosa, Green Chutney & Tea",
    dinner: "Veg Biryani, Raita, Paneer Butter Masala & Gulab Jamun"
  };

  return `
    <div class="dashboard-layout">
      <!-- Mobile Toggle -->
      <div style="position:fixed; top:15px; left:15px; z-index:999;">
        <button id="mobile-toggle" class="mobile-menu-toggle">
          ${ICONS.home}
        </button>
      </div>

      <!-- Sidebar -->
      <aside id="dashboard-sidebar" class="sidebar">
        <div class="sidebar-brand">
          ${ICONS.settings}
          <span>Campus Admin</span>
        </div>
        
        <div class="sidebar-profile">
          <div class="profile-avatar" style="background:var(--primary); color:white;">A</div>
          <div class="profile-info">
            <span class="profile-name">Admin Console</span>
            <span class="profile-role">Transcend Campus</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <button class="nav-item ${state.adminActiveTab === 'menu' ? 'active' : ''}" data-tab="menu">
            ${ICONS.coffee} Mess Menu Setup
          </button>
          <button class="nav-item ${state.adminActiveTab === 'directory' ? 'active' : ''}" data-tab="directory">
            ${ICONS.users} Student Directory
          </button>
          <button class="nav-item ${state.adminActiveTab === 'leaves' ? 'active' : ''}" data-tab="leaves">
            ${ICONS.calendar} Student Absence Logs
          </button>
          <button class="nav-item ${state.adminActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            ${ICONS.users} Gate &amp; Attendance
          </button>
          <button class="nav-item ${state.adminActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            ${ICONS.shield} Health Logs
          </button>
        </nav>
        
        <div class="sidebar-footer">
          <button id="btn-logout" class="btn-logout">
            ${ICONS.logout} Logout
          </button>
        </div>
      </aside>

      <!-- Main Panel -->
      <main class="main-content">
        <header class="header-container">
          <div class="header-title-section">
            <h1>${state.adminActiveTab === 'menu' ? 'Mess Menu Management' : state.adminActiveTab === 'leaves' ? 'Student Absence Registry' : state.adminActiveTab === 'attendance' ? 'Gate & Attendance' : state.adminActiveTab === 'health' ? 'Health & Medical Logs' : 'Student Directory'}</h1>
            <p>Admin Control Panel • 5 Student Capacity</p>
          </div>
          
          <div style="display:flex; gap:10px;">
            ${state.adminActiveTab === 'directory' ? `<button class="btn-primary" id="btn-add-student-modal">${ICONS.plus} Add Student</button>` : ''}
          </div>
        </header>

        ${state.adminActiveTab === 'menu' ? `
          <div class="dashboard-panel dashboard-full">
            <div class="panel-header">
              <h2 class="panel-title">${ICONS.coffee} Configure Daily Mess Dishes</h2>
            </div>
            
            <form id="admin-menu-form" style="padding:20px 0; display:flex; flex-direction:column; gap:20px;">
              <div class="form-grid">
                <div class="form-group-full">
                  <label class="form-label" style="font-weight:700;">Breakfast Dish Details (07:30 AM - 09:00 AM)</label>
                  <textarea id="menu-breakfast" class="form-textarea" required style="height:60px;">${menu.breakfast}</textarea>
                </div>
                <div class="form-group-full">
                  <label class="form-label" style="font-weight:700;">Lunch Dish Details (12:30 PM - 02:00 PM)</label>
                  <textarea id="menu-lunch" class="form-textarea" required style="height:60px;">${menu.lunch}</textarea>
                </div>
                <div class="form-group-full">
                  <label class="form-label" style="font-weight:700;">Snacks Dish Details (04:30 PM - 05:30 PM)</label>
                  <textarea id="menu-snacks" class="form-textarea" required style="height:60px;">${menu.snacks}</textarea>
                </div>
                <div class="form-group-full">
                  <label class="form-label" style="font-weight:700;">Dinner Dish Details (07:30 PM - 09:00 PM)</label>
                  <textarea id="menu-dinner" class="form-textarea" required style="height:60px;">${menu.dinner}</textarea>
                </div>
              </div>
              
              <button type="submit" class="btn-primary" style="align-self:flex-start; background:var(--primary); padding:12px 24px; font-weight:700;">Update Daily Mess Menu</button>
            </form>
          </div>
        ` : state.adminActiveTab === 'leaves' ? renderWardenLeaves() : state.adminActiveTab === 'attendance' ? renderWardenAttendanceView() : state.adminActiveTab === 'health' ? renderWardenHealthView() : renderWardenDirectory()}
      </main>

      <!-- Student Detail Modal -->
      <div id="student-detail-modal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-student-name">Student Details</h3>
            <button class="modal-close" id="btn-close-detail-modal">${ICONS.x}</button>
          </div>
          <div id="modal-student-content" style="display:flex; flex-direction:column; gap:15px;">
            <!-- filled dynamically -->
          </div>
        </div>
      </div>

      <!-- Add Student Modal -->
      <div id="add-student-modal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">Register New Student</h3>
            <button class="modal-close" id="btn-close-add-modal">${ICONS.x}</button>
          </div>
          <form id="add-student-form">
            <div class="form-grid">
              <div class="form-group-full">
                <label class="form-label" for="new-student-name">Full Name</label>
                <input type="text" id="new-student-name" class="form-input" required placeholder="John Doe">
              </div>
              <div>
                <label class="form-label" for="new-student-block">Block</label>
                <select id="new-student-block" class="form-input" required>
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                  <option value="D">Block D</option>
                </select>
              </div>
              <div>
                <label class="form-label" for="new-student-room">Room Number</label>
                <input type="text" id="new-student-room" class="form-input" required placeholder="A-102">
              </div>
              <div class="form-group-full">
                <label class="form-label" for="new-student-email">Email Address</label>
                <input type="email" id="new-student-email" class="form-input" required placeholder="john.doe@hostel.edu">
              </div>
              <div class="form-group-full">
                <label class="form-label" for="new-student-phone">Contact Number</label>
                <input type="text" id="new-student-phone" class="form-input" required placeholder="+91 9876543210">
              </div>
            </div>
            <button type="submit" class="btn-primary" style="width:100%; margin-top:20px; font-weight:700;">Add Student Profile</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function attachAdminEvents() {
  const sidebar = document.getElementById('dashboard-sidebar');
  const mobileToggle = document.getElementById('mobile-toggle');
  
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-item').dataset.tab;
      state.adminActiveTab = tab;
      if (sidebar) sidebar.classList.remove('mobile-open');
      render();
    });
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.currentView = 'login';
      state.currentStudentId = null;
      render();
    });
  }

  const menuForm = document.getElementById('admin-menu-form');
  if (menuForm) {
    menuForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedMenu = {
        breakfast: document.getElementById('menu-breakfast').value,
        lunch: document.getElementById('menu-lunch').value,
        snacks: document.getElementById('menu-snacks').value,
        dinner: document.getElementById('menu-dinner').value
      };
      localStorage.setItem('hostel_mess_menu', JSON.stringify(updatedMenu));
      showToast("Daily Mess Menu updated successfully!", "success");
      render();
    });
  }

  if (state.adminActiveTab === 'health') attachHealthViewEvents();
  if (state.adminActiveTab === 'attendance') attachAttendanceViewEvents();

  if (state.adminActiveTab === 'directory') {
    const dirSearchInput = document.getElementById('dir-search');
    if (dirSearchInput) {
      dirSearchInput.addEventListener('input', (e) => {
        state.directorySearch = e.target.value;
        state.directoryPage = 1;
        render();
        const input = document.getElementById('dir-search');
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      });
    }

    const blockFilter = document.getElementById('dir-block-filter');
    if (blockFilter) {
      blockFilter.addEventListener('change', (e) => {
        state.directoryBlockFilter = e.target.value;
        state.directoryPage = 1;
        render();
      });
    }

    const statusFilter = document.getElementById('dir-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        state.directoryStatusFilter = e.target.value;
        state.directoryPage = 1;
        render();
      });
    }

    const addStudentModalBtn = document.getElementById('btn-add-student-modal');
    const addModal = document.getElementById('add-student-modal');
    if (addStudentModalBtn && addModal) {
      addStudentModalBtn.addEventListener('click', () => {
        addModal.classList.add('active');
      });
    }
    const closeAddModalBtn = document.getElementById('btn-close-add-modal');
    if (closeAddModalBtn && addModal) {
      closeAddModalBtn.addEventListener('click', () => {
        addModal.classList.remove('active');
      });
    }

    const addStudentForm = document.getElementById('add-student-form');
    if (addStudentForm) {
      addStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-student-name').value;
        const block = document.getElementById('new-student-block').value;
        const room = document.getElementById('new-student-room').value;
        const email = document.getElementById('new-student-email').value;
        const phone = document.getElementById('new-student-phone').value;
        
        const nextIdNum = state.db.length + 1;
        const newStudent = {
          id: `STU${String(nextIdNum).padStart(3, '0')}`,
          name,
          room,
          block,
          email,
          phone,
          leaves: [],
          mealBookings: []
        };
        state.db.push(newStudent);
        saveDB(state.db);
        showToast(`Student profile ${newStudent.id} registered!`, 'success');
        render();
      });
    }

    document.querySelectorAll('.btn-view-health').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.target.dataset.stuId;
        state.viewHealthStudentId = studentId;
        if (state.currentView === 'warden') state.wardenActiveTab = 'health';
        if (state.currentView === 'admin') state.adminActiveTab = 'health';
        if (state.currentView === 'superadmin') state.superActiveTab = 'health';
        render();
      });
    });

    document.querySelectorAll('.btn-view-attendance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.target.dataset.stuId;
        state.viewAttendanceStudentId = studentId;
        if (state.currentView === 'warden') state.wardenActiveTab = 'attendance';
        if (state.currentView === 'admin') state.adminActiveTab = 'attendance';
        if (state.currentView === 'superadmin') state.superActiveTab = 'attendance';
        render();
      });
    });

    document.querySelectorAll('.btn-view-student').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.stuId;
        const student = state.db.find(s => s.id === id);
        if (!student) return;
        
        const modal = document.getElementById('student-detail-modal');
        const title = document.getElementById('modal-student-name');
        const content = document.getElementById('modal-student-content');
        
        title.innerHTML = `Student Directory Log: ${student.name}`;
        
        content.innerHTML = `
          <div style="background:#f3f4f6; border-radius:8px; padding:15px; border:1px solid var(--border-color);">
            <p><strong>Roll ID:</strong> ${student.id}</p>
            <p><strong>Room / Block:</strong> ${student.room} (Block ${student.block})</p>
            <p><strong>Contact Email:</strong> ${student.email}</p>
            <p><strong>Phone Number:</strong> ${student.phone}</p>
          </div>
          <div>
            <h4 style="margin-bottom:8px; display:flex; justify-content:space-between;">
              <span>Leave / Outing Records</span>
              <span style="font-size:12px; font-weight:normal; color:var(--text-secondary);">${student.leaves.length} logs</span>
            </h4>
            <div style="max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
              ${student.leaves.length === 0 ? `<p style="font-size:13px; color:var(--text-muted); text-align:center; padding:10px;">No leave history</p>` : 
                student.leaves.map(l => `
                  <div style="background:#fff; border:1px solid var(--border-color); border-radius:6px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                      <span style="font-size:12px; font-weight:700; color:var(--text-primary);">${formatDisplayDate(l.startDate)} - ${formatDisplayDate(l.endDate)}</span><br>
                      <span style="font-size:10px; font-weight:600; color:var(--primary); text-transform:uppercase;">${l.type === 'outing' ? 'Going Out' : 'On Leave'}</span>
                    </div>
                    <span class="badge ${l.status}" style="font-size:10px; padding:4px 8px;">${l.status}</span>
                  </div>
                `).join('')}
            </div>
          </div>
        `;
        
        modal.classList.add('active');
      });
    });

    if (state.adminActiveTab === 'health') attachHealthViewEvents();
    if (state.adminActiveTab === 'attendance') attachAttendanceViewEvents();
    const closeDetailModalBtn = document.getElementById('btn-close-detail-modal');
    if (closeDetailModalBtn) {
      closeDetailModalBtn.addEventListener('click', () => {
        document.getElementById('student-detail-modal').classList.remove('active');
      });
    }

    // btn-view-health from admin directory
    document.querySelectorAll('.btn-view-health').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.target.closest('.btn-view-health').dataset.stuId;
        state.viewHealthStudentId = studentId;
        state.adminActiveTab = 'health';
        render();
      });
    });

    // btn-view-attendance from admin directory
    document.querySelectorAll('.btn-view-attendance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.target.closest('.btn-view-attendance').dataset.stuId;
        state.viewAttendanceStudentId = studentId;
        state.adminActiveTab = 'attendance';
        render();
      });
    });
  }
}

// View template: SUPER ADMIN DASHBOARD
function renderSuperadminDashboard() {
  const adminUsers = [
    { name: "Chief Warden Console", role: "Warden", pin: "1234", id: "WDN-01" },
    { name: "Campus Admin Console", role: "Admin", pin: "5678", id: "ADM-01" },
    { name: "Super Admin Control", role: "Superadmin", pin: "9999", id: "SAD-01" }
  ];

  return `
    <div class="dashboard-layout">
      <!-- Mobile Toggle -->
      <div style="position:fixed; top:15px; left:15px; z-index:999;">
        <button id="mobile-toggle" class="mobile-menu-toggle">
          ${ICONS.home}
        </button>
      </div>

      <!-- Sidebar -->
      <aside id="dashboard-sidebar" class="sidebar">
        <div class="sidebar-brand">
          ${ICONS.key}
          <span>Super Admin</span>
        </div>
        
        <div class="sidebar-profile">
          <div class="profile-avatar" style="background:#1e40af; color:white;">SA</div>
          <div class="profile-info">
            <span class="profile-name">Super Control</span>
            <span class="profile-role">Root Privileges</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <button class="nav-item ${state.superActiveTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
            ${ICONS.home} Master Control
          </button>
          <button class="nav-item ${state.superActiveTab === 'logs' ? 'active' : ''}" data-tab="logs">
            ${ICONS.shield} Activity Logs
          </button>
          <button class="nav-item ${state.superActiveTab === 'database' ? 'active' : ''}" data-tab="database">
            ${ICONS.waste} Database Controls
          </button>
          <button class="nav-item ${state.superActiveTab === 'directory' ? 'active' : ''}" data-tab="directory">
            ${ICONS.users} Student Directory
          </button>
          <button class="nav-item ${state.superActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            ${ICONS.users} Gate &amp; Attendance
          </button>
          <button class="nav-item ${state.superActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            ${ICONS.shield} Health Logs
          </button>
        </nav>
        
        <div class="sidebar-footer">
          <button id="btn-logout" class="btn-logout">
            ${ICONS.logout} Logout
          </button>
        </div>
      </aside>

      <!-- Main Panel -->
      <main class="main-content">
        <header class="header-container">
          <div class="header-title-section">
            <h1>${state.superActiveTab === 'dashboard' ? 'Master System Dashboard' : state.superActiveTab === 'logs' ? 'System Activity Logs' : state.superActiveTab === 'directory' ? 'Student Directory' : state.superActiveTab === 'attendance' ? 'Gate & Attendance' : state.superActiveTab === 'health' ? 'Health & Medical Logs' : 'Database Maintenance'}</h1>
            <p>Superadmin Master Panel • Root Access Enabled</p>
          </div>
        </header>

        <!-- Stats row (General statistics) -->
        <div class="stats-grid" style="margin-bottom: 25px;">
          <div class="stat-card">
            <div class="stat-icon primary">${ICONS.users}</div>
            <div class="stat-details">
              <span class="stat-label">Total Users</span>
              <span class="stat-value">13</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">${ICONS.shield}</div>
            <div class="stat-details">
              <span class="stat-label">System Status</span>
              <span class="stat-value" style="color:var(--success); display:flex; align-items:center; gap:5px;"><span class="status-dot active"></span> Healthy</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">${ICONS.settings}</div>
            <div class="stat-details">
              <span class="stat-label">Total Admins</span>
              <span class="stat-value">3</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon danger">${ICONS.key}</div>
            <div class="stat-details">
              <span class="stat-label">Sec. Cleared</span>
              <span class="stat-value">100%</span>
            </div>
          </div>
        </div>

        ${state.superActiveTab === 'dashboard' ? `
          <div class="dashboard-panel dashboard-full">
            <div class="panel-header">
              <h2 class="panel-title">${ICONS.users} Administrator & Staff Directory</h2>
            </div>
            
            <div class="directory-table-wrapper" style="margin-top: 15px;">
              <table class="directory-table">
                <thead>
                  <tr>
                    <th>Account ID</th>
                    <th>Name</th>
                    <th>Role / Level</th>
                    <th>Secret Login PIN</th>
                    <th style="text-align:right;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${adminUsers.map(user => `
                    <tr>
                      <td><strong>${user.id}</strong></td>
                      <td>${user.name}</td>
                      <td><span class="student-block-badge" style="background:#f3f4f6; color:var(--text-primary); font-weight:700;">${user.role}</span></td>
                      <td><code style="background:#f3f4f6; padding:4px 8px; border-radius:4px; font-weight:700; font-family:monospace; letter-spacing:1px;">${user.pin}</code></td>
                      <td style="text-align:right;"><span class="badge approved" style="font-size:11px; padding:4px 8px;">Active</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : state.superActiveTab === 'logs' ? `
          <div class="dashboard-panel dashboard-full">
            <div class="panel-header">
              <h2 class="panel-title">${ICONS.shield} Live System Log Tracker</h2>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:12px; margin-top:20px; font-family:monospace; font-size:13px; color:var(--text-secondary);">
              <div style="background:#f9fafb; border-left:4px solid var(--primary); padding:12px; border-radius:0 8px 8px 0;">
                <span style="color:var(--text-muted);">[02:29 PM]</span> <strong style="color:var(--primary);">SYSTEM:</strong> Superadmin console initialized. Uptime: 100%
              </div>
              <div style="background:#f9fafb; border-left:4px solid var(--success); padding:12px; border-radius:0 8px 8px 0;">
                <span style="color:var(--text-muted);">[01:42 PM]</span> <strong style="color:var(--success);">PARENT_PORTAL:</strong> Parent approved leave request LV-STU001-1 for Aarav Sharma (STU001)
              </div>
              <div style="background:#f9fafb; border-left:4px solid var(--warning); padding:12px; border-radius:0 8px 8px 0;">
                <span style="color:var(--text-muted);">[11:05 AM]</span> <strong style="color:var(--warning);">WARDEN_CONSOLE:</strong> Chief Warden viewed student log directory list
              </div>
              <div style="background:#f9fafb; border-left:4px solid var(--primary); padding:12px; border-radius:0 8px 8px 0;">
                <span style="color:var(--text-muted);">[09:12 AM]</span> <strong style="color:var(--primary);">ADMIN_CONSOLE:</strong> Mess dishes updated to standard continental menu setup
              </div>
              <div style="background:#f9fafb; border-left:4px solid var(--danger); padding:12px; border-radius:0 8px 8px 0;">
                <span style="color:var(--text-muted);">[Yesterday]</span> <strong style="color:var(--danger);">STUDENT_PORTAL:</strong> Vihaan Verma submitted new leave request for Going Home
              </div>
            </div>
          </div>
        ` : state.superActiveTab === 'database' ? `
          <div class="dashboard-panel dashboard-full">
            <div class="panel-header">
              <h2 class="panel-title">${ICONS.waste} System Database Operations</h2>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:25px; margin-top:20px; max-width:600px;">
              <div style="background:#fef2f2; border:1px solid #fca5a5; padding:20px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; gap:15px;">
                <div>
                  <h4 style="color:#b91c1c; margin-bottom:5px;">Clear Portal LocalStorage Cache</h4>
                  <p style="font-size:13px; color:#7f1d1d;">Wipes all active local database keys, resetting students to the original 5 seeded accounts.</p>
                </div>
                <button id="super-btn-reset-db" class="btn-primary" style="background:#dc2626; padding:12px 20px; flex-shrink:0;">Reset Database</button>
              </div>

              <div style="background:#eff6ff; border:1px solid #93c5fd; padding:20px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; gap:15px;">
                <div>
                  <h4 style="color:#1d4ed8; margin-bottom:5px;">Simulate All Meal Bookings</h4>
                  <p style="font-size:13px; color:#1e3a8a;">Generates fresh random breakfast, lunch, snacks, and dinner selections for testing mess wastages.</p>
                </div>
                <button id="super-btn-seed-meals" class="btn-primary" style="background:#2563eb; padding:12px 20px; flex-shrink:0;">Re-Seed Meals</button>
              </div>
            </div>
          </div>
        ` : state.superActiveTab === 'directory' ? renderWardenDirectory() : state.superActiveTab === 'attendance' ? renderWardenAttendanceView() : state.superActiveTab === 'health' ? renderWardenHealthView() : ''}
      </main>
    </div>
  `;
}

function attachSuperadminEvents() {
  const sidebar = document.getElementById('dashboard-sidebar');
  const mobileToggle = document.getElementById('mobile-toggle');
  
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-item').dataset.tab;
      state.superActiveTab = tab;
      if (sidebar) sidebar.classList.remove('mobile-open');
      render();
    });
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.currentView = 'login';
      state.currentStudentId = null;
      render();
    });
  }

  if (state.superActiveTab === 'health') attachHealthViewEvents();
  if (state.superActiveTab === 'attendance') attachAttendanceViewEvents();
  // Handle database maintenance resets
  if (state.superActiveTab === 'database') {
    const resetBtn = document.getElementById('super-btn-reset-db');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem('hostel_portal_db');
        state.db = initDB();
        showToast("LocalStorage database wiped! Restored 5 demo students.", "warning");
        render();
      });
    }

    const seedMealsBtn = document.getElementById('super-btn-seed-meals');
    if (seedMealsBtn) {
      seedMealsBtn.addEventListener('click', () => {
        // Clear first to re-seed deterministically
        localStorage.removeItem('hostel_portal_db');
        state.db = initDB();
        showToast("Re-seeded random meal plan calendar successfully!", "success");
        render();
      });
    }
  }

  if (state.superActiveTab === 'health') attachHealthViewEvents();
  if (state.superActiveTab === 'attendance') attachAttendanceViewEvents();

  // btn-view-health from superadmin directory
  document.querySelectorAll('.btn-view-health').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.target.closest('.btn-view-health').dataset.stuId;
      state.viewHealthStudentId = studentId;
      state.superActiveTab = 'health';
      render();
    });
  });

  // btn-view-attendance from superadmin directory
  document.querySelectorAll('.btn-view-attendance').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.target.closest('.btn-view-attendance').dataset.stuId;
      state.viewAttendanceStudentId = studentId;
      state.superActiveTab = 'attendance';
      render();
    });
  });

  // Directory search/filter for superadmin
  if (state.superActiveTab === 'directory') {
    const dirSearchInput = document.getElementById('dir-search');
    if (dirSearchInput) {
      dirSearchInput.addEventListener('input', (e) => {
        state.directorySearch = e.target.value;
        state.directoryPage = 1;
        render();
        const input = document.getElementById('dir-search');
        if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
      });
    }
    const blockFilter = document.getElementById('dir-block-filter');
    if (blockFilter) {
      blockFilter.addEventListener('change', (e) => { state.directoryBlockFilter = e.target.value; state.directoryPage = 1; render(); });
    }
    const statusFilter = document.getElementById('dir-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => { state.directoryStatusFilter = e.target.value; state.directoryPage = 1; render(); });
    }
    const prevBtn = document.getElementById('btn-page-prev');
    if (prevBtn) { prevBtn.addEventListener('click', () => { if (state.directoryPage > 1) { state.directoryPage--; render(); } }); }
    const nextBtn = document.getElementById('btn-page-next');
    if (nextBtn) { nextBtn.addEventListener('click', () => { state.directoryPage++; render(); }); }
    const closeDetailModalBtn = document.getElementById('btn-close-detail-modal');
    if (closeDetailModalBtn) {
      closeDetailModalBtn.addEventListener('click', () => {
        document.getElementById('student-detail-modal').classList.remove('active');
      });
    }
  }
}

// App Startup
function initApp() {
  state.db = initDB();
  if (!localStorage.getItem('hostel_mess_menu')) {
    localStorage.setItem('hostel_mess_menu', JSON.stringify({
      breakfast: "Masala Dosa, Chutney, Sambhar & Coffee",
      lunch: "Jeera Rice, Dal Fry, Roti, Aloo Gobi & Buttermilk",
      snacks: "Veg Samosa, Green Chutney & Tea",
      dinner: "Veg Biryani, Raita, Paneer Butter Masala & Gulab Jamun"
    }));
  }
  render();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
