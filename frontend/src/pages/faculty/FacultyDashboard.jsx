import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { submissionService } from '../../services/submissionService';
import { taskService } from '../../services/taskService';

export const FacultyDashboard = () => {
  const { data, currentUser, setActiveTab } = useAuth();
  
  const [myGroups, setMyGroups] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      academicService.getTeams({ guide_id: currentUser.faculty_id })
        .then(async (teams) => {
          setMyGroups(teams || []);
          
          if (teams && teams.length > 0) {
            const allTasks = await taskService.getTasks();
            const allSubmissions = [];
            for (const team of teams) {
              const teamSubs = await submissionService.getSubmissionsByTeam(team.team_id);
              if (teamSubs) {
                teamSubs.forEach(sub => {
                  allSubmissions.push({
                    id: sub.submission_id,
                    groupCode: team.team_code,
                    taskTitle: allTasks.find(t => t.task_id === sub.task_id)?.title || `Task ${sub.task_id}`,
                    fileName: sub.file_name,
                    fileSize: sub.file_type,
                    submittedAt: new Date(sub.submitted_at).toLocaleDateString()
                  });
                });
              }
            }
            setPendingSubmissions(allSubmissions);
          }
        })
        .catch(console.error);
    }
  }, [currentUser]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#243143',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '4px',
        borderLeft: '6px solid #B82226'
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          Faculty Advisor Workspace — {currentUser?.name || 'Dr. R. Sharma'}
        </h1>
        <p style={{ fontSize: '13px', color: '#D1D5DB', marginTop: '4px' }}>
          Department of Computer Science & Engineering | Academic Year 2025–2026
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        <Card title="Assigned Groups">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#243143' }}>{myGroups.length} Batches</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Advised Students: 11</div>
        </Card>

        <Card title="Uploaded Deliverables">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#A68E24' }}>{pendingSubmissions.length} Items</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Ready for rubric evaluation</div>
        </Card>

        <Card title="Evaluated Batches">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#038203' }}>1 / 2 Complete</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Phase I & II evaluations</div>
        </Card>

        <Card title="Upcoming Viva">
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#B82226' }}>This Friday</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Lab 3 & 4 (09:30 AM)</div>
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
              <div style={{ fontSize: '13px', color: '#666', padding: '10px 0' }}>
                No pending deliverables requiring review (Mock).
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
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {myGroups.map((g) => (
                  <tr key={g.team_id}>
                    <td style={{ fontWeight: 700, color: '#243143' }}>{g.team_code}</td>
                    <td style={{ fontSize: '13px' }}>{g.subject?.subject_name}</td>
                    <td><Badge variant="navy">{g.members?.length || 0} Students</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
