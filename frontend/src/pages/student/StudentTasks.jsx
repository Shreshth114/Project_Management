import React from 'react';
import { Calendar, Award, FileText, Upload, Users, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const StudentTasks = () => {
  const { data, setActiveTab } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Assigned Project Tasks & Milestones</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Official evaluation tasks categorized into Individual Tasks and Shared Group Tasks.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.tasks.map((task) => (
          <Card key={task.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Badge variant={task.taskType === 'INDIVIDUAL' ? 'info' : 'navy'}>
                    {task.taskType === 'INDIVIDUAL' ? '👤 INDIVIDUAL TASK' : '👥 GROUP TASK'}
                  </Badge>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#243143', margin: 0 }}>{task.title}</h3>
                  <Badge variant={task.status === 'COMPLETED' ? 'success' : 'warning'}>{task.status}</Badge>
                </div>

                <p style={{ fontSize: '14px', color: '#444', marginBottom: '12px' }}>
                  {task.description}
                </p>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#666' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#B82226" />
                    <span>Deadline: <strong style={{ color: '#243143' }}>{task.deadline}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={14} color="#A68E24" />
                    <span>Total Marks: <strong>{task.totalMarks} Marks</strong></span>
                  </div>
                  {task.taskType === 'GROUP' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#114C94" />
                      <span>Components: <strong>Report, Source Code, Paper, PPT, Video, Link</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('submissions')}
              >
                <Upload size={16} />
                <span>Go to Submissions</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
