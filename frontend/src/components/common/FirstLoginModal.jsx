// src/components/common/FirstLoginModal.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePasswordThunk } from '../../redux/auth/authSlice';
import { addToast } from '../../redux/notification/notificationSlice';
import { ICONS } from '../../constants/icons';

const FirstLoginModal = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Show modal only if user is logged in AND firstLogin/first_login flag is true
  const isFirstLogin = Boolean(user && (user.firstLogin === true || user.first_login === true));

  if (!isFirstLogin) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword.trim()) {
      setError('Please enter your current temporary password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    dispatch(changePasswordThunk({ currentPassword: currentPassword.trim(), newPassword: newPassword.trim() }))
      .unwrap()
      .then(() => {
        setLoading(false);
        dispatch(addToast({
          message: 'Password changed successfully! First login setup complete.',
          type: 'success'
        }));
      })
      .catch((err) => {
        setLoading(false);
        setError(err || 'Failed to update password. Please check your current password.');
      });
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-container" style={{ maxWidth: '440px', width: '90%', padding: '28px', borderRadius: '16px', background: '#ffffff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px', fontWeight: 800 }}>
            🔑
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            First Login: Set New Password
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            Welcome, <strong>{user?.name || 'User'}</strong>! Since this is your first sign-in, please update your default account password for security.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', color: '#475569' }}>
              Current Password (e.g. Student@123)
            </label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Enter current default password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ marginTop: '4px' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', color: '#475569' }}>
              New Password (min. 6 characters)
            </label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Enter new strong password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ marginTop: '4px' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', color: '#475569' }}>
              Confirm New Password
            </label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Re-enter new password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ marginTop: '4px' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', height: '44px', fontWeight: 700, fontSize: '14px' }}
          >
            {loading ? 'Updating Password...' : 'Update Password & Continue'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default FirstLoginModal;
