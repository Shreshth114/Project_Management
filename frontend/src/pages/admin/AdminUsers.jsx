import React, { useState } from 'react';
import { Edit, Eye, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminUsers = () => {
  const { data } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filtered = (data.users || []).filter(u => {
    const matchesSearch = (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
                          (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
                          (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
                          (u.usn && u.usn.toLowerCase().includes(search.toLowerCase()));
    
    let matchesRole = true;
    if (roleFilter === 'STUDENT') matchesRole = u.role === 'STUDENT';
    else if (roleFilter === 'FACULTY_ONLY') matchesRole = u.role === 'TEACHER' && u.teacherRoles?.length === 1 && u.teacherRoles.includes('FACULTY');
    else if (roleFilter === 'BOTH') matchesRole = u.role === 'TEACHER' && u.teacherRoles?.includes('COORDINATOR');
    else if (roleFilter === 'ADMIN') matchesRole = u.role === 'ADMIN';

    return matchesSearch && matchesRole;
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
            placeholder="Search name, USN, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Academic Batches Roster */}
      <Card title="Academic Batches Roster">
        <div className="table-container">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Academic Semester</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 800, color: '#DE3B0B' }}>Batch 1</td>
                <td style={{ fontWeight: 600 }}>8th Semester CSE</td>
                <td><Badge variant="success">Active</Badge></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 800, color: '#3A1F6F' }}>Batch 2</td>
                <td style={{ fontWeight: 600 }}>6th Semester CSE</td>
                <td><Badge variant="purple">Upcoming</Badge></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 800, color: '#3A1F6F' }}>Batch 3</td>
                <td style={{ fontWeight: 600 }}>4th Semester CSE</td>
                <td><Badge variant="purple">Upcoming</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Full Accounts Table */}
      <Card title="All Registered Accounts Directory">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Username / USN</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Account Category</th>
                <th>Account Password</th>
                <th>Subject / Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                // Determine specific Account Category label
                let categoryLabel = 'STUDENT';
                let categoryVariant = 'info';

                if (u.role === 'ADMIN') {
                  categoryLabel = 'ADMINISTRATOR';
                  categoryVariant = 'danger';
                } else if (u.role === 'TEACHER' || u.role === 'FACULTY' || u.role === 'COORDINATOR') {
                  const isBoth = (u.teacherRoles && u.teacherRoles.includes('COORDINATOR')) ||
                                 (data.subjects || []).some(s => s.coordinator === u.name || s.coordinator === u.username);
                  if (isBoth) {
                    categoryLabel = 'FACULTY & COORDINATOR';
                    categoryVariant = 'magenta';
                  } else {
                    categoryLabel = 'JUST FACULTY';
                    categoryVariant = 'purple';
                  }
                }

                // Determine Subject / Group display (for faculty show subjects assigned or evaluating!)
                let subjectGroupLabel = '';
                if (u.role === 'STUDENT') {
                  subjectGroupLabel = `${u.groupName || u.groupId || 'Group G01'} (${u.subject || '21CSP81'})`;
                } else if (u.role === 'ADMIN') {
                  subjectGroupLabel = 'System Academic Governance';
                } else {
                  // Faculty -> Show assigned or evaluated subjects!
                  subjectGroupLabel = u.assignedSubjects && u.assignedSubjects.length > 0 
                    ? u.assignedSubjects.join(', ')
                    : '21CSP81 - Major Project Phase - II';
                }

                return (
                  <tr key={u.id}>
                    <td data-label="Username / USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{u.usn || u.username}</td>
                    <td data-label="Full Name" style={{ fontWeight: 600 }}>{u.name}</td>
                    <td data-label="Email Address">{u.email}</td>
                    
                    {/* Account Category Column: FACULTY & COORDINATOR / JUST FACULTY / STUDENT */}
                    <td data-label="Account Category">
                      <Badge variant={categoryVariant}>{categoryLabel}</Badge>
                    </td>

                    {/* Account Password Column */}
                    <td data-label="Account Password" style={{ fontWeight: 700, color: '#B8115B', fontFamily: 'monospace' }}>
                      {u.password || 'student123'}
                    </td>

                    {/* Subject / Group Column: Shows assigned/evaluated subjects for faculty */}
                    <td data-label="Subject / Group" style={{ fontSize: '13px', fontWeight: 600, color: '#3A1F6F' }}>
                      {subjectGroupLabel}
                    </td>

                    <td data-label="Actions">
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => alert(`Editing credentials and permissions for ${u.name}`)}
                      >
                        <Edit size={13} />
                        <span>Edit Account</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
