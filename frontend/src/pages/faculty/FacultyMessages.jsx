import React, { useState, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

export const FacultyMessages = () => {
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Faculty Communication & Instructions</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Broadcast guide remarks, review dates, and code requirements to your advised batches.
        </p>
      </div>

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
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Target Advised Group</label>
              <select
                className="form-select"
                value={recipientGroupId}
                onChange={(e) => setRecipientGroupId(e.target.value)}
                required
              >
                {groups.map(g => (
                  <option key={g.team_id} value={g.team_id}>
                    {g.team_code} ({g.subject?.subject_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Code Review Feedback before Friday presentation"
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
                placeholder="Enter instructions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={sending}>
              <Send size={15} />
              <span>{sending ? 'SENDING...' : 'DISPATCH INSTRUCTION'}</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
