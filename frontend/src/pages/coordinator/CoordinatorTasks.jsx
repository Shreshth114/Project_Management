import React, { useState, useEffect } from 'react';
import { PlusSquare, Calendar, Award, Edit, X, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { taskService } from '../../services/taskService';

export const CoordinatorTasks = () => {
  const { currentUser, setActiveTab } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.faculty_id) {
      fetchTasks(currentUser.faculty_id);
    }
  }, [currentUser]);

  const fetchTasks = async (facultyId) => {
    try {
      setLoading(true);
      const data = await taskService.getTasks({ faculty_id: facultyId });
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [editingTask, setEditingTask] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for Editing Task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [submissionMode, setSubmissionMode] = useState('LEADER_SUBMITS_ALL');

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setDeadline(task.deadline ? (task.deadline.includes('T') ? task.deadline.split('T')[0] : task.deadline) : '2025-10-25');
    const computedMax = task.evaluation_criteria && task.evaluation_criteria.length > 0
      ? task.evaluation_criteria.reduce((sum, c) => sum + Number(c.max_marks || 0), 0)
      : (task.maxMarks || 100);
    setMaxMarks(computedMax);
    const isIndiv = task.task_type === 'INDIVIDUAL' || task.submissionMode === 'MEMBERS_SUBMIT_ASSIGNED';
    setSubmissionMode(isIndiv ? 'MEMBERS_SUBMIT_ASSIGNED' : 'LEADER_SUBMITS_ALL');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    const taskId = editingTask.task_id || editingTask.id;
    const taskType = submissionMode === 'MEMBERS_SUBMIT_ASSIGNED' ? 'INDIVIDUAL' : 'GROUP';

    try {
      if (editingTask.task_id) {
        await taskService.updateTask(editingTask.task_id, {
          title,
          description,
          task_type: taskType,
          deadline
        });
      }

      setTasks(prev => prev.map(t => {
        const currentId = t.task_id || t.id;
        if (currentId === taskId) {
          return {
            ...t,
            title,
            description,
            deadline,
            task_type: taskType,
            submissionMode,
            maxMarks: parseInt(maxMarks)
          };
        }
        return t;
      }));

      setSuccessMsg(`Milestone task "${title}" updated successfully!`);
      setEditingTask(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Save edit error:", err);
      setError(err.message || 'Failed to update milestone');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Master Department Tasks & Milestones</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Milestones and submission modes defined for all final year project batches.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveTab('create-task')}>
          <PlusSquare size={16} />
          <span>Define New Milestone Task</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ color: '#D32F2F', background: '#FFEBEE', padding: '10px 14px', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tasks.map((task) => {
          const isIndiv = task.task_type === 'INDIVIDUAL' || task.submissionMode === 'MEMBERS_SUBMIT_ASSIGNED';
          const computedMax = task.evaluation_criteria && task.evaluation_criteria.length > 0
            ? task.evaluation_criteria.reduce((sum, c) => sum + Number(c.max_marks || 0), 0)
            : (task.maxMarks || 100);
          const deadlineStr = task.deadline ? (task.deadline.includes('T') ? task.deadline.split('T')[0] : task.deadline) : '—';

          return (
            <Card key={task.task_id || task.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Badge variant="purple">{task.phase || 'Phase 2'}</Badge>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>{task.title}</h3>
                    <Badge variant={isIndiv ? 'magenta' : 'info'}>
                      {isIndiv ? 'Mode B: Individual Submissions' : 'Mode A: Group Mode (1 Upload Reflected for All)'}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '14px', color: '#55636B', marginBottom: '12px', lineHeight: 1.4 }}>{task.description}</p>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#55636B', flexWrap: 'wrap' }}>
                    <div><strong>Deadline:</strong> {deadlineStr}</div>
                    <div><strong>Max Marks:</strong> {computedMax} Marks</div>
                    <div><strong>Deliverable Format:</strong> {task.allowedTypes || 'PDF / Document / Link'}</div>
                  </div>
                </div>

                <button 
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenEdit(task)}
                >
                  <Edit size={14} />
                  <span>Edit Milestone</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Milestone Modal */}
      {editingTask && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="mobile-wrap" style={{ margin: 0, fontSize: '16px', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} />
                <span>Edit Milestone Task Requirements</span>
              </h3>
              <button 
                type="button"
                onClick={() => setEditingTask(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Task Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Submission Deadline</label>
                    <input
                      type="date"
                      className="form-input"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Max Evaluation Marks</label>
                    <input
                      type="number"
                      className="form-input"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Submission Mode (Coordinator Decision)</label>
                  <select 
                    className="form-select"
                    value={submissionMode}
                    onChange={(e) => setSubmissionMode(e.target.value)}
                  >
                    <option value="LEADER_SUBMITS_ALL">Mode A: Group Mode (Any member submits, reflects for all members)</option>
                    <option value="MEMBERS_SUBMIT_ASSIGNED">Mode B: Individual Mode (Each student submits assigned parts)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={15} />
                  <span>Save Milestone Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
