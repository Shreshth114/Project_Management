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
  History,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const getNavItemsByRole = (role) => {
  switch (role) {
    case 'STUDENT':
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
        { id: 'submissions', label: 'Submissions', icon: FileText },
        { id: 'status', label: 'Status', icon: BarChart2 },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'support', label: 'Help & Support', icon: LifeBuoy }
      ];

    case 'FACULTY':
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'groups', label: 'Students / Groups', icon: Users },
        { id: 'submissions', label: 'Submissions', icon: FileText },
        { id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
        { id: 'status', label: 'Status', icon: BarChart2 },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'support', label: 'Help & Support', icon: LifeBuoy }
      ];

    case 'COORDINATOR':
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'create-task', label: 'Create Task', icon: PlusSquare },
        { id: 'groups', label: 'Groups / Students', icon: Users },
        { id: 'status', label: 'Status', icon: BarChart2 },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'support', label: 'Help & Support', icon: LifeBuoy }
      ];

    case 'ADMIN':
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'status', label: 'Status', icon: BarChart2 },
        { id: 'logs', label: 'Logs', icon: History },
        { id: 'master-edit', label: 'Master Edit', icon: Settings },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'support', label: 'Help & Support', icon: LifeBuoy }
      ];

    default:
      return [];
  }
};

export const ProjectInfo = () => (
  <div style={{
    padding: '16px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    fontSize: '11px',
    color: '#9F9F9F',
    lineHeight: '1.7',
    marginTop: 'auto'
  }}>
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
);

export const Sidebar = () => {
  const { currentRole, activeTab, setActiveTab, isSidebarCollapsed, setIsSidebarCollapsed } = useAuth();
  const navItems = getNavItemsByRole(currentRole);

  return (
    <aside className={`portal-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>

      {/* Role label & Collapse Toggle */}
      <div style={{ 
        padding: isSidebarCollapsed ? '16px 0' : '16px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isSidebarCollapsed ? 'center' : 'space-between'
      }}>
        {!isSidebarCollapsed && (
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9F9F9F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {currentRole} WORKSPACE
          </div>
        )}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="btn btn-secondary btn-sm"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: '#9F9F9F', 
            padding: '4px',
            minHeight: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
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
                title={item.label}
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

      {/* Project info — right below nav items */}
      {!isSidebarCollapsed && <ProjectInfo />}

    </aside>
  );
};
