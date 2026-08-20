// src/components/AdminAttendanceSection.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logScanThunk } from '../redux/attendance/attendanceSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';

const AdminAttendanceSection = () => {
  const dispatch = useDispatch();
  const directory = useSelector((state) => state.student.directory || []);

  const [selectedStudentId, setSelectedStudentId] = useState(directory[0]?.id || '');
  const [scanType, setScanType] = useState('entry');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = directory.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      dispatch(addToast({ message: 'Please select a student', type: 'error' }));
      return;
    }

    const student = directory.find(s => s.id === selectedStudentId);
    dispatch(logScanThunk({ studentId: selectedStudentId, type: scanType, note }))
      .unwrap()
      .then(() => {
        dispatch(addToast({ message: `Logged ${scanType.toUpperCase()} for ${student?.name || selectedStudentId}`, type: 'success' }));
        setNote('');
      })
      .catch((err) => {
        dispatch(addToast({ message: err || 'Failed to record gate scan', type: 'error' }));
      });
  };

  const selectedStudent = directory.find(s => s.id === selectedStudentId);
  const studentLogs = selectedStudent?.entryExitLogs ? [...selectedStudent.entryExitLogs].reverse() : [];

  return (
    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
      {/* Gate Scanning & Manual Entry Form */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">{ICONS.shield || ICONS.clock} Gate Security Entry/Exit Scanner</h2>
        </div>

        <form onSubmit={handleScanSubmit} style={{ marginTop: '15px' }}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Search / Select Student</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search student name or USN/ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: '8px' }}
            />
            <select 
              className="form-input" 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
            >
              {filteredStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.id} - {s.name} ({s.room})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Gate Action Type</label>
            <div style={{ display: 'flex', gap: '15px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="scanType" 
                  value="entry" 
                  checked={scanType === 'entry'} 
                  onChange={() => setScanType('entry')} 
                />
                Hostel Entry (Check-In)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="scanType" 
                  value="exit" 
                  checked={scanType === 'exit'} 
                  onChange={() => setScanType('exit')} 
                />
                Hostel Exit (Check-Out)
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label">Gate Remark / Gate Pass Note</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Returned from weekend outing / Going to pharmacy" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Log Gate Pass Action
          </button>
        </form>
      </div>

      {/* Selected Student Log History */}
      <div className="dashboard-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="panel-title">
            Gate Logs: {selectedStudent ? `${selectedStudent.name} (${selectedStudent.id})` : 'Select Student'}
          </h2>
        </div>

        <div className="table-responsive" style={{ marginTop: '15px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Timestamp</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {studentLogs.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                    No logs found for this student.
                  </td>
                </tr>
              ) : (
                studentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {log.type === 'entry' ? (
                        <span className="badge badge-success" style={{ fontSize: '11px' }}>✓ Entry</span>
                      ) : (
                        <span className="badge badge-warning" style={{ fontSize: '11px' }}>↳ Exit</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '13px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ color: '#4b5563', fontSize: '13px' }}>{log.note || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceSection;
