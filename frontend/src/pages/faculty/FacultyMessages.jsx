import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

export const FacultyMessages = () => {
  const { data, currentUser, sendMessage } = useAuth();
  
  const [recipient, setRecipient] = useState('Rahul Sharma (1MS21CS042)');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (currentUser?.user_id && currentUser?.faculty_id) {
      fetchMessagesAndGroups(currentUser.user_id, currentUser.faculty_id);
    }
  }, [currentUser]);

  const fetchMessagesAndGroups = async (userId, facultyId) => {
    try {
      const [fetchedMessages, fetchedGroups] = await Promise.all([
        messageService.getMessagesForUser(userId),
        academicService.getTeams({ guide_id: facultyId })
      ]);
      setMessages(fetchedMessages || []);
      setGroups(fetchedGroups || []);
    } catch (err) {
      console.warn("Messages & groups fetch notice:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (sendMessage) {
      sendMessage({
        recipient,
        category: 'DIRECT',
        senderRole: 'FACULTY',
        recipientRole: 'STUDENT',
        subject,
        content
      });
    }

    if (currentUser?.user_id) {
      try {
        setSending(true);
        const selectedGrp = groups.find(g => String(g.team_id) === String(recipient) || g.team_code === recipient);
        if (selectedGrp && selectedGrp.members && selectedGrp.members.length > 0) {
          await Promise.all(
            selectedGrp.members.map(member => 
              messageService.sendMessage({
                sender_id: currentUser.user_id,
                receiver_id: member.user_id,
                message_text: `[${subject}] ${content}`
              })
            )
          );
        }
        const updated = await messageService.getMessagesForUser(currentUser.user_id);
        setMessages(updated || []);
      } catch (err) {
        console.warn('Direct messaging notice:', err);
      } finally {
        setSending(false);
      }
    }

    setSubject('');
    setContent('');
    setSuccess('Direct message sent to student / group!');
    setTimeout(() => setSuccess(''), 3500);
  };

  // Outbox displays Circulars and direct messages between Faculty and Students ONLY
  const localList = (data?.messages || []).filter(m => {
    if (m.category === 'CIRCULAR') return true;
    const isStudentMessage = m.senderRole === 'STUDENT' || m.recipientRole === 'STUDENT' || m.recipient?.includes('Student') || m.recipient?.includes('Rahul');
    return isStudentMessage;
  });

  const dbList = (messages || []).map(m => ({
    id: m.message_id || m.id,
    sender: m.sender?.full_name || 'Faculty Member',
    senderRole: m.sender?.role || 'FACULTY',
    recipient: m.receiver?.full_name || 'Student / Group',
    category: 'DIRECT',
    subject: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(1, m.message_text.indexOf(']'))
      : 'Direct Message',
    content: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(m.message_text.indexOf(']') + 1).trim()
      : m.message_text,
    timestamp: m.sent_at ? new Date(m.sent_at).toLocaleString() : 'Just now'
  }));

  const messagesList = [...dbList, ...localList];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Faculty Communication Hub</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Official Circulars and direct correspondence with assigned student project teams.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div className="grid-2">
        {/* Messages & Circulars List */}
        <Card title="Correspondence & Circulars Inbox">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messagesList.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  padding: '14px',
                  backgroundColor: msg.category === 'CIRCULAR' ? '#FDF0F2' : '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#3A1F6F', fontSize: '13px' }}>
                    {msg.category === 'CIRCULAR' ? '📢 OFFICIAL CIRCULAR' : msg.sender}
                  </div>
                  <span style={{ fontSize: '11px', color: '#8A9198' }}>{msg.timestamp}</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '14px', color: '#DE3B0B', marginBottom: '6px' }}>
                  {msg.subject}
                </div>
                <p style={{ fontSize: '13px', color: '#55636B', lineHeight: 1.4 }}>{msg.content}</p>
                <div style={{ fontSize: '11px', color: '#8A9198', marginTop: '6px' }}>
                  Recipient: {msg.recipient}
                </div>
              </div>
            ))}

            {messagesList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8A9198' }}>
                No messages or circulars found.
              </div>
            )}
          </div>
        </Card>

        {/* Send Direct Message to Student */}
        <Card title="Compose Direct Message to Assigned Student / Group">
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Select Recipient</label>
              <select
                className="form-select"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              >
                {groups.length > 0 && (
                  <optgroup label="Assigned Project Groups">
                    {groups.map(g => (
                      <option key={g.team_id} value={g.team_id}>
                        {g.team_code} ({g.subject?.subject_name || 'Group Project'})
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Assigned Students">
                  <option value="Rahul Sharma (1MS21CS042)">Rahul Sharma (1MS21CS042) - Group G01</option>
                  <option value="Ananya Hegde (1MS21CS015)">Ananya Hegde (1MS21CS015) - Group G01</option>
                  <option value="Karthik Raja (1MS21CS062)">Karthik Raja (1MS21CS062) - Group G01</option>
                  <option value="Priya V (1MS21CS099)">Priya V (1MS21CS099) - Group G01</option>
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Message Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Guidance regarding viva defense slides"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Details</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Type your message directly to the student or group..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
              <Send size={15} />
              <span>{sending ? 'SENDING...' : 'SEND DIRECT MESSAGE'}</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
