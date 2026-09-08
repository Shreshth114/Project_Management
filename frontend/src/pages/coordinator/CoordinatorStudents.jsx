import React, { useState, useEffect } from 'react';
import { Search, Users, Shield, Mail, Phone, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { academicService } from '../../services/academicService';

export const CoordinatorStudents = () => {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const directory = await academicService.getAdminUserDirectory();
      setStudentsList(directory.students || []);
    } catch (err) {
      console.error("Coordinator students load error:", err);
      setStudentsList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = studentsList.filter(s =>
    (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
    (s.usn && s.usn.toLowerCase().includes(search.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div style={{ padding: '24px', color: '#55636B' }}>Loading Student Enrolments...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Guided Students Roster & Enrolments</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Roster of students registered in the department under academic coordination.
          </p>
        </div>

        <div style={{ width: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search USN, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card title={`Enrolled Students Directory (${studentsList.length} Total)`}>
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>USN</th>
                <th>Student Name</th>
                <th>College Email</th>
                <th>Academic Batch</th>
                <th>Group Assignment</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.student_id || s.id || s.usn}>
                    <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{s.usn}</td>
                    <td data-label="Student Name" style={{ fontWeight: 600 }}>{s.name}</td>
                    <td data-label="College Email">{s.email || `${s.usn.toLowerCase()}@msrit.edu`}</td>
                    <td data-label="Academic Batch"><Badge variant="purple">{s.batch || 'Enrolled'}</Badge></td>
                    <td data-label="Group Assignment" style={{ fontWeight: 700, color: '#3A1F6F' }}>
                      {s.team?.team_code || 'Unassigned'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#8A9198', padding: '24px' }}>
                    No student registrations found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
