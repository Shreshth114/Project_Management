import React from 'react';
import { PlusSquare, Calendar, Award, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const CoordinatorTasks = () => {
  const { data, setActiveTab } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Master Department Tasks & Milestones</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Milestones defined for all final year project batches (2025–2026).
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab('create-task')}>
          <PlusSquare size={16} />
          <span>Define New Milestone</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.tasks.map((task) => (
          <Card key={task.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Badge variant="navy">{task.phase}</Badge>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#243143', margin: 0 }}>{task.title}</h3>
                  <Badge>{task.status}</Badge>
                </div>
                <p style={{ fontSize: '14px', color: '#444', marginBottom: '12px' }}>{task.description}</p>
                <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#666', flexWrap: 'wrap' }}>
                  <div><strong>Deadline:</strong> {task.deadline}</div>
                  <div><strong>Weightage:</strong> {task.maxMarks} Marks</div>
                  <div><strong>Format:</strong> {task.allowedTypes}</div>
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
        ))}
      </div>
    </div>
  );
};
