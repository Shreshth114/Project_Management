import React, { useEffect, useState } from 'react';
import { Edit, Eye, Key } from 'lucide-react';
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
  const [allUsers, setAllUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadDirectory = async () => {
      try {
        setLoading(true);
        const data = await academicService.getAdminUserDirectory();

        if (ignore) return;

        setAllUsers(data.users || []);
        setTeams(data.teams || []);
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

  const filtered = allUsers.filter(u => {
    const matches = matchesSearch(u, search);

    let matchesRole = true;
    if (roleFilter === 'STUDENT') {
      matchesRole = u.role === 'STUDENT';
    } else if (roleFilter === 'FACULTY_ONLY') {
      matchesRole = (u.role === 'FACULTY' || u.role === 'TEACHER') && !u.isCoordinator;
    } else if (roleFilter === 'BOTH') {
      matchesRole = (u.role === 'FACULTY' || u.role === 'TEACHER') && u.isCoordinator;
    } else if (roleFilter === 'ADMIN') {
      matchesRole = u.role === 'ADMIN';
    }

    return matches && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Master Account Directory & Governance</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            System administration directory for Students, Faculty, Coordinators, and Admins.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: '220px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Account Roles</option>
            <option value="STUDENT">STUDENT</option>
            <option value="FACULTY_ONLY">JUST FACULTY</option>
            <option value="BOTH">FACULTY & COORDINATOR</option>
            <option value="ADMIN">ADMIN</option>
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

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Active Project Teams Summary */}
      <Card title="Active Project Groups Summary">
        {teams.length === 0 ? (
          <p style={{ padding: '12px', color: '#888' }}>No registered project teams found.</p>
        ) : (
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Team Code</th>
                  <th>Course Title</th>
                  <th>Assigned Guide</th>
                  <th>Student Members</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.team_id}>
                    <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{t.teamCode}</td>
                    <td style={{ fontWeight: 600 }}>{t.subjectName || t.subjectCode || 'Major Project'}</td>
                    <td style={{ fontWeight: 600, color: '#3A1F6F' }}>{t.guideName || 'Unassigned'}</td>
                    <td><Badge variant="purple">{t.studentCount} Students</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Full Accounts Table */}
      <Card title="All Registered Accounts Directory">
        {loading ? (
          <p style={{ padding: '16px' }}>Loading accounts directory...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: '16px', color: '#888' }}>No accounts matched the selected filter.</p>
        ) : (
          <div className="table-container responsive-table-stack">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Username / USN</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Account Category</th>
                  <th>Subject / Project Group</th>
                  <th>Guide</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  let categoryLabel = 'STUDENT';
                  let categoryVariant = 'info';

                  if (u.role === 'ADMIN') {
                    categoryLabel = 'ADMINISTRATOR';
                    categoryVariant = 'danger';
                  } else if (u.role === 'TEACHER' || u.role === 'FACULTY' || u.role === 'COORDINATOR') {
                    if (u.isCoordinator) {
                      categoryLabel = 'FACULTY & COORDINATOR';
                      categoryVariant = 'magenta';
                    } else {
                      categoryLabel = 'JUST FACULTY';
                      categoryVariant = 'purple';
                    }
                  }

                  let subjectGroupLabel = '-';
                  if (u.role === 'STUDENT') {
                    subjectGroupLabel = `${u.teamCode || 'No Team'} (${u.subjectCode || u.subjectName || 'Course'})`;
                  } else if (u.role === 'ADMIN') {
                    subjectGroupLabel = 'System Administration';
                  } else {
                    subjectGroupLabel = u.subjectName || u.subjectCode || 'Academic Faculty';
                  }

                  return (
                    <tr key={u.id || u.user_id}>
                      <td data-label="Username / USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>
                        {u.usn || u.username}
                      </td>
                      <td data-label="Full Name" style={{ fontWeight: 600 }}>{u.name}</td>
                      <td data-label="Email Address">{u.email}</td>
                      
                      <td data-label="Account Category">
                        <Badge variant={categoryVariant}>{categoryLabel}</Badge>
                      </td>

                      <td data-label="Subject / Project Group" style={{ fontSize: '13px', fontWeight: 600, color: '#3A1F6F' }}>
                        {subjectGroupLabel}
                      </td>

                      <td data-label="Guide" style={{ fontSize: '13px' }}>
                        {u.guideName || '-'}
                      </td>

                      <td data-label="Actions">
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => alert(`Credentials & permissions for ${u.name}`)}
                        >
                          <Edit size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
