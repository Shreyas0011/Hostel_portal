// src/components/BehaviourLogsSection.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBehaviourThunk } from '../redux/behaviour/behaviourSlice';
import { fetchDirectoryThunk } from '../redux/student/studentSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';
import { formatDisplayDate, getDateString } from '../utils/dateUtils';
import CustomConfirmModal from './common/CustomConfirmModal';

const BehaviourLogsSection = ({ student, isReadOnly, showFullRegistry }) => {
  const dispatch = useDispatch();
  const db = useSelector((state) => state.student.directory) || [];
  const currentUser = useSelector((state) => state.auth.user);

  // Search & Filter state (for registry view)
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [targetStudentId, setTargetStudentId] = useState('');
  const [logDate, setLogDate] = useState(getDateString(0));
  const [logCategory, setLogCategory] = useState('General');
  const [logSeverity, setLogSeverity] = useState('neutral');
  const [logDescription, setLogDescription] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, logId: null, studentId: null });

  // Gather logs
  let logsList = [];
  if (showFullRegistry) {
    db.forEach(s => {
      if (s.behaviourLogs) {
        s.behaviourLogs.forEach(log => {
          logsList.push({
            studentId: s.id,
            studentName: s.name,
            studentRoom: s.room,
            studentBlock: s.block,
            ...log
          });
        });
      }
    });
  } else if (student) {
    const freshStudent = db.find(s => s.id === student.id) || student;
    const studentLogs = freshStudent.behaviourLogs || [];
    logsList = studentLogs.map(log => ({
      studentId: freshStudent.id,
      studentName: freshStudent.name,
      studentRoom: freshStudent.room,
      studentBlock: freshStudent.block,
      ...log
    }));
  }

  // Filter & Sort
  const filteredLogs = logsList.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

    return matchesSearch && matchesCategory && matchesSeverity;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'positive': return 'badge approved';
      case 'warning': return 'badge pending';
      case 'critical': return 'badge rejected';
      default: return 'badge info';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'positive': return 'Commendable';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'General';
    }
  };

  const handleOpenAdd = () => {
    setEditingLogId(null);
    setTargetStudentId(student ? student.id : (db[0]?.id || ''));
    setLogDate(getDateString(0));
    setLogCategory('General');
    setLogSeverity('neutral');
    setLogDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (log) => {
    setEditingLogId(log.id);
    setTargetStudentId(log.studentId);
    setLogDate(log.date);
    setLogCategory(log.category);
    setLogSeverity(log.severity);
    setLogDescription(log.description);
    setModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!logDescription.trim()) {
      dispatch(addToast({ message: 'Description is required.', type: 'warning' }));
      return;
    }

    const recordedBy = currentUser ? (currentUser.role === 'Admin' ? 'Campus Admin Console' : (currentUser.role === 'SuperAdmin' ? 'Super Admin Control' : 'Chief Warden Console')) : 'System';

    const logData = {
      id: editingLogId || undefined,
      date: logDate,
      category: logCategory,
      severity: logSeverity,
      description: logDescription,
      recordedBy
    };

    dispatch(updateBehaviourThunk({
      studentId: targetStudentId,
      logData,
      actionType: editingLogId ? 'edit' : 'add'
    })).then((res) => {
      if (res.payload?.success) {
        dispatch(addToast({
          message: editingLogId ? 'Behaviour log updated!' : 'Behaviour log added!',
          type: 'success'
        }));
        setModalOpen(false);
        dispatch(fetchDirectoryThunk());
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to save log entry.', type: 'error' }));
      }
    });
  };

  const handleDeleteRequest = (logId, studentId) => {
    setDeleteModal({ isOpen: true, logId, studentId });
  };

  const handleConfirmDelete = () => {
    const { logId, studentId } = deleteModal;
    setDeleteModal({ isOpen: false, logId: null, studentId: null });

    dispatch(updateBehaviourThunk({
      studentId,
      logData: { id: logId },
      actionType: 'delete'
    })).then((res) => {
      if (res.payload?.success) {
        dispatch(addToast({ message: 'Behaviour log entry removed successfully.', type: 'success' }));
        dispatch(fetchDirectoryThunk());
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to remove entry.', type: 'error' }));
      }
    });
  };

  return (
    <>
      <div className="dashboard-panel dashboard-full">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {ICONS.clipboard} {showFullRegistry ? 'Student Behaviour & Observation Registry' : 'Behaviour & Observation Log'}
            </h2>
            {!showFullRegistry && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Official records of student conduct and commendations
              </p>
            )}
          </div>
          {!isReadOnly && (
            <button 
              className="btn-primary" 
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600 }}
              onClick={handleOpenAdd}
            >
              + {showFullRegistry ? 'Record Observation' : 'Add Log Entry'}
            </button>
          )}
        </div>

        {/* Filters if Registry View or if list is large */}
        {showFullRegistry && (
          <div className="filter-row" style={{ marginBottom: '20px' }}>
            <div className="search-input-wrapper">
              {ICONS.search}
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by student, ID, details..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-actions">
              <select 
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Academic">Academic</option>
                <option value="Discipline">Discipline</option>
                <option value="Social">Social</option>
                <option value="General">General / Other</option>
              </select>
              
              <select 
                className="filter-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="positive">Commendable</option>
                <option value="neutral">General</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        )}

        {/* List View as Table for Registry, or Cards for Student detail */}
        {showFullRegistry ? (
          <div className="directory-table-wrapper">
            <table className="directory-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>{isReadOnly ? 'Recorder' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No behaviour logs found matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <strong>{log.studentName}</strong>
                        <br />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {log.studentId} • Room {log.studentRoom}
                        </span>
                      </td>
                      <td>{formatDisplayDate(log.date)}</td>
                      <td><span style={{ fontWeight: 600, fontSize: '12px' }}>{log.category}</span></td>
                      <td>
                        <span className={getSeverityBadgeClass(log.severity)} style={{ fontSize: '10px', padding: '3px 8px', textTransform: 'uppercase' }}>
                          {getSeverityLabel(log.severity)}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={log.description}>
                        "{log.description}"
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {!isReadOnly ? (
                            <>
                              <button 
                                className="table-btn" 
                                onClick={() => handleOpenEdit(log)}
                              >
                                Edit
                              </button>
                              <button 
                                className="table-btn" 
                                style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
                                onClick={() => handleDeleteRequest(log.id, log.studentId)}
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                              By: {log.recordedBy || 'System'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📋</span>
                No behaviour logs or observations recorded.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div 
                  key={log.id}
                  style={{ 
                    borderLeft: `4px solid ${
                      log.severity === 'positive' ? 'var(--success)' : 
                      log.severity === 'warning' ? 'var(--warning)' : 
                      log.severity === 'critical' ? 'var(--danger)' : 'var(--text-muted)'
                    }`, 
                    background: 'var(--bg-card)', 
                    padding: '16px 20px', 
                    marginBottom: '12px', 
                    borderRadius: 'var(--radius-sm)', 
                    borderTop: '1px solid var(--border-color)', 
                    borderRight: '1px solid var(--border-color)', 
                    borderBottom: '1px solid var(--border-color)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '6px' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {formatDisplayDate(log.date)}
                      </span>
                      <span className={getSeverityBadgeClass(log.severity)} style={{ fontSize: '10px', marginLeft: '8px', textTransform: 'uppercase', padding: '2px 6px' }}>
                        {getSeverityLabel(log.severity)}
                      </span>
                    </div>
                    {!isReadOnly && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-edit-log" 
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: '2px' }}
                          onClick={() => handleOpenEdit(log)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete-log" 
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: '2px' }}
                          onClick={() => handleDeleteRequest(log.id, log.studentId)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Category: {log.category}
                  </div>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                    {log.description}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right', fontStyle: 'italic', marginTop: '4px' }}>
                    Recorded by: {log.recordedBy || 'System'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Record Observation Dialog Modal */}
      {modalOpen && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-container" style={{ maxWidth: '500px', width: '90%', padding: '24px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingLogId ? 'Edit Behaviour Log Entry' : showFullRegistry ? 'Record Student Observation' : 'Add Behaviour Log'}
              </h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {showFullRegistry && !editingLogId && (
                <div className="form-group">
                  <label className="form-label" htmlFor="behaviour-student-select">Select Student</label>
                  <select 
                    id="behaviour-student-select" 
                    className="form-input"
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    required
                  >
                    {db.map(s => (
                      <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="behaviour-date">Date</label>
                  <input 
                    type="date" 
                    id="behaviour-date" 
                    className="form-input" 
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="behaviour-category">Category</label>
                  <select 
                    id="behaviour-category" 
                    className="form-input"
                    value={logCategory}
                    onChange={(e) => setLogCategory(e.target.value)}
                    required
                  >
                    <option value="Academic">Academic</option>
                    <option value="Discipline">Discipline</option>
                    <option value="Social">Social</option>
                    <option value="General">General / Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="behaviour-severity">Severity / Type</label>
                <select 
                  id="behaviour-severity" 
                  className="form-input"
                  value={logSeverity}
                  onChange={(e) => setLogSeverity(e.target.value)}
                  required
                >
                  <option value="positive">Commendable (Positive Action)</option>
                  <option value="neutral">General (Neutral Observation)</option>
                  <option value="warning">Warning (Minor Offense)</option>
                  <option value="critical">Critical (Major Offense)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="behaviour-description">Detailed Description</label>
                <textarea 
                  id="behaviour-description" 
                  className="form-textarea" 
                  required 
                  placeholder="Describe the behavior or observation in detail..." 
                  style={{ minHeight: '100px' }}
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ margin: 0 }}>
                  {editingLogId ? 'Update Log' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CustomConfirmModal 
        isOpen={deleteModal.isOpen}
        title="Remove Behaviour Entry"
        message="Are you sure you want to delete this student conduct log entry? This action cannot be undone."
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, logId: null, studentId: null })}
      />
    </>
  );
};

export default BehaviourLogsSection;
