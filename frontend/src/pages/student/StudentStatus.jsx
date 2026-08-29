import React from 'react';
import { Award, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const StudentStatus = () => {
  const { data, currentUser } = useAuth();
  const studentGroup = (data.groups || []).find(g => g.id === currentUser?.groupId) || data.groups[0];
  const evalRecord = (data.groupEvaluations || []).find(e => e.groupId === studentGroup.id && e.studentUsn === currentUser.usn) || data.groupEvaluations[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Individual Academic Status & Marks Transcript</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Personal evaluation transcript signed off by your assigned Faculty Guide ({studentGroup.guide}).
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
            {evalRecord ? `${evalRecord.totalScore} / 50` : 'Pending Evaluation'}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Evaluated by {evalRecord?.evaluator || studentGroup.guide}</div>
        </Card>

        <Card title="Group Submission Status">
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#038203' }}>✓ All Components Uploaded</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Mode: {studentGroup.submissionMode}</div>
        </Card>

        <Card title="Guide Feedback">
          <p style={{ fontSize: '13px', color: '#243143', fontStyle: 'italic' }}>
            "{evalRecord?.feedback || 'Good overall progress in project development.'}"
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
              <tr>
                <td>Technical Implementation</td>
                <td>15</td>
                <td style={{ fontWeight: 700, color: '#038203' }}>{evalRecord?.scores?.technicalImplementation ?? 14}</td>
                <td><Badge variant="success">Completed (#038203)</Badge></td>
              </tr>
              <tr>
                <td>Project Understanding</td>
                <td>10</td>
                <td style={{ fontWeight: 700, color: '#038203' }}>{evalRecord?.scores?.projectUnderstanding ?? 9}</td>
                <td><Badge variant="success">Completed (#038203)</Badge></td>
              </tr>
              <tr>
                <td>Individual Contribution</td>
                <td>10</td>
                <td style={{ fontWeight: 700, color: '#038203' }}>{evalRecord?.scores?.individualContribution ?? 9}</td>
                <td><Badge variant="success">Completed (#038203)</Badge></td>
              </tr>
              <tr>
                <td>Documentation</td>
                <td>5</td>
                <td style={{ fontWeight: 700, color: '#038203' }}>{evalRecord?.scores?.documentation ?? 5}</td>
                <td><Badge variant="success">Completed (#038203)</Badge></td>
              </tr>
              <tr>
                <td>Presentation</td>
                <td>5</td>
                <td style={{ fontWeight: 700, color: '#038203' }}>{evalRecord?.scores?.presentation ?? 5}</td>
                <td><Badge variant="success">Completed (#038203)</Badge></td>
              </tr>
              <tr>
                <td>Viva Voce & Defense</td>
                <td>5</td>
                <td style={{ fontWeight: 700, color: '#038203' }}>{evalRecord?.scores?.viva ?? 4}</td>
                <td><Badge variant="success">Completed (#038203)</Badge></td>
              </tr>
              <tr style={{ backgroundColor: '#F8F9FA' }}>
                <td><strong>TOTAL AGGREGATE SCORE</strong></td>
                <td><strong>50</strong></td>
                <td style={{ fontWeight: 700, fontSize: '18px', color: '#B82226' }}>{evalRecord?.totalScore ?? 46} / 50</td>
                <td><Badge variant="success">GRADE AWARDED: O (92%)</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
