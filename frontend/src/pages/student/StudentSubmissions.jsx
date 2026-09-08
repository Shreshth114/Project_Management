import React, { useState, useEffect } from 'react';
import { Upload, FileCheck, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { taskService } from '../../services/taskService';
import { submissionService } from '../../services/submissionService';

export const StudentSubmissions = () => {
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  const [file, setFile] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [submissionType, setSubmissionType] = useState('file'); // 'file' or 'link'
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser?.student_id) {
      fetchData(currentUser.student_id);
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchData = async (studentId) => {
    try {
      setLoading(true);
      const studentTeam = await academicService.getTeamByStudent(studentId).catch(() => null);
      setTeam(studentTeam);
      
      const allTasks = await taskService.getTasks().catch(() => []);
      setTasks(allTasks || []);
      if (allTasks && allTasks.length > 0) {
        setSelectedTaskId(allTasks[0].task_id);
      }
      
      if (studentTeam?.team_id) {
        const teamSubmissions = await submissionService.getSubmissionsByTeam(studentTeam.team_id).catch(() => []);
        setSubmissions(teamSubmissions || []);
      }
    } catch (err) {
      console.error("Submissions load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setError('Please select a task milestone to submit.');
      return;
    }
    if (submissionType === 'file' && !file) {
      setError('Please select a file to upload.');
      return;
    }
    if (submissionType === 'link' && !urlInput) {
      setError('Please enter a valid submission URL.');
      return;
    }

    if (!team?.team_id || !currentUser?.student_id) {
      setError('You must be assigned to an active project team before submitting deliverables.');
      return;
    }

    // Prevent re-submission: block if this task already has a submission
    const alreadySubmitted = submissions.some(s => s.task_id === selectedTaskId);
    if (alreadySubmitted) {
      setError('This milestone has already been submitted. Re-submission is not allowed.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let fileInfo = {
        file_name: file ? file.name : (urlInput.length > 30 ? urlInput.slice(0, 30) + '...' : urlInput),
        file_type: submissionType,
        file_url: urlInput || '#'
      };

      if (submissionType === 'file' && file) {
        fileInfo = await submissionService.uploadFile(file, currentUser.student_id, selectedTaskId);
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
      const updatedSubmissions = await submissionService.getSubmissionsByTeam(team.team_id);
      setSubmissions(updatedSubmissions || []);

      setSuccessMsg('Deliverable uploaded successfully! Reflected for all group members.');
      setFile(null);
      setUrlInput('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Error submitting deliverable');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '24px', color: '#55636B' }}>Loading Submissions...</div>;

  const groupCode = team?.team_code || 'Not Enrolled';
  const groupTitle = team?.subject?.subject_name || (team ? 'Academic Project' : 'No Enrolled Project');
  const guideName = team?.guide?.name || 'Not Assigned';
  const coordinatorName = team?.coordinator || 'Not Assigned';

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
            Group Code: <strong>{groupCode}</strong> | Guide: <strong>{guideName}</strong> | Coordinator: <strong>{coordinatorName}</strong>
          </div>
        </div>

        <Badge variant="magenta" style={{ backgroundColor: '#FFFFFF', color: '#9D1B55' }}>
          Group Mode: 1 Submission Reflected for All Team Members
        </Badge>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* DYNAMIC DELIVERABLES TABLE FROM REAL TASKS */}
      <Card title={`Project Deliverables & Milestones (${groupCode})`}>
        <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
          Milestones published by the department coordinator. Submissions made by any member reflect for all team members.
        </p>

        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Milestone Title</th>
                <th>Type</th>
                <th>Deadline</th>
                <th>Submission Status</th>
                <th>Submitted File / Link</th>
                <th>Submitted By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map(task => {
                  const sub = submissions.find(s => s.task_id === task.task_id);
                  const isSubmitted = Boolean(sub);
                  const deadlineStr = task.deadline ? (task.deadline.includes('T') ? new Date(task.deadline).toLocaleDateString() : task.deadline) : '—';

                  return (
                    <tr key={task.task_id}>
                      <td data-label="Milestone Title" style={{ fontWeight: 700, color: '#3A1F6F' }}>
                        {task.title}
                      </td>

                      <td data-label="Type">
                        <Badge variant="purple">{task.task_type || 'GROUP'}</Badge>
                      </td>

                      <td data-label="Deadline" style={{ fontSize: '13px', color: '#55636B' }}>
                        {deadlineStr}
                      </td>

                      <td data-label="Submission Status">
                        <Badge variant={isSubmitted ? 'success' : 'warning'}>
                          {isSubmitted ? '✓ Submitted' : '○ Pending'}
                        </Badge>
                      </td>

                      <td data-label="Submitted File / Link">
                        {isSubmitted ? (
                          sub.file_url && sub.file_url !== '#' ? (
                            <button 
                              type="button"
                              onClick={() => submissionService.openSubmissionFile(sub.file_url, sub.file_name)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#DE3B0B', 
                                fontWeight: 600, 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                cursor: 'pointer',
                                padding: 0,
                                font: 'inherit',
                                textDecoration: 'underline'
                              }}
                              title="Click to view submitted deliverable"
                            >
                              <span>{sub.file_name || 'View Deliverable'}</span>
                              <ExternalLink size={13} />
                            </button>
                          ) : (
                            <span style={{ color: '#3A1F6F', fontWeight: 600 }}>{sub.file_name || 'Attached File'}</span>
                          )
                        ) : (
                          <span style={{ color: '#8A9198', fontSize: '13px' }}>Not submitted yet</span>
                        )}
                      </td>

                      <td data-label="Submitted By" style={{ fontSize: '13px', color: '#55636B' }}>
                        {sub?.student?.name || (isSubmitted ? 'Team Member' : '—')}
                      </td>

                      <td data-label="Action">
                        {isSubmitted ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#198754', fontWeight: 700, fontSize: '13px' }}>
                            <FileCheck size={14} />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <button 
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedTaskId(task.task_id);
                              const element = document.getElementById('upload-section');
                              if (element) element.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            <Upload size={13} />
                            <span>Submit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#8A9198', padding: '20px' }}>
                    No milestones or tasks published by the coordinator yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Component Upload Form Section */}
      <div id="upload-section">
        <Card title="Submit Milestone Deliverable">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Target Milestone</label>
                <select 
                  className="form-select"
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  required
                >
                  {tasks.filter(t => !submissions.some(s => s.task_id === t.task_id)).length > 0 ? (
                    tasks
                      .filter(t => !submissions.some(s => s.task_id === t.task_id))
                      .map(t => (
                        <option key={t.task_id} value={t.task_id}>
                          {t.title} ({t.task_type || 'GROUP'})
                        </option>
                      ))
                  ) : (
                    <option value="">All milestones submitted</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Submission Format</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="subType" 
                      value="file" 
                      checked={submissionType === 'file'}
                      onChange={() => setSubmissionType('file')}
                    />
                    Document / Archive File (PDF, ZIP, DOCX)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="subType" 
                      value="link" 
                      checked={submissionType === 'link'}
                      onChange={() => setSubmissionType('link')}
                    />
                    Live URL / Git Repository Link
                  </label>
                </div>
              </div>
            </div>

            {submissionType === 'file' ? (
              <div className="form-group">
                <label className="form-label">Upload Deliverable Document</label>
                <input 
                  type="file" 
                  className="form-input" 
                  onChange={(e) => setFile(e.target.files[0])}
                  required={submissionType === 'file'}
                />
                <span className="text-muted" style={{ fontSize: '12px' }}>
                  Accepted extensions: .pdf, .docx, .zip, .rar, .tar.gz (Max: 50MB)
                </span>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Live Deployment / Repository URL</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://github.com/my-org/my-project or https://live-demo.msrit.edu"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required={submissionType === 'link'}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || tasks.length === 0}
              >
                <Upload size={16} />
                <span>{submitting ? 'Submitting to Database...' : 'CONFIRM & SUBMIT DELIVERABLE'}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
