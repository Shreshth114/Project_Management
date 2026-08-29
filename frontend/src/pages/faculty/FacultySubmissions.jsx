import React from 'react';
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const FacultySubmissions = () => {
  const { data, setActiveTab } = useAuth();

  // Dynamically collect all group component submissions & individual submissions
  const allSubmissions = [];

  // 1. Group Deliverable Components
  if (data.groups) {
    data.groups.forEach(g => {
      if (g.components) {
        Object.keys(g.components).forEach(compKey => {
          const comp = g.components[compKey];
          if (comp.status === 'COMPLETED') {
            allSubmissions.push({
              id: `${g.id}-${compKey}`,
              groupCode: g.groupCode,
              taskTitle: comp.title,
              fileName: comp.fileName || comp.url || "Live Endpoint URL",
              fileSize: comp.fileSize || "Web Link",
              submittedBy: comp.submittedByNames && comp.submittedByNames.length > 0 ? comp.submittedByNames.join(' + ') : g.leaderName,
              submittedAt: comp.submittedAt || "2025-10-08",
              status: "COMPLETED"
            });
          }
        });
      }
    });
  }

  // 2. Individual Submissions
  if (data.individualSubmissions) {
    data.individualSubmissions.forEach(ind => {
      allSubmissions.push({
        id: ind.id,
        groupCode: `Individual (${ind.studentUsn})`,
        taskTitle: ind.taskTitle,
        fileName: ind.fileName,
        fileSize: ind.fileSize,
        submittedBy: `${ind.studentName} (${ind.studentUsn})`,
        submittedAt: ind.submittedAt,
        status: ind.status || "COMPLETED"
      });
    });
  }

  // 3. Fallback submissions list if present
  if (data.submissions && Array.isArray(data.submissions)) {
    data.submissions.forEach(s => {
      if (!allSubmissions.some(x => x.id === s.id)) {
        allSubmissions.push(s);
      }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Submitted Student Deliverables</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Review technical documents, reports, and code repositories uploaded by assigned batches.
        </p>
      </div>

      <Card title="Submitted Project Work Queue">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Group / Student</th>
                <th>Task Component</th>
                <th>Deliverable File</th>
                <th>Submitted By</th>
                <th>Submission Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allSubmissions.length > 0 ? (
                allSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td data-label="Group / Student" style={{ fontWeight: 700, color: '#243143' }}>{sub.groupCode}</td>
                    <td data-label="Task Component">{sub.taskTitle}</td>
                    <td data-label="Deliverable File" style={{ color: '#114C94', fontWeight: 600 }}>{sub.fileName} ({sub.fileSize})</td>
                    <td data-label="Submitted By">{sub.submittedBy}</td>
                    <td data-label="Submission Time">{sub.submittedAt}</td>
                    <td data-label="Status"><Badge>{sub.status}</Badge></td>
                    <td data-label="Actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('evaluation')}
                      >
                        Evaluate & Mark
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No student submissions uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
