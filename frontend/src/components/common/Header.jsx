import React, { useState } from 'react';
import { 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  RefreshCw, 
  CheckCircle, 
  ChevronDown,
  Shield,
  Layers,
  BookOpen,
  MessageSquare,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RitLogo } from './RitLogo';
import { Badge } from './Badge';

export const Header = ({ onToggleMobileDrawer }) => {
  const { 
    currentUser, 
    activeRole, 
    switchTeacherRole, 
    logout,
    activeTab,
    data
  } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check if faculty user is assigned as coordinator by Admin
  const isAssignedCoordinator = (data.subjects || []).some(
    s => s.coordinator === currentUser?.name || s.coordinator === currentUser?.username
  ) || currentUser?.role === 'COORDINATOR';

  const isTeacher = currentUser?.role === 'TEACHER' || 
                    currentUser?.role === 'FACULTY' || 
                    currentUser?.role === 'COORDINATOR' ||
                    (currentUser?.teacherRoles && currentUser.teacherRoles.length > 0);

  // Circulars broadcast by Admin/Coordinator
  const circularsList = (data.messages || []).filter(m => m.category === 'CIRCULAR' || m.senderRole === 'ADMIN' || m.senderRole === 'COORDINATOR');

  const formatTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'project': case 'projects': case 'groups': return 'Project & Team Management';
      case 'tasks': return 'Academic Milestones & Tasks';
      case 'create-task': return 'Create & Assign Task';
      case 'submissions': return 'Student Submissions Queue';
      case 'evaluation': case 'evaluations': return 'Individual Evaluation Rubrics';
      case 'status': return 'Status & Marks Transcript';
      case 'messages': return 'Direct Messages';
      case 'subjects': return 'Subject & Branch Governance';
      case 'users': return 'User Access Directory';
      case 'logs': return 'Audit Logs & Activity';
      case 'profile': return 'User Profile Settings';
      default: return 'Portal Overview';
    }
  };

  return (
    <header className="portal-header">
      <div className="header-brand">
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onToggleMobileDrawer}
          style={{ display: 'none', padding: '6px 10px' }}
          id="mobile-menu-btn"
        >
          <Menu size={18} />
        </button>

        <RitLogo size="small" light={true} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>
          {formatTitle(activeTab)}
        </span>

        {currentUser?.branch && (
          <Badge variant="purple" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', borderColor: 'transparent' }}>
            {currentUser.branch} Dept
          </Badge>
        )}
      </div>

      <div className="header-right">
        {/* Mode Switcher Pill: Rendered ONLY if Faculty is actually assigned as Coordinator */}
        {isTeacher && isAssignedCoordinator && (
          <button 
            className="role-mode-switcher"
            onClick={() => switchTeacherRole(activeRole === 'FACULTY' ? 'COORDINATOR' : 'FACULTY')}
            title="Toggle between Evaluator and Coordinator workspaces"
          >
            <RefreshCw size={13} />
            <span>Mode: {activeRole === 'COORDINATOR' ? 'Coordinator Mode' : 'Faculty Mode'}</span>
          </button>
        )}

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
            title="Notifications & Official System Circulars"
          >
            <Bell size={20} color="#FFFFFF" />
            <span style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              backgroundColor: '#DE3B0B',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {circularsList.length || 2}
            </span>
          </button>

          {/* Notifications Popover Window */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: '-60px',
              backgroundColor: '#FFFFFF',
              color: '#242044',
              borderRadius: '6px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              border: '1px solid #E5E5E5',
              width: '340px',
              zIndex: 300,
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: '#3A1F6F',
                color: '#FFFFFF',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={15} />
                  <span>System Circulars & Notifications</span>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px 0' }}>
                {circularsList.map(item => (
                  <div 
                    key={item.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #F0F0F0',
                      backgroundColor: item.isUnread ? '#FDF0F2' : '#FFFFFF'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#DE3B0B' }}>
                        📢 {item.category || 'CIRCULAR'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#8A9198' }}>{item.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#3A1F6F' }}>{item.subject}</div>
                    <div style={{ fontSize: '11px', color: '#55636B', marginTop: '2px', lineHeight: 1.3 }}>{item.content}</div>
                    <div style={{ fontSize: '10px', color: '#8A9198', marginTop: '4px' }}>From: {item.sender}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
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
              backgroundColor: '#9D1B55',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px'
            }}>
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{currentUser?.name || 'User'}</div>
              <div style={{ fontSize: '11px', color: '#E0D6F5' }}>{activeRole}</div>
            </div>
            <ChevronDown size={14} color="#D1D5DB" />
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              backgroundColor: '#FFFFFF',
              color: '#242044',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid #E5E5E5',
              width: '210px',
              zIndex: 250,
              padding: '8px 0'
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #E5E5E5' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#3A1F6F' }}>{currentUser?.name}</div>
                <div style={{ fontSize: '12px', color: '#55636B' }}>{currentUser?.email}</div>
              </div>

              <button 
                onClick={() => { setShowDropdown(false); logout(); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  color: '#DE3B0B',
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
  );
};
