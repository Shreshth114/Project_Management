import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { submissionService } from '../../services/submissionService';
import { taskService } from '../../services/taskService';

export const FacultySubmissions = () => {
  const { currentUser, setActiveTab } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      loadData(currentUser.faculty_id);
    }
  }, [currentUser]);

  const loadData = async (facultyId) => {
    try {
      setLoading(true);
      const [fetchedSubmissions, fetchedTasks] = await Promise.all([
        submissionService.getAllSubmissionsForFaculty(facultyId),
        taskService.getTasks()
      ]);
      setSubmissions(fetchedSubmissions || []);
      setTasks(fetchedTasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading submissions...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Submitted Student Deliverables</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Review technical documents, reports, and code repositories uploaded by assigned batches.
        </p>
      </div>

      <Card title="Submitted Project Work Queue">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Group / Student</th>
                <th>Task Component</th>
                <th>Deliverable File</th>
                <th>Submitted By</th>
                <th>Submission Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((sub) => {
                  const taskName = tasks.find(t => t.task_id === sub.task_id)?.title || 'Unknown Task';
                  return (
                    <tr key={sub.submission_id}>
                      <td data-label="Group / Student" style={{ fontWeight: 700, color: '#243143' }}>{sub.team?.team_code || 'Individual'}</td>
                      <td data-label="Task Component">{taskName}</td>
                      <td data-label="Deliverable File" style={{ color: '#114C94', fontWeight: 600 }}>
                        {sub.file_type === 'link' ? (
                          <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ color: '#B82226' }}>{sub.file_url}</a>
                        ) : (
                          <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ color: '#114C94' }}>{sub.file_name}</a>
                        )}
                      </td>
                      <td data-label="Submitted By">{sub.student?.name || 'Unknown'}</td>
                      <td data-label="Submission Time">{new Date(sub.submitted_at).toLocaleString()}</td>
                      <td data-label="Status"><Badge variant="success">Completed</Badge></td>
                      <td data-label="Actions">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setActiveTab('evaluation')}
                        >
                          Evaluate & Mark
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No student submissions uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
