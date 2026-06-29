import './style.css';
import { 
  initDB, 
  saveDB, 
  getDateString, 
  formatDisplayDate, 
  isStudentOnLeave, 
  isMealBooked,
  getMealAcceptanceType,
  applyLeave, 
  cancelLeave, 
  approveLeave, 
  rejectLeave, 
  updateMealBookings, 
  getAnalyticsForDate,
  hasMealBookingDeadlinePassed,
  hasMealBeenRejected,
  formatMealBookingDeadline,
  reportComplaint,
  logEntryExit,
  getBedAssignments,
  updateBehaviourLog
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
  complaint: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="7" x2="12" y2="11"></line><line x1="12" y1="14" x2="12.01" y2="14"></line></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`
};

// Global App State
const state = {
  db: [],
  currentView: 'login', // 'login' | 'student' | 'parent' | 'warden' | 'admin' | 'superadmin'
  currentStudentId: null,
  viewAttendanceStudentId: null,
  viewHealthStudentId: null,
  loginTab: 'student', // 'student' | 'parent' | 'warden' | 'admin' | 'superadmin'
  studentActiveTab: 'meals', // 'meals' | 'leave' | 'behaviour'
  parentActiveTab: 'leave', // 'leave' | 'meals'
  wardenActiveTab: 'leaves', // 'leaves' | 'dining' | 'behaviour'
  adminMenuDay: 0,  // 0 = default template, 1-7 = day offset from today
  adminActiveTab: 'menu', // 'menu' | 'leaves' | 'directory'
  superActiveTab: 'dashboard', // 'dashboard' | 'logs' | 'database'
  
  behaviourSearch: '',
  behaviourCategoryFilter: 'all',
  behaviourSeverityFilter: 'all',

  // Student Directory State
  directorySearch: '',
  directoryBlockFilter: 'all',
  directoryStatusFilter: 'all',
  directoryPage: 1,
  directoryPageSize: 10,
  diningDate: getDateString(0),
  diningSearch: '',
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  calendarSelectedDate: getDateString(0),
  editingHealthRecordId: null
};

// Chart.js instance holder
let mealChartInstance = null;

// Time Formatter for 12-hour format
function formatTimeTo12Hr(timeStr) {
  if (!timeStr) return '';
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    let minutes = parts[1].slice(0, 2);
    if (!isNaN(hours)) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = String(hours).padStart(2, '0');
      return `${hoursStr}:${minutes} ${ampm}`;
    }
  }
  return timeStr;
}

function showCustomConfirm(message, title = 'Confirm Action', type = 'info') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    let iconBg = '#eff6ff';
    let iconColor = '#3b82f6';
    let confirmBg = 'var(--primary)';
    let confirmBorder = 'var(--primary)';
    let svgIcon = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    if (type === 'danger') {
      iconBg = '#fee2e2';
      iconColor = '#ef4444';
      confirmBg = '#dc2626';
      confirmBorder = '#dc2626';
      svgIcon = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else if (type === 'success') {
      iconBg = '#d1fae5';
      iconColor = '#10b981';
      confirmBg = '#10b981';
      confirmBorder = '#10b981';
      svgIcon = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    }

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 420px; width: 90%; padding: 24px; border-radius: 12px; border: 1px solid var(--border-color); background: #fff; box-shadow: var(--shadow-lg); animation: modalFadeIn 0.2s ease-out; transform: translateY(0);">
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="background:${iconBg}; color:${iconColor}; width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);">
              ${svgIcon}
            </div>
            <h3 style="margin:0; font-size:18px; font-weight:700; color:var(--text-primary); font-family:inherit;">${title}</h3>
          </div>
          <p style="margin:0 0 4px; font-size:14px; color:var(--text-secondary); line-height:1.55; font-family:inherit;">${message}</p>
          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:6px;">
            <button id="custom-confirm-cancel" style="background:#f3f4f6; border:1px solid #e5e7eb; color:#4b5563; font-weight:600; padding:10px 20px; font-size:13px; border-radius:6px; cursor:pointer; transition: all 0.2s; font-family:inherit;">
              Cancel
            </button>
            <button id="custom-confirm-ok" style="background:${confirmBg}; border:1px solid ${confirmBorder}; color:white; font-weight:700; padding:10px 20px; font-size:13px; border-radius:6px; cursor:pointer; transition: all 0.2s; font-family:inherit; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);">
              Confirm
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btnCancel = overlay.querySelector('#custom-confirm-cancel');
    const btnOk = overlay.querySelector('#custom-confirm-ok');

    btnCancel.onmouseover = () => { btnCancel.style.background = '#e5e7eb'; btnCancel.style.color = '#1f2937'; };
    btnCancel.onmouseout = () => { btnCancel.style.background = '#f3f4f6'; btnCancel.style.color = '#4b5563'; };
    
    btnOk.onmouseover = () => { btnOk.style.filter = 'brightness(0.95)'; };
    btnOk.onmouseout = () => { btnOk.style.filter = 'none'; };

    const cleanup = (value) => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.15s ease-out';
      setTimeout(() => {
        overlay.remove();
        resolve(value);
      }, 150);
    };

    btnCancel.addEventListener('click', () => cleanup(false));
    btnOk.addEventListener('click', () => cleanup(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
}

// ─── Menu Helpers ───────────────────────────────────────────
const DEFAULT_MENU = {
  breakfast: 'Masala Dosa, Chutney, Sambhar & Coffee',
  lunch:     'Jeera Rice, Dal Fry, Roti, Aloo Gobi & Buttermilk',
  snacks:    'Veg Samosa, Green Chutney & Tea',
  dinner:    'Veg Biryani, Raita, Paneer Butter Masala & Gulab Jamun'
};

function getMenuForDate(dateStr) {
  const raw = localStorage.getItem('hostel_mess_menu');
  if (!raw) return DEFAULT_MENU;
  const store = JSON.parse(raw);
  // Backward-compat: old flat format had breakfast/lunch directly
  if (store.breakfast) return store;
  return store[dateStr] || store['default'] || DEFAULT_MENU;
}

function getMenuStore() {
  const raw = localStorage.getItem('hostel_mess_menu');
  if (!raw) return { default: { ...DEFAULT_MENU } };
  const store = JSON.parse(raw);
  // Migrate old flat format
  if (store.breakfast) return { default: store };
  if (!store.default) store.default = { ...DEFAULT_MENU };
  return store;
}

function saveMenuStore(store) {
  localStorage.setItem('hostel_mess_menu', JSON.stringify(store));
}

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
  } else {
    let dashboardHTML = '';
    if (state.currentView === 'student') {
      dashboardHTML = renderStudentDashboard();
    } else if (state.currentView === 'parent') {
      dashboardHTML = renderParentDashboard();
    } else if (state.currentView === 'warden') {
      dashboardHTML = renderWardenDashboard();
    } else if (state.currentView === 'admin') {
      dashboardHTML = renderAdminDashboard();
    } else if (state.currentView === 'superadmin') {
      dashboardHTML = renderSuperadminDashboard();
    }

    // Set the complete innerHTML with both the dashboard and the global modals
    app.innerHTML = dashboardHTML + `
      <!-- Student Detail Modal -->
      <div id="student-detail-modal" class="modal-overlay">
        <div class="modal-container" style="max-height: 90vh; overflow-y: auto;">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-student-name">Student Details</h3>
            <button class="modal-close" id="btn-close-detail-modal">${ICONS.x}</button>
          </div>
          <div id="modal-student-content" style="display:flex; flex-direction:column; gap:15px;">
            <!-- filled dynamically -->
          </div>
        </div>
      </div>

      <!-- Behaviour Log Modal -->
      <div id="behaviour-log-modal" class="modal-overlay">
        <div class="modal-container" style="max-width: 500px;">
          <div class="modal-header">
            <h3 class="modal-title" id="behaviour-modal-title">Add Behaviour Log</h3>
            <button class="modal-close" id="btn-close-behaviour-modal">${ICONS.x}</button>
          </div>
          <form id="behaviour-log-form">
            <input type="hidden" id="behaviour-log-id" value="">
            <input type="hidden" id="behaviour-student-id" value="">
            
            <div id="behaviour-student-select-container" style="display: none; margin-bottom: 15px;">
              <label class="form-label" for="behaviour-student-select">Select Student</label>
              <select id="behaviour-student-select" class="form-input">
                ${state.db.map(s => `<option value="${s.id}">${s.id} - ${s.name}</option>`).join('')}
              </select>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
              <div>
                <label class="form-label" for="behaviour-date">Date</label>
                <input type="date" id="behaviour-date" class="form-input" required>
              </div>
              
              <div>
                <label class="form-label" for="behaviour-category">Category</label>
                <select id="behaviour-category" class="form-input" required>
                  <option value="Academic">Academic</option>
                  <option value="Discipline">Discipline</option>
                  <option value="Social">Social</option>
                  <option value="General">General / Other</option>
                </select>
              </div>
              
              <div>
                <label class="form-label" for="behaviour-severity">Severity / Type</label>
                <select id="behaviour-severity" class="form-input" required>
                  <option value="positive">Commendable (Positive)</option>
                  <option value="neutral">General (Neutral)</option>
                  <option value="warning">Warning (Minor)</option>
                  <option value="critical">Critical (Disciplinary)</option>
                </select>
              </div>
              
              <div>
                <label class="form-label" for="behaviour-description">Detailed Description</label>
                <textarea id="behaviour-description" class="form-textarea" required placeholder="Describe the behavior or observation in detail..." style="min-height: 80px;"></textarea>
              </div>
              
              <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                <button type="button" class="btn-secondary" id="btn-cancel-behaviour" style="padding: 10px 20px;">Cancel</button>
                <button type="submit" class="btn-primary" id="btn-save-behaviour" style="padding: 10px 20px;">Save Entry</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    // Now safely attach listeners to the fully rendered DOM
    if (state.currentView === 'student') {
      attachStudentEvents();
    } else if (state.currentView === 'parent') {
      attachParentEvents();
    } else if (state.currentView === 'warden') {
      attachWardenEvents();
    } else if (state.currentView === 'admin') {
      attachAdminEvents();
    } else if (state.currentView === 'superadmin') {
      attachSuperadminEvents();
    }

    attachGlobalBehaviourEvents();

    const detailModalClose = document.getElementById('btn-close-detail-modal');
    if (detailModalClose) {
      detailModalClose.addEventListener('click', () => {
        document.getElementById('student-detail-modal').classList.remove('active');
      });
    }
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
        <p class="login-subtitle">Hostel Portal</p>
        
        <div id="login-form-area" style="margin-top: 20px;">
          <div class="login-form-group">
            <label class="login-label">Email Address</label>
            <input type="text" id="login-identifier" class="login-input" placeholder="e.g., student@hostel.edu or warden@hostel.edu" value="aarav.sharma@hostel.edu">
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
        
        <div class="login-footer" style="margin-top: 25px; text-align: center; line-height: 1.6; border-top: 1px solid rgba(226, 232, 240, 0.1); padding-top: 15px;">
          <p style="margin: 0; font-weight: 800; text-transform: uppercase; color: #0f172a; font-size: 10.5px; letter-spacing: 0.05em;">Owned by Transcend group of institutions</p>
          <p style="margin: 4px 0 0 0; text-transform: uppercase; font-size: 10.5px; font-weight: 600; color: #64748b; letter-spacing: 0.05em;">
            Developed by <span style="color: #2563eb; font-weight: 700;">Start Smart, SE</span>
          </p>
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
        showToast('Please enter your email address.', 'warning');
        return;
      }

      if (!password) {
        showToast('Please enter your password.', 'warning');
        return;
      }

      const normalizedEmail = email.toLowerCase();

      // Check Warden
      if (normalizedEmail === 'warden@hostel.edu') {
        if (password === 'warden123') {
          state.currentView = 'warden';
          state.wardenActiveTab = 'leaves';
          showToast('Logged in as Hostel Warden', 'success');
          render();
        } else {
          showToast('Incorrect password.', 'error');
        }
        return;
      }

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
      if (normalizedEmail === 'superadmin@hostel.edu' || normalizedEmail === 'siddharthkt@transcendgroup.org' || normalizedEmail === 'shwethas@transcendgroup.org') {
        const isValid = (normalizedEmail === 'superadmin@hostel.edu' && password === 'super123') ||
                        ((normalizedEmail === 'siddharthkt@transcendgroup.org' || normalizedEmail === 'shwethas@transcendgroup.org') && password === 'Transcend@2026');
        if (isValid) {
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
      state.wardenActiveTab = 'leaves';
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
      <!-- Mobile Top Bar -->
      <div class="mobile-top-bar">
        <button id="mobile-toggle" class="mobile-menu-toggle" aria-label="Open navigation">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="mobile-top-bar-brand">
          ${ICONS.shield}
          <span>TRANSCEND HOSTEL</span>
        </div>
      </div>
      <!-- Sidebar Backdrop -->
      <div id="sidebar-backdrop" class="sidebar-backdrop"></div>

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
          <button class="nav-item ${state.studentActiveTab === 'behaviour' ? 'active' : ''}" data-tab="behaviour">
            ${ICONS.clipboard} Behaviour Log
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
            <h1>${state.studentActiveTab === 'meals' ? 'Dining & Meal Booking' : state.studentActiveTab === 'leave' ? 'Leave Requests' : state.studentActiveTab === 'health' ? 'My Health Status' : state.studentActiveTab === 'behaviour' ? 'My Behaviour Log' : 'Talk to Us'}</h1>
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
          state.studentActiveTab === 'behaviour' ? renderBehaviourLogs(student, true) :
          renderComplaintsSection(student)}
      </main>
    </div>

    <!-- Custom Modal for Meal Cancellation Reason -->
    <div id="meal-cancel-modal" class="modal-overlay">
      <div class="modal-container" style="max-width: 400px; padding: 25px;">
        <div class="modal-header">
          <h3 class="modal-title">Reject Meal</h3>
          <button type="button" id="btn-close-meal-modal" class="modal-close">&times;</button>
        </div>
        <form id="meal-cancel-form" style="display: flex; flex-direction: column; gap: 15px;">
          <input type="hidden" id="meal-cancel-date">
          <input type="hidden" id="meal-cancel-meal">
          
          <div>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0;">
              Please state the reason for rejecting <strong id="meal-cancel-name-text"></strong> on <strong id="meal-cancel-date-text"></strong>:
            </p>
            <textarea id="meal-cancel-reason" class="form-textarea" required placeholder="e.g. Dining outside / unwell / parent visiting..." style="width: 100%; height: 90px; resize: none; margin-top: 5px; box-sizing: border-box;"></textarea>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" id="btn-cancel-meal-cancel" class="btn-reject" style="padding: 8px 16px; margin: 0;">Back</button>
            <button type="submit" class="btn-approve" style="background: var(--danger); padding: 8px 16px; margin: 0;">Confirm Reject</button>
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
      const isOpen = sidebar.classList.toggle('mobile-open');
      const bd = document.getElementById('sidebar-backdrop');
      if (bd) bd.classList.toggle('active', isOpen);
    });
    const bd = document.getElementById('sidebar-backdrop');
    if (bd) bd.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      bd.classList.remove('active');
    });
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-item').dataset.tab;
      state.studentActiveTab = tab;
      if (sidebar) sidebar.classList.remove('mobile-open');
      const bd = document.getElementById('sidebar-backdrop');
      if (bd) bd.classList.remove('active');
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

      // 24h deadline validation
      const deadlinePassed = hasMealBookingDeadlinePassed(date);

      if (action === 'cancel') {
        if (deadlinePassed) {
          showToast(`Cannot reject ${mealName}: the 8:00 AM deadline has passed.`, 'error');
          return;
        }
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
        if (deadlinePassed && hasMealBeenRejected(student, date, meal)) {
          showToast(`Cannot accept ${mealName}: meal was already rejected and deadline has passed.`, 'error');
          return;
        }
        booking[meal] = true;
        const res = updateMealBookings(student.id, date, {
          breakfast: booking.breakfast,
          lunch: booking.lunch,
          snacks: booking.snacks,
          dinner: booking.dinner
        });

        if (res && res.success) {
          state.db = res.students;
          showToast(`${mealName} meal accepted!`, 'success');
          render();
        } else {
          showToast(res ? res.error : 'Failed to accept meal', 'error');
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

      // 24h deadline validation
      if (hasMealBookingDeadlinePassed(date)) {
        showToast('Cannot reject meal: the 8:00 AM deadline has passed.', 'error');
        return;
      }

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
        showToast(`${meal.charAt(0).toUpperCase() + meal.slice(1)} meal rejected successfully!`, 'success');
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
      <!-- Mobile Top Bar -->
      <div class="mobile-top-bar">
        <button id="mobile-toggle" class="mobile-menu-toggle" aria-label="Open navigation">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="mobile-top-bar-brand">
          ${ICONS.shield}
          <span>TRANSCEND HOSTEL</span>
        </div>
      </div>
      <!-- Sidebar Backdrop -->
      <div id="sidebar-backdrop" class="sidebar-backdrop"></div>

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
            ${ICONS.coffee} Meal Status
          </button>
          <button class="nav-item ${state.parentActiveTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            ${ICONS.users} Attendance & History
          </button>
          <button class="nav-item ${state.parentActiveTab === 'health' ? 'active' : ''}" data-tab="health">
            ${ICONS.shield} Child's Health Records
          </button>
          <button class="nav-item ${state.parentActiveTab === 'behaviour' ? 'active' : ''}" data-tab="behaviour">
            ${ICONS.clipboard} Behaviour Log
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
            <h1>${state.parentActiveTab === 'leave' ? 'Student Leave Application' : state.parentActiveTab === 'meals' ? "Ward's Meal Status" : state.parentActiveTab === 'health' ? "Child's Health Records" : state.parentActiveTab === 'behaviour' ? "Child's Behaviour Log" : "Attendance & History"}</h1>
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
          state.parentActiveTab === 'behaviour' ? renderBehaviourLogs(student, true) :
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
      const isOpen = sidebar.classList.toggle('mobile-open');
      const bd = document.getElementById('sidebar-backdrop');
      if (bd) bd.classList.toggle('active', isOpen);
    });
    const bd = document.getElementById('sidebar-backdrop');
    if (bd) bd.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      bd.classList.remove('active');
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
function renderMealActionButtons(student, dateStr, mealKey, mealName, isBooked, isReadOnly) {
  if (isReadOnly) {
    // Parent view: show acceptance status clearly
    const type = getMealAcceptanceType(student, dateStr, mealKey);
    if (type === 'manual') {
      return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#15803d;background:#dcfce7;padding:5px 10px;border-radius:20px;border:1px solid #bbf7d0;">✔ Accepted <span style="font-size:9px;background:#16a34a;color:#fff;padding:1px 5px;border-radius:4px;">MANUAL</span></span>`;
    }
    if (type === 'auto') {
      return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#1d4ed8;background:#dbeafe;padding:5px 10px;border-radius:20px;border:1px solid #bfdbfe;">✔ Accepted <span style="font-size:9px;background:#2563eb;color:#fff;padding:1px 5px;border-radius:4px;">AUTO</span></span>`;
    }
    if (type === 'rejected') {
      return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#b91c1c;background:#fee2e2;padding:5px 10px;border-radius:20px;border:1px solid #fca5a5;">✖ Rejected</span>`;
    }
    // opted-out (deadline not passed, not booked)
    return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#64748b;background:#f1f5f9;padding:5px 10px;border-radius:20px;border:1px solid #e2e8f0;">– Not Opted In</span>`;
  }

  const deadlinePassed = hasMealBookingDeadlinePassed(dateStr);
  const wasRejected = hasMealBeenRejected(student, dateStr, mealKey);

  if (deadlinePassed) {
    if (isBooked) {
      return `<span class="meal-status-label accepted">Accepted</span>`;
    }
    if (wasRejected) {
      return `<span class="meal-status-label rejected">Rejected</span>`;
    }
    return `
      <button class="meal-action-btn accept-btn meal-action-icon-btn book-btn"
              data-date="${dateStr}"
              data-meal="${mealKey}"
              data-meal-name="${mealName}"
              data-action="book">
        Accept
      </button>
    `;
  }

  if (isBooked) {
    return `
      <span class="meal-status-label accepted">Accepted</span>
      <button class="meal-action-btn reject-btn meal-action-icon-btn cancel-btn"
              data-date="${dateStr}"
              data-meal="${mealKey}"
              data-meal-name="${mealName}"
              data-action="cancel">
        Reject
      </button>
    `;
  }

  if (wasRejected) {
    return `
      <button class="meal-action-btn accept-btn meal-action-icon-btn book-btn"
              data-date="${dateStr}"
              data-meal="${mealKey}"
              data-meal-name="${mealName}"
              data-action="book">
        Accept
      </button>
      <span class="meal-status-label rejected">Rejected</span>
    `;
  }

  return `
    <button class="meal-action-btn accept-btn meal-action-icon-btn book-btn"
            data-date="${dateStr}"
            data-meal="${mealKey}"
            data-meal-name="${mealName}"
            data-action="book">
      Accept
    </button>
    <button class="meal-action-btn reject-btn meal-action-icon-btn cancel-btn"
            data-date="${dateStr}"
            data-meal="${mealKey}"
            data-meal-name="${mealName}"
            data-action="cancel">
      Reject
    </button>
  `;
}

