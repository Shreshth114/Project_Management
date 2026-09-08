import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, MessageSquare, Megaphone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

export const CoordinatorMessages = () => {
  const { currentUser } = useAuth();
  
  const [taskUpdateSubject, setTaskUpdateSubject] = useState('');
  const [taskUpdateContent, setTaskUpdateContent] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.user_id) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTeams, msgs] = await Promise.all([
        academicService.getTeams().catch(() => []),
        messageService.getMessagesForUser(currentUser.user_id).catch(() => [])
      ]);
      setTeams(fetchedTeams || []);
      setMessages(msgs || []);
    } catch (err) {
      console.warn("Error loading coordinator messages data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTaskUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.user_id) {
      setError('User session not active.');
      return;
    }

    if (teams.length === 0) {
      setError('No teams registered to send notifications to.');
      return;
    }

    try {
      const fullMessage = `[${taskUpdateSubject}]\n${taskUpdateContent}`;
      const promises = [];
      teams.forEach(team => {
        if (team.members) {
          team.members.forEach(member => {
            if (member.user_id) {
              promises.push(messageService.sendMessage({
                sender_id: currentUser.user_id,
                receiver_id: member.user_id,
                message_text: fullMessage
              }));
            }
          });
        }
      });
      await Promise.all(promises);

      const updated = await messageService.getMessagesForUser(currentUser.user_id);
      setMessages(updated || []);

      setTaskUpdateSubject('');
      setTaskUpdateContent('');
      setSuccess('Circular dispatched to all enrolled students in the department!');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to dispatch circular.');
    }
  };

  const circularsList = (messages || []).map(m => ({
    id: m.message_id || m.id,
    sender: m.sender?.email || 'Coordinator',
    subject: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(1, m.message_text.indexOf(']'))
      : 'Circular Message',
    content: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(m.message_text.indexOf(']') + 1).trim()
      : m.message_text,
    timestamp: m.sent_at ? new Date(m.sent_at).toLocaleString() : 'Recently'
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Coordinator System Updates & Circulars</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Dispatch official circulars and task update notifications to all enrolled student project teams.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Sent Circulars List */}
        <Card title="Dispatched Circulars & Communications">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {circularsList.length > 0 ? (
              circularsList.map((msg) => (
                <div 
                  key={msg.id}
                  style={{
                    border: '1px solid #E5E5E5',
                    borderRadius: '4px',
                    padding: '14px',
                    backgroundColor: '#FDF0F2',
                    borderLeft: '4px solid #DE3B0B'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#DE3B0B' }}>
                      📢 COORDINATOR CIRCULAR
                    </span>
                    <span style={{ fontSize: '11px', color: '#8A9198' }}>{msg.timestamp}</span>
                  </div>

                  <div style={{ fontWeight: 700, color: '#3A1F6F', fontSize: '14px', marginBottom: '4px' }}>
                    {msg.subject}
                  </div>

                  <div style={{ fontSize: '13px', color: '#55636B', lineHeight: '1.5' }}>
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8A9198' }}>
                No circulars dispatched yet. Use the form to send your first update.
              </div>
            )}
          </div>
        </Card>

        {/* Send Circular / Task Update Form */}
        <Card title="Dispatch New Circular to All Students">
          <form onSubmit={handleSendTaskUpdate}>
            <div className="form-group">
              <label className="form-label">Circular / Update Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Final Report Submission Deadline Extended"
                value={taskUpdateSubject}
                onChange={(e) => setTaskUpdateSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Circular Content</label>
              <textarea
                className="form-textarea"
                rows={7}
                placeholder="Type the full circular text or task update to broadcast to all enrolled student groups..."
                value={taskUpdateContent}
                onChange={(e) => setTaskUpdateContent(e.target.value)}
                required
              />
            </div>

            <div style={{ fontSize: '12px', color: '#55636B', marginBottom: '12px' }}>
              This will be sent to all {teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)} enrolled students across {teams.length} registered project groups.
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={teams.length === 0}
            >
              <Megaphone size={15} />
              <span>BROADCAST CIRCULAR TO ALL STUDENTS</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
