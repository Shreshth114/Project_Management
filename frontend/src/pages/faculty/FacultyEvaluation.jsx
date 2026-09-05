import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Save, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { taskService } from '../../services/taskService';
import { submissionService } from '../../services/submissionService';
import { evaluationService } from '../../services/evaluationService';

export const FacultyEvaluation = () => {
  const { currentUser } = useAuth();
  
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  const [criteria, setCriteria] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  
  const [activeStudentUsn, setActiveStudentUsn] = useState('');
  
  // Dynamic form state for scores: { criteria_id: score }
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState('');

  useEffect(() => {
    if (currentUser?.faculty_id) {
      fetchInitialData(currentUser.faculty_id);
    }
  }, [currentUser]);

  const fetchInitialData = async (facultyId) => {
    try {
      setLoading(true);
      const [fetchedGroups, fetchedTasks] = await Promise.all([
        academicService.getTeams({ guide_id: facultyId }),
        taskService.getTasks() // Fetch all tasks
      ]);
      setGroups(fetchedGroups || []);
      setTasks(fetchedTasks || []);
      
      if (fetchedGroups.length > 0) setSelectedGroupId(fetchedGroups[0].team_id);
      if (fetchedTasks.length > 0) setSelectedTaskId(fetchedTasks[0].task_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId && selectedTaskId) {
      fetchEvaluationData(selectedGroupId, selectedTaskId);
    }
  }, [selectedGroupId, selectedTaskId]);

  const fetchEvaluationData = async (groupId, taskId) => {
    try {
      setLoading(true);
      const [fetchedCriteria, fetchedSubmissions, fetchedEvaluations] = await Promise.all([
        evaluationService.getCriteriaForTask(taskId),
        submissionService.getSubmissionsByTeam(groupId),
        evaluationService.getEvaluationsForTeamTask(groupId, taskId)
      ]);
      setCriteria(fetchedCriteria || []);
      
      // Filter submissions to only this task
      const taskSubmissions = (fetchedSubmissions || []).filter(s => s.task_id === Number(taskId));
      setSubmissions(taskSubmissions);
      setEvaluations(fetchedEvaluations || []);
      
      const group = groups.find(g => g.team_id === Number(groupId));
      if (group && group.members.length > 0) {
        openEvaluationForStudent(group.members[0].usn, group.members, fetchedEvaluations, fetchedCriteria);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = groups.find(g => g.team_id === Number(selectedGroupId));
  const activeStudentObj = selectedGroup?.members?.find(m => m.usn === activeStudentUsn);

  const openEvaluationForStudent = (usn, membersList = selectedGroup?.members, evals = evaluations, critList = criteria) => {
    setActiveStudentUsn(usn);
    const studentObj = (membersList || []).find(m => m.usn === usn);
    if (!studentObj) return;

    // See if student already has evaluations
    const studentEvals = evals.filter(e => e.student_id === studentObj.student_id);
    
    let initialScores = {};
    let initialFeedback = '';
    
    if (studentEvals.length > 0) {
      studentEvals.forEach(e => {
        initialScores[e.criteria_id] = e.awarded_marks;
        if (e.feedback) initialFeedback = e.feedback;
      });
    } else {
      critList.forEach(c => {
        initialScores[c.criteria_id] = ''; // Start empty
      });
    }
    
    setScores(initialScores);
    setFeedback(initialFeedback);
  };

  const handleScoreChange = (criteriaId, value) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const calculateTotal = () => {
    return Object.values(scores).reduce((sum, val) => sum + (Number(val) || 0), 0);
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!activeStudentObj) return;
    
    // Check if there is a submission for this task (usually required to evaluate)
    const submission = submissions[0]; // Just picking the first submission for this task
    if (!submission) {
      setError("Cannot evaluate: No submission found for this task from this team.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const payloadArray = criteria.map(c => ({
        submission_id: submission.submission_id,
        student_id: activeStudentObj.student_id,
        criteria_id: c.criteria_id,
        evaluator_id: currentUser.faculty_id,
        awarded_marks: Number(scores[c.criteria_id] || 0),
        feedback: feedback
      }));

      await evaluationService.saveEvaluations(payloadArray);
      
      // Refresh evaluations
      const updatedEvals = await evaluationService.getEvaluationsForTeamTask(selectedGroupId, selectedTaskId);
      setEvaluations(updatedEvals || []);
      
      const totalScore = calculateTotal();
      setSavedSuccess(`Individual marks (${totalScore}) saved for ${activeStudentObj.name}!`);
      setTimeout(() => setSavedSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

<<<<<<< HEAD
  const isGroupMode = selectedGroup?.submissionMode === 'LEADER_SUBMITS_ALL' || selectedGroup?.submissionMode === 'GROUP';
=======
  if (loading && groups.length === 0) return <div>Loading Evaluation Portal...</div>;
>>>>>>> origin/main

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Faculty Rubric Evaluation Portal</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
<<<<<<< HEAD
          Review submitted deliverables, then evaluate EVERY group member individually with separate marks.
=======
          Evaluate project components based on dynamic criteria.
>>>>>>> origin/main
        </p>
      </div>

      {savedSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{savedSuccess}</span>
        </div>
      )}
      
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <Card>
        <div className="grid-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select Project Group</label>
            <select
              className="form-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              {groups.map(g => (
                <option key={g.team_id} value={g.team_id}>{g.team_code}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select Milestone Task</label>
            <select
              className="form-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              {tasks.map(t => (
<<<<<<< HEAD
                <option key={t.id} value={t.id}>{t.submissionMode === 'MEMBERS_SUBMIT_ASSIGNED' ? '👤' : '👥'} {t.title}</option>
=======
                <option key={t.task_id} value={t.task_id}>{t.title}</option>
>>>>>>> origin/main
              ))}
            </select>
          </div>
        </div>
      </Card>

