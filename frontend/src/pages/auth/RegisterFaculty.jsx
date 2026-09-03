import React, { useState } from 'react';
import { ArrowLeft, UserCheck, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { RitLogo } from '../../components/common/RitLogo';

export const RegisterFaculty = ({ onBackToLogin }) => {
  const { data, registerUser } = useAuth();
  
  const [empCode, setEmpCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('CSE');
  const [designation, setDesignation] = useState('Associate Professor');
  const [selectedSubject, setSelectedSubject] = useState(data.subjects[0]?.code || '21CSP81');
  const [password, setPassword] = useState('faculty123');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().includes('@msrit.edu')) {
      setError('Please provide an official institutional faculty email (@msrit.edu).');
      return;
    }

    const newUser = {
      username: empCode || email.split('@')[0],
      name,
      email,
      role: 'FACULTY',
      teacherRoles: ['FACULTY'],
      department: dept,
      designation,
      subject: selectedSubject,
      phone,
      password
    };

    const res = registerUser(newUser);
    if (res.success) {
      setSuccess('Faculty Registration completed successfully! Redirecting to login...');
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } else {
      setError(res.message || 'Registration failed.');
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
        maxWidth: '560px',
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
              Faculty & Evaluator Enrolment Portal
            </h2>
            <div style={{ fontSize: '12px', color: '#D1D5DB' }}>
              Select System-Managed Subject, Department & Designation
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
                <label className="form-label">Employee / Faculty ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. FAC202108"
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  required
                />
              </div>

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
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Institutional Email (@msrit.edu)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="faculty@msrit.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98450 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  className="form-select"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                >
                  <option value="CSE">Computer Science & Eng (CSE)</option>
                  <option value="ECE">Electronics & Comm (ECE)</option>
                  <option value="ISE">Information Science (ISE)</option>
                  <option value="MECH">Mechanical Eng (MECH)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <select 
                  className="form-select"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                >
                  <option value="Professor & Head">Professor & Head</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">System Subject / Course Code</label>
              <select 
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {data.subjects.map(s => (
                  <option key={s.id} value={s.code}>
                    {s.code} - {s.name} ({s.branch})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-magenta btn-block" style={{ marginTop: '16px', padding: '12px' }}>
              <UserCheck size={16} />
              <span>SUBMIT FACULTY ENROLMENT</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
