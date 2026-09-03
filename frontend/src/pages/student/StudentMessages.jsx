import React, { useState } from 'react';
import { Send, MessageSquare, Trash2, CheckCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const StudentMessages = () => {
  const { data, currentUser, deleteMessage } = useAuth();
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState('');

  // Filter direct messages (excluding circulars)
  const messagesList = (data.messages || []).filter(m => m.category !== 'CIRCULAR');

  const handleSend = (e) => {
    e.preventDefault();
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: currentUser?.name || 'Rahul Sharma (Student)',
      senderRole: 'STUDENT',
      recipient: 'Prof. V. Kulkarni (Subject Coordinator)',
      subject,
      content,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isUnread: true,
      category: 'DIRECT'
    };

    data.messages.push(newMsg);
    setSubject('');
    setContent('');
    setSuccess('Message sent directly to Subject Coordinator!');
    setTimeout(() => setSuccess(''), 3500);
  };

  const isAuthor = (msg) => {
    if (!currentUser) return false;
    return msg.sender === currentUser.name || 
           msg.sender.includes(currentUser.name) || 
           (msg.senderRole === 'STUDENT' && currentUser.role === 'STUDENT');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Direct Messaging (Student ↔ Coordinator)</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Official direct communication channel between student project teams and assigned Subject Coordinators.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Direct Messages List */}
        <Card title="Direct Conversation Inbox">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messagesList.map((msg) => {
              const userIsAuthor = isAuthor(msg);

              return (
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
                        ({msg.senderRole})
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#8A9198' }}>{msg.timestamp}</span>
                      
                      {/* Trash Delete button visible ONLY for messages sent by the logged-in user */}
                      {userIsAuthor && (
                        <button
                          type="button"
                          onClick={() => deleteMessage(msg.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DE3B0B',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          title="Delete message authored by you"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#DE3B0B', marginBottom: '6px' }}>
                    {msg.subject}
                  </div>
                  <p style={{ fontSize: '13px', color: '#55636B', lineHeight: 1.4 }}>{msg.content}</p>
                </div>
              );
            })}

            {messagesList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8A9198' }}>
                No direct messages in your inbox.
              </div>
            )}
          </div>
        </Card>

        {/* Compose Form */}
        <Card title="Compose Message to Subject Coordinator">
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Recipient (Subject Coordinator)</label>
              <input
                type="text"
                className="form-input"
                value="Prof. V. Kulkarni (Subject Coordinator)"
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Request for milestone deadline clarification"
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
                placeholder="Type your message to the coordinator..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              <Send size={15} />
              <span>DISPATCH MESSAGE TO COORDINATOR</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
