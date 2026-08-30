import React, { useState, useEffect } from 'react';
import { PlusSquare } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { academicService } from '../../services/academicService';

export const AdminSubjects = () => {
  const [subjectsList, setSubjectsList] = useState([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await academicService.getSubjects();
      setSubjectsList(data || []);
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
      setSubjectsList([...subjectsList, newSub]);
      setCode('');
      setName('');
    } catch (err) {
      setError("Failed to create subject: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Course Subjects & Project Codes Master</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Configure project course titles and offerings.
        </p>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div className="grid-3">
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Registered Academic Course Subjects">
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
                    </tr>
                  </thead>
                  <tbody>
                    {subjectsList.map((s) => (
                      <tr key={s.subject_id}>
                        <td data-label="Subject Code" style={{ fontWeight: 700, color: '#B82226' }}>{s.subject_code}</td>
                        <td data-label="Subject Title" style={{ fontWeight: 600 }}>{s.subject_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Add New Subject Code">
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

              <button type="submit" className="btn btn-primary btn-block">
                <PlusSquare size={16} />
                <span>ADD SUBJECT CODE</span>
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
