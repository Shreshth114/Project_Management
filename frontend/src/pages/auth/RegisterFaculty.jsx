import React, { useState } from 'react';
import { ArrowLeft, UserCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterFaculty = ({ onBackToLogin }) => {
  const { data, registerUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [password, setPassword] = useState(''); // Strictly empty until typed
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setSuccess('Faculty Enrolment completed successfully! Redirecting to login...');
        setTimeout(() => {
          onBackToLogin();
        }, 1500);
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
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(90deg, #8E00A8 0%, #B8115B 50%, #E63B00 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#242044',
          color: '#FFFFFF',
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
              color: '#FFF',
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
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Faculty Enrolment Portal
            </h2>
            <div style={{ fontSize: '12px', color: '#D1D5DB' }}>
              Specify Subject Name & Subject Code Options
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {success && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <span>{error}</span>
            </div>
          )}

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
                <label className="form-label">Subject Name Option</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Major Project Phase - II"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject Code</label>
                <select 
                  className="form-select"
                  value={subjectCode}
                  onChange={(e) => {
                    setSubjectCode(e.target.value);
                    const foundSub = (data?.subjects || []).find(s => s.code === e.target.value);
                    if (foundSub) setSubjectName(foundSub.name);
                  }}
                  required
                >
                  <option value="">Select a subject</option>
                  {(data?.subjects || []).map(s => (
                    <option key={s.id || s.code} value={s.code}>
                      {s.code} ({s.name})
                    </option>
                  ))}
                </select>
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

            <button type="submit" className="btn btn-magenta btn-block" style={{ marginTop: '16px', padding: '12px' }} disabled={isSubmitting}>
              <UserCheck size={16} />
              <span>{isSubmitting ? 'PROCESSING ENROLMENT...' : 'SUBMIT FACULTY ENROLMENT'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
