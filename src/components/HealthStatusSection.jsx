// src/components/HealthStatusSection.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveHealthRecordThunk, deleteHealthRecordThunk } from '../redux/health/healthSlice';
import { addToast } from '../redux/notification/notificationSlice';
import { ICONS } from '../constants/icons';
import CustomConfirmModal from './common/CustomConfirmModal';

const HealthStatusSection = ({ student, role }) => {
  const dispatch = useDispatch();
  const db = useSelector((state) => state.student.directory);

  const [symptoms, setSymptoms] = useState('');
  const [temperature, setTemperature] = useState('');
  const [status, setStatus] = useState('Resting in Room');
  const [note, setNote] = useState('');
  const [editingRecordId, setEditingRecordId] = useState(null);

  // Modal confirm state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, recordId: null });

  if (!student) return <div>No student selected.</div>;

  // Refresh student from store directory to ensure real-time accuracy
  const freshStudent = db.find(s => s.id === student.id) || student;
  const records = freshStudent.healthRecords || [];
  const sortedRecords = [...records].reverse();

  const canEdit = role === 'warden' || role === 'admin' || role === 'superadmin';

  const handleEditClick = (rec) => {
    setEditingRecordId(rec.id);
    setSymptoms(rec.symptoms);
    setTemperature(rec.temperature || '');
    setStatus(rec.status);
    setNote(rec.note || '');
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setSymptoms('');
    setTemperature('');
    setStatus('Resting in Room');
    setNote('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      dispatch(addToast({ message: 'Symptoms field is required.', type: 'warning' }));
      return;
    }

    const recordData = {
      recordId: editingRecordId || undefined,
      symptoms,
      temperature,
      status,
      note
    };

    dispatch(saveHealthRecordThunk({
      studentId: freshStudent.id,
      recordData
    })).then((res) => {
      if (res.payload?.success) {
        dispatch(addToast({
          message: editingRecordId ? 'Health status updated successfully!' : 'Health status added successfully!',
          type: 'success'
        }));
        handleCancelEdit();
      } else {
        dispatch(addToast({
          message: res.payload || 'Failed to save health record',
          type: 'error'
        }));
      }
    });
  };

  const handleDeleteRequest = (recordId) => {
    setConfirmModal({ isOpen: true, recordId });
  };

  const handleConfirmDelete = () => {
    const { recordId } = confirmModal;
    setConfirmModal({ isOpen: false, recordId: null });

    dispatch(deleteHealthRecordThunk({
      studentId: freshStudent.id,
      recordId
    })).then((res) => {
      if (res.payload?.success) {
        dispatch(addToast({ message: 'Health record deleted successfully!', type: 'success' }));
        if (editingRecordId === recordId) {
          handleCancelEdit();
        }
      } else {
        dispatch(addToast({ message: res.payload || 'Failed to delete health record', type: 'error' }));
      }
    });
  };

  return (
    <div className="dashboard-grid">
      {canEdit && (
        <div className="dashboard-panel">
          <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>
            <h2 className="panel-title">
              {ICONS.plus} {editingRecordId ? 'Edit' : 'Add'} Health / Medical Record
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Log health status updates for {freshStudent.name}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label className="form-label" htmlFor="health-symptoms">Current Symptoms</label>
              <input 
                type="text" 
                id="health-symptoms" 
                className="form-input" 
                placeholder="e.g., Fever, Cough, Headache" 
                required 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label className="form-label" htmlFor="health-temp">Body Temperature</label>
                <input 
                  type="text" 
                  id="health-temp" 
                  className="form-input" 
                  placeholder="e.g., 98.6°F" 
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="health-status">Current Status</label>
                <select 
                  id="health-status" 
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Resting in Room">Resting in Room</option>
                  <option value="Needs Medical Attention">Needs Medical Attention</option>
                  <option value="Visiting Hospital">Visiting Hospital</option>
                  <option value="Recovered">Recovered / Normal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="health-note">Additional Notes</label>
              <textarea 
                id="health-note" 
                className="form-input" 
                rows="2" 
                placeholder="Any medication taken or extra details?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {editingRecordId ? 'Update Health Record' : 'Add Health Record'}
              </button>
              {editingRecordId && (
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className={`dashboard-panel ${!canEdit ? 'dashboard-full' : ''}`}>
        <div className="panel-header" style={{ justifyContent: 'space-between' }}>
          <h2 className="panel-title">{ICONS.settings} Health & Medical History</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{records.length} records</span>
        </div>

        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
          {sortedRecords.length === 0 ? (
            <div className="empty-state">
              {ICONS.shield}
              <p>No health issues reported. Student is healthy!</p>
            </div>
          ) : (
            sortedRecords.map((r) => (
              <div key={r.id} style={{ background: '#f9fafb', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{r.symptoms}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{r.date} at {r.time}</div>
                  </div>
                  <span className={`badge ${r.status === 'Recovered' || r.status === 'Recovered / Normal' ? 'approved' : r.status === 'Needs Medical Attention' ? 'rejected' : 'pending'}`}>
                    {r.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span><strong>Temp:</strong> {r.temperature || 'Not recorded'}</span>
                </div>
                {r.note && (
                  <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '6px', fontSize: '13px', color: 'var(--text-primary)', borderLeft: '3px solid var(--primary)' }}>
                    {r.note}
                  </div>
                )}
                
                {canEdit && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'flex-end', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                    <button 
                      className="btn-edit-health" 
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: 0 }}
                      onClick={() => handleEditClick(r)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete-health" 
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: 0 }}
                      onClick={() => handleDeleteRequest(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <CustomConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Delete Health Record"
        message="Are you sure you want to delete this health record entry?"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, recordId: null })}
      />
    </div>
  );
};

export default HealthStatusSection;
