import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialCollegeData } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [data, setData] = useState(initialCollegeData);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [activeTab, setActiveTab] = useState('login');
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
        const profile = await authService.getUserProfile(session.user.email);
        setCurrentUser(profile);
        
        if (profile.role === 'STUDENT') {
          setCurrentRole('STUDENT');
          setActiveTab('dashboard');
        } else if (profile.role === 'ADMIN') {
          setCurrentRole('ADMIN');
          setActiveTab('dashboard');
        } else if (profile.role === 'TEACHER') {
          if (profile.teacherRoles && profile.teacherRoles.length > 1) {
            setShowRoleSelectionModal(true);
          } else {
            setCurrentRole(profile.teacherRoles ? profile.teacherRoles[0] : 'FACULTY');
            setActiveTab('dashboard');
          }
        }
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

  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const switchTeacherRole = (newRole) => {
    setCurrentRole(newRole);
    setActiveTab('dashboard');
    setShowRoleSelectionModal(false);
  };

  const quickSwitchUser = (userId, targetRole) => {
    console.warn("quickSwitchUser is disabled in real auth mode.");
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // 1. Group Leader: Set Submission Mode (Mode A vs Mode B)
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
          user: currentUser.username,
          action: "MODE_CHANGE",
          details: `Group ${groupId} leader switched submission mode to ${newMode}`
        },
        ...prev.auditLogs
      ]
    }));
  };

  // 2. Group Leader: Update Distributed Component Assignments
  const updateComponentAssignments = (groupId, updatedAssignments) => {
    // updatedAssignments is an object: { componentKey: [array of assigned USNs] }
    setData(prev => ({
      ...prev,
      groups: prev.groups.map(g => {
        if (g.id === groupId) {
          const newComponents = { ...g.components };
          Object.keys(updatedAssignments).forEach(compKey => {
            const assignedUsns = updatedAssignments[compKey];
            const assignedNames = g.members
              .filter(m => assignedUsns.includes(m.usn))
              .map(m => m.name);

            newComponents[compKey] = {
              ...newComponents[compKey],
              assignedUsns,
              assignedNames
            };
          });
          return { ...g, components: newComponents };
        }
        return g;
      }),
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: currentUser.username,
          action: "ASSIGNMENTS_UPDATED",
          details: `Updated distributed component submission responsibilities for Group ${groupId}`
        },
        ...prev.auditLogs
      ]
    }));
  };

  // 3. Submit/Upload a Group Project Component
  const submitGroupComponent = (groupId, componentKey, payload) => {
    setData(prev => ({
      ...prev,
      groups: prev.groups.map(g => {
        if (g.id === groupId) {
          const comp = g.components[componentKey];
          const existingSubmittedUsns = comp.submittedByUsns || [];
          const existingSubmittedNames = comp.submittedByNames || [];

          const newSubmittedUsns = Array.from(new Set([...existingSubmittedUsns, currentUser.usn]));
          const newSubmittedNames = Array.from(new Set([...existingSubmittedNames, currentUser.name]));

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
          user: currentUser.username,
          action: "COMPONENT_SUBMITTED",
          details: `${currentUser.name} uploaded ${componentKey} for Group ${groupId}`
        },
        ...prev.auditLogs
      ]
    }));
  };

  // 4. CRITICAL RULE: Save Individual Student Evaluation Marks
  const saveIndividualStudentEvaluation = (evalObj) => {
    // evalObj: { groupId, taskId, studentUsn, studentName, evaluator, scores, totalScore, feedback }
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
            user: currentUser.name,
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
          user: currentUser.name,
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
      sender: `${currentUser.name} (${currentRole})`,
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
        currentRole,
        activeTab,
        isAuthLoading,
        setActiveTab,
        login,
        logout,
        switchTeacherRole,
        quickSwitchUser,
        showRoleSelectionModal,
        setShowRoleSelectionModal,
        setGroupSubmissionMode,
        updateComponentAssignments,
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
