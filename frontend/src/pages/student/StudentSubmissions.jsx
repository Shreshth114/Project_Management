import React, { useState, useEffect } from 'react';
import { Upload, FileCheck, CheckCircle, ExternalLink } from 'lucide-react';
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
    }
  }, [currentUser]);

  const fetchData = async (studentId) => {
    try {
      setLoading(true);
      const studentTeam = await academicService.getTeamByStudent(studentId);
      setTeam(studentTeam);
      
      if (studentTeam) {
        // Fetch tasks (for now fetching all tasks, ideally filtered by subject)
        const allTasks = await taskService.getTasks();
        setTasks(allTasks || []);
        if (allTasks && allTasks.length > 0) {
          setSelectedTaskId(allTasks[0].task_id);
        }
        
        // Fetch submissions for this team
        const teamSubmissions = await submissionService.getSubmissionsByTeam(studentTeam.team_id);
        setSubmissions(teamSubmissions || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team || !selectedTaskId) return;
    
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
      
      let fileInfo = {
        file_name: 'deployment_link',
        file_type: 'link',
        file_url: urlInput
      };
      
      if (submissionType === 'file') {
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
      
      const newSub = await submissionService.submitTask(payload);
      
      // Refresh submissions
      const teamSubmissions = await submissionService.getSubmissionsByTeam(team.team_id);
      setSubmissions(teamSubmissions || []);
      
      setSuccessMsg(`Submission uploaded successfully!`);
      setFile(null);
      setUrlInput('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading Submissions...</div>;
  if (!team) return <div>No group allocation found for your profile.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#243143',
        color: '#FFFFFF',
        padding: '24px',
        borderRadius: '4px',
        borderLeft: '6px solid #B82226',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#9F9F9F', fontWeight: 700, textTransform: 'uppercase' }}>
            GROUP PROJECT SUBMISSION
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
            {team.team_code} Team Project
          </h1>
          <div style={{ fontSize: '13px', color: '#D1D5DB', marginTop: '4px' }}>
            Guide: <strong>{team.guideName || 'Unassigned'}</strong>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <Card title="Past Team Submissions">
        {submissions.length === 0 ? (
          <p>No submissions have been made for your team yet.</p>
        ) : (
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
                  const taskName = tasks.find(t => t.task_id === sub.task_id)?.title || 'Task ID: ' + sub.task_id;
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
                        {sub.student?.name || 'Unknown'}
                      </td>
                      <td data-label="Date" style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(sub.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="New Upload">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Milestone Task</label>
            <select 
              className="form-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              required
            >
              <option value="" disabled>Select a Task...</option>
              {tasks.map(t => (
                <option key={t.task_id} value={t.task_id}>{t.title}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Submission Type</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="radio" 
                  checked={submissionType === 'file'} 
                  onChange={() => setSubmissionType('file')} 
                /> File Upload
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="radio" 
                  checked={submissionType === 'link'} 
                  onChange={() => setSubmissionType('link')} 
                /> URL Link
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
              <label className="form-label">Select File</label>
              <div style={{
                border: '2px dashed #CCCCCC',
                borderRadius: '4px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#FAFAFA'
              }}>
                <Upload size={28} color="#9F9F9F" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
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

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={submitting || !selectedTaskId}>
            <FileCheck size={16} />
            <span>{submitting ? 'SUBMITTING...' : 'SUBMIT DELIVERABLE'}</span>
          </button>
        </form>
      </Card>
    </div>
  );
};
