import React, { useState } from 'react';
import { Upload, FileCheck, CheckCircle, ExternalLink, Shield, Layers, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const StudentSubmissions = () => {
  const { data, currentUser, submitGroupComponent } = useAuth();
  
  // Find group associated with current student
  const groups = data.groups || [];
  const tasks = data.tasks || [];

  const studentGroup = groups.find(g => g.id === currentUser?.groupId) || groups[0];
  const isLeader = currentUser?.isGroupLeader || studentGroup?.leaderUsn === currentUser?.usn;

  const [activeComponentKey, setActiveComponentKey] = useState('finalReport');
  const [file, setFile] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleComponentUpload = (e, compKey) => {
    e.preventDefault();
    if (!studentGroup) return;
    const compObj = studentGroup.components?.[compKey];

    if (compKey === 'deploymentLink') {
      if (!urlInput) return;
      submitGroupComponent(studentGroup.id, compKey, { url: urlInput });
    } else {
      if (!file) return;
      submitGroupComponent(studentGroup.id, compKey, {
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
    }

    setSuccessMsg(`Component "${compObj?.title || compKey}" submitted successfully! Reflected for all Group ${studentGroup.groupCode} members.`);
    setFile(null);
    setUrlInput('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  if (!studentGroup) {
    return <div>No group allocation found.</div>;
  }

  const componentsObj = studentGroup.components || {};
  const isGroupMode = studentGroup.submissionMode === 'LEADER_SUBMITS_ALL' || studentGroup.submissionMode === 'GROUP';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#3A1F6F',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '6px',
        borderBottom: '4px solid #DE3B0B',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#E0D6F5', fontWeight: 700, textTransform: 'uppercase' }}>
            COORDINATOR-CONFIGURED SUBMISSION GOVERNANCE
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
            {studentGroup.title}
          </h1>
          <div style={{ fontSize: '13px', color: '#E0D6F5', marginTop: '4px' }}>
            Group Code: <strong>{studentGroup.groupCode}</strong> | Leader: <strong>{studentGroup.leaderName}</strong> | Guide: <strong>{studentGroup.guide}</strong>
          </div>
        </div>

        <Badge variant="magenta" style={{ backgroundColor: '#FFFFFF', color: '#9D1B55' }}>
          Mode: {isGroupMode ? 'Group Mode (1 Upload Reflected for All)' : 'Individual Mode (Personal Upload)'}
        </Badge>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ONE COMBINED GROUP PROJECT COMPONENTS VIEW */}
      <Card title={`PROJECT DELIVERABLES & COMPONENTS (${studentGroup.groupCode})`}>
        <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
          {isGroupMode 
            ? "Group Mode: Submissions made by any member reflect for ALL team members under this project."
            : "Individual Mode: Every student must upload their assigned deliverables individually."
          }
        </p>

        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Component Title</th>
                <th>Submission Status</th>
                <th>Submitted File / Link</th>
                <th>Submitted By</th>
                <th>Submission Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(componentsObj).map(compKey => {
                const comp = componentsObj[compKey];
                const isCompleted = comp.status === 'COMPLETED';

                return (
                  <tr key={compKey}>
                    <td data-label="Component Title" style={{ fontWeight: 700, color: '#3A1F6F' }}>
                      {comp.title}
                    </td>

                    <td data-label="Submission Status">
                      <Badge variant={isCompleted ? 'success' : 'warning'}>
                        {isCompleted ? '✓ Completed' : '○ Pending'}
                      </Badge>
                    </td>

                    <td data-label="Submitted File / Link">
                      {isCompleted ? (
                        compKey === 'deploymentLink' ? (
                          <a href={comp.url} target="_blank" rel="noreferrer" style={{ color: '#DE3B0B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>{comp.url}</span>
                            <ExternalLink size={13} />
                          </a>
                        ) : (
                          <span style={{ color: '#3A1F6F', fontWeight: 600 }}>{comp.fileName} ({comp.fileSize})</span>
                        )
                      ) : (
                        <span style={{ color: '#8A9198', fontSize: '13px' }}>Not uploaded yet</span>
                      )}
                    </td>

                    <td data-label="Submitted By" style={{ fontSize: '13px', color: '#55636B' }}>
                      {comp.submittedByNames && comp.submittedByNames.length > 0 ? comp.submittedByNames.join(' + ') : studentGroup.leaderName}
                    </td>

                    <td data-label="Submission Date" style={{ fontSize: '12px', color: '#55636B' }}>
                      {comp.submittedAt || '—'}
                    </td>

                    <td data-label="Action">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setActiveComponentKey(compKey);
                          const element = document.getElementById('upload-section');
                          if (element) element.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Upload size={13} />
                        <span>{isCompleted ? 'Re-upload' : 'Upload'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Component Upload Form Section */}
      <div id="upload-section">
        <Card title={`Upload Component Deliverable: ${componentsObj[activeComponentKey]?.title || 'Deliverable'}`}>
          <form onSubmit={(e) => handleComponentUpload(e, activeComponentKey)}>
            <div className="form-group">
              <label className="form-label">Select Target Component</label>
              <select 
                className="form-select"
                value={activeComponentKey}
                onChange={(e) => setActiveComponentKey(e.target.value)}
              >
                {Object.keys(componentsObj).map(k => (
                  <option key={k} value={k}>{componentsObj[k].title}</option>
                ))}
              </select>
            </div>

            {activeComponentKey === 'deploymentLink' ? (
              <div className="form-group">
                <label className="form-label">Live Deployment / Endpoint URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://my-project.msrit-cse.edu"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Select File (.pdf, .pptx, .zip, .mp4)</label>
                <div style={{
                  border: '2px dashed #CCCCCC',
                  borderRadius: '4px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#FAFAFA'
                }}>
                  <Upload size={28} color="#8A9198" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#3A1F6F' }}>
                    {file ? file.name : "Click to select deliverable file"}
                  </div>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    id="comp-file-input"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="comp-file-input" className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }}>
                    Browse File
                  </label>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              <FileCheck size={16} />
              <span>SUBMIT DELIVERABLE TO PROJECT</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
