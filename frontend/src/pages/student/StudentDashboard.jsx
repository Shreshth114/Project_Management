import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  UserCheck, 
  AlertCircle, 
  Upload, 
  ExternalLink,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { academicService } from '../../services/academicService';
import { taskService } from '../../services/taskService';

export const StudentDashboard = () => {
  const { currentUser, setActiveTab } = useAuth();
  
  const [studentGroup, setStudentGroup] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.student_id) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const teamData = await academicService.getTeamByStudent(currentUser.student_id);
      setStudentGroup(teamData);
      
      // Fetch tasks - in a real app, we'd filter by subject_id or team_id
      // For this milestone, we fetch all tasks to demonstrate retrieval
      const tasksData = await taskService.getTasks();
      setPendingTasks(tasksData || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading Dashboard...</div>;
  }
  
  if (!studentGroup) {
    return <div>You are not assigned to a team yet.</div>;
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Box */}
      <div style={{
        backgroundColor: '#243143',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '4px',
        borderLeft: '6px solid #B82226',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9F9F9F', fontWeight: 700, textTransform: 'uppercase' }}>
              Course Code: {studentGroup.subject?.subject_code}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
              {studentGroup.subject?.subject_name}
            </h1>
            <div style={{ fontSize: '13px', color: '#D1D5DB', marginTop: '4px' }}>
              Group Code: <strong>{studentGroup.team_code}</strong>
            </div>
          </div>
          <Badge variant="navy">Major Project</Badge>
        </div>
      </div>

      {/* Progress Metric & Guide Overview Cards Grid */}
      <div className="grid-3">
        <Card title="Project Overall Progress">
          <ProgressBar progress={85} height={12} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '13px' }}>
            <span>Phase 1: <strong style={{ color: '#038203' }}>Approved</strong></span>
            <span>Phase 2: <strong style={{ color: '#A68E24' }}>In Progress</strong></span>
          </div>
        </Card>

        <Card title="Assigned Faculty Guide">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#E8F1FB',
              color: '#114C94',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}>
              <UserCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#243143' }}>{studentGroup.guide?.name || 'Unassigned'}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Faculty Guide</div>
            </div>
          </div>
        </Card>

        <Card title="Repository & Documentation">
          <div style={{ fontSize: '13px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>GitHub Repo:</strong>
            </div>
            <a 
              href="#" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: '#B82226', textDecoration: 'none', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
            >
              <span>https://github.com/mock-repo (Mock)</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </Card>
      </div>

      {/* Active Tasks & Submissions Dual Section */}
      <div className="grid-2">
        {/* Active Coordinator Tasks */}
        <Card 
          title="Active Milestones & Tasks" 
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('tasks')}>
              View All Tasks
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingTasks.length > 0 ? pendingTasks.slice(0, 3).map((task) => {
              const totalMarks = task.evaluation_criteria?.reduce((sum, c) => sum + (c.max_marks || 0), 0) || 0;
              return (
                <div 
                  key={task.task_id} 
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
                    <div style={{ fontWeight: 700, color: '#243143', fontSize: '14px' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Deadline: <strong style={{ color: '#FD0A0A' }}>{new Date(task.deadline).toLocaleDateString()}</strong> | Total Marks: {totalMarks} Marks
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setActiveTab('submissions')}
                  >
                    <Upload size={14} />
                    <span>Submit</span>
                  </button>
                </div>
              );
            }) : (
              <p>No active tasks found.</p>
            )}
          </div>
        </Card>

        {/* Team Members List */}
        <Card title={`Project Team Members (${studentGroup.team_code})`}>
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>USN</th>
                  <th>Student Name</th>
                </tr>
              </thead>
              <tbody>
                {studentGroup.members?.map((m) => (
                  <tr key={m.student_id}>
                    <td style={{ fontWeight: 700, color: '#243143' }}>{m.usn}</td>
                    <td>{m.name}</td>
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
