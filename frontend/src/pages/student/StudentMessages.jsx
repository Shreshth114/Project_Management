import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

export const StudentMessages = () => {
  const { data, currentUser, sendMessage } = useAuth();
  
  const [facultyRecipient, setFacultyRecipient] = useState('Dr. R. Sharma (Faculty Evaluator)');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [studentGroup, setStudentGroup] = useState(null);
  const [loading, setLoading] = useState(false);

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
        studentId ? academicService.getTeamByStudent(studentId) : Promise.resolve(null)
      ]);
      setMessages(msgs || []);
      setStudentGroup(group);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (sendMessage) {
      sendMessage({
        recipient: facultyRecipient,
        recipientRole: 'FACULTY',
        senderRole: 'STUDENT',
        category: 'DIRECT',
        subject,
        content
      });
    }

    if (currentUser?.user_id && studentGroup?.guide?.user_id) {
      try {
        setError(null);
        await messageService.sendMessage({
          sender_id: currentUser.user_id,
          receiver_id: studentGroup.guide.user_id,
          message_text: `[${subject}] ${content}`
        });
        const msgs = await messageService.getMessagesForUser(currentUser.user_id);
        setMessages(msgs || []);
      } catch (err) {
        console.error(err);
      }
    }

    setSubject('');
    setContent('');
    setSuccess('Message dispatched directly to Faculty Evaluator!');
    setTimeout(() => setSuccess(''), 3500);
  };

  // Filter direct messages between Student and Faculty ONLY
  const localMsgs = (data?.messages || []).filter(m => {
    if (m.category === 'CIRCULAR') return false;
    const isStudentFacultyMsg = m.senderRole === 'FACULTY' || m.recipientRole === 'FACULTY' || 
                                m.senderRole === 'STUDENT' || m.recipientRole === 'STUDENT' ||
                                m.recipient?.includes('Dr. R. Sharma') || m.sender?.includes('Dr. R. Sharma');
    return isStudentFacultyMsg;
  });

  const dbMsgs = (messages || []).map(m => ({
    id: m.message_id || m.id,
    sender: m.sender?.full_name || 'Faculty / Student',
    senderRole: m.sender?.role || 'FACULTY',
    recipient: m.receiver?.full_name || facultyRecipient,
    subject: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(1, m.message_text.indexOf(']')) 
      : 'Direct Message',
    content: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(m.message_text.indexOf(']') + 1).trim() 
      : m.message_text,
    timestamp: m.sent_at ? new Date(m.sent_at).toLocaleString() : 'Just now',
    isUnread: !m.read_status
  }));

  const messagesList = [...dbMsgs, ...localMsgs];

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

            <button type="submit" className="btn btn-primary btn-block">
              <Send size={15} />
              <span>DISPATCH MESSAGE TO FACULTY</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
