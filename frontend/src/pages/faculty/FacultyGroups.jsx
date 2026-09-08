import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { ExternalLink, AlertCircle } from 'lucide-react';

export const FacultyGroups = () => {
  const { currentUser } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      fetchMyGroups(currentUser.faculty_id);
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchMyGroups = async (facultyId) => {
    try {
      setLoading(true);
      const teams = await academicService.getTeams({ guide_id: facultyId });
      if (teams && teams.length > 0) {
        const mapped = teams.map(t => ({
          id: t.team_id,
          groupCode: t.team_code,
          title: t.subject?.subject_name || "Academic Project",
          subjectName: t.subject?.subject_name || t.subject?.subject_code || 'Course Project',
          repoUrl: t.repo_url,
          members: (t.members || []).map(m => ({
            student_id: m.student_id,
            usn: m.usn,
            name: m.name,
            email: m.email || `${m.usn?.toLowerCase()}@msrit.edu`
          }))
        }));
        setMyGroups(mapped);
      } else {
        setMyGroups([]);
      }
    } catch (err) {
      setError(err.message);
      setMyGroups([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '24px', color: '#55636B' }}>Loading Assigned Groups...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Evaluated Student Project Groups</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Detailed roster of project teams assigned for faculty evaluation.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {myGroups.length > 0 ? (
          myGroups.map((group) => (
            <Card key={group.id || group.groupCode}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge variant="purple">{group.groupCode}</Badge>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>{group.title}</h3>
                  </div>
                  <div style={{ fontSize: '13px', color: '#55636B', marginTop: '6px' }}>
                    Subject: <strong>{group.subjectName}</strong>
                    {group.repoUrl && (
                      <>
                        {' | '}Repository:{' '}
                        <a href={group.repoUrl} target="_blank" rel="noreferrer" style={{ color: '#DE3B0B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span>{group.repoUrl}</span>
                          <ExternalLink size={12} />
                        </a>
                      </>
                    )}
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
                        <td data-label="Email Address">{m.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#8A9198' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#3A1F6F', marginBottom: '8px' }}>
                No Groups Assigned Yet
              </h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                You have not been allocated as a guide to any student project groups in the system.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
