import React, { useState, useEffect } from 'react';
import { User, Plus, CheckCircle, FolderPlus, BookOpen, Mail, Shield, Award, Edit, UserCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const StudentProfile = () => {
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser?.student_id) {
      loadTeam(currentUser.student_id);
    }
    academicService.getFaculty().then(facs => {
      if (facs && facs.length > 0) {
        const cleaned = facs.filter(f => !f.name.includes('[TEST]'));
        setFacultyList(cleaned.length > 0 ? cleaned : facs);
      }
    }).catch(console.error);

    academicService.getSubjects().then(subs => {
      if (subs && subs.length > 0) {
        const cleaned = subs.filter(s => !(s.subject_name || '').includes('(TEST DATA)'));
        setSubjectsList(cleaned.length > 0 ? cleaned : subs);
      }
    }).catch(console.error);
  }, [currentUser]);

  const loadTeam = async (studentId) => {
    try {
      setLoading(true);
      const teamData = await academicService.getTeamByStudent(studentId);
      setTeam(teamData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeGuide = team?.guide?.name || 'Not Assigned';
  const activeCoordinator = team?.coordinator || 'Not Assigned';
  const activeTitle = team?.subject?.subject_name || (team ? 'Academic Project' : 'No Enrolled Project');
  const activeSubjectCode = team?.subject?.subject_code || 'N/A';
  const activeGroupCode = team?.team_code || 'Not Enrolled';

  // Projects list state
  const [extraProjects, setExtraProjects] = useState([]);

  const getEnrolmentKey = () => `rit_extra_enrolments_${currentUser?.student_id || currentUser?.usn || currentUser?.user_id || 'guest'}`;

  const loadCustomEnrolments = () => {
    try {
      const raw = localStorage.getItem(getEnrolmentKey());
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  };

  // Sync projects with loaded team data from database + persisted custom enrolments
  useEffect(() => {
    const custom = loadCustomEnrolments();
    if (team) {
      const baseProject = {
        id: team.team_id || 'proj-1',
        title: activeTitle,
        batchId: activeGroupCode,
        subject: activeTitle,
        subjectCode: activeSubjectCode,
        guide: activeGuide,
        coordinator: activeCoordinator,
        status: 'Active'
      };
      setExtraProjects([baseProject, ...custom]);
    } else {
      setExtraProjects(custom);
    }
  }, [team, activeGuide, activeCoordinator, activeTitle, activeSubjectCode, activeGroupCode, currentUser]);

  // Form states for adding another project
  const [newTitle, setNewTitle] = useState('');
  const [newBatchId, setNewBatchId] = useState('');
  const [newSubject, setNewSubject] = useState('Technical Seminar & Paper');
  const [newSubjectCode, setNewSubjectCode] = useState('21CSS82');
  const [newGuide, setNewGuide] = useState('Faculty Guide');

  const handleAddProject = (e) => {
    e.preventDefault();
    const matchedSubject = subjectsList.find(s => (s.subject_code || s.code) === newSubjectCode);
    const assignedCoord = matchedSubject?.coordinator || activeCoordinator;

    const proj = {
      id: `proj-${Date.now()}`,
      title: newTitle || `${newSubject} Project`,
      batchId: newBatchId || 'Group G05',
      subject: newSubject,
      subjectCode: newSubjectCode,
      guide: newGuide,
      coordinator: assignedCoord,
      status: 'Enrolled'
    };

    const existingCustom = loadCustomEnrolments();
    const updatedCustom = [...existingCustom, proj];
    try {
      localStorage.setItem(getEnrolmentKey(), JSON.stringify(updatedCustom));
    } catch (err) {
      console.warn("Could not save enrolment:", err);
    }

    setExtraProjects(prev => [...prev, proj]);
    setNewTitle('');
    setNewBatchId('');
    setSuccess(`New project for ${newSubjectCode} added successfully!`);
    setTimeout(() => setSuccess(''), 3500);
  };

  const handleRemoveProject = (projId) => {
    const existingCustom = loadCustomEnrolments();
    const updatedCustom = existingCustom.filter(p => p.id !== projId);
    try {
      localStorage.setItem(getEnrolmentKey(), JSON.stringify(updatedCustom));
    } catch (err) {
      console.warn("Could not update enrolment:", err);
    }
    setExtraProjects(prev => prev.filter(p => p.id !== projId));
  };

  if (loading) return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading profile...</div>
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="stagger-1">
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>Student Overview</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Your student details and current project information.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {currentUser && (
        <>
          <div className="grid-2 stagger-2">
            <Card title="Student Credentials">
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-sidebar)',
                  color: 'var(--text-inverse)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '24px',
                  margin: '0 auto 12px'
                }}>
                  {currentUser.name?.charAt(0) || 'S'}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>{currentUser.name || 'Student'}</h2>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--badge-danger-text)', margin: '4px 0' }}>
                  USN: {currentUser.usn || currentUser.student_id || 'N/A'}
                </div>
              </div>
            </Card>

            <Card title="Academic & Project Details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div><strong>Course Code:</strong> {activeSubjectCode}</div>
                <div>
                  <strong>Allocated Guide:</strong>{' '}
                  <span style={{ color: 'var(--text-heading)', fontWeight: 700 }}>{activeGuide}</span>
                </div>
                <div><strong>Assigned Coordinator:</strong> <span style={{ color: 'var(--rit-magenta)', fontWeight: 700 }}>{activeCoordinator}</span></div>
                <div><strong>Batch ID:</strong> {activeGroupCode}</div>
              </div>
            </Card>
          </div>

          <div className="stagger-3">
            <Card title="Contact & Institutional Credentials">
              <div>
                <label className="form-label">Official College Email</label>
              <input type="text" className="form-input" value={currentUser.email || ''} disabled />
            </div>
            </Card>
          </div>
        </>
      )}

      {/* Box 1: Current Working Projects */}
      <div className="stagger-4">
        <Card title="Current Registered Academic Projects">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {extraProjects.length > 0 ? (
            extraProjects.map((p) => (
              <div 
                key={p.id}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderLeft: '5px solid var(--text-heading)'
                }}
              >
                <div className="mobile-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                    {p.title}
                  </h3>
                  <div className="mobile-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: p.status === 'Active' ? 'var(--badge-warning-text)' : 'var(--badge-info-text)', fontWeight: 600 }}>● {p.status}</span>
                    {p.status === 'Enrolled' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(p.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-disabled)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Remove enrolment"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid-4" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div><strong>Batch ID:</strong> <span style={{ color: 'var(--rit-orange-red)', fontWeight: 700 }}>{p.batchId}</span></div>
                  <div><strong>Subject:</strong> {p.subject}</div>
                  <div><strong>Allocated Guide:</strong> <span style={{ color: 'var(--text-heading)', fontWeight: 700 }}>{p.guide}</span></div>
                  <div><strong>Assigned Coordinator:</strong> <span style={{ color: 'var(--rit-magenta)', fontWeight: 700 }}>{p.coordinator || activeCoordinator}</span></div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-disabled)', fontSize: '14px' }}>
              No academic project teams currently registered in the database for this student account.
            </div>
          )}
        </div>
        </Card>
      </div>

    </div>
  );
};
