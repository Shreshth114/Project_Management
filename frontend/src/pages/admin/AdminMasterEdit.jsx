import React, { useState } from 'react';
import { Settings, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';

export const AdminMasterEdit = () => {
  const { data } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState(data.groups[0]?.id || '');
  const [newGuide, setNewGuide] = useState(data.users[1]?.name || 'Dr. R. Sharma');
  const [extensionHours, setExtensionHours] = useState(48);
  const [saved, setSaved] = useState(false);

  const handleGuideOverride = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Master Data Edit & Administrative Override</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Emergency administrative overrides for guide reassignment, deadline extension, and USN mapping.
        </p>
      </div>

      {saved && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>Master administrative override updated and logged to audit trail!</span>
        </div>
      )}

      <div className="grid-2">
        <Card title="Guide Reassignment Override">
          <form onSubmit={handleGuideOverride}>
            <div className="form-group">
              <label className="form-label">Select Target Project Group</label>
              <select
                className="form-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {data.groups.map(g => (
                  <option key={g.id} value={g.id}>{g.groupCode} - {g.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reassign Faculty Guide</label>
              <select
                className="form-select"
                value={newGuide}
                onChange={(e) => setNewGuide(e.target.value)}
              >
                <option value="Dr. R. Sharma">Dr. R. Sharma (Professor)</option>
                <option value="Prof. V. Kulkarni">Prof. V. Kulkarni (Assoc Professor)</option>
                <option value="Dr. Anita M.">Dr. Anita M. (Professor)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              <Settings size={16} />
              <span>REASSIGN FACULTY GUIDE</span>
            </button>
          </form>
        </Card>

        <Card title="Emergency Milestone Deadline Extension">
          <form onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
            <div className="form-group">
              <label className="form-label">Select Milestone Phase</label>
              <select className="form-select">
                {data.tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.phase} - {t.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Grant Grace Period Extension (Hours)</label>
              <input
                type="number"
                className="form-input"
                value={extensionHours}
                onChange={(e) => setExtensionHours(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-navy">
              <RefreshCw size={16} />
              <span>APPLY DEADLINE EXTENSION</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
