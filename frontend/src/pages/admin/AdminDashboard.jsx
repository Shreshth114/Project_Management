import React, { useEffect, useState } from 'react';
import { Shield, BookOpen, Users, History, Settings, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const AdminDashboard = () => {
  const { setActiveTab } = useAuth();
  const [stats, setStats] = useState({ subjectsCount: 0, teamsCount: 0, usersCount: 0 });
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [adminStats, directory, logs] = await Promise.all([
          academicService.getAdminStats(),
          academicService.getAdminUserDirectory(),
          academicService.getAdminAuditLogs()
        ]);

        setStats(adminStats);
        setUsers(directory.users || []);
        setAuditLogs(logs);
      } catch (error) {
        console.error('Admin dashboard load failed:', error);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        backgroundColor: '#243143',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '4px',
        borderLeft: '6px solid #B82226'
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          System Administrator Control Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: '#D1D5DB', marginTop: '4px' }}>
          Academic Governance & Institutional Database Administration — MSRIT
        </p>
      </div>

      <div className="grid-4">
        <Card title="Registered System Users">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#243143' }}>{stats.usersCount} Accounts</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Across all institutional roles</div>
        </Card>

        <Card title="Active Course Subjects">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#114C94' }}>{stats.subjectsCount} Subjects</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Major Project & Seminars</div>
        </Card>

        <Card title="Active Teams">
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#038203' }}>{stats.teamsCount} Teams</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Database sync active</div>
        </Card>

        <Card title="Audit Logs Recorded">
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#B82226' }}>{auditLogs.length} Events</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Recent database records</div>
        </Card>
      </div>

      <div className="grid-2">
        <Card 
          title="System User Directory Overview"
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('users')}>
              Manage All Users
            </button>
          }
        >
          <div className="table-container">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Username / USN</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700, color: '#243143' }}>{u.username}</td>
                    <td>{u.name}</td>
                    <td><Badge variant="navy">{u.role}</Badge></td>
                    <td>{u.department || 'Academic Admin'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Recent System Activity Audit Log">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.length === 0 && (
              <div style={{ color: '#666', fontSize: '13px' }}>No audit activity recorded.</div>
            )}
            {auditLogs.map((log) => (
              <div 
                key={log.log_id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  padding: '10px 12px',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <strong style={{ color: '#B82226' }}>[{log.action}]</strong>
                  <span style={{ fontSize: '11px', color: '#9F9F9F' }}>{log.timestamp}</span>
                </div>
                <div style={{ color: '#444' }}>{log.details || 'No details recorded'} (User ID: {log.user_id})</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
