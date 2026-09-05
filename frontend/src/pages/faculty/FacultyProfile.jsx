import React, { useState } from 'react';
import { User, Plus, CheckCircle, RefreshCw, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const FacultyProfile = () => {
  const { data, currentUser, switchTeacherRole } = useAuth();

  // Check if faculty is assigned as Coordinator for any subject
  const isAssignedCoordinator = (data.subjects || []).some(
    s => s.coordinator === currentUser?.name || s.coordinator === currentUser?.username
  ) || currentUser?.role === 'COORDINATOR';

  // Interactive subjects managed by faculty
  const [managedSubjects, setManagedSubjects] = useState([
    {
      id: 'sub-1',
      subjectName: 'Major Project Phase - II',
      subjectCode: '21CSP81',
      mode: 'Group',
      groupName: 'Group G01'
    }
  ]);

  // Form states for adding subject
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('21CSS82');
  const [mode, setMode] = useState('Group'); // 'Group' | 'Individual'
  const [groupName, setGroupName] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddSubject = (e) => {
    e.preventDefault();
    const newSub = {
      id: `sub-${Date.now()}`,
      subjectName,
      subjectCode,
      mode,
      groupName: mode === 'Group' ? groupName : 'N/A (Individual)'
    };

    setManagedSubjects([...managedSubjects, newSub]);
    setSubjectName('');
    setGroupName('');
    setSuccess(`Subject "${subjectCode} - ${subjectName}" added successfully!`);
    setTimeout(() => setSuccess(''), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Faculty Profile & Subject Allocation</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Faculty evaluator credentials, course allocations, and project modes.
          </p>
        </div>

        {/* Switch to Coordinator Workspace button ONLY shown if assigned as Coordinator */}
        {isAssignedCoordinator && (
          <button 
            type="button"
            className="btn btn-magenta"
            onClick={() => switchTeacherRole('COORDINATOR')}
          >
            <RefreshCw size={15} />
            <span>SWITCH TO COORDINATOR WORKSPACE</span>
          </button>
        )}
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Faculty Identification Overview */}
      <Card title="Faculty Member Identification">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#3A1F6F',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '24px'
          }}>
            {currentUser?.name?.charAt(0) || 'F'}
          </div>

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
              {currentUser?.name || 'Dr. R. Sharma'}
            </h2>
            <div style={{ fontSize: '13px', color: '#55636B', marginTop: '2px' }}>
              Institutional Email: <strong>{currentUser?.email}</strong> | Department: <strong>{currentUser?.department || 'CSE'}</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Badge variant="purple">Faculty Evaluator</Badge>
              {isAssignedCoordinator && <Badge variant="magenta">Assigned Subject Coordinator</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* Managed Subjects Roster */}
      <Card title="Allocated Subjects & Project Modes">
        <div className="table-container responsive-table-stack" style={{ marginBottom: '16px' }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Project Mode</th>
                <th>Group Name (If Applicable)</th>
              </tr>
            </thead>
            <tbody>
              {managedSubjects.map((sub) => (
                <tr key={sub.id}>
                  <td data-label="Subject Code" style={{ fontWeight: 800, color: '#DE3B0B' }}>{sub.subjectCode}</td>
                  <td data-label="Subject Name" style={{ fontWeight: 600 }}>{sub.subjectName}</td>
                  <td data-label="Project Mode"><Badge variant="purple">{sub.mode}</Badge></td>
                  <td data-label="Group Name" style={{ fontWeight: 700, color: '#3A1F6F' }}>{sub.groupName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Interactive Box: Add Subject, Subject Code & Mode */}
      <Card title="Add Subject Allocation & Project Mode">
        <form onSubmit={handleAddSubject}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject Name</label>
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
                onChange={(e) => setSubjectCode(e.target.value)}
              >
                {data.subjects.map(s => (
                  <option key={s.id} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Project Mode Target</label>
              <select
                className="form-select"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="Group">Group Project Mode</option>
                <option value="Individual">Individual Project Mode</option>
              </select>
            </div>

            {/* Conditionally reveal Group Name input IF mode === 'Group' */}
            {mode === 'Group' && (
              <div className="form-group">
                <label className="form-label">Group Name / Team Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Group G01 or Team Beta"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
            <Plus size={16} />
            <span>ADD SUBJECT ALLOCATION</span>
          </button>
        </form>
      </Card>
    </div>
  );
};
