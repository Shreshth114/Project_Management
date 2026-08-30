import React, { useState } from 'react';
import { PlusSquare, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { taskService } from '../../services/taskService';

export const CoordinatorCreateTask = () => {
  const { currentUser, setActiveTab } = useAuth();
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('GROUP'); // INDIVIDUAL | GROUP
  const [totalMarks, setTotalMarks] = useState(50);
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const taskData = {
        faculty_id: currentUser?.faculty_id,
        title,
        description,
        task_type: taskType,
        deadline
      };
      
      const criteriaList = [
        { criteria_name: 'Overall Task Evaluation', max_marks: totalMarks }
      ];
      
      await taskService.createTaskWithCriteria(taskData, criteriaList);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setActiveTab('tasks');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            Define Task Type (Individual vs Group) and Deadlines.
          </p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>Task milestone published successfully to student & faculty portals!</span>
        </div>
      )}
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <Card title="Milestone Requirements & Task Configuration">
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Task Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Final Project Submission"
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

          <div className="grid-2">
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

          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Specify requirements, components, and expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <PlusSquare size={16} />
            <span>{loading ? 'PUBLISHING...' : 'PUBLISH MILESTONE TASK'}</span>
          </button>
        </form>
      </Card>
    </div>
  );
};
