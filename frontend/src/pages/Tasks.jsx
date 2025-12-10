/**
 * Tasks Page - Manage actionable tasks with full CRUD and track linking
 */
import { useState, useEffect } from 'react';
import { taskAPI, trackAPI, sprintAPI } from '../services/api';
import { CheckSquare, Plus, Edit, Trash2, Calendar, Target, Search, Filter, X } from 'lucide-react';
import Modal from '../components/Modal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    estimated_hours: '',
    due_date: '',
    track: '',
    sprint: '',
  });

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedSprint, setSelectedSprint] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, tracksData, sprintsData] = await Promise.all([
        taskAPI.getAll(),
        trackAPI.getAll(),
        sprintAPI.getAll(),
      ]);
      setTasks(tasksData.results || tasksData);
      setTracks(tracksData.results || tracksData);
      setSprints(sprintsData.results || sprintsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        estimated_hours: task.estimated_hours || '',
        due_date: task.due_date || '',
        track: task.track || '',
        sprint: task.sprint || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        estimated_hours: '',
        due_date: '',
        track: '',
        sprint: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert empty strings to null for foreign keys
      const submitData = {
        ...formData,
        track: formData.track || null,
        sprint: formData.sprint || null,
        estimated_hours: formData.estimated_hours || null,
        due_date: formData.due_date || null,
      };

      if (editingTask) {
        await taskAPI.update(editingTask.id, submitData);
      } else {
        await taskAPI.create(submitData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleStatusToggle = async (task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE';
    try {
      await taskAPI.update(task.id, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      TODO: 'text-text-muted bg-dark-elevated',
      IN_PROGRESS: 'text-accent-blue bg-accent-blue bg-opacity-10',
      DONE: 'text-accent-green bg-accent-green bg-opacity-10',
    };
    return colors[status] || colors.TODO;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      HIGH: 'text-accent-red',
      MEDIUM: 'text-accent-yellow',
      LOW: 'text-text-muted',
    };
    return colors[priority] || colors.MEDIUM;
  };

  // Filter tasks based on all criteria
  const filteredTasks = tasks.filter((task) => {
    // Search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (selectedStatus && task.status !== selectedStatus) {
      return false;
    }

    // Priority filter
    if (selectedPriority && task.priority !== selectedPriority) {
      return false;
    }

    // Track filter
    if (selectedTrack && task.track !== parseInt(selectedTrack)) {
      return false;
    }

    // Sprint filter
    if (selectedSprint && task.sprint !== parseInt(selectedSprint)) {
      return false;
    }

    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedTrack('');
    setSelectedSprint('');
  };

  const hasActiveFilters =
    searchText || selectedStatus || selectedPriority || selectedTrack || selectedSprint;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-text-muted">Manage your actionable items</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      {/* Filters Section */}
      <div className="card space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            className="input-field pl-10 w-full"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Filter size={16} />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            className="input-field w-auto text-sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            className="input-field w-auto text-sm"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Track Filter */}
          <select
            className="input-field w-auto text-sm"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            <option value="">All Tracks</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </select>

          {/* Sprint Filter */}
          <select
            className="input-field w-auto text-sm"
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
          >
            <option value="">All Sprints</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 bg-dark-elevated hover:bg-dark-hover rounded-lg transition-colors text-sm"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}

          {/* Results Count */}
          <div className="ml-auto text-sm text-text-muted">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card animate-pulse h-20"></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-16">
          <CheckSquare size={48} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
          <p className="text-text-muted mb-6">Create your first task to get started</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            Create First Task
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card text-center py-16">
          <Filter size={48} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tasks match your filters</h3>
          <p className="text-text-muted mb-6">Try adjusting your filters to see more tasks</p>
          <button
            onClick={clearFilters}
            className="btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className="card hover:shadow-dark-lg transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleStatusToggle(task)}
                    className="mt-1"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      task.status === 'DONE'
                        ? 'bg-accent-green border-accent-green'
                        : 'border-dark-border hover:border-primary'
                    }`}>
                      {task.status === 'DONE' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className={`text-lg font-semibold ${task.status === 'DONE' ? 'line-through text-text-muted' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status_display}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority_display}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-text-muted text-sm mb-3">{task.description}</p>
                    )}

                    <div className="flex gap-4 text-sm text-text-muted flex-wrap">
                      {task.track_title && (
                        <span className="flex items-center gap-1">
                          <Target size={14} />
                          {task.track_title}
                        </span>
                      )}
                      {task.estimated_hours && <span>{task.estimated_hours}h estimated</span>}
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(task)}
                    className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-accent-red" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-accent-red">*</span>
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Build user authentication system"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="input-field"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Status <span className="text-accent-red">*</span>
              </label>
              <select
                required
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Priority <span className="text-accent-red">*</span>
              </label>
              <select
                required
                className="input-field"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Track</label>
              <select
                className="input-field"
                value={formData.track}
                onChange={(e) => setFormData({ ...formData, track: e.target.value })}
              >
                <option value="">No Track</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sprint</label>
              <select
                className="input-field"
                value={formData.sprint}
                onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
              >
                <option value="">No Sprint</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Estimated Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="input-field"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                placeholder="e.g., 4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-dark-border">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 bg-dark-elevated hover:bg-dark-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-6 py-2">
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
