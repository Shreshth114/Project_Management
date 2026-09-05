import React, { createContext, useContext, useState, useEffect } from 'react';
<<<<<<< HEAD
import { initialCollegeData } from '../data/mockData';
=======
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
>>>>>>> origin/main

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
  // Load stored custom users from localStorage if available
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
  
  // Current logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('rit_current_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  // Current Active Working Role: 'STUDENT' | 'FACULTY' | 'COORDINATOR' | 'ADMIN'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('rit_current_role') || null;
  });
  
  // Active Page Tab
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('rit_active_tab') || 'login';
  });

  // Flag to display Mode Selection Landing Page for Faculty logins
  const [showModeSelectionLanding, setShowModeSelectionLanding] = useState(false);

  // Sync data changes to localStorage
  useEffect(() => {
    localStorage.setItem('rit_college_data', JSON.stringify(data));
  }, [data]);

  // Login handler
  const login = (emailOrUsername, password) => {
    const input = emailOrUsername.trim().toLowerCase();

    // Check alias shortcuts or registered users
    let found = data.users.find(
      u => u.username.toLowerCase() === input || 
           u.email.toLowerCase() === input ||
           (u.usn && u.usn.toLowerCase() === input)
    );

    // Fallback preset mappings for specific alias emails
    if (!found) {
      if (input === 'student@msrit.edu' || input === 'student') {
        found = data.users.find(u => u.role === 'STUDENT') || data.users[0];
      } else if (input === 'faculty@msrit.edu' || input === 'faculty') {
        // Dr. R. Sharma: JUST FACULTY
        found = data.users.find(u => u.email === 'faculty@msrit.edu' || u.username === 'dr.sharma');
      } else if (input === 'coord.faculty@msrit.edu' || input === 'coord' || input === 'prof.kulkarni@msrit.edu') {
        // Prof. V. Kulkarni: BOTH FACULTY AND COORDINATOR
        found = data.users.find(u => u.email === 'prof.kulkarni@msrit.edu' || u.username === 'prof.kulkarni');
      } else if (input === 'admin@msrit.edu' || input === 'admin') {
        found = data.users.find(u => u.role === 'ADMIN');
      }
    }

    if (found) {
      setCurrentUser(found);
      localStorage.setItem('rit_current_user', JSON.stringify(found));

      if (found.role === 'STUDENT') {
        setCurrentRole('STUDENT');
        localStorage.setItem('rit_current_role', 'STUDENT');
        setActiveTab('dashboard');
        localStorage.setItem('rit_active_tab', 'dashboard');
        setShowModeSelectionLanding(false);
      } else if (found.role === 'ADMIN') {
        setCurrentRole('ADMIN');
        localStorage.setItem('rit_current_role', 'ADMIN');
        setActiveTab('dashboard');
        localStorage.setItem('rit_active_tab', 'dashboard');
        setShowModeSelectionLanding(false);
      } else if (found.role === 'TEACHER' || found.role === 'FACULTY' || found.role === 'COORDINATOR') {
        const isCoordinator = (data.subjects || []).some(s => s.coordinator === found.name || s.coordinator === found.username) ||
                              (found.teacherRoles && found.teacherRoles.includes('COORDINATOR'));
        
        setCurrentRole('FACULTY');
        localStorage.setItem('rit_current_role', 'FACULTY');
        setActiveTab('dashboard');
        localStorage.setItem('rit_active_tab', 'dashboard');
        setShowModeSelectionLanding(true);
=======
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

  useEffect(() => {
    const handleProfileResolution = async (session) => {
      if (!session) {
        setCurrentUser(null);
        setCurrentRole(null);
        setActiveTab('login');
        setIsAuthLoading(false);
        return;
>>>>>>> origin/main
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
      
      // We manually validate the profile here so we can return an error immediately to Login.jsx
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
<<<<<<< HEAD
    } else {
      return { success: false, message: "Invalid Credentials. Please check USN / Email." };
    }
  };

  // Register User
  const registerUser = (newUser) => {
    const existing = data.users.find(
      u => u.email.toLowerCase() === newUser.email.toLowerCase() ||
           (newUser.usn && u.usn && u.usn.toLowerCase() === newUser.usn.toLowerCase())
    );

    if (existing) {
      return { success: false, message: "An account already exists for this email address or USN." };
    }

    const createdUser = {
      id: `u-${Date.now()}`,
      ...newUser
    };

    setData(prev => ({
      ...prev,
      users: [createdUser, ...prev.users]
    }));

    return { success: true };
  };

  // Switch Teacher Working Role (Faculty <-> Coordinator)
=======
    } catch (err) {
      setPendingRole(null);
      return { success: false, message: err.message };
    }
  };

>>>>>>> origin/main
  const switchTeacherRole = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('rit_current_role', newRole);
    setActiveTab('dashboard');
<<<<<<< HEAD
    localStorage.setItem('rit_active_tab', 'dashboard');
    setShowModeSelectionLanding(false);
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setActiveTab('login');
    setShowModeSelectionLanding(false);
    localStorage.removeItem('rit_current_user');
    localStorage.removeItem('rit_current_role');
    localStorage.removeItem('rit_active_tab');
  };

  // Delete Message Function
  const deleteMessage = (messageId) => {
    setData(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== messageId)
    }));
  };

  // Group Submission Mode Toggle
  const setGroupSubmissionMode = (groupId, newMode) => {
    setData(prev => ({
      ...prev,
      groups: prev.groups.map(g => {
        if (g.id === groupId) {
          return { ...g, submissionMode: newMode };
        }
        return g;
      }),
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: currentUser?.username || 'user',
          action: "MODE_CHANGE",
          details: `Group ${groupId} leader switched submission mode to ${newMode}`
        },
        ...prev.auditLogs
      ]
    }));
  };

  // Submit/Upload Group Component
  const submitGroupComponent = (groupId, componentKey, payload) => {
    setData(prev => ({
      ...prev,
      groups: prev.groups.map(g => {
        if (g.id === groupId) {
          const comp = g.components[componentKey];
          const existingSubmittedUsns = comp.submittedByUsns || [];
          const existingSubmittedNames = comp.submittedByNames || [];

          const userUsn = currentUser?.usn || '1MS21CS042';
          const userName = currentUser?.name || 'Rahul Sharma';

          const newSubmittedUsns = Array.from(new Set([...existingSubmittedUsns, userUsn]));
          const newSubmittedNames = Array.from(new Set([...existingSubmittedNames, userName]));

          const updatedComp = {
            ...comp,
            status: "COMPLETED",
            submittedByUsns: newSubmittedUsns,
            submittedByNames: newSubmittedNames,
            fileName: payload.fileName || comp.fileName,
            fileSize: payload.fileSize || comp.fileSize,
            url: payload.url || comp.url,
            submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };

          return {
            ...g,
            components: {
              ...g.components,
              [componentKey]: updatedComp
            }
          };
        }
        return g;
      }),
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: currentUser?.username || 'user',
          action: "COMPONENT_SUBMITTED",
          details: `Group ${groupId}: one of grp member submitted all the components`
        },
        ...prev.auditLogs
      ]
    }));
  };

  // Save Individual Student Evaluation Marks
  const saveIndividualStudentEvaluation = (evalObj) => {
    setData(prev => {
      const existingIdx = prev.groupEvaluations.findIndex(
        e => e.groupId === evalObj.groupId && e.studentUsn === evalObj.studentUsn && e.taskId === evalObj.taskId
      );

      let newGroupEvaluations = [...prev.groupEvaluations];
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
        groupEvaluations: newGroupEvaluations,
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: currentUser?.name || 'Faculty',
            action: "INDIVIDUAL_EVALUATION",
            details: `Saved individual marks (${evalObj.totalScore}/50) for student ${evalObj.studentName} (${evalObj.studentUsn})`
          },
          ...prev.auditLogs
        ]
      };
    });
  };

  // Coordinator: Create Task
  const addTask = (newTask) => {
    const taskObj = {
      id: `tsk-${Date.now()}`,
      status: "IN_PROGRESS",
      ...newTask
    };
    setData(prev => ({
      ...prev,
      tasks: [taskObj, ...prev.tasks],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: currentUser?.name || 'Coordinator',
          action: "TASK_CREATED",
          details: `Published milestone: ${newTask.title}`
        },
        ...prev.auditLogs
      ]
    }));
  };

  // Send Message
  const sendMessage = (msgObj) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: currentUser?.name || 'User',
      senderId: currentUser?.id || 'u-user',
      senderRole: currentRole,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isUnread: false,
      ...msgObj
    };
    setData(prev => ({
      ...prev,
      messages: [newMsg, ...prev.messages]
    }));
  };
=======
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


>>>>>>> origin/main

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentRole || (currentUser?.role === 'TEACHER' ? 'FACULTY' : currentUser?.role),
        activeRole: currentRole || (currentUser?.role === 'TEACHER' ? 'FACULTY' : currentUser?.role),
        activeTab,
        isAuthLoading,
        setActiveTab,
        showModeSelectionLanding,
        setShowModeSelectionLanding,
        login,
        registerUser,
        logout,
        switchTeacherRole,
<<<<<<< HEAD
        deleteMessage,
        setGroupSubmissionMode,
        submitGroupComponent,
        saveIndividualStudentEvaluation,
        addTask,
        sendMessage
=======
        showRoleSelectionModal,
        setShowRoleSelectionModal
>>>>>>> origin/main
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