function renderMealsPlanner(student, isReadOnly) {
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
    const deadlinePassed = hasMealBookingDeadlinePassed(dateStr);

    daysHTML += `
      <div class="meal-day-card ${onLeave ? 'on-leave' : ''}">
        <div class="meal-day-header">
          <div>
            <div class="meal-day-title">${offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : displayDate.split(',')[0]}</div>
            <div class="meal-day-date">${displayDate.split(',')[1]}</div>
            ${!onLeave && !isReadOnly ? `
              <div class="meal-deadline-note ${deadlinePassed ? 'passed' : ''}">
                ${deadlinePassed
                  ? 'Deadline passed (8:00 AM) — accept only'
                  : `Book or reject by ${formatMealBookingDeadline(dateStr)}`}
              </div>
            ` : ''}
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
                const isBooked = isMealBooked(student, dateStr, mealKey);
                return `
                  <div class="meal-option-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                    <div class="meal-label-info">
                      <span class="meal-name" style="font-weight: 700; color: var(--text-primary); display: block; font-size: 14px;">${mealName}</span>
                      <span style="font-size: 11px; color: var(--text-secondary); display: block; font-weight: 500; margin: 2px 0; max-width: 180px;">${mealMenu}</span>
                      <span class="meal-time" style="font-size: 11px; color: var(--text-muted); font-weight: 600;">${mealTime}</span>
                    </div>
                    <div class="meal-action-container" style="display: flex; align-items: center; gap: 8px;">
                      ${renderMealActionButtons(student, dateStr, mealKey, mealName, isBooked, isReadOnly)}
                    </div>
                  </div>
                `;
              };
              const dayMenu = getMenuForDate(dateStr);
              return [
                makeMealRow('Breakfast', 'breakfast', dayMenu.breakfast, '07:30 AM - 09:00 AM'),
                makeMealRow('Lunch',     'lunch',     dayMenu.lunch,     '12:30 PM - 02:00 PM'),
                makeMealRow('Snacks',    'snacks',    dayMenu.snacks,    '04:30 PM - 05:30 PM'),
                makeMealRow('Dinner',    'dinner',    dayMenu.dinner,    '07:30 PM - 09:00 PM')
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
        <span style="font-size:12px; color:var(--text-secondary);">${isReadOnly ? "View Only Mode (Parents cannot toggle child's meals)" : 'Accept or reject meals until 8:00 AM the day before'}</span>
      </div>

      ${isReadOnly ? `
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;gap:12px;align-items:flex-start;">
          ${ICONS.shield}
          <div>
            <h4 style="font-size:14px;font-weight:700;color:#1d4ed8;margin-bottom:4px;">Read-Only View — Meal Status</h4>
            <p style="font-size:13px;color:#1e40af;line-height:1.5;">This shows your ward's meal acceptance status for the next 7 days. 
              <span style="font-weight:700;color:#15803d;">✔ MANUAL</span> = your ward accepted it themselves &nbsp;·&nbsp;
              <span style="font-weight:700;color:#1d4ed8;">✔ AUTO</span> = auto-accepted after 8 AM deadline &nbsp;·&nbsp;
              <span style="font-weight:700;color:#b91c1c;">✖ Rejected</span> = opted out &nbsp;·&nbsp;
              <span style="font-weight:700;color:#64748b;">– Not Opted In</span> = not yet decided.
            </p>
          </div>
        </div>
      ` : `
        <div class="leave-alert-banner" style="margin-bottom: 20px;">
          ${ICONS.alert}
          <div>
            <h4>8:00 AM Meal Booking Policy</h4>
            <p>Until <strong>8:00 AM on the day before</strong>, you can <strong>Accept</strong> or <strong>Reject</strong> each meal. After 8:00 AM, only <strong>Accept</strong> remains available — reject is no longer allowed.</p>
          </div>
        </div>
      `}
      
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
            <div class="form-group-full" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-input); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 5px;">
              <div>
                <label class="form-label" style="margin: 0; font-weight: 600;">Overnight Stay?</label>
                <span style="font-size: 12px; color: var(--text-muted);">Will you be staying out of the hostel overnight?</span>
              </div>
              <div class="toggle-container">
                <input type="checkbox" id="leave-overnight" class="toggle-checkbox" checked>
                <label for="leave-overnight" class="toggle-switch-label">
                  <span class="toggle-switch-handle"></span>
                </label>
              </div>
            </div>
            <div>
              <label class="form-label" for="leave-start-date">Start Date</label>
              <input type="date" id="leave-start-date" class="form-input" required min="${getDateString(0)}">
            </div>
            <div id="end-date-container">
              <label class="form-label" for="leave-end-date">End Date</label>
              <input type="date" id="leave-end-date" class="form-input" required min="${getDateString(0)}">
            </div>
            <div>
              <label class="form-label" style="font-weight: 600;">Departure Time</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <select id="leave-start-hour" class="form-input" style="flex: 1; padding: 10px 8px; font-weight: 600;" required>
                  ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}" ${i + 1 === 9 ? 'selected' : ''}>${String(i + 1).padStart(2, '0')}</option>`).join('')}
                </select>
                <span style="font-weight: bold; color: var(--text-secondary);">:</span>
                <select id="leave-start-minute" class="form-input" style="flex: 1; padding: 10px 8px; font-weight: 600;" required>
                  ${Array.from({length: 60}, (_, i) => `<option value="${i}" ${i === 0 ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`).join('')}
                </select>
                <select id="leave-start-ampm" class="form-input" style="flex: 1.2; padding: 10px 8px; font-weight: 700;" required>
                  <option value="AM" selected>AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div>
              <label class="form-label" style="font-weight: 600;">Return Time</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <select id="leave-end-hour" class="form-input" style="flex: 1; padding: 10px 8px; font-weight: 600;" required>
                  ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}" ${i + 1 === 6 ? 'selected' : ''}>${String(i + 1).padStart(2, '0')}</option>`).join('')}
                </select>
                <span style="font-weight: bold; color: var(--text-secondary);">:</span>
                <select id="leave-end-minute" class="form-input" style="flex: 1; padding: 10px 8px; font-weight: 600;" required>
                  ${Array.from({length: 60}, (_, i) => `<option value="${i}" ${i === 0 ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`).join('')}
                </select>
                <select id="leave-end-ampm" class="form-input" style="flex: 1.2; padding: 10px 8px; font-weight: 700;" required>
                  <option value="AM">AM</option>
                  <option value="PM" selected>PM</option>
                </select>
              </div>
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
                <span class="history-dates">
                  ${formatDisplayDate(leave.startDate)} ${leave.startTime ? `(${formatTimeTo12Hr(leave.startTime)})` : ''} 
                  to 
                  ${formatDisplayDate(leave.endDate)} ${leave.endTime ? `(${formatTimeTo12Hr(leave.endTime)})` : ''}
                </span>
                <div style="display: flex; gap: 8px; margin-top: 2px; margin-bottom: 4px; align-items: center;">
                  <span style="font-size:11px; font-weight:600; color:var(--primary); text-transform:uppercase;">
                    Type: ${leave.type === 'outing' ? 'Going Out' : 'On Leave'}
                  </span>
                  <span style="font-size:10px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">
                    • ${leave.isOvernight ? 'Overnight' : 'Same Day'}
                  </span>
                </div>
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
  // Sync Overnight toggle and End Date visibility
  const overnightCheckbox = document.getElementById('leave-overnight');
  const endDateContainer = document.getElementById('end-date-container');
  const endDateInput = document.getElementById('leave-end-date');
  if (overnightCheckbox && endDateContainer && endDateInput) {
    const syncEndDateVisibility = () => {
      if (overnightCheckbox.checked) {
        endDateContainer.style.display = 'block';
        endDateInput.setAttribute('required', 'required');
      } else {
        endDateContainer.style.display = 'none';
        endDateInput.removeAttribute('required');
      }
    };
    syncEndDateVisibility();
    overnightCheckbox.addEventListener('change', syncEndDateVisibility);
  }

  // Leave Submit
  const leaveForm = document.getElementById('leave-request-form');
  if (leaveForm) {
    leaveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const startDate = document.getElementById('leave-start-date').value;
      const isOvernight = overnightCheckbox ? overnightCheckbox.checked : false;
      const endDate = isOvernight ? endDateInput.value : startDate;
      const startHour = document.getElementById('leave-start-hour').value;
      const startMin = document.getElementById('leave-start-minute').value;
      const startAmPm = document.getElementById('leave-start-ampm').value;
      const startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')} ${startAmPm}`;

      const endHour = document.getElementById('leave-end-hour').value;
      const endMin = document.getElementById('leave-end-minute').value;
      const endAmPm = document.getElementById('leave-end-ampm').value;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')} ${endAmPm}`;
      const type = document.getElementById('leave-type').value;
      const reason = document.getElementById('leave-reason').value;

      if (isOvernight && new Date(startDate) > new Date(endDate)) {
        showToast('End Date cannot be before Start Date.', 'error');
        return;
      }

      const res = applyLeave(state.currentStudentId, startDate, endDate, reason, type, role, startTime, endTime, isOvernight);
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
  const canEdit = role === 'admin' || role === 'superadmin';
  const records = student.healthRecords || [];
  const sortedRecords = [...records].reverse();

  // If in edit mode, retrieve the record
  let editingRecord = null;
  if (canEdit && state.editingHealthRecordId) {
    editingRecord = records.find(r => r.id === state.editingHealthRecordId);
  }

  return `
    <div class="dashboard-grid">
      ${canEdit ? `
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.shield} ${editingRecord ? 'Edit' : 'Add'} Health / Medical Record</h2>
        </div>
        <form id="health-status-form" style="display:flex; flex-direction:column; gap:15px; margin-top:15px;">
          <input type="hidden" id="health-record-id" value="${editingRecord ? editingRecord.id : ''}">
          <div>
            <label class="form-label">Current Symptoms</label>
            <input type="text" id="health-symptoms" class="form-input" placeholder="e.g., Fever, Cough, Headache" required value="${editingRecord ? editingRecord.symptoms : ''}">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
            <div>
              <label class="form-label">Body Temperature</label>
              <input type="text" id="health-temp" class="form-input" placeholder="e.g., 98.6°F" value="${editingRecord ? editingRecord.temperature : ''}">
            </div>
            <div>
              <label class="form-label">Current Status</label>
              <select id="health-status" class="form-input">
                <option value="Resting in Room" ${(editingRecord && editingRecord.status === 'Resting in Room') ? 'selected' : ''}>Resting in Room</option>
                <option value="Needs Medical Attention" ${(editingRecord && editingRecord.status === 'Needs Medical Attention') ? 'selected' : ''}>Needs Medical Attention</option>
                <option value="Visiting Hospital" ${(editingRecord && editingRecord.status === 'Visiting Hospital') ? 'selected' : ''}>Visiting Hospital</option>
                <option value="Recovered" ${(editingRecord && editingRecord.status === 'Recovered') ? 'selected' : ''}>Recovered / Normal</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label">Additional Notes</label>
            <textarea id="health-note" class="form-input" rows="2" placeholder="Any medication taken or extra details?">${editingRecord ? editingRecord.note : ''}</textarea>
          </div>
          <div style="display:flex; gap:10px; margin-top:10px;">
            <button type="submit" class="btn-primary" style="flex:1;">${editingRecord ? 'Update Health Record' : 'Add Health Record'}</button>
            ${editingRecord ? `
              <button type="button" id="btn-cancel-health-edit" class="btn-secondary" style="flex:1;">Cancel Edit</button>
            ` : ''}
          </div>
        </form>
      </div>
      ` : ''}

      <div class="dashboard-panel ${!canEdit ? 'dashboard-full' : ''}">
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
              
              ${canEdit ? `
                <div style="display:flex; gap:10px; margin-top:8px; justify-content:flex-end; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                  <button class="btn-edit-health" data-record-id="${r.id}" style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:12px; font-weight:600; padding:0;">Edit</button>
                  <button class="btn-delete-health" data-record-id="${r.id}" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:12px; font-weight:600; padding:0;">Delete</button>
                </div>
              ` : ''}
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
    
    ${renderHealthStatusSection(student, state.currentView)}
  `;
}

