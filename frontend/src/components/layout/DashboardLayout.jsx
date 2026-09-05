import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../common/Header';
import { Sidebar } from '../common/Sidebar';
import { MobileDrawer } from '../common/MobileDrawer';
import { RoleSelectionModal } from '../common/RoleSelectionModal';
import { FacultyModeSelectionPage } from '../../pages/faculty/FacultyModeSelectionPage';

// Student Pages
import { StudentDashboard } from '../../pages/student/StudentDashboard';
import { StudentTasks } from '../../pages/student/StudentTasks';
import { StudentSubmissions } from '../../pages/student/StudentSubmissions';
import { StudentStatus } from '../../pages/student/StudentStatus';
import { StudentMessages } from '../../pages/student/StudentMessages';
import { StudentProfile } from '../../pages/student/StudentProfile';

// Faculty Pages
import { FacultyDashboard } from '../../pages/faculty/FacultyDashboard';
import { FacultyGroups } from '../../pages/faculty/FacultyGroups';
import { FacultySubmissions } from '../../pages/faculty/FacultySubmissions';
import { FacultyEvaluation } from '../../pages/faculty/FacultyEvaluation';
import { FacultyStatus } from '../../pages/faculty/FacultyStatus';
import { FacultyMessages } from '../../pages/faculty/FacultyMessages';
import { FacultyProfile } from '../../pages/faculty/FacultyProfile';

// Coordinator Pages
import { CoordinatorDashboard } from '../../pages/coordinator/CoordinatorDashboard';
import { CoordinatorTasks } from '../../pages/coordinator/CoordinatorTasks';
import { CoordinatorCreateTask } from '../../pages/coordinator/CoordinatorCreateTask';
import { CoordinatorGroups } from '../../pages/coordinator/CoordinatorGroups';
import { CoordinatorStudents } from '../../pages/coordinator/CoordinatorStudents';
import { CoordinatorStatus } from '../../pages/coordinator/CoordinatorStatus';
import { CoordinatorMessages } from '../../pages/coordinator/CoordinatorMessages';
import { CoordinatorProfile } from '../../pages/coordinator/CoordinatorProfile';

// Admin Pages
import { AdminDashboard } from '../../pages/admin/AdminDashboard';
import { AdminSubjects } from '../../pages/admin/AdminSubjects';
import { AdminUsers } from '../../pages/admin/AdminUsers';
import { AdminStatus } from '../../pages/admin/AdminStatus';
import { AdminLogs } from '../../pages/admin/AdminLogs';
import { AdminMasterEdit } from '../../pages/admin/AdminMasterEdit';
import { AdminProfile } from '../../pages/admin/AdminProfile';

export const DashboardLayout = () => {
  const { currentRole, activeRole, activeTab, showModeSelectionLanding } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const effectiveRole = activeRole || currentRole;

  // Render Full-Screen Faculty Mode Landing Page if mode is not chosen yet
  if (showModeSelectionLanding && (effectiveRole === 'FACULTY' || effectiveRole === 'TEACHER' || effectiveRole === 'COORDINATOR')) {
    return <FacultyModeSelectionPage />;
  }

  const renderActivePage = () => {
    switch (effectiveRole) {
      case 'STUDENT':
        switch (activeTab) {
          case 'dashboard': return <StudentDashboard />;
          case 'tasks': return <StudentTasks />;
          case 'submissions': return <StudentSubmissions />;
          case 'status': return <StudentStatus />;
          case 'messages': return <StudentMessages />;
          case 'profile': return <StudentProfile />;
          default: return <StudentDashboard />;
        }

      case 'FACULTY':
        switch (activeTab) {
          case 'dashboard': return <FacultyDashboard />;
          case 'groups': return <FacultyGroups />;
          case 'submissions': return <FacultySubmissions readOnly={false} />;
          case 'evaluation': return <FacultyEvaluation />;
          case 'status': return <FacultyStatus />;
          case 'messages': return <FacultyMessages />;
          case 'profile': return <FacultyProfile />;
          default: return <FacultyDashboard />;
        }

      case 'COORDINATOR':
        switch (activeTab) {
          case 'dashboard': return <CoordinatorDashboard />;
          case 'tasks': return <CoordinatorTasks />;
          case 'create-task': return <CoordinatorCreateTask />;
          case 'groups': return <CoordinatorGroups />;
          case 'students': return <CoordinatorStudents />;
          case 'submissions': return <FacultySubmissions readOnly={true} />;
          case 'status': return <CoordinatorStatus />;
          case 'messages': return <CoordinatorMessages />;
          case 'profile': return <CoordinatorProfile />;
          default: return <CoordinatorDashboard />;
        }

      case 'ADMIN':
        switch (activeTab) {
          case 'dashboard': return <AdminDashboard />;
          case 'subjects': return <AdminSubjects />;
          case 'users': return <AdminUsers />;
          case 'status': return <AdminStatus />;
          case 'logs': return <AdminLogs />;
          case 'master-edit': return <AdminMasterEdit />;
          case 'profile': return <AdminProfile />;
          default: return <AdminDashboard />;
        }

      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Header onToggleMobileDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)} />

      <div className="app-body">
        <Sidebar />
        
        <MobileDrawer 
          isOpen={mobileDrawerOpen} 
          onClose={() => setMobileDrawerOpen(false)} 
        />

        <main className="main-content">
          {renderActivePage()}
        </main>
      </div>

      <RoleSelectionModal />
    </div>
  );
};
