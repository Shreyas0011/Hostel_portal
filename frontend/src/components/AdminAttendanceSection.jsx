// src/components/AdminAttendanceSection.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setViewAttendanceStudentId } from '../redux/attendance/attendanceSlice';
import { ICONS } from '../constants/icons';
import ParentAttendanceSection from './ParentAttendanceSection';

const AdminAttendanceSection = () => {
  const dispatch = useDispatch();
  const directory = useSelector((state) => state.student.directory) || [];
  const selectedStudentId = useSelector((state) => state.attendance.viewAttendanceStudentId);

  const defaultStudent = directory[0];
  const targetStudentId = selectedStudentId || (defaultStudent ? defaultStudent.id : '');
  const student = directory.find(s => s.id === targetStudentId) || defaultStudent;

  const handleStudentChange = (e) => {
    dispatch(setViewAttendanceStudentId(e.target.value));
  };

  if (!student) {
    return (
      <div className="dashboard-panel">
        <p>No students found. Add a resident to manage attendance movements.</p>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-panel dashboard-full" style={{ marginBottom: '20px' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="panel-title">{ICONS.users} Gate &amp; Movement Attendance</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Student:</label>
            <select 
              className="filter-select" 
              style={{ minWidth: '250px' }}
              value={targetStudentId}
              onChange={handleStudentChange}
            >
              {directory.map(s => (
                <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ParentAttendanceSection student={student} isReadOnly={false} />
    </>
  );
};

export default AdminAttendanceSection;