function attachHealthViewEvents() {
  const selectEl = document.getElementById('health-student-select');
  if (selectEl) {
    selectEl.addEventListener('change', (e) => {
      state.viewHealthStudentId = e.target.value;
      state.editingHealthRecordId = null; // Clear edit mode when changing student
      render();
    });
  }

  const healthForm = document.getElementById('health-status-form');
  if (healthForm) {
    healthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const isStaff = state.currentView === 'admin' || state.currentView === 'superadmin' || state.currentView === 'warden';
      const targetStudentId = isStaff 
        ? (state.viewHealthStudentId || (state.db[0] ? state.db[0].id : null))
        : state.currentStudentId;
        
      if (!targetStudentId) return;
      const student = state.db.find(s => s.id === targetStudentId);
      if (!student) return;

      if (!student.healthRecords) student.healthRecords = [];

      const recordIdInput = document.getElementById('health-record-id');
      const symptoms = document.getElementById('health-symptoms').value;
      const temperature = document.getElementById('health-temp').value;
      const status = document.getElementById('health-status').value;
      const note = document.getElementById('health-note').value;

      if (recordIdInput && recordIdInput.value) {
        // Edit existing record
        const record = student.healthRecords.find(r => r.id === recordIdInput.value);
        if (record) {
          record.symptoms = symptoms;
          record.temperature = temperature;
          record.status = status;
          record.note = note;
          showToast('Health status updated successfully!', 'success');
        }
      } else {
        // Add new record
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
        showToast('Health status added successfully!', 'success');
      }

      state.editingHealthRecordId = null;
      saveDB(state.db);
      render();
    });

    const cancelEditBtn = document.getElementById('btn-cancel-health-edit');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        state.editingHealthRecordId = null;
        render();
      });
    }
  }

  // Attach Edit/Delete buttons click events
  document.querySelectorAll('.btn-edit-health').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.editingHealthRecordId = e.target.dataset.recordId;
      render();
    });
  });

  document.querySelectorAll('.btn-delete-health').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const recordId = e.target.dataset.recordId;
      const isConfirmed = await showCustomConfirm(
        'Are you sure you want to delete this health record?',
        'Delete Health Record',
        'danger'
      );
      if (isConfirmed) {
        const isStaff = state.currentView === 'admin' || state.currentView === 'superadmin' || state.currentView === 'warden';
        const targetStudentId = isStaff 
          ? (state.viewHealthStudentId || (state.db[0] ? state.db[0].id : null))
          : state.currentStudentId;

        if (!targetStudentId) return;
        const student = state.db.find(s => s.id === targetStudentId);
        if (student && student.healthRecords) {
          student.healthRecords = student.healthRecords.filter(r => r.id !== recordId);
          if (state.editingHealthRecordId === recordId) {
            state.editingHealthRecordId = null;
          }
          saveDB(state.db);
          showToast('Health record deleted successfully!', 'success');
          render();
        }
      }
    });
  });
}

