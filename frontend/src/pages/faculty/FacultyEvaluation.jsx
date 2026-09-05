import React, { useState } from 'react';
import { Award, CheckCircle, Save, ExternalLink, FileText, UserCheck, Layers, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const FacultyEvaluation = () => {
  const { data, saveIndividualStudentEvaluation, currentUser } = useAuth();
  
  const groups = data.groups || [];
  const tasks = data.tasks || [];
  const groupEvaluations = data.groupEvaluations || [];

  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || 'G01');
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[1]?.id || tasks[0]?.id || 'tsk-grp-01');
  
  const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0];
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  // Active student being evaluated in modal/form
  const [activeStudentUsn, setActiveStudentUsn] = useState(selectedGroup?.members[0]?.usn || '');
  
  // Rubric Scores State (Max 50)
  const [techImpl, setTechImpl] = useState(14); // /15
  const [projUnderstand, setProjUnderstand] = useState(9); // /10
  const [indivContrib, setIndivContrib] = useState(9); // /10
  const [docs, setDocs] = useState(5); // /5
  const [presentation, setPresentation] = useState(5); // /5
  const [viva, setViva] = useState(4); // /5
  const [feedback, setFeedback] = useState('Outstanding team leadership and model quantization.');
  const [savedSuccess, setSavedSuccess] = useState('');

  const totalScore = Number(techImpl) + Number(projUnderstand) + Number(indivContrib) + Number(docs) + Number(presentation) + Number(viva);

  const activeStudentObj = selectedGroup?.members.find(m => m.usn === activeStudentUsn) || selectedGroup?.members[0];

  // Load existing evaluation if available for active student
  const openEvaluationForStudent = (usn) => {
    setActiveStudentUsn(usn);
    const existing = groupEvaluations.find(e => e.groupId === selectedGroupId && e.studentUsn === usn && e.taskId === selectedTaskId);
    if (existing && existing.scores) {
      setTechImpl(existing.scores.technicalImplementation || 10);
      setProjUnderstand(existing.scores.projectUnderstanding || 8);
      setIndivContrib(existing.scores.individualContribution || 8);
      setDocs(existing.scores.documentation || 4);
      setPresentation(existing.scores.presentation || 4);
      setViva(existing.scores.viva || 4);
      setFeedback(existing.feedback || '');
    } else {
      setTechImpl(12);
      setProjUnderstand(8);
      setIndivContrib(8);
      setDocs(4);
      setPresentation(4);
      setViva(4);
      setFeedback('Good performance in individual defense.');
    }
  };

  const handleSaveEvaluation = (e) => {
    e.preventDefault();
    if (!activeStudentObj) return;

    saveIndividualStudentEvaluation({
      groupId: selectedGroupId,
      groupCode: selectedGroup.groupCode,
      taskId: selectedTaskId,
      studentUsn: activeStudentUsn,
      studentName: activeStudentObj.name,
      evaluator: currentUser?.name || 'Faculty Advisor',
      scores: {
        technicalImplementation: Number(techImpl),
        projectUnderstanding: Number(projUnderstand),
        individualContribution: Number(indivContrib),
        documentation: Number(docs),
        presentation: Number(presentation),
        viva: Number(viva)
      },
      totalScore,
      feedback
    });

    setSavedSuccess(`Individual marks (${totalScore}/50) saved for ${activeStudentObj.name} (${activeStudentUsn})!`);
    setTimeout(() => setSavedSuccess(''), 4000);
  };

  const isGroupMode = selectedGroup?.submissionMode === 'LEADER_SUBMITS_ALL' || selectedGroup?.submissionMode === 'GROUP';

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

      {/* Group & Task Selection Bar */}
      <Card>
        <div className="grid-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select Project Group</label>
            <select
              className="form-select"
              value={selectedGroupId}
              onChange={(e) => {
                const gid = e.target.value;
                setSelectedGroupId(gid);
                const g = groups.find(x => x.id === gid);
                if (g && g.members.length > 0) openEvaluationForStudent(g.members[0].usn);
              }}
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.groupCode} — {g.title}</option>
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
                <option key={t.id} value={t.id}>{t.submissionMode === 'MEMBERS_SUBMIT_ASSIGNED' ? '👤' : '👥'} {t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* BOTTOM SECTION: INDIVIDUAL EVALUATION ROSTER & RUBRIC FORM */}
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
                  <th>Team Role</th>
                  <th>Submissions Reflected</th>
                  <th>Individual Marks Awarded</th>
                  <th>Evaluation Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedGroup.members.map((m) => {
                  const evalRec = groupEvaluations.find(e => e.groupId === selectedGroupId && e.studentUsn === m.usn && e.taskId === selectedTaskId);
                  const isSelected = m.usn === activeStudentUsn;

                  return (
                    <tr key={m.usn} style={{ backgroundColor: isSelected ? '#FDF0F2' : 'transparent' }}>
                      <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{m.usn}</td>
                      <td data-label="Student Name" style={{ fontWeight: 600 }}>{m.name}</td>
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

          {/* Individual Student Rubric Form */}
          {activeStudentObj && (
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
                    Group: {selectedGroup.groupCode} | Evaluator: {currentUser?.name || 'Faculty Advisor'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#DE3B0B' }}>
                    {totalScore} <span style={{ fontSize: '14px', color: '#8A9198' }}>/ 50</span>
                  </div>
                  <Badge variant="success">Rubric Total</Badge>
                </div>
              </div>

              <form onSubmit={handleSaveEvaluation}>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">1. Technical Implementation (Max: 15)</label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      className="form-input"
                      value={techImpl}
                      onChange={(e) => setTechImpl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">2. Project Understanding (Max: 10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      className="form-input"
                      value={projUnderstand}
                      onChange={(e) => setProjUnderstand(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">3. Individual Contribution (Max: 10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      className="form-input"
                      value={indivContrib}
                      onChange={(e) => setIndivContrib(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">4. Documentation (Max: 5)</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      className="form-input"
                      value={docs}
                      onChange={(e) => setDocs(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">5. Presentation (Max: 5)</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      className="form-input"
                      value={presentation}
                      onChange={(e) => setPresentation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">6. Viva Voce & Defense (Max: 5)</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      className="form-input"
                      value={viva}
                      onChange={(e) => setViva(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Individual Feedback & Faculty Remarks for {activeStudentObj.name}</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter feedback specific to this student's viva defense and contribution..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" style={{ padding: '11px' }}>
                  <Save size={16} />
                  <span>SAVE INDIVIDUAL EVALUATION ({totalScore} / 50 FOR {activeStudentObj.name.toUpperCase()})</span>
                </button>
              </form>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
