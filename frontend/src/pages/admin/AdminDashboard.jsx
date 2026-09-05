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
        backgroundColor: '#3A1F6F',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '6px',
        borderLeft: '6px solid #DE3B0B'
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          System Administrator Control Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: '#E0D6F5', marginTop: '4px' }}>
          Academic Governance & Institutional Database Administration — MSRIT
        </p>
      </div>

      <div className="grid-4">
        <Card title="Registered System Users">
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#3A1F6F' }}>{stats.usersCount} Accounts</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Students, Faculty, Coordinators</div>
        </Card>

        <Card title="Active Course Subjects">
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#2B7094' }}>{stats.subjectsCount} Subjects</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Major Project & Seminars</div>
        </Card>

        <Card title="System Health Status">
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#728C5E' }}>{stats.teamsCount} Teams</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Database sync active</div>
        </Card>

        <Card title="Audit Logs Recorded">
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#DE3B0B' }}>{auditLogs.length} Events</div>
          <div style={{ fontSize: '12px', color: '#55636B', marginTop: '4px' }}>Security & Upload logs</div>
        </Card>
      </div>

      <div className="grid-2">
        {/* System User Directory Overview table (Department column removed per section 5 rule) */}
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
                  <th>Role Category</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{u.username}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td><Badge variant="purple">{u.role}</Badge></td>
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
                  <strong style={{ color: '#DE3B0B' }}>[{log.action}]</strong>
                  <span style={{ fontSize: '11px', color: '#8A9198' }}>{log.timestamp}</span>
                </div>
                <div style={{ color: '#55636B' }}>{log.details || 'No details recorded'} (User ID: {log.user_id})</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
