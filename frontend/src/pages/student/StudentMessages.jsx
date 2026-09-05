<<<<<<< HEAD
import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Bell } from 'lucide-react';
>>>>>>> origin/main
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

export const StudentMessages = () => {
<<<<<<< HEAD
  const { data, currentUser, sendMessage } = useAuth();
  
  const [facultyRecipient, setFacultyRecipient] = useState('Dr. R. Sharma (Faculty Evaluator)');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState('');

  // Filter direct messages between Student and Faculty ONLY
  const messagesList = (data.messages || []).filter(m => {
    if (m.category === 'CIRCULAR') return false;
    const isStudentFacultyMsg = m.senderRole === 'FACULTY' || m.recipientRole === 'FACULTY' || 
                                m.senderRole === 'STUDENT' || m.recipientRole === 'STUDENT' ||
                                m.recipient?.includes('Dr. R. Sharma') || m.sender?.includes('Dr. R. Sharma');
    return isStudentFacultyMsg;
  });
=======
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [studentGroup, setStudentGroup] = useState(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
>>>>>>> origin/main

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchMessagesAndGroup(currentUser.user_id, currentUser.student_id);
    }
  }, [currentUser]);

  const fetchMessagesAndGroup = async (userId, studentId) => {
    try {
      setLoading(true);
      const [msgs, group] = await Promise.all([
        messageService.getMessagesForUser(userId),
        academicService.getTeamByStudent(studentId)
      ]);
      setMessages(msgs || []);
      setStudentGroup(group);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    sendMessage({
      recipient: facultyRecipient,
      recipientRole: 'FACULTY',
      senderRole: 'STUDENT',
      category: 'DIRECT',
      subject,
      content
    });

    setSubject('');
    setContent('');
    setSuccess('Message dispatched directly to Faculty Evaluator!');
    setTimeout(() => setSuccess(''), 3500);
=======
    if (!studentGroup?.guide?.user_id) {
      setError("No guide assigned to send messages to.");
      return;
    }
    
    try {
      setError(null);
      await messageService.sendMessage({
        sender_id: currentUser.user_id,
        receiver_id: studentGroup.guide.user_id,
        message_text: `[${subject}] ${content}`
      });
      
      setSubject('');
      setContent('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Refresh messages
      const msgs = await messageService.getMessagesForUser(currentUser.user_id);
      setMessages(msgs || []);
    } catch (err) {
      setError(err.message);
    }
>>>>>>> origin/main
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Student ↔ Faculty Direct Messaging</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Communication channel exclusively between student project teams and assigned Faculty Evaluators.
        </p>
      </div>
      
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid-2">
<<<<<<< HEAD
        {/* Direct Messages List */}
        <Card title="Student ↔ Faculty Conversation Inbox">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messagesList.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  padding: '14px',
                  backgroundColor: msg.isUnread ? '#FDF0F2' : '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#3A1F6F', fontSize: '13px' }}>
                    {msg.sender}
                    <span style={{ fontSize: '11px', color: '#8A9198', marginLeft: '6px' }}>
                      ({msg.senderRole || 'FACULTY'})
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#8A9198' }}>{msg.timestamp}</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '14px', color: '#DE3B0B', marginBottom: '6px' }}>
                  {msg.subject}
                </div>
                <p style={{ fontSize: '13px', color: '#55636B', lineHeight: 1.4 }}>{msg.content}</p>
                <div style={{ fontSize: '11px', color: '#8A9198', marginTop: '6px' }}>
                  To: {msg.recipient}
                </div>
              </div>
            ))}

            {messagesList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8A9198' }}>
                No direct messages between student and faculty found.
              </div>
            )}
          </div>
        </Card>

        {/* Compose Form */}
        <Card title="Dispatch Message to Faculty Evaluator">
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Select Faculty Recipient</label>
              <select
                className="form-select"
                value={facultyRecipient}
                onChange={(e) => setFacultyRecipient(e.target.value)}
              >
                <option value="Dr. R. Sharma (Faculty Evaluator)">Dr. R. Sharma (Faculty Evaluator)</option>
                <option value="Prof. V. Kulkarni (Faculty Evaluator)">Prof. V. Kulkarni (Faculty Evaluator)</option>
              </select>
=======
        {/* Inbox / Announcements list */}
        <Card title="Portal Noticeboard & Messages">
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => {
                const isReceived = msg.receiver_id === currentUser.user_id;
                const displayName = isReceived ? (msg.sender?.email || `User ${msg.sender_id}`) : (msg.receiver?.email || `User ${msg.receiver_id}`);
                const roleBadge = isReceived ? msg.sender?.role : msg.receiver?.role;
                
                return (
                  <div 
                    key={msg.message_id}
                    style={{
                      border: '1px solid #E5E5E5',
                      borderRadius: '4px',
                      padding: '14px',
                      backgroundColor: isReceived && !msg.is_read ? '#FCF8E3' : '#FFFFFF',
                      borderLeft: isReceived ? '4px solid #114C94' : '4px solid #E5E5E5'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700, color: '#243143', fontSize: '14px' }}>
                        {isReceived ? `From: ${displayName}` : `To: ${displayName}`}
                        <span style={{ marginLeft: '8px', fontSize: '11px', backgroundColor: '#E5E5E5', padding: '2px 6px', borderRadius: '4px' }}>
                          {roleBadge}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(msg.sent_at).toLocaleString()}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#444', whiteSpace: 'pre-wrap' }}>{msg.message_text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Compose Form */}
        <Card title="Send Message to Guide">
          {success && (
            <div className="alert alert-success">
              Message dispatched to guide successfully.
            </div>
          )}
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Recipient</label>
              <input
                type="text"
                className="form-input"
                value={studentGroup?.guide ? `${studentGroup.guide.name} (Guide)` : 'Loading guide...'}
                disabled
              />
>>>>>>> origin/main
            </div>

            <div className="form-group">
              <label className="form-label">Message Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Query regarding viva voce rubric scoring"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Body</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Type your message to the faculty evaluator..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

<<<<<<< HEAD
            <button type="submit" className="btn btn-primary btn-block">
=======
            <button type="submit" className="btn btn-primary" disabled={!studentGroup?.guide}>
>>>>>>> origin/main
              <Send size={15} />
              <span>DISPATCH MESSAGE TO FACULTY</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
