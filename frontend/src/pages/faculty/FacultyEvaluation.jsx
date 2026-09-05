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
  const { currentUser, data } = useAuth();
  
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
    } else {
      const mockGroups = data?.groups || [];
      const mockTasks = data?.tasks || [];
      setGroups(mockGroups);
      setTasks(mockTasks);
      if (mockGroups.length > 0) setSelectedGroupId(mockGroups[0].id || mockGroups[0].team_id);
      if (mockTasks.length > 0) setSelectedTaskId(mockTasks[0].id || mockTasks[0].task_id);
      setLoading(false);
    }
  }, [currentUser, data]);

  const fetchInitialData = async (facultyId) => {
    try {
      setLoading(true);
      const [fetchedGroups, fetchedTasks] = await Promise.all([
        academicService.getTeams({ guide_id: facultyId }),
        taskService.getTasks()
      ]);
      const teamList = fetchedGroups || data?.groups || [];
      const taskList = fetchedTasks || data?.tasks || [];
      setGroups(teamList);
      setTasks(taskList);
      
      if (teamList.length > 0) setSelectedGroupId(teamList[0].team_id || teamList[0].id);
      if (taskList.length > 0) setSelectedTaskId(taskList[0].task_id || taskList[0].id);
    } catch (err) {
      setError(err.message);
      setGroups(data?.groups || []);
      setTasks(data?.tasks || []);
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
      const critList = fetchedCriteria && fetchedCriteria.length > 0 ? fetchedCriteria : [
        { criteria_id: 1, criteria_name: 'SRS & Architecture', max_marks: 10 },
        { criteria_id: 2, criteria_name: 'Project Understanding', max_marks: 10 },
        { criteria_id: 3, criteria_name: 'Individual Contribution', max_marks: 10 },
        { criteria_id: 4, criteria_name: 'Documentation', max_marks: 5 },
        { criteria_id: 5, criteria_name: 'Presentation', max_marks: 5 },
        { criteria_id: 6, criteria_name: 'Viva Voce & Defense', max_marks: 10 }
      ];
      setCriteria(critList);
      
      const taskSubmissions = (fetchedSubmissions || []).filter(s => String(s.task_id) === String(taskId));
      setSubmissions(taskSubmissions);
      setEvaluations(fetchedEvaluations || []);
      
      const group = groups.find(g => String(g.team_id || g.id) === String(groupId));
      if (group && group.members && group.members.length > 0) {
        openEvaluationForStudent(group.members[0].usn, group.members, fetchedEvaluations, critList);
      }
    } catch (err) {
      console.warn("Evaluation fetch info:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = groups.find(g => String(g.team_id || g.id) === String(selectedGroupId)) || groups[0];
  const activeStudentObj = selectedGroup?.members?.find(m => m.usn === activeStudentUsn);

  const openEvaluationForStudent = (usn, membersList = selectedGroup?.members, evals = evaluations, critList = criteria) => {
    setActiveStudentUsn(usn);
    const studentObj = (membersList || []).find(m => m.usn === usn);
    if (!studentObj) return;

    const studentEvals = (evals || []).filter(e => e.student_id === studentObj.student_id);
    
    let initialScores = {};
    let initialFeedback = '';
    
    if (studentEvals.length > 0) {
      studentEvals.forEach(e => {
        initialScores[e.criteria_id] = e.awarded_marks;
        if (e.feedback) initialFeedback = e.feedback;
      });
    } else {
      (critList || []).forEach(c => {
        initialScores[c.criteria_id] = '';
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
    
    try {
      setSubmitting(true);
      setError(null);
      
      const submission = submissions[0];
      if (submission && currentUser?.faculty_id) {
        const payloadArray = criteria.map(c => ({
          submission_id: submission.submission_id,
          student_id: activeStudentObj.student_id,
          criteria_id: c.criteria_id,
          evaluator_id: currentUser.faculty_id,
          awarded_marks: Number(scores[c.criteria_id] || 0),
          feedback: feedback
        }));

        await evaluationService.saveEvaluations(payloadArray);
        const updatedEvals = await evaluationService.getEvaluationsForTeamTask(selectedGroupId, selectedTaskId);
        setEvaluations(updatedEvals || []);
      }
      
      const totalScore = calculateTotal();
      setSavedSuccess(`Individual marks (${totalScore}) saved for ${activeStudentObj.name}!`);
      setTimeout(() => setSavedSuccess(''), 4000);
    } catch (err) {
      setError(err.message || "Failed to save evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  const isGroupMode = selectedGroup?.submissionMode === 'LEADER_SUBMITS_ALL' || selectedGroup?.submissionMode === 'GROUP';
  const groupCode = selectedGroup?.groupCode || selectedGroup?.team_code || 'Group G01';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Faculty Rubric Evaluation Portal</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Review submitted deliverables, then evaluate EVERY group member individually with separate marks.
        </p>
      </div>

      {savedSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{savedSuccess}</span>
        </div>
      )}
      
      {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#FEE', borderRadius: '4px' }}>{error}</div>}

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
                <option key={g.team_id || g.id} value={g.team_id || g.id}>
                  {g.groupCode || g.team_code} - {g.title || g.subject?.subject_name || 'Project'}
                </option>
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
                <option key={t.task_id || t.id} value={t.task_id || t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* TOP SECTION: COMBINED GROUP PROJECT SUBMISSIONS */}
      {selectedGroup && (
        <Card title={`1. DELIVERABLES & SUBMISSIONS REVIEW (${groupCode})`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                {selectedGroup.title || selectedGroup.subject?.subject_name || 'Project'}
              </h2>
              <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                Domain: <strong>{selectedGroup.domain || 'Cloud & Distributed Systems'}</strong> | Faculty Guide: <strong>{selectedGroup.guide?.name || selectedGroup.guide || 'Faculty Guide'}</strong>
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
                          compKey === 'deploymentLink' || comp.url ? (
                            <a href={comp.url || '#'} target="_blank" rel="noreferrer" style={{ color: '#DE3B0B', fontWeight: 600 }}>
                              {comp.url || 'Deployment Link'}
                            </a>
                          ) : (
                            <span style={{ color: '#3A1F6F', fontWeight: 600 }}>{comp.fileName} ({comp.fileSize || '3.2 MB'})</span>
                          )
                        ) : (
                          <span style={{ color: '#8A9198' }}>Pending Upload</span>
                        )}
                      </td>

                      <td data-label="Submission Origin" style={{ fontSize: '13px', fontWeight: 600, color: '#3A1F6F' }}>
                        {isGroupMode 
                          ? `${groupCode} (Group Submission)`
                          : (comp.submittedByNames && comp.submittedByNames.length > 0 ? `${comp.submittedByNames.join(' + ')} [${groupCode}]` : `${selectedGroup.leaderName || 'Leader'} [${groupCode}]`)
                        }
                      </td>

                      <td data-label="Date" style={{ fontSize: '12px', color: '#55636B' }}>
                        {comp.submittedAt || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedGroup && (
        <Card title="2. INDIVIDUAL STUDENT EVALUATIONS (SEPARATE MARKS PER MEMBER)">
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
            Deliverables are reflected across the team, but EVERY student is evaluated separately with individual marks.
          </p>

          {/* Group Members Evaluation Roster Table */}
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
                {(selectedGroup.members || []).map((m) => {
                  const studentEvals = evaluations.filter(e => e.student_id === m.student_id);
                  const isEvaluated = studentEvals.length > 0;
                  const totalMarksAwarded = studentEvals.reduce((sum, e) => sum + (e.awarded_marks || 0), 0);
                  const isSelected = m.usn === activeStudentUsn;

                  return (
                    <tr key={m.usn} style={{ backgroundColor: isSelected ? '#FDF0F2' : 'transparent' }}>
                      <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                      <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
                      <td data-label="Marks Awarded" style={{ fontWeight: 700, fontSize: '15px', color: '#DE3B0B' }}>
                        {isEvaluated ? `${totalMarksAwarded} Marks` : 'Not Evaluated'}
                      </td>
                      <td data-label="Status">
                        <Badge variant={isEvaluated ? 'success' : 'warning'}>
                          {isEvaluated ? '✓ Evaluated' : '○ Pending'}
                        </Badge>
                      </td>
                      <td data-label="Action">
                        <button 
                          type="button"
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
                  <div style={{ fontSize: '12px', color: '#55636B', marginTop: '2px' }}>
                    Group: {groupCode} | Evaluator: {currentUser?.name || 'Faculty Advisor'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#DE3B0B' }}>
                    {calculateTotal()} <span style={{ fontSize: '14px', color: '#8A9198' }}>/ {criteria.reduce((s, c) => s + (c.max_marks || 0), 0) || 50}</span>
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
