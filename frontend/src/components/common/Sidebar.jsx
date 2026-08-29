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
  const { currentRole, activeTab, setActiveTab } = useAuth();
  const navItems = getNavItemsByRole(currentRole);

  return (
    <aside className="portal-sidebar">
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#9F9F9F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {currentRole} WORKSPACE
        </div>
      </div>

      <nav style={{ flex: 1 }}>
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
      </nav>

      {/* Footer Info inside Sidebar */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#9F9F9F' }}>
        <div>VTU Academic Scheme</div>
        <div>Batch: 2021–2025 (8th Sem)</div>
      </div>
    </aside>
  );
};
