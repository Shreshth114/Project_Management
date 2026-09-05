import React from 'react';
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

export const StudentDashboard = () => {
  const { data, currentUser, setActiveTab } = useAuth();
  
  // Find group associated with student
  const studentGroup = (data.groups || []).find(g => g.id === currentUser?.groupId) || data.groups[0];
  const pendingTasks = (data.tasks || []).filter(t => t.status === 'IN_PROGRESS' || t.status === 'Active' || t.status === 'PENDING');
  
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
              Academic Year 2025–2026 | Course Code: {data.subjectCode || '21CSP81'}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
              {studentGroup.title}
            </h1>
            <div style={{ fontSize: '13px', color: '#E0D6F5', marginTop: '4px' }}>
              Group Name: <strong>{studentGroup.groupCode}</strong> | Subject: {studentGroup.domain}
            </div>
          </div>
          <Badge variant="magenta" style={{ backgroundColor: '#FFFFFF', color: '#9D1B55' }}>8th Semester Major Project</Badge>
        </div>
      </div>

      {/* Progress Metric & Guide Overview Cards Grid */}
      <div className="grid-3">
        <Card title="Project Overall Progress">
          <ProgressBar progress={studentGroup.overallProgress || 85} height={12} />
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
              <div style={{ fontWeight: 700, color: '#3A1F6F' }}>{studentGroup.guide}</div>
              <div style={{ fontSize: '12px', color: '#55636B' }}>Professor, Dept of CSE</div>
              <div style={{ fontSize: '12px', color: '#3A1F6F', marginTop: '2px' }}>dr.sharma@msrit.edu</div>
            </div>
          </div>
        </Card>

        <Card title="Repository & Documentation">
          <div style={{ fontSize: '13px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>GitHub Repo:</strong>
            </div>
            <a 
              href={studentGroup.repoUrl} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: '#DE3B0B', textDecoration: 'none', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
            >
              <span>{studentGroup.repoUrl}</span>
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
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('tasks')}>
              View All Tasks
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingTasks.map((task) => (
              <div 
                key={task.id} 
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
                    Deadline: <strong style={{ color: '#DE3B0B' }}>{task.deadline}</strong> | Total Marks: {task.totalMarks || task.maxMarks} Marks
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
            ))}
          </div>
        </Card>

        {/* Team Members List (Student roles removed per section 2 rule) */}
        <Card title={`Project Team Members (${studentGroup.groupCode})`}>
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>USN</th>
                  <th>Student Name</th>
                </tr>
              </thead>
              <tbody>
                {studentGroup.members.map((m, idx) => (
                  <tr key={idx}>
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
