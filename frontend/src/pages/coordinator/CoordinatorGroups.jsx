import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { academicService } from '../../services/academicService';

export const CoordinatorGroups = () => {
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await academicService.getTeams();
      setGroups(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.team_code?.toLowerCase().includes(search.toLowerCase()) ||
    g.guide?.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.subject?.subject_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Department Groups & Guide Allocations</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Comprehensive directory of registered project groups and allocated faculty guides.
          </p>
        </div>

        <div style={{ width: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search team code, guide, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <Card title="Project Batches Directory">
        {loading ? (
          <p>Loading teams...</p>
        ) : groups.length === 0 ? (
          <p>No teams found.</p>
        ) : (
          <div className="table-container responsive-table-stack">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Team Code</th>
                  <th>Subject</th>
                  <th>Allocated Guide</th>
                  <th>Team Members</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((g) => (
                  <tr key={g.team_id}>
                    <td data-label="Code" style={{ fontWeight: 700, color: '#243143' }}>{g.team_code}</td>
                    <td data-label="Subject">{g.subject?.subject_name} ({g.subject?.subject_code})</td>
                    <td data-label="Guide" style={{ fontWeight: 600 }}>{g.guide?.name || 'Unassigned'}</td>
                    <td data-label="Members">
                      {g.members?.length > 0 ? (
                        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '12px', color: '#444' }}>
                          {g.members.map(m => (
                            <li key={m.student_id}>{m.name} ({m.usn})</li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: '#888' }}>No members</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
