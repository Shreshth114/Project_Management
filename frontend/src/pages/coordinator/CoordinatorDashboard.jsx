import React, { useState, useEffect } from 'react';
import { PlusSquare, CheckSquare, Users, BarChart2, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { taskService } from '../../services/taskService';
import { academicService } from '../../services/academicService';
import { evaluationService } from '../../services/evaluationService';

export const CoordinatorDashboard = () => {
  const { currentUser, setActiveTab } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, teams, evals] = await Promise.all([
        taskService.getTasks().catch(() => []),
        academicService.getTeams().catch(() => []),
        evaluationService.getAllEvaluations().catch(() => [])
      ]);

      setTasks(fetchedTasks || []);
      setAllTeams(teams || []);
      setEvaluations(evals || []);
    } catch (err) {
      console.error("Coordinator dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextUpcomingTask = [...tasks]
    .filter(t => t.deadline && new Date(t.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

  // Group teams by guide
  const guideAllocationsMap = {};
  allTeams.forEach(t => {
    const guideName = t.guide?.name || 'Unassigned Guide';
    if (!guideAllocationsMap[guideName]) {
      guideAllocationsMap[guideName] = { name: guideName, count: 0, teams: [] };
    }
    guideAllocationsMap[guideName].count += 1;
    guideAllocationsMap[guideName].teams.push(t);
  });
  const guideAllocations = Object.values(guideAllocationsMap);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Box */}
      <div style={{
        backgroundColor: '#243143',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '6px',
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
            Coordinator: <strong>{currentUser?.name || 'Academic Coordinator'}</strong>
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
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#243143' }}>{allTeams.length} Batches</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Enrolled in system</div>
        </Card>

        <Card title="Published Milestones">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#114C94' }}>{tasks.length} Milestones</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Active department tasks</div>
        </Card>

        <Card title="Evaluations Completed">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#038203' }}>{evaluations.length} Records</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Evaluations recorded in database</div>
        </Card>

        <Card title="Next Milestone Deadline">
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#B82226' }}>
            {nextUpcomingTask ? new Date(nextUpcomingTask.deadline).toLocaleDateString() : 'None Scheduled'}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {nextUpcomingTask?.title || 'All deadlines reached'}
          </div>
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
            {tasks.length > 0 ? (
              tasks.map((task) => {
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
                        Weightage: {totalMarks} Marks | Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                      </div>
                    </div>
                    <Badge variant="purple">{task.task_type || 'GROUP'}</Badge>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8A9198' }}>
                No milestone tasks created yet. Click "+ New Milestone" to publish a task.
              </div>
            )}
          </div>
        </Card>

        <Card title="Department Guide Allocations Overview">
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Faculty Guide</th>
                  <th>Assigned Groups</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {guideAllocations.length > 0 ? (
                  guideAllocations.map((alloc) => (
                    <tr key={alloc.name}>
                      <td style={{ fontWeight: 700, color: '#243143' }}>{alloc.name}</td>
                      <td>{alloc.count} {alloc.count === 1 ? 'Batch' : 'Batches'}</td>
                      <td><Badge variant="success">Active Allocation</Badge></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#8A9198', padding: '24px' }}>
                      No faculty guide allocations registered in database.
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
