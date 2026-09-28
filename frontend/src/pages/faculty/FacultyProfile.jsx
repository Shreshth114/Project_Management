import React, { useState, useEffect } from 'react';
import { User, Plus, CheckCircle, RefreshCw, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const FacultyProfile = () => {
  const { currentUser, switchTeacherRole } = useAuth();

  const isAssignedCoordinator = Boolean(
    currentUser?.is_coordinator ||
    currentUser?.isCoordinator ||
    currentUser?.teacherRoles?.includes('COORDINATOR') ||
    currentUser?.role === 'COORDINATOR'
  );

  const [managedSubjects, setManagedSubjects] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  // Form states for adding subject
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [mode, setMode] = useState('Group'); // 'Group' | 'Individual'
  const [batchId, setBatchId] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser?.faculty_id) {
      academicService.getTeams({ guide_id: currentUser.faculty_id })
        .then(teams => {
          if (teams && teams.length > 0) {
            setManagedSubjects(teams.map(t => ({
              id: t.team_id,
              subjectName: t.subject?.subject_name || 'Academic Project',
              subjectCode: t.subject?.subject_code || 'Course Code',
              mode: 'Group',
              batchId: t.team_code
            })));
          } else {
            setManagedSubjects([]);
          }
        })
        .catch(console.error);
    }

    academicService.getSubjects()
      .then(subs => {
        setSubjectsList(subs || []);
        if (subs && subs.length > 0) {
          setSubjectCode(subs[0].subject_code);
        }
      })
      .catch(console.error);
  }, [currentUser]);

  const handleAddSubject = (e) => {
    e.preventDefault();
    const newSub = {
      id: `sub-${Date.now()}`,
      subjectName,
      subjectCode,
      mode,
      batchId: mode === 'Group' ? batchId : 'N/A (Individual)'
    };

    setManagedSubjects(prev => [...prev, newSub]);
    setSubjectName('');
    setBatchId('');
    setSuccess(`Subject "${subjectCode} - ${subjectName}" added successfully!`);
    setTimeout(() => setSuccess(''), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>Faculty Profile & Academic Portfolio</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Faculty identification, institutional credentials, and assigned project courses.
          </p>
        </div>

        {/* Dual Persona Switch Button IF user is coordinator */}
        {isAssignedCoordinator && (
          <button 
            type="button"
            className="btn btn-purple mobile-wrap"
            onClick={() => switchTeacherRole('COORDINATOR')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
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

      {/* Grid: Identification Card & Credentials */}
      <div className="grid-2">
        <Card title="Faculty Identification">
          <div className="mobile-wrap" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-sidebar)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '24px'
            }}>
              {currentUser?.name?.charAt(0) || 'F'}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                {currentUser?.name || 'Faculty Member'}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Department of Information Science & Engineering
              </div>
              <div className="mobile-wrap" style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <Badge variant="purple">Faculty Advisor</Badge>
                {isAssignedCoordinator && <Badge variant="magenta">Subject Coordinator</Badge>}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Institutional Credentials">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Official Email:</strong> <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{currentUser?.email || 'N/A'}</span></div>
            <div><strong>College Portal Username:</strong> {currentUser?.username || currentUser?.email}</div>
            <div><strong>Coordinator Access:</strong> {isAssignedCoordinator ? <Badge variant="success">Authorized</Badge> : <Badge variant="secondary">Standard Faculty</Badge>}</div>
          </div>
        </Card>
      </div>

      {/* Box 1: Current Working Projects / Subjects */}
      <Card title="Assigned Subjects & Groups">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {managedSubjects.length > 0 ? (
            managedSubjects.map((sub) => (
              <div 
                key={sub.id} 
                style={{ 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '6px', 
                  padding: '16px', 
                  backgroundColor: 'var(--bg-surface)',
                  borderLeft: '5px solid #3A1F6F'
                }}
              >
                <div className="mobile-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                    {sub.subjectName}
                  </h3>
                  <Badge variant="purple">{sub.mode} Mode</Badge>
                </div>
                <div className="grid-3" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div><strong>Course Code:</strong> {sub.subjectCode}</div>
                  <div><strong>Batch ID:</strong> <span style={{ color: 'var(--rit-orange-red)', fontWeight: 700 }}>{sub.batchId}</span></div>
                  <div><strong>Status:</strong> Active Evaluation</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-disabled)' }}>
              No active subjects or guided groups assigned to this faculty member yet.
            </div>
          )}
        </div>
      </Card>

    </div>
  );
};
