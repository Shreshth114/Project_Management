import React, { useState, useEffect } from 'react';
import { Eye, X, Users, ShieldAlert, History } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const AdminLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [inspectingLog, setInspectingLog] = useState(null);
  const [inspectingTeam, setInspectingTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const [logs, fetchedTeams] = await Promise.all([
        academicService.getAdminAuditLogs().catch(() => []),
        academicService.getTeams().catch(() => [])
      ]);
      setAuditLogs(logs || []);
      setTeams(fetchedTeams || []);
    } catch (err) {
      console.warn("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = (log) => {
    setInspectingLog(log);
    // Find matching team if mentioned in log details or user_id
    const team = teams.find(t => 
      (log.details && log.details.includes(t.team_code)) || 
      (t.members && t.members.some(m => m.user_id === log.user_id || m.usn === log.user))
    );
    setInspectingTeam(team || null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>System Audit Logs & Security Trail</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Immutable system log entries capturing submission events, mode changes, and evaluation activities.
        </p>
      </div>

      <Card title="System Activity & Submission Event Log">
        {loading ? (
          <p style={{ padding: '16px' }}>Loading audit trail...</p>
        ) : auditLogs.length === 0 ? (
          <p style={{ padding: '16px', color: '#888' }}>No audit activities recorded in database yet.</p>
        ) : (
          <div className="table-container responsive-table-stack">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Timestamp</th>
                  <th>User ID / Account</th>
                  <th>Event Action</th>
                  <th>Event Details & Description</th>
                  <th>Inspection</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.log_id || log.id}>
                    <td data-label="Event ID" style={{ fontWeight: 800, color: '#3A1F6F' }}>
                      {log.log_id || log.id}
                    </td>
                    <td data-label="Timestamp" style={{ fontSize: '12px', color: '#55636B' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                    </td>
                    <td data-label="User / USN" style={{ fontWeight: 700, color: '#DE3B0B' }}>
                      {log.user_id || log.user || 'System'}
                    </td>
                    <td data-label="Event Action">
                      <Badge variant="purple">{log.action}</Badge>
                    </td>
                    <td data-label="Details" style={{ fontSize: '13px' }}>
                      {log.details || 'No additional details logged'}
                    </td>
                    <td data-label="Inspection">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleInspect(log)}
                        title="Inspect event details"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Group Submission / Event Inspection Modal */}
      {inspectingLog && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} />
                <span>Audit Inspection: Event #{inspectingLog.log_id || inspectingLog.id}</span>
              </h3>
              <button 
                onClick={() => { setInspectingLog(null); setInspectingTeam(null); }}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '14px', borderBottom: '1px solid #E5E5E5', paddingBottom: '10px' }}>
                <div style={{ fontWeight: 800, color: '#3A1F6F', fontSize: '15px' }}>
                  Action: {inspectingLog.action}
                </div>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                  {inspectingLog.details || 'System event triggered.'}
                </div>
                <div style={{ fontSize: '12px', color: '#8A9198', marginTop: '4px' }}>
                  Recorded at: {inspectingLog.timestamp ? new Date(inspectingLog.timestamp).toLocaleString() : 'N/A'}
                </div>
              </div>

              {inspectingTeam ? (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '10px' }}>
                    Associated Team: {inspectingTeam.team_code} ({inspectingTeam.subject?.subject_name || 'Project'})
                  </h4>
                  <div className="table-container responsive-table-stack">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>USN</th>
                          <th>Student Name</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(inspectingTeam.members || []).map(m => (
                          <tr key={m.student_id || m.usn}>
                            <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                            <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
                            <td data-label="Role">{m.is_leader ? 'Leader' : 'Member'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#55636B', fontSize: '13px' }}>
                  User ID: <strong>{inspectingLog.user_id || 'System'}</strong>. No additional team association found.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { setInspectingLog(null); setInspectingTeam(null); }}
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
