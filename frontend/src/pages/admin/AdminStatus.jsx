import React from 'react';
import { BarChart2, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminStatus = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>College-Wide Academic Project Governance Status</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Monitoring compliance metrics across all engineering departments for 8th semester projects.
        </p>
      </div>

      <div className="grid-4">
        <Card title="Computer Science (CSE)">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#038203' }}>36 Groups (100%)</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Guides Allocated & Active</div>
        </Card>
        <Card title="Information Science (ISE)">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#038203' }}>28 Groups (100%)</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Phase 2 Ongoing</div>
        </Card>
        <Card title="Electronics & Comm (ECE)">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#A68E24' }}>42 Groups (95%)</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>2 Guide allocations pending</div>
        </Card>
        <Card title="Electrical & Electronics (EEE)">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#038203' }}>22 Groups (100%)</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Evaluations on schedule</div>
        </Card>
      </div>

      <Card title="Institutional Department Compliance Matrix">
        <div className="table-container responsive-table-stack">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Engineering Department</th>
                <th>Course Code</th>
                <th>Total Project Batches</th>
                <th>Phase 1 Approval</th>
                <th>Phase 2 Review</th>
                <th>Overall Governance Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: '#243143' }}>Computer Science & Engineering (CSE)</td>
                <td>21CSP81</td>
                <td>36 Batches</td>
                <td><Badge variant="success">100% Approved</Badge></td>
                <td><Badge variant="warning">78% Complete</Badge></td>
                <td><Badge variant="success">Compliant</Badge></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#243143' }}>Information Science & Engineering (ISE)</td>
                <td>21ISP81</td>
                <td>28 Batches</td>
                <td><Badge variant="success">100% Approved</Badge></td>
                <td><Badge variant="warning">82% Complete</Badge></td>
                <td><Badge variant="success">Compliant</Badge></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#243143' }}>Electronics & Communication (ECE)</td>
                <td>21ECP81</td>
                <td>42 Batches</td>
                <td><Badge variant="success">98% Approved</Badge></td>
                <td><Badge variant="warning">65% Complete</Badge></td>
                <td><Badge variant="warning">Pending Action</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
