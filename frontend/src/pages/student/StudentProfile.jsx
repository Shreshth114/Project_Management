import React, { useState, useEffect } from 'react';
import { User, Plus, CheckCircle, FolderPlus, BookOpen, Mail, Phone, Shield, Award, Edit, UserCheck } from 'lucide-react';
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

  // Projects list state (stored in local component state)
  const [extraProjects, setExtraProjects] = useState([]);

  // Sync projects with loaded team data from database
  useEffect(() => {
    if (team) {
      setExtraProjects([
        {
          id: team.team_id || 'proj-1',
          title: activeTitle,
          groupName: activeGroupCode,
          subject: activeTitle,
          subjectCode: activeSubjectCode,
          guide: activeGuide,
          coordinator: activeCoordinator,
          status: 'Active'
        }
      ]);
    } else {
      setExtraProjects([]);
    }
  }, [team, activeGuide, activeCoordinator, activeTitle, activeSubjectCode, activeGroupCode]);

  // Form states for adding another project
  const [newTitle, setNewTitle] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newSubject, setNewSubject] = useState('Technical Seminar & Paper');
  const [newSubjectCode, setNewSubjectCode] = useState('21CSS82');
  const [newGuide, setNewGuide] = useState('Faculty Guide');

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

  if (loading) return <div>Loading profile...</div>;

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

      {currentUser && (
        <>
          <div className="grid-3">
            <Card title="Student Credentials">
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#243143',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '24px',
                  margin: '0 auto 12px'
                }}>
                  {currentUser.name?.charAt(0) || 'S'}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#243143' }}>{currentUser.name || 'Student'}</h2>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#B82226', margin: '4px 0' }}>
                  USN: {currentUser.usn || currentUser.student_id || 'N/A'}
                </div>
                <Badge variant="navy">{currentUser.batch || 'Current Academic Year'}</Badge>
              </div>
            </Card>

            <Card title="System Managed Enrolment">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div><strong>Subject Code:</strong> {activeSubjectCode}</div>
                <div><strong>Academic Batch:</strong> {currentUser.batch || 'Current Academic Year'}</div>
                
                <div>
                  <strong>Allocated Guide:</strong>{' '}
                  <span style={{ color: '#3A1F6F', fontWeight: 700 }}>{activeGuide}</span>
                </div>


                <div><strong>Assigned Coordinator:</strong> <span style={{ color: '#B8115B', fontWeight: 700 }}>{activeCoordinator}</span></div>
                <div><strong>Group Association:</strong> {activeGroupCode}</div>
                <div><strong>Leader Status:</strong> {team ? 'Group Member' : 'Not Enrolled'}</div>
              </div>
            </Card>

            <Card title="Project Group Overview">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div><strong>Group Title:</strong> {activeTitle}</div>
                <div><strong>Domain:</strong> {team?.domain || 'Computer Science & Engineering'}</div>
                <div><strong>Submission Mode:</strong> <Badge variant="navy">Digital</Badge></div>
                <div><strong>Overall Status:</strong> <Badge variant={team ? 'success' : 'secondary'}>{team ? 'Active' : 'Pending Allocation'}</Badge></div>
              </div>
            </Card>
          </div>

          <Card title="Contact & Institutional Credentials">
            <div className="grid-2">
              <div>
                <label className="form-label">Official College Email</label>
                <input type="text" className="form-input" value={currentUser.email || ''} disabled />
              </div>
              <div>
                <label className="form-label">Registered Contact Phone</label>
                <input type="text" className="form-input" value={currentUser.phone || 'Not Provided'} disabled />
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Box 1: Current Working Projects */}
      <Card title="Current Registered Academic Projects">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {extraProjects.length > 0 ? (
            extraProjects.map((p) => (
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
                  <div><strong>Allocated Guide:</strong> <span style={{ color: '#3A1F6F', fontWeight: 700 }}>{p.guide}</span></div>
                  <div><strong>Assigned Coordinator:</strong> <span style={{ color: '#B8115B', fontWeight: 700 }}>{p.coordinator || activeCoordinator}</span></div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: '#8A9198', fontSize: '14px' }}>
              No academic project teams currently registered in the database for this student account.
            </div>
          )}
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
                placeholder="e.g. Group G05"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Subject Full Name</label>
              <input
                type="text"
                className="form-input"
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
                {subjectsList.map(s => (
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
                value={newGuide}
                onChange={(e) => setNewGuide(e.target.value)}
              >
                {facultyList.length > 0 ? (
                  facultyList.map(g => (
                    <option key={g.faculty_id || g.id} value={g.name}>{g.name}</option>
                  ))
                ) : (
                  <option value="Faculty Guide">Faculty Guide</option>
                )}
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
