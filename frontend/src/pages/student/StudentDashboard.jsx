import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  UserCheck, 
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
  const { currentUser, setActiveTab, data } = useAuth();
  
  const [studentGroup, setStudentGroup] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.student_id) {
      loadDashboardData();
    } else {
      const mockTeam = (data?.groups || []).find(g => g.id === currentUser?.groupId) || data?.groups?.[0];
      if (mockTeam) {
        setStudentGroup(mockTeam);
      }
      setPendingTasks(data?.tasks || []);
      setLoading(false);
    }
  }, [currentUser, data]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const teamData = await academicService.getTeamByStudent(currentUser.student_id);
      setStudentGroup(teamData);
      
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
  
  const currentGroup = studentGroup || (data?.groups || [])[0] || {
    title: 'Major Project Phase - II',
    groupCode: 'Group G01',
    team_code: 'Group G01',
    domain: 'Cloud Computing & Distributed Systems',
    guide: 'Dr. Anita M.',
    members: [
      { usn: '1MS21CS001', name: 'Aarav Patel' },
      { usn: '1MS21CS002', name: 'Bhavna Roy' },
      { usn: '1MS21CS003', name: 'Chetan Kumar' }
    ]
  };

  const groupCode = currentGroup.groupCode || currentGroup.team_code || 'Group G01';
  const title = currentGroup.title || currentGroup.subject?.subject_name || 'Major Project Phase - II';
  const subjectCode = data?.subjectCode || currentGroup.subject?.subject_code || '21CSP81';
  const domain = currentGroup.domain || 'Cloud Computing & Distributed Systems';
  const guideName = currentGroup.guide?.name || currentGroup.guide || 'Dr. Anita M.';
  const members = currentGroup.members || [];

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
              Group Name: <strong>{groupCode}</strong> | Subject: {domain}
            </div>
          </div>
          <Badge variant="magenta" style={{ backgroundColor: '#FFFFFF', color: '#9D1B55' }}>8th Semester Major Project</Badge>
        </div>
      </div>

      {/* Progress Metric & Guide Overview Cards Grid */}
      <div className="grid-3">
        <Card title="Project Overall Progress">
          <ProgressBar progress={85} height={12} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '13px' }}>
            <span>Phase 1: <strong style={{ color: '#728C5E' }}>Approved</strong></span>
            <span>Phase 2: <strong style={{ color: '#DA8B3E' }}>In Progress</strong></span>
          </div>
        </Card>

        <Card title="Assigned Faculty Guide">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#F2EEFA',
              color: '#3A1F6F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}>
              <UserCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#3A1F6F' }}>{guideName}</div>
              <div style={{ fontSize: '12px', color: '#55636B' }}>Professor, Dept of CSE</div>
              <div style={{ fontSize: '12px', color: '#3A1F6F', marginTop: '2px' }}>guide@msrit.edu</div>
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
              style={{ color: '#DE3B0B', textDecoration: 'none', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
            >
              <span>https://github.com/mock-repo (Mock)</span>
              <ExternalLink size={13} />
            </a>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#55636B' }}>
              Submission Rule: <strong>Anyone can submit, reflects to all</strong>
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
                {members.map((m, idx) => (
                  <tr key={m.student_id || m.usn || idx}>
                    <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                    <td style={{ fontWeight: 600, color: '#3A1F6F' }}>{m.name}</td>
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
