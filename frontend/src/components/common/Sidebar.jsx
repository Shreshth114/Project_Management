import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  BarChart2,
  MessageSquare,
  User,
  Users,
  ClipboardCheck,
  PlusSquare,
  BookOpen,
  ShieldAlert,
  Settings,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw } from 'lucide-react';

export const getNavItemsByRole = (role) => {
  switch (role) {
    case 'STUDENT':
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
        { id: 'submissions', label: 'Submissions', icon: FileText },
        { id: 'status', label: 'Status', icon: BarChart2 },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: User }
      ];

    case 'FACULTY':
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'groups', label: 'Students / Groups', icon: Users },
        { id: 'submissions', label: 'Submissions', icon: FileText },
        { id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
        { id: 'status', label: 'Status', icon: BarChart2 },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: User }
      ];

    case 'COORDINATOR':
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'create-task', label: 'Create Task', icon: PlusSquare },
        { id: 'groups', label: 'Groups / Students', icon: Users },
        { id: 'status', label: 'Status', icon: BarChart2 },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: User }
      ];

    case 'ADMIN':
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'status', label: 'Status', icon: BarChart2 },
        { id: 'logs', label: 'Logs', icon: History },
        { id: 'master-edit', label: 'Master Edit', icon: Settings },
        { id: 'profile', label: 'Profile', icon: User }
      ];

    default:
      return [];
  }
};

export const Sidebar = () => {
  const { currentUser, currentRole, activeTab, setActiveTab, setShowModeSelectionLanding, data } = useAuth();
  const navItems = getNavItemsByRole(currentRole);

  const isAssignedCoordinator = currentUser?.is_coordinator ||
    currentUser?.teacherRoles?.includes('COORDINATOR') ||
    (data?.subjects || []).some(
      s => s.coordinator === currentUser?.name || s.coordinator === currentUser?.username
    ) || currentUser?.role === 'COORDINATOR';

  const isTeacher = currentUser?.role === 'TEACHER' ||
    currentUser?.role === 'FACULTY' ||
    currentUser?.role === 'COORDINATOR' ||
    (currentUser?.teacherRoles && currentUser.teacherRoles.length > 0);

  return (
    <aside className="portal-sidebar">

      {/* Role label */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#9F9F9F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {currentRole} WORKSPACE
        </div>
      </div>

      {/* Nav items */}
      <ul className="sidebar-nav">
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
                }}
              >
                <Icon className="icon" />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Switch workspace (faculty+coordinator only) */}
      {isTeacher && isAssignedCoordinator && (
        <div style={{ padding: '0 16px 16px 16px' }}>
          <button
            onClick={() => setShowModeSelectionLanding(true)}
            className="btn btn-secondary btn-block"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', fontSize: '13px', padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF'
            }}
          >
            <RefreshCw size={16} />
            <span>Switch Workspace</span>
          </button>
        </div>
      )}

      {/* Project info — right below nav items */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: '11px',
        color: '#9F9F9F',
        lineHeight: '1.7'
      }}>
        <div style={{ marginBottom: '2px' }}>VTU Academic Scheme</div>
        <div style={{ marginBottom: '12px' }}>Batch: 2023–2027 (7th Sem)</div>

        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
          Project Advisor
        </div>
        <div style={{ marginBottom: '12px', color: '#C0C0C0' }}>Krishna Raj P M</div>

        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
          Developed By
        </div>
        <div style={{ color: '#C0C0C0', lineHeight: '1.8' }}>
          <div>Sanjana K R</div>
          <div>Manaswini Uppuluri</div>
          <div>Shreshth Agrawal</div>
          <div>Vaishnavi Biswagar</div>
        </div>
      </div>

    </aside>
  );
};
