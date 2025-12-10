/**
 * Board Page - Kanban Board view for Tracks and Tasks
 */
import { useState, useEffect } from 'react';
import { trackAPI, taskAPI, categoryAPI, sprintAPI } from '../services/api';
import { Plus, Target, Calendar, TrendingUp, Search, Filter, Trash2, X } from 'lucide-react';
import Modal from '../components/Modal';

const Board = () => {
  const [tracks, setTracks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedSprint, setSelectedSprint] = useState('');

  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState(null);

  // Edit modal state
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tracksData, tasksData, sprintsData] = await Promise.all([
        trackAPI.getAll(),
        taskAPI.getByStatus(),
        sprintAPI.getAll(),
      ]);

      setTracks(tracksData.results || tracksData);
      setTasksByStatus(tasksData);
      setSprints(sprintsData.results || sprintsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on all filter criteria
  const filterTasks = (tasks) => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      // Track filter
      if (selectedTrack !== null && task.track !== selectedTrack) {
        return false;
      }

      // Search text filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (selectedPriority && task.priority !== selectedPriority) {
        return false;
      }

      // Sprint filter
      if (selectedSprint && task.sprint !== parseInt(selectedSprint)) {
        return false;
      }

      return true;
    });
  };

  // Get filtered tasks for each status
  const getFilteredTasksByStatus = (status) => {
    const tasks = tasksByStatus?.[status]?.tasks || [];
    return filterTasks(tasks);
  };

  const getStatusColor = (status) => {
    const colors = {
      TODO: 'border-text-muted',
      IN_PROGRESS: 'border-accent-blue',
      DONE: 'border-accent-green',
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

  // Modal handlers
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

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      await taskAPI.update(draggedTask.id, { status: newStatus });
      setDraggedTask(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to move task. Please try again.');
    }
  };

  const TaskCard = ({ task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onClick={() => handleOpenModal(task)}
      className="bg-dark-elevated p-4 rounded-lg border-l-4 border-dark-border hover:shadow-dark-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors flex-1">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} className="text-text-muted hover:text-accent-red" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-text-muted mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {task.track_title && (
            <span className="px-2 py-1 bg-primary bg-opacity-10 text-primary rounded">
              {task.track_title}
            </span>
          )}
          <span className={`font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority_display}
          </span>
        </div>
        {task.estimated_hours && (
          <span className="text-text-muted">{task.estimated_hours}h</span>
        )}
      </div>

      {task.due_date && (
        <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
          <Calendar size={12} />
          <span>{new Date(task.due_date).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );

  const KanbanColumn = ({ status, title, tasks = [] }) => (
    <div
      className="flex-1 min-w-[300px]"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, status)}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {title}
            <span className="text-sm text-text-muted bg-dark-elevated px-2 py-1 rounded">
              {tasks.length}
            </span>
          </h3>
          <button
            onClick={() => {
              setFormData({ ...formData, status });
              handleOpenModal();
            }}
            className="p-1 hover:bg-dark-elevated rounded transition-colors"
          >
            <Plus size={20} className="text-primary" />
          </button>
        </div>
        <div className={`h-1 rounded-full ${getStatusColor(status)}`}></div>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm border-2 border-dashed border-dark-border rounded-lg">
            No tasks
          </div>
        )}
      </div>
    </div>
  );

  // Clear all filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedPriority('');
    setSelectedSprint('');
    setSelectedTrack(null);
  };

  const hasActiveFilters = searchText || selectedPriority || selectedSprint || selectedTrack !== null;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-surface rounded w-1/4"></div>
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-96 bg-dark-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Board</h1>
          <p className="text-text-muted">Organize your tracks and tasks with Kanban workflow</p>
        </div>

        <div className="flex gap-3">
          <div className="flex bg-dark-surface rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>
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
        </div>
      </div>

      {/* Track Selector */}
      <div className="card">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedTrack(null)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedTrack === null
                ? 'bg-primary text-white'
                : 'bg-dark-elevated text-text-muted hover:bg-dark-hover'
            }`}
          >
            All Tracks
          </button>

          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedTrack === track.id
                  ? 'bg-primary text-white'
                  : 'bg-dark-elevated text-text-muted hover:bg-dark-hover'
              }`}
            >
              <Target size={16} />
              {track.title}
              <span className="text-xs opacity-75">{track.progress_percentage}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && tasksByStatus && (
        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn
            status="TODO"
            title="To Do"
            tasks={getFilteredTasksByStatus('TODO')}
          />
          <KanbanColumn
            status="IN_PROGRESS"
            title="In Progress"
            tasks={getFilteredTasksByStatus('IN_PROGRESS')}
          />
          <KanbanColumn
            status="DONE"
            title="Done"
            tasks={getFilteredTasksByStatus('DONE')}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <div key={track.id} className="card hover:shadow-dark-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="text-primary" size={20} />
                  <span className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-xs font-medium">
                    {track.category_display}
                  </span>
                </div>
                {track.is_active && (
                  <span className="px-3 py-1 bg-accent-green bg-opacity-10 text-accent-green rounded-full text-xs font-medium">
                    Active
                  </span>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2">{track.title}</h3>

              {track.description && (
                <p className="text-text-muted text-sm mb-4 line-clamp-2">{track.description}</p>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-muted flex items-center gap-1">
                    <TrendingUp size={14} />
                    Progress
                  </span>
                  <span className="text-primary font-medium">{track.progress_percentage}%</span>
                </div>
                <div className="h-2 bg-dark-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all"
                    style={{ width: `${track.progress_percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-text-muted border-t border-dark-border pt-4">
                <span>{track.task_count || 0} tasks</span>
                {track.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(track.deadline).toLocaleDateString()}
                  </span>
                )}
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

export default Board;
