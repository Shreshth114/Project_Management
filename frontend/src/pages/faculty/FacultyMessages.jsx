import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';

export const FacultyMessages = () => {
  const { data, sendMessage, currentUser } = useAuth();
  const [recipientGroup, setRecipientGroup] = useState(data.groups[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    const g = data.groups.find(x => x.id === recipientGroup);
    sendMessage({
      recipient: `Group ${g?.groupCode || 'All Groups'}`,
      subject,
      content
    });
    setSubject('');
    setContent('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Faculty Communication & Instructions</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Broadcast guide remarks, review dates, and code requirements to your advised batches.
        </p>
      </div>

      <div className="grid-2">
        <Card title="Guide Outbox & History">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.messages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  padding: '14px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, color: '#243143', fontSize: '13px' }}>{msg.sender}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{msg.timestamp}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#B82226', marginBottom: '4px' }}>
                  To: {msg.recipient} — {msg.subject}
                </div>
                <p style={{ fontSize: '13px', color: '#444' }}>{msg.content}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Send Guide Instructions">
          {sent && <div className="alert alert-success">Instruction sent to student batch.</div>}
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Target Advised Group</label>
              <select
                className="form-select"
                value={recipientGroup}
                onChange={(e) => setRecipientGroup(e.target.value)}
              >
                {data.groups.map(g => (
                  <option key={g.id} value={g.id}>Group {g.groupCode} — {g.title}</option>
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

            <button type="submit" className="btn btn-primary">
              <Send size={15} />
              <span>DISPATCH INSTRUCTION</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
