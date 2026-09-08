import React, { useState, useEffect } from 'react';
import { BarChart2, AlertCircle, CheckCircle, Clock, Eye, X, Users, FolderCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { evaluationService } from '../../services/evaluationService';
import { submissionService } from '../../services/submissionService';

export const CoordinatorStatus = () => {
  const [inspectingGroupStatus, setInspectingGroupStatus] = useState(null);
  const [teams, setTeams] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [submissionsByTeam, setSubmissionsByTeam] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTeams, fetchedEvals] = await Promise.all([
        academicService.getTeams().catch(() => []),
        evaluationService.getAllEvaluations().catch(() => [])
      ]);

      setTeams(fetchedTeams || []);
      setEvaluations(fetchedEvals || []);

      const subMap = {};
      for (const t of fetchedTeams || []) {
        const subs = await submissionService.getSubmissionsByTeam(t.team_id).catch(() => []);
        subMap[t.team_id] = subs || [];
      }
      setSubmissionsByTeam(subMap);
    } catch (err) {
      console.error("Coordinator status load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '24px', color: '#55636B' }}>Loading Department Compliance Matrix...</div>;

  const totalTeams = teams.length;
  const submittedTeamsCount = teams.filter(t => (submissionsByTeam[t.team_id] || []).length > 0).length;
  const pendingTeamsCount = totalTeams - submittedTeamsCount;
  const totalEvaluationsCount = evaluations.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Coordinator Department Compliance Matrix</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Tracking Group Submissions, Member Component Assignments, and Faculty Evaluations.
        </p>
      </div>

      <div className="grid-4">
        <Card title="Total Project Batches">
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>{totalTeams} Batches</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Enrolled in department</div>
        </Card>

        <Card title="Batches with Uploads">
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#728C5E' }}>{submittedTeamsCount} Batches</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Deliverables recorded</div>
        </Card>

        <Card title="Pending Deliverables">
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#DA8B3E' }}>{pendingTeamsCount} Batches</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Awaiting initial uploads</div>
        </Card>

        <Card title="Rubric Evaluations Stored">
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#114C94' }}>{totalEvaluationsCount} Records</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Evaluations by guides</div>
        </Card>
      </div>

      <Card title="All Department Groups Workflow Matrix">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Batch Code</th>
                <th>Project Title</th>
                <th>Guide</th>
                <th>Deliverables Status</th>
                <th>Evaluations Completed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teams.length > 0 ? (
                teams.map((g) => {
                  const teamSubs = submissionsByTeam[g.team_id] || [];
                  const isSubmitted = teamSubs.length > 0;
                  const totalMembers = g.members?.length || 0;
                  const teamEvals = evaluations.filter(e => e.submission?.team_id === g.team_id);
                  const evaluatedStudents = new Set(teamEvals.map(e => e.student_id)).size;
                  const isAllEvaluated = evaluatedStudents === totalMembers && totalMembers > 0;

                  return (
                    <tr key={g.team_id}>
                      <td data-label="Batch Code" style={{ fontWeight: 800, color: '#DE3B0B' }}>{g.team_code}</td>
                      <td data-label="Project Title" style={{ fontSize: '13px', fontWeight: 600, color: '#3A1F6F' }}>
                        {g.subject?.subject_name || 'Academic Project'}
                      </td>
                      <td data-label="Guide" style={{ fontWeight: 600 }}>
                        {g.guide?.name || 'Unassigned'}
                      </td>
                      <td data-label="Deliverables Status">
                        <Badge variant={isSubmitted ? 'success' : 'warning'}>
                          {isSubmitted ? `✓ ${teamSubs.length} Uploaded` : '○ Pending'}
                        </Badge>
                      </td>
                      <td data-label="Evaluations">
                        <Badge variant={isAllEvaluated ? 'success' : (teamEvals.length > 0 ? 'warning' : 'secondary')}>
                          {evaluatedStudents} / {totalMembers} Evaluated
                        </Badge>
                      </td>
                      <td data-label="Action">
                        <button 
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setInspectingGroupStatus(g)}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#8A9198', padding: '24px' }}>
                    No project teams registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal View */}
      {inspectingGroupStatus && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderCheck size={18} />
                <span>Group Status & Member Roster ({inspectingGroupStatus.team_code})</span>
              </h3>
              <button 
                onClick={() => setInspectingGroupStatus(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #E5E5E5', paddingBottom: '12px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                  {inspectingGroupStatus.subject?.subject_name || 'Academic Project'}
                </h4>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                  Guide: <strong>{inspectingGroupStatus.guide?.name || 'Unassigned'}</strong>
                </div>
              </div>

              <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '8px' }}>
                Member Breakdown:
              </h5>

              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Student Name</th>
                      <th>Evaluation Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(inspectingGroupStatus.members || []).map(m => {
                      const evalRec = evaluations.find(e => e.student_id === m.student_id);
                      return (
                        <tr key={m.student_id || m.usn}>
                          <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                          <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
                          <td data-label="Evaluation Status">
                            <Badge variant={evalRec ? 'success' : 'warning'}>
                              {evalRec ? '✓ Evaluated' : '○ Pending Evaluation'}
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
              <button type="button" className="btn btn-secondary" onClick={() => setInspectingGroupStatus(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
