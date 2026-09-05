import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { submissionService } from '../../services/submissionService';
import { taskService } from '../../services/taskService';

export const FacultySubmissions = ({ readOnly = false }) => {
  const { currentUser, setActiveTab, data, isAuthLoading } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      loadData(currentUser.faculty_id);
    } else if (!isAuthLoading) {
      setLoading(false);
    }
  }, [currentUser, isAuthLoading]);

  const loadData = async (facultyId) => {
    try {
      setLoading(true);
      let subs = [];
      let tList = [];

      try {
        subs = await submissionService.getAllSubmissionsForFaculty(facultyId);
      } catch (subErr) {
        console.warn("getAllSubmissionsForFaculty error, falling back to team query:", subErr);
        try {
          const teams = await academicService.getTeams({ guide_id: facultyId });
          if (teams && teams.length > 0) {
            const teamSubsPromises = teams.map(t => submissionService.getSubmissionsByTeam(t.team_id));
            const teamSubsResults = await Promise.allSettled(teamSubsPromises);
            teamSubsResults.forEach((res, idx) => {
              if (res.status === 'fulfilled' && res.value) {
                const enriched = res.value.map(s => ({
                  ...s,
                  team: teams[idx]
                }));
                subs.push(...enriched);
              }
            });
          }
        } catch (teamErr) {
          console.warn("Error fetching teams for submissions fallback:", teamErr);
        }
      }

      try {
        tList = await taskService.getTasks();
      } catch (taskErr) {
        console.warn("getTasks error:", taskErr);
      }

      setSubmissions(subs || []);
      setTasks(tList || []);
    } catch (err) {
      console.error("Error loading faculty submissions data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically collect all group component submissions & individual submissions
  const allSubmissions = [];

  // 1. Backend Supabase Submissions
  if (submissions && submissions.length > 0) {
    submissions.forEach(sub => {
      const task = tasks.find(t => String(t.task_id || t.id) === String(sub.task_id));
      const taskTitle = task?.title || sub.task_name || 'Project Deliverable';
      const isModeA = sub.team?.submission_mode === 'LEADER_SUBMITS_ALL' || sub.team?.submission_mode === 'GROUP';
      const modeLabel = isModeA ? 'Mode A (Group Mode)' : 'Mode B (Individual Mode)';
      const groupCode = sub.team?.team_code || 'Individual';
      const submittedByLabel = sub.student?.name 
        ? `${sub.student.name} (${sub.student.usn || ''})` 
        : (sub.submitted_by_name || 'Student');

      allSubmissions.push({
        id: `supabase-${sub.submission_id || sub.id}`,
        groupCode,
        taskTitle,
        modeOfSubmission: modeLabel,
        fileName: sub.file_name || (sub.file_type === 'link' ? sub.file_url : 'Deliverable Document'),
        fileSize: sub.file_type === 'link' ? 'Web Link' : (sub.file_size || 'Attached File'),
        fileUrl: sub.file_url,
        submittedBy: submittedByLabel,
        submittedAt: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent',
        status: sub.status || 'COMPLETED',
        isModeA
      });
    });
  }

  // 2. Group Deliverable Components from data (portal state)
  if (data?.groups) {
    data.groups.forEach(g => {
      const isModeA = g.submissionMode === 'LEADER_SUBMITS_ALL' || g.submissionMode === 'GROUP';
      const modeLabel = isModeA ? 'Mode A (Group Mode)' : 'Mode B (Individual Mode)';
      
      if (g.components) {
        Object.keys(g.components).forEach(compKey => {
          const comp = g.components[compKey];
          if (comp && (comp.status === 'COMPLETED' || comp.fileName || comp.url)) {
            let submittedByLabel = '';
            if (isModeA) {
              submittedByLabel = `${g.groupCode} (Group Submission)`;
            } else {
              submittedByLabel = comp.submittedByNames && comp.submittedByNames.length > 0 
                ? `${comp.submittedByNames.join(' + ')} (${comp.submittedByUsns?.join(', ') || '1MS21CS078'})` 
                : `${g.leaderName} (${g.leaderUsn})`;
            }

            const id = `${g.id}-${compKey}`;
            const alreadyExists = allSubmissions.some(
              s => s.id === id || (s.groupCode === g.groupCode && s.taskTitle === comp.title)
            );

            if (!alreadyExists) {
              allSubmissions.push({
                id,
                groupCode: g.groupCode,
                taskTitle: comp.title,
                modeOfSubmission: modeLabel,
                fileName: comp.fileName || comp.url || "Live Endpoint URL",
                fileSize: comp.fileSize || "Web Link",
                fileUrl: comp.url,
                submittedBy: submittedByLabel,
                submittedAt: comp.submittedAt || "2025-10-08",
                status: comp.status || "COMPLETED",
                isModeA
              });
            }
          }
        });
      }
    });
  }

  // 3. Individual Submissions from data
  if (data?.individualSubmissions) {
    data.individualSubmissions.forEach(ind => {
      const id = `ind-${ind.id}`;
      if (!allSubmissions.some(s => s.id === id || s.id === ind.id)) {
        allSubmissions.push({
          id,
          groupCode: `Individual (${ind.studentUsn})`,
          taskTitle: ind.taskTitle,
          modeOfSubmission: "Mode B (Individual Mode)",
          fileName: ind.fileName || ind.fileUrl || "Deliverable File",
          fileSize: ind.fileSize || "1.8 MB",
          fileUrl: ind.fileUrl,
          submittedBy: `${ind.studentName} (${ind.studentUsn})`,
          submittedAt: ind.submittedAt || "2025-10-08",
          status: ind.status || "COMPLETED",
          isModeA: false
        });
      }
    });
  }

  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#55636B' }}>
        <p>Loading student deliverables queue...</p>
      </div>
    );
  }

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
              {allSubmissions.length > 0 ? (
                allSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td data-label="Group Name" style={{ fontWeight: 800, color: '#DE3B0B' }}>{sub.groupCode}</td>
                    <td data-label="Task Component" style={{ fontWeight: 600 }}>{sub.taskTitle}</td>
                    {/* Added Mode of Submission column */}
                    <td data-label="Mode of Submission">
                      <Badge variant="purple">{sub.modeOfSubmission}</Badge>
                    </td>
                    <td data-label="Deliverable File" style={{ color: '#3A1F6F', fontWeight: 600 }}>
                      {sub.fileUrl ? (
                        <a 
                          href={sub.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: '#3A1F6F', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          {sub.fileName} ({sub.fileSize})
                        </a>
                      ) : (
                        <span>{sub.fileName} ({sub.fileSize})</span>
                      )}
                    </td>
                    <td data-label="Submitted By" style={{ fontWeight: 700, color: '#3A1F6F' }}>{sub.submittedBy}</td>
                    <td data-label="Submission Time" style={{ fontSize: '12px', color: '#55636B' }}>{sub.submittedAt}</td>
                    <td data-label="Status"><Badge variant="success">✓ {sub.status}</Badge></td>
                    <td data-label="Action">
                      <button 
                        className={`btn ${readOnly ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                        onClick={() => setActiveTab('evaluation')}
                      >
                        {readOnly ? 'View Evaluations' : 'Evaluate & Mark'}
                      </button>
                    </td>
                  </tr>
                ))
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