function getAllComplaints() {
  const list = [];
  state.db.forEach(student => {
    if (student.complaints) {
      student.complaints.forEach(c => {
        list.push({
          studentId: student.id,
          studentName: student.name,
          studentRoom: student.room,
          studentBlock: student.block,
          ...c
        });
      });
    }
  });
  return list.sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported));
}

function renderWardenComplaintsView() {
  const complaints = getAllComplaints();
  
  return `
    <div class="dashboard-panel dashboard-full">
      <div class="panel-header" style="justify-content:space-between;">
        <h2 class="panel-title">${ICONS.complaint} Student Complaints Desk</h2>
        <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">${complaints.length} Total Complaints</span>
      </div>
      
      <div style="margin-top:20px; display:grid; grid-template-columns: 1fr; gap:15px; max-height: 600px; overflow-y: auto; padding-right: 5px;">
        ${complaints.length === 0 ? `
          <div class="empty-state">
            ${ICONS.check}
            <p>No complaints reported. Everything is perfect!</p>
          </div>
        ` : complaints.map(c => `
          <div style="background:#f9fafb; border:1px solid var(--border-color); border-radius:8px; padding:20px; display:flex; flex-direction:column; gap:10px; position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
              <div>
                <span class="badge" style="background:#f3f4f6; color:var(--text-primary); font-size:10px; font-weight:700; margin-bottom:4px; display:inline-block; text-transform:uppercase;">
                  ${c.category}
                </span>
                <h4 style="margin:2px 0; font-size:16px; font-weight:700; color:var(--text-primary);">${c.subject}</h4>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Reported by <strong>${c.studentName} (${c.studentId})</strong> • Room ${c.studentRoom} (Block ${c.studentBlock})
                </div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                  Complaint ID: ${c.id} • Reported on ${formatDisplayDate(c.dateReported)}
                </div>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                <span class="badge ${c.status.toLowerCase() === 'pending' ? 'pending' : 'approved'}" style="font-size:12px; padding:4px 10px; font-weight:700;">
                  ${c.status}
                </span>
                ${c.status.toLowerCase() === 'pending' ? `
                  <button class="btn-close-complaint" data-student-id="${c.studentId}" data-complaint-id="${c.id}" style="padding:6px 12px; font-size:12px; font-weight:600; background:#10b981; border:1px solid #10b981; color:white; border-radius:4px; cursor:pointer;">
                    Resolve &amp; Close
                  </button>
                ` : ''}
              </div>
            </div>
            <div style="background:#fff; border:1px solid var(--border-color); padding:12px; border-radius:6px; font-size:13px; color:var(--text-secondary); line-height:1.45; font-style:italic; border-left:3px solid var(--primary);">
              "${c.details}"
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function attachWardenComplaintsEvents() {
  document.querySelectorAll('.btn-close-complaint').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const studentId = e.target.dataset.studentId;
      const complaintId = e.target.dataset.complaintId;
      
      const isConfirmed = await showCustomConfirm(
        'Are you sure you want to mark this complaint as resolved and close it?',
        'Resolve & Close Request',
        'success'
      );
      if (isConfirmed) {
        const student = state.db.find(s => s.id === studentId);
        if (student && student.complaints) {
          const complaint = student.complaints.find(c => c.id === complaintId);
          if (complaint) {
            complaint.status = 'Closed';
            saveDB(state.db);
            showToast('Complaint resolved and closed successfully!', 'success');
            render();
          }
        }
      }
    });
  });
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
  return `
    <div class="dashboard-layout">
      <!-- Mobile Top Bar -->
      <div class="mobile-top-bar">
        <button id="mobile-toggle" class="mobile-menu-toggle" aria-label="Open navigation">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="mobile-top-bar-brand">
          ${ICONS.shield}
          <span>TRANSCEND HOSTEL</span>
        </div>
      </div>
      <!-- Sidebar Backdrop -->
      <div id="sidebar-backdrop" class="sidebar-backdrop"></div>

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
          <button class="nav-item ${state.wardenActiveTab === 'leaves' ? 'active' : ''}" data-tab="leaves">
            ${ICONS.calendar} Student Leave Database
          </button>
          <button class="nav-item ${state.wardenActiveTab === 'dining' ? 'active' : ''}" data-tab="dining">
            ${ICONS.coffee} Meal Data
          </button>
          <button class="nav-item ${state.wardenActiveTab === 'behaviour' ? 'active' : ''}" data-tab="behaviour">
            ${ICONS.clipboard} Behaviour Log
          </button>
          <button class="nav-item ${state.wardenActiveTab === 'complaints' ? 'active' : ''}" data-tab="complaints">
            ${ICONS.complaint} Student Complaints
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
            <h1>${state.wardenActiveTab === 'leaves' ? 'Student Leave Database' : state.wardenActiveTab === 'dining' ? 'Meal Data' : state.wardenActiveTab === 'complaints' ? 'Student Complaints Desk' : 'Student Behaviour Log'}</h1>
            <p>Warden Control Panel • Leave, Dining &amp; Behaviour</p>
          </div>
        </header>

        ${state.wardenActiveTab === 'leaves' ? renderWardenLeaves() : state.wardenActiveTab === 'dining' ? renderWardenDining() : state.wardenActiveTab === 'complaints' ? renderWardenComplaintsView() : renderBehaviourLogsRegister()}
      </main>
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
                  <div style="display: flex; gap: 6px; align-items: center; margin-top:2px;">
                    <span style="font-size:11px; font-weight:600; color:var(--primary); text-transform:uppercase;">
                      ${req.type === 'outing' ? 'Going Out' : 'On Leave'}
                    </span>
                    <span style="font-size:10px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">
                      • ${req.isOvernight ? 'Overnight' : 'Same Day'}
                    </span>
                  </div>
                </div>
                <span class="approval-dates">
                  ${formatDisplayDate(req.startDate)} ${req.startTime ? `(${formatTimeTo12Hr(req.startTime)})` : ''}<br>
                  to ${formatDisplayDate(req.endDate)} ${req.endTime ? `(${formatTimeTo12Hr(req.endTime)})` : ''}
                </span>
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
  const year = state.calendarYear;
  const month = state.calendarMonth; // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const numberOfDays = new Date(year, month + 1, 0).getDate();

  // Create dates list
  const days = [];
  
  // Previous month padding days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      dateStr: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`
    });
  }

  // Current month days
  for (let i = 1; i <= numberOfDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  // Next month padding days to make grid complete weeks
  const totalSlots = Math.ceil(days.length / 7) * 7;
  const nextMonthPadding = totalSlots - days.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      dateStr: `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  // Selected date leaves list
  const selectedDateStr = state.calendarSelectedDate;

  const getLeavesForDate = (dateStr) => {
    const list = [];
    state.db.forEach(student => {
      student.leaves.forEach(leave => {
        if (leave.type === 'leave' && leave.status === 'approved') {
          if (dateStr >= leave.startDate && dateStr <= leave.endDate) {
            list.push({
              studentId: student.id,
              studentName: student.name,
              studentRoom: student.room,
              ...leave
            });
          }
        }
      });
    });
    return list;
  };

  const selectedDateLeaves = getLeavesForDate(selectedDateStr);

  // Render Calendar Grid HTML
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekHeadersHTML = daysOfWeek.map(d => `<div class="calendar-week-header">${d}</div>`).join('');

  const gridDaysHTML = days.map(d => {
    const dateLeaves = getLeavesForDate(d.dateStr);
    const hasLeaves = dateLeaves.length > 0;
    
    // Check if this day is the selected date
    const isSelected = d.dateStr === selectedDateStr;
    const isToday = d.dateStr === getDateString(0);

    const leafPills = dateLeaves.slice(0, 2).map(l => {
      const badgeStyle = 'background: #fff5f5; color: #e53e3e; border: 1px solid #fed7d7;';
      return `<div class="calendar-leaf-pill" style="font-size: 10px; padding: 2px 4px; border-radius: 4px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; ${badgeStyle}" title="${l.studentName} (Absent)">
        ${l.studentName.split(' ')[0]}
      </div>`;
    }).join('');

    const moreIndicator = dateLeaves.length > 2 
      ? `<div style="font-size: 9px; color: var(--text-muted); font-weight: 700; margin-top: 1px; padding-left: 2px;">+${dateLeaves.length - 2} more</div>` 
      : '';

    const dayClass = `calendar-day-cell ${d.isCurrentMonth ? 'current-month' : 'other-month'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasLeaves ? 'has-leaves' : ''}`;

    return `
      <div class="${dayClass}" data-date="${d.dateStr}">
        <span class="day-number">${d.day}</span>
        <div class="calendar-leaf-container">
          ${leafPills}
          ${moreIndicator}
        </div>
      </div>
    `;
  }).join('');

  const selectedDateFormatted = formatDisplayDate(selectedDateStr);

  const leavesDetailHTML = selectedDateLeaves.length === 0
    ? `<div class="empty-state" style="padding: 20px; text-align: center;">
         <span style="font-size: 24px;">✓</span>
         <p style="margin-top: 5px; color: var(--text-secondary);">No students absent on ${selectedDateFormatted}</p>
       </div>`
    : selectedDateLeaves.map(l => `
        <div class="calendar-leave-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div>
            <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${l.studentName} <span style="font-size:11px; font-weight:500; color:var(--text-muted);">(${l.studentId} • Room ${l.studentRoom})</span></div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              <strong>Departure:</strong> ${formatDisplayDate(l.startDate)} ${l.startTime ? `at ${formatTimeTo12Hr(l.startTime)}` : ''} <br>
              <strong>Return:</strong> ${formatDisplayDate(l.endDate)} ${l.endTime ? `at ${formatTimeTo12Hr(l.endTime)}` : ''}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-top: 4px;">"${l.reason}"</div>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
            <span class="badge ${l.status}" style="font-size: 10px; padding: 4px 8px;">${l.status === 'pending' ? 'Pending Parent' : l.status}</span>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">${l.type === 'outing' ? 'Day Outing' : 'On Leave'}</span>
          </div>
        </div>
      `).join('');

  return `
    <div class="dashboard-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; width: 100%;">
      <!-- Calendar Panel -->
      <div class="dashboard-panel">
        <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h2 class="panel-title">${ICONS.calendar} Leave &amp; Absence Calendar</h2>
          
          <div class="calendar-controls" style="display: flex; align-items: center; gap: 8px;">
            <button id="btn-calendar-prev" class="btn-secondary" style="padding: 4px 8px; font-weight: bold;">&lt;</button>
            <span style="font-weight: 700; font-size: 15px; min-width: 120px; text-align: center;">${monthNames[month]} ${year}</span>
            <button id="btn-calendar-next" class="btn-secondary" style="padding: 4px 8px; font-weight: bold;">&gt;</button>
          </div>
        </div>

        <div class="calendar-grid">
          ${weekHeadersHTML}
          ${gridDaysHTML}
        </div>
      </div>

      <!-- Selected Date Absence Details Panel -->
      <div class="dashboard-panel">
        <div class="panel-header">
          <h2 class="panel-title">${ICONS.users} Absences on ${selectedDateFormatted}</h2>
        </div>
        
        <div class="calendar-detail-list" style="margin-top: 15px; max-height: 400px; overflow-y: auto;">
          ${leavesDetailHTML}
        </div>
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
      const isOpen = sidebar.classList.toggle('mobile-open');
      const bd = document.getElementById('sidebar-backdrop');
      if (bd) bd.classList.toggle('active', isOpen);
    });
    const bd = document.getElementById('sidebar-backdrop');
    if (bd) bd.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      bd.classList.remove('active');
    });
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-item').dataset.tab;
      state.wardenActiveTab = tab;
      if (sidebar) sidebar.classList.remove('mobile-open');
      const bd = document.getElementById('sidebar-backdrop');
      if (bd) bd.classList.remove('active');
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

  if (state.wardenActiveTab === 'dining') attachWardenDiningEvents();
  if (state.wardenActiveTab === 'leaves') attachCalendarEvents();
  if (state.wardenActiveTab === 'behaviour') attachBehaviourRegisterEvents();
  if (state.wardenActiveTab === 'complaints') attachWardenComplaintsEvents();
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
  // 7-day menu planner
  const menuStore  = getMenuStore();
  const activeDay  = state.adminMenuDay; // 0 = default, 1-7 = offset
  const activeDateStr = activeDay === 0 ? null : getDateString(activeDay - 1);
  const activeMenu = activeDateStr ? (menuStore[activeDateStr] || menuStore['default'] || DEFAULT_MENU)
                                   : (menuStore['default'] || DEFAULT_MENU);
  const hasOverride = (dateStr) => dateStr && !!menuStore[dateStr] && menuStore[dateStr] !== menuStore['default'];

  const DAY_NAMES = ['Default', 'Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  const menuTabsHTML = DAY_NAMES.map((name, idx) => {
    const dateStr = idx === 0 ? null : getDateString(idx - 1);
    const overrideExists = idx > 0 && !!menuStore[dateStr];
    const shortDate = dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '';
    return `
      <button class="menu-day-tab ${activeDay === idx ? 'active' : ''}" data-menu-day="${idx}">
        ${name}${shortDate ? `<span style="display:block;font-size:9px;opacity:0.75;">${shortDate}</span>` : ''}
        ${overrideExists ? `<span class="menu-override-dot" title="Custom menu set"></span>` : ''}
      </button>`;
  }).join('');

  const menuPanelHTML = `
    <div class="dashboard-panel dashboard-full">
      <div class="panel-header" style="margin-bottom:0;">
        <h2 class="panel-title">${ICONS.coffee} 7-Day Mess Menu Planner</h2>
        <span style="font-size:12px;color:var(--text-secondary);">Set a default menu, then override specific days</span>
      </div>

      <div class="menu-day-tabs-row">
        ${menuTabsHTML}
      </div>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#1e40af;">
        ${activeDay === 0
          ? `<strong>Default Menu</strong> — applies to every day that doesn't have a custom override. Any day you leave uncustomised will show this menu.`
          : `<strong>${DAY_NAMES[activeDay]}</strong> menu${menuStore[activeDateStr] ? ` · <span style="color:#15803d;font-weight:700;">Custom override active</span>` : ` — currently showing the default menu. Save below to create an override.`}`}
      </div>

      <form id="admin-menu-form" style="display:flex;flex-direction:column;gap:18px;">
        <input type="hidden" id="menu-day-key" value="${activeDateStr || 'default'}">
        <div class="form-grid" style="grid-template-columns:1fr 1fr;gap:16px;">
          <div class="form-group-full">
            <label class="form-label" style="font-weight:700;">☀️ Breakfast &nbsp;<span style="font-size:11px;font-weight:500;color:var(--text-muted);">07:30 AM – 09:00 AM</span></label>
            <textarea id="menu-breakfast" class="form-textarea" style="height:60px;">${activeMenu.breakfast || ''}</textarea>
          </div>
          <div class="form-group-full">
            <label class="form-label" style="font-weight:700;">🌤️ Lunch &nbsp;<span style="font-size:11px;font-weight:500;color:var(--text-muted);">12:30 PM – 02:00 PM</span></label>
            <textarea id="menu-lunch" class="form-textarea" style="height:60px;">${activeMenu.lunch || ''}</textarea>
          </div>
          <div class="form-group-full">
            <label class="form-label" style="font-weight:700;">🌙 Snacks &nbsp;<span style="font-size:11px;font-weight:500;color:var(--text-muted);">04:30 PM – 05:30 PM</span></label>
            <textarea id="menu-snacks" class="form-textarea" style="height:60px;">${activeMenu.snacks || ''}</textarea>
          </div>
          <div class="form-group-full">
            <label class="form-label" style="font-weight:700;">🌃 Dinner &nbsp;<span style="font-size:11px;font-weight:500;color:var(--text-muted);">07:30 PM – 09:00 PM</span></label>
            <textarea id="menu-dinner" class="form-textarea" style="height:60px;">${activeMenu.dinner || ''}</textarea>
          </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <button type="submit" class="btn-primary" style="padding:12px 24px;font-weight:700;">
            ${ICONS.check} Save ${activeDay === 0 ? 'Default Menu' : DAY_NAMES[activeDay] + ' Menu'}
          </button>
          ${activeDay > 0 && menuStore[activeDateStr] ? `
            <button type="button" id="btn-reset-day-menu" class="btn-secondary" style="padding:12px 20px;color:#ef4444;border-color:rgba(239,68,68,0.3);">
              ${ICONS.x} Reset to Default
            </button>` : ''}
        </div>
      </form>
    </div>`;

  return `
    <div class="dashboard-layout">
      <!-- Mobile Top Bar -->
      <div class="mobile-top-bar">
        <button id="mobile-toggle" class="mobile-menu-toggle" aria-label="Open navigation">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="mobile-top-bar-brand">
          ${ICONS.settings}
          <span>TRANSCEND HOSTEL</span>
        </div>
      </div>
      <!-- Sidebar Backdrop -->
      <div id="sidebar-backdrop" class="sidebar-backdrop"></div>

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
          <button class="nav-item ${state.adminActiveTab === 'dining' ? 'active' : ''}" data-tab="dining">
            ${ICONS.coffee} Meal Data
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
          <button class="nav-item ${state.adminActiveTab === 'behaviour' ? 'active' : ''}" data-tab="behaviour">
            ${ICONS.clipboard} Behaviour Register
          </button>
          <button class="nav-item ${state.adminActiveTab === 'complaints' ? 'active' : ''}" data-tab="complaints">
            ${ICONS.complaint} Student Complaints
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
            <h1>${state.adminActiveTab === 'menu' ? 'Mess Menu Management' : state.adminActiveTab === 'dining' ? 'Meal Data & Acceptance' : state.adminActiveTab === 'leaves' ? 'Student Absence Registry' : state.adminActiveTab === 'attendance' ? 'Gate & Attendance' : state.adminActiveTab === 'health' ? 'Health & Medical Logs' : state.adminActiveTab === 'behaviour' ? 'Student Behaviour Register' : state.adminActiveTab === 'complaints' ? 'Student Complaints Desk' : 'Student Directory'}</h1>
            <p>Admin Control Panel • 5 Student Capacity</p>
          </div>
          
          <div style="display:flex; gap:10px;">
            ${state.adminActiveTab === 'directory' ? `<button class="btn-primary" id="btn-add-student-modal">${ICONS.plus} Add Student</button>` : ''}
          </div>
        </header>

        ${state.adminActiveTab === 'menu' ? menuPanelHTML : state.adminActiveTab === 'dining' ? renderWardenDining() : state.adminActiveTab === 'leaves' ? renderWardenLeaves() : state.adminActiveTab === 'attendance' ? renderWardenAttendanceView() : state.adminActiveTab === 'health' ? renderWardenHealthView() : state.adminActiveTab === 'behaviour' ? renderBehaviourLogsRegister() : state.adminActiveTab === 'complaints' ? renderWardenComplaintsView() : renderWardenDirectory()}
      </main>



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
      const isOpen = sidebar.classList.toggle('mobile-open');
      const bd = document.getElementById('sidebar-backdrop');
      if (bd) bd.classList.toggle('active', isOpen);
    });
    const bd = document.getElementById('sidebar-backdrop');
    if (bd) bd.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      bd.classList.remove('active');
    });
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-item').dataset.tab;
      state.adminActiveTab = tab;
      if (sidebar) sidebar.classList.remove('mobile-open');
      const bd = document.getElementById('sidebar-backdrop');
      if (bd) bd.classList.remove('active');
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

  // Menu day tab switching
  document.querySelectorAll('.menu-day-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.adminMenuDay = parseInt(btn.dataset.menuDay, 10);
      render();
    });
  });

  const menuForm = document.getElementById('admin-menu-form');
  if (menuForm) {
    menuForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const key = document.getElementById('menu-day-key').value; // 'default' or 'YYYY-MM-DD'
      const store = getMenuStore();
      store[key] = {
        breakfast: document.getElementById('menu-breakfast').value,
        lunch:     document.getElementById('menu-lunch').value,
        snacks:    document.getElementById('menu-snacks').value,
        dinner:    document.getElementById('menu-dinner').value
      };
      saveMenuStore(store);
      showToast(key === 'default' ? 'Default menu updated!' : `Menu for ${key} saved!`, 'success');
      render();
    });
  }

  const resetDayBtn = document.getElementById('btn-reset-day-menu');
  if (resetDayBtn) {
    resetDayBtn.addEventListener('click', () => {
      const key = document.getElementById('menu-day-key').value;
      if (key === 'default') return;
      const store = getMenuStore();
      delete store[key];
      saveMenuStore(store);
      showToast(`Custom menu for ${key} removed. Default menu will be shown.`, 'info');
      render();
    });
  }

  if (state.adminActiveTab === 'health') attachHealthViewEvents();
  if (state.adminActiveTab === 'attendance') attachAttendanceViewEvents();
  if (state.adminActiveTab === 'behaviour') attachBehaviourRegisterEvents();
  if (state.adminActiveTab === 'dining') attachWardenDiningEvents();
  if (state.adminActiveTab === 'complaints') attachWardenComplaintsEvents();

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
        const studentId = e.target.closest('.btn-view-student').dataset.stuId;
        showStudentDetailModal(studentId);
      });
    });

    if (state.adminActiveTab === 'health') attachHealthViewEvents();
    if (state.adminActiveTab === 'attendance') attachAttendanceViewEvents();
    if (state.adminActiveTab === 'behaviour') attachBehaviourRegisterEvents();
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
  if (state.adminActiveTab === 'leaves') attachCalendarEvents();
}

