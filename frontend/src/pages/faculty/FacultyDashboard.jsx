import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { submissionService } from '../../services/submissionService';
import { taskService } from '../../services/taskService';
import { evaluationService } from '../../services/evaluationService';

export const FacultyDashboard = () => {
  const { currentUser, setActiveTab } = useAuth();
  
  const [myGroups, setMyGroups] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [evaluatedCount, setEvaluatedCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      loadFacultyData(currentUser.faculty_id);
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadFacultyData = async (facultyId) => {
    try {
      setLoading(true);
      const [teams, allTasks, allEvals] = await Promise.all([
        academicService.getTeams({ guide_id: facultyId }).catch(() => []),
        taskService.getTasks().catch(() => []),
        evaluationService.getAllEvaluations().catch(() => [])
      ]);

      setMyGroups(teams || []);
      setTasksCount(allTasks?.length || 0);

      const allSubmissions = [];
      if (teams && teams.length > 0) {
        for (const team of teams) {
          const teamSubs = await submissionService.getSubmissionsByTeam(team.team_id).catch(() => []);
          if (teamSubs) {
            teamSubs.forEach(sub => {
              allSubmissions.push({
                id: sub.submission_id,
                groupCode: team.team_code,
                taskTitle: allTasks.find(t => t.task_id === sub.task_id)?.title || `Milestone ${sub.task_id}`,
                fileName: sub.file_name,
                fileSize: sub.file_type,
                submittedAt: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recently'
              });
            });
          }
        }
      }
      setPendingSubmissions(allSubmissions);

      // Count evaluations belonging to this faculty's teams
      const teamIds = new Set((teams || []).map(t => t.team_id));
      const relevantEvals = (allEvals || []).filter(e => teamIds.has(e.submission?.team_id));
      setEvaluatedCount(relevantEvals.length);

    } catch (err) {
      console.error("Faculty dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalAdvisedStudents = myGroups.reduce((acc, g) => acc + (g.members?.length || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#243143',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '6px',
        borderLeft: '6px solid #B82226'
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          Faculty Advisor Workspace — {currentUser?.name || 'Faculty Member'}
        </h1>
        <p style={{ fontSize: '13px', color: '#D1D5DB', marginTop: '4px' }}>
          Department of Computer Science & Engineering | Academic Year 2025–2026
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        <Card title="Assigned Groups">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#243143' }}>{myGroups.length} Batches</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Advised Students: {totalAdvisedStudents}</div>
        </Card>

        <Card title="Uploaded Deliverables">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#A68E24' }}>{pendingSubmissions.length} Items</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Team uploads recorded</div>
        </Card>

        <Card title="Evaluations Completed">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#038203' }}>{evaluatedCount} Records</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Rubric marks stored in database</div>
        </Card>

        <Card title="Published Milestones">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#114C94' }}>{tasksCount} Tasks</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Department curriculum tasks</div>
        </Card>
      </div>

      {/* Submissions Needing Action & Group Roster */}
      <div className="grid-2">
        <Card 
          title="Deliverables Awaiting Review" 
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('evaluation')}>
              Go to Mark Rubrics
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingSubmissions.length > 0 ? (
              pendingSubmissions.slice(0, 4).map((sub) => (
                <div 
                  key={sub.id}
                  style={{
                    border: '1px solid #E5E5E5',
                    borderRadius: '4px',
                    padding: '14px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#243143', fontSize: '14px' }}>
                      {sub.groupCode} - {sub.taskTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      File: {sub.fileName} ({sub.fileSize}) | Submitted: {sub.submittedAt}
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab('evaluation')}
                  >
                    Evaluate
                  </button>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: '#8A9198', padding: '16px 0', textAlign: 'center' }}>
                No deliverables currently awaiting evaluation.
              </div>
            )}
          </div>
        </Card>

        <Card title="Assigned Project Groups Roster">
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Group Code</th>
                  <th>Subject</th>
                  <th>Members Count</th>
                </tr>
              </thead>
              <tbody>
                {myGroups.length > 0 ? (
                  myGroups.map((g) => (
                    <tr key={g.team_id}>
                      <td style={{ fontWeight: 700, color: '#243143' }}>{g.team_code}</td>
                      <td>{g.subject?.subject_name || g.subject?.subject_code || 'Project'}</td>
                      <td><Badge variant="purple">{g.members?.length || 0} Students</Badge></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#8A9198', padding: '16px' }}>
                      No project groups have been allocated to you yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
