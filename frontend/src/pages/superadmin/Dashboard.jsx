// src/pages/superadmin/Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
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

// Helper to parse DD-MM-YYYY or DD.MM.YYYY into month/day for calendar sorting
const parseDobSortValue = (dobStr) => {
  if (!dobStr) return 999999;
  const parts = dobStr.split(/[-.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10) || 0;
    const month = parseInt(parts[1], 10) || 0;
    return month * 31 + day;
  }
  return 999999;
};

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

  // ── 1. Directory & Birthday Filters ───────────────────────────────────────
  const [searchDir, setSearchDir] = useState('');
  const [genderFilterDir, setGenderFilterDir] = useState('all');
  const [classFilterDir, setClassFilterDir] = useState('all');
  const [sortOptionDir, setSortOptionDir] = useState('id-asc');

  // ── 2. Meals Filters ───────────────────────────────────────────────────────
  const [searchMeals, setSearchMeals] = useState('');
  const [genderFilterMeals, setGenderFilterMeals] = useState('all');
  const [classFilterMeals, setClassFilterMeals] = useState('all');
  const [sortOptionMeals, setSortOptionMeals] = useState('meals-desc');

  // ── 3. Tickets Filters ────────────────────────────────────────────────────
  const [searchTickets, setSearchTickets] = useState('');
  const [statusFilterTickets, setStatusFilterTickets] = useState('all');
  const [categoryFilterTickets, setCategoryFilterTickets] = useState('all');
  const [sortOptionTickets, setSortOptionTickets] = useState('date-desc');

  // Compute unique classes/divisions dynamically
  const uniqueDivisions = useMemo(() => {
    return Array.from(new Set(db.map(s => s.division).filter(Boolean))).sort();
  }, [db]);

  // Overall analytics metrics
  const totalComplaints = useMemo(() => {
    return db.reduce((acc, s) => acc + (s.complaints ? s.complaints.length : 0), 0);
  }, [db]);

  const pendingComplaints = useMemo(() => {
    return db.reduce((acc, s) => acc + (s.complaints ? s.complaints.filter(c => c.status?.toLowerCase() === 'pending').length : 0), 0);
  }, [db]);

  const totalMeals = useMemo(() => {
    return db.reduce((acc, s) => {
      return acc + (s.mealBookings ? s.mealBookings.reduce((mAcc, b) => {
        let count = 0;
        if (b.breakfast) count++;
        if (b.lunch) count++;
        if (b.snacks) count++;
        if (b.dinner) count++;
        return mAcc + count;
      }, 0) : 0);
    }, 0);
  }, [db]);

  const femaleCount = useMemo(() => db.filter(s => (s.gender || '').toLowerCase() === 'female').length, [db]);
  const maleCount = useMemo(() => db.filter(s => (s.gender || '').toLowerCase() === 'male').length, [db]);

  // ── Filtered & Sorted Directory Students ─────────────────────────────────
  const filteredStudents = useMemo(() => {
    return db.filter(student => {
      const term = searchDir.toLowerCase().trim();
      const matchesSearch = !term || student.name.toLowerCase().includes(term) || student.id.toLowerCase().includes(term);
      const matchesGender = genderFilterDir === 'all' || (student.gender || '').toLowerCase() === genderFilterDir.toLowerCase();
      const matchesClass = classFilterDir === 'all' || student.division === classFilterDir;
      return matchesSearch && matchesGender && matchesClass;
    }).sort((a, b) => {
      if (sortOptionDir === 'id-asc') return a.id.localeCompare(b.id, undefined, { numeric: true });
      if (sortOptionDir === 'id-desc') return b.id.localeCompare(a.id, undefined, { numeric: true });
      if (sortOptionDir === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortOptionDir === 'dob-calendar') return parseDobSortValue(a.dob) - parseDobSortValue(b.dob);
      if (sortOptionDir === 'grade') return (a.division || '').localeCompare(b.division || '');
      if (sortOptionDir === 'gender') return (a.gender || '').localeCompare(b.gender || '');
      return 0;
    });
  }, [db, searchDir, genderFilterDir, classFilterDir, sortOptionDir]);

  // ── Filtered & Sorted Meal Bookings ───────────────────────────────────────
  const mealsList = useMemo(() => {
    return db.map(s => {
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
  }, [db]);

  const filteredMealsList = useMemo(() => {
    return mealsList.filter(item => {
      const term = searchMeals.toLowerCase().trim();
      const matchesSearch = !term || item.name.toLowerCase().includes(term) || item.id.toLowerCase().includes(term);
      const matchesGender = genderFilterMeals === 'all' || (item.gender || '').toLowerCase() === genderFilterMeals.toLowerCase();
      const matchesClass = classFilterMeals === 'all' || item.division === classFilterMeals;
      return matchesSearch && matchesGender && matchesClass;
    }).sort((a, b) => {
      if (sortOptionMeals === 'meals-desc') return b.mealCount - a.mealCount;
      if (sortOptionMeals === 'meals-asc') return a.mealCount - b.mealCount;
      if (sortOptionMeals === 'id-asc') return a.id.localeCompare(b.id, undefined, { numeric: true });
      if (sortOptionMeals === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortOptionMeals === 'grade') return (a.division || '').localeCompare(b.division || '');
      if (sortOptionMeals === 'gender') return (a.gender || '').localeCompare(b.gender || '');
      return 0;
    });
  }, [mealsList, searchMeals, genderFilterMeals, classFilterMeals, sortOptionMeals]);

  // ── Filtered & Sorted Tickets ─────────────────────────────────────────────
  const complaintsList = useMemo(() => {
    const list = [];
    db.forEach(s => {
      if (s.complaints) {
        s.complaints.forEach(c => {
          list.push({
            studentId: s.id,
            studentName: s.name,
            division: s.division,
            gender: s.gender,
            complaintId: c.id,
            category: c.category || 'General',
            subject: c.subject,
            status: c.status || 'Pending',
            date: c.dateReported || 'N/A'
          });
        });
      }
    });
    return list;
  }, [db]);

  const ticketCategories = useMemo(() => {
    return Array.from(new Set(complaintsList.map(c => c.category))).sort();
  }, [complaintsList]);

  const filteredComplaintsList = useMemo(() => {
    return complaintsList.filter(item => {
      const term = searchTickets.toLowerCase().trim();
      const matchesSearch = !term || 
        item.studentName.toLowerCase().includes(term) || 
        item.studentId.toLowerCase().includes(term) ||
        item.subject.toLowerCase().includes(term) ||
        item.complaintId.toLowerCase().includes(term);
      const matchesStatus = statusFilterTickets === 'all' || item.status.toLowerCase() === statusFilterTickets.toLowerCase();
      const matchesCategory = categoryFilterTickets === 'all' || item.category === categoryFilterTickets;
      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => {
      if (sortOptionTickets === 'date-desc') return (b.date || '').localeCompare(a.date || '');
      if (sortOptionTickets === 'date-asc') return (a.date || '').localeCompare(b.date || '');
      if (sortOptionTickets === 'status') return (a.status || '').localeCompare(b.status || '');
      if (sortOptionTickets === 'category') return (a.category || '').localeCompare(b.category || '');
      if (sortOptionTickets === 'name-asc') return (a.studentName || '').localeCompare(b.studentName || '');
      if (sortOptionTickets === 'grade') return (a.division || '').localeCompare(b.division || '');
      return 0;
    });
  }, [complaintsList, searchTickets, statusFilterTickets, categoryFilterTickets, sortOptionTickets]);

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Analytics Stats Grid */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ICONS.users}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Students</h4>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{db.length}</span>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
                    <span style={{ color: '#ec4899' }}>👩 {femaleCount}</span> · <span style={{ color: '#2563eb' }}>👨 {maleCount}</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(22,163,74,0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ICONS.coffee}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Meals Booked</h4>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: '#16a34a' }}>{totalMeals}</span>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
                    ~{db.length > 0 ? (totalMeals / db.length).toFixed(1) : 0} avg / student
                  </div>
                </div>
              </div>

              <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ICONS.complaint}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Tickets</h4>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: '#ef4444' }}>{totalComplaints}</span>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
                    <span style={{ color: '#ef4444' }}>{pendingComplaints} Pending</span> · <span style={{ color: '#16a34a' }}>{totalComplaints - pendingComplaints} Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 1. Student Birthday & Class Directory Panel ───────────────────────── */}
            <div className="dashboard-panel dashboard-full">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 className="panel-title" style={{ margin: 0 }}>{ICONS.calendar} Student Birthday &amp; Class Directory</h2>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px' }}>
                    {filteredStudents.length} of {db.length}
                  </span>
                </div>
              </div>

              {/* Controls Bar: Search, Gender, Class, Sort */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', margin: '14px 0', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                {/* Search */}
                <div className="search-input-wrapper" style={{ flex: 1, minWidth: '180px' }}>
                  {ICONS.search}
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search name or ID..."
                    value={searchDir}
                    onChange={(e) => setSearchDir(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>

                {/* Gender Filter */}
                <select
                  className="filter-select"
                  value={genderFilterDir}
                  onChange={(e) => setGenderFilterDir(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}
                >
                  <option value="all">All Genders</option>
                  <option value="female">Female Only</option>
                  <option value="male">Male Only</option>
                </select>

                {/* Class Filter */}
                <select
                  className="filter-select"
                  value={classFilterDir}
                  onChange={(e) => setClassFilterDir(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}
                >
                  <option value="all">All Classes</option>
                  {uniqueDivisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>

                {/* Sort dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort:</span>
                  <select
                    className="filter-select"
                    value={sortOptionDir}
                    onChange={(e) => setSortOptionDir(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontWeight: 600 }}
                  >
                    <option value="id-asc">ID (Low → High)</option>
                    <option value="id-desc">ID (High → Low)</option>
                    <option value="name-asc">Name (A → Z)</option>
                    <option value="dob-calendar">Date of Birth (Jan → Dec)</option>
                    <option value="grade">Grade / Class</option>
                    <option value="gender">Gender</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="directory-table-wrapper" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className="directory-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th>Grade (Division)</th>
                      <th>Gender</th>
                      <th>Date of Birth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No students match the active search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => (
                        <tr 
                          key={student.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleViewStudentDetails(student.id)}
                        >
                          <td><strong style={{ color: 'var(--primary)' }}>{student.id}</strong></td>
                          <td>
                            <strong style={{ fontSize: '13px' }}>{student.name}</strong>
                          </td>
                          <td>
                            <span className="student-block-badge">
                              {student.division}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: student.gender?.toLowerCase() === 'female' ? '#ec4899' : '#2563eb' }}>
                              {student.gender === 'Female' ? '👧 Female' : '👦 Male'}
                            </span>
                          </td>
                          <td>
                            <span className="badge info" style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>
                              🎂 {student.dob || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 2. Meal Bookings Breakdown Panel ─────────────────────────────────── */}
            <div className="dashboard-panel dashboard-full">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 className="panel-title" style={{ margin: 0 }}>{ICONS.coffee} Meal Bookings Breakdown</h2>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px' }}>
                    {filteredMealsList.length} of {db.length}
                  </span>
                </div>
              </div>

              {/* Controls Bar: Search, Gender, Class, Sort */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', margin: '14px 0', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                {/* Search */}
                <div className="search-input-wrapper" style={{ flex: 1, minWidth: '180px' }}>
                  {ICONS.search}
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search name or ID..."
                    value={searchMeals}
                    onChange={(e) => setSearchMeals(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>

                {/* Gender Filter */}
                <select
                  className="filter-select"
                  value={genderFilterMeals}
                  onChange={(e) => setGenderFilterMeals(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}
                >
                  <option value="all">All Genders</option>
                  <option value="female">Female Only</option>
                  <option value="male">Male Only</option>
                </select>

                {/* Class Filter */}
                <select
                  className="filter-select"
                  value={classFilterMeals}
                  onChange={(e) => setClassFilterMeals(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}
                >
                  <option value="all">All Classes</option>
                  {uniqueDivisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>

                {/* Sort dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort:</span>
                  <select
                    className="filter-select"
                    value={sortOptionMeals}
                    onChange={(e) => setSortOptionMeals(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontWeight: 600 }}
                  >
                    <option value="meals-desc">Most Meals Booked (High → Low)</option>
                    <option value="meals-asc">Least Meals Booked (Low → High)</option>
                    <option value="id-asc">ID (Low → High)</option>
                    <option value="name-asc">Name (A → Z)</option>
                    <option value="grade">Grade / Class</option>
                    <option value="gender">Gender</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="directory-table-wrapper" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className="directory-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th>Grade (Division)</th>
                      <th>Gender</th>
                      <th>Total Meals Booked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMealsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No meal records match the active search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredMealsList.map(item => (
                        <tr 
                          key={item.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleViewStudentDetails(item.id)}
                        >
                          <td><strong style={{ color: 'var(--primary)' }}>{item.id}</strong></td>
                          <td><strong style={{ fontSize: '13px' }}>{item.name}</strong></td>
                          <td>
                            <span className="student-block-badge">
                              {item.division}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: item.gender?.toLowerCase() === 'female' ? '#ec4899' : '#2563eb' }}>
                              {item.gender === 'Female' ? '👧 Female' : '👦 Male'}
                            </span>
                          </td>
                          <td>
                            <span className="badge approved" style={{ padding: '4px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                              🍽️ {item.mealCount} Meals
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 3. Student Tickets Register Panel ─────────────────────────────────── */}
            <div className="dashboard-panel dashboard-full">
              <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 className="panel-title" style={{ margin: 0 }}>{ICONS.complaint} Student Tickets Register</h2>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px' }}>
                    {filteredComplaintsList.length} Tickets
                  </span>
                </div>
              </div>

              {/* Controls Bar: Search, Status, Category, Sort */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', margin: '14px 0', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                {/* Search */}
                <div className="search-input-wrapper" style={{ flex: 1, minWidth: '180px' }}>
                  {ICONS.search}
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search subject, name, ticket ID..."
                    value={searchTickets}
                    onChange={(e) => setSearchTickets(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>

                {/* Status Filter */}
                <select
                  className="filter-select"
                  value={statusFilterTickets}
                  onChange={(e) => setStatusFilterTickets(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Only</option>
                  <option value="closed">Closed Only</option>
                </select>

                {/* Category Filter */}
                <select
                  className="filter-select"
                  value={categoryFilterTickets}
                  onChange={(e) => setCategoryFilterTickets(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}
                >
                  <option value="all">All Categories</option>
                  {ticketCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Sort dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort:</span>
                  <select
                    className="filter-select"
                    value={sortOptionTickets}
                    onChange={(e) => setSortOptionTickets(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontWeight: 600 }}
                  >
                    <option value="date-desc">Latest Date First</option>
                    <option value="date-asc">Oldest Date First</option>
                    <option value="status">Status (Pending First)</option>
                    <option value="category">Category</option>
                    <option value="name-asc">Student Name (A → Z)</option>
                    <option value="grade">Grade / Class</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="directory-table-wrapper" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className="directory-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Student Name</th>
                      <th>Grade (Division)</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaintsList.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No tickets match the active search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaintsList.map(item => (
                        <tr key={item.complaintId}>
                          <td><strong style={{ color: 'var(--primary)' }}>{item.complaintId}</strong></td>
                          <td><strong style={{ fontSize: '13px' }}>{item.studentName}</strong></td>
                          <td>
                            <span className="student-block-badge">
                              {item.division}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', background: '#f1f5f9', color: '#475569', borderRadius: '4px' }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.subject}
                          </td>
                          <td>
                            <span className={`badge ${item.status.toLowerCase()}`}>
                              {item.status}
                            </span>
                          </td>
                          <td><span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.date}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 4. Administrator & Staff Directory Panel ─────────────────────────── */}
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
                        <td><strong>{user.name}</strong></td>
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
