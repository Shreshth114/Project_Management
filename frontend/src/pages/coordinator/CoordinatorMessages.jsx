<<<<<<< HEAD
import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Megaphone } from 'lucide-react';
>>>>>>> origin/main
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

export const CoordinatorMessages = () => {
<<<<<<< HEAD
  const { data, currentUser, sendMessage } = useAuth();
  
  const [taskUpdateSubject, setTaskUpdateSubject] = useState('');
  const [taskUpdateContent, setTaskUpdateContent] = useState('');
  const [success, setSuccess] = useState('');

  // Coordinator can ONLY see Official System Circulars
  const circularsList = (data.messages || []).filter(m => m.category === 'CIRCULAR' || m.senderRole === 'ADMIN');

  const handleSendTaskUpdate = (e) => {
    e.preventDefault();
    sendMessage({
      recipient: 'Enrolled Students (CSE 8th Sem)',
      category: 'TASK_UPDATE',
      senderRole: 'COORDINATOR',
      subject: taskUpdateSubject,
      content: taskUpdateContent
    });

    setTaskUpdateSubject('');
    setTaskUpdateContent('');
    setSuccess('Task update sent exclusively to enrolled students!');
    setTimeout(() => setSuccess(''), 3500);
=======
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
>>>>>>> origin/main
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Coordinator System Updates & Circulars</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Official System Circulars and student task updates governance.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid-2">
        {/* System Circulars List */}
        <Card title="Official System Circulars">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
<<<<<<< HEAD
            {circularsList.map((msg) => (
=======
            {myMessages.map((msg) => (
>>>>>>> origin/main
              <div 
                key={msg.message_id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  padding: '14px',
                  backgroundColor: '#FDF0F2'
                }}
              >
<<<<<<< HEAD
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#DE3B0B' }}>
                    📢 OFFICIAL CIRCULAR
                  </span>
                  <span style={{ fontSize: '11px', color: '#8A9198' }}>{msg.timestamp}</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '14px', color: '#3A1F6F', marginBottom: '6px' }}>
                  {msg.subject}
                </div>
                <p style={{ fontSize: '13px', color: '#55636B', lineHeight: 1.4 }}>{msg.content}</p>
                <div style={{ fontSize: '11px', color: '#8A9198', marginTop: '6px' }}>From: Admin Office</div>
=======
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, color: '#243143', fontSize: '13px' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{new Date(msg.sent_at).toLocaleString()}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#B82226', marginBottom: '4px' }}>
                  Target: User ID {msg.receiver_id}
                </div>
                <p style={{ fontSize: '13px', color: '#444', whiteSpace: 'pre-wrap' }}>{msg.message_text}</p>
>>>>>>> origin/main
              </div>
            ))}
            {myMessages.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>No circulars published yet.</p>}
          </div>
        </Card>

        {/* Send Update About Task to Students */}
        <Card title="Send Update About Task to Enrolled Students">
          <form onSubmit={handleSendTaskUpdate}>
            <div className="form-group">
<<<<<<< HEAD
              <label className="form-label">Target Audience</label>
=======
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
>>>>>>> origin/main
              <input
                type="text"
                className="form-input"
                value="Enrolled Students (CSE Department - Assigned Groups)"
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Task Update Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Update about Task: Final Viva Schedule Shift"
                value={taskUpdateSubject}
                onChange={(e) => setTaskUpdateSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Task Update Content</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Type task update details to be seen exclusively by enrolled students..."
                value={taskUpdateContent}
                onChange={(e) => setTaskUpdateContent(e.target.value)}
                required
              />
            </div>

<<<<<<< HEAD
            <button type="submit" className="btn btn-primary btn-block">
              <Send size={15} />
              <span>SEND UPDATE ABOUT TASK TO STUDENTS</span>
=======
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Megaphone size={16} />
              <span>{loading ? 'SENDING...' : 'ISSUE BROADCAST CIRCULAR'}</span>
>>>>>>> origin/main
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
