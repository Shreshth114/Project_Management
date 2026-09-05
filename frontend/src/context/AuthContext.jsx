import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { initialCollegeData } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('rit_college_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialCollegeData;
      }
    }
    return initialCollegeData;
  });

  useEffect(() => {
    localStorage.setItem('rit_college_data', JSON.stringify(data));
  }, [data]);

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
        const savedProfile = localStorage.getItem('rit_current_user_profile');
        if (savedProfile) {
          try {
            const profile = JSON.parse(savedProfile);
            setCurrentUser(profile);
            setCurrentRole(profile.role === 'TEACHER' ? (profile.teacherRoles?.[0] || 'FACULTY') : profile.role);
            setIsAuthLoading(false);
            return;
          } catch (e) {
            localStorage.removeItem('rit_current_user_profile');
          }
        }
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
            localStorage.removeItem('rit_current_user_profile');
            setCurrentUser(null);
            setCurrentRole(null);
            setActiveTab('login');
            setIsAuthLoading(false);
            setPendingRole(null);
            return;
          }
        }

        setCurrentUser(profile);
        localStorage.setItem('rit_current_user_profile', JSON.stringify(profile));
        
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
  }, [pendingRole]);

  const login = async (email, password, expectedRole) => {
    try {
      setPendingRole(expectedRole);
      const loginRes = await authService.login(email, password);
      
      let user = loginRes?.user;
      if (!user) {
        const session = await supabase.auth.getSession();
        user = session.data?.session?.user;
      }
      if (!user) throw new Error("No user session returned after login.");
      
      const profile = await authService.getUserProfile(user);
      if (expectedRole) {
        let isValid = false;
        if (expectedRole === 'STUDENT' && profile.role === 'STUDENT') isValid = true;
        if (expectedRole === 'ADMIN' && profile.role === 'ADMIN') isValid = true;
        if (expectedRole === 'FACULTY' && profile.role === 'TEACHER' && profile.teacherRoles?.includes('FACULTY')) isValid = true;
        if (expectedRole === 'COORDINATOR' && profile.role === 'TEACHER' && profile.teacherRoles?.includes('COORDINATOR')) isValid = true;

        if (!isValid) {
          await authService.logout();
          localStorage.removeItem('rit_current_user_profile');
          setPendingRole(null);
          return { success: false, message: `Account is not authorized for the ${expectedRole} persona.` };
        }
      }

      setCurrentUser(profile);
      localStorage.setItem('rit_current_user_profile', JSON.stringify(profile));

      if (profile.role === 'STUDENT') {
        setCurrentRole('STUDENT');
        setActiveTab('dashboard');
      } else if (profile.role === 'ADMIN') {
        setCurrentRole('ADMIN');
        setActiveTab('dashboard');
      } else if (profile.role === 'TEACHER') {
        if (expectedRole === 'COORDINATOR' || expectedRole === 'FACULTY') {
          setCurrentRole(expectedRole);
        } else {
          setCurrentRole(profile.teacherRoles ? profile.teacherRoles[0] : 'FACULTY');
        }
        setActiveTab('dashboard');
      }

      return { success: true };
    } catch (err) {
      setPendingRole(null);
      return { success: false, message: err.message };
    }
  };

  const registerUser = async (newUser) => {
    try {
      const res = await authService.registerUser(newUser);
      if (res.success) {
        setData(prev => ({
          ...prev,
          users: [newUser, ...(prev.users || [])]
        }));
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed.' };
    }
  };

  const switchTeacherRole = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('activeTab', 'dashboard');
    setShowRoleSelectionModal(false);
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('rit_current_user_profile');
      localStorage.removeItem('activeTab');
      setCurrentUser(null);
      setCurrentRole(null);
      setActiveTab('login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const addTask = (newTask) => {
    const taskObj = {
      id: `tsk-${Date.now()}`,
      status: "IN_PROGRESS",
      ...newTask
    };
    setData(prev => ({
      ...prev,
      tasks: [taskObj, ...(prev.tasks || [])],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: currentUser?.name || 'Coordinator',
          action: "TASK_CREATED",
          details: `Published milestone: ${newTask.title}`
        },
        ...(prev.auditLogs || [])
      ]
    }));
  };

  const sendMessage = (msgObj) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: currentUser?.name || 'User',
      senderId: currentUser?.id || currentUser?.user_id || 'u-user',
      senderRole: currentRole || currentUser?.role,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isUnread: false,
      ...msgObj
    };
    setData(prev => ({
      ...prev,
      messages: [newMsg, ...(prev.messages || [])]
    }));
  };

  const deleteMessage = (messageId) => {
    setData(prev => ({
      ...prev,
      messages: (prev.messages || []).filter(m => m.id !== messageId && m.message_id !== messageId)
    }));
  };

  const setGroupSubmissionMode = (groupId, newMode) => {
    setData(prev => ({
      ...prev,
      groups: (prev.groups || []).map(g => {
        if (g.id === groupId) {
          return { ...g, submissionMode: newMode };
        }
        return g;
      })
    }));
  };

  const submitGroupComponent = (groupId, componentKey, payload) => {
    setData(prev => ({
      ...prev,
      groups: (prev.groups || []).map(g => {
        if (g.id === groupId) {
          const comp = g.components ? g.components[componentKey] : {};
          const existingSubmittedUsns = comp?.submittedByUsns || [];
          const existingSubmittedNames = comp?.submittedByNames || [];

          const userUsn = currentUser?.usn || '1MS21CS042';
          const userName = currentUser?.name || 'Student';

          const newSubmittedUsns = Array.from(new Set([...existingSubmittedUsns, userUsn]));
          const newSubmittedNames = Array.from(new Set([...existingSubmittedNames, userName]));

          const updatedComp = {
            ...comp,
            status: "COMPLETED",
            submittedByUsns: newSubmittedUsns,
            submittedByNames: newSubmittedNames,
            fileName: payload.fileName || comp?.fileName,
            fileSize: payload.fileSize || comp?.fileSize,
            url: payload.url || comp?.url,
            submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };

          return {
            ...g,
            components: {
              ...(g.components || {}),
              [componentKey]: updatedComp
            }
          };
        }
        return g;
      })
    }));
  };

  const saveIndividualStudentEvaluation = (evalObj) => {
    setData(prev => {
      const existingIdx = (prev.groupEvaluations || []).findIndex(
        e => e.groupId === evalObj.groupId && e.studentUsn === evalObj.studentUsn && e.taskId === evalObj.taskId
      );

      let newGroupEvaluations = [...(prev.groupEvaluations || [])];
      const record = {
        id: `eval-${evalObj.groupId}-${evalObj.studentUsn}`,
        status: "COMPLETED",
        evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        maxScore: 50,
        ...evalObj
      };

      if (existingIdx >= 0) {
        newGroupEvaluations[existingIdx] = record;
      } else {
        newGroupEvaluations.push(record);
      }

      return {
        ...prev,
        groupEvaluations: newGroupEvaluations
      };
    });
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
        setShowModeSelectionLanding,
        data,
        setData,
        addTask,
        sendMessage,
        deleteMessage,
        setGroupSubmissionMode,
        submitGroupComponent,
        saveIndividualStudentEvaluation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
