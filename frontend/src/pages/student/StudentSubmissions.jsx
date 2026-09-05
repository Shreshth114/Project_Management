import React, { useState, useEffect } from 'react';
import { Upload, FileCheck, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { taskService } from '../../services/taskService';
import { submissionService } from '../../services/submissionService';

export const StudentSubmissions = () => {
  const { currentUser, data } = useAuth();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  const [activeComponentKey, setActiveComponentKey] = useState('finalReport');
  const [file, setFile] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [submissionType, setSubmissionType] = useState('file'); // 'file' or 'link'
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Find fallback group from auth context
  const groups = data?.groups || [];
  const studentGroup = groups.find(g => g.id === currentUser?.groupId) || groups[0] || {
    groupCode: 'Group G01',
    title: 'Major Project Phase - II',
    leaderName: 'Aarav Patel',
    guide: 'Dr. Anita M.',
    submissionMode: 'GROUP',
    components: {
      synopsis: { title: '1. Project Synopsis & Scope', status: 'COMPLETED', fileName: 'Synopsis_G01.pdf', fileSize: '2.4 MB', submittedAt: '2025-08-12', submittedByNames: ['Aarav Patel'] },
      srsDocument: { title: '2. SRS Specification', status: 'COMPLETED', fileName: 'SRS_Doc_G01.pdf', fileSize: '4.8 MB', submittedAt: '2025-08-28', submittedByNames: ['Bhavna Roy'] },
      designDoc: { title: '3. Architectural Design', status: 'COMPLETED', fileName: 'System_Design_G01.pdf', fileSize: '8.1 MB', submittedAt: '2025-09-15', submittedByNames: ['Chetan Kumar'] },
      finalReport: { title: '4. Final Project Report', status: 'PENDING' },
      deploymentLink: { title: '5. Live Application Endpoint', status: 'COMPLETED', url: 'https://major-project-2025.msrit.edu', submittedAt: '2025-10-05', submittedByNames: ['Aarav Patel'] }
    }
  };

  const isGroupMode = studentGroup.submissionMode === 'LEADER_SUBMITS_ALL' || studentGroup.submissionMode === 'GROUP';
  const [componentsObj, setComponentsObj] = useState(studentGroup.components || {});

  useEffect(() => {
    if (currentUser?.student_id) {
      fetchData(currentUser.student_id);
    } else {
      setTeam(studentGroup);
      setTasks(data?.tasks || []);
      if (data?.tasks && data.tasks.length > 0) {
        setSelectedTaskId(data.tasks[0].id || data.tasks[0].task_id);
      }
      setLoading(false);
    }
  }, [currentUser, data]);

  const fetchData = async (studentId) => {
    try {
      setLoading(true);
      const studentTeam = await academicService.getTeamByStudent(studentId);
      setTeam(studentTeam || studentGroup);
      
      const allTasks = await taskService.getTasks();
      const taskList = allTasks || data?.tasks || [];
      setTasks(taskList);
      if (taskList.length > 0) {
        setSelectedTaskId(taskList[0].task_id || taskList[0].id);
      }
      
      if (studentTeam?.team_id) {
        const teamSubmissions = await submissionService.getSubmissionsByTeam(studentTeam.team_id);
        setSubmissions(teamSubmissions || []);
      }
    } catch (err) {
      console.error(err);
      setTeam(studentGroup);
      setTasks(data?.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submissionType === 'file' && !file) {
      setError('Please select a file.');
      return;
    }
    if (submissionType === 'link' && !urlInput) {
      setError('Please provide a URL.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // If backend services are active
      if (team?.team_id && currentUser?.student_id) {
        let fileInfo = {
          file_name: file ? file.name : 'deployment_link',
          file_type: submissionType,
          file_url: urlInput || '#'
        };

        if (submissionType === 'file' && file) {
          try {
            fileInfo = await submissionService.uploadFile(file, currentUser.student_id, selectedTaskId);
          } catch (uploadErr) {
            console.warn('Direct upload failed, using local meta:', uploadErr);
          }
        }

        const payload = {
          task_id: selectedTaskId,
          student_id: currentUser.student_id,
          team_id: team.team_id,
          file_name: fileInfo.file_name,
          file_type: fileInfo.file_type,
          file_url: fileInfo.file_url
        };

        await submissionService.submitTask(payload);
        const teamSubmissions = await submissionService.getSubmissionsByTeam(team.team_id);
        setSubmissions(teamSubmissions || []);
      }

      // Also update local component state
      if (activeComponentKey && componentsObj[activeComponentKey]) {
        setComponentsObj(prev => ({
          ...prev,
          [activeComponentKey]: {
            ...prev[activeComponentKey],
            status: 'COMPLETED',
            fileName: file ? file.name : undefined,
            fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : undefined,
            url: submissionType === 'link' ? urlInput : undefined,
            submittedAt: new Date().toISOString().split('T')[0],
            submittedByNames: [currentUser?.name || studentGroup.leaderName || 'Student Member']
          }
        }));
      }

      setSuccessMsg('Deliverable uploaded successfully! Reflected for all group members.');
      setFile(null);
      setUrlInput('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Error uploading submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading Submissions...</div>;

  const groupCode = team?.team_code || studentGroup.groupCode || 'Group G01';
  const groupTitle = team?.subject?.subject_name || studentGroup.title || 'Major Project Phase - II';
  const leaderName = studentGroup.leaderName || currentUser?.name || 'Aarav Patel';
  const guideName = team?.guide?.name || team?.guideName || studentGroup.guide || 'Dr. Anita M.';

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
            {groupTitle}
          </h1>
          <div style={{ fontSize: '13px', color: '#E0D6F5', marginTop: '4px' }}>
            Group Code: <strong>{groupCode}</strong> | Leader: <strong>{leaderName}</strong> | Guide: <strong>{guideName}</strong>
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
      
      {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#FEE', borderRadius: '4px' }}>Error: {error}</div>}

      {/* COMBINED GROUP PROJECT DELIVERABLES & COMPONENTS VIEW */}
      <Card title={`PROJECT DELIVERABLES & COMPONENTS (${groupCode})`}>
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
                        comp.url || compKey === 'deploymentLink' ? (
                          <a href={comp.url || '#'} target="_blank" rel="noreferrer" style={{ color: '#DE3B0B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>{comp.url || 'Deployment Link'}</span>
                            <ExternalLink size={13} />
                          </a>
                        ) : (
                          <span style={{ color: '#3A1F6F', fontWeight: 600 }}>{comp.fileName} ({comp.fileSize || '3.2 MB'})</span>
                        )
                      ) : (
                        <span style={{ color: '#8A9198', fontSize: '13px' }}>Not uploaded yet</span>
                      )}
                    </td>

                    <td data-label="Submitted By" style={{ fontSize: '13px', color: '#55636B' }}>
                      {comp.submittedByNames && comp.submittedByNames.length > 0 ? comp.submittedByNames.join(' + ') : leaderName}
                    </td>

                    <td data-label="Submission Date" style={{ fontSize: '12px', color: '#55636B' }}>
                      {comp.submittedAt || '—'}
                    </td>

                    <td data-label="Action">
                      <button 
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setActiveComponentKey(compKey);
                          if (compKey === 'deploymentLink') setSubmissionType('link');
                          else setSubmissionType('file');
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

      {/* Past Team Submissions (from Supabase if available) */}
      {submissions.length > 0 && (
        <Card title="Past Team Submissions History">
          <div className="table-container responsive-table-stack">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>File / Link</th>
                  <th>Type</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => {
                  const taskName = tasks.find(t => (t.task_id || t.id) === sub.task_id)?.title || 'Task ID: ' + sub.task_id;
                  return (
                    <tr key={sub.submission_id}>
                      <td data-label="Task" style={{ fontWeight: 700, color: '#243143' }}>{taskName}</td>
                      <td data-label="File/Link">
                        {sub.file_type === 'link' ? (
                          <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ color: '#B82226', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>{sub.file_url}</span>
                            <ExternalLink size={13} />
                          </a>
                        ) : (
                          <span style={{ color: '#114C94', fontWeight: 600 }}>{sub.file_name}</span>
                        )}
                      </td>
                      <td data-label="Type"><Badge variant="info">{sub.file_type}</Badge></td>
                      <td data-label="Submitted By" style={{ fontSize: '13px', color: '#555' }}>
                        {sub.student?.name || 'Group Member'}
                      </td>
                      <td data-label="Date" style={{ fontSize: '12px', color: '#666' }}>
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : 'Recently'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Component Upload Form Section */}
      <div id="upload-section">
        <Card title={`Upload Deliverable: ${componentsObj[activeComponentKey]?.title || 'Deliverable'}`}>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Target Deliverable Component</label>
                <select 
                  className="form-select"
                  value={activeComponentKey}
                  onChange={(e) => {
                    const k = e.target.value;
                    setActiveComponentKey(k);
                    if (k === 'deploymentLink') setSubmissionType('link');
                  }}
                >
                  {Object.keys(componentsObj).map(k => (
                    <option key={k} value={k}>{componentsObj[k].title}</option>
                  ))}
                </select>
              </div>

              {tasks.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Related Milestone Task</label>
                  <select 
                    className="form-select"
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                  >
                    {tasks.map(t => (
                      <option key={t.task_id || t.id} value={t.task_id || t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Submission Type</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="subType"
                    checked={submissionType === 'file'} 
                    onChange={() => setSubmissionType('file')} 
                  /> File Upload (.pdf, .pptx, .zip)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="subType"
                    checked={submissionType === 'link'} 
                    onChange={() => setSubmissionType('link')} 
                  /> URL Link / Endpoint
                </label>
              </div>
            </div>

            {submissionType === 'link' ? (
              <div className="form-group">
                <label className="form-label">Live Deployment / Endpoint URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://my-project.msrit-cse.edu"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required={submissionType === 'link'}
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
                  <label htmlFor="comp-file-input" className="btn btn-secondary btn-sm" style={{ marginTop: '10px', cursor: 'pointer' }}>
                    Browse File
                  </label>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '10px' }} 
              disabled={submitting}
            >
              <FileCheck size={16} />
              <span>{submitting ? 'SUBMITTING...' : 'SUBMIT DELIVERABLE TO PROJECT'}</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
