import React, { useState } from 'react';
import { Eye, X, Users, ShieldAlert, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminLogs = () => {
  const { data } = useAuth();
  const [inspectingLog, setInspectingLog] = useState(null);

  // Group G01 student roster for details modal
  const groupG01Roster = [
    { usn: "1MS21CS042", name: "Rahul Sharma", role: "Team Lead", module: "System Architecture & Quantization", uploadedAt: "2025-10-08 14:20" },
    { usn: "1MS21CS015", name: "Ananya Hegde", role: "ML Engineer", module: "ECG Dataset Preprocessing", uploadedAt: "2025-10-08 14:25" },
    { usn: "1MS21CS062", name: "Karthik Raja", role: "Embedded Specialist", module: "Raspberry Pi Hardware Setup", uploadedAt: "2025-10-08 14:32" },
    { usn: "1MS21CS099", name: "Priya V", role: "Documentation Lead", module: "IEEE Final Project Report", uploadedAt: "2025-10-08 14:40" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>System Audit Logs & Security Trail</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Immutable system log entries capturing submission events, mode changes, and evaluation activities.
        </p>
      </div>

      <Card title="System Activity & Submission Event Log">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Timestamp</th>
                <th>User / USN</th>
                <th>Event Action</th>
                <th>Event Details & Description</th>
                <th>Student Roster Details</th>
              </tr>
            </thead>
            <tbody>
              {(data.auditLogs || []).map((log) => {
                const isGroupSubmission = log.action === 'GROUP_SUBMISSION' || log.action === 'COMPONENT_SUBMISSION';
                
                // Replace "leader submitted all" text with "one of grp member submitted all the components"
                let updatedDetails = log.details;
                if (updatedDetails.includes("leader submitted all") || updatedDetails.includes("Leader uploaded all")) {
                  updatedDetails = "Group G01: one of grp member submitted all the components";
                }

                return (
                  <tr key={log.id}>
                    <td data-label="Event ID" style={{ fontWeight: 800, color: '#3A1F6F' }}>{log.id}</td>
                    <td data-label="Timestamp" style={{ fontSize: '12px', color: '#55636B' }}>{log.timestamp}</td>
                    <td data-label="User / USN" style={{ fontWeight: 700, color: '#DE3B0B' }}>{log.user}</td>
                    <td data-label="Event Action"><Badge variant="purple">{log.action}</Badge></td>
                    <td data-label="Details" style={{ fontSize: '13px' }}>{updatedDetails}</td>
                    <td data-label="Student Roster">
                      {isGroupSubmission ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setInspectingLog(log)}
                          title="Inspect student details for this group submission event"
                        >
                          <Eye size={13} />
                          <span>Inspect Details</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#8A9198' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Group Submission Details Inspection Modal */}
      {inspectingLog && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} />
                <span>Group Project Roster Inspection (Group G01)</span>
              </h3>
              <button 
                onClick={() => setInspectingLog(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '14px', borderBottom: '1px solid #E5E5E5', paddingBottom: '10px' }}>
                <div style={{ fontWeight: 800, color: '#3A1F6F', fontSize: '15px' }}>
                  Event Log: {inspectingLog.action} ({inspectingLog.timestamp})
                </div>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '2px' }}>
                  one of grp member submitted all the components for Group G01
                </div>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '10px' }}>
                Enrolled Group Members & Component Upload Timestamps:
              </h4>

              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Student Name</th>
                      <th>Assigned Module</th>
                      <th>Upload Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupG01Roster.map(s => (
                      <tr key={s.usn}>
                        <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{s.usn}</td>
                        <td data-label="Student Name" style={{ fontWeight: 600 }}>{s.name}</td>
                        <td data-label="Assigned Module" style={{ fontSize: '12px' }}>{s.module}</td>
                        <td data-label="Upload Timestamp" style={{ fontSize: '12px', color: '#55636B' }}>{s.uploadedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setInspectingLog(null)}>
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
