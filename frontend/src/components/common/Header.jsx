import React, { useState } from 'react';
import { Menu, LogOut, User, RefreshCw, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onToggleMobileDrawer }) => {
  const { currentUser, currentRole, logout, switchTeacherRole } = useAuth();
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
