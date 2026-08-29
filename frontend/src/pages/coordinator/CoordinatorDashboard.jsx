import React from 'react';
import { PlusSquare, CheckSquare, Users, BarChart2, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const CoordinatorDashboard = () => {
  const { data, setActiveTab } = useAuth();

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
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#9F9F9F', fontWeight: 700, textTransform: 'uppercase' }}>
            DEPARTMENT PROJECT COORDINATION GOVERNANCE
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
            Project Coordinator Control Panel
          </h1>
          <div style={{ fontSize: '13px', color: '#D1D5DB', marginTop: '4px' }}>
            CSE 8th Semester Major Project (Subject Code: {data.subjectCode})
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setActiveTab('create-task')}>
          <PlusSquare size={16} />
          <span>CREATE NEW TASK</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid-4">
        <Card title="Department Groups">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#243143' }}>36 Batches</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>144 Final Year Students</div>
        </Card>

        <Card title="Tasks Published">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#114C94' }}>{data.tasks.length} Milestones</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Phase I, II & III</div>
        </Card>

        <Card title="Submissions Rate">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#038203' }}>78%</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>28 of 36 batches uploaded</div>
        </Card>

        <Card title="Evaluation Deadlines">
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#FD0A0A' }}>Oct 10, 2025</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Mid-Term Presentation</div>
        </Card>
      </div>

      {/* Active Coordinator Tasks & Department Group Overview */}
      <div className="grid-2">
        <Card 
          title="Master Milestone Tasks List" 
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('create-task')}>
              + New Milestone
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.tasks.map((task) => (
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
                  <div style={{ fontWeight: 700, color: '#243143', fontSize: '14px' }}>{task.title}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Phase: {task.phase} | Weightage: {task.maxMarks} Marks | Deadline: {task.deadline}
                  </div>
                </div>
                <Badge>{task.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Department Guide Allocations Overview">
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Faculty Advisor</th>
                  <th>Assigned Groups</th>
                  <th>Evaluated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, color: '#243143' }}>Dr. R. Sharma</td>
                  <td>4 Batches</td>
                  <td>3 / 4</td>
                  <td><Badge variant="success">On Schedule</Badge></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#243143' }}>Prof. V. Kulkarni</td>
                  <td>3 Batches</td>
                  <td>3 / 3</td>
                  <td><Badge variant="success">Completed</Badge></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#243143' }}>Dr. Anita M.</td>
                  <td>4 Batches</td>
                  <td>2 / 4</td>
                  <td><Badge variant="warning">Followup Sent</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
