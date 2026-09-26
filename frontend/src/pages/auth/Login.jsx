import React, { useState } from 'react';
import { LogIn, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RitLogo } from '../../components/common/RitLogo';

export const Login = ({ onNavigateRegisterStudent, onNavigateRegisterFaculty, onNavigateForgotPassword }) => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please enter your institutional email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(identifier.trim(), password.trim());
      if (!res.success) {
        setError(res.message || 'Invalid credentials or user not registered.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    alert("Google Workspace Sign In is currently being integrated.");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (onNavigateForgotPassword) {
      onNavigateForgotPassword();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-header)',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Theme Toggle Button */}
      <button
        className="desktop-only"
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          color: '#FFFFFF',
          transition: 'all 0.2s',
          zIndex: 10
        }}
        title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="login-card-anim" style={{
        margin: 'auto',
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '8px',
        border: theme === 'dark' ? '1px solid var(--border-subtle)' : 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header Banner */}
        <div style={{
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-inverse)',
          padding: '28px 24px',
          textAlign: 'center',
          borderBottom: '4px solid var(--rit-orange-red)',
          borderTopLeftRadius: '7px',
          borderTopRightRadius: '7px',
          position: 'relative'
        }}>
          {/* Mobile Theme Toggle */}
          <button 
            className="theme-toggle-btn mobile-only"
            onClick={toggleTheme}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              color: '#FFFFFF',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="mobile-wrap login-item-anim login-delay-0" style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <RitLogo size="large" light={true} />
          </div>

          <h2 className="login-item-anim login-delay-0" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-inverse)', margin: '8px 0 0 0' }}>
            Academic Project Governance Portal
          </h2>
          <p className="login-item-anim login-delay-1" style={{ fontSize: '12px', color: 'var(--text-sidebar)', marginTop: '4px' }}>
            M. S. Ramaiah Institute of Technology — Autonomous College under VTU
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 24px' }}>
          <div className="login-item-anim login-delay-1">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '4px' }}>
              Portal Sign In
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Please authenticate using your official college email.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mobile-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '13px' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group login-item-anim login-delay-2">
              <label className="form-label">College Email</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. student@msrit.edu"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group login-item-anim login-delay-3">
              <div className="mobile-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <a 
                  href="#forgot" 
                  onClick={handleForgotPassword} 
                  style={{ fontSize: '12px', color: 'var(--rit-magenta)', fontWeight: 600 }}
                >
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="login-item-anim login-delay-4">
              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px', padding: '12px' }} disabled={isLoading}>
                <LogIn size={16} />
                <span>{isLoading ? 'Authenticating...' : 'LOGIN TO PORTAL'}</span>
              </button>
            </div>
          </form>

          {/* Dual Registration Options */}
          <div className="login-item-anim login-delay-5" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
              First Time User? Register Below:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onNavigateRegisterStudent}
                style={{ width: '100%', color: 'var(--text-heading)', fontWeight: 700 }}
              >
                🎓 New Student? Register Student Account
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onNavigateRegisterFaculty}
                style={{ width: '100%', color: 'var(--rit-magenta)', fontWeight: 700 }}
              >
                👨‍🏫 Faculty Member? Register Faculty Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
