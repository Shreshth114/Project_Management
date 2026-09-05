import React, { useState } from 'react';
import { PlusSquare, CheckCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { taskService } from '../../services/taskService';

export const CoordinatorCreateTask = () => {
  const { addTask, setActiveTab, currentUser } = useAuth();
  
  // Row 1 States: Task Name | Category (Dropdown) | Deadline Date
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState('GROUP'); // GROUP | INDIVIDUAL
  const [deadline, setDeadline] = useState('2025-10-25');

  // Assessment Box Items List State (matching hand-drawn sketch)
  const [assessmentItems, setAssessmentItems] = useState([
    { id: 'item-1', description: 'Technical Report & System Architecture', marks: 15 },
    { id: 'item-2', description: 'Source Code & Prototype Demonstration', marks: 25 },
    { id: 'item-3', description: 'Viva Voce & Individual Defense', marks: 10 }
  ]);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    setAssessmentItems([
      ...assessmentItems,
      { id: `item-${Date.now()}`, description: '', marks: 10 }
    ]);
  };

  const handleRemoveItem = (id) => {
    setAssessmentItems(assessmentItems.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setAssessmentItems(assessmentItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateTotalMarks = () => {
    return assessmentItems.reduce((acc, item) => acc + (Number(item.marks) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalMarks = calculateTotalMarks();
    setLoading(true);
    setError(null);

    try {
      // 1. Save to AuthContext local state
      if (addTask) {
        addTask({
          title: taskName,
          taskType: category,
          phase: 'Phase 2',
          totalMarks,
          deadline,
          submissionMode: category === 'GROUP' ? 'LEADER_SUBMITS_ALL' : 'MEMBERS_SUBMIT_ASSIGNED',
          assessmentItems,
          description: assessmentItems.map(i => `${i.description} (${i.marks} Marks)`).join('; ')
        });
      }

      // 2. Save to Supabase backend if available
      try {
        const taskData = {
          faculty_id: currentUser?.faculty_id,
          title: taskName,
          description: assessmentItems.map(i => `${i.description} (${i.marks} Marks)`).join('; '),
          task_type: category,
          deadline
        };

        const criteriaList = assessmentItems.map(item => ({
          criteria_name: item.description || 'Assessment Component',
          max_marks: Number(item.marks) || 10
        }));

        await taskService.createTaskWithCriteria(taskData, criteriaList);
      } catch (backendErr) {
        console.warn('Backend task creation warning:', backendErr);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (setActiveTab) setActiveTab('tasks');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => setActiveTab && setActiveTab('tasks')}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Create & Publish Milestone Task</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Define Task Name, Category, Submission Deadline, and Assessment Components.
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
          {/* ROW 1: Task Name | Category Dropdown | Submission Deadline Date (grid-3) */}
          <div className="grid-3" style={{ marginBottom: '24px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Task Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Final Project Submission & Viva Voce"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="GROUP">👥 Group Task (Shared Project Deliverable)</option>
                <option value="INDIVIDUAL">👤 Individual Task (Independent Component)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Submission Deadline</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ASSESSMENT BOX */}
          <div style={{
            border: '2px solid #3A1F6F',
            borderRadius: '6px',
            padding: '20px',
            backgroundColor: '#F8F9FA',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3A1F6F', margin: 0 }}>
                Assessment Components & Rubrics
              </h3>

              <button
                type="button"
                className="btn btn-purple btn-sm"
                onClick={handleAddItem}
              >
                <Plus size={15} />
                <span>Add Item</span>
              </button>
            </div>

            {/* Assessment Component Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assessmentItems.map((item, index) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#FFFFFF',
                    padding: '12px 14px',
                    borderRadius: '4px',
                    border: '1px solid #E5E5E5'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#3A1F6F', width: '24px' }}>
                    #{index + 1}
                  </span>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Component Description (e.g. Methodology & Implementation Code)"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '130px' }}>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max="100"
                      value={item.marks}
                      onChange={(e) => handleItemChange(item.id, 'marks', e.target.value)}
                      style={{ width: '70px', textAlign: 'center' }}
                      required
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#55636B' }}>Marks</span>
                  </div>

                  {assessmentItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#DE3B0B', cursor: 'pointer', padding: '4px' }}
                      title="Remove assessment component"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Assessment Footer Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #CCCCCC' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddItem}
              >
                <Plus size={14} />
                <span>Add More Assessment Criteria</span>
              </button>

              <div style={{ fontSize: '15px', fontWeight: 800, color: '#DE3B0B' }}>
                Total Assessment Marks: {calculateTotalMarks()} Marks
              </div>
            </div>
          </div>

          {/* FINAL PUBLISH TASK BUTTON */}
          <button type="submit" className="btn btn-primary btn-block" style={{ padding: '12px', fontSize: '15px' }} disabled={loading}>
            <PlusSquare size={18} />
            <span>{loading ? 'PUBLISHING...' : 'PUBLISH MILESTONE TASK'}</span>
          </button>
        </form>
      </Card>
    </div>
  );
};
