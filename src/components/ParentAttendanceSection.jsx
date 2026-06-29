// src/components/ParentAttendanceSection.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logScanThunk } from '../redux/attendance/attendanceSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';

const ParentAttendanceSection = ({ student, isReadOnly = true }) => {
  const dispatch = useDispatch();
  const [scanType, setScanType] = useState('entry');
  const [scanNote, setScanNote] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  if (!student) return <div>No student selected.</div>;

  const logs = [...(student.entryExitLogs || [])].reverse(); // newest first
  const lastLog = logs[0];
  const isCurrentlyIn = lastLog ? lastLog.type === 'entry' : true;

  const handleSimulateScan = (e) => {
    e.preventDefault();
    setIsScanning(true);
    
    dispatch(logScanThunk({
      studentId: student.id,
      type: scanType,
      note: scanNote || (scanType === 'entry' ? 'Standard Hostel Entry' : 'Standard Hostel Exit')
    })).then((res) => {
      setIsScanning(false);
      if (!res.error) {
        dispatch(addToast({
          message: `Successfully recorded student ${scanType === 'entry' ? 'entry' : 'exit'}!`,
          type: 'success'
        }));
        setScanNote('');
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to log gate movement.', type: 'error' }));
      }
    });
  };

  // Today's logs
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter(l => l.timestamp.startsWith(todayStr));

  const formatTime = (ts) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return ts;
    }
  };

  const formatLogDate = (ts) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) {
      return ts;
    }
  };

  const getInitials = (name = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="dashboard-grid">
      {/* Entry/Exit Status */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h2 className="panel-title">{ICONS.shield} Hostel Gate — Movement Status</h2>
        </div>

        <div className={`scan-status-banner ${isCurrentlyIn ? 'in-hostel' : 'out-hostel'}`}>
          <div className="scan-status-dot"></div>
          <div>
            <span className="scan-status-label">{isCurrentlyIn ? '🏠 Currently Inside Hostel' : '🚶 Currently Outside'}</span>
            {lastLog ? (
              <span className="scan-status-time">Last scan: {formatLogDate(lastLog.timestamp)} at {formatTime(lastLog.timestamp)}</span>
            ) : (
              <span className="scan-status-time">No movement recorded yet</span>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="gate-simulator-card" style={{ marginTop: '15px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', marginTop: 0 }}>
              🔒 Simulated Gate Scanner
            </h3>
            <form onSubmit={handleSimulateScan} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', margin: 0 }}>
                  <input type="radio" name="scanType" checked={scanType === 'entry'} onChange={() => setScanType('entry')} />
                  IN (Entry)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', margin: 0 }}>
                  <input type="radio" name="scanType" checked={scanType === 'exit'} onChange={() => setScanType('exit')} />
                  OUT (Exit)
                </label>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Optional scan note..." 
                  value={scanNote} 
                  onChange={(e) => setScanNote(e.target.value)} 
                  style={{ fontSize: '12px', padding: '8px' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ margin: 0, padding: '8px 12px', fontSize: '12px', fontWeight: 600 }} disabled={isScanning}>
                {isScanning ? 'Processing...' : 'Scan Barcode / ID'}
              </button>
            </form>
          </div>
        )}

        {/* ID Card Visual */}
        <div className="id-card-wrapper">
          <div className="id-card">
            <div className="id-card-top">
              <div className="id-card-avatar">{getInitials(student.name)}</div>
              <div>
                <div className="id-card-name">{student.name}</div>
                <div className="id-card-detail">{student.id} • Room {student.room}</div>
                <div className="id-card-detail">Block {student.block} • {student.bed || 'Bed A'}</div>
              </div>
            </div>
            <div className="id-card-barcode">
              <div className="barcode-lines"></div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '3px' }}>{student.id}</span>
            </div>
          </div>
        </div>

        {/* Today's summary */}
        <div style={{ marginTop: '18px', background: '#f9fafb', borderRadius: '8px', padding: '14px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Today's Movements ({todayLogs.length} events)
          </p>
          {todayLogs.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No gate activity recorded today</p>
          ) : (
            todayLogs.map((l, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span className={`entry-exit-dot ${l.type}`}></span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: l.type === 'entry' ? '#047857' : '#b91c1c', minWidth: '44px' }}>
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
                <React.Fragment key={idx}>
                  {showDateHeader && <div className="timeline-date-header">{formatLogDate(l.timestamp)}</div>}
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

export default ParentAttendanceSection;
