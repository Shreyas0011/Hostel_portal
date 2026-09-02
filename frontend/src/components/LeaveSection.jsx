// src/components/LeaveSection.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyLeaveThunk, cancelLeaveThunk, approveLeaveThunk, rejectLeaveThunk } from '../redux/leave/leaveSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';
import { formatDisplayDate } from '../utils/dateUtils';

const LeaveSection = ({ student, role = 'student' }) => {
  const dispatch = useDispatch();
  const directory = useSelector((state) => state.student.directory);
  
  // Keep fresh student object from directory if available
  const freshStudent = directory.find((s) => s.id === student?.id) || student;

  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmPm, setStartAmPm] = useState('AM');
  
  const [endHour, setEndHour] = useState('06');
  const [endMinute, setEndMinute] = useState('00');
  const [endAmPm, setEndAmPm] = useState('PM');
  
  const [type, setType] = useState('leave');
  const [reason, setReason] = useState('');

  const formatTimeTo12Hr = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${m} ${ampm}`;
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!freshStudent?.id) return;

    if (endDate < startDate) {
      dispatch(addToast({ message: 'Return date cannot be earlier than departure date', type: 'error' }));
      return;
    }

    const formattedStartTime = `${startHour}:${startMinute} ${startAmPm}`;
    const formattedEndTime = `${endHour}:${endMinute} ${endAmPm}`;
    const isOvernight = startDate !== endDate;

    dispatch(
      applyLeaveThunk({
        studentId: freshStudent.id,
        leaveData: {
          startDate,
          endDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          isOvernight,
          reason,
          type,
          submittedBy: role === 'parent' ? 'parent' : 'student'
        }
      })
    )
      .unwrap()
      .then((res) => {
        const msg = role === 'parent' 
          ? 'Leave request approved & submitted successfully!' 
          : 'Leaving booking request submitted for parent approval!';
        dispatch(addToast({ message: msg, type: 'success' }));
        setReason('');
      })
      .catch((err) => {
        dispatch(addToast({ message: err || 'Failed to submit leave request', type: 'error' }));
      });
  };

  const handleCancelLeave = (leaveId) => {
    dispatch(cancelLeaveThunk({ studentId: freshStudent.id, leaveId }))
      .unwrap()
      .then(() => {
        dispatch(addToast({ message: 'Leaving request cancelled', type: 'info' }));
      })
      .catch((err) => {
        dispatch(addToast({ message: err || 'Failed to cancel request', type: 'error' }));
      });
  };

  const handleApprove = (studentId, leaveId) => {
    dispatch(approveLeaveThunk({ studentId, leaveId }))
      .unwrap()
      .then(() => {
        dispatch(addToast({ message: 'Leave request approved!', type: 'success' }));
      })
      .catch((err) => {
        dispatch(addToast({ message: err || 'Failed to approve leave', type: 'error' }));
      });
  };

  const handleReject = (studentId, leaveId) => {
    dispatch(rejectLeaveThunk({ studentId, leaveId }))
      .unwrap()
      .then(() => {
        dispatch(addToast({ message: 'Leave request rejected', type: 'info' }));
      })
      .catch((err) => {
        dispatch(addToast({ message: err || 'Failed to reject leave', type: 'error' }));
      });
  };

  const leaves = freshStudent?.leaves || [];
  const sortedLeaves = [...leaves].reverse();

  return (
    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
      {/* Application Form */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">{ICONS.calendar} New Leaving Booking / Outing Request</h2>
        </div>

        <form onSubmit={handleApplyLeave} style={{ marginTop: '15px' }}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label className="form-label" htmlFor="leave-start-date">Departure Date</label>
              <input 
                id="leave-start-date" 
                type="date" 
                className="form-input" 
                required 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="leave-end-date">Return Date</label>
              <input 
                id="leave-end-date" 
                type="date" 
                className="form-input" 
                required 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

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
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{String(i + 1).padStart(2, '0')}</option>
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
                    <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
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
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{String(i + 1).padStart(2, '0')}</option>
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
                    <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
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
                      /* Parent reviewing a student-submitted leave: Approve / Reject */
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
                    ) : role === 'parent' && leave.submittedBy === 'parent' ? (
                      /* Parent cancelling their own submission */
                      <button 
                        className="btn-cancel-leave" 
                        style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                        onClick={() => handleCancelLeave(leave.id)}
                      >
                        Cancel
                      </button>
                    ) : role !== 'parent' ? (
                      /* Student cancelling their own pending request */
                      <button 
                        className="btn-cancel-leave" 
                        style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                        onClick={() => handleCancelLeave(leave.id)}
                      >
                        Cancel
                      </button>
                    ) : null
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
