// src/components/common/CustomConfirmModal.jsx
import React from 'react';
import { ICONS } from '../../constants/icons';

const CustomConfirmModal = ({ isOpen, message, title = 'Confirm Action', type = 'info', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  let iconBg = '#eff6ff';
  let iconColor = '#3b82f6';
  let confirmBg = 'var(--primary)';
  let confirmBorder = 'var(--primary)';
  let iconSvg = ICONS.alert;

  if (type === 'danger') {
    iconBg = '#fee2e2';
    iconColor = '#ef4444';
    confirmBg = '#dc2626';
    confirmBorder = '#dc2626';
    iconSvg = (
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  } else if (type === 'success') {
    iconBg = '#d1fae5';
    iconColor = '#10b981';
    confirmBg = '#10b981';
    confirmBorder = '#10b981';
    iconSvg = ICONS.check;
  }

  return (
    <div className="modal-overlay active" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-container" style={{ maxWidth: '420px', width: '90%', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#fff', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: iconBg, color: iconColor, width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {iconSvg}
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
            <button 
              className="btn-secondary" 
              style={{ background: '#f3f4f6', borderColor: '#e5e7eb', color: '#4b5563', padding: '10px 20px', fontSize: '13px', borderRadius: '6px', borderStyle: 'solid', borderWidth: '1px', cursor: 'pointer' }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              style={{ background: confirmBg, borderColor: confirmBorder, color: 'white', padding: '10px 20px', fontSize: '13px', borderRadius: '6px', fontWeight: 700, borderStyle: 'solid', borderWidth: '1px', cursor: 'pointer' }}
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirmModal;
