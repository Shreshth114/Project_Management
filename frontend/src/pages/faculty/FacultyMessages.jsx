<<<<<<< HEAD
import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
>>>>>>> origin/main
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

export const FacultyMessages = () => {
<<<<<<< HEAD
  const { data, currentUser, sendMessage } = useAuth();
  
  const [recipientStudent, setRecipientStudent] = useState('Rahul Sharma (1MS21CS042)');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState('');

  // Outbox displays Circulars and direct messages between Faculty and Students ONLY (no coordinator or admin direct messages)
  const messagesList = (data.messages || []).filter(m => {
    if (m.category === 'CIRCULAR') return true;
    // Filter Student <-> Faculty ONLY
    const isStudentMessage = m.senderRole === 'STUDENT' || m.recipientRole === 'STUDENT' || m.recipient?.includes('Student') || m.recipient?.includes('Rahul');
    return isStudentMessage;
  });
=======
  const { currentUser } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [recipientGroupId, setRecipientGroupId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
>>>>>>> origin/main

  useEffect(() => {
    if (currentUser?.user_id && currentUser?.faculty_id) {
      fetchMessagesAndGroups(currentUser.user_id, currentUser.faculty_id);
    }
  }, [currentUser]);

  const fetchMessagesAndGroups = async (userId, facultyId) => {
    try {
      setLoading(true);
      const [fetchedMessages, fetchedGroups] = await Promise.all([
        messageService.getMessagesForUser(userId),
        academicService.getTeams({ guide_id: facultyId })
      ]);
      setMessages(fetchedMessages || []);
      setGroups(fetchedGroups || []);
      if (fetchedGroups && fetchedGroups.length > 0) {
        setRecipientGroupId(fetchedGroups[0].team_id);
      }
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
      recipient: recipientStudent,
      category: 'DIRECT',
      senderRole: 'FACULTY',
      recipientRole: 'STUDENT',
      subject,
      content
    });

    setSubject('');
    setContent('');
    setSuccess('Direct message sent to student!');
    setTimeout(() => setSuccess(''), 3500);
=======
    const g = groups.find(x => x.team_id === Number(recipientGroupId));
    if (!g) return;
    
    if (!g.members || g.members.length === 0) {
      setError("This group has no members to send messages to.");
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      // Send individual message to each member in the group
      await Promise.all(
        g.members.map(member => 
          messageService.sendMessage({
            sender_id: currentUser.user_id,
            receiver_id: member.user_id,
            message_text: `[${subject}] ${content}`
          })
        )
      );
      
      setSubject('');
      setContent('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      
      // Refresh messages
      const msgs = await messageService.getMessagesForUser(currentUser.user_id);
      setMessages(msgs || []);
    } catch (err) {
      setError("Failed to send message: " + err.message);
    } finally {
      setSending(false);
    }
>>>>>>> origin/main
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Faculty Communication Portal</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Official channel for direct messaging between Faculty Guides and assigned Students.
        </p>
      </div>

<<<<<<< HEAD
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Outbox & Messages List (No Delete Button) */}
        <Card title="Messages & Official Circulars Outbox">
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
                    {msg.sender}
                    <span style={{ fontSize: '11px', color: '#8A9198', marginLeft: '6px' }}>
                      ({msg.category || 'DIRECT'})
                    </span>
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
        <Card title="Compose Direct Message to Assigned Student">
=======
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div className="grid-2">
        <Card title="Guide Outbox & History">
          {loading ? (
            <p>Loading history...</p>
          ) : messages.length === 0 ? (
            <p>No messages found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => {
                const isSentByMe = msg.sender_id === currentUser.user_id;
                const otherUserEmail = isSentByMe ? msg.receiver?.email : msg.sender?.email;
                return (
                  <div 
                    key={msg.message_id}
                    style={{
                      border: '1px solid #E5E5E5',
                      borderRadius: '4px',
                      padding: '14px',
                      backgroundColor: '#FFFFFF',
                      borderLeft: isSentByMe ? '4px solid #A68E24' : '4px solid #114C94'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 700, color: '#243143', fontSize: '13px' }}>
                        {isSentByMe ? `To: ${otherUserEmail}` : `From: ${otherUserEmail}`}
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

        <Card title="Send Guide Instructions">
          {sent && <div className="alert alert-success">Instructions dispatched to student batch successfully.</div>}
>>>>>>> origin/main
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Select Student Recipient</label>
              <select
                className="form-select"
<<<<<<< HEAD
                value={recipientStudent}
                onChange={(e) => setRecipientStudent(e.target.value)}
              >
                <option value="Rahul Sharma (1MS21CS042)">Rahul Sharma (1MS21CS042) - Group G01</option>
                <option value="Ananya Hegde (1MS21CS015)">Ananya Hegde (1MS21CS015) - Group G01</option>
                <option value="Karthik Raja (1MS21CS062)">Karthik Raja (1MS21CS062) - Group G01</option>
                <option value="Priya V (1MS21CS099)">Priya V (1MS21CS099) - Group G01</option>
=======
                value={recipientGroupId}
                onChange={(e) => setRecipientGroupId(e.target.value)}
                required
              >
                {groups.map(g => (
                  <option key={g.team_id} value={g.team_id}>
                    {g.team_code} ({g.subject?.subject_name})
                  </option>
                ))}
>>>>>>> origin/main
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
                placeholder="Type your message to the student..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

<<<<<<< HEAD
            <button type="submit" className="btn btn-primary btn-block">
              <Send size={15} />
              <span>SEND DIRECT MESSAGE TO STUDENT</span>
=======
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <Send size={15} />
              <span>{sending ? 'SENDING...' : 'DISPATCH INSTRUCTION'}</span>
>>>>>>> origin/main
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
