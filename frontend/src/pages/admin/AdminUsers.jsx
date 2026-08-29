import React, { useState } from 'react';
import { UserPlus, Shield, Trash2, Edit, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminUsers = () => {
  const { data } = useAuth();
  const [usersList, setUsersList] = useState(data.users);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filtered = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.username.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
            style={{ width: '160px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Account Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers (Faculty/Coord)</option>
            <option value="ADMIN">Admins</option>
          </select>

          <input
            type="text"
            className="form-input"
            style={{ width: '220px' }}
            placeholder="Search name, USN, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* System Managed Guides & Batches Quick Table */}
      <div className="grid-2">
        <Card title="System Managed Faculty Guides">
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Guide Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {data.facultyGuides.map((g) => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 700, color: '#243143' }}>{g.name}</td>
                    <td>{g.email}</td>
                    <td>{g.designation}</td>
                    <td><Badge variant="navy">{g.department}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="System Academic Batches">
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Batch Title</th>
                  <th>Semester</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.batches.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700, color: '#243143' }}>{b.title}</td>
                    <td>8th Semester CSE</td>
                    <td><Badge variant={b.status === 'Active' ? 'success' : 'navy'}>{b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

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
                <th>Teacher Sub-Roles</th>
                <th>Subject / Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td data-label="Username / USN" style={{ fontWeight: 700, color: '#243143' }}>{u.username}</td>
                  <td data-label="Full Name">{u.name}</td>
                  <td data-label="Email Address">{u.email}</td>
                  <td data-label="Account Category"><Badge variant="navy">{u.role}</Badge></td>
                  <td data-label="Teacher Sub-Roles" style={{ fontSize: '13px' }}>
                    {u.teacherRoles ? u.teacherRoles.join(' & ') : 'N/A'}
                  </td>
                  <td data-label="Subject / Group" style={{ fontSize: '13px' }}>
                    {u.groupId ? `${u.groupId} (${u.subject || '21CSP81'})` : u.department || 'Academic Admin'}
                  </td>
                  <td data-label="Actions">
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => alert(`Editing permissions for ${u.name}`)}
                    >
                      <Edit size={13} />
                      <span>Edit Account</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
