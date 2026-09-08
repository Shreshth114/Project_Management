import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, MessageSquare, AlertCircle, Reply, Users, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { messageService } from '../../services/messageService';
import { academicService } from '../../services/academicService';
import { supabase } from '../../lib/supabase';

export const FacultyMessages = () => {
  const { currentUser } = useAuth();
  
  const [recipientType, setRecipientType] = useState('group'); // 'group' or 'student'
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedStudentUserId, setSelectedStudentUserId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchMessagesAndGroups(currentUser.user_id, currentUser.faculty_id);
    }
  }, [currentUser]);

  const fetchMessagesAndGroups = async (userId, facultyId) => {
    try {
      let resolvedFacultyId = facultyId;
      if (!resolvedFacultyId) {
        const { data: fac } = await supabase
          .from('faculty')
          .select('faculty_id')
          .eq('user_id', userId)
          .maybeSingle();
        if (fac?.faculty_id) resolvedFacultyId = fac.faculty_id;
      }

      const [fetchedMessages, fetchedGroups] = await Promise.all([
        messageService.getMessagesForUser(userId).catch(() => []),
        resolvedFacultyId ? academicService.getTeams({ guide_id: resolvedFacultyId }).catch(() => []) : []
      ]);

      setMessages(fetchedMessages || []);
      setGroups(fetchedGroups || []);
      if (fetchedGroups && fetchedGroups.length > 0) {
        setSelectedTeamId(String(fetchedGroups[0].team_id));
        const firstMemberWithUser = (fetchedGroups[0].members || []).find(m => m.user_id);
        if (firstMemberWithUser) {
          setSelectedStudentUserId(String(firstMemberWithUser.user_id));
        }
      }
    } catch (err) {
      console.warn("Messages & groups fetch notice:", err);
    }
  };

  // Collect all unique students from assigned groups
  const allStudents = [];
  const seenStudentIds = new Set();
  (groups || []).forEach(g => {
    (g.members || []).forEach(m => {
      if (m.user_id && !seenStudentIds.has(m.user_id)) {
        seenStudentIds.add(m.user_id);
        allStudents.push({
          user_id: m.user_id,
          name: m.name || m.usn || `Student (${m.user_id})`,
          usn: m.usn,
          groupCode: g.team_code
        });
      }
    });
  });

  const handleSend = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.user_id) {
      setError('User session not active.');
      return;
    }

    try {
      setSending(true);

      if (recipientType === 'student') {
        if (!selectedStudentUserId) {
          setError('Please select a student recipient.');
          setSending(false);
          return;
        }

        await messageService.sendMessage({
          sender_id: currentUser.user_id,
          receiver_id: Number(selectedStudentUserId),
          message_text: `[${subject}] ${content}`
        });

        const targetStd = allStudents.find(s => String(s.user_id) === String(selectedStudentUserId));
        setSuccess(`Direct message sent to ${targetStd?.name || 'student'}!`);
      } else {
        const selectedGrp = groups.find(g => String(g.team_id) === String(selectedTeamId));
        if (!selectedGrp) {
          setError('Please select an assigned group to message.');
          setSending(false);
          return;
        }

        const validMembers = (selectedGrp.members || []).filter(m => m.user_id);
        if (validMembers.length === 0) {
          setError(`No linked user accounts found for members of ${selectedGrp.team_code}.`);
          setSending(false);
          return;
        }

        await Promise.all(
          validMembers.map(member => 
            messageService.sendMessage({
              sender_id: currentUser.user_id,
              receiver_id: member.user_id,
              message_text: `[${subject}] ${content}`
            })
          )
        );

        setSuccess(`Direct message sent to all members of ${selectedGrp.team_code}!`);
      }

      const updated = await messageService.getMessagesForUser(currentUser.user_id);
      setMessages(updated || []);
      setSubject('');
      setContent('');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.warn('Direct messaging notice:', err);
      setError(err.message || 'Error sending message.');
    } finally {
      setSending(false);
    }
  };

  const handleReplyToStudent = (msg) => {
    setRecipientType('student');
    setSelectedStudentUserId(String(msg.senderId));
    setSubject(msg.subject.startsWith('Re: ') ? msg.subject : `Re: ${msg.subject}`);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const messagesList = (messages || []).map(m => ({
    id: m.message_id || m.id,
    senderId: m.sender_id,
    receiverId: m.receiver_id,
    sender: m.sender?.email || 'Student',
    senderRole: m.sender?.role || 'STUDENT',
    recipient: m.receiver?.email || 'Recipient',
    subject: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(1, m.message_text.indexOf(']'))
      : 'Direct Message',
    content: m.message_text?.startsWith('[') && m.message_text.includes(']')
      ? m.message_text.slice(m.message_text.indexOf(']') + 1).trim()
      : m.message_text,
    timestamp: m.sent_at ? new Date(m.sent_at).toLocaleString() : 'Recently',
    isIncoming: m.receiver_id === currentUser?.user_id
  }));

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

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Messages Stream */}
        <Card title="Official Communication Log">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messagesList.map((m) => (
              <div 
                key={m.id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '6px',
                  padding: '14px',
                  backgroundColor: m.isIncoming ? '#FDF8F5' : '#FFFFFF',
                  borderLeft: m.isIncoming ? '4px solid #DE3B0B' : '4px solid #3A1F6F'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, color: '#3A1F6F', fontSize: '14px' }}>
                    {m.subject}
                  </span>
                  <span style={{ fontSize: '11px', color: '#55636B' }}>
                    {m.timestamp}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#B8115B', fontWeight: 700 }}>
                    From: {m.sender} ➔ To: {m.recipient}
                  </div>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: m.isIncoming ? '#FDF2F4' : '#F2EEFA',
                    color: m.isIncoming ? '#B8115B' : '#3A1F6F',
                    fontWeight: 700
                  }}>
                    {m.isIncoming ? 'Incoming Message' : 'Sent'}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#243143', lineHeight: '1.5' }}>
                  {m.content}
                </div>

                {m.isIncoming && (
                  <div style={{ marginTop: '10px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleReplyToStudent(m)}
                    >
                      <Reply size={12} />
                      <span>Reply to Student</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {messagesList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8A9198' }}>
                No messages dispatched or received yet.
              </div>
            )}
          </div>
        </Card>

        {/* Message Creation Form */}
        <Card title="Dispatch Message / Circular">
          <form onSubmit={handleSend}>
            {/* Recipient Type Selector */}
            <div className="form-group">
              <label className="form-label">Recipient Category</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setRecipientType('group')}
                  className={`btn btn-sm ${recipientType === 'group' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Users size={14} />
                  <span>Project Group</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('student')}
                  className={`btn btn-sm ${recipientType === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <User size={14} />
                  <span>Individual Student</span>
                </button>
              </div>
            </div>

            {recipientType === 'group' ? (
              <div className="form-group">
                <label className="form-label">Select Recipient Group</label>
                <select 
                  className="form-select"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required={recipientType === 'group'}
                >
                  {groups.length > 0 ? (
                    groups.map(g => (
                      <option key={g.team_id} value={g.team_id}>
                        {g.team_code} — {g.subject?.subject_name || 'Academic Project'} ({g.members?.length || 0} Members)
                      </option>
                    ))
                  ) : (
                    <option value="">No assigned project groups available</option>
                  )}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Select Student Recipient</label>
                <select
                  className="form-select"
                  value={selectedStudentUserId}
                  onChange={(e) => setSelectedStudentUserId(e.target.value)}
                  required={recipientType === 'student'}
                >
                  {allStudents.length > 0 ? (
                    allStudents.map(s => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.name} ({s.usn || 'USN'} - {s.groupCode})
                      </option>
                    ))
                  ) : (
                    <option value="">No enrolled students with linked user accounts found</option>
                  )}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Message Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Guidance on Phase II Architecture"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Body / Instructions</label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="Compose your instructions or guidance..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={sending || (recipientType === 'group' ? groups.length === 0 : !selectedStudentUserId)}
            >
              <Send size={15} />
              <span>{sending ? 'DISPATCHING...' : 'DISPATCH MESSAGE'}</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
