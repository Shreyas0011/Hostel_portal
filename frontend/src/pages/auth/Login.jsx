// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../../redux/auth/authSlice';
import { addToast } from '../../redux/notification/notificationSlice';

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [showWardenPinScreen, setShowWardenPinScreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (formData) => {
    const resultAction = await dispatch(loginThunk({
      email: formData.email.trim(),
      password: formData.password.trim()
    }));
    if (loginThunk.fulfilled.match(resultAction)) {
      dispatch(addToast({ message: `Welcome, ${resultAction.payload.user.name}!`, type: 'success' }));
    } else {
      dispatch(addToast({ message: resultAction.payload || 'Invalid credentials.', type: 'error' }));
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (!pin) { setPinError('PIN is required'); return; }

    const PIN_MAP = {
      '1234': { email: 'ramesh.kumar@transcendgroup.org', password: 'Warden@1234', name: 'Ramesh Kumar' },
      '5678': { email: 'anita.joseph@transcendgroup.org', password: 'Warden@5678', name: 'Anita Joseph' },
      '9999': { email: 'warden@hostel.edu',               password: 'warden123',   name: 'Chief Warden'  },
    };

    const creds = PIN_MAP[pin];
    if (!creds) { setPinError('Invalid Security PIN. Please try again.'); return; }

    const resultAction = await dispatch(loginThunk({ email: creds.email, password: creds.password }));
    if (loginThunk.fulfilled.match(resultAction)) {
      dispatch(addToast({ message: `Welcome, ${creds.name}!`, type: 'success' }));
    } else {
      setPinError(resultAction.payload || 'Login failed');
    }
  };

  const handleDemoLogin = (email, password, label) => {
    setValue('email', email);
    setValue('password', password);
    dispatch(loginThunk({ email, password })).then((resultAction) => {
      if (loginThunk.fulfilled.match(resultAction)) {
        dispatch(addToast({ message: `Welcome, ${label}!`, type: 'success' }));
      } else {
        dispatch(addToast({ message: resultAction.payload || 'Login failed', type: 'error' }));
      }
    });
  };

  // ── Warden PIN Screen ────────────────────────────────────────
  if (showWardenPinScreen) {
    return (
      <div className="modern-login-container">
        <div className="modern-login-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src="/transcend-logo.png" alt="Transcend Group of Institutions" style={{ height: '100px', objectFit: 'contain' }} />
          </div>

          <h1 className="modern-login-title">Warden Security Verification</h1>
          <p className="modern-login-subtitle">Enter your 4-digit security PIN to access the console</p>

          <form onSubmit={handlePinSubmit} style={{ marginTop: '24px' }}>
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label className="modern-input-label">ENTER SECURITY PIN</label>
              <div className="modern-input-wrapper">
                <svg className="modern-input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type="password"
                  id="warden-pin"
                  className={`modern-input ${pinError ? 'error' : ''}`}
                  placeholder="••••"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                  autoFocus
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', paddingLeft: '44px' }}
                />
              </div>
              {pinError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', textAlign: 'center', fontWeight: '500' }}>{pinError}</span>}
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center', fontWeight: '500' }}>{error}</div>}

            <button type="submit" className="modern-btn-primary" disabled={loading}>
              <span>{loading ? 'Verifying PIN...' : 'Verify & Enter'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>

            <button type="button" className="modern-btn-secondary" style={{ marginTop: '12px' }} onClick={() => { setShowWardenPinScreen(false); setPin(''); setPinError(''); }}>
              <span>Back to Login</span>
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', lineHeight: '1.6', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <p style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', fontSize: '11px', letterSpacing: '0.05em' }}>OWNED BY TRANSCEND GROUP OF INSTITUTIONS</p>
            <p style={{ margin: '4px 0 0 0', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
              DEVELOPED BY <span style={{ color: '#2563eb', fontWeight: 700 }}>START SMART,SE</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Login Screen ────────────────────────────────────────
  return (
    <div className="modern-login-container">
      <div className="modern-login-card">
        {/* Top Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/transcend-logo.png" alt="Transcend Group of Institutions" style={{ height: '110px', objectFit: 'contain' }} />
        </div>

        <h1 className="modern-login-title">Campus Hostel Portal</h1>
        <p className="modern-login-subtitle">Sign in with your institutional account</p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '28px' }}>
          {/* Email Field */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label className="modern-input-label" htmlFor="login-identifier">EMAIL OR ENROLLMENT ID</label>
            <div className="modern-input-wrapper">
              <svg className="modern-input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="text"
                id="login-identifier"
                className={`modern-input ${errors.email ? 'error' : ''}`}
                placeholder="Email or Enrollment ID (e.g. 251D1482)"
                {...register('email', { required: 'Email or Enrollment ID is required' })}
              />
            </div>
            {errors.email && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: '500' }}>{errors.email.message}</span>}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label className="modern-input-label" htmlFor="login-password">PASSWORD</label>
            <div className="modern-input-wrapper">
              <svg className="modern-input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                className={`modern-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                className="modern-input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: '500' }}>{errors.password.message}</span>}
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center', fontWeight: '500' }}>{error}</div>}

          {/* Sign In Button */}
          <button type="submit" className="modern-btn-primary" disabled={loading}>
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>

          {/* Warden Login Button */}
          <button type="button" className="modern-btn-secondary" style={{ marginTop: '12px' }} onClick={() => setShowWardenPinScreen(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>Warden Only Login (PIN Access)</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '32px', textAlign: 'center', lineHeight: '1.6', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <p style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', fontSize: '11px', letterSpacing: '0.05em' }}>OWNED BY TRANSCEND GROUP OF INSTITUTIONS</p>
          <p style={{ margin: '4px 0 0 0', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
            DEVELOPED BY <span style={{ color: '#2563eb', fontWeight: 700 }}>START SMART,SE</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
