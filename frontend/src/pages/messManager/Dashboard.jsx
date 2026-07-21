// src/pages/messManager/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '../../redux/auth/authSlice';
import { fetchDirectoryThunk } from '../../redux/student/studentSlice';
import { ICONS } from '../../constants/icons';

import WardenDiningSection from '../../components/WardenDiningSection';
import StudentDetailModal from '../../components/StudentDetailModal';

const MessManagerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    dispatch(fetchDirectoryThunk());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutThunk()).then(() => {
      navigate('/login');
    });
  };

  const handleViewStudentDetails = (studentId) => {
    setSelectedStudentId(studentId);
    setDetailModalOpen(true);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <button 
          className="mobile-menu-toggle" 
          aria-label="Open navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="mobile-top-bar-brand">
          {ICONS.coffee}
          <span>TRANSCEND MESS</span>
        </div>
      </div>

      {/* Sidebar Backdrop */}
      <div 
        className={`sidebar-backdrop ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          {ICONS.coffee}
          <span>Mess Management</span>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'M'}
          </div>
          <div className="profile-info">
            <span className="profile-name">{currentUser?.name || 'Mess Manager'}</span>
            <span className="profile-role">{currentUser?.block || 'Campus Mess'}</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active">
            {ICONS.coffee} Meal Data &amp; Attendance
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            {ICONS.logout} Logout
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <header className="header-container">
          <div className="header-title-section">
            <h1>Meal Data &amp; Attendance Tracker</h1>
            <p>Mess Manager Console • Student Meal Attendance Marking</p>
          </div>
        </header>

        <WardenDiningSection onViewStudentDetails={handleViewStudentDetails} />
      </main>

      {/* Student Detail Modal shortcut */}
      <StudentDetailModal 
        isOpen={detailModalOpen}
        studentId={selectedStudentId}
        isReadOnly={true}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedStudentId(null);
        }}
      />
    </div>
  );
};

export default MessManagerDashboard;
