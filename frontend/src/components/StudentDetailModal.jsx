// src/components/StudentDetailModal.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBehaviourThunk } from '../redux/behaviour/behaviourSlice';
import { fetchDirectoryThunk } from '../redux/student/studentSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';
import { formatDisplayDate, getDateString } from '../utils/dateUtils';
import { formatTimeTo12Hr } from '../utils/timeUtils';
import { isMealBooked } from '../utils/db';
import CustomConfirmModal from './common/CustomConfirmModal';

const StudentDetailModal = ({ isOpen, studentId, isReadOnly, onClose }) => {
  const dispatch = useDispatch();
  const directory = useSelector((state) => state.student.directory) || [];
  const currentUser = useSelector((state) => state.auth.user);

  // Behavior log edit form state
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [logDate, setLogDate] = useState(getDateString(0));
  const [logCategory, setLogCategory] = useState('General');
  const [logSeverity, setLogSeverity] = useState('neutral');
  const [logDescription, setLogDescription] = useState('');

  // Delete confirm state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, logId: null });

  if (!isOpen || !studentId) return null;

  const student = directory.find(s => s.id === studentId);
  if (!student) return null;


  const sortedLogs = [...(student.behaviourLogs || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

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
    setLogDate(getDateString(0));
    setLogCategory('General');
    setLogSeverity('neutral');
    setLogDescription('');
    setLogFormOpen(true);
  };

  const handleOpenEdit = (log) => {
    setEditingLogId(log.id);
    setLogDate(log.date);
    setLogCategory(log.category);
    setLogSeverity(log.severity);
    setLogDescription(log.description);
    setLogFormOpen(true);
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
      studentId: student.id,
      logData,
      actionType: editingLogId ? 'edit' : 'add'
    })).then((res) => {
      if (res.payload?.success) {
        dispatch(addToast({
          message: editingLogId ? 'Behaviour log updated!' : 'Behaviour log added!',
          type: 'success'
        }));
        setLogFormOpen(false);
        dispatch(fetchDirectoryThunk());
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to save log entry.', type: 'error' }));
      }
    });
  };

  const handleDeleteRequest = (logId) => {
    setDeleteModal({ isOpen: true, logId });
  };

  const handleConfirmDelete = () => {
    const { logId } = deleteModal;
    setDeleteModal({ isOpen: false, logId: null });

    dispatch(updateBehaviourThunk({
      studentId: student.id,
      logData: { id: logId },
      actionType: 'delete'
    })).then((res) => {
      if (res.payload?.success) {
        dispatch(addToast({ message: 'Behaviour log deleted successfully', type: 'success' }));
        dispatch(fetchDirectoryThunk());
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to delete log entry.', type: 'error' }));
      }
    });
  };

  return (
    <>
      <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 990 }}>
        <div className="modal-container" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
          <div className="modal-header" style={{ marginBottom: '15px' }}>
            <h3 className="modal-title">Student Profile</h3>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '15px' }}>
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '36px', fontWeight: '800', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)', flexShrink: 0, overflow: 'hidden' }}>
              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{student.name}</h3>
              <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600', display: 'block', marginTop: '4px' }}>{student.id} • Room {student.room} ({student.block})</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Roll Number</span><br />
              <strong>{student.id}</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Room &amp; Block</span><br />
              <strong>Room {student.room} (Block {student.block})</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span><br />
              <span style={{ fontSize: '13px' }}>{student.email}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</span><br />
              <span style={{ fontSize: '13px' }}>{student.phone}</span>
            </div>

          </div>
          


          {/* Meal Bookings Log */}
          <div style={{ maxHeight: '140px', overflowY: 'auto', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
            <h4 style={{ fontSize: '13px', margin: '8px 0', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Meal Bookings Log</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(!student.mealBookings || student.mealBookings.length === 0) ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>No meals booked for the upcoming week.</p>
              ) : (
                student.mealBookings.map((b, idx) => {
                  const activeMeals = [
                    isMealBooked(student, b.date, 'breakfast') ? 'Breakfast' : '',
                    isMealBooked(student, b.date, 'lunch') ? 'Lunch' : '',
                    isMealBooked(student, b.date, 'snacks') ? 'Snacks' : '',
                    isMealBooked(student, b.date, 'dinner') ? 'Dinner' : ''
                  ].filter(Boolean);
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', marginBottom: '6px' }}>
                      <span><strong>{formatDisplayDate(b.date)}</strong></span>
                      <span style={{ fontSize: '11px', color: 'var(--primary)' }}>
                        {activeMeals.join(', ') || 'No Meals Selected'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Behaviour & Observation Log */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
              <h4 style={{ fontSize: '13px', margin: 0, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Behaviour &amp; Observation Log</h4>
              {!isReadOnly && (
                <button 
                  className="btn-primary" 
                  style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}
                  onClick={handleOpenAdd}
                >
                  + Add Entry
                </button>
              )}
            </div>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sortedLogs.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>No behaviour records found.</p>
              ) : (
                sortedLogs.map((log) => (
                  <div key={log.id} style={{ background: 'var(--bg-input)', borderLeft: `4px solid ${log.severity === 'positive' ? 'var(--success)' : log.severity === 'warning' ? 'var(--warning)' : log.severity === 'critical' ? 'var(--danger)' : 'var(--text-muted)'}`, padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        <strong>{formatDisplayDate(log.date)}</strong>
                        <span className={getSeverityBadgeClass(log.severity)} style={{ fontSize: '9px', padding: '2px 5px', marginLeft: '6px', textTransform: 'uppercase' }}>{getSeverityLabel(log.severity)}</span>
                      </span>
                      {!isReadOnly && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-edit-log" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 600, padding: 0 }} onClick={() => handleOpenEdit(log)}>Edit</button>
                          <button className="btn-delete-log" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '11px', fontWeight: 600, padding: 0 }} onClick={() => handleDeleteRequest(log.id)}>Delete</button>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', fontParagraph: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category: {log.category}</div>
                    <p style={{ margin: '2px 0', color: 'var(--text-primary)', lineHeight: 1.35 }}>{log.description}</p>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'right', fontStyle: 'italic' }}>By: {log.recordedBy || 'System'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Log Entry Add/Edit Modal */}
      {logFormOpen && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 995 }}>
          <div className="modal-container" style={{ maxWidth: '460px', width: '90%', padding: '20px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingLogId ? 'Edit Behaviour Log' : 'Add Behaviour Log'}</h3>
              <button className="modal-close" onClick={() => setLogFormOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={logDate} onChange={(e) => setLogDate(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={logCategory} onChange={(e) => setLogCategory(e.target.value)} required>
                    <option value="Academic">Academic</option>
                    <option value="Discipline">Discipline</option>
                    <option value="Social">Social</option>
                    <option value="General">General / Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Severity / Type</label>
                <select className="form-input" value={logSeverity} onChange={(e) => setLogSeverity(e.target.value)} required>
                  <option value="positive">Commendable (Positive Action)</option>
                  <option value="neutral">General (Neutral Observation)</option>
                  <option value="warning">Warning (Minor Offense)</option>
                  <option value="critical">Critical (Major Offense)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Detailed Description</label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  placeholder="Describe the observation..." 
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '5px' }}>
                <button type="button" className="btn-secondary" onClick={() => setLogFormOpen(false)}>Cancel</button>
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
        message="Are you sure you want to delete this behaviour log entry?"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, logId: null })}
      />
    </>
  );
};

export default StudentDetailModal;
