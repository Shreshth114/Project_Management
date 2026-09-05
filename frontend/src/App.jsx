import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { RegisterStudent } from './pages/auth/RegisterStudent';
import { RegisterFaculty } from './pages/auth/RegisterFaculty';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { DashboardLayout } from './components/layout/DashboardLayout';

const MainContent = () => {
  const { currentUser, activeTab, isAuthLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register-student' | 'register-faculty' | 'forgot-password' | 'reset-password'

  const [resetError, setResetError] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const urlStr = window.location.hash || window.location.search;
      if (urlStr.includes('reset-password') || urlStr.includes('type=recovery') || urlStr.includes('error_code=otp_expired')) {
        setAuthView('reset-password');
        
        if (urlStr.includes('error_code=otp_expired') || urlStr.includes('error=access_denied')) {
          setResetError('This password reset link is invalid or has expired. Please request a new password reset link.');
        } else {
          setResetError(null);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
    if (authView === 'forgot-password') {
      return (
        <ForgotPassword 
          onBackToLogin={() => setAuthView('login')} 
          onNavigateReset={() => setAuthView('reset-password')}
        />
      );
    }
    if (authView === 'reset-password') {
      return (
        <ResetPassword 
          initialError={resetError}
          onBackToLogin={() => {
            if (window.location.hash || window.location.search) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            setAuthView('login');
          }} 
        />
      );
    }
    return (
      <Login 
        onNavigateRegisterStudent={() => setAuthView('register-student')}
        onNavigateRegisterFaculty={() => setAuthView('register-faculty')}
        onNavigateForgotPassword={() => setAuthView('forgot-password')}
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
