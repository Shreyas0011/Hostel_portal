// src/pages/superadmin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '../../redux/auth/authSlice';
import { fetchDirectoryThunk } from '../../redux/student/studentSlice';
import { resetDatabaseThunk, reseedMealsThunk } from '../../redux/dashboard/dashboardSlice';
import { setViewAttendanceStudentId } from '../../redux/attendance/attendanceSlice';
import { setViewHealthStudentId } from '../../redux/health/healthSlice';
import { addToast } from '../../redux/notification/notificationSlice';
import { ICONS } from '../../constants/icons';
import MessMenuSection from '../../components/MessMenuSection';
import WardenDiningSection from '../../components/WardenDiningSection';
import StudentDirectorySection from '../../components/StudentDirectorySection';
import AdminAttendanceSection from '../../components/AdminAttendanceSection';
import AdminHealthSection from '../../components/AdminHealthSection';
import BehaviourLogsSection from '../../components/BehaviourLogsSection';
import ComplaintsSection from '../../components/ComplaintsSection';
import StudentDetailModal from '../../components/StudentDetailModal';

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const db = useSelector((state) => state.student.directory) || [];

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Student Detail Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // DB button loader state
  const [isResetting, setIsResetting] = useState(false);
  const [isReseedMeals, setIsReseedMeals] = useState(false);

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

  const handleViewHealth = (studentId) => {
    dispatch(setViewHealthStudentId(studentId));
    setActiveTab('health');
  };

  const handleViewAttendance = (studentId) => {
    dispatch(setViewAttendanceStudentId(studentId));
    setActiveTab('attendance');
  };

  const handleResetDatabase = () => {
    setIsResetting(true);
    dispatch(resetDatabaseThunk()).then((res) => {
      setIsResetting(false);
      if (!res.error) {
        dispatch(addToast({ message: 'System database successfully reset to default seeds!', type: 'success' }));
      } else {
        dispatch(addToast({ message: res.payload || 'Database reset failed.', type: 'error' }));
      }
    });
  };

  const handleReseedMeals = () => {
    setIsReseedMeals(true);
    dispatch(reseedMealsThunk()).then((res) => {
      setIsReseedMeals(false);
      if (!res.error) {
        dispatch(addToast({ message: 'All meal bookings simulated and reseeded successfully!', type: 'success' }));
      } else {
        dispatch(addToast({ message: res.payload || 'Meal reseeding failed.', type: 'error' }));
      }
    });
  };

  const adminUsers = [
    { name: "Siddharth K T", role: "Superadmin", pin: "Hidden", id: "SAD-02" },
    { name: "Shwetha S", role: "Superadmin", pin: "Hidden", id: "SAD-03" },
    { name: "Chief Warden Console", role: "Warden", pin: "Password", id: "WDN-01" },
    { name: "Campus Admin Console", role: "Admin", pin: "5678", id: "ADM-01" },
    { name: "Super Admin Control", role: "Superadmin", pin: "9999", id: "SAD-01" }
  ];

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-panel dashboard-full">
            <div className="panel-header">
              <h2 className="panel-title">{ICONS.users} Administrator &amp; Staff Directory</h2>
            </div>
            
            <div className="directory-table-wrapper" style={{ marginTop: '15px' }}>
              <table className="directory-table">
                <thead>
                  <tr>
                    <th>Account ID</th>
                    <th>Name</th>
                    <th>Role / Level</th>
                    <th>Secret Login PIN</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(user => (
                    <tr key={user.id}>
                      <td><strong>{user.id}</strong></td>
                      <td>{user.name}</td>
                      <td>
                        <span className="student-block-badge" style={{ background: '#f3f4f6', color: 'var(--text-primary)', fontWeight: 700 }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <code style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px' }}>
                          {user.pin}
                        </code>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge approved" style={{ fontSize: '11px', padding: '4px 8px' }}>Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'logs':
        return (
          <div className="dashboard-panel dashboard-full">
            <div className="panel-header">
              <h2 className="panel-title">{ICONS.shield} Live System Log Tracker</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ background: '#f9fafb', borderLeft: '4px solid var(--primary)', padding: '12px', borderRadius: '0 8px 8px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>[02:29 PM]</span> <strong style={{ color: 'var(--primary)' }}>SYSTEM:</strong> Superadmin console initialized. Uptime: 100%
              </div>
              <div style={{ background: '#f9fafb', borderLeft: '4px solid var(--success)', padding: '12px', borderRadius: '0 8px 8px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>[01:42 PM]</span> <strong style={{ color: 'var(--success)' }}>PARENT_PORTAL:</strong> Parent approved leave request LV-STU001-1 for Aarav Sharma (STU001)
              </div>
              <div style={{ background: '#f9fafb', borderLeft: '4px solid var(--warning)', padding: '12px', borderRadius: '0 8px 8px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>[11:05 AM]</span> <strong style={{ color: 'var(--warning)' }}>WARDEN_CONSOLE:</strong> Chief Warden viewed student log directory list
              </div>
              <div style={{ background: '#f9fafb', borderLeft: '4px solid var(--primary)', padding: '12px', borderRadius: '0 8px 8px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>[09:12 AM]</span> <strong style={{ color: 'var(--primary)' }}>ADMIN_CONSOLE:</strong> Mess dishes updated to standard continental menu setup
              </div>
              <div style={{ background: '#f9fafb', borderLeft: '4px solid var(--danger)', padding: '12px', borderRadius: '0 8px 8px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>[Yesterday]</span> <strong style={{ color: 'var(--danger)' }}>STUDENT_PORTAL:</strong> Vihaan Verma submitted new leave request for Going Home
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="dashboard-panel dashboard-full">
            <div className="panel-header">
              <h2 className="panel-title">{ICONS.waste} System Database Operations</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px', maxWidth: '600px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                <div>
                  <h4 style={{ color: '#b91c1c', marginBottom: '5px', marginTop: 0 }}>Clear Portal LocalStorage Cache</h4>
                  <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0 }}>Wipes all active local database keys, resetting students to the original 5 seeded accounts.</p>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ background: '#dc2626', padding: '12px 20px', flexShrink: 0, margin: 0 }}
                  onClick={handleResetDatabase}
                  disabled={isResetting}
                >
                  {isResetting ? 'Resetting...' : 'Reset Database'}
                </button>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                <div>
                  <h4 style={{ color: '#1d4ed8', marginBottom: '5px', marginTop: 0 }}>Simulate All Meal Bookings</h4>
                  <p style={{ fontSize: '13px', color: '#1e3a8a', margin: 0 }}>Generates fresh random breakfast, lunch, snacks, and dinner selections for testing mess wastages.</p>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ background: '#2563eb', padding: '12px 20px', flexShrink: 0, margin: 0 }}
                  onClick={handleReseedMeals}
                  disabled={isReseedMeals}
                >
                  {isReseedMeals ? 'Seeding...' : 'Re-Seed Meals'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'menu':
        return <MessMenuSection />;
      case 'dining':
        return <WardenDiningSection onViewStudentDetails={handleViewStudentDetails} />;
      case 'directory':
        return (
          <StudentDirectorySection 
            onViewHealth={handleViewHealth} 
            onViewAttendance={handleViewAttendance} 
            onViewStudent={handleViewStudentDetails} 
          />
        );
      case 'attendance':
        return <AdminAttendanceSection />;
      case 'health':
        return <AdminHealthSection />;
      case 'behaviour':
        return <BehaviourLogsSection isReadOnly={false} showFullRegistry={true} />;
      case 'complaints':
        return <ComplaintsSection role="superadmin" />;
      default:
        return <div className="dashboard-panel"><p>Select an option from the sidebar nav</p></div>;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Master System Dashboard';
      case 'logs': return 'System Activity Logs';
      case 'database': return 'Database Maintenance';
      case 'menu': return 'Mess Menu Management';
      case 'dining': return 'Meal Data & Acceptance';
      case 'directory': return 'Student Directory';
      case 'attendance': return 'Gate & Attendance';
      case 'health': return 'Health & Medical Logs';
      case 'behaviour': return 'Student Behaviour Register';
      case 'complaints': return 'Student Complaints Desk';
      default: return 'Super Admin Control Console';
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
          {ICONS.key}
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
          {ICONS.key}
          <span>Super Admin</span>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar" style={{ background: '#ec4899', color: 'white' }}>SA</div>
          <div className="profile-info">
            <span className="profile-name">Super Admin Control</span>
            <span className="profile-role">Root Operations</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
          >
            {ICONS.home} Campus Analytics
          </button>
          <button 
            className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('logs'); setMobileMenuOpen(false); }}
          >
            {ICONS.clipboard} Activity Logs
          </button>
          <button 
            className={`nav-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => { setActiveTab('database'); setMobileMenuOpen(false); }}
          >
            {ICONS.settings} Database Control
          </button>
          <button 
            className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => { setActiveTab('menu'); setMobileMenuOpen(false); }}
          >
            {ICONS.coffee} Mess Menu Setup
          </button>
          <button 
            className={`nav-item ${activeTab === 'dining' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dining'); setMobileMenuOpen(false); }}
          >
            {ICONS.coffee} Meal Data
          </button>
          <button 
            className={`nav-item ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => { setActiveTab('directory'); setMobileMenuOpen(false); }}
          >
            {ICONS.users} Student Directory
          </button>
          <button 
            className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }}
          >
            {ICONS.shield} Gate &amp; Attendance
          </button>
          <button 
            className={`nav-item ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => { setActiveTab('health'); setMobileMenuOpen(false); }}
          >
            {ICONS.shield} Health &amp; Medical
          </button>
          <button 
            className={`nav-item ${activeTab === 'behaviour' ? 'active' : ''}`}
            onClick={() => { setActiveTab('behaviour'); setMobileMenuOpen(false); }}
          >
            {ICONS.clipboard} Behaviour Register
          </button>
          <button 
            className={`nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => { setActiveTab('complaints'); setMobileMenuOpen(false); }}
          >
            {ICONS.complaint} Student Complaints
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
            <h1>{getHeaderTitle()}</h1>
            <p>Super Admin Console • Root Privilege Level</p>
          </div>
        </header>

        {renderActiveSection()}
      </main>

      {/* Student Details modal shortcut */}
      <StudentDetailModal 
        isOpen={detailModalOpen}
        studentId={selectedStudentId}
        isReadOnly={false}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedStudentId(null);
        }}
      />
    </div>
  );
};

export default SuperAdminDashboard;
