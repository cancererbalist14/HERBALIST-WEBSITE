import React, { useState } from 'react';
import { FaLock, FaLeaf, FaArrowRight, FaSpinner, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://cancer-herbalist-rhgj.vercel.app').replace(/\/+$/, '');
const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the password key.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid admin key. Access denied.');
      }

      // Save local authentication keys for frontend API calls
      localStorage.setItem('ch_admin_authed', 'true');
      localStorage.setItem('ch_admin_secret', data.key);

      // Perform a full browser reload to /admin so the secure admin_token cookie is transmitted
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message || 'Verification failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(26,110,82,0.9) 0%, rgba(15,82,67,1) 90%)',
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'Poppins, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '35vw',
        height: '35vw',
        borderRadius: '50%',
        background: `${ACCENT}15`,
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: `${PRIMARY}25`,
        filter: 'blur(120px)',
        pointerEvents: 'none'
      }} />

      {/* Back to Home Shortcut */}
      <button 
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          borderRadius: '50px',
          padding: '10px 20px',
          fontSize: '13.5px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(8px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.transform = 'translateX(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <FaHome /> Back to Home
      </button>

      {/* Main Login Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .login-input:focus {
            box-shadow: 0 0 0 3px ${ACCENT}33;
          }
        `}</style>

        {/* Icon & Title */}
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #22c55e, #15803d)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: '#fff',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(34,197,94,0.3)'
        }}>
          <FaLeaf />
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '8px',
          fontFamily: 'Playfair Display, serif'
        }}>
          Cancer Herbalist
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '14.5px',
          marginBottom: '35px'
        }}>
          Enter your security credentials to access the Administrator dashboard.
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <FaLock style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused ? ACCENT : 'rgba(255,255,255,0.4)',
              transition: 'color 0.3s ease'
            }} />
            <input
              type="password"
              placeholder="Admin Security Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => { setFocused(true); setError(''); }}
              onBlur={() => setFocused(false)}
              className="login-input"
              disabled={loading}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '15px 20px 15px 48px',
                background: 'rgba(255,255,255,0.06)',
                border: focused ? `1.5px solid ${ACCENT}` : '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                fontSize: '15px',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1.5px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#fca5a5',
              fontSize: '13.5px',
              textAlign: 'left',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: `0 8px 24px ${ACCENT}25`,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 12px 32px ${ACCENT}40`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `0 8px 24px ${ACCENT}25`;
              }
            }}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> Verifying...
              </>
            ) : (
              <>
                Secure Login <FaArrowRight />
              </>
            )}
          </button>
        </form>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
