// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '../../redux/auth/authSlice';
import { fetchDirectoryThunk, registerStudentThunk } from '../../redux/student/studentSlice';
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

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const db = useSelector((state) => state.student.directory) || [];

  const [activeTab, setActiveTab] = useState('menu');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Student Detail Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Add Student Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBlock, setNewBlock] = useState('A');
  const [newRoom, setNewRoom] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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



  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    if (!newName.trim() || !newRoom.trim() || !newEmail.trim() || !newPhone.trim()) {
      dispatch(addToast({ message: 'All fields are required.', type: 'warning' }));
      return;
    }

    setIsSubmitting(true);
    dispatch(registerStudentThunk({
      name: newName,
      block: newBlock,
      room: newRoom,
      email: newEmail,
      phone: newPhone,
      photo: newPhoto.trim() || undefined
    })).then((res) => {
      setIsSubmitting(false);
      if (!res.error) {
        dispatch(addToast({ message: 'Student registered successfully!', type: 'success' }));
        setAddModalOpen(false);
        // Reset form
        setNewName('');
        setNewBlock('A');
        setNewRoom('');
        setNewEmail('');
        setNewPhone('');
        setNewPhoto('');
      } else {
        dispatch(addToast({ message: res.payload || 'Registration failed.', type: 'error' }));
      }
    });
  };

  const renderActiveSection = () => {
    switch (activeTab) {
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
        return <ComplaintsSection role="admin" />;
      default:
        return <MessMenuSection />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'menu': return 'Mess Menu Management';
      case 'dining': return 'Meal Data & Acceptance';
      case 'directory': return 'Student Directory';

      case 'health': return 'Health & Medical Logs';
      case 'behaviour': return 'Student Behaviour Register';
      case 'complaints': return 'Student Tickets Desk';
      default: return 'Campus Admin Console';
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
          {ICONS.settings}
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
          {ICONS.settings}
          <span>Campus Admin</span>
        </div>
        
        <div className="sidebar-profile">
          <div className="profile-avatar" style={{ background: 'var(--primary)', color: 'white' }}>A</div>
          <div className="profile-info">
            <span className="profile-name">Admin Console</span>
            <span className="profile-role">Transcend Campus</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
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
            <p>Admin Control Panel • {db.length} Student Capacity</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'directory' && (
              <button 
                className="btn-primary" 
                onClick={() => setAddModalOpen(true)}
              >
                {ICONS.plus} Add Student
              </button>
            )}
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

      {/* Register New Student Modal */}
      {addModalOpen && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 995 }}>
          <div className="modal-container" style={{ maxWidth: '520px', width: '90%', padding: '24px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Student</h3>
              <button className="modal-close" onClick={() => setAddModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-student-name">Full Name</label>
                <input 
                  type="text" 
                  id="new-student-name" 
                  className="form-input" 
                  required 
                  placeholder="John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-student-block">Block</label>
                  <select 
                    id="new-student-block" 
                    className="form-input" 
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    required
                  >
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                    <option value="C">Block C</option>
                    <option value="D">Block D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-student-room">Room Number</label>
                  <input 
                    type="text" 
                    id="new-student-room" 
                    className="form-input" 
                    required 
                    placeholder="101"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-student-email">Email Address</label>
                <input 
                  type="email" 
                  id="new-student-email" 
                  className="form-input" 
                  required 
                  placeholder="john@hostel.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-student-phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="new-student-phone" 
                  className="form-input" 
                  required 
                  placeholder="+91 98765 43210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-student-photo">Photo URL (Optional)</label>
                <input 
                  type="url" 
                  id="new-student-photo" 
                  className="form-input" 
                  placeholder="https://images.unsplash.com/..."
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ margin: 0 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
