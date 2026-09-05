import React, { useState } from 'react';
import { ArrowLeft, UserCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterStudent = ({ onBackToLogin }) => {
  const { data, registerUser } = useAuth();
  
  const [usn, setUsn] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [guide, setGuide] = useState('');
  const [password, setPassword] = useState(''); // Strictly empty until typed
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().includes('@msrit.edu')) {
      setError('Please provide an official college email (@msrit.edu).');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = {
        username: usn.toUpperCase(),
        usn: usn.toUpperCase(),
        name,
        email,
        role: 'STUDENT',
        department: 'CSE',
        batch,
        subject: selectedSubject,
        groupName,
        guide,
        password,
        groupId: 'G01'
      };

      const res = await registerUser(newUser);
      if (res.success) {
        setSuccess('Student Enrolment completed successfully! Redirecting to login...');
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
        maxWidth: '600px',
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
          borderBottom: '4px solid #E63B00'
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
              Student Registration Portal
            </h2>
            <div style={{ fontSize: '12px', color: '#D1D5DB' }}>
              Select System Subject, Academic Batch & Group Name
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
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">University Seat Number (USN)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1MS21CS042"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Full name per VTU record"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">College Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="student@msrit.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>

              {/* Added Academic Batch Option */}
              <div className="form-group">
                <label className="form-label">Academic Batch</label>
                <select
                  className="form-select"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  required
                >
                  <option value="">Select a batch</option>
                  <option value="Batch 1 (8th Sem)">Batch 1 (8th Sem)</option>
                  <option value="Batch 2 (6th Sem)">Batch 2 (6th Sem)</option>
                  <option value="Batch 3 (4th Sem)">Batch 3 (4th Sem)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Team / Group Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Group G01"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">System Subject Code</label>
                <select 
                  className="form-select"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                >
                  <option value="">Select a subject</option>
                  {(data?.subjects || []).map(s => (
                    <option key={s.id || s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject Coordinator</label>
                <select 
                  className="form-select"
                  value={guide}
                  onChange={(e) => setGuide(e.target.value)}
                  required
                >
                  <option value="">Select a guide</option>
                  {(data?.facultyGuides || []).map(g => (
                    <option key={g.id || g.name} value={g.name}>{g.name}</option>
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

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '16px', padding: '12px' }} disabled={isSubmitting}>
              <UserCheck size={16} />
              <span>{isSubmitting ? 'PROCESSING ENROLMENT...' : 'SUBMIT STUDENT ENROLMENT'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
