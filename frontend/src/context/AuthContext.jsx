import React, { createContext, useContext, useState } from 'react';
import { initialCollegeData } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [data, setData] = useState(initialCollegeData);
  
  // Default logged-in user (preset as Student 1MS21CS042 for instant preview, can be changed via login)
  const [currentUser, setCurrentUser] = useState(initialCollegeData.users[0]);
  
  // Current Active Working Role: 'STUDENT' | 'FACULTY' | 'COORDINATOR' | 'ADMIN'
  const [currentRole, setCurrentRole] = useState('STUDENT');
  
  // Active Page Tab
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal state for role selection gateway if teacher has both roles
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);

  // Login handler
  const login = (emailOrUsername, password) => {
    const found = data.users.find(
      u => u.username.toLowerCase() === emailOrUsername.toLowerCase() || 
           u.email.toLowerCase() === emailOrUsername.toLowerCase()
    );

    if (found) {
      setCurrentUser(found);
      if (found.role === 'STUDENT') {
        setCurrentRole('STUDENT');
        setActiveTab('dashboard');
      } else if (found.role === 'ADMIN') {
        setCurrentRole('ADMIN');
        setActiveTab('dashboard');
      } else if (found.role === 'TEACHER') {
        if (found.teacherRoles.length > 1) {
          setShowRoleSelectionModal(true);
        } else {
          setCurrentRole(found.teacherRoles[0]);
          setActiveTab('dashboard');
        }
      }
      return { success: true };
    } else {
      return { success: false, message: "Invalid College Credentials. Please check USN / Email." };
    }
  };

  // Switch Teacher Working Role (Faculty <-> Coordinator)
  const switchTeacherRole = (newRole) => {
    setCurrentRole(newRole);
    setActiveTab('dashboard');
    setShowRoleSelectionModal(false);
  };

  // Quick Switch Preset User for Easy Assessment Demo
  const quickSwitchUser = (userId, targetRole) => {
    const found = data.users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setCurrentRole(targetRole || (found.teacherRoles ? found.teacherRoles[0] : found.role));
      setActiveTab('dashboard');
    }
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setActiveTab('login');
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
