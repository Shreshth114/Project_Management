import React, { useState, useEffect } from 'react';
import { Search, Users, ExternalLink, UserCheck, Eye, X, CheckSquare, FolderCheck, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const CoordinatorGroups = () => {
  const { data, currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [inspectingGroup, setInspectingGroup] = useState(null);
  const [backendGroups, setBackendGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const groupEvaluations = data?.groupEvaluations || [];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const teams = await academicService.getTeams();
      setBackendGroups(teams || []);
    } catch (err) {
      console.warn("Backend teams fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  // Merge backend groups with fallback context data
  const allGroups = (backendGroups.length > 0 ? backendGroups : (data?.groups || [])).map(g => ({
    id: g.team_id || g.id,
    groupCode: g.team_code || g.groupCode || 'Group G01',
    title: g.subject?.subject_name || g.title || 'Project Work',
    subjectName: g.subject?.subject_name || g.subjectName || g.domain || 'CSE Project',
    subjectCode: g.subject?.subject_code || g.subjectCode || '21CSP81',
    coordinator: g.coordinator || g.guide?.name || g.guide || 'Prof. V. Kulkarni',
    guide: g.guide?.name || g.guide || 'Faculty Guide',
    members: g.members || [],
    submissionMode: g.submissionMode || 'LEADER_SUBMITS_ALL',
    overallProgress: g.overallProgress || 80,
    components: g.components || {
      synopsis: { title: '1. Project Synopsis & Scope', status: 'COMPLETED', fileName: 'Synopsis.pdf', submittedAt: '2025-08-12' },
      srsDocument: { title: '2. SRS Specification', status: 'COMPLETED', fileName: 'SRS_Doc.pdf', submittedAt: '2025-08-28' },
      designDoc: { title: '3. Architectural Design', status: 'COMPLETED', fileName: 'Design_Doc.pdf', submittedAt: '2025-09-15' },
      finalReport: { title: '4. Final Project Report', status: 'PENDING' },
      deploymentLink: { title: '5. Live Application Endpoint', status: 'COMPLETED', url: 'https://major-project-2025.msrit.edu', submittedAt: '2025-10-05' }
    }
  }));

  const filteredGroups = allGroups.filter(g => 
    g.groupCode.toLowerCase().includes(search.toLowerCase()) ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    (g.coordinator && g.coordinator.toLowerCase().includes(search.toLowerCase())) ||
    (g.guide && g.guide.toLowerCase().includes(search.toLowerCase()))
  );

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
            placeholder="Search group code, title, or guide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card title="Coordinated Project Batches Directory">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Project Title & Subject</th>
                <th>Subject Coordinator / Guide</th>
                <th>Team Members</th>
                <th>Submission Mode</th>
                <th>Overall Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((g) => (
                <tr key={g.id}>
                  <td data-label="Code" style={{ fontWeight: 800, color: '#DE3B0B' }}>{g.groupCode}</td>
                  <td data-label="Title & Subject">
                    <div style={{ fontWeight: 700, color: '#3A1F6F' }}>{g.title}</div>
                    <div style={{ fontSize: '12px', color: '#55636B' }}>Subject: {g.subjectName}</div>
                  </td>
                  <td data-label="Coordinator" style={{ fontWeight: 600 }}>{g.coordinator}</td>
                  <td data-label="Members">
                    {g.members.length > 0 ? (
                      <span style={{ fontWeight: 600, color: '#3A1F6F' }}>{g.members.length} Students</span>
                    ) : (
                      <span style={{ color: '#888' }}>Unassigned</span>
                    )}
                  </td>
                  <td data-label="Mode">
                    <Badge variant="purple">
                      {g.submissionMode === 'LEADER_SUBMITS_ALL' ? 'Mode A (Group)' : 'Mode B (Distributed)'}
                    </Badge>
                  </td>
                  <td data-label="Progress">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-container" style={{ width: '80px' }}>
                        <div className="progress-bar" style={{ width: `${g.overallProgress}%` }}></div>
                      </div>
                      <strong style={{ fontSize: '13px', color: '#3A1F6F' }}>{g.overallProgress}%</strong>
                    </div>
                  </td>
                  <td data-label="Action">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setInspectingGroup(g)}
                      title="View submitted files, faculty grading status, and student marks"
                    >
                      <Eye size={13} />
                      <span>Inspect Progress</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#8A9198' }}>
                    No project groups matching your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Coordinator Group Progress Inspection Modal */}
      {inspectingGroup && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderCheck size={18} />
                <span>Group Progress & Deliverables Inspection ({inspectingGroup.groupCode})</span>
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
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                  {inspectingGroup.title}
                </h4>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                  Subject: <strong>{inspectingGroup.subjectName}</strong> | Coordinator / Guide: <strong>{inspectingGroup.coordinator}</strong>
                </div>
              </div>

              {/* 1. Submitted Deliverables */}
              <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '8px' }}>
                1. Submitted Deliverables & Artifacts Status:
              </h5>

              <div className="table-container responsive-table-stack" style={{ marginBottom: '20px' }}>
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Deliverable Component</th>
                      <th>Upload Status</th>
                      <th>Submitted File / Link</th>
                      <th>Upload Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectingGroup.components && Object.keys(inspectingGroup.components).map(compKey => {
                      const comp = inspectingGroup.components[compKey];
                      const isDone = comp.status === 'COMPLETED';

                      return (
                        <tr key={compKey}>
                          <td data-label="Component" style={{ fontWeight: 700, color: '#3A1F6F' }}>{comp.title}</td>
                          <td data-label="Status">
                            <Badge variant={isDone ? 'success' : 'warning'}>
                              {isDone ? '✓ Uploaded' : '○ Pending'}
                            </Badge>
                          </td>
                          <td data-label="File/Link" style={{ fontSize: '12px', color: '#DE3B0B', fontWeight: 600 }}>
                            {isDone ? (comp.fileName || comp.url) : 'Pending Upload'}
                          </td>
                          <td data-label="Date" style={{ fontSize: '12px', color: '#55636B' }}>
                            {comp.submittedAt || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 2. Faculty Evaluation Status */}
              <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '8px' }}>
                2. Faculty Evaluation Status & Individual Student Marks:
              </h5>

              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Student Name</th>
                      <th>Faculty Evaluator Review</th>
                      <th>Individual Score</th>
                      <th>Evaluation Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectingGroup.members.map(m => {
                      const evalRec = groupEvaluations.find(e => (e.groupId === inspectingGroup.id || e.groupId === inspectingGroup.groupCode) && e.studentUsn === m.usn);

                      return (
                        <tr key={m.usn}>
                          <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                          <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
                          <td data-label="Review" style={{ fontSize: '12px', color: '#55636B' }}>
                            {evalRec ? evalRec.feedback : 'Under faculty evaluation'}
                          </td>
                          <td data-label="Score" style={{ fontWeight: 800, color: '#3A1F6F' }}>
                            {evalRec ? `${evalRec.totalScore} / 50` : 'Pending'}
                          </td>
                          <td data-label="Status">
                            <Badge variant={evalRec ? 'success' : 'warning'}>
                              {evalRec ? '✓ Evaluated' : '○ Pending Review'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setInspectingGroup(null)}>
                Close Group Inspection View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
