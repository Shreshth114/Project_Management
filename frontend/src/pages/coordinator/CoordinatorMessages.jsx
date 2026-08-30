import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Megaphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

export const CoordinatorMessages = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [recipientTeam, setRecipientTeam] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sent, setSent] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.user_id) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      const fetchedTeams = await academicService.getTeams();
      setTeams(fetchedTeams || []);
      if (fetchedTeams?.length > 0) {
        setRecipientTeam(fetchedTeams[0].team_id);
      }
      
      const msgs = await messageService.getMessagesForUser(currentUser.user_id);
      // Only show messages sent by coordinator as "circulars"
      setMyMessages(msgs.filter(m => m.sender_id === currentUser.user_id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!recipientTeam) return;
    setLoading(true);
    
    try {
      // Find team to get all member user_ids
      const team = teams.find(t => t.team_id === recipientTeam);
      if (team && team.members) {
        // Send message to each member
        const fullMessage = `[${subject}]\n${content}`;
        const promises = team.members.map(member => 
          messageService.sendMessage({
            sender_id: currentUser.user_id,
            receiver_id: member.user_id,
            message_text: fullMessage
          })
        );
        await Promise.all(promises);
      }
      
      setSubject('');
      setContent('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      loadData(); // Refresh list
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Coordinator Department Broadcast Center</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Issue official department circulars, viva schedules, and submission deadlines.
        </p>
      </div>

      <div className="grid-2">
        <Card title="Published Circulars & Announcements">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myMessages.map((msg) => (
              <div 
                key={msg.message_id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  padding: '14px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, color: '#243143', fontSize: '13px' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{new Date(msg.sent_at).toLocaleString()}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#B82226', marginBottom: '4px' }}>
                  Target: User ID {msg.receiver_id}
                </div>
                <p style={{ fontSize: '13px', color: '#444', whiteSpace: 'pre-wrap' }}>{msg.message_text}</p>
              </div>
            ))}
            {myMessages.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>No circulars published yet.</p>}
          </div>
        </Card>

        <Card title="Broadcast Circular / Announcement">
          {sent && <div className="alert alert-success">Department broadcast issued successfully!</div>}
          <form onSubmit={handleBroadcast}>
            <div className="form-group">
              <label className="form-label">Broadcast Target (Team)</label>
              <select
                className="form-select"
                value={recipientTeam}
                onChange={(e) => setRecipientTeam(e.target.value)}
              >
                {teams.map(t => (
                  <option key={t.team_id} value={t.team_id}>{t.team_code} - {t.subject?.subject_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Circular Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mandatory Hard-Bound Dissertation Submission Guidelines"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Announcement Content</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Enter formal circular text..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Megaphone size={16} />
              <span>{loading ? 'SENDING...' : 'ISSUE BROADCAST CIRCULAR'}</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
