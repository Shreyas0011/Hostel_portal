// src/components/WardenDiningSection.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ICONS } from '../constants/icons';
import { getMealAcceptanceType, isStudentOnLeave, isMealBooked } from '../utils/db';
import { getDateString } from '../utils/dateUtils';

const WardenDiningSection = ({ onViewStudentDetails }) => {
  const directory = useSelector((state) => state.student.directory) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [targetDate, setTargetDate] = useState(getDateString(0));

  // Filter students based on search term
  const filteredStudents = directory.filter(s => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term);
  });

  const getMealStatusForDate = (student, dateStr) => {
    const onLeave = isStudentOnLeave(student, dateStr);

    if (onLeave) {
      return {
        breakfast: false,
        lunch: false,
        snacks: false,
        dinner: false,
        onLeave: true
      };
    }

    return {
      breakfast: isMealBooked(student, dateStr, 'breakfast'),
      lunch: isMealBooked(student, dateStr, 'lunch'),
      snacks: isMealBooked(student, dateStr, 'snacks'),
      dinner: isMealBooked(student, dateStr, 'dinner'),
      onLeave: false
    };
  };

  const getBehaviourSummary = (student) => {
    if (!student.behaviourLogs || student.behaviourLogs.length === 0) {
      return (
        <span 
          className="badge approved" 
          style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0', fontSize: '11px', cursor: 'pointer' }}
          onClick={() => onViewStudentDetails && onViewStudentDetails(student.id)}
        >
          Good Conduct (0 Logs)
        </span>
      );
    }

    let positive = 0;
    let warning = 0;
    let critical = 0;
    let neutral = 0;

    student.behaviourLogs.forEach(log => {
      if (log.severity === 'positive') positive++;
      else if (log.severity === 'warning') warning++;
      else if (log.severity === 'critical') critical++;
      else neutral++;
    });

    const badges = [];
    if (critical > 0) {
      badges.push(<span key="crit" className="badge rejected" style={{ fontSize: '10px', padding: '2px 6px' }}>{critical} Critical</span>);
    }
    if (warning > 0) {
      badges.push(<span key="warn" className="badge pending" style={{ fontSize: '10px', padding: '2px 6px' }}>{warning} Warning</span>);
    }
    if (positive > 0) {
      badges.push(<span key="pos" className="badge approved" style={{ fontSize: '10px', padding: '2px 6px' }}>{positive} Comm.</span>);
    }
    if (neutral > 0 && badges.length === 0) {
      badges.push(<span key="neut" className="badge info" style={{ fontSize: '10px', padding: '2px 6px' }}>{neutral} Gen</span>);
    }

    return (
      <div 
        style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', cursor: 'pointer' }} 
        onClick={() => onViewStudentDetails && onViewStudentDetails(student.id)}
      >
        {badges}
      </div>
    );
  };

  const MEAL_DEFS = [
    { key: 'breakfast', label: 'Breakfast', time: '07:30 AM – 09:00 AM' },
    { key: 'lunch',     label: 'Lunch',     time: '12:30 PM – 02:00 PM' },
    { key: 'snacks',    label: 'Snacks',    time: '04:30 PM – 05:30 PM' },
    { key: 'dinner',    label: 'Dinner',    time: '07:30 PM – 09:00 PM' }
  ];

  const makeStudentRowsList = (list, badgeFn = null) => {
    if (list.length === 0) {
      return <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 6px', fontStyle: 'italic' }}>None</div>;
    }
    return list.map((s, idx) => (
      <div key={idx} className="meal-count-student-row">
        <span className="student-dot"></span>
        <span className="sname">{s.name}</span>
        <span className="smeta">{s.id} · Rm {s.room}</span>
        {badgeFn ? badgeFn(s) : null}
      </div>
    ));
  };

  return (
    <div className="dashboard-panel dashboard-full">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 className="panel-title">{ICONS.coffee} Daily Dining Tracker &amp; Student Behaviour</h2>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tracking meal options and active conduct flags</div>
      </div>

      <div className="filter-row" style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          {ICONS.search}
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search student by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.value || e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="dining-tracker-date" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Date:</label>
          <input 
            type="date" 
            id="dining-tracker-date" 
            className="form-input" 
            style={{ padding: '6px 12px', fontSize: '13px', maxWidth: '160px', margin: 0 }} 
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>
      </div>

      {/* Meal Summary Cards */}
      <div className="meal-summary-grid">
        {MEAL_DEFS.map(({ key, label, time }) => {
          const manualOptedIn = [];
          const autoOptedIn = [];
          const optedOut = [];
          const rejectedList = [];
          const onLeaveList = [];

          directory.forEach(student => {
            const type = getMealAcceptanceType(student, targetDate, key);
            if (type === 'leave') onLeaveList.push(student);
            else if (type === 'rejected') rejectedList.push(student);
            else if (type === 'manual') manualOptedIn.push(student);
            else if (type === 'auto') autoOptedIn.push(student);
            else optedOut.push(student);
          });

          const totalOptedIn = manualOptedIn.length + autoOptedIn.length;
          const totalOptedOut = optedOut.length + rejectedList.length;

          const manualBadge = () => <span style={{ fontSize: '9px', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 5px', borderRadius: '4px', marginLeft: 'auto', flexShrink: 0 }}>MANUAL</span>;
          const autoBadge = () => <span style={{ fontSize: '9px', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '2px 5px', borderRadius: '4px', marginLeft: 'auto', flexShrink: 0 }}>AUTO</span>;
          const rejBadge = () => <span style={{ fontSize: '9px', fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '2px 5px', borderRadius: '4px', marginLeft: 'auto', flexShrink: 0 }}>REJECTED</span>;

          return (
            <div key={key} className="meal-summary-card">
              <div className="meal-summary-header">
                <span className="meal-summary-title">{label}</span>
                <span className="meal-summary-time">{time}</span>
              </div>
              <div className="meal-summary-dropdowns">
                <details className="meal-count-details opted-in">
                  <summary className="meal-count-summary">
                    <span className="meal-count-bubble">{totalOptedIn}</span>
                    <span className="meal-count-label">Opted In</span>
                    {manualOptedIn.length > 0 && autoOptedIn.length > 0 && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '6px' }}>{manualOptedIn.length}M · {autoOptedIn.length}A</span>
                    )}
                    <span className="meal-count-chevron">▼</span>
                  </summary>
                  <div className="meal-count-list">
                    {totalOptedIn === 0 ? (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 6px', fontStyle: 'italic' }}>None</div>
                    ) : (
                      <>
                        {manualOptedIn.length > 0 && (
                          <>
                            {autoOptedIn.length > 0 && <div style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', padding: '4px 6px 2px', letterSpacing: '0.5px' }}>Manually Accepted ({manualOptedIn.length})</div>}
                            {makeStudentRowsList(manualOptedIn, manualBadge)}
                          </>
                        )}
                        {autoOptedIn.length > 0 && (
                          <>
                            {manualOptedIn.length > 0 && <div style={{ fontSize: '10px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', padding: '6px 6px 2px', letterSpacing: '0.5px' }}>Auto-Accepted ({autoOptedIn.length})</div>}
                            {makeStudentRowsList(autoOptedIn, autoBadge)}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </details>

                <details className="meal-count-details opted-out">
                  <summary className="meal-count-summary">
                    <span className="meal-count-bubble">{totalOptedOut}</span>
                    <span className="meal-count-label">Opted Out</span>
                    <span className="meal-count-chevron">▼</span>
                  </summary>
                  <div className="meal-count-list">
                    {totalOptedOut === 0 ? (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 6px', fontStyle: 'italic' }}>None</div>
                    ) : (
                      <>
                        {optedOut.length > 0 && makeStudentRowsList(optedOut)}
                        {rejectedList.length > 0 && (
                          <>
                            {optedOut.length > 0 && <div style={{ fontSize: '10px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', padding: '6px 6px 2px', letterSpacing: '0.5px' }}>Explicitly Rejected ({rejectedList.length})</div>}
                            {makeStudentRowsList(rejectedList, rejBadge)}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </details>

                {onLeaveList.length > 0 && (
                  <details className="meal-count-details on-leave">
                    <summary className="meal-count-summary">
                      <span className="meal-count-bubble">{onLeaveList.length}</span>
                      <span className="meal-count-label">On Leave</span>
                      <span className="meal-count-chevron">▼</span>
                    </summary>
                    <div className="meal-count-list">{makeStudentRowsList(onLeaveList)}</div>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Directory Status Table */}
      <div className="directory-table-wrapper">
        <table className="directory-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Snacks</th>
              <th>Dinner</th>
              <th>Student Behaviour Log Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  No students found matching the search criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const status = getMealStatusForDate(student, targetDate);
                
                const renderCheckMark = (mealKey, onLeave) => {
                  if (onLeave) {
                    return <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase' }}>Cancelled (Leave)</span>;
                  }
                  const type = getMealAcceptanceType(student, targetDate, mealKey);
                  if (type === 'manual')   return <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>✔ <span style={{ fontSize: '9px', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 5px', borderRadius: '4px' }}>MANUAL</span></span>;
                  if (type === 'auto')     return <span style={{ color: '#2563eb', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>✔ <span style={{ fontSize: '9px', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '2px 5px', borderRadius: '4px' }}>AUTO</span></span>;
                  if (type === 'rejected') return <span style={{ color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>✖ <span style={{ fontSize: '9px', fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '2px 5px', borderRadius: '4px' }}>REJECTED</span></span>;
                  return <span style={{ color: '#94a3b8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: 0.75, fontSize: '13px' }}>– Not Set</span>;
                };

                return (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong><br />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{student.id} • Room {student.room}</span>
                    </td>
                    <td>{renderCheckMark('breakfast', status.onLeave)}</td>
                    <td>{renderCheckMark('lunch',     status.onLeave)}</td>
                    <td>{renderCheckMark('snacks',    status.onLeave)}</td>
                    <td>{renderCheckMark('dinner',    status.onLeave)}</td>
                    <td>{getBehaviourSummary(student)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WardenDiningSection;
