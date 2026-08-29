import React, { useState } from 'react';
import { PlusSquare, BookOpen, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminSubjects = () => {
  const { data } = useAuth();
  const [subjectsList, setSubjectsList] = useState(data.subjects);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(4);
  const [semester, setSemester] = useState(8);

  const handleAddSubject = (e) => {
    e.preventDefault();
    const newSub = {
      code,
      name,
      credits: Number(credits),
      semester: Number(semester),
      totalGroups: 0,
      status: "Active"
    };
    setSubjectsList([...subjectsList, newSub]);
    setCode('');
    setName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Course Subjects & Project Codes Master</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Configure project course titles, VTU credit schemes, and semester offerings.
        </p>
      </div>

      <div className="grid-3">
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Registered Academic Course Subjects">
            <div className="table-container responsive-table-stack">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Title</th>
                    <th>Credits</th>
                    <th>Semester</th>
                    <th>Active Groups</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectsList.map((s, idx) => (
                    <tr key={idx}>
                      <td data-label="Subject Code" style={{ fontWeight: 700, color: '#B82226' }}>{s.code}</td>
                      <td data-label="Subject Title" style={{ fontWeight: 600 }}>{s.name}</td>
                      <td data-label="Credits">{s.credits} Credits</td>
                      <td data-label="Semester">Semester {s.semester}</td>
                      <td data-label="Active Groups">{s.totalGroups} Groups</td>
                      <td data-label="Status"><Badge variant={s.status === 'Active' ? 'success' : 'navy'}>{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <span>ADD SUBJECT CODE</span>
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
