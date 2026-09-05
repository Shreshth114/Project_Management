import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const FacultyGroups = () => {
<<<<<<< HEAD
  const { data, currentUser } = useAuth();
  const myGroups = data.groups || [];
=======
  const { currentUser } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      fetchMyGroups(currentUser.faculty_id);
    }
  }, [currentUser]);

  const fetchMyGroups = async (facultyId) => {
    try {
      setLoading(true);
      const teams = await academicService.getTeams({ guide_id: currentUser.faculty_id });
      // Map to expected structure if needed, or use directly
      const mapped = teams.map(t => ({
        id: t.team_id,
        groupCode: t.team_code,
        title: t.subject?.subject_name || "Project",
        members: (t.members || []).map(m => ({ usn: m.usn, name: m.name }))
      }));
      setMyGroups(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
>>>>>>> origin/main

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Evaluated Student Project Groups</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Detailed roster of project teams assigned for faculty evaluation.
        </p>
      </div>

<<<<<<< HEAD
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
=======
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      {loading ? (
        <p>Loading groups...</p>
      ) : myGroups.length === 0 ? (
        <p>You have not been assigned as a guide to any groups yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {myGroups.map((group) => (
            <Card key={group.team_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge variant="navy">{group.team_code}</Badge>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#243143', margin: 0 }}>
                      {group.subject?.subject_name}
                    </h3>
                  </div>
>>>>>>> origin/main
                </div>
              </div>

<<<<<<< HEAD
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
=======
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#243143', marginBottom: '10px' }}>Group Members Roster</h4>
              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Student Name</th>
>>>>>>> origin/main
                    </tr>
                  </thead>
                  <tbody>
                    {group.members?.length > 0 ? (
                      group.members.map((m) => (
                        <tr key={m.student_id}>
                          <td data-label="USN" style={{ fontWeight: 700, color: '#243143' }}>{m.usn}</td>
                          <td data-label="Student Name">{m.name}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No members found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
