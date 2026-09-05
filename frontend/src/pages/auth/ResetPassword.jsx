import React, { useState } from 'react';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RitLogo } from '../../components/common/RitLogo';

export const ResetPassword = ({ onBackToLogin, initialError }) => {
  const { updatePassword } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(initialError || '');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setSuccess('Your password has been reset successfully.');
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating your password.');
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
            Set New Password
          </h2>
          <p style={{ fontSize: '12px', color: '#D1D5DB', marginTop: '4px' }}>
            Create a new password for your account.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Lock size={20} color="#8E00A8" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#8E00A8', marginBottom: '4px' }}>
              Reset Password
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#55636B', marginBottom: '20px' }}>
            Create a new password for your account.
          </p>

          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '13px' }}>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: '13px' }}>{success}</span>
            </div>
          )}

          {!initialError && !success && (
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px', padding: '12px' }} disabled={isLoading}>
                <Lock size={16} />
                <span>{isLoading ? 'Updating...' : 'Reset Password'}</span>
              </button>
            </form>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onBackToLogin}
              style={{ background: 'none', border: 'none', color: '#8E00A8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              ← Cancel and Return to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
