import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { RegisterStudent } from './pages/auth/RegisterStudent';
import { DashboardLayout } from './components/layout/DashboardLayout';

const MainContent = () => {
  const { currentUser, activeTab, isAuthLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F8F8' }}>
        <p style={{ color: '#243143', fontWeight: 600 }}>Loading Academic Project Governance Portal...</p>
      </div>
    );
  }

  if (!currentUser || activeTab === 'login') {
    if (authView === 'register') {
      return <RegisterStudent onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
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
