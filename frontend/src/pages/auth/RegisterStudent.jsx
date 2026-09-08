import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { academicService } from '../../services/academicService';

export const RegisterStudent = ({ onBackToLogin }) => {
  const { registerUser } = useAuth();
  
  const [usn, setUsn] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [guide, setGuide] = useState('');
  const [guideId, setGuideId] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic dropdown options from database
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      setLoadingOptions(true);
      const [fetchedSubjects, fetchedFaculty] = await Promise.all([
        academicService.getSubjects().catch(() => []),
        academicService.getFaculty().catch(() => [])
      ]);

      setSubjects(fetchedSubjects || []);
      if (fetchedSubjects && fetchedSubjects.length > 0) {
        setSelectedSubject(fetchedSubjects[0].subject_code || fetchedSubjects[0].code);
      }

      setFacultyList(fetchedFaculty || []);
      if (fetchedFaculty && fetchedFaculty.length > 0) {
        setGuide(fetchedFaculty[0].name);
        setGuideId(fetchedFaculty[0].faculty_id);
      }
    } catch (err) {
      console.warn("Failed to load registration options:", err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().includes('@msrit.edu')) {
      setError('Please provide an official college email (@msrit.edu).');
      return;
    }

    if (!guideId && facultyList.length > 0) {
      setError('Please select an allocated faculty guide.');
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
        batch: batch || 'Batch 1 (8th Sem)',
        subject: selectedSubject,
        groupName: groupName.trim() || `Group ${usn.slice(-3).toUpperCase()}`,
        guide,
        guideId: guideId ? Number(guideId) : null,
        password
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
        maxWidth: '640px',
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
              Select Course Subject, Academic Batch & Allocated Faculty Guide
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
                  placeholder="e.g. Group G01 or Team Gamma"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Course Subject Code</label>
                <select 
                  className="form-select"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                >
                  <option value="">
                    {loadingOptions ? 'Loading subjects...' : 'Select a course subject'}
                  </option>
                  {subjects.map(s => (
                    <option key={s.subject_id || s.id || s.subject_code} value={s.subject_code || s.code}>
                      {s.subject_code || s.code} - {s.subject_name || s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Allocated Faculty Guide</label>
                <select 
                  className="form-select"
                  value={guideId}
                  onChange={(e) => {
                    setGuideId(e.target.value);
                    const selected = facultyList.find(g => String(g.faculty_id) === String(e.target.value));
                    if (selected) setGuide(selected.name);
                  }}
                  required
                >
                  <option value="">
                    {loadingOptions ? 'Loading faculty guides...' : 'Select a faculty guide'}
                  </option>
                  {facultyList.map(g => (
                    <option key={g.faculty_id} value={g.faculty_id}>
                      {g.name} ({g.is_coordinator ? 'Coordinator & Guide' : 'Faculty Guide'})
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

            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              style={{ marginTop: '16px', padding: '12px' }} 
              disabled={isSubmitting}
            >
              <UserCheck size={16} />
              <span>{isSubmitting ? 'PROCESSING ENROLMENT...' : 'SUBMIT STUDENT ENROLMENT'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
