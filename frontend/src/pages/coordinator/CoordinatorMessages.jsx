import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';

export const CoordinatorMessages = () => {
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
            {circularsList.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  padding: '14px',
                  backgroundColor: '#FDF0F2'
                }}
              >
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
              </div>
            ))}
          </div>
        </Card>

        {/* Send Update About Task to Students */}
        <Card title="Send Update About Task to Enrolled Students">
          <form onSubmit={handleSendTaskUpdate}>
            <div className="form-group">
              <label className="form-label">Target Audience</label>
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

            <button type="submit" className="btn btn-primary btn-block">
              <Send size={15} />
              <span>SEND UPDATE ABOUT TASK TO STUDENTS</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
