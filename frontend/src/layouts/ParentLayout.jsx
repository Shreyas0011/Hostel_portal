// src/layouts/ParentLayout.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setParentTab } from '../redux/dashboard/dashboardSlice';
import { logoutThunk } from '../redux/auth/authSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';

const ParentLayout = ({ children, title, subtitle }) => {
  const dispatch = useDispatch();
  const parent = useSelector((state) => state.auth.user);
  const ward = useSelector((state) => state.parent.ward);
  const activeTab = useSelector((state) => state.dashboard.parentActiveTab);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutThunk()).then(() => {
      dispatch(addToast({ message: 'Logged out successfully', type: 'info' }));
    });
  };

  const navItems = [
    { id: 'leave', label: 'Leave approvals', icon: ICONS.calendar },
    { id: 'meals', label: 'Mess Bookings', icon: ICONS.coffee },
    { id: 'attendance', label: 'Gate Logs', icon: ICONS.users },
    { id: 'health', label: 'Health Records', icon: ICONS.shield },
    { id: 'behaviour', label: 'Behaviour observations', icon: ICONS.clipboard },
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
        
        {ward && (
          <div className="sidebar-profile">
            <div className="profile-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: '800', flexShrink: 0, overflow: 'hidden', padding: 0 }}>
              P
            </div>
            <div className="profile-info">
              <span className="profile-name">Parent of {ward.name.split(' ')[0]}</span>
              <span className="profile-role">Ward Room: {ward.room}</span>
            </div>
          </div>
        )}
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`} 
              onClick={() => {
                dispatch(setParentTab(item.id));
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

export default ParentLayout;


