import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { RitLogo } from '../../components/common/RitLogo';

export const EmailVerified = ({ isError, onBackToLogin }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-header)',
      padding: '20px',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="login-card-anim" style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}>
        {/* Header Banner */}
        <div style={{
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-inverse)',
          padding: '28px 24px',
          textAlign: 'center',
          borderBottom: '4px solid var(--rit-orange-red)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <RitLogo size="large" light={true} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 0 0' }}>
            Academic Project Governance Portal
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          {isError ? (
            <>
              <XCircle size={48} color="var(--status-error)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '12px' }}>
                Verification Link Invalid
              </h3>
              <p style={{ color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '24px' }}>
                This email verification link is invalid or has expired. Please try registering again or contact support if the issue persists.
              </p>
            </>
          ) : (
            <>
              <CheckCircle size={48} color="var(--status-success)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '12px' }}>
                Email Verified Successfully!
              </h3>
              <p style={{ color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '24px' }}>
                Your email address has been successfully verified.<br/><br/>
                You can now return to the MSRIT PMS website and log in with your credentials.<br/><br/>
                You can close this page now.
              </p>
            </>
          )}

          <button 
            onClick={() => {
              if (window.location.hash || window.location.search) {
                window.history.replaceState(null, '', window.location.pathname);
              }
              onBackToLogin();
            }}
            className="btn btn-secondary btn-block"
            style={{ padding: '12px' }}
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};
