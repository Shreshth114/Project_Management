import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  UserCheck, 
  Upload, 
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { academicService } from '../../services/academicService';
import { taskService } from '../../services/taskService';
import { submissionService } from '../../services/submissionService';

export const StudentDashboard = () => {
  const { currentUser, setActiveTab } = useAuth();
  
  const [studentGroup, setStudentGroup] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.student_id) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [teamData, tasksData] = await Promise.all([
        academicService.getTeamByStudent(currentUser.student_id).catch(() => null),
        taskService.getTasks().catch(() => [])
      ]);

      setStudentGroup(teamData);
      setPendingTasks(tasksData || []);

      if (teamData?.team_id) {
        const subs = await submissionService.getSubmissionsByTeam(teamData.team_id).catch(() => []);
        setSubmissions(subs || []);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div style={{ padding: '24px', color: '#55636B' }}>Loading Dashboard...</div>;
  }
  
  const currentGroup = studentGroup;
  const hasTeam = Boolean(currentGroup);

  const groupCode = currentGroup?.team_code || 'Not Enrolled';
  const title = currentGroup?.subject?.subject_name || (hasTeam ? 'Academic Project' : 'No Enrolled Project');
  const subjectCode = currentGroup?.subject?.subject_code || 'N/A';
  const guideName = currentGroup?.guide?.name || 'Not Assigned';
  const coordinatorName = currentGroup?.coordinator || 'Not Assigned';
  const members = currentGroup?.members || [];

  const totalTasks = pendingTasks.length;
  const submittedCount = submissions.length;
  const progressPercent = totalTasks > 0 ? Math.min(100, Math.round((submittedCount / totalTasks) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Box */}
      <div style={{
        backgroundColor: '#3A1F6F',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '6px',
        borderLeft: '6px solid #DE3B0B',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#E0D6F5', fontWeight: 700, textTransform: 'uppercase' }}>
              Academic Year 2025–2026 | Course Code: {subjectCode}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
              {title}
            </h1>
            <div style={{ fontSize: '13px', color: '#E0D6F5', marginTop: '4px' }}>
              Group: <strong>{groupCode}</strong> | Guide: <strong>{guideName}</strong> | Coordinator: <strong>{coordinatorName}</strong>
            </div>
          </div>
          {hasTeam && (
            <Badge variant="magenta" style={{ backgroundColor: '#FFFFFF', color: '#9D1B55' }}>Enrolled Project</Badge>
          )}
        </div>
      </div>

      {/* Progress Metric & Guide Overview Cards Grid */}
      <div className="grid-2">
        <Card title="Project Overall Progress">
          <ProgressBar progress={progressPercent} height={12} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '13px' }}>
            <span>Milestones: <strong style={{ color: '#3A1F6F' }}>{submittedCount} / {totalTasks} Submitted</strong></span>
            <span>Progress: <strong style={{ color: progressPercent === 100 ? '#728C5E' : '#DA8B3E' }}>{progressPercent}%</strong></span>
          </div>
        </Card>

        <Card title="Assigned Faculty Guide & Coordinator">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#F2EEFA',
                color: '#3A1F6F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                <UserCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Faculty Project Guide</div>
                <div style={{ fontWeight: 700, color: '#3A1F6F', fontSize: '14px' }}>{guideName}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '10px', borderTop: '1px solid #F0F0F0' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#FDF2F4',
                color: '#B8115B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                <UserCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Subject Coordinator</div>
                <div style={{ fontWeight: 700, color: '#B8115B', fontSize: '14px' }}>{coordinatorName}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Tasks & Submissions Dual Section */}
      <div className="grid-2">
        {/* Active Coordinator Tasks */}
        <Card 
          title="Active Milestones & Tasks" 
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab && setActiveTab('submissions')}>
              View All Tasks
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingTasks && pendingTasks.length > 0 ? pendingTasks.slice(0, 3).map((task) => {
              const totalMarks = task.totalMarks || task.maxMarks || 
                task.evaluation_criteria?.reduce((sum, c) => sum + (c.max_marks || 0), 0) || 50;
              const deadlineStr = task.deadline ? (task.deadline.includes('T') ? new Date(task.deadline).toLocaleDateString() : task.deadline) : 'Upcoming';
              return (
                <div 
                  key={task.id || task.task_id} 
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
                    <div style={{ fontWeight: 700, color: '#3A1F6F', fontSize: '14px' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>
                      Deadline: <strong style={{ color: '#DE3B0B' }}>{deadlineStr}</strong> | Total Marks: {totalMarks} Marks
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setActiveTab && setActiveTab('submissions')}
                  >
                    <Upload size={14} />
                    <span>Submit</span>
                  </button>
                </div>
              );
            }) : (
              <p style={{ fontSize: '13px', color: '#8A9198' }}>No active tasks found.</p>
            )}
          </div>
        </Card>

        {/* Team Members List */}
        <Card title={`Project Team Members (${groupCode})`}>
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>USN</th>
                  <th>Student Name</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? (
                  members.map((m, idx) => (
                    <tr key={m.student_id || m.usn || idx}>
                      <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                      <td style={{ fontWeight: 600, color: '#3A1F6F' }}>{m.name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', color: '#8A9198', padding: '16px' }}>
                      No team members assigned yet.
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
