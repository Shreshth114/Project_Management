import React, { useState, useEffect } from 'react';
import { PlusSquare, BookOpen, UserCheck } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { academicService } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';

export const AdminSubjects = () => {
  const { assignFacultyAsCoordinator } = useAuth();
  const [subjectsList, setSubjectsList] = useState([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(6);
  const [semester, setSemester] = useState(8);
  const [assignedCoordinator, setAssignedCoordinator] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const [data, fetchedFaculties] = await Promise.all([
        academicService.getSubjects(),
        academicService.getFaculty().catch(() => [])
      ]);
      setSubjectsList(data || []);

      const faculties = (fetchedFaculties || []).map(f => ({
        id: f.faculty_id || f.id,
        name: f.name,
        designation: f.is_coordinator ? 'Coordinator / Faculty' : 'Faculty Member'
      }));

      setFacultyList(faculties);
      if (faculties.length > 0) {
        setAssignedCoordinator(faculties[0].name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const newSub = await academicService.createSubject(code, name);
      if (assignedCoordinator) {
        await academicService.assignCoordinator(assignedCoordinator, code);
        if (assignFacultyAsCoordinator) {
          assignFacultyAsCoordinator(assignedCoordinator, code);
        }
      }
      const enhancedSub = {
        ...newSub,
        credits: Number(credits),
        semester: Number(semester),
        coordinator: assignedCoordinator,
        status: 'Active'
      };
      setSubjectsList([...subjectsList, enhancedSub]);
      setCode('');
      setName('');
    } catch (err) {
      setError("Failed to create subject: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Course Subjects & Coordinator Assignments</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Configure project course titles, VTU credit schemes, and assign subject coordinators.
        </p>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div className="grid-3">
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Registered Academic Course Subjects & Coordinators">
            {loading ? (
              <p>Loading subjects...</p>
            ) : subjectsList.length === 0 ? (
              <p>No subjects found. Add one below.</p>
            ) : (
              <div className="table-container responsive-table-stack">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Title</th>
                      <th>Credits</th>
                      <th>Assigned Coordinator</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectsList.map((s, idx) => (
                      <tr key={s.subject_id || idx}>
                        <td data-label="Subject Code" style={{ fontWeight: 800, color: '#DE3B0B' }}>{s.subject_code || s.code}</td>
                        <td data-label="Subject Title" style={{ fontWeight: 600 }}>{s.subject_name || s.name}</td>
                        <td data-label="Credits">{s.credits || 6} Credits</td>
                        <td data-label="Coordinator" style={{ fontWeight: 700, color: s.coordinator ? '#3A1F6F' : '#888' }}>
                          {s.coordinator || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not Assigned</span>}
                        </td>
                        <td data-label="Status"><Badge variant={s.status === 'Active' ? 'success' : 'purple'}>{s.status || 'Active'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Add Subject & Assign Coordinator">
            <form onSubmit={handleAddSubject}>
              <div className="form-group">
                <label className="form-label">Subject Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 21CSP82"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Internship & Project Evaluation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign Subject Coordinator</label>
                <select
                  className="form-select"
                  value={assignedCoordinator}
                  onChange={(e) => setAssignedCoordinator(e.target.value)}
                >
                  {facultyList.map((g, idx) => (
                    <option key={g.id || idx} value={g.name}>{g.name} ({g.designation || 'Faculty Member'})</option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    className="form-input"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="number"
                    className="form-input"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                <PlusSquare size={16} />
                <span>ADD SUBJECT & ASSIGN COORDINATOR</span>
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
