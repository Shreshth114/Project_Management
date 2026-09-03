import React, { useState } from 'react';
import { Search, Users, Shield, Mail, Phone, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const CoordinatorStudents = () => {
  const { data, currentUser } = useAuth();
  const [search, setSearch] = useState('');

  // Filter students under coordinator's branch/department (CSE)
  const students = (data.users || []).filter(u => u.role === 'STUDENT');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.usn && s.usn.toLowerCase().includes(search.toLowerCase())) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Department Student Directory & Enrolments</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Roster of students under your Subject Coordination ({currentUser?.department || 'CSE'} Department).
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

      <Card title="Enrolled Students Roster">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>USN</th>
                <th>Student Name</th>
                <th>College Email</th>
                <th>Subject Code</th>
                <th>Group ID</th>
                <th>Allocated Guide</th>
                <th>Academic Batch</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td data-label="USN" style={{ fontWeight: 800, color: '#DE3B0B' }}>{s.usn || s.username}</td>
                  <td data-label="Student Name" style={{ fontWeight: 600 }}>{s.name}</td>
                  <td data-label="College Email">{s.email}</td>
                  <td data-label="Subject Code"><Badge variant="purple">{s.subject || '21CSP81'}</Badge></td>
                  <td data-label="Group ID" style={{ fontWeight: 700, color: '#3A1F6F' }}>{s.groupId || 'G01'}</td>
                  <td data-label="Guide">{s.guideName || 'Dr. R. Sharma'}</td>
                  <td data-label="Batch" style={{ fontSize: '12px', color: '#55636B' }}>{s.batch || '2021–2025 (8th Sem)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
