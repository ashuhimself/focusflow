/**
 * Board Page - Kanban Board view for Tracks and Tasks
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackAPI, taskAPI, categoryAPI } from '../services/api';
import { Plus, MoreVertical, Target, Calendar, TrendingUp, Tag } from 'lucide-react';

const Board = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tracksData, categoriesData, tasksData] = await Promise.all([
        trackAPI.getAll(),
        categoryAPI.getAll(),
        taskAPI.getByStatus(),
      ]);

      setTracks(tracksData.results || tracksData);
      setCategories(categoriesData.results || categoriesData);
      setTasksByStatus(tasksData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
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

  const TaskCard = ({ task }) => (
    <div className="bg-dark-elevated p-4 rounded-lg border-l-4 border-dark-border hover:shadow-dark-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors flex-1">
          {task.title}
        </h4>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={16} className="text-text-muted" />
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
    <div className="flex-1 min-w-[300px]">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {title}
            <span className="text-sm text-text-muted bg-dark-elevated px-2 py-1 rounded">
              {tasks.length}
            </span>
          </h3>
          <button className="p-1 hover:bg-dark-elevated rounded transition-colors">
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
            onClick={() => navigate('/tracks')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Track
          </button>
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
            tasks={tasksByStatus.TODO?.tasks || []}
          />
          <KanbanColumn
            status="IN_PROGRESS"
            title="In Progress"
            tasks={tasksByStatus.IN_PROGRESS?.tasks || []}
          />
          <KanbanColumn
            status="DONE"
            title="Done"
            tasks={tasksByStatus.DONE?.tasks || []}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="card hover:shadow-dark-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="text-primary" size={20} />
                  <span className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-xs font-medium">
                    {goal.category_display}
                  </span>
                </div>
                {goal.is_active && (
                  <span className="px-3 py-1 bg-accent-green bg-opacity-10 text-accent-green rounded-full text-xs font-medium">
                    Active
                  </span>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2">{goal.title}</h3>

              {goal.description && (
                <p className="text-text-muted text-sm mb-4 line-clamp-2">{goal.description}</p>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-muted flex items-center gap-1">
                    <TrendingUp size={14} />
                    Progress
                  </span>
                  <span className="text-primary font-medium">{goal.progress_percentage}%</span>
                </div>
                <div className="h-2 bg-dark-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all"
                    style={{ width: `${goal.progress_percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-text-muted border-t border-dark-border pt-4">
                <span>{goal.task_count || 0} tasks</span>
                {goal.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Board;
