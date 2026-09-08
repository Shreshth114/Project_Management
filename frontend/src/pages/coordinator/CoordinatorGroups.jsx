import React, { useState, useEffect } from 'react';
import { Search, Users, ExternalLink, UserCheck, Eye, X, CheckSquare, FolderCheck, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { taskService } from '../../services/taskService';
import { submissionService } from '../../services/submissionService';
import { evaluationService } from '../../services/evaluationService';

export const CoordinatorGroups = () => {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [inspectingGroup, setInspectingGroup] = useState(null);
  const [inspectingSubmissions, setInspectingSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTeams, fetchedTasks] = await Promise.all([
        academicService.getTeams().catch(() => []),
        taskService.getTasks().catch(() => [])
      ]);

      setTasks(fetchedTasks || []);

      const enrichedGroups = [];
      for (const t of fetchedTeams || []) {
        const subs = await submissionService.getSubmissionsByTeam(t.team_id).catch(() => []);
        const totalT = (fetchedTasks || []).length;
        const progress = totalT > 0 ? Math.min(100, Math.round(((subs?.length || 0) / totalT) * 100)) : 0;

        enrichedGroups.push({
          id: t.team_id,
          groupCode: t.team_code,
          title: t.subject?.subject_name || 'Academic Project',
          subjectName: t.subject?.subject_name || 'Course Project',
          subjectCode: t.subject?.subject_code || 'N/A',
          coordinator: currentUser?.name || 'Assigned Coordinator',
          guide: t.guide?.name || 'Faculty Guide',
          members: t.members || [],
          repoUrl: t.repo_url,
          overallProgress: progress,
          submissions: subs || []
        });
      }

      setGroupsList(enrichedGroups);
    } catch (err) {
      console.warn("Coordinator groups error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (group) => {
    setInspectingGroup(group);
    try {
      const subs = await submissionService.getSubmissionsByTeam(group.id).catch(() => []);
      setInspectingSubmissions(subs || []);
    } catch (err) {
      setInspectingSubmissions(group.submissions || []);
    }
  };

  const filteredGroups = groupsList.filter(g => 
    g.groupCode.toLowerCase().includes(search.toLowerCase()) ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    (g.guide && g.guide.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div style={{ padding: '24px', color: '#55636B' }}>Loading Department Project Groups...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Guided Groups & Project Progress</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Comprehensive directory of registered project groups and allocated faculty guides under coordination.
          </p>
        </div>

        <div style={{ width: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search group code, title, guide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <Card key={group.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Badge variant="purple">{group.groupCode}</Badge>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                      {group.title}
                    </h3>
                  </div>

                  <div className="grid-3" style={{ fontSize: '13px', color: '#55636B', marginBottom: '12px' }}>
                    <div>Subject: <strong>{group.subjectName} ({group.subjectCode})</strong></div>
                    <div>Allocated Guide: <strong style={{ color: '#3A1F6F' }}>{group.guide}</strong></div>
                    <div>Enrolled Members: <strong>{group.members.length} Students</strong></div>
                  </div>

                  {/* Progress Metric */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, backgroundColor: '#E5E5E5', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${group.overallProgress}%`, backgroundColor: group.overallProgress === 100 ? '#728C5E' : '#3A1F6F', height: '100%' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#3A1F6F' }}>
                      {group.overallProgress}% Submissions Complete
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleInspect(group)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={14} />
                  <span>Inspect Milestones</span>
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#8A9198' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#3A1F6F', marginBottom: '8px' }}>
                No Groups Registered
              </h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                No student project groups have been created in the database yet.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Modal: Real Milestones & Submissions */}
      {inspectingGroup && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderCheck size={18} />
                <span>Group Progress Inspection ({inspectingGroup.groupCode})</span>
              </h3>
              <button 
                onClick={() => setInspectingGroup(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #E5E5E5', paddingBottom: '12px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                  {inspectingGroup.title}
                </h4>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                  Guide: <strong>{inspectingGroup.guide}</strong> | Progress: <strong>{inspectingGroup.overallProgress}%</strong>
                </div>
              </div>

              <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '8px' }}>
                Milestones & Team Submissions:
              </h5>

              <div className="table-container responsive-table-stack" style={{ marginBottom: '20px' }}>
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Milestone</th>
                      <th>Upload Status</th>
                      <th>Submitted File / Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length > 0 ? (
                      tasks.map(t => {
                        const sub = inspectingSubmissions.find(s => s.task_id === t.task_id);
                        const isDone = Boolean(sub);

                        return (
                          <tr key={t.task_id}>
                            <td data-label="Milestone" style={{ fontWeight: 700, color: '#3A1F6F' }}>{t.title}</td>
                            <td data-label="Status">
                              <Badge variant={isDone ? 'success' : 'warning'}>
                                {isDone ? '✓ Uploaded' : '○ Pending'}
                              </Badge>
                            </td>
                            <td data-label="File/Link" style={{ fontSize: '12px' }}>
                              {isDone ? (
                                sub.file_url && sub.file_url !== '#' ? (
                                  <button 
                                    type="button"
                                    onClick={() => submissionService.openSubmissionFile(sub.file_url, sub.file_name)}
                                    style={{ 
                                      background: 'none', 
                                      border: 'none', 
                                      color: '#DE3B0B', 
                                      fontWeight: 600, 
                                      cursor: 'pointer',
                                      padding: 0,
                                      font: 'inherit',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    {sub.file_name || 'View Deliverable'}
                                  </button>
                                ) : (
                                  <span style={{ color: '#3A1F6F', fontWeight: 600 }}>{sub.file_name || 'Attached File'}</span>
                                )
                              ) : (
                                <span style={{ color: '#8A9198' }}>Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: '#8A9198' }}>No milestones published.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '8px' }}>
                Enrolled Team Members:
              </h5>

              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Student Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectingGroup.members.length > 0 ? (
                      inspectingGroup.members.map((m, idx) => (
                        <tr key={m.student_id || m.usn || idx}>
                          <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                          <td data-label="Name" style={{ fontWeight: 600 }}>{m.name}</td>
                          <td data-label="Email">{m.email || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: '#8A9198' }}>No members enrolled.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setInspectingGroup(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
