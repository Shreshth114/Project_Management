import React, { useState } from 'react';
import { Send, MessageSquare, Megaphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';

export const CoordinatorMessages = () => {
  const { data, sendMessage } = useAuth();
  const [recipient, setRecipient] = useState('All Groups (CSE 8th Sem)');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sent, setSent] = useState(false);

  const handleBroadcast = (e) => {
    e.preventDefault();
    sendMessage({
      recipient,
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Coordinator Department Broadcast Center</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Issue official department circulars, viva schedules, and submission deadlines.
        </p>
      </div>

      <div className="grid-2">
        <Card title="Published Circulars & Announcements">
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
                  Target: {msg.recipient} — {msg.subject}
                </div>
                <p style={{ fontSize: '13px', color: '#444' }}>{msg.content}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Broadcast Circular / Announcement">
          {sent && <div className="alert alert-success">Department broadcast issued successfully!</div>}
          <form onSubmit={handleBroadcast}>
            <div className="form-group">
              <label className="form-label">Broadcast Target</label>
              <select
                className="form-select"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              >
                <option value="All Groups (CSE 8th Sem)">All 36 Final Year Project Batches (144 Students)</option>
                <option value="All Faculty Guides">All Department Faculty Advisors</option>
                <option value="Group GP-04">Group GP-04 (Edge AI)</option>
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

            <button type="submit" className="btn btn-primary">
              <Megaphone size={16} />
              <span>ISSUE BROADCAST CIRCULAR</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
