import React from 'react';
import { ExternalLink, Users, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const FacultyGroups = () => {
  const { data, currentUser } = useAuth();
  const myGroups = data.groups.filter(g => g.guide === currentUser.name || g.guide === "Dr. R. Sharma");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Advised Student Project Groups</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Detailed roster of batches under your direct academic supervision.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {myGroups.map((group) => (
          <Card key={group.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Badge variant="navy">{group.groupCode}</Badge>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#243143', margin: 0 }}>{group.title}</h3>
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
                  Domain: <strong>{group.domain}</strong> | Repository:{' '}
                  <a href={group.repoUrl} target="_blank" rel="noreferrer" style={{ color: '#B82226' }}>
                    {group.repoUrl}
                  </a>
                </div>
              </div>
              <Badge variant="success">Phase 1: Approved</Badge>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#243143', marginBottom: '10px' }}>Group Members Roster</h4>
            <div className="table-container responsive-table-stack">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>USN</th>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Project Role</th>
                  </tr>
                </thead>
                <tbody>
                  {group.members.map((m, idx) => (
                    <tr key={idx}>
                      <td data-label="USN" style={{ fontWeight: 700, color: '#243143' }}>{m.usn}</td>
                      <td data-label="Student Name">{m.name}</td>
                      <td data-label="Email Address">{m.email}</td>
                      <td data-label="Project Role"><Badge variant={m.role === 'Team Lead' ? 'navy' : 'info'}>{m.role}</Badge></td>
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
