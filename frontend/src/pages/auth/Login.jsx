import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login = ({ onSwitchToRegister }) => {
  const { login, quickSwitchUser } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(emailOrUsername, password);
      if (!res.success) {
        setError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F8F8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {/* Top Institutional Red Header Banner */}
        <div style={{
          backgroundColor: '#243143',
          borderBottom: '4px solid #B82226',
          padding: '24px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#B82226',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '18px',
            padding: '6px 14px',
            borderRadius: '4px',
            marginBottom: '8px'
          }}>
            MSRIT
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', margin: '4px 0' }}>
            Academic Project Governance Portal
          </h1>
          <p style={{ fontSize: '12px', color: '#D1D5DB' }}>
            M. S. Ramaiah Institute of Technology — Autonomous College under VTU
          </p>
        </div>

        {/* Login Form Body */}
        <div style={{ padding: '28px 24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#243143', marginBottom: '4px' }}>
            Portal Sign In
          </h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
            Please authenticate using your official college email or USN.
          </p>

          {error && (
            <div className="alert alert-danger">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">College Email / USN / Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1MS21CS042 or dr.sharma@msrit.edu"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to registered email address."); }} style={{ fontSize: '12px', color: '#B82226', textDecoration: 'none' }}>
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: '12px', padding: '11px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating Credentials...' : 'LOGIN TO PORTAL'}
            </button>
          </form>

          {/* Quick Persona Demo Switcher for Evaluation */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E5E5E5' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#243143', marginBottom: '10px' }}>
              Quick Persona Demo Shortcuts:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => quickSwitchUser('u-student-1', 'STUDENT')}
                style={{ fontSize: '12px' }}
              >
                🎓 Student Log In
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => quickSwitchUser('u-teacher-1', 'FACULTY')}
                style={{ fontSize: '12px' }}
              >
                👨‍🏫 Faculty Log In
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => quickSwitchUser('u-teacher-1', 'COORDINATOR')}
                style={{ fontSize: '12px' }}
              >
                📋 Coordinator Log In
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => quickSwitchUser('u-admin-1', 'ADMIN')}
                style={{ fontSize: '12px' }}
              >
                🛡️ Admin Log In
              </button>
            </div>
          </div>

          {/* Student Registration Link */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
            New Final Year Student?{' '}
            <button 
              type="button"
              onClick={onSwitchToRegister}
              style={{ background: 'none', border: 'none', color: '#B82226', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              Register Account Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
