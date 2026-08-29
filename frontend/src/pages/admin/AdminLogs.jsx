import React, { useState } from 'react';
import { History, ShieldAlert, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminLogs = () => {
  const { data } = useAuth();
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = data.auditLogs.filter(log => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>System Security & Activity Audit Logs</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Immutable event audit trail for file uploads, evaluation entries, and master overrides.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#666" />
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="ALL">All Event Types</option>
            <option value="FILE_UPLOAD">File Uploads</option>
            <option value="EVALUATION_SUBMITTED">Evaluations</option>
            <option value="TASK_CREATED">Task Creation</option>
            <option value="MASTER_OVERRIDE">Master Overrides</option>
          </select>
        </div>
      </div>

      <Card title="Recorded System Audit Logs">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Event Log ID</th>
                <th>Timestamp</th>
                <th>User Identity</th>
                <th>Action Type</th>
                <th>Event Details & Audit Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td data-label="Event Log ID" style={{ fontWeight: 700, color: '#243143' }}>{log.id}</td>
                  <td data-label="Timestamp">{log.timestamp}</td>
                  <td data-label="User Identity" style={{ fontWeight: 600 }}>{log.user}</td>
                  <td data-label="Action Type"><Badge variant="navy">{log.action}</Badge></td>
                  <td data-label="Event Details" style={{ fontSize: '13px' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
