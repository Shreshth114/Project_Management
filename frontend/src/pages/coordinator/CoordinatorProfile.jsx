import React, { useState } from 'react';
import { User, Plus, CheckCircle, RefreshCw, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const CoordinatorProfile = () => {
  const { data, currentUser, switchTeacherRole } = useAuth();

  // Guided coordinator projects list state
  const [coordinatorProjects, setCoordinatorProjects] = useState([
    {
      id: 'cp-1',
      subjectName: 'Major Project Phase - II',
      subjectCode: '21CSP81',
      projectName: 'Smart Campus Management System & Edge AI Cardiac Detection',
      groupName: 'Group G01',
      numProjects: 12,
      numGroupsGuiding: 4
    }
  ]);

  // Separate inputs for Subject Name and Subject Code
  const [newSubjectName, setNewSubjectName] = useState('Technical Seminar & Paper');
  const [newSubjectCode, setNewSubjectCode] = useState('21CSS82');
  const [newGroupName, setNewGroupName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddCoordinatorProject = (e) => {
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

    setCoordinatorProjects([...coordinatorProjects, newProj]);
    setNewGroupName('');
    setNewProjectName('');
    setSuccess(`Coordinator Project Allocation for "${newSubjectCode} - ${newSubjectName}" added successfully!`);
    setTimeout(() => setSuccess(''), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Subject Coordinator Profile & Portfolio</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Coordinator credentials, subject allocations, and guided project groups.
          </p>
        </div>

        {/* Switch View to Faculty Workspace button */}
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
            backgroundColor: '#B8115B',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '24px'
          }}>
            {currentUser?.name?.charAt(0) || 'C'}
          </div>

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
              {currentUser?.name || 'Prof. V. Kulkarni'}
            </h2>
            <div style={{ fontSize: '13px', color: '#55636B', marginTop: '2px' }}>
              Email: <strong>{currentUser?.email}</strong> | Department: <strong>{currentUser?.department || 'CSE'}</strong>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Badge variant="magenta">Subject Coordinator</Badge>
              <Badge variant="purple">Faculty Member</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Coordinated Subjects Overview */}
      <Card title="Coordinated Subjects & Guided Batches Overview">
        <div className="table-container responsive-table-stack" style={{ marginBottom: '16px' }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Project Name</th>
                <th>Group Name</th>
                <th>Total Projects</th>
                <th>Groups Guiding</th>
              </tr>
            </thead>
            <tbody>
              {coordinatorProjects.map((p) => (
                <tr key={p.id}>
                  <td data-label="Subject Code" style={{ fontWeight: 800, color: '#DE3B0B' }}>{p.subjectCode}</td>
                  <td data-label="Subject Name" style={{ fontWeight: 600 }}>{p.subjectName}</td>
                  <td data-label="Project Name" style={{ fontSize: '13px', color: '#3A1F6F' }}>{p.projectName}</td>
                  <td data-label="Group Name" style={{ fontWeight: 700, color: '#DE3B0B' }}>{p.groupName}</td>
                  <td data-label="Total Projects">{p.numProjects} Projects</td>
                  <td data-label="Groups Guiding">{p.numGroupsGuiding} Groups</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Separate inputs for Subject Name and Subject Code */}
      <Card title="Add Coordinator Project Allocation">
        <form onSubmit={handleAddCoordinatorProject}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject Name Option</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Major Project Phase - II"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject Code Option</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 21CSP81"
                value={newSubjectCode}
                onChange={(e) => setNewSubjectCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Group Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Group G01 or Team Gamma"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Edge AI Cardiac Vision Detection System"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
            <Plus size={16} />
            <span>ADD COORDINATOR PROJECT ALLOCATION</span>
          </button>
        </form>
      </Card>
    </div>
  );
};
