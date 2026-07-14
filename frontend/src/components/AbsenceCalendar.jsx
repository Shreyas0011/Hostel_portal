// src/components/AbsenceCalendar.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ICONS } from '../constants/icons';
import { formatDisplayDate, getDateString } from '../utils/dateUtils';
import { formatTimeTo12Hr } from '../utils/timeUtils';

const AbsenceCalendar = () => {
  const directory = useSelector((state) => state.student.directory) || [];

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState(getDateString(0));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const numberOfDays = new Date(year, month + 1, 0).getDate();

  const days = [];

  // Previous month padding days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      dateStr: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`
    });
  }

  // Current month days
  for (let i = 1; i <= numberOfDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  // Next month padding days
  const totalSlots = Math.ceil(days.length / 7) * 7;
  const nextMonthPadding = totalSlots - days.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      dateStr: `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  const getLeavesForDate = (dateStr) => {
    const list = [];
    directory.forEach(student => {
      if (student.leaves) {
        student.leaves.forEach(leave => {
          if (leave.status === 'approved') {
            if (dateStr >= leave.startDate && dateStr <= leave.endDate) {
              list.push({
                studentId: student.id,
                studentName: student.name,
                studentRoom: student.room,
                ...leave
              });
            }
          }
        });
      }
    });
    return list;
  };

  const selectedDateLeaves = getLeavesForDate(selectedDate);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', width: '100%' }}>
      {/* Calendar Panel */}
      <div className="dashboard-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 className="panel-title">{ICONS.calendar} Leave &amp; Absence Calendar</h2>
          
          <div className="calendar-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ padding: '4px 8px', fontWeight: 'bold' }}
              onClick={handlePrevMonth}
            >
              &lt;
            </button>
            <span style={{ fontWeight: 700, fontSize: '15px', minWidth: '120px', textAlign: 'center' }}>
              {monthNames[month]} {year}
            </span>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ padding: '4px 8px', fontWeight: 'bold' }}
              onClick={handleNextMonth}
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {daysOfWeek.map((d, i) => (
            <div key={i} className="calendar-week-header">{d}</div>
          ))}
          
          {days.map((d, idx) => {
            const dateLeaves = getLeavesForDate(d.dateStr);
            const hasLeaves = dateLeaves.length > 0;
            const isSelected = d.dateStr === selectedDate;
            const isTodayDay = d.dateStr === getDateString(0);

            const dayClass = `calendar-day-cell ${
              d.isCurrentMonth ? 'current-month' : 'other-month'
            } ${isSelected ? 'selected' : ''} ${isTodayDay ? 'today' : ''} ${
              hasLeaves ? 'has-leaves' : ''
            }`;

            return (
              <div 
                key={idx} 
                className={dayClass} 
                onClick={() => setSelectedDate(d.dateStr)}
                style={{ cursor: 'pointer' }}
              >
                <span className="day-number">{d.day}</span>
                <div className="calendar-leaf-container">
                  {dateLeaves.slice(0, 2).map((l, lIdx) => (
                    <div 
                      key={lIdx} 
                      className="calendar-leaf-pill" 
                      style={{ 
                        fontSize: '10px', 
                        padding: '2px 4px', 
                        borderRadius: '4px', 
                        marginTop: '2px', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        fontWeight: 600, 
                        background: '#fff5f5', 
                        color: '#e53e3e', 
                        border: '1px solid #fed7d7' 
                      }} 
                      title={`${l.studentName} (Absent)`}
                    >
                      {l.studentName.split(' ')[0]}
                    </div>
                  ))}
                  {dateLeaves.length > 2 && (
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '1px', paddingLeft: '2px' }}>
                      +{dateLeaves.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Absence Details Panel */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">{ICONS.users} Absences on {formatDisplayDate(selectedDate)}</h2>
        </div>
        
        <div className="calendar-detail-list" style={{ marginTop: '15px', maxHeight: '400px', overflowY: 'auto' }}>
          {selectedDateLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '24px' }}>✓</span>
              <p style={{ marginTop: '5px', color: 'var(--text-secondary)' }}>No students absent on {formatDisplayDate(selectedDate)}</p>
            </div>
          ) : (
            selectedDateLeaves.map((l, idx) => (
              <div 
                key={idx} 
                className="calendar-leave-card" 
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '12px 16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '10px' 
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {l.studentName} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>({l.studentId} • Room {l.studentRoom})</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <strong>Departure:</strong> {formatDisplayDate(l.startDate)} {l.startTime ? `at ${formatTimeTo12Hr(l.startTime)}` : ''} <br />
                    <strong>Return:</strong> {formatDisplayDate(l.endDate)} {l.endTime ? `at ${formatTimeTo12Hr(l.endTime)}` : ''}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>"{l.reason}"</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <span className={`badge ${l.status}`} style={{ fontSize: '10px', padding: '4px 8px' }}>
                    {l.status === 'pending' ? 'Pending Parent' : l.status}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    {l.type === 'outing' ? 'Day Outing' : 'On Leave'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AbsenceCalendar;
