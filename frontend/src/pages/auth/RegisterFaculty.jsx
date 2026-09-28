import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { academicService } from '../../services/academicService';

export const RegisterFaculty = ({ onBackToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const { registerUser, resendVerificationEmail } = useAuth();

  // Dynamic subjects from database
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    academicService.getSubjects()
      .then(subs => {
        setSubjects(subs || []);
      })
      .catch(console.error)
      .finally(() => setLoadingSubjects(false));
  }, []);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(c => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending) return;
    
    setIsResending(true);
    setResendError('');
    setResendMessage('');
    
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        setResendMessage('Verification email sent ✓');
        setResendCooldown(60);
      } else {
        if (res.message && res.message.includes('after')) {
          const match = res.message.match(/after (\d+) seconds/);
          if (match) {
            setResendCooldown(parseInt(match[1], 10));
          }
        }
        setResendError(res.message || 'Unable to resend the verification email. Please try again.');
      }
    } catch (err) {
      setResendError('Unable to resend the verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().includes('@msrit.edu')) {
      setError('Please provide an official institutional faculty email (@msrit.edu).');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = {
        username: email.split('@')[0],
        name,
        email,
        role: 'TEACHER',
        teacherRoles: ['FACULTY'],
        subjectName,
        subjectCode,
        subject: subjectCode,
        password
      };

      const res = await registerUser(newUser);
      if (res.success) {
        if (res.requiresEmailConfirmation) {
          setRegistrationSuccess(true);
          setResendCooldown(60);
        } else {
          setSuccess('Faculty Enrolment completed successfully! Redirecting to login...');
          setTimeout(() => {
            onBackToLogin();
          }, 1500);
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(90deg, #8E00A8 0%, #B8115B 50%, #E63B00 100%)',
      padding: '20px'
    }}>
      <div style={{
        margin: 'auto',
        width: '100%',
        maxWidth: '540px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '8px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-inverse)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          borderBottom: '4px solid #B8115B'
        }}>
          <button 
            type="button" 
            onClick={onBackToLogin}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'var(--text-inverse)',
              padding: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-inverse)', margin: 0 }}>
              Faculty Enrolment Portal
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-sidebar)' }}>
              Specify Course Name & Select Course Code
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {success && !registrationSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && !registrationSuccess && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!registrationSuccess && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name with Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institutional Email (@msrit.edu)</label>
              <input
                type="email"
                className="form-input"
                placeholder="faculty@msrit.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <select 
                  className="form-select"
                  value={subjectCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSubjectCode(code);
                    const foundSub = subjects.find(s => (s.subject_code || s.code) === code);
                    if (foundSub) setSubjectName(foundSub.subject_name || foundSub.name);
                  }}
                  required
                >
                  <option value="">
                    {loadingSubjects ? 'Loading subjects...' : 'Select a subject'}
                  </option>
                  {subjects.map(s => (
                    <option key={s.subject_id || s.id || s.subject_code} value={s.subject_code || s.code}>
                      {s.subject_code || s.code} ({s.subject_name || s.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Course Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Major Project Phase - II"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Password</label>
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

            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              style={{ marginTop: '16px', padding: '12px' }} 
              disabled={isSubmitting}
            >
              <UserCheck size={16} />
              <span>Submit</span>
            </button>
          </form>
          )}

          {registrationSuccess && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                width: '64px', height: '64px', 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                color: '#22c55e', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 20px auto'
              }}>
                <CheckCircle size={32} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
                Registration Successful!
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                We've sent a verification email to <strong>{email}</strong>. 
                Please check your inbox and verify your email before logging in.
              </p>
              
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-sidebar)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '20px' }}>
                <p style={{ color: 'var(--text-sidebar)', fontSize: '14px', marginBottom: '16px' }}>
                  Didn't receive the email?
                </p>
                
                {resendMessage && (
                  <div style={{ color: '#22c55e', fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>
                    {resendMessage}
                  </div>
                )}
                
                {resendError && (
                  <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>
                    {resendError}
                  </div>
                )}
                
                <button 
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0 || isResending}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isResending ? 'Sending...' : 
                   resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 
                   'Resend Verification Email'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
