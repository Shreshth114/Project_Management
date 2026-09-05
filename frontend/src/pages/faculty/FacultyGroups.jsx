import React from 'react';
import { ExternalLink, Users, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const FacultyGroups = () => {
  const { data, currentUser } = useAuth();
  const myGroups = data.groups || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Evaluated Student Project Groups</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Detailed roster of project teams assigned for faculty evaluation.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {myGroups.map((group) => (
          <Card key={group.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Badge variant="purple">{group.groupCode}</Badge>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>{group.title}</h3>
                </div>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '6px' }}>
                  Subject Name: <strong>{group.subjectName || group.domain || 'Major Project Phase - II'}</strong> | Repository:{' '}
                  <a href={group.repoUrl} target="_blank" rel="noreferrer" style={{ color: '#DE3B0B', fontWeight: 600 }}>
                    {group.repoUrl}
                  </a>
                </div>
              </div>
              <Badge variant="success">Phase 1: Approved</Badge>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '10px' }}>Group Members Roster</h4>
            <div className="table-container responsive-table-stack">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>USN</th>
                    <th>Student Name</th>
                    <th>Email Address</th>
                  </tr>
                </thead>
                <tbody>
                  {group.members.map((m, idx) => (
                    <tr key={idx}>
                      <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                      <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
                      <td data-label="Email Address">{m.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
