<<<<<<< HEAD
import React, { useState } from 'react';
import { BarChart2, AlertCircle, CheckCircle, Clock, Eye, X, Users, FolderCheck } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { BarChart2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
>>>>>>> origin/main
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { evaluationService } from '../../services/evaluationService';

export const CoordinatorStatus = () => {
<<<<<<< HEAD
  const { data } = useAuth();
  const [inspectingGroupStatus, setInspectingGroupStatus] = useState(null);
=======
  const [teams, setTeams] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTeams, fetchedEvals] = await Promise.all([
        academicService.getTeams(),
        evaluationService.getAllEvaluations()
      ]);
      setTeams(fetchedTeams || []);
      setEvaluations(fetchedEvals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading compliance matrix...</div>;
>>>>>>> origin/main

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Coordinator Department Compliance Matrix</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Tracking Group Submissions, Member Component Assignments, and Faculty Evaluations.
        </p>
      </div>

      <div className="grid-4">
        <Card title="Pending Submissions">
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#2B7094' }}>2 Groups</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Status: Pending Review</div>
        </Card>
        <Card title="In Progress">
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#DA8B3E' }}>8 Groups</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Status: Active Uploads</div>
        </Card>
        <Card title="Completed / Submitted">
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#728C5E' }}>26 Groups</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Status: All Uploads Done</div>
        </Card>
        <Card title="Overdue Items">
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#B61F34' }}>0 Overdue</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Status: On Schedule</div>
        </Card>
      </div>

      <Card title="All Department Groups Workflow Matrix (Click Row to View All Members Status)">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Batch Code</th>
                <th>Project Title</th>
                <th>Submission Mode</th>
                <th>Group Components Status</th>
                <th>Individual Student Evaluations</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((g) => {
                const totalMembers = g.members?.length || 0;
                // Count unique students evaluated in this team
                const teamEvals = evaluations.filter(e => e.submission?.team_id === g.team_id);
                const evaluatedStudents = new Set(teamEvals.map(e => e.student_id)).size;
                const isAllEvaluated = evaluatedStudents === totalMembers && totalMembers > 0;
                const progress = totalMembers > 0 ? Math.round((evaluatedStudents / totalMembers) * 100) : 0;

                return (
<<<<<<< HEAD
                  <tr key={g.id}>
                    <td data-label="Batch Code" style={{ fontWeight: 800, color: '#DE3B0B' }}>{g.groupCode}</td>
                    <td data-label="Project Title" style={{ fontSize: '13px', fontWeight: 600, color: '#3A1F6F' }}>{g.title}</td>
                    <td data-label="Mode">
                      <Badge variant="purple">
                        {g.submissionMode === 'LEADER_SUBMITS_ALL' ? 'Mode A (Group)' : 'Mode B (Distributed)'}
                      </Badge>
                    </td>
=======
                  <tr key={g.team_id}>
                    <td data-label="Batch Code" style={{ fontWeight: 700, color: '#243143' }}>{g.team_code}</td>
                    <td data-label="Project Title" style={{ fontSize: '13px' }}>{g.subject?.subject_name}</td>
                    <td data-label="Mode"><Badge variant="navy">Digital</Badge></td>
>>>>>>> origin/main
                    <td data-label="Components Status">
                      <Badge variant="success">✓ Submitted</Badge>
                    </td>
                    <td data-label="Evaluations">
                      <Badge variant={isAllEvaluated ? 'success' : 'warning'}>
                        {evaluatedStudents} / {totalMembers} Members Evaluated
                      </Badge>
                    </td>
<<<<<<< HEAD
                    <td data-label="Action">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setInspectingGroupStatus(g)}
                        title="View member-by-member submission and review status"
                      >
                        <Eye size={13} />
                        <span>Inspect Members</span>
                      </button>
=======
                    <td data-label="Health Status">
                      <Badge variant={progress >= 80 ? 'success' : 'warning'}>
                        {progress}% Complete
                      </Badge>
>>>>>>> origin/main
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Member Status Inspection Modal */}
      {inspectingGroupStatus && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} />
                <span>Group Members Submission & Review Status ({inspectingGroupStatus.groupCode})</span>
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
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                  {inspectingGroupStatus.title}
                </h4>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                  Guide: <strong>{inspectingGroupStatus.guide}</strong> | Mode: <strong>{inspectingGroupStatus.submissionMode === 'LEADER_SUBMITS_ALL' ? 'Mode A (Group Mode)' : 'Mode B (Individual Mode)'}</strong>
                </div>
              </div>

              <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '8px' }}>
                Member-by-Member Compliance & Review Roster:
              </h5>

              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Student Name</th>
                      <th>Submission Status</th>
                      <th>Faculty Evaluation Status</th>
                      <th>Marks Awarded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectingGroupStatus.members.map(m => {
                      const evalRec = data.groupEvaluations.find(e => e.groupId === inspectingGroupStatus.id && e.studentUsn === m.usn);

                      return (
                        <tr key={m.usn}>
                          <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                          <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
                          <td data-label="Submission Status">
                            <Badge variant="success">✓ Submitted</Badge>
                          </td>
                          <td data-label="Faculty Evaluation">
                            <Badge variant={evalRec ? 'success' : 'warning'}>
                              {evalRec ? '✓ Evaluated' : '○ Under Review'}
                            </Badge>
                          </td>
                          <td data-label="Marks Awarded" style={{ fontWeight: 800, color: '#3A1F6F' }}>
                            {evalRec ? `${evalRec.totalScore} / 50` : 'Pending'}
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
                Close Member Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
