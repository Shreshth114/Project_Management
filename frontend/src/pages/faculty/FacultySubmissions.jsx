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

<<<<<<< HEAD
  // 1. Group Deliverable Components
  if (data.groups) {
    data.groups.forEach(g => {
      const isModeA = g.submissionMode === 'LEADER_SUBMITS_ALL' || g.submissionMode === 'GROUP';
      const modeLabel = isModeA ? 'Mode A (Group Mode)' : 'Mode B (Individual Mode)';
      
      if (g.components) {
        Object.keys(g.components).forEach(compKey => {
          const comp = g.components[compKey];
          if (comp.status === 'COMPLETED') {
            let submittedByLabel = '';
            if (isModeA) {
              submittedByLabel = `${g.groupCode} (Group Submission)`;
            } else {
              submittedByLabel = comp.submittedByNames && comp.submittedByNames.length > 0 
                ? `${comp.submittedByNames.join(' + ')} (${comp.submittedByUsns?.join(', ') || '1MS21CS078'})` 
                : `${g.leaderName} (${g.leaderUsn})`;
            }

            allSubmissions.push({
              id: `${g.id}-${compKey}`,
              groupCode: g.groupCode,
              taskTitle: comp.title,
              modeOfSubmission: modeLabel,
              fileName: comp.fileName || comp.url || "Live Endpoint URL",
              fileSize: comp.fileSize || "Web Link",
              submittedBy: submittedByLabel,
              submittedAt: comp.submittedAt || "2025-10-08",
              status: "COMPLETED",
              isModeA
            });
          }
        });
      }
    });
  }

  // 2. Individual Submissions
  if (data.individualSubmissions) {
    data.individualSubmissions.forEach(ind => {
      allSubmissions.push({
        id: ind.id,
        groupCode: `Individual (${ind.studentUsn})`,
        taskTitle: ind.taskTitle,
        modeOfSubmission: "Mode B (Individual Mode)",
        fileName: ind.fileName,
        fileSize: ind.fileSize,
        submittedBy: `${ind.studentName} (${ind.studentUsn})`,
        submittedAt: ind.submittedAt,
        status: ind.status || "COMPLETED",
        isModeA: false
      });
    });
  }
=======
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
>>>>>>> origin/main

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Submitted Student Deliverables Queue</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Review technical documents, reports, and repositories uploaded by assigned project groups.
        </p>
      </div>

      <Card title="Submitted Project Work Queue">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Task Component</th>
                <th>Mode of Submission</th>
                <th>Deliverable File</th>
                <th>Submitted By</th>
                <th>Submission Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {allSubmissions.length > 0 ? (
                allSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td data-label="Group Name" style={{ fontWeight: 800, color: '#DE3B0B' }}>{sub.groupCode}</td>
                    <td data-label="Task Component" style={{ fontWeight: 600 }}>{sub.taskTitle}</td>
                    {/* Added Mode of Submission column */}
                    <td data-label="Mode of Submission">
                      <Badge variant="purple">{sub.modeOfSubmission}</Badge>
                    </td>
                    <td data-label="Deliverable File" style={{ color: '#3A1F6F', fontWeight: 600 }}>{sub.fileName} ({sub.fileSize})</td>
                    <td data-label="Submitted By" style={{ fontWeight: 700, color: '#3A1F6F' }}>{sub.submittedBy}</td>
                    <td data-label="Submission Time" style={{ fontSize: '12px', color: '#55636B' }}>{sub.submittedAt}</td>
                    <td data-label="Status"><Badge variant="success">✓ {sub.status}</Badge></td>
                    <td data-label="Action">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('evaluation')}
                      >
                        Evaluate & Mark
                      </button>
                    </td>
                  </tr>
                ))
=======
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
>>>>>>> origin/main
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#8A9198' }}>
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
