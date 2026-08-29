import React from 'react';
import { Shield, Mail, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminProfile = () => {
  const { currentUser } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Administrator Profile</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Head of Academic Governance system administration credentials.
        </p>
      </div>

      <div className="grid-3">
        <Card title="System Admin Identification">
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#243143',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '24px',
              margin: '0 auto 12px'
            }}>
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#243143' }}>{currentUser.name}</h2>
            <div style={{ fontSize: '13px', color: '#B82226', fontWeight: 700, margin: '4px 0' }}>
              Academic Systems Administrator
            </div>
            <Badge variant="navy">Root Governance Rights</Badge>
          </div>
        </Card>

        <Card title="System Privileges">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Master User Control:</strong> Granted</div>
            <div><strong>Subject Code Editor:</strong> Granted</div>
            <div><strong>Audit Log Inspector:</strong> Granted</div>
            <div><strong>Database Backup & Override:</strong> Granted</div>
          </div>
        </Card>

        <Card title="Institutional Office">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Institution:</strong> M. S. Ramaiah Institute of Technology</div>
            <div><strong>Office:</strong> Office of the Controller of Examinations</div>
            <div><strong>Email:</strong> admin@msrit.edu</div>
            <div><strong>System Environment:</strong> Production v2.4</div>
          </div>
        </Card>
      </div>
    </div>
  );
};
