import React, { useState } from 'react';
import { Menu, LogOut, User, RefreshCw, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onToggleMobileDrawer }) => {
  const { currentUser, currentRole, logout, switchTeacherRole, quickSwitchUser } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const isDualRoleTeacher = currentUser && 
    currentUser.role === 'TEACHER' && 
    currentUser.teacherRoles && 
    currentUser.teacherRoles.length > 1;

  return (
    <header className="portal-header">
      <div className="header-brand">
        <button 
          className="btn btn-navy p-2 md:hidden"
          onClick={onToggleMobileDrawer}
          title="Toggle Navigation Menu"
          aria-label="Open Navigation Drawer"
          style={{ padding: '6px', color: '#FFF' }}
        >
          <Menu size={22} />
        </button>

        <div className="college-logo-badge">RIT</div>

        <div>
          <span className="brand-title">MSRIT Project Portal</span>
          <span className="brand-subtitle">Department of Computer Science & Engineering</span>
        </div>
      </div>

      <div className="header-right">
        {/* Role Switcher Pill for Dual-Role Faculty / Coordinator */}
        {isDualRoleTeacher && (
          <div 
            className="role-badge-pill" 
            onClick={() => switchTeacherRole(currentRole === 'FACULTY' ? 'COORDINATOR' : 'FACULTY')}
            title="Click to toggle between Faculty and Coordinator view"
          >
            <RefreshCw size={13} />
            <span>Role: {currentRole} (Switch)</span>
          </div>
        )}

        {!isDualRoleTeacher && currentRole && (
          <div className="role-badge-pill" style={{ cursor: 'default' }}>
            <ShieldCheck size={13} />
            <span>{currentRole}</span>
          </div>
        )}

        {/* Demo Persona Switcher Dropdown for Quick Inspection */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '12px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setShowDemoMenu(!showDemoMenu)}
          >
            <span>Demo Roles</span>
            <ChevronDown size={14} />
          </button>

          {showDemoMenu && (
            <div 
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                width: '210px',
                zIndex: 250,
                padding: '6px 0'
              }}
            >
              <div style={{ padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: '#9F9F9F', textTransform: 'uppercase' }}>
                Quick Persona Demo
              </div>
              <button 
                className="btn btn-block"
                style={{ justifyContent: 'flex-start', padding: '8px 12px', borderRadius: 0, background: 'none', color: '#243143', fontSize: '13px' }}
                onClick={() => { quickSwitchUser('u-student-1', 'STUDENT'); setShowDemoMenu(false); }}
              >
                🎓 Student (Rahul S.)
              </button>
              <button 
                className="btn btn-block"
                style={{ justifyContent: 'flex-start', padding: '8px 12px', borderRadius: 0, background: 'none', color: '#243143', fontSize: '13px' }}
                onClick={() => { quickSwitchUser('u-teacher-1', 'FACULTY'); setShowDemoMenu(false); }}
              >
                👨‍🏫 Faculty (Dr. Sharma)
              </button>
              <button 
                className="btn btn-block"
                style={{ justifyContent: 'flex-start', padding: '8px 12px', borderRadius: 0, background: 'none', color: '#243143', fontSize: '13px' }}
                onClick={() => { quickSwitchUser('u-teacher-1', 'COORDINATOR'); setShowDemoMenu(false); }}
              >
                📋 Coordinator (Dr. Sharma)
              </button>
              <button 
                className="btn btn-block"
                style={{ justifyContent: 'flex-start', padding: '8px 12px', borderRadius: 0, background: 'none', color: '#243143', fontSize: '13px' }}
                onClick={() => { quickSwitchUser('u-admin-1', 'ADMIN'); setShowDemoMenu(false); }}
              >
                🛡️ Admin (Academic Office)
              </button>
            </div>
          )}
        </div>

        {/* Logged in User Meta & Logout */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right', display: 'none', minWidth: '0' }} className="md:block">
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>{currentUser.name}</div>
              <div style={{ fontSize: '11px', color: '#9F9F9F' }}>{currentUser.username}</div>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={logout}
              title="Logout of Portal"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
