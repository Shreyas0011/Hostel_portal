// src/pages/superadmin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '../../redux/auth/authSlice';
import { fetchDirectoryThunk } from '../../redux/student/studentSlice';
import { resetDatabaseThunk, reseedMealsThunk } from '../../redux/dashboard/dashboardSlice';
import { setViewHealthStudentId } from '../../redux/health/healthSlice';
import { addToast } from '../../redux/notification/notificationSlice';
import { ICONS } from '../../constants/icons';
import MessMenuSection from '../../components/MessMenuSection';
import WardenDiningSection from '../../components/WardenDiningSection';
import StudentDirectorySection from '../../components/StudentDirectorySection';

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

  // Analytics filtering/sorting state
  const [sortOption, setSortOption] = useState('none');
  const [mealsSortOption, setMealsSortOption] = useState('none');
  const [complaintsSortOption, setComplaintsSortOption] = useState('none');

  // Calculate analytics
  const totalComplaints = db.reduce((acc, s) => acc + (s.complaints ? s.complaints.length : 0), 0);
  const totalMeals = db.reduce((acc, s) => {
    return acc + (s.mealBookings ? s.mealBookings.reduce((mAcc, b) => {
      let count = 0;
      if (b.breakfast) count++;
      if (b.lunch) count++;
      if (b.snacks) count++;
      if (b.dinner) count++;
      return mAcc + count;
    }, 0) : 0);
  }, 0);

  // Sorting student list for birthday calendar
  const sortedStudents = [...db].sort((a, b) => {
    if (sortOption === 'grade') {
      return (a.division || '').localeCompare(b.division || '');
    }
    if (sortOption === 'gender') {
      return (a.gender || '').localeCompare(b.gender || '');
    }
    return 0;
  });

  // Calculate meal bookings list and sort it
  const mealsList = db.map(s => {
    const mealCount = s.mealBookings ? s.mealBookings.reduce((acc, b) => {
      let count = 0;
      if (b.breakfast) count++;
      if (b.lunch) count++;
      if (b.snacks) count++;
      if (b.dinner) count++;
      return acc + count;
    }, 0) : 0;
    return { id: s.id, name: s.name, division: s.division, gender: s.gender, mealCount };
  });

  const sortedMealsList = [...mealsList].sort((a, b) => {
    if (mealsSortOption === 'grade') {
      return (a.division || '').localeCompare(b.division || '');
    }
    if (mealsSortOption === 'gender') {
      return (a.gender || '').localeCompare(b.gender || '');
    }
    return 0;
  });

  // Calculate complaints list and sort it
  const complaintsList = [];
  db.forEach(s => {
    if (s.complaints) {
      s.complaints.forEach(c => {
        complaintsList.push({
          studentId: s.id,
          studentName: s.name,
          division: s.division,
          gender: s.gender,
          complaintId: c.id,
          category: c.category,
          subject: c.subject,
          status: c.status,
          date: c.dateReported
        });
      });
    }
  });

  const sortedComplaintsList = [...complaintsList].sort((a, b) => {
    if (complaintsSortOption === 'grade') {
      return (a.division || '').localeCompare(b.division || '');
    }
    if (complaintsSortOption === 'gender') {
      return (a.gender || '').localeCompare(b.gender || '');
    }
    return 0;
  });

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
    { name: "Vijayamma", role: "Warden (Girls)", pin: "1111", id: "WDN-02" },
    { name: "Siddu", role: "Warden (Boys)", pin: "2222", id: "WDN-03" },
    { name: "Mess Manager", role: "Mess Manager", pin: "3333", id: "MM-01" },
    { name: "Campus Admin Console", role: "Admin", pin: "admin123", id: "ADM-01" },
    { name: "Super Admin Control", role: "Superadmin", pin: "super123", id: "SAD-01" }
  ];


  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Analytics Stats Grid */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ICONS.users}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Total Students</h4>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{db.length}</span>
                </div>
              </div>
              <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(22,163,74,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ICONS.coffee}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Total Meals Booked</h4>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)' }}>{totalMeals}</span>
                </div>
              </div>
              <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ICONS.complaint}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Total Tickets</h4>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--danger)' }}>{totalComplaints}</span>
                </div>
              </div>
            </div>

            {/* Student Birthday List with Sorting */}
            <div className="dashboard-panel dashboard-full">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h2 className="panel-title">{ICONS.calendar} Student Birthday &amp; Class Directory</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort By:</span>
                  <select 
                    className="filter-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    <option value="none">Default (ID)</option>
                    <option value="grade">Grade (Class)</option>
                    <option value="gender">Gender</option>
                  </select>
                </div>
              </div>

              <div className="directory-table-wrapper" style={{ marginTop: '15px', maxHeight: '250px', overflowY: 'auto' }}>
                <table className="directory-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Grade (Division)</th>
                      <th>Gender</th>
                      <th>Date of Birth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map(student => (
                      <tr key={student.id}>
                        <td><strong>{student.id}</strong></td>
                        <td>{student.name}</td>
                        <td>
                          <span className="student-block-badge">
                            {student.division}
                          </span>
                        </td>
                        <td>{student.gender}</td>
                        <td>
                          <span className="badge info" style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            🎂 {student.dob || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Meal Bookings Breakdown with Sorting */}
            <div className="dashboard-panel dashboard-full">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h2 className="panel-title">{ICONS.coffee} Meal Bookings breakdown</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort By:</span>
                  <select 
                    className="filter-select"
                    value={mealsSortOption}
                    onChange={(e) => setMealsSortOption(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    <option value="none">Default (ID)</option>
                    <option value="grade">Grade (Class)</option>
                    <option value="gender">Gender</option>
                  </select>
                </div>
              </div>

              <div className="directory-table-wrapper" style={{ marginTop: '15px', maxHeight: '250px', overflowY: 'auto' }}>
                <table className="directory-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Grade (Division)</th>
                      <th>Gender</th>
                      <th>Total Meals Booked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMealsList.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.id}</strong></td>
                        <td>{item.name}</td>
                        <td>
                          <span className="student-block-badge">
                            {item.division}
                          </span>
                        </td>
                        <td>{item.gender}</td>
                        <td>
                          <span className="badge approved" style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                            {item.mealCount} Meals
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complaints Register with Sorting */}
            <div className="dashboard-panel dashboard-full">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h2 className="panel-title">{ICONS.complaint} Student Tickets register</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort By:</span>
                  <select 
                    className="filter-select"
                    value={complaintsSortOption}
                    onChange={(e) => setComplaintsSortOption(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    <option value="none">Default (Date)</option>
                    <option value="grade">Grade (Class)</option>
                    <option value="gender">Gender</option>
                  </select>
                </div>
              </div>

              <div className="directory-table-wrapper" style={{ marginTop: '15px', maxHeight: '250px', overflowY: 'auto' }}>
                <table className="directory-table">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Student Name</th>
                      <th>Grade (Division)</th>
                      <th>Gender</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedComplaintsList.map(item => (
                      <tr key={item.complaintId}>
                        <td><strong>{item.complaintId}</strong></td>
                        <td>{item.studentName}</td>
                        <td>
                          <span className="student-block-badge">
                            {item.division}
                          </span>
                        </td>
                        <td>{item.gender}</td>
                        <td>{item.category}</td>
                        <td>{item.subject}</td>
                        <td>
                          <span className={`badge ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Administrator & Staff Directory */}
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
            onViewStudent={handleViewStudentDetails} 
          />
        );

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

      case 'menu': return 'Mess Menu Management';
      case 'dining': return 'Meal Data & Acceptance';
      case 'directory': return 'Student Directory';

      case 'health': return 'Health & Medical Logs';
      case 'behaviour': return 'Student Behaviour Register';
      case 'complaints': return 'Student Tickets Desk';
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
            {ICONS.complaint} Tickets
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
