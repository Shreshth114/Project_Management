import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const FacultyGroups = () => {
  const { data, currentUser } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      fetchMyGroups(currentUser.faculty_id);
    } else {
      setMyGroups(data?.groups || []);
      setLoading(false);
    }
  }, [currentUser, data]);

  const fetchMyGroups = async (facultyId) => {
    try {
      setLoading(true);
      const teams = await academicService.getTeams({ guide_id: facultyId });
      if (teams && teams.length > 0) {
        const mapped = teams.map(t => ({
          id: t.team_id,
          groupCode: t.team_code,
          title: t.subject?.subject_name || "Project",
          subjectName: t.subject?.subject_name || 'Major Project Phase - II',
          repoUrl: 'https://github.com/mock-repo',
          members: (t.members || []).map(m => ({
            student_id: m.student_id,
            usn: m.usn,
            name: m.name,
            email: m.email || `${m.usn?.toLowerCase()}@msrit.edu`
          }))
        }));
        setMyGroups(mapped);
      } else {
        setMyGroups(data?.groups || []);
      }
    } catch (err) {
      setError(err.message);
      setMyGroups(data?.groups || []);
    } finally {
      setLoading(false);
    }
  };

  const displayGroups = myGroups.length > 0 ? myGroups : (data?.groups || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Evaluated Student Project Groups</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Detailed roster of project teams assigned for faculty evaluation.
        </p>
      </div>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {displayGroups.map((group) => (
          <Card key={group.id || group.groupCode}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Badge variant="purple">{group.groupCode}</Badge>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>{group.title}</h3>
                </div>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '6px' }}>
                  Subject Name: <strong>{group.subjectName || group.domain || 'Major Project Phase - II'}</strong> | Repository:{' '}
                  <a href={group.repoUrl || 'https://github.com/mock-repo'} target="_blank" rel="noreferrer" style={{ color: '#DE3B0B', fontWeight: 600 }}>
                    {group.repoUrl || 'https://github.com/mock-repo'}
                  </a>
                </div>
              </div>
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
                  {(group.members || []).map((m, idx) => (
                    <tr key={m.student_id || m.usn || idx}>
                      <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                      <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
                      <td data-label="Email Address">{m.email || `${m.usn?.toLowerCase()}@msrit.edu`}</td>
                    </tr>
                  ))}
                  {(!group.members || group.members.length === 0) && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No members found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ))}

        {displayGroups.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', padding: '24px', color: '#8A9198' }}>
              No project groups assigned to evaluate at this time.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
