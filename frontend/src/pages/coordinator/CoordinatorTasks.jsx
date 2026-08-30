import React, { useState, useEffect } from 'react';
import { PlusSquare, Calendar, Award, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { taskService } from '../../services/taskService';

export const CoordinatorTasks = () => {
  const { currentUser, setActiveTab } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      fetchTasks(currentUser.faculty_id);
    }
  }, [currentUser]);

  const fetchTasks = async (facultyId) => {
    try {
      setLoading(true);
      const data = await taskService.getTasks({ faculty_id: facultyId });
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Master Department Tasks & Milestones</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Milestones defined for all final year project batches.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab('create-task')}>
          <PlusSquare size={16} />
          <span>Define New Milestone</span>
        </button>
      </div>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found. Click "Define New Milestone" to create one.</p>
        ) : (
          tasks.map((task) => {
            const totalMarks = task.evaluation_criteria?.reduce((sum, c) => sum + (c.max_marks || 0), 0) || 0;
            return (
              <Card key={task.task_id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#243143', margin: 0 }}>{task.title}</h3>
                      <Badge>{task.task_type}</Badge>
                    </div>
                    <p style={{ fontSize: '14px', color: '#444', marginBottom: '12px' }}>{task.description}</p>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#666', flexWrap: 'wrap' }}>
                      <div><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</div>
                      <div><strong>Weightage:</strong> {totalMarks} Marks</div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => alert(`Editing requirements for task: ${task.title}`)}
                  >
                    <Edit size={14} />
                    <span>Edit Milestone</span>
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
