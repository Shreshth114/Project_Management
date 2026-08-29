import React, { useState } from 'react';
import { Send, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';

export const StudentMessages = () => {
  const { data, sendMessage } = useAuth();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage({
      recipient: "Guide & Coordinator Panel",
      subject,
      content
    });
    setSubject('');
    setContent('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Messages & Academic Announcements</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Official communication channel with faculty guides and project coordinators.
        </p>
      </div>

      <div className="grid-2">
        {/* Inbox / Announcements list */}
        <Card title="Portal Noticeboard & Messages">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.messages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  padding: '14px',
                  backgroundColor: msg.isUnread ? '#FCF8E3' : '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, color: '#243143', fontSize: '14px' }}>{msg.sender}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{msg.timestamp}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#B82226', marginBottom: '6px' }}>
                  {msg.subject}
                </div>
                <p style={{ fontSize: '13px', color: '#444' }}>{msg.content}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Compose Form */}
        <Card title="Send Message to Guide / Coordinator">
          {success && (
            <div className="alert alert-success">
              Message dispatched to guide panel.
            </div>
          )}
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Recipient</label>
              <input
                type="text"
                className="form-input"
                value="Dr. R. Sharma (Guide) & Prof. V. Kulkarni (Coordinator)"
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Query regarding Hardware setup demo"
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
                placeholder="Type message content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Send size={15} />
              <span>SEND MESSAGE</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
