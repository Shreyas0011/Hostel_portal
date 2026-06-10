const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// 1. Locate renderLoginView boundaries
const startKey = 'function renderLoginView() {';
const endKey = 'function attachLoginEvents() {';

const startIndex = mainJs.indexOf(startKey);
const endIndex = mainJs.indexOf(endKey);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find renderLoginView or attachLoginEvents');
  process.exit(1);
}

// Replace renderLoginView
const newRenderLoginView = `function renderLoginView() {
  return \`
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo">
          \\\${ICONS.shield}
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
            <span style="font-size:11px; color:var(--text-muted); margin-top:8px; display:block; line-height:1.4;">
              Demo Student: <strong>aarav.sharma@hostel.edu</strong> / <strong>password</strong><br>
              Demo Parent: <strong>parent.aarav.sharma@hostel.edu</strong> / <strong>password</strong><br>
              Demo Warden: PIN <strong>1234</strong> (no password)<br>
              Demo Admin: <strong>admin@hostel.edu</strong> / <strong>admin123</strong><br>
              Demo Super: <strong>superadmin@hostel.edu</strong> / <strong>super123</strong>
            </span>
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
      </div>
    </div>
  \`;
}

`;

// 2. Locate attachLoginEvents boundaries
const nextFunctionKey = '// View template: STUDENT PORTAL';
const nextFunctionIndex = mainJs.indexOf(nextFunctionKey);

if (nextFunctionIndex === -1) {
  console.error('Could not find STUDENT PORTAL boundary');
  process.exit(1);
}

const newAttachLoginEvents = `function attachLoginEvents() {
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

`;

mainJs = mainJs.substring(0, startIndex) + newRenderLoginView + newAttachLoginEvents + mainJs.substring(nextFunctionIndex);

fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log('✅ Successfully refactored login view and events into a unified login system.');
