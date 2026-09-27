import React, { useState, useEffect } from 'react';
import { PlusSquare, BookOpen, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { academicService } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';

export const AdminSubjects = () => {
  const { assignFacultyAsCoordinator } = useAuth();
  const [subjectsList, setSubjectsList] = useState([]);
  
  // State for Block 1: Add Subject
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(6);
  const [semester, setSemester] = useState(8);
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  // State for Block 2: Assign Subject Coordinator
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [selectedCoordinator, setSelectedCoordinator] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
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
        faculty_id: f.faculty_id || f.id,
        name: f.name,
        subject_id: f.subject_id,
        is_coordinator: f.is_coordinator,
        designation: f.is_coordinator ? 'Coordinator / Faculty' : 'Faculty Member'
      }));

      setFacultyList(faculties);
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
      setSuccess(null);
      setIsAddingSubject(true);

      const newSub = await academicService.createSubject(code, name);
      const enhancedSub = {
        ...(newSub || {}),
        subject_id: newSub?.subject_id,
        subject_code: code,
        subject_name: name,
        credits: Number(credits) || 6,
        semester: Number(semester) || 8,
        coordinator: null,
        status: 'Active'
      };

      setSubjectsList(prev => [...prev, enhancedSub]);
      setSuccess(`✓ Subject "${code} - ${name}" added successfully!`);
      setTimeout(() => setSuccess(null), 5000);

      setCode('');
      setName('');
      setCredits(6);
      setSemester(8);

      fetchSubjects();
    } catch (err) {
      setError("Failed to create subject: " + err.message);
    } finally {
      setIsAddingSubject(false);
    }
  };

  const handleSubjectChange = (e) => {
    const sCode = e.target.value;
    setSelectedSubjectCode(sCode);
    setSelectedCoordinator('');

    if (sCode) {
      const selectedSub = subjectsList.find(s => (s.subject_code || s.code) === sCode);
      if (selectedSub) {
        const eligible = facultyList.filter(f => 
          (f.subject_id != null && selectedSub.subject_id != null && String(f.subject_id) === String(selectedSub.subject_id)) ||
          (f.subject_code && (f.subject_code === selectedSub.subject_code || f.subject_code === selectedSub.code)) ||
          (selectedSub.coordinator && f.name?.toLowerCase() === selectedSub.coordinator?.toLowerCase())
        );
        if (selectedSub.coordinator && eligible.some(f => f.name?.toLowerCase() === selectedSub.coordinator?.toLowerCase())) {
          const currentCoord = eligible.find(f => f.name?.toLowerCase() === selectedSub.coordinator?.toLowerCase());
          setSelectedCoordinator(currentCoord.name);
        }
      }
    }
  };

  const handleAssignCoordinator = async (e) => {
    e.preventDefault();
    if (!selectedSubjectCode || !selectedCoordinator) return;
    try {
      setError(null);
      setSuccess(null);
      setIsAssigning(true);

      const res = await academicService.assignCoordinator(selectedCoordinator, selectedSubjectCode);
      if (res && res.success === false) {
        throw new Error(res.reason || 'Failed to assign coordinator');
      }

      if (assignFacultyAsCoordinator) {
        assignFacultyAsCoordinator(selectedCoordinator, selectedSubjectCode);
      }

      setSubjectsList(prev => prev.map(s => {
        if ((s.subject_code || s.code) === selectedSubjectCode) {
          return { ...s, coordinator: selectedCoordinator };
        }
        return s;
      }));

      setFacultyList(prev => prev.map(f => {
        if (f.name?.toLowerCase() === selectedCoordinator?.toLowerCase()) {
          return { ...f, is_coordinator: true, designation: 'Coordinator / Faculty' };
        }
        return f;
      }));

      setSuccess(`✓ ${selectedCoordinator} successfully assigned as coordinator for ${selectedSubjectCode}.`);
      setTimeout(() => setSuccess(null), 5000);

      fetchSubjects();
    } catch (err) {
      setError("Failed to assign coordinator: " + err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  // Compute eligible faculty registered for currently selected subject
  const selectedSubjectObj = subjectsList.find(s => (s.subject_code || s.code) === selectedSubjectCode);
  const eligibleFaculty = selectedSubjectObj
    ? facultyList.filter(f => 
        (f.subject_id != null && selectedSubjectObj.subject_id != null && String(f.subject_id) === String(selectedSubjectObj.subject_id)) ||
        (f.subject_code && (f.subject_code === selectedSubjectObj.subject_code || f.subject_code === selectedSubjectObj.code)) ||
        (selectedSubjectObj.coordinator && f.name?.toLowerCase() === selectedSubjectObj.coordinator?.toLowerCase())
      )
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>Course Subjects & Coordinator Assignments</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Configure project course titles, VTU credit schemes, and assign subject coordinators.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '10px' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid-3">
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Registered Academic Course Subjects & Coordinators">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading subjects...</div>
              </div>
            ) : subjectsList.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-text">No subjects found. Add one below.</div>
              </div>
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
                        <td data-label="Subject Code" style={{ fontWeight: 800, color: 'var(--rit-orange-red)' }}>{s.subject_code || s.code}</td>
                        <td data-label="Subject Title" style={{ fontWeight: 600 }}>{s.subject_name || s.name}</td>
                        <td data-label="Credits">{s.credits || 6} Credits</td>
                        <td data-label="Coordinator" style={{ fontWeight: 700, color: s.coordinator ? 'var(--text-heading)' : 'var(--text-disabled)' }}>
                          {s.coordinator || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not Assigned</span>}
                        </td>
                        <td data-label="Status"><span style={{ color: s.status === 'Active' || !s.status ? 'var(--badge-success-text)' : 'var(--badge-purple-text)', fontWeight: 600 }}>● {s.status || 'Active'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* BLOCK 1 — ADD SUBJECT */}
          <Card title="Add Subject">
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

              <button type="submit" className="btn btn-primary btn-block" disabled={isAddingSubject}>
                <PlusSquare size={16} />
                <span>ADD SUBJECT</span>
              </button>
            </form>
          </Card>

          {/* BLOCK 2 — ASSIGN SUBJECT COORDINATOR */}
          <Card title="Assign Subject Coordinator">
            <form onSubmit={handleAssignCoordinator}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  className="form-select"
                  value={selectedSubjectCode}
                  onChange={handleSubjectChange}
                  required
                >
                  <option value="">Select a subject</option>
                  {subjectsList.map((s, idx) => {
                    const sCode = s.subject_code || s.code;
                    const sName = s.subject_name || s.name;
                    return (
                      <option key={s.subject_id || sCode || idx} value={sCode}>
                        {sCode} - {sName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Faculty / Coordinator</label>
                <select
                  className="form-select"
                  value={selectedCoordinator}
                  onChange={(e) => setSelectedCoordinator(e.target.value)}
                  disabled={!selectedSubjectCode || eligibleFaculty.length === 0}
                  required
                >
                  {!selectedSubjectCode ? (
                    <option value="">Select a subject first</option>
                  ) : eligibleFaculty.length === 0 ? (
                    <option value="">No faculty registered for this subject yet</option>
                  ) : (
                    <>
                      <option value="">Select a faculty member</option>
                      {eligibleFaculty.map((f, idx) => (
                        <option key={f.id || f.faculty_id || idx} value={f.name}>
                          {f.name} ({f.designation || 'Faculty Member'})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={isAssigning || !selectedSubjectCode || !selectedCoordinator || eligibleFaculty.length === 0}
              >
                <UserCheck size={16} />
                <span>ASSIGN COORDINATOR</span>
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
