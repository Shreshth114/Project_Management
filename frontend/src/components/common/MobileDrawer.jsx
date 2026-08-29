import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNavItemsByRole } from './Sidebar';

export const MobileDrawer = ({ isOpen, onClose }) => {
  const { currentRole, activeTab, setActiveTab, currentUser, switchTeacherRole } = useAuth();
  const navItems = getNavItemsByRole(currentRole);

  if (!isOpen) return null;

  const isDualRoleTeacher = currentUser && 
    currentUser.role === 'TEACHER' && 
    currentUser.teacherRoles && 
    currentUser.teacherRoles.length > 1;

  return (
    <>
      <div className="mobile-drawer-overlay" onClick={onClose} />
      <div className="mobile-drawer">
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: '#1E2837'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#FFF' }}>MSRIT Portal</div>
            <div style={{ fontSize: '12px', color: '#9F9F9F' }}>{currentRole} Menu</div>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onClose}
            style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#FFF' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Dual Role Switcher inside Mobile Drawer */}
        {isDualRoleTeacher && (
          <div style={{ padding: '12px 16px', background: '#17212F', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              className="btn btn-primary btn-block btn-sm"
              onClick={() => {
                switchTeacherRole(currentRole === 'FACULTY' ? 'COORDINATOR' : 'FACULTY');
                onClose();
              }}
            >
              Switch Role to {currentRole === 'FACULTY' ? 'Coordinator' : 'Faculty'}
            </button>
          </div>
        )}

        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          <ul style={{ listStyle: 'none' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(item.id);
                      onClose();
                    }}
                    style={{ padding: '14px 20px' }}
                  >
                    <Icon className="icon" />
                    <span style={{ fontSize: '15px' }}>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: '#9F9F9F' }}>
          <div>Logged in as: <strong>{currentUser?.name}</strong></div>
          <div>USN/ID: {currentUser?.username}</div>
        </div>
      </div>
    </>
  );
};