// View template: SUPER ADMIN DASHBOARD
function renderSuperadminDashboard() {
  const adminUsers = [
    { name: "Siddharth K T", role: "Superadmin", pin: "Hidden", id: "SAD-02" },
    { name: "Shwetha S", role: "Superadmin", pin: "Hidden", id: "SAD-03" },
    { name: "Chief Warden Console", role: "Warden", pin: "Password", id: "WDN-01" },
    { name: "Campus Admin Console", role: "Admin", pin: "5678", id: "ADM-01" },
    { name: "Super Admin Control", role: "Superadmin", pin: "9999", id: "SAD-01" }
  ];

  return `
    <div class="dashboard-layout">
      <!-- Mobile Top Bar -->
      <div class="mobile-top-bar">
        <button id="mobile-toggle" class="mobile-menu-toggle" aria-label="Open navigation">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="mobile-top-bar-brand">
          ${ICONS.key}
          <span>TRANSCEND HOSTEL</span>
        </div>
      </div>
      <!-- Sidebar Backdrop -->
      <div id="sidebar-backdrop" class="sidebar-backdrop"></div>

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
          <button class="nav-item ${state.superActiveTab === 'behaviour' ? 'active' : ''}" data-tab="behaviour">
            ${ICONS.clipboard} Behaviour Register
          </button>
          <button class="nav-item ${state.superActiveTab === 'dining' ? 'active' : ''}" data-tab="dining">
            ${ICONS.coffee} Meal Data
          </button>
          <button class="nav-item ${state.superActiveTab === 'complaints' ? 'active' : ''}" data-tab="complaints">
            ${ICONS.complaint} Student Complaints
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
            <h1>${state.superActiveTab === 'dashboard' ? 'Master System Dashboard' : state.superActiveTab === 'logs' ? 'System Activity Logs' : state.superActiveTab === 'directory' ? 'Student Directory' : state.superActiveTab === 'attendance' ? 'Gate & Attendance' : state.superActiveTab === 'health' ? 'Health & Medical Logs' : state.superActiveTab === 'behaviour' ? 'Student Behaviour Register' : state.superActiveTab === 'dining' ? 'Meal Data & Acceptance' : state.superActiveTab === 'complaints' ? 'Student Complaints Desk' : 'Database Maintenance'}</h1>
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
        ` : state.superActiveTab === 'dining' ? renderWardenDining() : state.superActiveTab === 'directory' ? renderWardenDirectory() : state.superActiveTab === 'attendance' ? renderWardenAttendanceView() : state.superActiveTab === 'health' ? renderWardenHealthView() : state.superActiveTab === 'behaviour' ? renderBehaviourLogsRegister() : state.superActiveTab === 'complaints' ? renderWardenComplaintsView() : ''}
      </main>
    </div>
  `;
}

function attachSuperadminEvents() {
  const sidebar = document.getElementById('dashboard-sidebar');
  const mobileToggle = document.getElementById('mobile-toggle');
  
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('mobile-open');
      const bd = document.getElementById('sidebar-backdrop');
      if (bd) bd.classList.toggle('active', isOpen);
    });
    const bd = document.getElementById('sidebar-backdrop');
    if (bd) bd.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      bd.classList.remove('active');
    });
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-item').dataset.tab;
      state.superActiveTab = tab;
      if (sidebar) sidebar.classList.remove('mobile-open');
      const bd = document.getElementById('sidebar-backdrop');
      if (bd) bd.classList.remove('active');
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
  if (state.superActiveTab === 'behaviour') attachBehaviourRegisterEvents();
  if (state.superActiveTab === 'dining') attachWardenDiningEvents();
  if (state.superActiveTab === 'complaints') attachWardenComplaintsEvents();
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

  // btn-view-student from superadmin directory
  document.querySelectorAll('.btn-view-student').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.target.closest('.btn-view-student').dataset.stuId;
      showStudentDetailModal(studentId);
    });
  });

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

// Renders the behaviour logs list section
function renderBehaviourLogs(student, isReadOnly) {
  const logs = student.behaviourLogs || [];
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'positive': return 'badge approved';
      case 'warning': return 'badge pending';
      case 'critical': return 'badge rejected';
      default: return 'badge info';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'positive': return 'Commendable';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'General';
    }
  };

  const logsHTML = sortedLogs.length === 0 
    ? `<div style="text-align: center; padding: 40px 20px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
         <span style="font-size: 32px; display: block; margin-bottom: 12px;">📋</span>
         No behaviour logs or observations recorded.
       </div>`
    : sortedLogs.map(log => `
        <div style="border-left: 4px solid ${
          log.severity === 'positive' ? 'var(--success)' : 
          log.severity === 'warning' ? 'var(--warning)' : 
          log.severity === 'critical' ? 'var(--danger)' : 'var(--text-muted)'
        }; background: var(--bg-card); padding: 16px 20px; margin-bottom: 12px; border-radius: var(--radius-sm); border-top: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">${formatDisplayDate(log.date)}</span>
              <span class="${getSeverityBadgeClass(log.severity)}" style="font-size: 10px; margin-left: 8px; text-transform: uppercase; padding: 2px 6px;">${getSeverityLabel(log.severity)}</span>
            </div>
            ${!isReadOnly ? `
              <div style="display: flex; gap: 8px;">
                <button class="btn-edit-log" data-log-id="${log.id}" style="background: none; border: none; color: var(--primary); cursor: pointer; font-size: 12px; font-weight: 600; padding: 2px;">Edit</button>
                <button class="btn-delete-log" data-log-id="${log.id}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 12px; font-weight: 600; padding: 2px;">Delete</button>
              </div>
            ` : ''}
          </div>
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Category: ${log.category}</div>
          <p style="font-size: 13.5px; color: var(--text-primary); margin: 0; line-height: 1.45;">${log.description}</p>
          <div style="font-size: 11px; color: var(--text-secondary); text-align: right; font-style: italic; margin-top: 4px;">
            Recorded by: ${log.recordedBy || 'System'}
          </div>
        </div>
      `).join('');

  return `
    <div class="dashboard-panel">
      <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
        <div>
          <h2 class="panel-title" style="display:flex; align-items:center; gap:8px;">${ICONS.clipboard} Behaviour &amp; Observation Log</h2>
          <p style="font-size:12px; color:var(--text-secondary); margin-top: 2px;">Official records of student conduct and commendations</p>
        </div>
        ${!isReadOnly ? `
          <button id="btn-add-log" class="btn-primary" style="padding: 8px 16px; font-size: 13px; font-weight: 600;">
            + Add Log Entry
          </button>
        ` : ''}
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 4px;">
        ${logsHTML}
      </div>
    </div>
  `;
}

// Unified detail modal display for Warden, Admin, and Superadmin
function showStudentDetailModal(studentId) {
  const student = state.db.find(s => s.id === studentId);
  if (!student) return;

  const detailModal = document.getElementById('student-detail-modal');
  const modalName = document.getElementById('modal-student-name');
  const modalContent = document.getElementById('modal-student-content');

  if (!detailModal || !modalName || !modalContent) return;

  modalName.innerText = `Student Profile: ${student.name}`;

  const activeTodayOnLeave = isStudentOnLeave(student, getDateString(0));

  const leavesHTML = student.leaves.length === 0 
    ? '<p style="font-size:13px; color:var(--text-muted); text-align:center; padding:10px;">No leave requests registered.</p>'
    : student.leaves.map(l => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-input); padding:8px 12px; border-radius:4px; font-size:13px; margin-bottom:4px;">
          <span>
            <strong>${formatDisplayDate(l.startDate)} ${l.startTime ? `(${formatTimeTo12Hr(l.startTime)})` : ''} - ${formatDisplayDate(l.endDate)} ${l.endTime ? `(${formatTimeTo12Hr(l.endTime)})` : ''}</strong><br>
            <span style="font-size:10px; font-weight:600; color:var(--primary); text-transform:uppercase; display:block; margin:2px 0;">Type: ${l.type === 'outing' ? 'Going Out' : 'On Leave'} • ${l.isOvernight ? 'Overnight' : 'Same Day'}</span>
            <span style="font-size:11px; color:var(--text-secondary);">"${l.reason}"</span>
          </span>
          <span class="badge ${l.status}" style="font-size:10px; padding:3px 8px;">${l.status}</span>
        </div>
      `).join('');

  const mealsHTML = student.mealBookings.length === 0
    ? '<p style="font-size:13px; color:var(--text-muted); text-align:center; padding:10px;">No meals booked for the upcoming week.</p>'
    : student.mealBookings.map(b => {
        const activeMeals = [
          isMealBooked(student, b.date, 'breakfast') ? 'Breakfast' : '',
          isMealBooked(student, b.date, 'lunch') ? 'Lunch' : '',
          isMealBooked(student, b.date, 'snacks') ? 'Snacks' : '',
          isMealBooked(student, b.date, 'dinner') ? 'Dinner' : ''
        ].filter(Boolean);
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-input); padding:8px 12px; border-radius:4px; font-size:13px; margin-bottom:6px;">
            <span><strong>${formatDisplayDate(b.date)}</strong></span>
            <span style="font-size:11px; color:var(--primary);">
              ${activeMeals.join(', ') || 'No Meals Selected'}
            </span>
          </div>
        `;
      }).join('');

  const isReadOnly = (state.currentView === 'warden');
  const logs = student.behaviourLogs || [];
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'positive': return 'badge approved';
      case 'warning': return 'badge pending';
      case 'critical': return 'badge rejected';
      default: return 'badge info';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'positive': return 'Commendable';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'General';
    }
  };

  const logsHTML = sortedLogs.length === 0
    ? `<p style="font-size:13px; color:var(--text-muted); text-align:center; padding:20px; border:1px dashed var(--border-color); border-radius:6px;">No behaviour records found.</p>`
    : sortedLogs.map(log => `
        <div style="background:var(--bg-input); border-left: 4px solid ${
          log.severity === 'positive' ? 'var(--success)' : 
          log.severity === 'warning' ? 'var(--warning)' : 
          log.severity === 'critical' ? 'var(--danger)' : 'var(--text-muted)'
        }; padding:10px 14px; border-radius:4px; font-size:13px; margin-bottom:8px; display:flex; flex-direction:column; gap:4px; border-top:1px solid var(--border-color); border-right:1px solid var(--border-color); border-bottom:1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>
              <strong>${formatDisplayDate(log.date)}</strong>
              <span class="${getSeverityBadgeClass(log.severity)}" style="font-size:9px; padding:2px 5px; margin-left:6px; text-transform:uppercase;">${getSeverityLabel(log.severity)}</span>
            </span>
            ${!isReadOnly ? `
              <div style="display:flex; gap:8px;">
                <button class="btn-edit-log" data-log-id="${log.id}" style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:11px; font-weight:600; padding:0;">Edit</button>
                <button class="btn-delete-log" data-log-id="${log.id}" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:11px; font-weight:600; padding:0;">Delete</button>
              </div>
            ` : ''}
          </div>
          <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Category: ${log.category}</div>
          <p style="margin:2px 0; color:var(--text-primary); line-height:1.35;">${log.description}</p>
          <div style="font-size:10px; color:var(--text-secondary); text-align:right; font-style:italic;">By: ${log.recordedBy || 'System'}</div>
        </div>
      `).join('');

  modalContent.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
      <div>
        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Roll Number</span><br>
        <strong>${student.id}</strong>
      </div>
      <div>
        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Room &amp; Block</span><br>
        <strong>Room ${student.room} (Block ${student.block})</strong>
      </div>
      <div>
        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Email Address</span><br>
        <span style="font-size:13px;">${student.email}</span>
      </div>
      <div>
        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Phone Number</span><br>
        <span style="font-size:13px;">${student.phone}</span>
      </div>
      <div style="grid-column:span 2; margin-top:4px;">
        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Mess Status Today</span><br>
        ${activeTodayOnLeave 
          ? '<span class="badge rejected" style="font-size:10px; padding:3px 8px; margin-top:2px; display:inline-block;">On Leave - Mess Closed</span>' 
          : '<span class="badge approved" style="font-size:10px; padding:3px 8px; margin-top:2px; display:inline-block;">Present - Mess Active</span>'}
      </div>
    </div>
    
    <div style="max-height: 140px; overflow-y: auto; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
      <h4 style="font-size:13px; margin: 8px 0; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.5px;">Leaves History</h4>
      <div style="display:flex; flex-direction:column; gap:4px;">
        ${leavesHTML}
      </div>
    </div>

    <div style="max-height: 140px; overflow-y: auto; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
      <h4 style="font-size:13px; margin: 8px 0; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.5px;">Meal Bookings Log</h4>
      <div style="display:flex; flex-direction:column; gap:4px;">
        ${mealsHTML}
      </div>
    </div>

    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin: 8px 0;">
        <h4 style="font-size:13px; margin:0; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.5px;">Behaviour &amp; Observation Log</h4>
        ${!isReadOnly ? `
          <button id="btn-add-log" class="btn-primary" style="padding:4px 8px; font-size:11px; font-weight:600;">+ Add Entry</button>
        ` : ''}
      </div>
      <div style="max-height: 160px; overflow-y:auto; display:flex; flex-direction:column; gap:4px;">
        ${logsHTML}
      </div>
    </div>
  `;

  detailModal.classList.add('active');

  // Attach Behaviour Log interactions inside modal
  if (!isReadOnly) {
    const addBtn = document.getElementById('btn-add-log');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        document.getElementById('behaviour-modal-title').innerText = "Add Behaviour Log";
        document.getElementById('behaviour-log-id').value = "";
        document.getElementById('behaviour-student-id').value = student.id;
        document.getElementById('behaviour-date').value = getDateString(0);
        document.getElementById('behaviour-category').value = "General";
        document.getElementById('behaviour-severity').value = "neutral";
        document.getElementById('behaviour-description').value = "";
        document.getElementById('behaviour-log-modal').classList.add('active');
      });
    }

    modalContent.querySelectorAll('.btn-edit-log').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const logId = e.target.dataset.logId;
        const log = student.behaviourLogs.find(l => l.id === logId);
        if (!log) return;

        document.getElementById('behaviour-modal-title').innerText = "Edit Behaviour Log";
        document.getElementById('behaviour-log-id').value = log.id;
        document.getElementById('behaviour-student-id').value = student.id;
        document.getElementById('behaviour-date').value = log.date;
        document.getElementById('behaviour-category').value = log.category;
        document.getElementById('behaviour-severity').value = log.severity;
        document.getElementById('behaviour-description').value = log.description;
        document.getElementById('behaviour-log-modal').classList.add('active');
      });
    });

    modalContent.querySelectorAll('.btn-delete-log').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const logId = e.target.dataset.logId;
        const isConfirmed = await showCustomConfirm(
          "Are you sure you want to delete this behaviour log entry?",
          "Delete Behaviour Log",
          "danger"
        );
        if (isConfirmed) {
          const res = updateBehaviourLog(student.id, { id: logId }, 'delete');
          if (res && res.success) {
            state.db = res.students;
            showToast("Behaviour log deleted successfully", "success");
            showStudentDetailModal(student.id);
            render();
          }
        }
      });
    });
  }
}

