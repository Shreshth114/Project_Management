import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { evaluationService } from '../../services/evaluationService';

export const FacultyStatus = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      loadData(currentUser.faculty_id);
    }
  }, [currentUser]);

  const loadData = async (facultyId) => {
    try {
      setLoading(true);
      const [fetchedTeams, fetchedEvals] = await Promise.all([
        academicService.getTeams({ guide_id: facultyId }),
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Faculty Submission & Evaluation Status Matrix</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Monitor Group Submissions and Individual Student Evaluations across your assigned project batches.
        </p>
      </div>

      <Card title="Academic Workflow Color Coding Standard">
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
          <Badge variant="info">Pending (#114C94)</Badge>
          <Badge variant="warning">In Progress (#A68E24)</Badge>
          <Badge variant="success">Completed / Submitted (#038203)</Badge>
          <Badge variant="danger">Overdue / Error (#FD0A0A)</Badge>
        </div>
      </Card>

      <Card title="Assigned Batches Evaluation Status">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Group Code</th>
                <th>Project Title</th>
                <th>Submission Mode</th>
                <th>Group Components Status</th>
                <th>Individual Evaluations</th>
                <th>Overall Batch Health</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((g) => {
                const totalMembers = g.members?.length || 0;
                // Count unique students evaluated in this team
                const teamEvals = evaluations.filter(e => e.submission?.team_id === g.team_id);
                const evaluatedStudents = new Set(teamEvals.map(e => e.student_id)).size;
                const progress = totalMembers > 0 ? Math.round((evaluatedStudents / totalMembers) * 100) : 0;

                return (
                  <tr key={g.team_id}>
                    <td data-label="Group Code" style={{ fontWeight: 700, color: '#243143' }}>{g.team_code}</td>
                    <td data-label="Project Title" style={{ fontSize: '13px' }}>{g.subject?.subject_name}</td>
                    <td data-label="Mode"><Badge variant="navy">Digital</Badge></td>
                    <td data-label="Components Status">
                      <Badge variant="success">✓ All Components Submitted (#038203)</Badge>
                    </td>
                    <td data-label="Individual Evaluations">
                      <Badge variant={evaluatedStudents === totalMembers && totalMembers > 0 ? 'success' : 'warning'}>
                        {evaluatedStudents} / {totalMembers} Students Evaluated
                      </Badge>
                    </td>
                    <td data-label="Overall Health" style={{ fontWeight: 700, color: '#038203' }}>
                      {progress}% Complete
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
