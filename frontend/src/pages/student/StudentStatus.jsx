import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { evaluationService } from '../../services/evaluationService';

export const StudentStatus = () => {
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.student_id) {
      loadData(currentUser.student_id);
    }
  }, [currentUser]);

  const loadData = async (studentId) => {
    try {
      setLoading(true);
      const fetchedTeam = await academicService.getTeamByStudent(studentId);
      setTeam(fetchedTeam);
      
      const evals = await evaluationService.getEvaluationsForStudent(studentId);
      setEvaluations(evals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading status...</div>;

  const totalScore = evaluations.reduce((sum, e) => sum + (e.awarded_marks || 0), 0);
  const maxPossible = evaluations.reduce((sum, e) => sum + (e.evaluation_criteria?.max_marks || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Individual Academic Status & Marks Transcript</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Personal evaluation transcript signed off by your assigned Faculty Guide ({team?.guide?.name || 'Unassigned'}).
        </p>
      </div>

      {/* Workflow Legend */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
          <strong>Workflow Status Legend:</strong>
          <span style={{ color: '#114C94', fontWeight: 700 }}>● Pending (#114C94)</span>
          <span style={{ color: '#A68E24', fontWeight: 700 }}>● In Progress (#A68E24)</span>
          <span style={{ color: '#038203', fontWeight: 700 }}>● Completed / Submitted (#038203)</span>
          <span style={{ color: '#FD0A0A', fontWeight: 700 }}>● Overdue / Error (#FD0A0A)</span>
        </div>
      </Card>

      <div className="grid-3">
        <Card title="Individual Score">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#038203' }}>
            {evaluations.length > 0 ? `${totalScore} / ${maxPossible}` : 'Pending Evaluation'}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Evaluated by {team?.guide?.name || 'Assigned Guide'}</div>
        </Card>

        <Card title="Group Submission Status">
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#038203' }}>✓ In Progress</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Team: {team?.team_code}</div>
        </Card>

        <Card title="Guide Feedback">
          <p style={{ fontSize: '13px', color: '#243143', fontStyle: 'italic' }}>
            "{evaluations[evaluations.length - 1]?.feedback || 'No feedback yet.'}"
          </p>
        </Card>
      </div>

      <Card title="Rubric Score Breakdown">
        <div className="table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Evaluation Metric</th>
                <th>Maximum Marks</th>
                <th>Marks Obtained</th>
                <th>Status Color</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map(e => (
                <tr key={e.evaluation_id}>
                  <td>{e.evaluation_criteria?.criteria_name || 'General Criteria'}</td>
                  <td>{e.evaluation_criteria?.max_marks || '-'}</td>
                  <td style={{ fontWeight: 700, color: '#038203' }}>{e.awarded_marks}</td>
                  <td><Badge variant="success">Evaluated</Badge></td>
                </tr>
              ))}
              {evaluations.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No evaluations recorded yet.</td>
                </tr>
              )}
              {evaluations.length > 0 && (
                <tr style={{ backgroundColor: '#F8F9FA' }}>
                  <td><strong>TOTAL AGGREGATE SCORE</strong></td>
                  <td><strong>{maxPossible}</strong></td>
                  <td style={{ fontWeight: 700, fontSize: '18px', color: '#B82226' }}>{totalScore} / {maxPossible}</td>
                  <td><Badge variant="success">Completed</Badge></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
