import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

export const StudentMessages = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [studentGroup, setStudentGroup] = useState(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Messages & Academic Announcements</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Official communication channel with faculty guides and project coordinators.
        </p>
      </div>
      
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div className="grid-2">
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
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Query regarding Hardware setup demo"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Details</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Type message content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={!studentGroup?.guide}>
              <Send size={15} />
              <span>SEND MESSAGE</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