// Global modal event binder for adding/updating behavior logs
function attachGlobalBehaviourEvents() {
  const closeBtn = document.getElementById('btn-close-behaviour-modal');
  const cancelBtn = document.getElementById('btn-cancel-behaviour');
  const modal = document.getElementById('behaviour-log-modal');

  const closeModal = () => {
    if (modal) modal.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  const form = document.getElementById('behaviour-log-form');
  if (form) {
    // Avoid double submission attachments
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Bind cancel again since clone removes listeners
    const newCancel = document.getElementById('btn-cancel-behaviour');
    if (newCancel) newCancel.addEventListener('click', closeModal);
    const newClose = document.getElementById('btn-close-behaviour-modal');
    if (newClose) newClose.addEventListener('click', closeModal);

    newForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const logId = document.getElementById('behaviour-log-id').value;
      let studentId = document.getElementById('behaviour-student-id').value;
      if (!studentId) {
        studentId = document.getElementById('behaviour-student-select').value;
      }
      const date = document.getElementById('behaviour-date').value;
      const category = document.getElementById('behaviour-category').value;
      const severity = document.getElementById('behaviour-severity').value;
      const description = document.getElementById('behaviour-description').value;

      const action = logId ? 'edit' : 'add';
      const recordedBy = state.currentView === 'admin' ? 'Campus Admin Console' : (state.currentView === 'superadmin' ? 'Super Admin Control' : 'System');

      const res = updateBehaviourLog(studentId, {
        id: logId,
        date,
        category,
        severity,
        description,
        recordedBy
      }, action);

      if (res && res.success) {
        state.db = res.students;
        showToast(logId ? "Behaviour log updated!" : "Behaviour log added!", "success");
        closeModal();
        if (document.getElementById('behaviour-student-id').value) {
          showStudentDetailModal(studentId);
        }
        render();
      } else {
        showToast("Failed to save behaviour log", "error");
      }
    });
  }
}

