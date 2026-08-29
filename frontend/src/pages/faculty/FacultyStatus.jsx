import React from 'react';
import { BarChart2, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const FacultyStatus = () => {
  const { data, currentUser } = useAuth();
  const myGroups = data.groups.filter(g => g.guide === currentUser.name || g.guide === "Dr. R. Sharma");

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
              {myGroups.map((g) => {
                const totalMembers = g.members.length;
                const evaluatedCount = data.groupEvaluations.filter(e => e.groupId === g.id).length;

                return (
                  <tr key={g.id}>
                    <td data-label="Group Code" style={{ fontWeight: 700, color: '#243143' }}>{g.groupCode}</td>
                    <td data-label="Project Title" style={{ fontSize: '13px' }}>{g.title}</td>
                    <td data-label="Mode"><Badge variant="navy">{g.submissionMode}</Badge></td>
                    <td data-label="Components Status">
                      <Badge variant="success">✓ All Components Submitted (#038203)</Badge>
                    </td>
                    <td data-label="Individual Evaluations">
                      <Badge variant={evaluatedCount === totalMembers ? 'success' : 'warning'}>
                        {evaluatedCount} / {totalMembers} Students Evaluated
                      </Badge>
                    </td>
                    <td data-label="Overall Health" style={{ fontWeight: 700, color: '#038203' }}>
                      {g.overallProgress}% Complete
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
