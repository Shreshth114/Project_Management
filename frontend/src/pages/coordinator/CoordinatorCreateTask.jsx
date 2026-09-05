import React, { useState } from 'react';
import { PlusSquare, CheckCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { taskService } from '../../services/taskService';

export const CoordinatorCreateTask = () => {
<<<<<<< HEAD
  const { addTask, setActiveTab } = useAuth();
  
  // Row 1 States: Task Name | Category (Dropdown) | Deadline Date
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState('GROUP'); // GROUP | INDIVIDUAL
  const [deadline, setDeadline] = useState('2025-10-25');

  // Assessment Box Items List State (matching hand-drawn sketch media_1788544700238.jpg)
  const [assessmentItems, setAssessmentItems] = useState([
    { id: 'item-1', description: 'Technical Report & System Architecture', marks: 15 },
    { id: 'item-2', description: 'Source Code & Prototype Demonstration', marks: 25 },
    { id: 'item-3', description: 'Viva Voce & Individual Defense', marks: 10 }
  ]);

=======
  const { currentUser, setActiveTab } = useAuth();
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('GROUP'); // INDIVIDUAL | GROUP
  const [totalMarks, setTotalMarks] = useState(50);
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
>>>>>>> origin/main
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalMarks = calculateTotalMarks();
    
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

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setActiveTab('tasks');
    }, 1500);
=======
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
>>>>>>> origin/main
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#3A1F6F' }}>Create & Publish Milestone Task</h1>
          <p className="text-muted" style={{ fontSize: '14px' }}>
<<<<<<< HEAD
            Define Task Name, Category, Submission Deadline, and Assessment Components.
=======
            Define Task Type (Individual vs Group) and Deadlines.
>>>>>>> origin/main
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
<<<<<<< HEAD
                placeholder="e.g. Final Project Submission & Viva Voce"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
=======
                placeholder="e.g. Final Project Submission"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
>>>>>>> origin/main
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
<<<<<<< HEAD
                <option value="GROUP">👥 Group Task (Shared Project Deliverable)</option>
                <option value="INDIVIDUAL">👤 Individual Task (Independent Component)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Submission Deadline</label>
=======
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
>>>>>>> origin/main
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

<<<<<<< HEAD
          {/* ASSESSMENT BOX (Exact Hand-Drawn Sketch Layout media_1788544700238.jpg) */}
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

              {/* [+] Add item Button */}
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

                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Description / Component Name"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ width: '130px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#55636B' }}>Marks:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="form-input"
                      value={item.marks}
                      onChange={(e) => handleItemChange(item.id, 'marks', e.target.value)}
                      required
                    />
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
          <button type="submit" className="btn btn-primary btn-block" style={{ padding: '12px', fontSize: '15px' }}>
            <PlusSquare size={18} />
            <span>PUBLISH MILESTONE TASK</span>
=======
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
>>>>>>> origin/main
          </button>
        </form>
      </Card>
    </div>
  );
};
