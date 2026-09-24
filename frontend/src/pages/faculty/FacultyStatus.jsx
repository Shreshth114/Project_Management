import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Clock, Eye, X, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { evaluationService } from '../../services/evaluationService';
import { submissionService } from '../../services/submissionService';
import { taskService } from '../../services/taskService';

export const FacultyStatus = () => {
  const { currentUser } = useAuth();
  
  const [usnSearch, setUsnSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inspectingStudent, setInspectingStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      loadData(currentUser.faculty_id);
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadData = async (facultyId) => {
    try {
      setLoading(true);
      const [teams, evaluations, allTasks] = await Promise.all([
        academicService.getTeams({ guide_id: facultyId }).catch(() => []),
        evaluationService.getAllEvaluations().catch(() => []),
        taskService.getTasks().catch(() => [])
      ]);

      const taskMap = {};
      (allTasks || []).forEach(t => {
        taskMap[t.task_id] = t;
      });

      const studentRoster = [];

      for (const team of teams || []) {
        const teamSubs = await submissionService.getSubmissionsByTeam(team.team_id).catch(() => []);
        const hasSubmissions = teamSubs && teamSubs.length > 0;
        const latestSub = hasSubmissions ? teamSubs[teamSubs.length - 1] : null;
        const taskObj = latestSub ? taskMap[latestSub.task_id] : null;
        const taskTitle = taskObj ? taskObj.title : (latestSub ? `Task #${latestSub.task_id}` : '—');

        for (const m of team.members || []) {
          // Strictly evaluate per student_id (NOT by entire team_id)
          const studentEvals = (evaluations || []).filter(e => Number(e.student_id) === Number(m.student_id));
          const isEvaluated = studentEvals.length > 0;

          let submissionStatus = hasSubmissions ? 'SUBMITTED' : 'NOT_SUBMITTED';
          let evalStatus = isEvaluated ? 'EVALUATED' : (hasSubmissions ? 'PENDING_EVALUATION' : 'NOT_EVALUATED');
          let submissionDate = latestSub?.submitted_at ? new Date(latestSub.submitted_at).toLocaleDateString() : '—';
          let progress = isEvaluated ? 100 : (hasSubmissions ? 60 : 0);

          const totalMarks = isEvaluated
            ? studentEvals.reduce((sum, e) => sum + Number(e.awarded_marks || 0), 0)
            : null;
          const feedback = studentEvals.find(e => e.feedback)?.feedback || '';

          studentRoster.push({
            usn: m.usn,
            name: m.name,
            email: m.email,
            student_id: m.student_id,
            groupName: team.team_code,
            groupTitle: team.subject?.subject_name || 'Academic Project',
            groupId: team.team_id,
            submissionStatus,
            evalStatus,
            submissionDate,
            taskTitle,
            taskType: taskObj?.task_type || 'Milestone',
            totalMarks,
            feedback,
            progress,
            evalRec: studentEvals[0] || null,
            studentEvals
          });
        }
      }

      setAllStudents(studentRoster);
    } catch (err) {
      console.error("Status load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = allStudents.filter(s => {
    const matchesSearch = (s.usn && s.usn.toLowerCase().includes(usnSearch.toLowerCase())) ||
                          (s.name && s.name.toLowerCase().includes(usnSearch.toLowerCase())) ||
                          (s.taskTitle && s.taskTitle.toLowerCase().includes(usnSearch.toLowerCase())) ||
                          (s.groupName && s.groupName.toLowerCase().includes(usnSearch.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'SUBMITTED') matchesStatus = s.submissionStatus === 'SUBMITTED';
    else if (statusFilter === 'NOT_SUBMITTED') matchesStatus = s.submissionStatus === 'NOT_SUBMITTED';
    else if (statusFilter === 'PENDING') matchesStatus = s.evalStatus === 'PENDING_EVALUATION';
    else if (statusFilter === 'EVALUATED') matchesStatus = s.evalStatus === 'EVALUATED';

    return matchesSearch && matchesStatus;
  });

  if (loading) return <div style={{ padding: '24px', color: '#55636B' }}>Loading student evaluation matrix...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Student Submission & Rubric Evaluation Matrix</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Search students by USN to track submission status, submitted assignments, submission dates, progress, and rubric scores.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="mobile-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="#3A1F6F" />
            <input
              type="text"
              className="form-input"
              placeholder="Search student by USN, Name, Group, or Assignment..."
              value={usnSearch}
              onChange={(e) => setUsnSearch(e.target.value)}
            />
          </div>

          <div className="mobile-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#3A1F6F" />
            <select
              className="form-select"
              style={{ width: '100%', maxWidth: '220px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Submission Statuses</option>
              <option value="SUBMITTED">✓ Submitted</option>
              <option value="PENDING">○ Pending Evaluation</option>
              <option value="EVALUATED">✓ Evaluated</option>
              <option value="NOT_SUBMITTED">✕ Not Submitted</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Roster Table */}
      <Card title="Student Evaluation & Compliance Directory">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Student USN</th>
                <th>Full Name</th>
                <th>Group Name</th>
                <th>Assignment / Deliverable</th>
                <th>Status (Submission Date & Progress)</th>
                <th>Faculty Rubric Evaluation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.usn || s.name}>
                    <td data-label="Student USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{s.usn}</td>
                    <td data-label="Full Name" style={{ fontWeight: 600 }}>{s.name}</td>
                    <td data-label="Group Name" style={{ fontWeight: 700, color: '#3A1F6F' }}>{s.groupName}</td>

                    <td data-label="Assignment / Deliverable">
                      {s.submissionStatus === 'SUBMITTED' ? (
                        <div>
                          <div style={{ fontWeight: 700, color: '#3A1F6F', fontSize: '13px' }}>
                            {s.taskTitle}
                          </div>
                          <span style={{ fontSize: '11px', color: '#55636B' }}>
                            ({s.taskType})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#8A9198', fontSize: '13px' }}>—</span>
                      )}
                    </td>

                    <td data-label="Status">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <Badge variant={s.submissionStatus === 'SUBMITTED' ? 'success' : 'danger'}>
                          {s.submissionStatus === 'SUBMITTED' ? '✓ Submitted' : '✕ Not Submitted'}
                        </Badge>
                        <div style={{ fontSize: '11px', color: '#55636B', marginTop: '2px' }}>
                          Date: <strong>{s.submissionDate}</strong>
                        </div>
                      </div>
                    </td>

                    <td data-label="Rubric Evaluation">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <Badge variant={s.evalStatus === 'EVALUATED' ? 'success' : s.evalStatus === 'PENDING_EVALUATION' ? 'warning' : 'info'}>
                          {s.evalStatus === 'EVALUATED' ? '✓ Evaluated' : s.evalStatus === 'PENDING_EVALUATION' ? '○ Pending Review' : '✕ Not Evaluated'}
                        </Badge>
                        {s.evalStatus === 'EVALUATED' && s.totalMarks !== null && (
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#107C41', marginTop: '1px' }}>
                            Score: {s.totalMarks} Marks
                          </div>
                        )}
                      </div>
                    </td>

                    <td data-label="Action">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setInspectingStudent(s)}
                        title="Inspect student details"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#8A9198', padding: '24px' }}>
                    No students found under your allocated project teams.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspection Modal */}
      {inspectingStudent && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="mobile-wrap" style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} />
                <span>Student Compliance Details ({inspectingStudent.usn})</span>
              </h3>
              <button 
                onClick={() => setInspectingStudent(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #E5E5E5', paddingBottom: '12px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                  {inspectingStudent.name}
                </h4>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '6px' }}>
                  USN: <strong>{inspectingStudent.usn}</strong> | Group: <strong>{inspectingStudent.groupName}</strong>
                </div>
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                  Email: <strong>{inspectingStudent.email || 'Not Provided'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div><strong>Assignment / Deliverable:</strong> <span style={{ color: '#3A1F6F', fontWeight: 700 }}>{inspectingStudent.taskTitle}</span></div>
                <div><strong>Submission Status:</strong> <Badge variant={inspectingStudent.submissionStatus === 'SUBMITTED' ? 'success' : 'danger'}>{inspectingStudent.submissionStatus}</Badge></div>
                <div><strong>Submission Date:</strong> {inspectingStudent.submissionDate}</div>
                <div><strong>Evaluation Status:</strong> <Badge variant={inspectingStudent.evalStatus === 'EVALUATED' ? 'success' : inspectingStudent.evalStatus === 'PENDING_EVALUATION' ? 'warning' : 'info'}>{inspectingStudent.evalStatus === 'EVALUATED' ? '✓ Evaluated' : inspectingStudent.evalStatus === 'PENDING_EVALUATION' ? '○ Pending Review' : '✕ Not Evaluated'}</Badge></div>
                {inspectingStudent.evalStatus === 'EVALUATED' && inspectingStudent.totalMarks !== null && (
                  <div><strong>Awarded Marks:</strong> <span style={{ color: '#107C41', fontWeight: 800 }}>{inspectingStudent.totalMarks} Marks</span></div>
                )}
                {inspectingStudent.feedback && (
                  <div>
                    <strong>Faculty Feedback:</strong>
                    <div style={{ marginTop: '4px', padding: '8px 12px', background: '#F8F9FA', borderRadius: '4px', fontStyle: 'italic', color: '#55636B', borderLeft: '3px solid #3A1F6F' }}>
                      "{inspectingStudent.feedback}"
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setInspectingStudent(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
