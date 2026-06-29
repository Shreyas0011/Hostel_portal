// src/components/LeaveSection.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyLeaveThunk, cancelLeaveThunk, approveLeaveThunk, rejectLeaveThunk } from '../redux/leave/leaveSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';
import { getDateString, formatDisplayDate } from '../utils/dateUtils';
import { formatTimeTo12Hr } from '../utils/timeUtils';

const LeaveSection = ({ student, role }) => {
  const dispatch = useDispatch();
  const db = useSelector((state) => state.student.directory);
  
  // Find fresh student from store directory to ensure UI is reactive
  const freshStudent = db.find(s => s.id === student.id) || student;
  const leaves = freshStudent.leaves || [];
  const sortedLeaves = [...leaves].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const [overnight, setOvernight] = useState(true);
  const [startDate, setStartDate] = useState(getDateString(0));
  const [endDate, setEndDate] = useState(getDateString(0));
  
  const [startHour, setStartHour] = useState('9');
  const [startMinute, setStartMinute] = useState('0');
  const [startAmPm, setStartAmPm] = useState('AM');
  
  const [endHour, setEndHour] = useState('6');
  const [endMinute, setEndMinute] = useState('0');
  const [endAmPm, setEndAmPm] = useState('PM');
  
  const [type, setType] = useState('leave');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const actualEndDate = overnight ? endDate : startDate;
    
    if (overnight && new Date(startDate) > new Date(actualEndDate)) {
      dispatch(addToast({ message: 'End Date cannot be before Start Date.', type: 'error' }));
      return;
    }

    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} ${startAmPm}`;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')} ${endAmPm}`;

    const leaveData = {
      startDate,
      endDate: actualEndDate,
      startTime,
      endTime,
      type,
      reason,
      isOvernight: overnight,
      submittedBy: role,
      status: role === 'parent' ? 'approved' : 'pending' // Parents auto-approve their own requests
    };

    dispatch(applyLeaveThunk({ studentId: freshStudent.id, leaveData })).then((res) => {
      if (!res.error) {
        dispatch(addToast({
          message: `${type === 'outing' ? 'Outing' : 'Leave'} request submitted successfully!`,
          type: 'success'
        }));
        // Reset form
        setReason('');
      } else {
        dispatch(addToast({
          message: res.payload || 'Failed to submit leave request.',
          type: 'error'
        }));
      }
    });
  };

  const handleCancelLeave = (leaveId) => {
    dispatch(cancelLeaveThunk({ studentId: freshStudent.id, leaveId })).then((res) => {
      if (!res.error) {
        dispatch(addToast({ message: 'Request cancelled successfully', type: 'info' }));
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to cancel request.', type: 'error' }));
      }
    });
  };

  const handleApprove = (stuId, leaveId) => {
    dispatch(approveLeaveThunk({ studentId: stuId, leaveId })).then((res) => {
      if (!res.error) {
        dispatch(addToast({ message: "Child's request approved and meals locked.", type: 'success' }));
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to approve request.', type: 'error' }));
      }
    });
  };

  const handleReject = (stuId, leaveId) => {
    dispatch(rejectLeaveThunk({ studentId: stuId, leaveId })).then((res) => {
      if (!res.error) {
        dispatch(addToast({ message: "Child's request rejected.", type: 'info' }));
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to reject request.', type: 'error' }));
      }
    });
  };

  return (
    <div className="dashboard-grid">
      {/* Apply Leave Panel */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">{ICONS.calendar} {role === 'parent' ? 'Request Leave/Outing for Child' : 'Request Leave/Outing'}</h2>
        </div>
        
        <div className="leave-alert-banner" style={{ display: 'flex', gap: '10px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
          {ICONS.alert}
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: '#b45309' }}>Notice for Leave Food Cancellations</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#d97706', lineHeight: '1.4' }}>Applying leave or outing will automatically cancel and hide breakfast, lunch, snacks, and dinner options for the selected dates, helping prevent food wastage in the mess.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '15px' }}>
              <div>
                <label className="form-label" style={{ margin: 0, fontWeight: 600, display: 'block' }}>Overnight Stay?</label>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Will you be staying out of the hostel overnight?</span>
              </div>
              <div className="toggle-container" style={{ display: 'inline-block', position: 'relative' }}>
                <input 
                  type="checkbox" 
                  id="leave-overnight" 
                  className="toggle-checkbox" 
                  checked={overnight}
                  onChange={(e) => setOvernight(e.target.checked)}
                />
                <label htmlFor="leave-overnight" className="toggle-switch-label">
                  <span className="toggle-switch-handle"></span>
                </label>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="leave-start-date">Start Date</label>
              <input 
                type="date" 
                id="leave-start-date" 
                className="form-input" 
                required 
                min={getDateString(0)}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {overnight && (
              <div id="end-date-container">
                <label className="form-label" htmlFor="leave-end-date">End Date</label>
                <input 
                  type="date" 
                  id="leave-end-date" 
                  className="form-input" 
                  required 
                  min={getDateString(0)}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Departure Time</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select 
                  id="leave-start-hour" 
                  className="form-input" 
                  style={{ flex: 1, padding: '10px 8px', fontWeight: 600 }} 
                  required
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                  ))}
                </select>
                <span style={{ fontWeight: 'bold', color: '#4b5563' }}>:</span>
                <select 
                  id="leave-start-minute" 
                  className="form-input" 
                  style={{ flex: 1, padding: '10px 8px', fontWeight: 600 }} 
                  required
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                >
                  {Array.from({length: 60}, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                  ))}
                </select>
                <select 
                  id="leave-start-ampm" 
                  className="form-input" 
                  style={{ flex: 1.2, padding: '10px 8px', fontWeight: 700 }} 
                  required
                  value={startAmPm}
                  onChange={(e) => setStartAmPm(e.target.value)}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Return Time</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select 
                  id="leave-end-hour" 
                  className="form-input" 
                  style={{ flex: 1, padding: '10px 8px', fontWeight: 600 }} 
                  required
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                  ))}
                </select>
                <span style={{ fontWeight: 'bold', color: '#4b5563' }}>:</span>
                <select 
                  id="leave-end-minute" 
                  className="form-input" 
                  style={{ flex: 1, padding: '10px 8px', fontWeight: 600 }} 
                  required
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                >
                  {Array.from({length: 60}, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                  ))}
                </select>
                <select 
                  id="leave-end-ampm" 
                  className="form-input" 
                  style={{ flex: 1.2, padding: '10px 8px', fontWeight: 700 }} 
                  required
                  value={endAmPm}
                  onChange={(e) => setEndAmPm(e.target.value)}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="form-group-full" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="leave-type">Request Type</label>
              <select 
                id="leave-type" 
                className="form-input" 
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="leave">On Leave (Hostel Exit)</option>
                <option value="outing">Going Out (Day Outing / Local Outing)</option>
              </select>
            </div>

            <div className="form-group-full" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="leave-reason">Reason</label>
              <textarea 
                id="leave-reason" 
                className="form-textarea" 
                required 
                placeholder={role === 'parent' ? "Describe the reason for your child's request..." : "Describe the reason for your request..."}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '15px' }}>{ICONS.plus} Submit Request</button>
        </form>
      </div>

      {/* History of leaves */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">Request History</h2>
        </div>
        
        <div className="history-list" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {sortedLeaves.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '30px' }}>
              {ICONS.calendar}
              <p style={{ marginTop: '10px', color: '#6b7280' }}>No requests found</p>
            </div>
          ) : (
            sortedLeaves.map(leave => (
              <div key={leave.id} className="history-item" style={{ border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="history-details">
                  <span className="history-dates" style={{ fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>
                    {formatDisplayDate(leave.startDate)} {leave.startTime ? `(${formatTimeTo12Hr(leave.startTime)})` : ''} to {formatDisplayDate(leave.endDate)} {leave.endTime ? `(${formatTimeTo12Hr(leave.endTime)})` : ''}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px', marginBottom: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Type: {leave.type === 'outing' ? 'Going Out' : 'On Leave'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                      • {leave.isOvernight ? 'Overnight' : 'Same Day'}
                    </span>
                  </div>
                  <span className="history-reason" style={{ display: 'block', fontSize: '13px', fontStyle: 'italic', color: '#4b5563' }}>"{leave.reason}"</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginTop: '2px' }}>Submitted by: {leave.submittedBy === 'parent' ? 'Parent' : 'Student'}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <span className={`badge ${leave.status}`}>
                    {leave.status === 'pending' ? 'Pending Parent' : leave.status}
                  </span>
                  {leave.status === 'pending' && (
                    role === 'parent' && leave.submittedBy === 'student' ? (
                      <div style={{ display: 'inline-flex', gap: '6px', marginTop: '4px' }}>
                        <button 
                          className="table-btn btn-reject parent-reject-btn" 
                          style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                          onClick={() => handleReject(freshStudent.id, leave.id)}
                        >
                          Reject
                        </button>
                        <button 
                          className="table-btn btn-approve parent-approve-btn" 
                          style={{ padding: '4px 8px', fontSize: '11px', color: 'white', cursor: 'pointer' }}
                          onClick={() => handleApprove(freshStudent.id, leave.id)}
                        >
                          Approve
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn-cancel-leave" 
                        style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                        onClick={() => handleCancelLeave(leave.id)}
                      >
                        Cancel
                      </button>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveSection;
