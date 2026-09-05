import React, { useState } from 'react';
import { ArrowLeft, KeyRound, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RitLogo } from '../../components/common/RitLogo';

export const ForgotPassword = ({ onBackToLogin, onNavigateReset }) => {
  const { resetPassword } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim()) {
      setError('Please provide your institutional email address or USN.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(identifier.trim());
      if (res.success) {
        setSuccess("If an account exists with this email, you'll receive a password reset link shortly.");
        setIdentifier('');
      } else {
        setError(res.message || 'Failed to request password reset.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while requesting password reset.');
    } finally {
      setIsLoading(false);
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
          padding: '24px',
          textAlign: 'center',
          borderBottom: '4px solid #E63B00',
          position: 'relative'
        }}>
          <button 
            type="button" 
            onClick={onBackToLogin}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#FFF',
              padding: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Back to Login"
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <RitLogo size="large" light={true} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 0 0' }}>
            Account Password Recovery
          </h2>
          <p style={{ fontSize: '12px', color: '#D1D5DB', marginTop: '4px' }}>
            M. S. Ramaiah Institute of Technology
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <KeyRound size={20} color="#8E00A8" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#8E00A8', margin: 0 }}>
              Reset Your Password
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#55636B', marginBottom: '20px' }}>
            Enter your registered college email and we'll send you a link to reset your password.
          </p>

          {success && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '13px' }}>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '13px' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleResetRequest}>
            <div className="form-group">
              <label className="form-label">College Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. yourname@msrit.edu"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              style={{ marginTop: '20px', padding: '12px' }} 
              disabled={isLoading}
            >
              <Send size={16} />
              <span>{isLoading ? 'SENDING...' : 'SEND RESET LINK'}</span>
            </button>
          </form>

          {/* Navigation Links */}
          <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={onBackToLogin}
              style={{ background: 'none', border: 'none', color: '#8E00A8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              ← Remembered password? Return to Sign In
            </button>


          </div>
        </div>
      </div>
    </div>
  );
};
