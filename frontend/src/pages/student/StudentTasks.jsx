import React, { useState, useEffect } from 'react';
import { Calendar, Award, FileText, Upload, Users, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { taskService } from '../../services/taskService';

export const StudentTasks = () => {
  const { currentUser, setActiveTab } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a full implementation, we'd filter tasks by the student's assigned subject or team.
    // For this milestone, we fetch all tasks.
    taskService.getTasks()
      .then(setTasks)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading Tasks...</div>;
  }

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
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        {tasks.length === 0 && !error ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((task) => {
            const totalMarks = task.evaluation_criteria?.reduce((sum, c) => sum + (c.max_marks || 0), 0) || 0;
            return (
              <Card key={task.task_id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <Badge variant={task.task_type === 'INDIVIDUAL' ? 'info' : 'navy'}>
                        {task.task_type === 'INDIVIDUAL' ? '👤 INDIVIDUAL TASK' : '👥 GROUP TASK'}
                      </Badge>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#243143', margin: 0 }}>{task.title}</h3>
                      <Badge variant="warning">Pending</Badge>
                    </div>

                    <p style={{ fontSize: '14px', color: '#444', marginBottom: '12px' }}>
                      {task.description}
                    </p>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#666' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#B82226" />
                        <span>Deadline: <strong style={{ color: '#243143' }}>{new Date(task.deadline).toLocaleDateString()}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} color="#A68E24" />
                        <span>Total Marks: <strong>{totalMarks} Marks</strong></span>
                      </div>
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
            );
          })
        )}
      </div>
    </div>
  );
};
