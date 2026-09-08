import React, { useState, useEffect } from 'react';
import { 
  PlusSquare, Calendar, Send, CheckCircle, Trash2, 
  UserCheck, MessageSquare, Settings, Edit, ShieldAlert, RefreshCw, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { taskService } from '../../services/taskService';
import { messageService } from '../../services/messageService';

export const AdminMasterEdit = () => {
  const { currentUser, assignFacultyAsCoordinator } = useAuth();
  
  // Dynamic state
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [newGuide, setNewGuide] = useState('');
  const [extensionHours, setExtensionHours] = useState(48);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Milestone Task Deadline
  const [selectedTask, setSelectedTask] = useState('');
  const [newSubmissionDeadline, setNewSubmissionDeadline] = useState('');
  const [deadlineSuccess, setDeadlineSuccess] = useState('');

  // Circular
  const [circularSubject, setCircularSubject] = useState('');
  const [circularContent, setCircularContent] = useState('');
  const [circularSuccess, setCircularSuccess] = useState('');

  // Coordinator Assignment
  const [subjectToAssign, setSubjectToAssign] = useState('');
  const [newCoordinatorName, setNewCoordinatorName] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const [msgNotice, setMsgNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTeams, fetchedTasks, fetchedFaculties, fetchedSubjects, fetchedMessages, dir] = await Promise.all([
        academicService.getTeams().catch(() => []),
        taskService.getTasks().catch(() => []),
        academicService.getFaculty().catch(() => []),
        academicService.getSubjects().catch(() => []),
        messageService.getAllMessages().catch(() => []),
        academicService.getAdminUserDirectory().catch(() => ({ users: [] }))
      ]);

      setTeams(fetchedTeams || []);
      setTasks(fetchedTasks || []);
      setFaculties(fetchedFaculties || []);
      setSubjectsList(fetchedSubjects || []);
      setMessagesList(fetchedMessages || []);
      setDirectoryUsers(dir.users || []);

      if (fetchedTeams?.length > 0) setSelectedGroup(fetchedTeams[0].team_id);
      if (fetchedTasks?.length > 0) {
        setSelectedTask(fetchedTasks[0].task_id);
        setNewSubmissionDeadline(fetchedTasks[0].deadline ? fetchedTasks[0].deadline.slice(0, 10) : '');
      }
      if (fetchedFaculties?.length > 0) {
        setNewGuide(fetchedFaculties[0].faculty_id);
        setNewCoordinatorName(fetchedFaculties[0].name);
      }
      if (fetchedSubjects?.length > 0) {
        setSubjectToAssign(fetchedSubjects[0].subject_code || fetchedSubjects[0].code);
      }
    } catch (err) {
      console.error("AdminMasterEdit load failed:", err);
      setError("Failed to load administration dataset.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuideOverride = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await academicService.updateTeamGuide(selectedGroup, newGuide);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadData();
    } catch (err) {
      setError('Failed to reassign guide: ' + err.message);
    }
  };

  const handleDeadlineOverride = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const task = tasks.find(t => String(t.task_id) === String(selectedTask));
      if (!task) return;
      const currentDeadline = new Date(task.deadline || Date.now());
      currentDeadline.setHours(currentDeadline.getHours() + parseInt(extensionHours, 10));
      
      await taskService.updateTaskDeadline(selectedTask, currentDeadline.toISOString());
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadData();
    } catch (err) {
      setError('Failed to extend deadline: ' + err.message);
    }
  };

  const handleExtendDeadlines = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (!selectedTask || !newSubmissionDeadline) return;
      await taskService.updateTaskDeadline(selectedTask, newSubmissionDeadline);
      setDeadlineSuccess(`Milestone deadline successfully updated to ${newSubmissionDeadline}!`);
      setTimeout(() => setDeadlineSuccess(''), 4000);
      loadData();
    } catch (err) {
      setError('Failed to update milestone deadline: ' + err.message);
    }
  };

  const handleBroadcastCircular = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id) {
      setError('Active admin session not found.');
      return;
    }

    try {
      setError('');
      const fullText = `[${circularSubject}]\n${circularContent}`;
      
      // Broadcast to all users in the directory
      const promises = directoryUsers
        .filter(u => u.user_id && u.user_id !== currentUser.user_id)
        .map(u => messageService.sendMessage({
          sender_id: currentUser.user_id,
          receiver_id: u.user_id,
          message_text: fullText
        }));

      await Promise.all(promises);

      setCircularSubject('');
      setCircularContent('');
      setCircularSuccess('Official System Circular broadcasted to all registered users!');
      setTimeout(() => setCircularSuccess(''), 4000);

      const msgs = await messageService.getAllMessages().catch(() => []);
      setMessagesList(msgs || []);
    } catch (err) {
      setError('Failed to broadcast circular: ' + err.message);
    }
  };

  const handleAssignCoordinator = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await academicService.assignCoordinator(newCoordinatorName, subjectToAssign);
      if (assignFacultyAsCoordinator) {
        assignFacultyAsCoordinator(newCoordinatorName, subjectToAssign);
      }
      setAssignSuccess(`✓ ${newCoordinatorName} assigned as Coordinator for ${subjectToAssign}. Changes are active immediately.`);
      setTimeout(() => setAssignSuccess(''), 5000);
      loadData();
    } catch (err) {
      setError("Failed to assign coordinator: " + err.message);
    }
  };

  const handleDeleteSystemMessage = async (msgId) => {
    try {
      setError('');
      await messageService.deleteMessage(msgId);
      setMessagesList(prev => prev.filter(m => (m.message_id || m.id) !== msgId));
      setMsgNotice('Message permanently deleted from database.');
      setTimeout(() => setMsgNotice(''), 3000);
    } catch (err) {
      setError('Failed to delete message: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Admin Master Editing & System Control Studio</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Central control page to edit deadlines, assign coordinators, write official circulars, and manage system messages.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {msgNotice && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{msgNotice}</span>
        </div>
      )}

      {saved && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>Changes saved successfully to database!</span>
        </div>
      )}

      {/* BLOCK 1: EDIT DEADLINES */}
      <Card title="1. Edit Submission Deadlines (Live Database)">
        {deadlineSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{deadlineSuccess}</span>
          </div>
        )}

        <form onSubmit={handleExtendDeadlines}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Select Milestone Task</label>
              <select
                className="form-select"
                value={selectedTask}
                onChange={(e) => {
                  setSelectedTask(e.target.value);
                  const task = tasks.find(t => String(t.task_id) === String(e.target.value));
                  if (task?.deadline) {
                    setNewSubmissionDeadline(task.deadline.slice(0, 10));
                  }
                }}
              >
                {tasks.map(t => (
                  <option key={t.task_id} value={t.task_id}>
                    {t.title} (Current: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">New Submission Deadline Date</label>
              <input
                type="date"
                className="form-input"
                value={newSubmissionDeadline}
                onChange={(e) => setNewSubmissionDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-purple" disabled={tasks.length === 0}>
            <Calendar size={16} />
            <span>APPLY DEADLINE EXTENSION</span>
          </button>
        </form>
      </Card>

      {/* EMERGENCY DEADLINE OVERRIDE (HOURS) */}
      <Card title="Emergency Milestone Deadline Extension (By Hours)">
        <form onSubmit={handleDeadlineOverride}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Select Milestone Phase</label>
              <select 
                className="form-select"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                {tasks.map(t => (
                  <option key={t.task_id} value={t.task_id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Extension Duration (Hours)</label>
              <input
                type="number"
                className="form-input"
                value={extensionHours}
                onChange={(e) => setExtensionHours(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={tasks.length === 0}>
            <Settings size={16} />
            <span>EXTEND DEADLINE HOURS</span>
          </button>
        </form>
      </Card>

      {/* REASSIGN FACULTY GUIDE */}
      <Card title="Reassign Project Group Faculty Guide">
        <form onSubmit={handleGuideOverride}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Select Project Group</label>
              <select
                className="form-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {teams.map(g => (
                  <option key={g.team_id} value={g.team_id}>
                    {g.team_code} - {g.subject?.subject_name || 'Project'} (Current Guide: {g.guide?.name || 'Unassigned'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reassign New Faculty Guide</label>
              <select
                className="form-select"
                value={newGuide}
                onChange={(e) => setNewGuide(e.target.value)}
              >
                {faculties.map(f => (
                  <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={teams.length === 0 || faculties.length === 0}>
            <UserCheck size={16} />
            <span>REASSIGN FACULTY GUIDE</span>
          </button>
        </form>
      </Card>

      {/* BLOCK 2: BROADCAST CIRCULARS */}
      <Card title="2. Broadcast System Circular (Dispatched to All Users)">
        {circularSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{circularSuccess}</span>
          </div>
        )}

        <form onSubmit={handleBroadcastCircular}>
          <div className="form-group">
            <label className="form-label">Circular Subject Line</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. URGENT: Extended Viva Voce & Submission Deadlines"
              value={circularSubject}
              onChange={(e) => setCircularSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Circular Announcement Body</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Type circular announcement to be received by all students, faculty, and coordinators..."
              value={circularContent}
              onChange={(e) => setCircularContent(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-magenta btn-block">
            <Send size={16} />
            <span>BROADCAST CIRCULAR TO ALL SYSTEM USERS</span>
          </button>
        </form>
      </Card>

      {/* BLOCK 3: ASSIGN COORDINATORS TO SUBJECTS */}
      <Card title="3. Assign Subject Coordinators to Courses">
        {assignSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{assignSuccess}</span>
          </div>
        )}

        <form onSubmit={handleAssignCoordinator}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Select System Subject</label>
              <select
                className="form-select"
                value={subjectToAssign}
                onChange={(e) => setSubjectToAssign(e.target.value)}
              >
                {subjectsList.map((s, idx) => (
                  <option key={s.subject_id || s.id || idx} value={s.subject_code || s.code}>
                    {s.subject_code || s.code} - {s.subject_name || s.name} (Current: {s.coordinator || 'Not Assigned'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Faculty Member as Coordinator</label>
              <select
                className="form-select"
                value={newCoordinatorName}
                onChange={(e) => setNewCoordinatorName(e.target.value)}
              >
                {faculties.map((g, idx) => (
                  <option key={g.faculty_id || g.id || idx} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={subjectsList.length === 0 || faculties.length === 0}>
            <UserCheck size={16} />
            <span>ASSIGN COORDINATOR TO SUBJECT</span>
          </button>
        </form>
      </Card>

      {/* BLOCK 4: MASTER MESSAGES & CIRCULARS MANAGER */}
      <Card title="4. Master System Messages Log & Deletion Manager (Database Access)">
        {loading ? (
          <p style={{ padding: '16px' }}>Loading messages log...</p>
        ) : messagesList.length === 0 ? (
          <p style={{ padding: '16px', color: '#888' }}>No messages logged in database.</p>
        ) : (
          <div className="table-container responsive-table-stack">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Message Body</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {messagesList.map((msg) => {
                  const id = msg.message_id || msg.id;
                  return (
                    <tr key={id}>
                      <td data-label="Sender" style={{ fontWeight: 700, color: '#3A1F6F' }}>
                        {msg.sender?.email || msg.sender_id || 'User'}
                      </td>
                      <td data-label="Recipient" style={{ fontSize: '13px' }}>
                        {msg.receiver?.email || msg.receiver_id || 'User'}
                      </td>
                      <td data-label="Message Body" style={{ fontSize: '13px', color: '#333' }}>
                        {msg.message_text}
                      </td>
                      <td data-label="Timestamp" style={{ fontSize: '11px', color: '#55636B' }}>
                        {msg.sent_at ? new Date(msg.sent_at).toLocaleString() : 'N/A'}
                      </td>
                      <td data-label="Action">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#DE3B0B' }}
                          onClick={() => handleDeleteSystemMessage(id)}
                          title="Admin Master Deletion"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
