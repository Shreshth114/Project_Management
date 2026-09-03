import React, { useEffect, useState } from 'react';
import { academicService } from '../../services/academicService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

const normalizeSearch = (value = '') => value.trim().toLowerCase();

const matchesSearch = (item, searchTerm) => {
  const value = normalizeSearch(searchTerm);
  if (!value) return true;

  const haystacks = [
    item.name,
    item.username,
    item.usn,
    item.email,
    item.teamCode,
    item.subjectCode,
    item.subjectName,
    item.guideName,
    item.role,
    item.teacherRoles?.join(' ')
  ];

  return haystacks.some((entry) => String(entry || '').toLowerCase().includes(value));
};

export const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTeams, setExpandedTeams] = useState({});

  useEffect(() => {
    let ignore = false;

    const loadDirectory = async () => {
      try {
        setLoading(true);
        const data = await academicService.getAdminUserDirectory();

        if (ignore) return;

        setTeams(data.teams || []);
        setStudents(data.students || []);
        setFaculty(data.faculty || []);
        setAdmins(data.admins || []);
        setError('');
      } catch (err) {
        if (!ignore) {
          setError('Unable to load admin user directory.');
          console.error('AdminUsers directory load failed:', err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDirectory();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleTeams = teams.filter((team) => matchesSearch(team, search));
  const visibleStudents = students.filter((student) => {
    const matchesRole = roleFilter === 'ALL' || roleFilter === 'STUDENT';
    return matchesRole && matchesSearch(student, search);
  });
  const visibleFaculty = faculty.filter((person) => {
    const matchesRole = roleFilter === 'ALL' || roleFilter === 'FACULTY';
    return matchesRole && matchesSearch(person, search);
  });
  const visibleAdmins = admins.filter((admin) => {
    const matchesRole = roleFilter === 'ALL' || roleFilter === 'ADMIN';
    return matchesRole && matchesSearch(admin, search);
  });

  const showStudents = roleFilter === 'ALL' || roleFilter === 'STUDENT';
  const showFaculty = roleFilter === 'ALL' || roleFilter === 'FACULTY';
  const showAdmins = roleFilter === 'ALL' || roleFilter === 'ADMIN';

  const toggleTeam = (teamId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Master Account Directory & Role Management</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            System administration table for Students, Faculty Advisors, Project Coordinators, and System Admins.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Users</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admins</option>
          </select>

          <input
            type="text"
            className="form-input"
            style={{ width: '240px' }}
            placeholder="Search name, USN, email, team, subject, guide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <Card title="Admin Users Directory">
          <div style={{ padding: '20px', color: '#243143' }}>Loading user directory...</div>
        </Card>
      )}

      {!loading && error && (
        <Card title="Admin Users Directory">
          <div style={{ padding: '20px', color: '#b42318' }}>{error}</div>
        </Card>
      )}

      {!loading && !error && (
        <>
          <Card title="System Academic Teams / Batches">
            <div className="table-container">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Team / Batch</th>
                    <th>Subject</th>
                    <th>Guide</th>
                    <th>Number of Students</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTeams.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>No teams found.</td>
                    </tr>
                  ) : (
                    visibleTeams.map((team) => (
                      <React.Fragment key={team.team_id}>
                        <tr>
                          <td style={{ fontWeight: 700, color: '#243143' }}>{team.teamCode || 'Unassigned team'}</td>
                          <td>{team.subjectName || team.subjectCode || 'Not assigned'}</td>
                          <td>{team.guideName || 'Not assigned'}</td>
                          <td>{team.studentCount}</td>
                          <td>
                            <button className="btn btn-secondary btn-sm" onClick={() => toggleTeam(team.team_id)}>
                              {expandedTeams[team.team_id] ? 'Hide' : 'Show'}
                            </button>
                          </td>
                        </tr>

                        {expandedTeams[team.team_id] && (
                          <tr>
                            <td colSpan="5" style={{ background: '#f7f9fb' }}>
                              <div style={{ padding: '12px 0' }}>
                                <div style={{ fontWeight: 700, marginBottom: '8px', color: '#243143' }}>Students in this team</div>
                                {team.students.length === 0 ? (
                                  <div style={{ color: '#666' }}>No students assigned.</div>
                                ) : (
                                  <table className="portal-table" style={{ width: '100%' }}>
                                    <thead>
                                      <tr>
                                        <th>USN</th>
                                        <th>Name</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {team.students.map((student) => (
                                        <tr key={student.student_id}>
                                          <td>{student.usn}</td>
                                          <td>{student.name}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {showStudents && (
            <Card title="Students">
              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Team / Batch</th>
                      <th>Subject</th>
                      <th>Guide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleStudents.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: '#666' }}>No students found.</td>
                      </tr>
                    ) : (
                      visibleStudents.map((student) => (
                        <tr key={student.id}>
                          <td data-label="USN" style={{ fontWeight: 700, color: '#243143' }}>{student.usn || 'N/A'}</td>
                          <td data-label="Name">{student.name || 'Unknown student'}</td>
                          <td data-label="Email">{student.email}</td>
                          <td data-label="Team / Batch">{student.teamCode || 'Not assigned'}</td>
                          <td data-label="Subject">{student.subjectCode || student.subjectName || 'Not assigned'}</td>
                          <td data-label="Guide">{student.guideName || 'Not assigned'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {showFaculty && (
            <Card title="Faculty">
              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Coordinator Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleFaculty.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>No faculty found.</td>
                      </tr>
                    ) : (
                      visibleFaculty.map((person) => (
                        <tr key={person.id}>
                          <td data-label="Name" style={{ fontWeight: 700, color: '#243143' }}>{person.name}</td>
                          <td data-label="Email">{person.email}</td>
                          <td data-label="Subject">{person.subjectCode || person.subjectName || 'Not assigned'}</td>
                          <td data-label="Coordinator Status">
                            {person.isCoordinator ? (
                              <Badge variant="success">COORDINATOR</Badge>
                            ) : (
                              <Badge variant="navy">FACULTY</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {showAdmins && (
            <Card title="Admins">
              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Name / Identifier</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAdmins.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: '#666' }}>No admins found.</td>
                      </tr>
                    ) : (
                      visibleAdmins.map((admin) => (
                        <tr key={admin.id}>
                          <td data-label="Name / Identifier" style={{ fontWeight: 700, color: '#243143' }}>{admin.name || 'System Administrator'}</td>
                          <td data-label="Email">{admin.email}</td>
                          <td data-label="Role">
                            <Badge variant="navy">{admin.role}</Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
