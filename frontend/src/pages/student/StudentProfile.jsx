import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Shield, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const StudentProfile = () => {
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.student_id) {
      loadTeam(currentUser.student_id);
    }
  }, [currentUser]);

  const loadTeam = async (studentId) => {
    try {
      setLoading(true);
      const data = await academicService.getTeamByStudent(studentId);
      setTeam(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Student Profile & Academic Enrolment</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Official VTU student enrolment record linked to system-managed Subject, Batch, and Guide allocations.
        </p>
      </div>

      <div className="grid-3">
        <Card title="Student Credentials">
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
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#B82226', margin: '4px 0' }}>
              USN: {currentUser.usn}
            </div>
            <Badge variant="navy">{currentUser.batch || '2021–2025 (8th Sem)'}</Badge>
          </div>
        </Card>

        <Card title="System Managed Enrolment">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Subject Code:</strong> {team?.subject?.subject_code || 'Unassigned'}</div>
            <div><strong>Academic Batch:</strong> {currentUser.batch || '2021–2025 (8th Sem)'}</div>
            <div><strong>Allocated Guide:</strong> {team?.guide?.name || 'Unassigned'}</div>
            <div><strong>Group Association:</strong> {team?.team_code || 'Unassigned'}</div>
            <div><strong>Leader Status:</strong> Group Member</div>
          </div>
        </Card>

        <Card title="Project Group Overview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div><strong>Group Title:</strong> {team?.subject?.subject_name || 'Project'}</div>
            <div><strong>Domain:</strong> Unspecified</div>
            <div><strong>Submission Mode:</strong> <Badge variant="navy">Digital</Badge></div>
            <div><strong>Overall Status:</strong> <Badge variant="success">Active</Badge></div>
          </div>
        </Card>
      </div>

      <Card title="Contact & Institutional Credentials">
        <div className="grid-2">
          <div>
            <label className="form-label">Official College Email</label>
            <input type="text" className="form-input" value={currentUser.email} disabled />
          </div>
          <div>
            <label className="form-label">Registered Contact Phone</label>
            <input type="text" className="form-input" value={currentUser.phone || "+91 98450 12345"} disabled />
          </div>
        </div>
      </Card>
    </div>
  );
};
