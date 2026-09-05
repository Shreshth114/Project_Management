import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'login';
  });

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);
  
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [pendingRole, setPendingRole] = useState(null);
  const [showModeSelectionLanding, setShowModeSelectionLanding] = useState(false);

  useEffect(() => {
    const handleProfileResolution = async (session) => {
      if (!session) {
        setCurrentUser(null);
        setCurrentRole(null);
        setActiveTab('login');
        setIsAuthLoading(false);
        return;
      }
      try {
        const profile = await authService.getUserProfile(session.user);
        
        // If there's a pending role from a fresh login, validate it
        if (pendingRole) {
          let isValid = false;
          if (pendingRole === 'STUDENT' && profile.role === 'STUDENT') isValid = true;
          if (pendingRole === 'ADMIN' && profile.role === 'ADMIN') isValid = true;
          if (pendingRole === 'FACULTY' && profile.role === 'TEACHER' && profile.teacherRoles?.includes('FACULTY')) isValid = true;
          if (pendingRole === 'COORDINATOR' && profile.role === 'TEACHER' && profile.teacherRoles?.includes('COORDINATOR')) isValid = true;

          if (!isValid) {
            await authService.logout();
            setCurrentUser(null);
            setCurrentRole(null);
            setActiveTab('login');
            setIsAuthLoading(false);
            setPendingRole(null);
            return;
          }
        }

        setCurrentUser(profile);
        
        if (profile.role === 'STUDENT') {
          setCurrentRole('STUDENT');
          setActiveTab(prev => prev === 'login' ? 'dashboard' : prev);
        } else if (profile.role === 'ADMIN') {
          setCurrentRole('ADMIN');
          setActiveTab(prev => prev === 'login' ? 'dashboard' : prev);
        } else if (profile.role === 'TEACHER') {
          if (pendingRole === 'COORDINATOR' || pendingRole === 'FACULTY') {
            setCurrentRole(pendingRole);
            setActiveTab(prev => prev === 'login' ? 'dashboard' : prev);
          } else if (profile.teacherRoles && profile.teacherRoles.length > 1) {
            setShowRoleSelectionModal(true);
            setActiveTab(prev => prev === 'login' ? 'dashboard' : prev);
          } else {
            setCurrentRole(profile.teacherRoles ? profile.teacherRoles[0] : 'FACULTY');
            setActiveTab(prev => prev === 'login' ? 'dashboard' : prev);
          }
        }
        setPendingRole(null);
      } catch (err) {
        console.error("Profile resolution error:", err);
        setCurrentUser(null);
        setCurrentRole(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleProfileResolution(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleProfileResolution(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password, expectedRole) => {
    try {
      setPendingRole(expectedRole);
      const res = await authService.login(email, password);
      
      const session = await supabase.auth.getSession();
      const user = session.data?.session?.user;
      if (!user) throw new Error("No user session returned after login.");
      
      const profile = await authService.getUserProfile(user);
      let isValid = false;
      if (expectedRole === 'STUDENT' && profile.role === 'STUDENT') isValid = true;
      if (expectedRole === 'ADMIN' && profile.role === 'ADMIN') isValid = true;
      if (expectedRole === 'FACULTY' && profile.role === 'TEACHER' && profile.teacherRoles?.includes('FACULTY')) isValid = true;
      if (expectedRole === 'COORDINATOR' && profile.role === 'TEACHER' && profile.teacherRoles?.includes('COORDINATOR')) isValid = true;

      if (!isValid) {
        await authService.logout();
        setPendingRole(null);
        return { success: false, message: `Account is not authorized for the ${expectedRole} persona.` };
      }

      return { success: true };
    } catch (err) {
      setPendingRole(null);
      return { success: false, message: err.message };
    }
  };

  const registerUser = (newUser) => {
    return { success: true };
  };

  const switchTeacherRole = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('activeTab', 'dashboard');
    setShowRoleSelectionModal(false);
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('activeTab');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentRole || (currentUser?.role === 'TEACHER' ? 'FACULTY' : currentUser?.role),
        activeRole: currentRole || (currentUser?.role === 'TEACHER' ? 'FACULTY' : currentUser?.role),
        activeTab,
        isAuthLoading,
        setActiveTab,
        login,
        registerUser,
        logout,
        switchTeacherRole,
        showRoleSelectionModal,
        setShowRoleSelectionModal,
        showModeSelectionLanding,
        setShowModeSelectionLanding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
