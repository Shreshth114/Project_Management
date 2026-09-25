import React, { useEffect, useState } from 'react';
import { Edit, Eye, Key, X, Shield } from 'lucide-react';
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
  const [inspectingUser, setInspectingUser] = useState(null);
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
            style={{ width: '100%', maxWidth: '220px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Account Roles</option>
            <option value="STUDENT">STUDENT</option>
            <option value="FACULTY_ONLY">FACULTY</option>
            <option value="BOTH">FACULTY & COORDINATOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <input
            type="text"
            className="form-input"
            style={{ width: '100%', maxWidth: '240px' }}
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
                      categoryLabel = 'FACULTY';
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
                          onClick={() => setInspectingUser({ ...u, categoryLabel, categoryVariant, subjectGroupLabel })}
                          title="Inspect account credentials"
                        >
                          <Eye size={13} />
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

      {/* Account Inspect Modal */}
      {inspectingUser && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 className="mobile-wrap" style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} />
                <span>Account Governance & Credentials</span>
              </h3>
              <button 
                onClick={() => setInspectingUser(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #E5E5E5', paddingBottom: '12px' }}>
                <div className="mobile-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                      {inspectingUser.name}
                    </h4>
                    <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                      {inspectingUser.email}
                    </div>
                  </div>
                  <Badge variant={inspectingUser.categoryVariant}>{inspectingUser.categoryLabel}</Badge>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div><strong>Username / USN:</strong> <span style={{ color: '#DE3B0B', fontWeight: 700 }}>{inspectingUser.usn || inspectingUser.username}</span></div>
                <div><strong>System User ID:</strong> <span style={{ color: '#55636B', fontFamily: 'monospace' }}>#{inspectingUser.id || inspectingUser.user_id}</span></div>
                <div><strong>Assigned Subject / Course:</strong> <span>{inspectingUser.subjectName ? `${inspectingUser.subjectName} (${inspectingUser.subjectCode || 'Active'})` : (inspectingUser.role === 'ADMIN' ? 'System Administration' : 'Not Assigned')}</span></div>
                
                {inspectingUser.role === 'STUDENT' && (
                  <>
                    <div><strong>Project Team Code:</strong> <span style={{ color: '#3A1F6F', fontWeight: 700 }}>{inspectingUser.teamCode || 'No Team Assigned'}</span></div>
                    <div><strong>Allocated Guide:</strong> <span>{inspectingUser.guideName || 'Not Assigned'}</span></div>
                  </>
                )}

                {(inspectingUser.role === 'FACULTY' || inspectingUser.role === 'TEACHER') && (
                  <>
                    <div><strong>Coordinator Privileges:</strong> <Badge variant={inspectingUser.isCoordinator ? 'success' : 'secondary'}>{inspectingUser.isCoordinator ? 'Yes (Department Coordinator)' : 'No (Standard Guide)'}</Badge></div>
                    <div>
                      <strong>Mentored Project Batches:</strong>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: '#3A1F6F', fontWeight: 600 }}>
                        {teams.filter(t => t.guideName === inspectingUser.name || t.guideId === inspectingUser.faculty_id).length > 0
                          ? teams.filter(t => t.guideName === inspectingUser.name || t.guideId === inspectingUser.faculty_id).map(t => `${t.teamCode} (${t.studentCount} students)`).join(', ')
                          : 'No project batches currently assigned'}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <strong>System Access Privileges:</strong>
                  <div style={{ marginTop: '4px', padding: '8px 12px', background: '#F8F9FA', borderRadius: '4px', fontSize: '13px', color: '#55636B' }}>
                    {inspectingUser.role === 'ADMIN' 
                      ? 'Full administrative governance, database synchronization, master edit access, and user lifecycle control.'
                      : inspectingUser.isCoordinator 
                        ? 'Milestone configuration, department evaluation matrix oversight, and team allocation access.'
                        : inspectingUser.role === 'STUDENT'
                          ? 'Milestone deliverable submissions, project evaluation viewing, and guide message exchanges.'
                          : 'Rubric score evaluation, guide feedback submission, and student deliverable review.'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setInspectingUser(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
