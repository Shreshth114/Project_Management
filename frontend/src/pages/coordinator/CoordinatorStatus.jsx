import React, { useState, useEffect } from 'react';
import { BarChart2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { evaluationService } from '../../services/evaluationService';

export const CoordinatorStatus = () => {
  const [teams, setTeams] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTeams, fetchedEvals] = await Promise.all([
        academicService.getTeams(),
        evaluationService.getAllEvaluations()
      ]);
      setTeams(fetchedTeams || []);
      setEvaluations(fetchedEvals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading compliance matrix...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Coordinator Department Compliance Matrix</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Tracking Group Submissions, Member Component Assignments, and Faculty Evaluations.
        </p>
      </div>

      <div className="grid-4">
        <Card title="Pending Submissions">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#114C94' }}>2 Groups</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Status Color: #114C94</div>
        </Card>
        <Card title="In Progress">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#A68E24' }}>8 Groups</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Status Color: #A68E24</div>
        </Card>
        <Card title="Completed / Submitted">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#038203' }}>26 Groups</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Status Color: #038203</div>
        </Card>
        <Card title="Overdue Items">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#FD0A0A' }}>0 Overdue</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Status Color: #FD0A0A</div>
        </Card>
      </div>

      <Card title="All Department Groups Workflow Matrix">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Batch Code</th>
                <th>Project Title</th>
                <th>Mode</th>
                <th>Group Components Status</th>
                <th>Individual Student Evaluations</th>
                <th>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((g) => {
                const totalMembers = g.members?.length || 0;
                // Count unique students evaluated in this team
                const teamEvals = evaluations.filter(e => e.submission?.team_id === g.team_id);
                const evaluatedStudents = new Set(teamEvals.map(e => e.student_id)).size;
                const isAllEvaluated = evaluatedStudents === totalMembers && totalMembers > 0;
                const progress = totalMembers > 0 ? Math.round((evaluatedStudents / totalMembers) * 100) : 0;

                return (
                  <tr key={g.team_id}>
                    <td data-label="Batch Code" style={{ fontWeight: 700, color: '#243143' }}>{g.team_code}</td>
                    <td data-label="Project Title" style={{ fontSize: '13px' }}>{g.subject?.subject_name}</td>
                    <td data-label="Mode"><Badge variant="navy">Digital</Badge></td>
                    <td data-label="Components Status">
                      <Badge variant="success">✓ Submitted (#038203)</Badge>
                    </td>
                    <td data-label="Evaluations">
                      <Badge variant={isAllEvaluated ? 'success' : 'warning'}>
                        {evaluatedStudents} / {totalMembers} Members Evaluated
                      </Badge>
                    </td>
                    <td data-label="Health Status">
                      <Badge variant={progress >= 80 ? 'success' : 'warning'}>
                        {progress}% Complete
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
