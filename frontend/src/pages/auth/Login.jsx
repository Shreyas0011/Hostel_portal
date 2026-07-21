// src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../../redux/auth/authSlice';
import { addToast } from '../../redux/notification/notificationSlice';

// Staff & Warden PIN map — 4-digit PIN → backend credentials
const WARDEN_PIN_MAP = {
  '1111': { email: 'vijayamma@transcendgroup.org',   password: 'Warden@Girls',       name: 'Vijayamma',    hostel: 'Girls Hostel' },
  '2222': { email: 'siddu@transcendgroup.org',       password: 'Warden@Boys',        name: 'Siddu',        hostel: 'Boys Hostel'  },
  '3333': { email: 'messmanager@transcendgroup.org', password: 'MessManager@3333',   name: 'Mess Manager', hostel: 'Campus Mess'   },
  '9999': { email: 'warden@hostel.edu',             password: 'warden123',           name: 'Chief Warden', hostel: 'All Hostels'  },
};

// ── Warden PIN Keypad Component ──────────────────────────────────────────────
const WardenPinScreen = ({ onBack, dispatch, loading }) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerError = (msg) => {
    setPinError(msg);
    setShake(true);
    setTimeout(() => { setShake(false); setPin(''); }, 600);
  };

  const handleKey = (digit) => {
    if (pin.length < 4) {
      setPinError('');
      setPin(prev => prev + digit);
    }
  };

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) {
      const creds = WARDEN_PIN_MAP[pin];
      if (!creds) {
        triggerError('Invalid PIN. Please try again.');
        return;
      }
      dispatch(loginThunk({ email: creds.email, password: creds.password })).then((resultAction) => {
        if (loginThunk.fulfilled.match(resultAction)) {
          dispatch(addToast({ message: `Welcome, ${creds.name}! (${creds.hostel})`, type: 'success' }));
        } else {
          triggerError('Login failed. Please contact admin.');
        }
      });
    }
  }, [pin]);

  const keys = ['1','2','3','4','5','6','7','8','9','C','0','⌫'];

  return (
    <div className="modern-login-container">
      <div className="modern-login-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/transcend-logo.png" alt="Transcend Group" style={{ height: '90px', objectFit: 'contain' }} />
        </div>

        <h1 className="modern-login-title" style={{ fontSize: '20px' }}>Staff &amp; Mess PIN Login</h1>
        <p className="modern-login-subtitle">Enter your 4-digit PIN (Warden or Mess Manager)</p>

        {/* 4-Dot PIN indicator */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '18px',
          margin: '28px 0 8px',
          animation: shake ? 'pinShake 0.5s ease' : 'none',
        }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: '18px', height: '18px', borderRadius: '50%',
              border: '2px solid',
              borderColor: pin.length > i ? '#2563eb' : '#cbd5e1',
              background: pin.length > i ? '#2563eb' : 'transparent',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              transform: pin.length > i ? 'scale(1.2)' : 'scale(1)',
              boxShadow: pin.length > i ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
            }} />
          ))}
        </div>

        {pinError && (
          <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', margin: '8px 0 0', fontWeight: 600 }}>
            {pinError}
          </p>
        )}
        {!pinError && (
          <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', margin: '8px 0 0' }}>
            {pin.length === 0 ? 'Tap your PIN on the keypad below' : `${pin.length} of 4 digits entered`}
          </p>
        )}

        {/* Numpad grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px', margin: '20px auto', maxWidth: '248px',
        }}>
          {keys.map(key => {
            const isClear  = key === 'C';
            const isDelete = key === '⌫';
            return (
              <button
                key={key}
                type="button"
                disabled={loading}
                onClick={() => {
                  if (isClear)       setPin(''), setPinError('');
                  else if (isDelete) setPin(p => p.slice(0,-1)), setPinError('');
                  else               handleKey(key);
                }}
                style={{
                  height: '58px', borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  background: isClear ? '#fef2f2' : isDelete ? '#f8fafc' : '#ffffff',
                  color: isClear ? '#ef4444' : isDelete ? '#475569' : '#0f172a',
                  fontSize: isDelete ? '19px' : '21px',
                  fontWeight: 700, cursor: 'pointer',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  outline: 'none', fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; e.currentTarget.style.boxShadow = 'none'; }}
                onMouseUp={e   => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';   e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}
              >
                {key}
              </button>
            );
          })}
        </div>

        {loading && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', margin: '-4px 0 12px', fontWeight: 600 }}>
            Verifying PIN…
          </p>
        )}

        <button type="button" className="modern-btn-secondary" style={{ marginTop: '4px' }} onClick={onBack}>
          <span>← Back to Login</span>
        </button>

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center', lineHeight: 1.6, borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <p style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', fontSize: '10px', letterSpacing: '0.05em' }}>
            OWNED BY TRANSCEND GROUP OF INSTITUTIONS
          </p>
          <p style={{ margin: '4px 0 0', textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
            DEVELOPED BY <span style={{ color: '#2563eb', fontWeight: 700 }}>START SMART, SE</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pinShake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

// ── Main Login Component ─────────────────────────────────────────────────────
const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [showWardenPinScreen, setShowWardenPinScreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  // ── Warden PIN Screen ────────────────────────────────────────
  if (showWardenPinScreen) {
    return (
      <WardenPinScreen
        onBack={() => setShowWardenPinScreen(false)}
        dispatch={dispatch}
        loading={loading}
      />
    );
  }

  // ── Main Login Screen ────────────────────────────────────────
  return (
    <div className="modern-login-container">
      <div className="modern-login-card">
        {/* Logo */}
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
                type={showPassword ? 'text' : 'password'}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          {/* Warden PIN Login Button */}
          <button
            type="button"
            className="modern-btn-secondary"
            style={{ marginTop: '12px' }}
            onClick={() => setShowWardenPinScreen(true)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Warden &amp; Mess Login (PIN Access)</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '32px', textAlign: 'center', lineHeight: '1.6', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <p style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', fontSize: '11px', letterSpacing: '0.05em' }}>
            OWNED BY TRANSCEND GROUP OF INSTITUTIONS
          </p>
          <p style={{ margin: '4px 0 0 0', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
            DEVELOPED BY <span style={{ color: '#2563eb', fontWeight: 700 }}>START SMART, SE</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
