// src/components/ParentAttendanceSection.jsx
import React from 'react';
import { ICONS } from '../constants/icons';

const ParentAttendanceSection = ({ student }) => {
  const logs = student?.entryExitLogs || [];
  const sortedLogs = [...logs].reverse();

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
          <h2 className="panel-title">{ICONS.clock || ICONS.users} {student?.name}'s Attendance &amp; Gate Logs</h2>
        </div>

        <div className="table-responsive" style={{ marginTop: '15px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Timestamp</th>
                <th>Remarks / Purpose</th>
                <th>Gate Log Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                    No recent attendance/gate logs for your child.
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {log.type === 'entry' ? (
                        <span className="badge badge-success" style={{ background: '#def7ec', color: '#03543f', border: '1px solid #bcf0da' }}>
                          ✓ Hostel Entry
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ background: '#feecdc', color: '#9a3412', border: '1px solid #fbd5d5' }}>
                          ↳ Hostel Exit
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatTimestamp(log.timestamp)}</td>
                    <td style={{ color: '#4b5563' }}>{log.note || (log.type === 'entry' ? 'Hostel Entry' : 'Hostel Exit')}</td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>
                        {log.type === 'entry' ? 'Returned' : 'Exited'}
                      </span>
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

export default ParentAttendanceSection;
