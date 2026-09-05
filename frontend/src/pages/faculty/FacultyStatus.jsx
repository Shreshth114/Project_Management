<<<<<<< HEAD
import React, { useState } from 'react';
import { Search, Filter, CheckCircle, Clock, Eye, X, Award } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle, Clock } from 'lucide-react';
>>>>>>> origin/main
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { evaluationService } from '../../services/evaluationService';

export const FacultyStatus = () => {
<<<<<<< HEAD
  const { data } = useAuth();
  
  const [usnSearch, setUsnSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inspectingStudent, setInspectingStudent] = useState(null);

  // Aggregate all students across groups
  const allStudents = [];
  (data.groups || []).forEach(g => {
    g.members.forEach(m => {
      const evalRec = (data.groupEvaluations || []).find(e => e.groupId === g.id && e.studentUsn === m.usn);
      const isSubmitted = g.components && Object.values(g.components).some(c => c.status === 'COMPLETED');
      
      let submissionStatus = 'SUBMITTED';
      if (!isSubmitted) submissionStatus = 'NOT_SUBMITTED';

      let evalStatus = 'NOT_EVALUATED';
      if (evalRec) evalStatus = 'EVALUATED';
      else if (isSubmitted) evalStatus = 'PENDING_EVALUATION';

      // Find submission date
      const compSample = g.components ? Object.values(g.components).find(c => c.status === 'COMPLETED') : null;
      const submissionDate = compSample?.submittedAt || '2025-10-08 14:42';

      allStudents.push({
        usn: m.usn,
        name: m.name,
        email: m.email,
        groupName: g.groupCode,
        groupTitle: g.title,
        groupId: g.id,
        submissionStatus,
        evalStatus,
        submissionDate,
        progress: g.overallProgress || 90,
        evalRec
      });
    });
  });

  const filteredStudents = allStudents.filter(s => {
    const matchesSearch = s.usn.toLowerCase().includes(usnSearch.toLowerCase()) ||
                          s.name.toLowerCase().includes(usnSearch.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'SUBMITTED') matchesStatus = s.submissionStatus === 'SUBMITTED';
    else if (statusFilter === 'NOT_SUBMITTED') matchesStatus = s.submissionStatus === 'NOT_SUBMITTED';
    else if (statusFilter === 'PENDING') matchesStatus = s.evalStatus === 'PENDING_EVALUATION';

    return matchesSearch && matchesStatus;
  });
=======
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      loadData(currentUser.faculty_id);
    }
  }, [currentUser]);

  const loadData = async (facultyId) => {
    try {
      setLoading(true);
      const [fetchedTeams, fetchedEvals] = await Promise.all([
        academicService.getTeams({ guide_id: facultyId }),
        evaluationService.getAllEvaluations()
      ]);
      setTeams(fetchedTeams || []);
      setEvaluations(fetchedEvals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading compliance matrix...</div>;
>>>>>>> origin/main

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Student Submission & Rubric Evaluation Matrix</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Search students by USN to track submission status, submission dates, progress, and rubric scores.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="#3A1F6F" />
            <input
              type="text"
              className="form-input"
              placeholder="Search student by USN or Name (e.g. 1MS21CS042)..."
              value={usnSearch}
              onChange={(e) => setUsnSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#3A1F6F" />
            <select
              className="form-select"
              style={{ width: '220px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Submission Statuses</option>
              <option value="SUBMITTED">✓ Submitted</option>
              <option value="PENDING">○ Pending Evaluation</option>
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
                <th>Status (Submission Date & Progress)</th>
                <th>Faculty Rubric Evaluation</th>
                <th>Marks Awarded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {filteredStudents.map((s) => (
                <tr key={s.usn}>
                  <td data-label="Student USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{s.usn}</td>
                  <td data-label="Full Name" style={{ fontWeight: 600 }}>{s.name}</td>
                  <td data-label="Group Name" style={{ fontWeight: 700, color: '#3A1F6F' }}>{s.groupName}</td>

                  {/* STATUS COLUMN: Showing Submission Date & Progress (%) */}
                  <td data-label="Status">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <Badge variant={s.submissionStatus === 'SUBMITTED' ? 'success' : 'danger'}>
                        {s.submissionStatus === 'SUBMITTED' ? '✓ Submitted' : '✕ Not Submitted'}
                      </Badge>
                      <div style={{ fontSize: '11px', color: '#55636B', marginTop: '2px' }}>
                        Date: <strong>{s.submissionDate}</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: '#3A1F6F', fontWeight: 700 }}>
                        Progress: {s.progress}% Complete
                      </div>
                    </div>
                  </td>

                  <td data-label="Rubric Evaluation">
                    <Badge variant={s.evalStatus === 'EVALUATED' ? 'success' : s.evalStatus === 'PENDING_EVALUATION' ? 'warning' : 'info'}>
                      {s.evalStatus === 'EVALUATED' ? '✓ Evaluated' : s.evalStatus === 'PENDING_EVALUATION' ? '○ Pending Review' : '✕ Not Evaluated'}
                    </Badge>
                  </td>
                  <td data-label="Marks Awarded" style={{ fontWeight: 800, color: '#3A1F6F', fontSize: '15px' }}>
                    {s.evalRec ? `${s.evalRec.totalScore} / 50` : 'Pending'}
                  </td>
                  <td data-label="Action">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setInspectingStudent(s)}
                      title="Inspect student details and evaluation rubrics"
                    >
                      <Eye size={13} />
                      <span>Inspect Rubric</span>
                    </button>
                  </td>
                </tr>
              ))}
=======
              {teams.map((g) => {
                const totalMembers = g.members?.length || 0;
                // Count unique students evaluated in this team
                const teamEvals = evaluations.filter(e => e.submission?.team_id === g.team_id);
                const evaluatedStudents = new Set(teamEvals.map(e => e.student_id)).size;
                const progress = totalMembers > 0 ? Math.round((evaluatedStudents / totalMembers) * 100) : 0;

                return (
                  <tr key={g.team_id}>
                    <td data-label="Group Code" style={{ fontWeight: 700, color: '#243143' }}>{g.team_code}</td>
                    <td data-label="Project Title" style={{ fontSize: '13px' }}>{g.subject?.subject_name}</td>
                    <td data-label="Mode"><Badge variant="navy">Digital</Badge></td>
                    <td data-label="Components Status">
                      <Badge variant="success">✓ All Components Submitted (#038203)</Badge>
                    </td>
                    <td data-label="Individual Evaluations">
                      <Badge variant={evaluatedStudents === totalMembers && totalMembers > 0 ? 'success' : 'warning'}>
                        {evaluatedStudents} / {totalMembers} Students Evaluated
                      </Badge>
                    </td>
                    <td data-label="Overall Health" style={{ fontWeight: 700, color: '#038203' }}>
                      {progress}% Complete
                    </td>
                  </tr>
                );
              })}
>>>>>>> origin/main
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rubric Inspection Modal */}
      {inspectingStudent && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} />
                <span>Student Rubric Evaluation Sheet ({inspectingStudent.usn})</span>
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
                <div style={{ fontSize: '13px', color: '#55636B', marginTop: '4px' }}>
                  USN: <strong>{inspectingStudent.usn}</strong> | Group Name: <strong>{inspectingStudent.groupName}</strong> | Submission Date: <strong>{inspectingStudent.submissionDate}</strong>
                </div>
              </div>

              {inspectingStudent.evalRec ? (
                <div>
                  <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#3A1F6F', marginBottom: '10px' }}>
                    Evaluation Rubric Breakdown (Evaluator: {inspectingStudent.evalRec.evaluator}):
                  </h5>

                  <div className="table-container" style={{ marginBottom: '16px' }}>
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Criterion</th>
                          <th>Max Marks</th>
                          <th>Marks Awarded</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1. Technical Implementation</td>
                          <td>15</td>
                          <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{inspectingStudent.evalRec.scores?.technicalImplementation ?? 14}</td>
                        </tr>
                        <tr>
                          <td>2. Project Understanding</td>
                          <td>10</td>
                          <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{inspectingStudent.evalRec.scores?.projectUnderstanding ?? 9}</td>
                        </tr>
                        <tr>
                          <td>3. Individual Contribution</td>
                          <td>10</td>
                          <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{inspectingStudent.evalRec.scores?.individualContribution ?? 9}</td>
                        </tr>
                        <tr>
                          <td>4. Documentation</td>
                          <td>5</td>
                          <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{inspectingStudent.evalRec.scores?.documentation ?? 5}</td>
                        </tr>
                        <tr>
                          <td>5. Presentation</td>
                          <td>5</td>
                          <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{inspectingStudent.evalRec.scores?.presentation ?? 5}</td>
                        </tr>
                        <tr>
                          <td>6. Viva Voce & Defense</td>
                          <td>5</td>
                          <td style={{ fontWeight: 800, color: '#DE3B0B' }}>{inspectingStudent.evalRec.scores?.viva ?? 4}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#FDF0F2' }}>
                          <td><strong>TOTAL SCORE AWARDED</strong></td>
                          <td><strong>50</strong></td>
                          <td style={{ fontWeight: 800, fontSize: '16px', color: '#3A1F6F' }}>
                            {inspectingStudent.evalRec.totalScore} / 50
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ fontSize: '13px', color: '#55636B', backgroundColor: '#F8F9FA', padding: '12px', borderRadius: '4px' }}>
                    <strong>Faculty Remarks:</strong> "{inspectingStudent.evalRec.feedback}"
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#8A9198' }}>
                  This student has not been evaluated by faculty yet.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setInspectingStudent(null)}>
                Close Rubric View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
