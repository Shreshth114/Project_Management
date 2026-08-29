import React, { useState } from 'react';
import { Search, Users, ExternalLink, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const CoordinatorGroups = () => {
  const { data } = useAuth();
  const [search, setSearch] = useState('');

  const filteredGroups = data.groups.filter(g => 
    g.groupCode.toLowerCase().includes(search.toLowerCase()) ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.guide.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Department Groups & Guide Allocations</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Comprehensive directory of 36 final year project groups and allocated faculty guides.
          </p>
        </div>

        <div style={{ width: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search group code, title, or guide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card title="Project Batches Directory">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Project Title & Domain</th>
                <th>Allocated Guide</th>
                <th>Team Members Count</th>
                <th>Phase 1</th>
                <th>Phase 2</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((g) => (
                <tr key={g.id}>
                  <td data-label="Code" style={{ fontWeight: 700, color: '#243143' }}>{g.groupCode}</td>
                  <td data-label="Title & Domain">
                    <div style={{ fontWeight: 700, color: '#243143' }}>{g.title}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Domain: {g.domain}</div>
                  </td>
                  <td data-label="Guide" style={{ fontWeight: 600 }}>{g.guide}</td>
                  <td data-label="Members">{g.members.length} Students</td>
                  <td data-label="Phase 1"><Badge variant="success">{g.phase1Status}</Badge></td>
                  <td data-label="Phase 2"><Badge variant="warning">{g.phase2Status}</Badge></td>
                  <td data-label="Progress" style={{ fontWeight: 700, color: '#B82226' }}>{g.overallProgress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
