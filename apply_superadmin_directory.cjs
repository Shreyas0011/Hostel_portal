const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'main.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find boundaries of renderSuperadminView and attachSuperadminEvents
const superViewStart = content.indexOf('// View template: SUPER ADMIN DASHBOARD');
const superViewEnd = content.indexOf('// App Startup');

if (superViewStart === -1 || superViewEnd === -1) {
  console.log('Error: Could not find superadmin view boundaries in main.js');
  process.exit(1);
}

const NEW_SUPER_BLOCK = `// View template: SUPER ADMIN DASHBOARD
function renderSuperadminView() {
  const adminUsers = [
    { name: "Siddharth K T", role: "Superadmin", pin: "Hidden", id: "SAD-02" },
    { name: "Shwetha S", role: "Superadmin", pin: "Hidden", id: "SAD-03" },
    { name: "Chief Warden Console", role: "Warden", pin: "1234", id: "WDN-01" },
    { name: "Campus Admin Console", role: "Admin", pin: "5678", id: "ADM-01" },
    { name: "Super Admin Control", role: "Superadmin", pin: "9999", id: "SAD-01" }
  ];

  return \`
    <div class="dashboard-layout">
      <!-- Mobile Toggle -->
      <div style="position:fixed; top:15px; left:15px; z-index:999;">
        <button id="mobile-toggle" class="mobile-menu-toggle">
          \${ICONS.home}
        </button>
      </div>

      <!-- Sidebar -->
      <aside id="dashboard-sidebar" class="sidebar">
        <div class="sidebar-brand">
          \${ICONS.key}
          <span>Super Admin</span>
        </div>
        
        <div class="sidebar-profile">
          <div class="profile-avatar" style="background:#1e40af; color:white;">SA</div>
          <div class="profile-info">
            \${ICONS.shield}
            <span class="profile-name">Super Control</span>
            <span class="profile-role">Root Privileges</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <button class="nav-item \${state.superActiveTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
            \${ICONS.home} Master Control
          </button>
          <button class="nav-item \${state.superActiveTab === 'directory' ? 'active' : ''}" data-tab="directory">
            \${ICONS.users} Student Directory
          </button>
          <button class="nav-item \${state.superActiveTab === 'logs' ? 'active' : ''}" data-tab="logs">
            \${ICONS.shield} Activity Logs
          </button>
          <button class="nav-item \${state.superActiveTab === 'database' ? 'active' : ''}" data-tab="database">
            \${ICONS.waste} Database Controls
          </button>
        </nav>
        
        <div class="sidebar-footer">
          <button id="btn-logout" class="btn-logout">
            \${ICONS.logout} Logout
          </button>
        </div>
      </aside>

      <!-- Main Panel -->
      <main class="main-content">
        <header class="header-container">
          <div class="header-title-section">
            <h1>\${state.superActiveTab === 'dashboard' ? 'Master System Dashboard' : state.superActiveTab === 'directory' ? 'Student Directory & Gate Logs' : state.superActiveTab === 'logs' ? 'System Activity Logs' : 'Database Maintenance'}</h1>
            <p>Superadmin Master Panel • Root Access Enabled</p>
          </div>
        </header>

        <!-- Stats row (General statistics) -->
        <div class="stats-grid" style="margin-bottom: 25px;">
          <div class="stat-card">
            <div class="stat-icon primary">\${ICONS.users}</div>
            <div class="stat-details">
              <span class="stat-label">Total Users</span>
              <span class="stat-value">13</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">\${ICONS.shield}</div>
            <div class="stat-details">
              <span class="stat-label">System Status</span>
              <span class="stat-value" style="color:var(--success); display:flex; align-items:center; gap:5px;"><span class="status-dot active"></span> Healthy</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">\${ICONS.settings}</div>
            <div class="stat-details">
              <span class="stat-label">Total Admins</span>
              <span class="stat-value">3</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon danger">\${ICONS.key}</div>
            <div class="stat-details">
              <span class="stat-label">Sec. Cleared</span>
              <span class="stat-value">100%</span>
            </div>
          </div>
        </div>

        \${state.superActiveTab === 'dashboard' ? \`
          <div class="dashboard-panel dashboard-full">
            <div class="panel-header">
              <h2 class="panel-title">\${ICONS.users} Administrator &amp; Staff Directory</h2>
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
                  \${adminUsers.map(user => \`
                    <tr>
                      <td><strong>\${user.id}</strong></td>
                      <td>\${user.name}</td>
                      <td><span class="student-block-badge" style="background:#f3f4f6; color:var(--text-primary); font-weight:700;">\${user.role}</span></td>
                      <td><code style="background:#f3f4f6; padding:4px 8px; border-radius:4px; font-weight:700; font-family:monospace; letter-spacing:1px;">\${user.pin}</code></td>
                      <td style="text-align:right;"><span class="badge approved" style="font-size:11px; padding:4px 8px;">Active</span></td>
                    </tr>
                  \`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        \` : state.superActiveTab === 'directory' ? renderWardenDirectory() : state.superActiveTab === 'logs' ? \`
          <div class="dashboard-panel dashboard-full">
            <div class="panel-header">
              <h2 class="panel-title">\${ICONS.shield} Live System Log Tracker</h2>
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
        \` : \`
          <div class="dashboard-panel dashboard-full">
            <div class="panel-header">
              <h2 class="panel-title">\${ICONS.waste} System Database Operations</h2>
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
        \`}
      </main>
    </div>

    <!-- Student Detail Modal (Available in Superadmin View) -->
    <div id="student-detail-modal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-student-name">Student Details</h3>
          <button class="modal-close" id="btn-close-detail-modal">\${ICONS.x}</button>
        </div>
        <div id="modal-student-content" style="display:flex; flex-direction:column; gap:15px;">
          <!-- filled dynamically -->
        </div>
      </div>
    </div>
  \`;
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

  if (state.superActiveTab === 'directory') {
    attachDirectoryEvents();
  }

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
}
`;

content = content.substring(0, superViewStart) + NEW_SUPER_BLOCK + content.substring(superViewEnd);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully added student directory tab to Super Admin view.');
