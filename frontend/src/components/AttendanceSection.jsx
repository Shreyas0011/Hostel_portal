// src/components/AttendanceSection.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logScanThunk } from '../redux/attendance/attendanceSlice';
import { fetchProfileThunk } from '../redux/student/studentSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';
import { formatDisplayDate, getDateString } from '../utils/dateUtils';

const AttendanceSection = ({ student, isReadOnly, showScanner }) => {
  const dispatch = useDispatch();
  const db = useSelector((state) => state.student.directory);
  const [isScanning, setIsScanning] = useState(false);
  const [scanNote, setScanNote] = useState('');

  if (!student) return <div>No student selected.</div>;

  // Use directory data if available to keep sync
  const freshStudent = db.find(s => s.id === student.id) || student;
  const logs = [...(freshStudent.entryExitLogs || [])].reverse(); // newest first
  const lastLog = logs[0];
  const isCurrentlyIn = lastLog ? lastLog.type === 'entry' : true;

  // Today's logs
  const todayStr = getDateString(0);
  const todayLogs = logs.filter(l => l.timestamp.startsWith(todayStr));

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatLogDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleSimulateScan = (type) => {
    if (isScanning) return;
    setIsScanning(true);

    const noteText = scanNote.trim() || (type === 'entry' ? 'Returned to hostel' : 'Left the hostel campus');

    // Trigger laser scanning animation
    setTimeout(() => {
      dispatch(logScanThunk({
        studentId: freshStudent.id,
        type,
        note: noteText
      })).then((res) => {
        setIsScanning(false);
        setScanNote('');
        if (res.payload?.success) {
          dispatch(addToast({
            message: `ID Card scanned successfully! Simulated ${type.toUpperCase()}`,
            type: 'success'
          }));
          // Refresh profile if it's the current student logged in
          dispatch(fetchProfileThunk(freshStudent.id));
        } else {
          dispatch(addToast({
            message: res.payload || 'Failed to simulate scan',
            type: 'error'
          }));
        }
      });
    }, 1200); // Animation duration
  };

  return (
    <div className="dashboard-grid">
      {/* Entry/Exit Status / Scanner */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">{ICONS.shield} Hostel Gate — Movement Status</h2>
        </div>

        <div className={`scan-status-banner ${isCurrentlyIn ? 'in-hostel' : 'out-hostel'}`}>
          <div className="scan-status-dot"></div>
          <div>
            <span className="scan-status-label">
              {isCurrentlyIn ? '🏠 Currently Inside Hostel' : '🚶 Currently Outside'}
            </span>
            {lastLog ? (
              <span className="scan-status-time">
                Last scan: {formatLogDate(lastLog.timestamp)} at {formatTime(lastLog.timestamp)}
              </span>
            ) : (
              <span className="scan-status-time">No movement recorded yet</span>
            )}
          </div>
        </div>

        {/* Scanner Simulator */}
        {showScanner && !isReadOnly && (
          <div style={{ marginTop: '20px', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '20px', backgroundColor: '#fafafa', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div 
                className="scanner-visual" 
                style={{ 
                  width: '180px', 
                  height: '110px', 
                  backgroundColor: '#0f172a', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  position: 'relative',
                  overflow: 'hidden',
                  border: '3px solid #334155'
                }}
              >
                {/* Laser scan line overlay */}
                <div className={`scan-laser ${isScanning ? 'scanning' : ''}`} />
                
                {isScanning ? (
                  <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '700', letterSpacing: '1px', zIndex: 2 }}>
                    READING ID CARD...
                  </span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="30" height="30" stroke="#94a3b8" strokeWidth="2" fill="none" style={{ zIndex: 2 }}>
                      <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '6px', fontWeight: '600', zIndex: 2 }}>
                      TAP TARGET
                    </span>
                  </>
                )}
              </div>

              <div style={{ width: '100%', marginTop: '10px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Scan note/destination (optional)..."
                  value={scanNote}
                  onChange={(e) => setScanNote(e.target.value)}
                  disabled={isScanning}
                  style={{ width: '100%', boxSizing: 'border-box', margin: 0 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '5px' }}>
                <button 
                  className="btn-scan entry-btn" 
                  style={{ flex: 1 }}
                  disabled={isScanning || isCurrentlyIn}
                  onClick={() => handleSimulateScan('entry')}
                >
                  Simulate IN
                </button>
                <button 
                  className="btn-scan exit-btn" 
                  style={{ flex: 1 }}
                  disabled={isScanning || !isCurrentlyIn}
                  onClick={() => handleSimulateScan('exit')}
                >
                  Simulate OUT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ID Card Visual */}
        <div className="id-card-wrapper" style={{ marginTop: '20px' }}>
          <div className="id-card">
            <div className="id-card-top">
              <div className="id-card-avatar" style={{ textTransform: 'uppercase', width: '68px', height: '68px', borderRadius: '8px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '22px', flexShrink: 0 }}>
                {freshStudent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="id-card-name">{freshStudent.name}</div>
                <div className="id-card-detail">{freshStudent.id} • Room {freshStudent.room}</div>
                <div className="id-card-detail">Block {freshStudent.block} • {freshStudent.bed || 'Bed A'}</div>
              </div>
            </div>
            <div className="id-card-barcode">
              <div className="barcode-lines"></div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '3px' }}>
                {freshStudent.id}
              </span>
            </div>
          </div>
        </div>

        {/* Today's summary */}
        <div style={{ marginTop: '18px', background: '#f9fafb', borderRadius: '8px', padding: '14px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', margin: '0 0 10px 0' }}>
            Today's Movements ({todayLogs.length} events)
          </p>
          {todayLogs.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
              No gate activity recorded today
            </p>
          ) : (
            todayLogs.map((l) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span className={`entry-exit-dot ${l.type}`}></span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: l.type === 'entry' ? '#047857' : '#b91c1c', minWidth: '44px' }}>
                  {l.type === 'entry' ? 'IN' : 'OUT'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{formatTime(l.timestamp)}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {l.note}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full Entry/Exit History Timeline */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">{ICONS.calendar} Full Movement History</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{logs.length} records</span>
        </div>

        <div className="exit-log-timeline" style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '5px' }}>
          {logs.length === 0 ? (
            <div className="empty-state">
              {ICONS.shield}
              <p>No entry/exit events recorded yet.</p>
            </div>
          ) : (
            logs.map((l, idx) => {
              const isEntry = l.type === 'entry';
              const showDateHeader = idx === 0 || !logs[idx - 1].timestamp.startsWith(l.timestamp.slice(0, 10));
              return (
                <React.Fragment key={l.id}>
                  {showDateHeader && (
                    <div className="timeline-date-header">{formatLogDate(l.timestamp)}</div>
                  )}
                  <div className={`timeline-event ${isEntry ? 'entry' : 'exit'}`}>
                    <div className={`timeline-dot ${isEntry ? 'entry' : 'exit'}`}></div>
                    <div className="timeline-content">
                      <div className="timeline-type">{isEntry ? '↩ Entry' : '↪ Exit'}</div>
                      <div className="timeline-time">{formatTime(l.timestamp)}</div>
                      <div className="timeline-note">{l.note}</div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSection;
