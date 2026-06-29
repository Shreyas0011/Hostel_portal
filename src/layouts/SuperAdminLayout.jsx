// src/layouts/SuperAdminLayout.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSuperTab } from '../redux/dashboard/dashboardSlice';
import { logoutThunk } from '../redux/auth/authSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';

const SuperAdminLayout = ({ children, title, subtitle }) => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.dashboard.superActiveTab);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutThunk()).then(() => {
      dispatch(addToast({ message: 'Logged out successfully', type: 'info' }));
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Campus Analytics', icon: ICONS.home },
    { id: 'logs', label: 'System Activity Logs', icon: ICONS.clipboard },
    { id: 'database', label: 'Database Control', icon: ICONS.settings },
  ];

  return (
    <div className="dashboard-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <button 
          id="mobile-toggle" 
          className="mobile-menu-toggle" 
          aria-label="Open navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="mobile-top-bar-brand">
          <img src="/transcend-logo.png" alt="Transcend" style={{ height: '52px', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Sidebar Backdrop */}
      <div 
        id="sidebar-backdrop" 
        className={`sidebar-backdrop ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside id="dashboard-sidebar" className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/transcend-logo.png" alt="Transcend" style={{ height: '80px', objectFit: 'contain' }} />
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar" style={{ background: '#ec4899', color: 'white' }}>SA</div>
          <div className="profile-info">
            <span className="profile-name">Super Admin Control</span>
            <span className="profile-role">Root Operations</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`} 
              onClick={() => {
                dispatch(setSuperTab(item.id));
                setMobileOpen(false);
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button id="btn-logout" className="btn-logout" onClick={handleLogout}>
            {ICONS.logout} Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <header className="header-container">
          <div className="header-title-section">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default SuperAdminLayout;


