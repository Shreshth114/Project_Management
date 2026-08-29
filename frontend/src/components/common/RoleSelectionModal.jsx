import React from 'react';
import { UserCheck, ClipboardList, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from './Modal';

export const RoleSelectionModal = () => {
  const { showRoleSelectionModal, setShowRoleSelectionModal, switchTeacherRole, currentUser } = useAuth();

  return (
    <Modal
      isOpen={showRoleSelectionModal}
      onClose={() => setShowRoleSelectionModal(false)}
      title="Select Your Working Role"
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          backgroundColor: '#E8F1FB', 
          color: '#114C94', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 16px' 
        }}>
          <Shield size={28} />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#243143', marginBottom: '6px' }}>
          Welcome back, {currentUser?.name}
        </h2>
        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
          Your account holds multi-role academic responsibilities. Select the workspace view you wish to access for this session:
        </p>

        <div className="grid-2" style={{ gap: '16px' }}>
          <div 
            onClick={() => switchTeacherRole('FACULTY')}
            style={{
              border: '2px solid #E5E5E5',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#B82226';
              e.currentTarget.style.backgroundColor = '#FDF8F8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E5E5';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <div style={{ color: '#B82226', marginBottom: '10px' }}>
              <UserCheck size={32} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#243143', marginBottom: '4px' }}>Faculty Workspace</h3>
            <p style={{ fontSize: '12px', color: '#666' }}>
              View assigned project groups, evaluate submissions, give rubrics marks & advice.
            </p>
            <button className="btn btn-primary btn-sm btn-block" style={{ marginTop: '14px' }}>
              Enter as Faculty
            </button>
          </div>

          <div 
            onClick={() => switchTeacherRole('COORDINATOR')}
            style={{
              border: '2px solid #E5E5E5',
              borderRadius: '6px',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#243143';
              e.currentTarget.style.backgroundColor = '#F4F6F8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E5E5';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <div style={{ color: '#243143', marginBottom: '10px' }}>
              <ClipboardList size={32} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#243143', marginBottom: '4px' }}>Coordinator Workspace</h3>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Define milestone deadlines, set evaluation criteria, manage department groups.
            </p>
            <button className="btn btn-navy btn-sm btn-block" style={{ marginTop: '14px' }}>
              Enter as Coordinator
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
