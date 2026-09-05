import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { RegisterStudent } from './pages/auth/RegisterStudent';
import { RegisterFaculty } from './pages/auth/RegisterFaculty';
import { DashboardLayout } from './components/layout/DashboardLayout';

const MainContent = () => {
<<<<<<< HEAD
  const { currentUser, activeTab } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register-student' | 'register-faculty'
=======
  const { currentUser, activeTab, isAuthLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
>>>>>>> origin/main

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F8F8' }}>
        <p style={{ color: '#243143', fontWeight: 600 }}>Loading Academic Project Governance Portal...</p>
      </div>
    );
  }

  if (!currentUser || activeTab === 'login') {
    if (authView === 'register-student') {
      return <RegisterStudent onBackToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'register-faculty') {
      return <RegisterFaculty onBackToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login 
        onNavigateRegisterStudent={() => setAuthView('register-student')}
        onNavigateRegisterFaculty={() => setAuthView('register-faculty')}
      />
    );
  }

  return <DashboardLayout />;
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
