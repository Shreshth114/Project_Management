import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { supabase } from '../../lib/supabase';
import { academicService } from '../../services/academicService';
import { submissionService } from '../../services/submissionService';
import { taskService } from '../../services/taskService';

export const FacultySubmissions = ({ readOnly = false }) => {
  const { currentUser, setActiveTab, data, isAuthLoading } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveAndLoad = async () => {
      let fId = currentUser?.faculty_id;
      if (!fId && currentUser?.user_id) {
        const { data: fac } = await supabase
          .from('faculty')
          .select('faculty_id')
          .eq('user_id', currentUser.user_id)
          .maybeSingle();
        if (fac?.faculty_id) fId = fac.faculty_id;
      }

      if (fId) {
        loadData(fId);
      } else if (!isAuthLoading) {
        setLoading(false);
      }
    };

    resolveAndLoad();
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

  // Only real Supabase Submissions are displayed


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
                      {sub.fileUrl && sub.fileUrl !== '#' ? (
                        <button 
                          type="button"
                          onClick={() => submissionService.openSubmissionFile(sub.fileUrl, sub.fileName)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#3A1F6F', 
                            fontWeight: 700, 
                            textDecoration: 'underline', 
                            cursor: 'pointer',
                            padding: 0,
                            font: 'inherit',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Click to view/download deliverable"
                        >
                          <FileText size={16} color="#DE3B0B" />
                          <span>{sub.fileName} ({sub.fileSize})</span>
                        </button>
                      ) : (
                        <span style={{ color: '#8A9198' }}>{sub.fileName} ({sub.fileSize})</span>
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
