// src/components/AttendanceSection.jsx
import React from 'react';
import { ICONS } from '../constants/icons';
import { formatDisplayDate } from '../utils/dateUtils';

const AttendanceSection = ({ student }) => {
  const logs = student?.entryExitLogs || [];
  const sortedLogs = [...logs].reverse();

  const getLogBadge = (type) => {
    return type === 'entry' ? (
      <span className="badge badge-success" style={{ background: '#def7ec', color: '#03543f', border: '1px solid #bcf0da' }}>
        ✓ Entry (In)
      </span>
    ) : (
      <span className="badge badge-warning" style={{ background: '#feecdc', color: '#9a3412', border: '1px solid #fbd5d5' }}>
        ↳ Exit (Out)
      </span>
    );
  };

  const formatTimestamp = (tsStr) => {
    if (!tsStr) return '';
    try {
      const dateObj = new Date(tsStr);
      return dateObj.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return tsStr;
    }
  };

  return (
    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      <div className="dashboard-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="panel-title">{ICONS.clock || ICONS.users} Gate Pass &amp; Entry/Exit Logs</h2>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Room {student?.room} • Block {student?.block}
          </span>
        </div>

        <div className="table-responsive" style={{ marginTop: '15px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Timestamp</th>
                <th>Details / Gate Note</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                    No entry/exit logs recorded yet.
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{getLogBadge(log.type)}</td>
                    <td style={{ fontWeight: 600 }}>{formatTimestamp(log.timestamp)}</td>
                    <td style={{ color: '#4b5563' }}>{log.note || (log.type === 'entry' ? 'Hostel Entry' : 'Hostel Exit')}</td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>Recorded</span>
                    </td>
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

export default AttendanceSection;