// Dedicated Behaviour Logs Register View
function renderBehaviourLogsRegister() {
  const isReadOnly = (state.currentView === 'warden');
  
  // Gather all logs across all students
  const allLogs = [];
  state.db.forEach(student => {
    if (student.behaviourLogs) {
      student.behaviourLogs.forEach(log => {
        allLogs.push({
          studentId: student.id,
          studentName: student.name,
          studentRoom: student.room,
          studentBlock: student.block,
          ...log
        });
      });
    }
  });

  // Apply filters
  const filtered = allLogs.filter(log => {
    const term = state.behaviourSearch.toLowerCase();
    const matchesSearch = log.studentName.toLowerCase().includes(term) ||
                          log.studentId.toLowerCase().includes(term) ||
                          log.description.toLowerCase().includes(term);

    const matchesCategory = state.behaviourCategoryFilter === 'all' || log.category === state.behaviourCategoryFilter;
    const matchesSeverity = state.behaviourSeverityFilter === 'all' || log.severity === state.behaviourSeverityFilter;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // Sort logs: newest first
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'positive': return 'badge approved';
      case 'warning': return 'badge pending';
      case 'critical': return 'badge rejected';
      default: return 'badge info';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'positive': return 'Commendable';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'General';
    }
  };

  const logsHTML = filtered.length === 0
    ? `<tr>
         <td colspan="6" style="text-align:center; padding:30px; color:var(--text-secondary);">No behaviour logs found matching the filters.</td>
       </tr>`
    : filtered.map(log => `
        <tr>
          <td><strong>${log.studentName}</strong><br><span style="font-size:11px; color:var(--text-muted);">${log.studentId} • Room ${log.studentRoom}</span></td>
          <td>${formatDisplayDate(log.date)}</td>
          <td><span style="font-weight:600; font-size:12px;">${log.category}</span></td>
          <td><span class="${getSeverityBadgeClass(log.severity)}" style="font-size:10px; padding:3px 8px; text-transform:uppercase;">${getSeverityLabel(log.severity)}</span></td>
          <td style="max-width:300px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${log.description}">"${log.description}"</td>
          <td style="text-align:right;">
            <div style="display:flex; justify-content:flex-end; gap:6px;">
              ${!isReadOnly ? `
                <button class="table-btn btn-edit-register-log" data-log-id="${log.id}" data-stu-id="${log.studentId}">Edit</button>
                <button class="table-btn btn-delete-register-log" data-log-id="${log.id}" data-stu-id="${log.studentId}" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5;">Remove</button>
              ` : `
                <span style="font-size:11px; color:var(--text-secondary); font-style:italic;">By: ${log.recordedBy || 'System'}</span>
              `}
            </div>
          </td>
        </tr>
      `).join('');

  return `
    <div class="dashboard-panel dashboard-full">
      <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h2 class="panel-title">${ICONS.clipboard} Student Behaviour &amp; Observation Registry</h2>
        ${!isReadOnly ? `
          <button id="btn-register-add-log" class="btn-primary" style="padding: 8px 16px; font-size: 13px; font-weight:600;">
            + Record Observation
          </button>
        ` : ''}
      </div>

      <div class="filter-row" style="margin-bottom: 20px;">
        <div class="search-input-wrapper">
          ${ICONS.search}
          <input type="text" id="behaviour-register-search" class="search-input" placeholder="Search by student, ID, details..." value="${state.behaviourSearch}">
        </div>
        
        <div class="filter-actions">
          <select id="behaviour-register-category-filter" class="filter-select">
            <option value="all" ${state.behaviourCategoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
            <option value="Academic" ${state.behaviourCategoryFilter === 'Academic' ? 'selected' : ''}>Academic</option>
            <option value="Discipline" ${state.behaviourCategoryFilter === 'Discipline' ? 'selected' : ''}>Discipline</option>
            <option value="Social" ${state.behaviourCategoryFilter === 'Social' ? 'selected' : ''}>Social</option>
            <option value="General" ${state.behaviourCategoryFilter === 'General' ? 'selected' : ''}>General / Other</option>
          </select>
          
          <select id="behaviour-register-severity-filter" class="filter-select">
            <option value="all" ${state.behaviourSeverityFilter === 'all' ? 'selected' : ''}>All Types</option>
            <option value="positive" ${state.behaviourSeverityFilter === 'positive' ? 'selected' : ''}>Commendable</option>
            <option value="neutral" ${state.behaviourSeverityFilter === 'neutral' ? 'selected' : ''}>General</option>
            <option value="warning" ${state.behaviourSeverityFilter === 'warning' ? 'selected' : ''}>Warning</option>
            <option value="critical" ${state.behaviourSeverityFilter === 'critical' ? 'selected' : ''}>Critical</option>
          </select>
        </div>
      </div>

      <div class="directory-table-wrapper">
        <table class="directory-table">
          <thead>
            <tr>
              <th>Student Info</th>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Description</th>
              <th style="text-align:right;">${isReadOnly ? 'Recorder' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            ${logsHTML}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function attachBehaviourRegisterEvents() {
  const isReadOnly = (state.currentView === 'warden');
  const searchInput = document.getElementById('behaviour-register-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.behaviourSearch = e.target.value;
      render();
      const input = document.getElementById('behaviour-register-search');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    });
  }

  const catFilter = document.getElementById('behaviour-register-category-filter');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      state.behaviourCategoryFilter = e.target.value;
      render();
    });
  }

  const sevFilter = document.getElementById('behaviour-register-severity-filter');
  if (sevFilter) {
    sevFilter.addEventListener('change', (e) => {
      state.behaviourSeverityFilter = e.target.value;
      render();
    });
  }

  if (!isReadOnly) {
    const addBtn = document.getElementById('btn-register-add-log');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        document.getElementById('behaviour-modal-title').innerText = "Record Student Observation";
        document.getElementById('behaviour-log-id').value = "";
        document.getElementById('behaviour-student-id').value = "";
        
        // Show the student select dropdown
        const selectContainer = document.getElementById('behaviour-student-select-container');
        if (selectContainer) selectContainer.style.display = 'block';

        document.getElementById('behaviour-date').value = getDateString(0);
        document.getElementById('behaviour-category').value = "General";
        document.getElementById('behaviour-severity').value = "neutral";
        document.getElementById('behaviour-description').value = "";
        document.getElementById('behaviour-log-modal').classList.add('active');
      });
    }

    document.querySelectorAll('.btn-edit-register-log').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const logId = e.target.dataset.logId;
        const studentId = e.target.dataset.stuId;
        const student = state.db.find(s => s.id === studentId);
        if (!student) return;

        const log = student.behaviourLogs.find(l => l.id === logId);
        if (!log) return;

        document.getElementById('behaviour-modal-title').innerText = "Edit Behaviour Log";
        document.getElementById('behaviour-log-id').value = log.id;
        document.getElementById('behaviour-student-id').value = studentId;

        // Hide the student select dropdown, we edit for a specific student
        const selectContainer = document.getElementById('behaviour-student-select-container');
        if (selectContainer) selectContainer.style.display = 'none';

        document.getElementById('behaviour-date').value = log.date;
        document.getElementById('behaviour-category').value = log.category;
        document.getElementById('behaviour-severity').value = log.severity;
        document.getElementById('behaviour-description').value = log.description;
        document.getElementById('behaviour-log-modal').classList.add('active');
      });
    });

    document.querySelectorAll('.btn-delete-register-log').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const logId = e.target.dataset.logId;
        const studentId = e.target.dataset.stuId;
        const isConfirmed = await showCustomConfirm(
          "Are you sure you want to remove this behaviour log entry?",
          "Remove Behaviour Entry",
          "danger"
        );
        if (isConfirmed) {
          const res = updateBehaviourLog(studentId, { id: logId }, 'delete');
          if (res && res.success) {
            state.db = res.students;
            showToast("Behaviour log entry removed successfully", "success");
            render();
          }
        }
      });
    });
  }
}

// Dedicated Warden Dining & Meals Tracker
function renderWardenDining() {
  const selectedDate = state.diningDate;

  // Filter students based on search
  const term = state.diningSearch.toLowerCase();
  const filteredStudents = state.db.filter(s => {
    return s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term);
  });

  const getMealStatusForDate = (student, dateStr) => {
    const onLeave = isStudentOnLeave(student, dateStr);

    if (onLeave) {
      return {
        breakfast: false,
        lunch: false,
        snacks: false,
        dinner: false,
        onLeave: true
      };
    }

    return {
      breakfast: isMealBooked(student, dateStr, 'breakfast'),
      lunch: isMealBooked(student, dateStr, 'lunch'),
      snacks: isMealBooked(student, dateStr, 'snacks'),
      dinner: isMealBooked(student, dateStr, 'dinner'),
      onLeave: false
    };
  };

  const getBehaviourSummary = (student) => {
    if (!student.behaviourLogs || student.behaviourLogs.length === 0) {
      return `<span class="badge approved" style="background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; font-size:11px;">Good Conduct (0 Logs)</span>`;
    }

    let positive = 0;
    let warning = 0;
    let critical = 0;
    let neutral = 0;

    student.behaviourLogs.forEach(log => {
      if (log.severity === 'positive') positive++;
      else if (log.severity === 'warning') warning++;
      else if (log.severity === 'critical') critical++;
      else neutral++;
    });

    let badges = [];
    if (critical > 0) {
      badges.push(`<span class="badge rejected" style="font-size:10px; padding:2px 6px;">${critical} Critical</span>`);
    }
    if (warning > 0) {
      badges.push(`<span class="badge pending" style="font-size:10px; padding:2px 6px;">${warning} Warning</span>`);
    }
    if (positive > 0) {
      badges.push(`<span class="badge approved" style="font-size:10px; padding:2px 6px;">${positive} Comm.</span>`);
    }
    if (neutral > 0 && badges.length === 0) {
      badges.push(`<span class="badge info" style="font-size:10px; padding:2px 6px;">${neutral} Gen</span>`);
    }

    return `<div style="display:flex; gap:4px; flex-wrap:wrap; cursor:pointer;" class="dining-view-behaviour-trigger" data-stu-id="${student.id}">${badges.join('')}</div>`;
  };

  // ─── Meal count summary cards (all students, ignores search) ───
  const MEAL_DEFS = [
    { key: 'breakfast', label: 'Breakfast', time: '07:30 AM – 09:00 AM' },
    { key: 'lunch',     label: 'Lunch',     time: '12:30 PM – 02:00 PM' },
    { key: 'snacks',    label: 'Snacks',    time: '04:30 PM – 05:30 PM' },
    { key: 'dinner',    label: 'Dinner',    time: '07:30 PM – 09:00 PM' }
  ];

  // Renders a list of students with an optional small badge
  const makeStudentRows = (list, badgeFn = null) =>
    list.length === 0
      ? `<div style="font-size:12px; color:var(--text-muted); padding:4px 6px; font-style:italic;">None</div>`
      : list.map(s => `
          <div class="meal-count-student-row">
            <span class="student-dot"></span>
            <span class="sname">${s.name}</span>
            <span class="smeta">${s.id} · Rm ${s.room}</span>
            ${badgeFn ? badgeFn(s) : ''}
          </div>`).join('');

  const mealSummaryCards = MEAL_DEFS.map(({ key, label, time }) => {
    const manualOptedIn = [];
    const autoOptedIn   = [];
    const optedOut      = [];
    const rejectedList  = [];
    const onLeaveList   = [];

    state.db.forEach(student => {
      const type = getMealAcceptanceType(student, selectedDate, key);
      if      (type === 'leave')    onLeaveList.push(student);
      else if (type === 'rejected') rejectedList.push(student);
      else if (type === 'manual')   manualOptedIn.push(student);
      else if (type === 'auto')     autoOptedIn.push(student);
      else                          optedOut.push(student);
    });

    const totalOptedIn = manualOptedIn.length + autoOptedIn.length;
    const totalOptedOut = optedOut.length + rejectedList.length;

    // Badge for manual vs auto in opted-in list
    const manualBadge = () => `<span style="font-size:9px;font-weight:700;background:#dcfce7;color:#15803d;padding:2px 5px;border-radius:4px;flex-shrink:0;">MANUAL</span>`;
    const autoBadge   = () => `<span style="font-size:9px;font-weight:700;background:#dbeafe;color:#1d4ed8;padding:2px 5px;border-radius:4px;flex-shrink:0;">AUTO</span>`;
    const rejBadge    = () => `<span style="font-size:9px;font-weight:700;background:#fee2e2;color:#b91c1c;padding:2px 5px;border-radius:4px;flex-shrink:0;">REJECTED</span>`;

    // Build combined opted-in list with sub-headers if both types exist
    const buildOptedInList = () => {
      if (totalOptedIn === 0) return `<div style="font-size:12px; color:var(--text-muted); padding:4px 6px; font-style:italic;">None</div>`;
      let html = '';
      if (manualOptedIn.length > 0) {
        if (autoOptedIn.length > 0) html += `<div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;padding:4px 6px 2px;letter-spacing:0.5px;">Manually Accepted (${manualOptedIn.length})</div>`;
        html += makeStudentRows(manualOptedIn, manualBadge);
      }
      if (autoOptedIn.length > 0) {
        if (manualOptedIn.length > 0) html += `<div style="font-size:10px;font-weight:700;color:#1d4ed8;text-transform:uppercase;padding:6px 6px 2px;letter-spacing:0.5px;">Auto-Accepted (${autoOptedIn.length})</div>`;
        html += makeStudentRows(autoOptedIn, autoBadge);
      }
      return html;
    };

    const buildOptedOutList = () => {
      if (totalOptedOut === 0) return `<div style="font-size:12px; color:var(--text-muted); padding:4px 6px; font-style:italic;">None</div>`;
      let html = '';
      if (optedOut.length > 0) html += makeStudentRows(optedOut);
      if (rejectedList.length > 0) {
        if (optedOut.length > 0) html += `<div style="font-size:10px;font-weight:700;color:#b91c1c;text-transform:uppercase;padding:6px 6px 2px;letter-spacing:0.5px;">Explicitly Rejected (${rejectedList.length})</div>`;
        html += makeStudentRows(rejectedList, rejBadge);
      }
      return html;
    };

    return `
      <div class="meal-summary-card">
        <div class="meal-summary-header">
          <span class="meal-summary-title">${label}</span>
          <span class="meal-summary-time">${time}</span>
        </div>
        <div class="meal-summary-dropdowns">
          <details class="meal-count-details opted-in">
            <summary class="meal-count-summary">
              <span class="meal-count-bubble">${totalOptedIn}</span>
              <span class="meal-count-label">Opted In</span>
              ${manualOptedIn.length > 0 && autoOptedIn.length > 0 ? `<span style="font-size:10px;color:var(--text-muted);">${manualOptedIn.length}M · ${autoOptedIn.length}A</span>` : ''}
              <span class="meal-count-chevron">▼</span>
            </summary>
            <div class="meal-count-list">${buildOptedInList()}</div>
          </details>
          <details class="meal-count-details opted-out">
            <summary class="meal-count-summary">
              <span class="meal-count-bubble">${totalOptedOut}</span>
              <span class="meal-count-label">Opted Out</span>
              <span class="meal-count-chevron">▼</span>
            </summary>
            <div class="meal-count-list">${buildOptedOutList()}</div>
          </details>
          ${onLeaveList.length > 0 ? `
          <details class="meal-count-details on-leave">
            <summary class="meal-count-summary">
              <span class="meal-count-bubble">${onLeaveList.length}</span>
              <span class="meal-count-label">On Leave</span>
              <span class="meal-count-chevron">▼</span>
            </summary>
            <div class="meal-count-list">${makeStudentRows(onLeaveList)}</div>
          </details>` : ''}
        </div>
      </div>`;
  }).join('');

  const studentsHTML = filteredStudents.length === 0
    ? `<tr>
         <td colspan="6" style="text-align:center; padding:30px; color:var(--text-secondary);">No students found matching the search criteria.</td>
       </tr>`
    : filteredStudents.map(student => {
        const status = getMealStatusForDate(student, selectedDate);
        
        const renderCheckMark = (mealKey, onLeave) => {
          if (onLeave) {
            return `<span style="color:var(--text-muted); font-size:11px; font-weight:600; opacity:0.6; text-transform:uppercase;">Cancelled (Leave)</span>`;
          }
          const type = getMealAcceptanceType(student, selectedDate, mealKey);
          if (type === 'manual')   return `<span style="color:#16a34a; font-weight:700; display:inline-flex; align-items:center; gap:5px; font-size:13px;">✔ <span style="font-size:9px;font-weight:700;background:#dcfce7;color:#15803d;padding:2px 5px;border-radius:4px;">MANUAL</span></span>`;
          if (type === 'auto')     return `<span style="color:#2563eb; font-weight:700; display:inline-flex; align-items:center; gap:5px; font-size:13px;">✔ <span style="font-size:9px;font-weight:700;background:#dbeafe;color:#1d4ed8;padding:2px 5px;border-radius:4px;">AUTO</span></span>`;
          if (type === 'rejected') return `<span style="color:#ef4444; font-weight:600; display:inline-flex; align-items:center; gap:5px; font-size:13px;">✖ <span style="font-size:9px;font-weight:700;background:#fee2e2;color:#b91c1c;padding:2px 5px;border-radius:4px;">REJECTED</span></span>`;
          return `<span style="color:#94a3b8; font-weight:600; display:inline-flex; align-items:center; gap:4px; opacity:0.75; font-size:13px;">– Not Set</span>`;
        };

        return `
          <tr>
            <td>
              <strong>${student.name}</strong><br>
              <span style="font-size:11px; color:var(--text-muted);">${student.id} • Room ${student.room}</span>
            </td>
            <td>${renderCheckMark('breakfast', status.onLeave)}</td>
            <td>${renderCheckMark('lunch',     status.onLeave)}</td>
            <td>${renderCheckMark('snacks',    status.onLeave)}</td>
            <td>${renderCheckMark('dinner',    status.onLeave)}</td>
            <td>${getBehaviourSummary(student)}</td>
          </tr>
        `;
      }).join('');

  return `
    <div class="dashboard-panel dashboard-full">
      <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h2 class="panel-title">${ICONS.coffee} Daily Dining Tracker &amp; Student Behaviour</h2>
        <div style="font-size:12px; color:var(--text-secondary);">Tracking meal options and active conduct flags</div>
      </div>

      <div class="filter-row" style="margin-bottom: 20px; display:flex; gap:15px; flex-wrap:wrap; align-items:center;">
        <div class="search-input-wrapper" style="flex:1; min-width:200px;">
          ${ICONS.search}
          <input type="text" id="dining-tracker-search" class="search-input" placeholder="Search student by name or ID..." value="${state.diningSearch}">
        </div>
        
        <div style="display:flex; align-items:center; gap:10px;">
          <label for="dining-tracker-date" style="font-size:13px; font-weight:600; color:var(--text-secondary);">Target Date:</label>
          <input type="date" id="dining-tracker-date" class="form-input" style="padding: 6px 12px; font-size:13px; max-width:160px; margin:0;" value="${selectedDate}">
        </div>
      </div>

      <!-- Meal Summary Cards -->
      <div class="meal-summary-grid">
        ${mealSummaryCards}
      </div>

      <div class="directory-table-wrapper">
        <table class="directory-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Snacks</th>
              <th>Dinner</th>
              <th>Student Behaviour Log Summary</th>
            </tr>
          </thead>
          <tbody>
            ${studentsHTML}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function attachWardenDiningEvents() {
  const searchInput = document.getElementById('dining-tracker-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.diningSearch = e.target.value;
      render();
      const input = document.getElementById('dining-tracker-search');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    });
  }

  const dateInput = document.getElementById('dining-tracker-date');
  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      state.diningDate = e.target.value;
      render();
    });
  }

  // Click behaviour summaries to open detail modal
  document.querySelectorAll('.dining-view-behaviour-trigger').forEach(element => {
    element.addEventListener('click', (e) => {
      const studentId = e.currentTarget.dataset.stuId;
      if (studentId) {
        showStudentDetailModal(studentId);
      }
    });
  });
}

// Calendar Navigation and Date Selection Events
function attachCalendarEvents() {
  const prevBtn = document.getElementById('btn-calendar-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.calendarMonth === 0) {
        state.calendarMonth = 11;
        state.calendarYear--;
      } else {
        state.calendarMonth--;
      }
      render();
    });
  }

  const nextBtn = document.getElementById('btn-calendar-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.calendarMonth === 11) {
        state.calendarMonth = 0;
        state.calendarYear++;
      } else {
        state.calendarMonth++;
      }
      render();
    });
  }

  // Click day cells to change selected date
  document.querySelectorAll('.calendar-day-cell').forEach(cell => {
    cell.addEventListener('click', (e) => {
      const clickedCell = e.currentTarget;
      const date = clickedCell.dataset.date;
      if (date) {
        state.calendarSelectedDate = date;
        render();
      }
    });
  });
}

