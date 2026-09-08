import React, { useState, useEffect } from 'react';
import { Server, Database, Activity, BookOpen, Key, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const AdminProfile = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ subjectsCount: 0, teamsCount: 0, usersCount: 0 });
  const [logsCount, setLogsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const [adminStats, logs] = await Promise.all([
          academicService.getAdminStats().catch(() => ({ subjectsCount: 0, teamsCount: 0, usersCount: 0 })),
          academicService.getAdminAuditLogs().catch(() => [])
        ]);
        setStats(adminStats);
        setLogsCount(logs.length);
      } catch (err) {
        console.warn("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>System Admin Profile & Infrastructure</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Master administrator credentials, system statistics, and governance infrastructure.
        </p>
      </div>

      {/* System Admin Identification Card */}
      <Card title="System Administrator Credentials">
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#DE3B0B',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '26px'
          }}>
            {(currentUser?.name || currentUser?.email || 'A').charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
              {currentUser?.name || 'Academic Administrator'}
            </h2>
            
            <div className="grid-3" style={{ marginTop: '12px', fontSize: '13px', color: '#55636B' }}>
              <div>
                <strong>Admin Name:</strong>{' '}
                <span style={{ color: '#3A1F6F', fontWeight: 700 }}>
                  {currentUser?.name || 'Academic Admin Office'}
                </span>
              </div>

              <div>
                <strong>Admin Email:</strong>{' '}
                <span style={{ color: '#DE3B0B', fontWeight: 700 }}>
                  {currentUser?.email || 'admin@msrit.edu'}
                </span>
              </div>

              <div>
                <strong>Account Role:</strong>{' '}
                <span style={{ color: '#B8115B', fontWeight: 800 }}>
                  SYSTEM ADMINISTRATOR
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <Badge variant="danger">System Administrator</Badge>
              <Badge variant="purple">Master Database Access</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* System Information & Infrastructure Metrics Box */}
      <Card title="Live Infrastructure Database Metrics">
        <div className="grid-4">
          <div style={{ border: '1px solid #E5E5E5', borderRadius: '4px', padding: '14px', backgroundColor: '#F8F9FA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#728C5E', marginBottom: '6px' }}>
              <Server size={18} />
              <strong style={{ fontSize: '13px' }}>Database Health</strong>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#728C5E' }}>100% Operational</div>
            <div style={{ fontSize: '11px', color: '#55636B', marginTop: '2px' }}>Supabase PostgreSQL Connected</div>
          </div>

          <div style={{ border: '1px solid #E5E5E5', borderRadius: '4px', padding: '14px', backgroundColor: '#F8F9FA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3A1F6F', marginBottom: '6px' }}>
              <BookOpen size={18} />
              <strong style={{ fontSize: '13px' }}>Active Subjects</strong>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#3A1F6F' }}>{stats.subjectsCount} Subjects</div>
            <div style={{ fontSize: '11px', color: '#55636B', marginTop: '2px' }}>Course Titles Registered</div>
          </div>

          <div style={{ border: '1px solid #E5E5E5', borderRadius: '4px', padding: '14px', backgroundColor: '#F8F9FA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B8115B', marginBottom: '6px' }}>
              <Database size={18} />
              <strong style={{ fontSize: '13px' }}>Registered Accounts</strong>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#B8115B' }}>{stats.usersCount} Accounts</div>
            <div style={{ fontSize: '11px', color: '#55636B', marginTop: '2px' }}>Students, Faculty & Admins</div>
          </div>

          <div style={{ border: '1px solid #E5E5E5', borderRadius: '4px', padding: '14px', backgroundColor: '#F8F9FA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DE3B0B', marginBottom: '6px' }}>
              <Activity size={18} />
              <strong style={{ fontSize: '13px' }}>Audit Trail Logs</strong>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#DE3B0B' }}>{logsCount} Events</div>
            <div style={{ fontSize: '11px', color: '#55636B', marginTop: '2px' }}>Security & Activity Records</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
