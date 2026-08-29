import React, { useState } from 'react';
import { PlusSquare, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';

export const CoordinatorCreateTask = () => {
  const { addTask, setActiveTab } = useAuth();
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('GROUP'); // INDIVIDUAL | GROUP
  const [phase, setPhase] = useState('Phase 2');
  const [totalMarks, setTotalMarks] = useState(50);
  const [deadline, setDeadline] = useState('2025-10-25');
  const [allowedMode, setAllowedMode] = useState('BOTH'); // LEADER_SUBMITS_ALL | MEMBERS_SUBMIT_ASSIGNED | BOTH
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask({
      title,
      taskType,
      phase,
      totalMarks: Number(totalMarks),
      deadline,
      allowedMode,
      description
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setActiveTab('tasks');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setActiveTab('tasks')}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Create & Publish Milestone Task</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Define Task Type (Individual vs Group) and Submission Modes.
          </p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>Task milestone published successfully to student & faculty portals!</span>
        </div>
      )}

      <Card title="Milestone Requirements & Task Configuration">
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Task Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Final Project Submission & Viva Voce"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Task Type</label>
              <select
                className="form-select"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
              >
                <option value="GROUP">👥 Group Task (One Shared Project per Group)</option>
                <option value="INDIVIDUAL">👤 Individual Task (Independent Submissions)</option>
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Project Phase</label>
              <select
                className="form-select"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
              >
                <option value="Phase 1">Phase 1 — Synopsis & Survey</option>
                <option value="Phase 2">Phase 2 — Mid-Term & Final Demo</option>
                <option value="Phase 3">Phase 3 — Dissertation & Viva</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Marks</label>
              <input
                type="number"
                min={5}
                max={100}
                className="form-input"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Submission Deadline Date</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {taskType === 'GROUP' && (
            <div className="form-group">
              <label className="form-label">Allowed Group Submission Modes</label>
              <select
                className="form-select"
                value={allowedMode}
                onChange={(e) => setAllowedMode(e.target.value)}
              >
                <option value="BOTH">Allow Group Leader to Choose (Mode A or Mode B)</option>
                <option value="LEADER_SUBMITS_ALL">Mode A Only: Leader Submits All Components</option>
                <option value="MEMBERS_SUBMIT_ASSIGNED">Mode B Only: Members Submit Assigned Items</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Task Description & Evaluation Criteria</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Specify requirements, components (Report, Source Code, Paper, PPT, Video, Link), and evaluation criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            <PlusSquare size={16} />
            <span>PUBLISH MILESTONE TASK</span>
          </button>
        </form>
      </Card>
    </div>
  );
};