<<<<<<< HEAD
      {/* TOP SECTION: COMBINED GROUP PROJECT SUBMISSIONS */}
      {selectedGroup && (
        <Card title={`1. DELIVERABLES & SUBMISSIONS REVIEW (${selectedGroup.groupCode})`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>{selectedGroup.title}</h2>
              <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                Domain: <strong>{selectedGroup.domain}</strong> | Faculty Guide: <strong>{selectedGroup.guide}</strong>
              </div>
            </div>
            <Badge variant="purple">
              {isGroupMode ? 'Mode A: Group Submission (1 Upload Reflected for All Members)' : 'Mode B: Individual Submissions'}
            </Badge>
          </div>

          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '10px' }}>
            Group Deliverables & Component Submissions:
          </h4>

          <div className="table-container responsive-table-stack" style={{ marginBottom: '12px' }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Status</th>
                  <th>Submitted File / Link</th>
                  <th>Submission Origin</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedGroup.components && Object.keys(selectedGroup.components).map(compKey => {
                  const comp = selectedGroup.components[compKey];
                  const isCompleted = comp.status === 'COMPLETED';

                  return (
                    <tr key={compKey}>
                      <td data-label="Component" style={{ fontWeight: 700, color: '#3A1F6F' }}>{comp.title}</td>
                      <td data-label="Status">
                        <Badge variant={isCompleted ? 'success' : 'warning'}>
                          {isCompleted ? '✓ Submitted' : '○ Pending'}
                        </Badge>
                      </td>
                      <td data-label="File/Link">
                        {isCompleted ? (
                          compKey === 'deploymentLink' ? (
                            <a href={comp.url} target="_blank" rel="noreferrer" style={{ color: '#DE3B0B', fontWeight: 600 }}>
                              {comp.url}
                            </a>
                          ) : (
                            <span style={{ color: '#3A1F6F', fontWeight: 600 }}>{comp.fileName} ({comp.fileSize})</span>
                          )
                        ) : (
                          <span style={{ color: '#8A9198' }}>Pending Upload</span>
                        )}
                      </td>

                      {/* Display Submission Origin: Mode A displays Group Code, Mode B displays Student Name + Group Code */}
                      <td data-label="Submission Origin" style={{ fontSize: '13px', fontWeight: 600, color: '#3A1F6F' }}>
                        {isGroupMode 
                          ? `${selectedGroup.groupCode} (Group Submission)`
                          : (comp.submittedByNames && comp.submittedByNames.length > 0 ? `${comp.submittedByNames.join(' + ')} [${selectedGroup.groupCode}]` : `${selectedGroup.leaderName} [${selectedGroup.groupCode}]`)
                        }
                      </td>

                      <td data-label="Date" style={{ fontSize: '12px', color: '#55636B' }}>
                        {comp.submittedAt || '—'}
=======
      {selectedGroup && (
        <Card title={`1. SUBMISSIONS FOR TASK (${selectedGroup.team_code})`}>
          {submissions.length === 0 ? (
            <p>No submissions found for this task.</p>
          ) : (
            <div className="table-container responsive-table-stack" style={{ marginBottom: '12px' }}>
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Submitted File / Link</th>
                    <th>Submitted By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub.submission_id}>
                      <td data-label="File/Link">
                        {sub.file_type === 'link' ? (
                          <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ color: '#B82226', fontWeight: 600 }}>
                            {sub.file_url}
                          </a>
                        ) : (
                          <span style={{ color: '#114C94', fontWeight: 600 }}>{sub.file_name}</span>
                        )}
                      </td>
                      <td data-label="Submitted By" style={{ fontSize: '13px' }}>
                        {sub.student?.name || 'Unknown'}
                      </td>
                      <td data-label="Date" style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(sub.submitted_at).toLocaleString()}
>>>>>>> origin/main
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {selectedGroup && (
<<<<<<< HEAD
        <Card title="2. INDIVIDUAL STUDENT EVALUATIONS (SEPARATE MARKS PER MEMBER)">
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
            Deliverables are reflected across the team, but EVERY student is evaluated separately with individual marks.
          </p>

          {/* Group Members Evaluation Roster Table */}
=======
        <Card title="2. INDIVIDUAL STUDENT EVALUATIONS">
>>>>>>> origin/main
          <div className="table-container responsive-table-stack" style={{ marginBottom: '24px' }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>USN</th>
                  <th>Student Name</th>
<<<<<<< HEAD
                  <th>Team Role</th>
                  <th>Submissions Reflected</th>
=======
>>>>>>> origin/main
                  <th>Individual Marks Awarded</th>
                  <th>Evaluation Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedGroup.members.map((m) => {
                  const studentEvals = evaluations.filter(e => e.student_id === m.student_id);
                  const isEvaluated = studentEvals.length > 0;
                  const totalScore = studentEvals.reduce((sum, e) => sum + e.awarded_marks, 0);
                  const isSelected = m.usn === activeStudentUsn;

                  return (
                    <tr key={m.usn} style={{ backgroundColor: isSelected ? '#FDF0F2' : 'transparent' }}>
                      <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                      <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
<<<<<<< HEAD
                      <td data-label="Team Role"><Badge variant={m.role === 'Team Lead' ? 'purple' : 'navy'}>{m.role}</Badge></td>
                      <td data-label="Submissions" style={{ fontSize: '12px', color: '#55636B' }}>
                        {isGroupMode ? '✓ Group Deliverables Reflected' : m.assignedModule}
                      </td>
                      <td data-label="Marks Awarded" style={{ fontWeight: 800, fontSize: '15px', color: '#DE3B0B' }}>
                        {evalRec ? `${evalRec.totalScore} / 50` : 'Not Evaluated'}
                      </td>
                      <td data-label="Status">
                        <Badge variant={evalRec ? 'success' : 'warning'}>
                          {evalRec ? '✓ Evaluated' : '○ Pending'}
=======
                      <td data-label="Marks Awarded" style={{ fontWeight: 700, fontSize: '15px', color: '#B82226' }}>
                        {isEvaluated ? totalScore.toString() : 'Not Evaluated'}
                      </td>
                      <td data-label="Status">
                        <Badge variant={isEvaluated ? 'success' : 'info'}>
                          {isEvaluated ? '✓ Evaluated' : '○ Pending'}
>>>>>>> origin/main
                        </Badge>
                      </td>
                      <td data-label="Action">
                        <button 
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => openEvaluationForStudent(m.usn)}
                        >
                          {isSelected ? 'Evaluating Now' : 'Evaluate Student'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {activeStudentObj && criteria.length > 0 && (
            <div style={{
              border: '2px solid #DE3B0B',
              borderRadius: '6px',
              padding: '20px',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E5E5E5', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                    Individual Rubric Sheet: {activeStudentObj.name} ({activeStudentUsn})
                  </h3>
<<<<<<< HEAD
                  <div style={{ fontSize: '12px', color: '#55636B', marginTop: '2px' }}>
                    Group: {selectedGroup.groupCode} | Evaluator: {currentUser?.name || 'Faculty Advisor'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#DE3B0B' }}>
                    {totalScore} <span style={{ fontSize: '14px', color: '#8A9198' }}>/ 50</span>
=======
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#B82226' }}>
                    {calculateTotal()}
>>>>>>> origin/main
                  </div>
                  <Badge variant="success">Rubric Total</Badge>
                </div>
              </div>

              <form onSubmit={handleSaveEvaluation}>
                <div className="grid-3">
                  {criteria.map((c, idx) => (
                    <div className="form-group" key={c.criteria_id}>
                      <label className="form-label">{idx + 1}. {c.criteria_name} (Max: {c.max_marks})</label>
                      <input
                        type="number"
                        min={0}
                        max={c.max_marks}
                        className="form-input"
                        value={scores[c.criteria_id] !== undefined ? scores[c.criteria_id] : ''}
                        onChange={(e) => handleScoreChange(c.criteria_id, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Individual Feedback & Faculty Remarks</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter feedback specific to this student's performance..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" style={{ padding: '11px' }} disabled={submitting}>
                  <Save size={16} />
                  <span>{submitting ? 'SAVING...' : `SAVE INDIVIDUAL EVALUATION (${calculateTotal()} FOR ${activeStudentObj.name.toUpperCase()})`}</span>
                </button>
              </form>
            </div>
          )}
          {activeStudentObj && criteria.length === 0 && (
             <div style={{ padding: '20px', backgroundColor: '#FAFAFA', borderRadius: '4px' }}>
                No evaluation criteria defined for this task.
             </div>
          )}
        </Card>
      )}
    </div>
  );
};
