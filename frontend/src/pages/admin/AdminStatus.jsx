import React, { useState, useEffect } from 'react';
import { BarChart2, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';
import { submissionService } from '../../services/submissionService';

export const AdminStatus = () => {
  const [subjects, setSubjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGovernanceStatus();
  }, []);

  const loadGovernanceStatus = async () => {
    try {
      setLoading(true);
      const [fetchedSubjects, fetchedTeams, fetchedSubmissions] = await Promise.all([
        academicService.getSubjects().catch(() => []),
        academicService.getTeams().catch(() => []),
        submissionService.getSubmissions().catch(() => [])
      ]);

      setSubjects(fetchedSubjects || []);
      setTeams(fetchedTeams || []);
      setSubmissions(fetchedSubmissions || []);
    } catch (err) {
      console.warn("Failed to load governance status:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group teams and submissions by subject
  const subjectMetrics = subjects.map(sub => {
    const subjectCode = sub.subject_code || sub.code;
    const matchingTeams = teams.filter(t => t.subject_id === sub.subject_id || t.subject?.subject_code === subjectCode);
    const totalTeams = matchingTeams.length;
    const teamIds = new Set(matchingTeams.map(t => t.team_id));
    
    const subjectSubmissions = submissions.filter(s => teamIds.has(s.team_id));
    const submittedCount = subjectSubmissions.filter(s => s.status === 'SUBMITTED' || s.status === 'EVALUATED').length;
    const evaluatedCount = subjectSubmissions.filter(s => s.status === 'EVALUATED').length;

    const complianceRate = totalTeams > 0 
      ? Math.round((submittedCount / Math.max(totalTeams, 1)) * 100) 
      : 100;

    return {
      id: sub.subject_id,
      name: sub.subject_name || sub.name,
      code: subjectCode,
      coordinator: sub.coordinator || 'Assigned Coordinator',
      totalTeams,
      submittedCount,
      evaluatedCount,
      complianceRate
    };
  });

  const totalAssignedGuides = teams.filter(t => t.guide_id || t.guide).length;
  const guideAllocationRate = teams.length > 0 ? Math.round((totalAssignedGuides / teams.length) * 100) : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>College-Wide Academic Project Governance Status</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Monitoring real-time compliance metrics across all registered academic project subjects.
        </p>
      </div>

      <div className="grid-4">
        <Card title="Active Courses">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#3A1F6F' }}>{subjects.length} Subjects</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Registered in Database</div>
        </Card>
        <Card title="Enrolled Groups">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2B7094' }}>{teams.length} Groups</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Across all departments</div>
        </Card>
        <Card title="Guide Allocations">
          <div style={{ fontSize: '24px', fontWeight: 700, color: guideAllocationRate >= 80 ? '#038203' : '#DE3B0B' }}>
            {guideAllocationRate}% Allocated
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{totalAssignedGuides} of {teams.length} with Guide</div>
        </Card>
        <Card title="Total Submissions">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#728C5E' }}>{submissions.length} Records</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Logged in Database</div>
        </Card>
      </div>

      <Card title="Academic Subject Compliance Matrix">
        {loading ? (
          <p style={{ padding: '16px' }}>Loading governance compliance data...</p>
        ) : subjectMetrics.length === 0 ? (
          <p style={{ padding: '16px', color: '#888' }}>No subjects or teams found in database.</p>
        ) : (
          <div className="table-container responsive-table-stack">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Course Code</th>
                  <th>Coordinator</th>
                  <th>Total Project Groups</th>
                  <th>Milestone Submissions</th>
                  <th>Evaluations Completed</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectMetrics.map((item) => (
                  <tr key={item.id || item.code}>
                    <td data-label="Course Title" style={{ fontWeight: 700, color: '#243143' }}>{item.name}</td>
                    <td data-label="Course Code" style={{ fontWeight: 800, color: '#DE3B0B' }}>{item.code}</td>
                    <td data-label="Coordinator" style={{ fontWeight: 600 }}>{item.coordinator}</td>
                    <td data-label="Total Groups">{item.totalTeams} Groups</td>
                    <td data-label="Milestone Submissions">
                      <Badge variant={item.submittedCount > 0 ? 'success' : 'purple'}>
                        {item.submittedCount} Submissions
                      </Badge>
                    </td>
                    <td data-label="Evaluations Completed">
                      <Badge variant={item.evaluatedCount > 0 ? 'info' : 'purple'}>
                        {item.evaluatedCount} Evaluated
                      </Badge>
                    </td>
                    <td data-label="Compliance Status">
                      <Badge variant={item.complianceRate >= 75 ? 'success' : 'warning'}>
                        {item.complianceRate}% Compliant
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
