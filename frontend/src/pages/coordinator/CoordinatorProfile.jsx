import React from 'react';
import { User, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const CoordinatorProfile = () => {
  const { currentUser, data, switchTeacherRole } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Project Coordinator Profile</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Departmental project governance authority credentials and appointment details.
        </p>
      </div>

      <div className="grid-3">
        <Card title="Coordinator Identification">
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#B82226',
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
              Head Project Coordinator
            </div>
            <Badge variant="navy">Department of CSE</Badge>

            <div style={{ marginTop: '16px' }}>
              <button 
                className="btn btn-secondary btn-sm btn-block"
                onClick={() => switchTeacherRole('FACULTY')}
              >
                <RefreshCw size={13} />
                <span>Switch View to Faculty Workspace</span>
              </button>
            </div>
          </div>
        </Card>

        <Card title="Department Governance Metrics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Department:</strong> Computer Science & Engineering</div>
            <div><strong>Active Batch:</strong> 2021–2025 (8th Semester)</div>
            <div><strong>Total Enrolled Batches:</strong> 36 Groups (144 Students)</div>
            <div><strong>Empanelled Faculty:</strong> 18 Guide Professors</div>
          </div>
        </Card>

        <Card title="Academic Authority Office">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Subject Code:</strong> {data.subjectCode}</div>
            <div><strong>Academic Scheme:</strong> VTU Autonomous 2021 Scheme</div>
            <div><strong>Official Email:</strong> {currentUser.email}</div>
            <div><strong>Office Location:</strong> CSE Departmental Governance Cell</div>
          </div>
        </Card>
      </div>
    </div>
  );
};
