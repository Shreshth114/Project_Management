import React, { useState } from 'react';
import { 
  PlusSquare, 
  Calendar, 
  Send, 
  CheckCircle, 
  Trash2, 
  UserCheck, 
  MessageSquare, 
  Settings,
  Edit
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminMasterEdit = () => {
  const { data, sendMessage, deleteMessage } = useAuth();

  // Deadlines State
  const [selectedTask, setSelectedTask] = useState(data.tasks[0]?.id || 'tsk-grp-01');
  const [newSubmissionDeadline, setNewSubmissionDeadline] = useState('2025-11-15');
  const [newEvalDeadline, setNewEvalDeadline] = useState('2025-11-20');
  const [deadlineSuccess, setDeadlineSuccess] = useState('');

  // Circular State
  const [circularSubject, setCircularSubject] = useState('');
  const [circularContent, setCircularContent] = useState('');
  const [circularSuccess, setCircularSuccess] = useState('');

  // Assign Coordinator State
  const [subjectToAssign, setSubjectToAssign] = useState(data.subjects[0]?.code || '21CSP81');
  const [newCoordinatorName, setNewCoordinatorName] = useState('Prof. V. Kulkarni');
  const [assignSuccess, setAssignSuccess] = useState('');

  // Master Message Deletion Notice State
  const [msgNotice, setMsgNotice] = useState('');

  const handleExtendDeadlines = (e) => {
    e.preventDefault();
    const taskObj = data.tasks.find(t => t.id === selectedTask);
    if (taskObj) {
      taskObj.deadline = newSubmissionDeadline;
    }
    setDeadlineSuccess(`Submission deadline for "${taskObj?.title || 'Task'}" extended to ${newSubmissionDeadline}!`);
    setTimeout(() => setDeadlineSuccess(''), 4000);
  };

  const handleBroadcastCircular = (e) => {
    e.preventDefault();
    sendMessage({
      recipient: 'All System Users (Students, Faculty, Coordinators)',
      category: 'CIRCULAR',
      senderRole: 'ADMIN',
      sender: 'Academic Admin Office',
      subject: circularSubject,
      content: circularContent
    });

    setCircularSubject('');
    setCircularContent('');
    setCircularSuccess('Official System Circular broadcasted to all users successfully!');
    setTimeout(() => setCircularSuccess(''), 4000);
  };

  const handleAssignCoordinator = (e) => {
    e.preventDefault();
    const subObj = data.subjects.find(s => s.code === subjectToAssign);
    if (subObj) {
      subObj.coordinator = newCoordinatorName;
    }
    setAssignSuccess(`Assigned ${newCoordinatorName} as Coordinator for ${subjectToAssign}!`);
    setTimeout(() => setAssignSuccess(''), 4000);
  };

  const handleDeleteSystemMessage = (msgId) => {
    deleteMessage(msgId);
    setMsgNotice('Message permanently deleted by System Administrator.');
    setTimeout(() => setMsgNotice(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Admin Master Editing & System Control Studio</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Central control page to edit deadlines, assign coordinators, write official circulars, and manage/delete system messages.
        </p>
      </div>

      {msgNotice && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{msgNotice}</span>
        </div>
      )}

      {/* BLOCK 1: EDIT DEADLINES & EVALUATION DATES */}
      <Card title="1. Edit Submission & Evaluation Deadlines">
        {deadlineSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{deadlineSuccess}</span>
          </div>
        )}

        <form onSubmit={handleExtendDeadlines}>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Select Milestone Task</label>
              <select
                className="form-select"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                {data.tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.deadline})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">New Student Submission Deadline</label>
              <input
                type="date"
                className="form-input"
                value={newSubmissionDeadline}
                onChange={(e) => setNewSubmissionDeadline(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Faculty Evaluation Deadline</label>
              <input
                type="date"
                className="form-input"
                value={newEvalDeadline}
                onChange={(e) => setNewEvalDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-purple">
            <Calendar size={16} />
            <span>APPLY DEADLINE EXTENSION</span>
          </button>
        </form>
      </Card>

      {/* BLOCK 2: WRITE OUT OFFICIAL CIRCULARS */}
      <Card title="2. Broadcast System Circular (Visible to Everyone)">
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
              placeholder="Type circular announcement to be seen by all students, faculty, and coordinators..."
              value={circularContent}
              onChange={(e) => setCircularContent(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-magenta btn-block">
            <Send size={16} />
            <span>BROADCAST CIRCULAR TO ALL USERS</span>
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
                {data.subjects.map(s => (
                  <option key={s.id} value={s.code}>
                    {s.code} - {s.name} (Current: {s.coordinator})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Coordinator</label>
              <select
                className="form-select"
                value={newCoordinatorName}
                onChange={(e) => setNewCoordinatorName(e.target.value)}
              >
                {data.facultyGuides.map(g => (
                  <option key={g.id} value={g.name}>{g.name} ({g.designation})</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <UserCheck size={16} />
            <span>ASSIGN COORDINATOR TO SUBJECT</span>
          </button>
        </form>
      </Card>

      {/* BLOCK 4: MASTER MESSAGES & CIRCULARS MANAGER (ADMIN CAN DELETE ALL MESSAGES) */}
      <Card title="4. Master System Messages Log & Deletion Manager (Admin Master Access)">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Category</th>
                <th>Recipient</th>
                <th>Subject Line</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(data.messages || []).map((msg) => (
                <tr key={msg.id}>
                  <td data-label="Sender" style={{ fontWeight: 700, color: '#3A1F6F' }}>{msg.sender}</td>
                  <td data-label="Category"><Badge variant="purple">{msg.category || 'DIRECT'}</Badge></td>
                  <td data-label="Recipient" style={{ fontSize: '13px' }}>{msg.recipient}</td>
                  <td data-label="Subject Line" style={{ fontWeight: 600, color: '#DE3B0B' }}>{msg.subject}</td>
                  <td data-label="Timestamp" style={{ fontSize: '11px', color: '#55636B' }}>{msg.timestamp}</td>
                  <td data-label="Action">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#DE3B0B' }}
                      onClick={() => handleDeleteSystemMessage(msg.id)}
                      title="Admin Master Deletion"
                    >
                      <Trash2 size={13} />
                      <span>Delete Message</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
