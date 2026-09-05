import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialCollegeData } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
      }
      return { success: true };
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
  const switchTeacherRole = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('rit_current_role', newRole);
    setActiveTab('dashboard');
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

  return (
    <AuthContext.Provider
      value={{
        data,
        currentUser,
        currentRole: currentRole || (currentUser?.role === 'TEACHER' ? 'FACULTY' : currentUser?.role),
        activeRole: currentRole || (currentUser?.role === 'TEACHER' ? 'FACULTY' : currentUser?.role),
        activeTab,
        setActiveTab,
        showModeSelectionLanding,
        setShowModeSelectionLanding,
        login,
        registerUser,
        logout,
        switchTeacherRole,
        deleteMessage,
        setGroupSubmissionMode,
        submitGroupComponent,
        saveIndividualStudentEvaluation,
        addTask,
        sendMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
