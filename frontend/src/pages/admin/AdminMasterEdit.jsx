import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { academicService } from '../../services/academicService';
import { taskService } from '../../services/taskService';

export const AdminMasterEdit = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newGuide, setNewGuide] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [extensionHours, setExtensionHours] = useState(48);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTeams, fetchedTasks, fetchedFaculties] = await Promise.all([
        academicService.getTeams(),
        taskService.getTasks(),
        academicService.getFaculty()
      ]);
      setTeams(fetchedTeams || []);
      setTasks(fetchedTasks || []);
      setFaculties(fetchedFaculties || []);
      
      if (fetchedTeams?.length > 0) setSelectedGroup(fetchedTeams[0].team_id);
      if (fetchedTasks?.length > 0) setSelectedTask(fetchedTasks[0].task_id);
      if (fetchedFaculties?.length > 0) setNewGuide(fetchedFaculties[0].faculty_id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuideOverride = async (e) => {
    e.preventDefault();
    try {
      await academicService.updateTeamGuide(selectedGroup, newGuide);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadData(); // Refresh to reflect new guide
    } catch (err) {
      console.error(err);
      alert('Failed to override guide: ' + err.message);
    }
  };

  const handleDeadlineOverride = async (e) => {
    e.preventDefault();
    try {
      const task = tasks.find(t => t.task_id === selectedTask);
      if (!task) return;
      const currentDeadline = new Date(task.deadline);
      currentDeadline.setHours(currentDeadline.getHours() + parseInt(extensionHours, 10));
      
      await taskService.updateTaskDeadline(selectedTask, currentDeadline.toISOString());
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadData(); // Refresh to reflect new deadline
    } catch (err) {
      console.error(err);
      alert('Failed to extend deadline: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#243143' }}>Master Data Edit & Administrative Override</h1>
        <p className="text-muted" style={{ fontSize: '14px' }}>
          Emergency administrative overrides for guide reassignment, deadline extension, and USN mapping.
        </p>
      </div>

      {saved && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>Master administrative override updated and logged to audit trail!</span>
        </div>
      )}

      <div className="grid-2">
        <Card title="Guide Reassignment Override">
          <form onSubmit={handleGuideOverride}>
            <div className="form-group">
              <label className="form-label">Select Target Project Group</label>
              <select
                className="form-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {teams.map(g => (
                  <option key={g.team_id} value={g.team_id}>{g.team_code} - {g.subject?.subject_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reassign Faculty Guide</label>
              <select
                className="form-select"
                value={newGuide}
                onChange={(e) => setNewGuide(e.target.value)}
              >
                {faculties.map(f => (
                  <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              <Settings size={16} />
              <span>REASSIGN FACULTY GUIDE</span>
            </button>
          </form>
        </Card>

        <Card title="Emergency Milestone Deadline Extension">
          <form onSubmit={handleDeadlineOverride}>
            <div className="form-group">
              <label className="form-label">Select Milestone Phase</label>
              <select 
                className="form-select"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                {tasks.map(t => (
                  <option key={t.task_id} value={t.task_id}>{t.title} (Due: {new Date(t.deadline).toLocaleDateString()})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Grant Grace Period Extension (Hours)</label>
              <input
                type="number"
                className="form-input"
                value={extensionHours}
                onChange={(e) => setExtensionHours(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-navy">
              <RefreshCw size={16} />
              <span>APPLY DEADLINE EXTENSION</span>
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
