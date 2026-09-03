import React, { useState } from 'react';
import { LogIn, Key, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RitLogo } from '../../components/common/RitLogo';

export const Login = ({ onNavigateRegisterStudent, onNavigateRegisterFaculty }) => {
  const { login } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please enter your institutional email / USN and password.');
      return;
    }

    const res = login(identifier.trim(), password.trim());
    if (!res.success) {
      setError(res.message || 'Invalid credentials or user not registered.');
    }
  };

  const handleGoogleSignIn = () => {
    // Demo Google Auth simulation for student
    login('1MS21CS042@msrit.edu', 'password123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(90deg, #8E00A8 0%, #B8115B 50%, #E63B00 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Card Header with Official RIT Branding */}
        <div style={{
          backgroundColor: '#242044',
          color: '#FFFFFF',
          padding: '28px 24px',
          textAlign: 'center',
          borderBottom: '4px solid #E63B00'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <RitLogo size="large" light={true} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '8px 0 0 0' }}>
            Academic Project Governance Portal
          </h2>
          <p style={{ fontSize: '12px', color: '#D1D5DB', marginTop: '4px' }}>
            M. S. Ramaiah Institute of Technology — Autonomous College under VTU
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: '28px 24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#8E00A8', marginBottom: '4px' }}>
            Portal Sign In
          </h3>
          <p style={{ fontSize: '13px', color: '#55636B', marginBottom: '20px' }}>
            Please authenticate using your official college email or USN.
          </p>

          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '13px' }}>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CCCCCC',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '14px',
              color: '#333333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              marginBottom: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in with Google Workspace</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '16px 0',
            color: '#8A9198',
            fontSize: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }}></div>
            <span>OR EMAIL LOGIN</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }}></div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">College Email / USN / Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1MS21CS042 or dr.sharma@msrit.edu"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Contact institutional IT admin for password reset."); }} style={{ fontSize: '12px', color: '#B8115B', fontWeight: 600 }}>
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

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px', padding: '12px' }}>
              <LogIn size={16} />
              <span>LOGIN TO PORTAL</span>
            </button>
          </form>

          {/* Dual Account Registration Options */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E5E5E5', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#55636B', marginBottom: '10px', fontWeight: 600 }}>
              First Time User? Register Below:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onNavigateRegisterStudent}
                style={{ width: '100%', color: '#8E00A8', fontWeight: 700 }}
              >
                🎓 New Student? Register Student Account
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onNavigateRegisterFaculty}
                style={{ width: '100%', color: '#B8115B', fontWeight: 700 }}
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
