// src/pages/parent/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '../../redux/auth/authSlice';
import { fetchWardDetailsThunk } from '../../redux/parent/parentSlice';
import { fetchDirectoryThunk } from '../../redux/student/studentSlice';
import { ICONS } from '../../constants/icons';
import { isStudentOnLeave } from '../../utils/db';
import { getDateString } from '../../utils/dateUtils';
import MealsPlanner from '../../components/MealsPlanner';

import HealthStatusSection from '../../components/HealthStatusSection';
import BehaviourLogsSection from '../../components/BehaviourLogsSection';

const ParentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const directory = useSelector((state) => state.student.directory);

  const [activeTab, setActiveTab] = useState('meals');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.studentId) {
      dispatch(fetchWardDetailsThunk(user.studentId));
      dispatch(fetchDirectoryThunk());
    }
  }, [dispatch, user]);

  const student = directory.find((s) => s.id === user?.studentId) || user;

  const handleLogout = () => {
    dispatch(logoutThunk()).then(() => {
      navigate('/login');
    });
  };



  const renderActiveSection = () => {
    switch (activeTab) {
      case 'meals':
        return <MealsPlanner student={student} isReadOnly={true} />;
      case 'health':
        return <HealthStatusSection student={student} role="parent" />;
      case 'behaviour':
        return <BehaviourLogsSection student={student} isReadOnly={true} showFullRegistry={false} />;
      default:
        return <MealsPlanner student={student} isReadOnly={true} />;
    }
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
          {ICONS.shield}
          <span>TRANSCEND HOSTEL</span>
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
          {ICONS.shield}
          <span>Hostel Parent</span>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: '800', flexShrink: 0, overflow: 'hidden', padding: 0 }}>
            P
          </div>
          <div className="profile-info">
            <span className="profile-name">Parent of {student?.name?.split(' ')[0]}</span>
            <span className="profile-role">Room {student?.room} • {student?.id}</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'meals' ? 'active' : ''}`}
            onClick={() => { setActiveTab('meals'); setMobileMenuOpen(false); }}
          >
            {ICONS.coffee} Meal Status
          </button>
          <button 
            className={`nav-item ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => { setActiveTab('health'); setMobileMenuOpen(false); }}
          >
            {ICONS.shield} Child's Health Records
          </button>
          <button 
            className={`nav-item ${activeTab === 'behaviour' ? 'active' : ''}`}
            onClick={() => { setActiveTab('behaviour'); setMobileMenuOpen(false); }}
          >
            {ICONS.clipboard} Behaviour Log
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            {ICONS.logout} Logout
          </button>
        </div>
      </aside>

      {/* Main Content Panel */}
      <main className="main-content">
        <header className="header-container">
          <div className="header-title-section">
            <h1>
              {activeTab === 'meals' ? "Ward's Meal Status" : 
               activeTab === 'health' ? "Child's Health Records" : 
               "Child's Behaviour Log"}
            </h1>
            <p>Parent Control Portal • Student: {student?.name} ({student?.id})</p>
          </div>
        </header>

        {renderActiveSection()}
      </main>
    </div>
  );
};

export default ParentDashboard;
