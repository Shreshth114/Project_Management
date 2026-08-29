import React, { useState } from 'react';
import { Users, CheckCircle, Save, Layers, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const GroupSubmissionManagement = ({ group }) => {
  const { setGroupSubmissionMode, updateComponentAssignments, currentUser } = useAuth();
  
  const [submissionMode, setMode] = useState(group?.submissionMode || 'LEADER_SUBMITS_ALL');
  
  const componentsObj = group?.components || {};
  const groupMembers = group?.members || [];

  // State for assigned USNs per component key
  const initialAssignments = {};
  Object.keys(componentsObj).forEach(key => {
    initialAssignments[key] = componentsObj[key].assignedUsns || [];
  });
  
  const [assignments, setAssignments] = useState(initialAssignments);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!group) return null;

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setGroupSubmissionMode(group.id, newMode);
  };

  const toggleUsnForComponent = (compKey, usn) => {
    const currentList = assignments[compKey] || [];
    let updatedList;
    if (currentList.includes(usn)) {
      updatedList = currentList.filter(u => u !== usn);
    } else {
      updatedList = [...currentList, usn];
    }
    setAssignments({
      ...assignments,
      [compKey]: updatedList
    });
  };

  const handleSaveAssignments = (e) => {
    e.preventDefault();
    updateComponentAssignments(group.id, assignments);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <Card 
      title="Group Submission Management (Group Leader Control)" 
      subtitle={`Group Code: ${group.groupCode} — Only Team Leader (${currentUser?.name || 'Leader'}) can configure submission modes`}
    >
      {savedSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>Distributed submission responsibilities saved! Group members can now upload their assigned components.</span>
        </div>
      )}

      {/* Mode Selection Radio Group */}
      <div style={{
        backgroundColor: '#F8F9FA',
        border: '1px solid #E5E5E5',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
          Select Group Submission Mode:
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="submissionMode"
              value="LEADER_SUBMITS_ALL"
              checked={submissionMode === 'LEADER_SUBMITS_ALL'}
              onChange={() => handleModeChange('LEADER_SUBMITS_ALL')}
              style={{ marginTop: '3px' }}
            />
            <div>
              <strong style={{ color: '#243143', fontSize: '14px' }}>Mode A: Leader Submits All Components</strong>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                Group Leader alone uploads all required project components (Report, Source Code, Paper, PPT, Video, Link). All members view the single combined project.
              </p>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="submissionMode"
              value="MEMBERS_SUBMIT_ASSIGNED"
              checked={submissionMode === 'MEMBERS_SUBMIT_ASSIGNED'}
              onChange={() => handleModeChange('MEMBERS_SUBMIT_ASSIGNED')}
              style={{ marginTop: '3px' }}
            />
            <div>
              <strong style={{ color: '#243143', fontSize: '14px' }}>Mode B: Members Submit Assigned Items (Distributed)</strong>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                Group Leader distributes submission responsibilities among members. Members submit assigned items; all items remain components of ONE shared project.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Component Assignment Matrix (visible in Mode B) */}
      {submissionMode === 'MEMBERS_SUBMIT_ASSIGNED' && (
        <form onSubmit={handleSaveAssignments}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#243143', marginBottom: '12px' }}>
            Assign Responsible Members for Each Component:
          </h4>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
            Check one or multiple students responsible for uploading each component.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.keys(componentsObj).map(compKey => {
              const comp = componentsObj[compKey];
              const selectedUsns = assignments[compKey] || [];

              return (
                <div 
                  key={compKey}
                  style={{
                    border: '1px solid #E5E5E5',
                    borderRadius: '4px',
                    padding: '14px',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#243143', fontSize: '14px', marginBottom: '8px' }}>
                    {comp.title}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {groupMembers.map(member => {
                      const isChecked = selectedUsns.includes(member.usn);
                      return (
                        <label 
                          key={member.usn}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            backgroundColor: isChecked ? '#E8F1FB' : '#F4F6F8',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: isChecked ? '1px solid #114C94' : '1px solid #E5E5E5'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleUsnForComponent(compKey, member.usn)}
                          />
                          <span>{member.name} ({member.usn})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            <Save size={16} />
            <span>SAVE ASSIGNMENTS</span>
          </button>
        </form>
      )}
    </Card>
  );
};
