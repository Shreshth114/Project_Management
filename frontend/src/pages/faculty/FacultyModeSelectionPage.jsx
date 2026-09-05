import React, { useState } from 'react';
import { UserCheck, ShieldCheck, ArrowRight, Layers, Award, CheckSquare, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const FacultyModeSelectionPage = ({ onSelectMode }) => {
  const { currentUser, switchTeacherRole, data } = useAuth();

  const [notification, setNotification] = useState('');

  // Check if faculty is assigned as coordinator by Admin
  const isAssignedCoordinator = (data.subjects || []).some(
    s => s.coordinator === currentUser?.name || s.coordinator === currentUser?.username
  ) || (currentUser?.teacherRoles && currentUser.teacherRoles.includes('COORDINATOR'));

  const assignedCoordinatorSubjects = (data.subjects || []).filter(
    s => s.coordinator === currentUser?.name || s.coordinator === currentUser?.username
  );

  const handleSelectFacultyMode = () => {
    switchTeacherRole('FACULTY');
    if (onSelectMode) onSelectMode('FACULTY');
  };

  const handleSelectCoordinatorMode = () => {
    if (isAssignedCoordinator) {
      switchTeacherRole('COORDINATOR');
      if (onSelectMode) onSelectMode('COORDINATOR');
    } else {
      setNotification("You are not assigned as coordinator, if any issues contact admin.");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#F8F9FA',
      zIndex: 500,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '820px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Banner Header with Official Gradient */}
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(90deg, #3A1F6F 0%, #9D1B55 50%, #DE3B0B 100%)',
          color: '#FFFFFF',
          padding: '36px 28px',
          borderRadius: '6px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
        }}>
          <Badge variant="magenta" style={{ marginBottom: '12px', backgroundColor: '#FFFFFF', color: '#9D1B55' }}>
            FACULTY & COORDINATOR PORTAL
          </Badge>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Welcome, {currentUser?.name || 'Faculty Member'}!
          </h1>
          <p style={{ fontSize: '14px', color: '#FFFFFF', opacity: 0.9, marginTop: '6px' }}>
            Select your active workspace mode for this academic session:
          </p>
        </div>

        {notification && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#DE3B0B" />
            <span style={{ fontWeight: 700, fontSize: '14px' }}>{notification}</span>
          </div>
        )}

        {/* Workspace Modes Selection Cards */}
        <div className="grid-2">
          {/* Option 1: Faculty / Evaluator Mode */}
          <Card>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              height: '100%',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#F2EEFA',
                  color: '#3A1F6F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <Award size={26} />
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                  Faculty / Evaluator Mode
                </h2>
                <p className="text-muted" style={{ fontSize: '13px', marginTop: '8px', lineHeight: 1.5 }}>
                  Access assigned project batches, review submitted student deliverables, grade individual rubric criteria, award marks, and provide student feedback.
                </p>
              </div>

              <button 
                type="button"
                className="btn btn-purple btn-block"
                style={{ padding: '12px', fontSize: '14px' }}
                onClick={handleSelectFacultyMode}
              >
                <span>ENTER FACULTY EVALUATOR MODE</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </Card>

          {/* Option 2: Coordinator Mode */}
          <Card>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              height: '100%',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#FBF0F5',
                  color: '#9D1B55',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <CheckSquare size={26} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#242044', margin: 0 }}>
                    Coordinator Mode
                  </h2>
                  <Badge variant={isAssignedCoordinator ? 'magenta' : 'info'}>
                    Coordinator Access
                  </Badge>
                </div>

                <p className="text-muted" style={{ fontSize: '13px', marginTop: '8px', lineHeight: 1.5 }}>
                  Manage course subjects, create milestone tasks, set group vs individual submission modes, define deadlines, and gives updates about tasks.
                </p>

                {assignedCoordinatorSubjects.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#3A1F6F', fontWeight: 700 }}>
                    Assigned Subjects: {assignedCoordinatorSubjects.map(s => `${s.code} (${s.branch})`).join(', ')}
                  </div>
                )}
              </div>

              <button 
                type="button"
                className="btn btn-magenta btn-block"
                style={{ padding: '12px', fontSize: '14px' }}
                onClick={handleSelectCoordinatorMode}
              >
                <span>ENTER COORDINATOR GOVERNANCE MODE</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
