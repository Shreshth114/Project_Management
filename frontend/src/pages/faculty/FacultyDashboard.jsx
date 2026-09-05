import React from 'react';
import { Users, FileText, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const FacultyDashboard = () => {
  const { data, currentUser, setActiveTab } = useAuth();
  
  const myGroups = (data.groups || []).filter(g => g.guide === currentUser?.name || g.guide === "Dr. R. Sharma");
  
  // Aggregate pending submissions
  const pendingSubmissions = [];
  myGroups.forEach(g => {
    if (g.components) {
      Object.keys(g.components).forEach(compKey => {
        const comp = g.components[compKey];
        if (comp.status === 'COMPLETED') {
          pendingSubmissions.push({
            id: `${g.id}-${compKey}`,
            groupCode: g.groupCode,
            taskTitle: comp.title,
            fileName: comp.fileName || comp.url || "Deliverable",
            fileSize: comp.fileSize || "Link",
            submittedAt: comp.submittedAt || "Recent"
          });
        }
      });
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#243143',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '4px',
        borderLeft: '6px solid #B82226'
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          Faculty Advisor Workspace — {currentUser?.name || 'Dr. R. Sharma'}
        </h1>
        <p style={{ fontSize: '13px', color: '#D1D5DB', marginTop: '4px' }}>
          Department of Computer Science & Engineering | Academic Year 2025–2026
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        <Card title="Assigned Groups">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#243143' }}>{myGroups.length} Batches</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Advised Students: 11</div>
        </Card>

        <Card title="Uploaded Deliverables">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#A68E24' }}>{pendingSubmissions.length} Items</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Ready for rubric evaluation</div>
        </Card>

        <Card title="Evaluated Batches">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#038203' }}>1 / 2 Complete</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Phase I & II evaluations</div>
        </Card>

        <Card title="Upcoming Viva">
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#B82226' }}>This Friday</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Lab 3 & 4 (09:30 AM)</div>
        </Card>
      </div>

      {/* Submissions Needing Action & Group Roster */}
      <div className="grid-2">
        <Card 
          title="Deliverables Awaiting Review" 
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('evaluation')}>
              Go to Mark Rubrics
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingSubmissions.length > 0 ? (
              pendingSubmissions.slice(0, 4).map((sub) => (
                <div 
                  key={sub.id}
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
                    <div style={{ fontWeight: 700, color: '#243143', fontSize: '14px' }}>
                      {sub.groupCode} - {sub.taskTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      File: {sub.fileName} ({sub.fileSize}) | Submitted: {sub.submittedAt}
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab('evaluation')}
                  >
                    Evaluate
                  </button>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: '#666', padding: '10px 0' }}>
                No pending deliverables requiring review.
              </div>
            )}
          </div>
        </Card>

        <Card title="Assigned Project Groups Roster">
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Group Code</th>
                  <th>Project Title</th>
                  <th>Progress</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {myGroups.map((g) => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 700, color: '#243143' }}>{g.groupCode}</td>
                    <td style={{ fontSize: '13px' }}>{g.title}</td>
                    <td><strong style={{ color: '#B82226' }}>{g.overallProgress}%</strong></td>
                    <td><Badge variant="navy">{g.submissionMode === 'LEADER_SUBMITS_ALL' ? 'Mode A' : 'Mode B'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
