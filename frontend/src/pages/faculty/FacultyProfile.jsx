import React from 'react';
import { User, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const FacultyProfile = () => {
  const { currentUser, data, switchTeacherRole } = useAuth();
  const isDualRole = currentUser?.teacherRoles?.length > 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Faculty Profile & Credentials</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Official academic designation and faculty advisor record.
        </p>
      </div>

      <div className="grid-3">
        <Card title="Faculty Identification">
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
              {currentUser.name.charAt(0)}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#243143' }}>{currentUser.name}</h2>
            <div style={{ fontSize: '13px', color: '#B82226', fontWeight: 700, margin: '4px 0' }}>
              {currentUser.designation || 'Professor & Project Advisor'}
            </div>
            <Badge variant="navy">Department of CSE</Badge>

            {isDualRole && (
              <div style={{ marginTop: '16px' }}>
                <button 
                  className="btn btn-secondary btn-sm btn-block"
                  onClick={() => switchTeacherRole('COORDINATOR')}
                >
                  Switch View to Coordinator Workspace
                </button>
              </div>
            )}
          </div>
        </Card>

        <Card title="Academic Advising Metrics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Assigned Batches:</strong> 4 Project Groups</div>
            <div><strong>Total Advised Students:</strong> 15 Students</div>
            <div><strong>Max Capacity:</strong> 5 Project Batches</div>
            <div><strong>Domain Specialization:</strong> AI, Machine Learning, Edge Computing</div>
          </div>
        </Card>

        <Card title="Cabin & Contact Office">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Email:</strong> {currentUser.email}</div>
            <div><strong>Cabin Location:</strong> L-304, Tech Tower, MSRIT Campus</div>
            <div><strong>Office Hours:</strong> Mon-Fri (02:00 PM – 04:00 PM)</div>
            <div><strong>Extension:</strong> Ext. 408</div>
          </div>
        </Card>
      </div>
    </div>
  );
};
