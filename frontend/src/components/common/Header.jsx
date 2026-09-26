import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Menu, 
  RefreshCw, 
  ChevronDown,
  LogOut,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RitLogo } from './RitLogo';
import { Badge } from './Badge';

export const Header = ({ onToggleMobileDrawer }) => {
  const { 
    currentUser, 
    activeRole,
    currentRole,
    switchTeacherRole, 
    logout,
    activeTab,
    data,
    setShowModeSelectionLanding
  } = useAuth();
  
  const { theme, toggleTheme } = useTheme();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowDropdown(false);
      }
    };
    if (showNotifications || showDropdown) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showNotifications, showDropdown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Check if faculty is assigned as coordinator by Admin
  const isAssignedCoordinator = currentUser?.is_coordinator ||
    currentUser?.teacherRoles?.includes('COORDINATOR') ||
    (data?.subjects || []).some(
      s => s.coordinator === currentUser?.name || s.coordinator === currentUser?.username
    ) || currentUser?.role === 'COORDINATOR';

  const isTeacher = currentUser?.role === 'TEACHER' || 
                    currentUser?.role === 'FACULTY' || 
                    currentUser?.role === 'COORDINATOR' ||
                    (currentUser?.teacherRoles && currentUser.teacherRoles.length > 0);

  const handleModeToggle = () => {
    setShowModeSelectionLanding(true);
  };

  const circularsList = (data?.messages || []).filter(m => m.category === 'CIRCULAR' || m.senderRole === 'ADMIN');

  const formatTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'groups': return 'Project Teams & Subjects';
      case 'tasks': return 'Academic Milestones & Tasks';
      case 'create-task': return 'Create & Publish Milestone Task';
      case 'submissions': return 'Student Submissions Queue';
      case 'evaluation': return 'Faculty Rubric Evaluations';
      case 'status': return 'Compliance & Status Matrix';
      case 'messages': return 'Messages & Communication';
      case 'subjects': return 'Subject & Coordinator Governance';
      case 'users': return 'Registered Accounts Directory';
      case 'logs': return 'Security & Event Audit Logs';
      case 'master-edit': return 'Master Edit & Deadlines Control';
      case 'profile': return 'User Profile & Enrolments';
      default: return 'Portal Overview';
    }
  };

  return (
    <>
    <header className="portal-header">
      <div className="header-brand">
        <button 
          className="btn btn-secondary btn-sm mobile-menu-btn" 
          onClick={onToggleMobileDrawer}
          style={{ padding: '6px 10px' }}
          id="mobile-menu-btn"
        >
          <Menu size={18} />
        </button>

        <RitLogo size="small" light={true} />
      </div>

      <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-inverse)' }}>
          {formatTitle(activeTab)}
        </span>

        {currentUser?.department && (
          <Badge variant="magenta" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--rit-magenta)' }}>
            {currentUser.department} Dept
          </Badge>
        )}
      </div>

      <div className="header-right">
        {/* Desktop Segmented Mode Switcher */}
        {isTeacher && isAssignedCoordinator && (
          <div className="segmented-control mobile-hide">
            <button
              className={`segmented-btn ${activeRole === 'FACULTY' ? 'active' : ''}`}
              onClick={() => {
                if (activeRole !== 'FACULTY') handleModeToggle();
              }}
            >
              Faculty
            </button>
            <button
              className={`segmented-btn ${activeRole === 'COORDINATOR' ? 'active' : ''}`}
              onClick={() => {
                if (activeRole !== 'COORDINATOR') handleModeToggle();
              }}
            >
              Coordinator
            </button>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            color: 'var(--text-inverse)',
            transition: 'color 0.2s'
          }}
          title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications & System Circulars Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
            title="System Circulars & Notifications"
          >
            <Bell size={20} color="#FFFFFF" />
            <span style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              backgroundColor: '#DE3B0B',
              color: 'var(--text-inverse)',
              fontSize: '10px',
              fontWeight: 800,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {circularsList.length || 0}
            </span>
          </button>

          {/* Notifications Popover Window */}
          {showNotifications && (
            <>
              {/* Invisible Overlay for click-outside-to-close */}
              <div 
                onClick={() => setShowNotifications(false)}
                style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  zIndex: 290,
                  cursor: 'default'
                }}
              />
              <div className="notification-modal" style={{
              position: 'absolute',
              top: '44px',
              right: '0px',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              borderRadius: '6px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              border: '1px solid var(--border-subtle)',
              width: '340px',
              zIndex: 300,
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #8E00A8 0%, #B8115B 50%, #E63B00 100%)',
                color: 'var(--text-inverse)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'flex-start', gap: '6px', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                  <Bell size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ wordBreak: 'break-word' }}>Official System Circulars</span>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-inverse)', cursor: 'pointer', flexShrink: 0, marginLeft: '10px' }}
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: circularsList.length === 0 ? '0' : '8px 0' }}>
                {circularsList.length === 0 ? (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-page)'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                      No new notifications
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>
                      You're all caught up!
                    </div>
                  </div>
                ) : (
                  circularsList.map(item => (
                    <div 
                      key={item.id}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--rit-orange-red)' }}>
                          📢 OFFICIAL CIRCULAR
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>{item.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)' }}>{item.subject}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>{item.content}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-disabled)', marginTop: '4px' }}>From: Admin Office</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={profileDropdownRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#B8115B',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px'
            }}>
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="mobile-hide" style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{currentUser?.name || 'User'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-sidebar)' }}>{activeRole}</div>
            </div>
            <ChevronDown className="mobile-hide" size={14} color="#D1D5DB" />
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid var(--border-subtle)',
              width: '210px',
              maxWidth: 'calc(100vw - 32px)',
              zIndex: 250,
              padding: '8px 0'
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-heading)', wordBreak: 'break-word' }}>{currentUser?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
              </div>

              <button 
                onClick={() => { setShowDropdown(false); logout(); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--rit-orange-red)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Mobile Segmented Mode Switcher */}
    {isTeacher && isAssignedCoordinator && (
      <div className="desktop-hide" style={{ padding: '10px 16px', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', zIndex: 100 }}>
        <div className="segmented-control dark">
          <button
            className={`segmented-btn ${activeRole === 'FACULTY' ? 'active' : ''}`}
            onClick={() => {
              if (activeRole !== 'FACULTY') handleModeToggle();
            }}
          >
            Faculty
          </button>
          <button
            className={`segmented-btn ${activeRole === 'COORDINATOR' ? 'active' : ''}`}
            onClick={() => {
              if (activeRole !== 'COORDINATOR') handleModeToggle();
            }}
          >
            Coordinator
          </button>
        </div>
      </div>
    )}
    </>
  );
};
