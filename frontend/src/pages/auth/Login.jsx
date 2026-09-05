import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RitLogo } from '../../components/common/RitLogo';

export const Login = ({ onNavigateRegisterStudent, onNavigateRegisterFaculty, onNavigateForgotPassword }) => {
  const { login } = useAuth();
  
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
    } else {
      alert("Please contact the System Admin at admin@msrit.edu for password reset.");
    }
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
        {/* Header Banner */}
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

        {/* Form Body */}
        <div style={{ padding: '28px 24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#8E00A8', marginBottom: '4px' }}>
            Portal Sign In
          </h3>
          <p style={{ fontSize: '13px', color: '#55636B', marginBottom: '20px' }}>
            Please authenticate using your official college email.
          </p>

          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '13px' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
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

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <a 
                  href="#forgot" 
                  onClick={handleForgotPassword} 
                  style={{ fontSize: '12px', color: '#B8115B', fontWeight: 600 }}
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

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px', padding: '12px' }} disabled={isLoading}>
              <LogIn size={16} />
              <span>{isLoading ? 'Authenticating...' : 'LOGIN TO PORTAL'}</span>
            </button>
          </form>

          {/* Dual Registration Options */}
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
