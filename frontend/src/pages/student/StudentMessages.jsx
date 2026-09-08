import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, MessageSquare, Bell, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';

import { supabase } from '../../lib/supabase';

export const StudentMessages = () => {
  const { currentUser } = useAuth();
  
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const facs = await academicService.getFaculty();
        let defaultFacId = '';
        if (facs && facs.length > 0) {
          setFacultyList(facs);
          defaultFacId = String(facs[0].faculty_id);
        }

        // Auto-select assigned guide if available
        if (currentUser?.student_id) {
          try {
            const team = await academicService.getTeamByStudent(currentUser.student_id);
            if (team?.guide?.faculty_id) {
              defaultFacId = String(team.guide.faculty_id);
            }
          } catch (e) {
            console.warn("Notice: could not pre-select guide:", e);
          }
        }

        if (defaultFacId) {
          setSelectedFacultyId(defaultFacId);
        }
      } catch (err) {
        console.error("Error loading faculty:", err);
      }
    };

    initData();

    if (currentUser?.user_id) {
      fetchMessages(currentUser.user_id);
    }
  }, [currentUser]);

  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      const msgs = await messageService.getMessagesForUser(userId);
      setMessages(msgs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError(null);

    const targetFaculty = facultyList.find(f => String(f.faculty_id) === String(selectedFacultyId));
    if (!targetFaculty) {
      setError('Please select an active faculty recipient.');
      return;
    }

    let targetUserId = targetFaculty.user_id;
    if (!targetUserId) {
      const { data: facData } = await supabase.from('faculty').select('user_id').eq('faculty_id', targetFaculty.faculty_id).maybeSingle();
      if (facData?.user_id) targetUserId = facData.user_id;
    }

    if (!targetUserId) {
      setError(`Faculty member ${targetFaculty.name} does not have an active institutional user account linked.`);
      return;
    }

    if (!currentUser?.user_id) {
      setError('User not authenticated.');
      return;
    }

    try {
      await messageService.sendMessage({
        sender_id: currentUser.user_id,
        receiver_id: targetUserId,
        message_text: `[${subject}] ${content}`
      });
      const msgs = await messageService.getMessagesForUser(currentUser.user_id);
      setMessages(msgs || []);
      setSubject('');
      setContent('');
      setSuccess(`Message sent directly to ${targetFaculty.name}!`);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to dispatch message.');
    }
  };

  const handleReply = (msg) => {
    const replySubject = msg.subject.startsWith('Re: ') ? msg.subject : `Re: ${msg.subject}`;
    setSubject(replySubject);
    // If sender was a faculty, select them in dropdown
    const senderFaculty = facultyList.find(f => f.user_id === msg.senderId);
    if (senderFaculty) {
      setSelectedFacultyId(String(senderFaculty.faculty_id));
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const messagesList = (messages || []).map(m => ({
    id: m.message_id || m.id,
    senderId: m.sender_id,
    receiverId: m.receiver_id,
    sender: m.sender?.email || 'User',
    senderRole: m.sender?.role || 'FACULTY',
    recipient: m.receiver?.email || 'Recipient',
    subject: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(1, m.message_text.indexOf(']')) 
      : 'Direct Message',
    content: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(m.message_text.indexOf(']') + 1).trim() 
      : m.message_text,
    timestamp: m.sent_at ? new Date(m.sent_at).toLocaleString() : 'Recently',
    isUnread: !m.read_status,
    isIncoming: m.receiver_id === currentUser?.user_id
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Student ↔ Faculty Direct Messaging</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Communication channel exclusively between student project teams and assigned Faculty Evaluators.
        </p>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Messages List */}
        <Card title="Official Message History">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messagesList.map((m) => (
              <div 
                key={m.id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '6px',
                  padding: '14px',
                  backgroundColor: m.isUnread ? '#FDF8F5' : '#FFFFFF',
                  borderLeft: m.isUnread ? '4px solid #DE3B0B' : '4px solid #3A1F6F'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 800, color: '#3A1F6F', fontSize: '14px' }}>
                    {m.subject}
                  </div>
                  <div style={{ fontSize: '11px', color: '#55636B' }}>
                    {m.timestamp}
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#B8115B', fontWeight: 700, marginBottom: '6px' }}>
                  From: {m.sender} ➔ To: {m.recipient}
                </div>

                <div style={{ fontSize: '13px', color: '#243143', lineHeight: '1.5' }}>
                  {m.content}
                </div>

                {m.isIncoming && (
                  <div style={{ marginTop: '10px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 10px', fontSize: '11px' }}
                      onClick={() => handleReply(m)}
                    >
                      Reply to Faculty
                    </button>
                  </div>
                )}
              </div>
            ))}

            {messagesList.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8A9198' }}>
                No direct messages between student and faculty recorded yet.
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
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
              >
                {facultyList.length > 0 ? (
                  facultyList.map(f => (
                    <option key={f.faculty_id} value={f.faculty_id}>
                      {f.name} ({f.is_coordinator ? 'Coordinator & Faculty' : 'Faculty Guide'})
                    </option>
                  ))
                ) : (
                  <option value="">No faculty members available</option>
                )}
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

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={facultyList.length === 0}
            >
              <Send size={15} />
              <span>DISPATCH MESSAGE TO FACULTY</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
