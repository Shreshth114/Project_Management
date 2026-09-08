import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { academicService } from '../../services/academicService';

export const RegisterFaculty = ({ onBackToLogin }) => {
  const { registerUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic subjects from database
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    academicService.getSubjects()
      .then(subs => {
        setSubjects(subs || []);
        if (subs && subs.length > 0) {
          setSubjectCode(subs[0].subject_code || subs[0].code);
          setSubjectName(subs[0].subject_name || subs[0].name);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSubjects(false));
  }, []);

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
        maxWidth: '540px',
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
              Specify Subject Name & Select Course Subject Code
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
              <AlertCircle size={18} />
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
                <label className="form-label">Course Subject Code</label>
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
                <label className="form-label">Subject Full Name</label>
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
              className="btn btn-magenta btn-block" 
              style={{ marginTop: '16px', padding: '12px' }} 
              disabled={isSubmitting}
            >
              <UserCheck size={16} />
              <span>{isSubmitting ? 'PROCESSING ENROLMENT...' : 'SUBMIT FACULTY ENROLMENT'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
