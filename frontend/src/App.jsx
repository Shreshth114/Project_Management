import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { RegisterStudent } from './pages/auth/RegisterStudent';
import { DashboardLayout } from './components/layout/DashboardLayout';

const MainContent = () => {
  const { currentUser, activeTab } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

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
