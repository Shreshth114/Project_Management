import React, { useState, useEffect } from 'react';
import { User, Plus, CheckCircle, RefreshCw, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const CoordinatorProfile = () => {
  const { currentUser, switchTeacherRole } = useAuth();

  const [coordinatorProjects, setCoordinatorProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form for new subject/project allocation
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCoordinatorData();
  }, [currentUser]);

  const loadCoordinatorData = async () => {
    try {
      setLoading(true);
      const [subjects, teams] = await Promise.all([
        academicService.getSubjects().catch(() => []),
        academicService.getTeams().catch(() => [])
      ]);

      const coordinatorName = currentUser?.name?.toLowerCase() || '';
      const coordinatorEmail = currentUser?.email?.toLowerCase() || '';

      // Filter subjects where this user is assigned coordinator
      const mySubjects = (subjects || []).filter(s => 
        s.coordinator && (s.coordinator.toLowerCase() === coordinatorName || s.coordinator.toLowerCase() === coordinatorEmail)
      );

      // Projects/teams related to these subjects or where guide_id is user
      const projects = [];
      (teams || []).forEach(team => {
        const isMySubject = mySubjects.some(s => s.subject_id === team.subject_id || (s.subject_code && s.subject_code === team.subject?.subject_code));
        const isMyGuide = team.guide_id === currentUser?.faculty_id || (team.guide?.name && team.guide.name.toLowerCase() === coordinatorName);

        if (isMySubject || isMyGuide) {
          projects.push({
            id: team.team_id,
            subjectName: team.subject?.subject_name || 'Academic Project Course',
            subjectCode: team.subject?.subject_code || 'PROJ',
            projectName: team.subject?.subject_name ? `${team.subject.subject_name} (${team.team_code})` : team.team_code,
            groupName: team.team_code,
            numProjects: 1,
            numGroupsGuiding: team.members?.length || 0
          });
        }
      });

      setCoordinatorProjects(projects);
    } catch (err) {
      console.warn("Failed to load coordinator profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoordinatorProject = async (e) => {
    e.preventDefault();
    const newProj = {
      id: `cp-${Date.now()}`,
      subjectName: newSubjectName,
      subjectCode: newSubjectCode,
      projectName: newProjectName,
      groupName: newGroupName,
      numProjects: 1,
      numGroupsGuiding: 1
    };

    setCoordinatorProjects(prev => [...prev, newProj]);
    setNewGroupName('');
    setNewProjectName('');
    setNewSubjectName('');
    setNewSubjectCode('');
    setSuccess(`Coordinator Project Allocation for "${newSubjectCode} - ${newSubjectName}" added successfully!`);
    setTimeout(() => setSuccess(''), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>Subject Coordinator Profile & Portfolio</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Coordinator credentials, subject allocations, and guided project groups.
          </p>
        </div>

        <button 
          type="button"
          className="btn btn-purple"
          onClick={() => switchTeacherRole('FACULTY')}
        >
          <RefreshCw size={15} />
          <span>SWITCH TO FACULTY WORKSPACE</span>
        </button>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Identification Header */}
      <Card title="Coordinator Identification">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--rit-magenta)',
            color: 'var(--text-inverse)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '24px'
          }}>
            {(currentUser?.name || currentUser?.email || 'C').charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              {currentUser?.name || 'Subject Coordinator'}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Email: <strong>{currentUser?.email}</strong> | Designation: <strong>Coordinator / Faculty</strong>
            </div>
            <div className="mobile-wrap" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Badge variant="magenta">Subject Coordinator</Badge>
              <Badge variant="purple">Faculty Member</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Coordinated Subjects Overview */}
      <Card title="Coordinated Subjects & Guided Batches Overview">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading coordinated subjects...</div>
          </div>
        ) : coordinatorProjects.length === 0 ? (
          <p style={{ padding: '16px', color: 'var(--text-muted)' }}>
            No project groups or subject allocations registered for this coordinator in the database.
          </p>
        ) : (
          <div className="table-container responsive-table-stack" style={{ marginBottom: '16px' }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Project Name</th>
                  <th>Group Name</th>
                  <th>Total Projects</th>
                  <th>Students Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {coordinatorProjects.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Course Code" style={{ fontWeight: 800, color: 'var(--rit-orange-red)' }}>{p.subjectCode}</td>
                    <td data-label="Course Name" style={{ fontWeight: 600 }}>{p.subjectName}</td>
                    <td data-label="Project Name" style={{ fontSize: '13px', color: 'var(--text-heading)' }}>{p.projectName}</td>
                    <td data-label="Group Name" style={{ fontWeight: 700, color: 'var(--rit-orange-red)' }}>{p.groupName}</td>
                    <td data-label="Total Projects">{p.numProjects} Project</td>
                    <td data-label="Students Enrolled">{p.numGroupsGuiding} Students</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
};
