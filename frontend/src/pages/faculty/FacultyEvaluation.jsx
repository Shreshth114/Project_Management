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

  if (loading && groups.length === 0) return <div>Loading Evaluation Portal...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Faculty Rubric Evaluation Portal</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Evaluate project components based on dynamic criteria.
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
                <option key={t.task_id} value={t.task_id}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

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
        <Card title="2. INDIVIDUAL STUDENT EVALUATIONS">
          <div className="table-container responsive-table-stack" style={{ marginBottom: '24px' }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>USN</th>
                  <th>Student Name</th>
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
                    <tr key={m.usn} style={{ backgroundColor: isSelected ? '#FDF8F8' : 'transparent' }}>
                      <td data-label="USN" style={{ fontWeight: 700, color: '#243143' }}>{m.usn}</td>
                      <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
                      <td data-label="Marks Awarded" style={{ fontWeight: 700, fontSize: '15px', color: '#B82226' }}>
                        {isEvaluated ? totalScore.toString() : 'Not Evaluated'}
                      </td>
                      <td data-label="Status">
                        <Badge variant={isEvaluated ? 'success' : 'info'}>
                          {isEvaluated ? '✓ Evaluated' : '○ Pending'}
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
              border: '2px solid #B82226',
              borderRadius: '6px',
              padding: '20px',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E5E5E5', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#243143', margin: 0 }}>
                    Individual Rubric Sheet: {activeStudentObj.name} ({activeStudentUsn})
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#B82226' }}>
                    {calculateTotal()}
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
