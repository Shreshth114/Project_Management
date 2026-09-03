import React, { useState } from 'react';
import { History, ShieldAlert, Filter, Eye, X, CheckSquare, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminLogs = () => {
  const { data } = useAuth();
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedGroupModal, setSelectedGroupModal] = useState(null);

  const filteredLogs = data.auditLogs.filter(log => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const handleLogClick = (log) => {
    // If log is related to group submission, open group inspection modal
    const groupG01 = (data.groups || [])[0];
    setSelectedGroupModal({
      log,
      group: groupG01
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>System Security & Activity Audit Logs</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Immutable event audit trail for file uploads, evaluation entries, and group project submissions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#3A1F6F" />
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="ALL">All Event Types</option>
            <option value="GROUP_SUBMISSION">Group Submissions</option>
            <option value="INDIVIDUAL_EVALUATION">Evaluations</option>
            <option value="SUBJECT_ASSIGNMENT">Subject Assignments</option>
          </select>
        </div>
      </div>

      <Card title="Recorded System Audit Logs (Click Group Submission Event to Inspect Student Roster)">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Event Log ID</th>
                <th>Timestamp</th>
                <th>User Identity</th>
                <th>Action Type</th>
                <th>Event Details & Audit Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td data-label="Event Log ID" style={{ fontWeight: 800, color: '#DE3B0B' }}>{log.id}</td>
                  <td data-label="Timestamp">{log.timestamp}</td>
                  <td data-label="User Identity" style={{ fontWeight: 600 }}>{log.user}</td>
                  <td data-label="Action Type"><Badge variant="purple">{log.action}</Badge></td>
                  <td data-label="Event Details" style={{ fontSize: '13px' }}>{log.details}</td>
                  <td data-label="Action">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleLogClick(log)}
                      title="Inspect student details for this project event"
                    >
                      <Eye size={13} />
                      <span>Inspect Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Group Submission Details Modal */}
      {selectedGroupModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} />
                <span>Group Project Roster & Submission Details ({selectedGroupModal.group.groupCode})</span>
              </h3>
              <button 
                onClick={() => setSelectedGroupModal(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #E5E5E5', paddingBottom: '12px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                  {selectedGroupModal.group.title}
                </h4>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                  Domain: <strong>{selectedGroupModal.group.domain}</strong> | Guide: <strong>{selectedGroupModal.group.guide}</strong>
                </div>
              </div>

              <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '8px' }}>
                Enrolled Team Members Roster:
              </h5>

              <div className="table-container responsive-table-stack" style={{ marginBottom: '16px' }}>
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Student Name</th>
                      <th>Team Role</th>
                      <th>Assigned Work Module</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroupModal.group.members.map((m) => (
                      <tr key={m.usn}>
                        <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                        <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
                        <td data-label="Team Role"><Badge variant={m.role === 'Team Lead' ? 'purple' : 'navy'}>{m.role}</Badge></td>
                        <td data-label="Assigned Module" style={{ fontSize: '12px' }}>{m.assignedModule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ fontSize: '12px', color: '#55636B', backgroundColor: '#F8F9FA', padding: '10px 12px', borderRadius: '4px' }}>
                <strong>Audit Note:</strong> {selectedGroupModal.log.details} (Timestamp: {selectedGroupModal.log.timestamp})
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedGroupModal(null)}>
                Close Inspection View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
