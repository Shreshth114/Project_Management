import React, { useState } from 'react';
import { UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterStudent = ({ onSwitchToLogin }) => {
  const { data } = useAuth();
  
  const [usn, setUsn] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(data.subjects[0]?.code || '21CSP81');
  const [batch, setBatch] = useState(data.batches[0]?.title || '2021–2025 (8th Sem)');
  const [guideName, setGuideName] = useState(data.facultyGuides[0]?.name || 'Dr. R. Sharma');
  const [success, setSuccess] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F8F8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#243143',
          borderBottom: '4px solid #B82226',
          padding: '20px 24px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button 
            onClick={onSwitchToLogin}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', color: '#243143' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Student Registration Portal
            </h1>
            <p style={{ fontSize: '12px', color: '#D1D5DB', margin: 0 }}>
              Select System-Managed Subject, Batch & Guide
            </p>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle size={48} color="#038203" style={{ margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#243143', marginBottom: '8px' }}>
                Registration Submitted Successfully!
              </h2>
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
                USN ({usn}) registered under Subject {subject}, Batch {batch}, and Guide {guideName}.
              </p>
              <button className="btn btn-primary btn-block" onClick={onSwitchToLogin}>
                Proceed to Portal Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">University Seat Number (USN)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1MS21CS042"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Full name per VTU record"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">College Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@msrit.edu"
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

              {/* SYSTEM-MANAGED SELECTABLE DROPDOWNS */}
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">System Subject</label>
                  <select
                    className="form-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    {data.subjects.map(s => (
                      <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Batch</label>
                  <select
                    className="form-select"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                  >
                    {data.batches.map(b => (
                      <option key={b.id} value={b.title}>{b.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Allocated Guide</label>
                  <select
                    className="form-select"
                    value={guideName}
                    onChange={(e) => setGuideName(e.target.value)}
                  >
                    {data.facultyGuides.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '12px', padding: '11px' }}>
                SUBMIT STUDENT ENROLMENT
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
