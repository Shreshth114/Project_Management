import React, { useState } from 'react';
import { User, Plus, CheckCircle, FolderPlus, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const StudentProfile = () => {
  const { data, currentUser } = useAuth();
  
  const studentGroup = (data.groups || []).find(g => g.id === currentUser?.groupId) || data.groups[0];

  // Projects list state (stored in local component state)
  const [extraProjects, setExtraProjects] = useState([
    {
      id: 'proj-1',
      title: studentGroup.title,
      groupName: studentGroup.groupCode,
      subject: 'Major Project Phase - II',
      subjectCode: studentGroup.subject || '21CSP81',
      guide: studentGroup.guide,
      status: 'Active'
    }
  ]);

  // Form states for adding another project
  const [newTitle, setNewTitle] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newSubject, setNewSubject] = useState('Technical Seminar & Paper');
  const [newSubjectCode, setNewSubjectCode] = useState('21CSS82');
  const [newGuide, setNewGuide] = useState('Dr. Anita M.');
  const [success, setSuccess] = useState('');

  const handleAddProject = (e) => {
    e.preventDefault();
    const proj = {
      id: `proj-${Date.now()}`,
      title: newTitle || `${newSubject} Project`,
      groupName: newGroupName || 'Group G05',
      subject: newSubject,
      subjectCode: newSubjectCode,
      guide: newGuide,
      status: 'Enrolled'
    };

    setExtraProjects([...extraProjects, proj]);
    setNewTitle('');
    setNewGroupName('');
    setSuccess(`New project for ${newSubjectCode} added successfully!`);
    setTimeout(() => setSuccess(''), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Student Profile & Project Enrolments</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Overview of registered academic projects and additional course enrolments.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Box 1: Current Working Projects */}
      <Card title="Current Registered Academic Projects">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {extraProjects.map((p) => (
            <div 
              key={p.id}
              style={{
                border: '1px solid #E5E5E5',
                borderRadius: '6px',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                borderLeft: '5px solid #3A1F6F'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                  {p.title}
                </h3>
                <Badge variant="purple">{p.status}</Badge>
              </div>

              <div className="grid-4" style={{ fontSize: '13px', color: '#55636B' }}>
                <div><strong>Group Name:</strong> <span style={{ color: '#DE3B0B', fontWeight: 700 }}>{p.groupName}</span></div>
                <div><strong>Subject:</strong> {p.subject}</div>
                <div><strong>Subject Code:</strong> {p.subjectCode}</div>
                <div><strong>Guide:</strong> {p.guide}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Box 2: Interactive Add Another Project Box */}
      <Card title="Add Another Project / Course Enrolment">
        <form onSubmit={handleAddProject}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Distributed Ledger Micro-payments"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Group Name / Team Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Group G05 or Team Beta"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Subject Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Technical Seminar & Paper"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <select
                className="form-select"
                value={newSubjectCode}
                onChange={(e) => setNewSubjectCode(e.target.value)}
              >
                {data.subjects.map(s => (
                  <option key={s.id} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Allocated Faculty Guide</label>
              <select
                className="form-select"
                value={newGuide}
                onChange={(e) => setNewGuide(e.target.value)}
              >
                {data.facultyGuides.map(g => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
            <Plus size={16} />
            <span>ADD PROJECT ENROLMENT</span>
          </button>
        </form>
      </Card>
    </div>
  );
};
