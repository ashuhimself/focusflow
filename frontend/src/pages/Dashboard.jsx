/**
 * Dashboard Page - Enhanced with Welcome Widget, Heatmap, and Goal Cards
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, trackAPI, dailyTodoAPI } from '../services/api';
import { Target, CheckSquare, TrendingUp, Calendar, AlertCircle, Flame, Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Heatmap from '../components/Heatmap';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tracksByCategory, setTracksByCategory] = useState(null);
  const [todayTodos, setTodayTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, tracksData, todosData] = await Promise.all([
        dashboardAPI.getStats(),
        trackAPI.getByCategory(),
        dailyTodoAPI.getToday(),
      ]);

      setStats(statsData);
      setTracksByCategory(tracksData);
      setTodayTodos(todosData.results || todosData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-surface rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-dark-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Goals',
      value: stats?.active_goals || 0,
      total: stats?.total_goals || 0,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
    },
    {
      title: 'Tasks Completed',
      value: stats?.completed_tasks || 0,
      total: stats?.total_tasks || 0,
      icon: CheckSquare,
      color: 'text-accent-green',
      bgColor: 'bg-accent-green bg-opacity-10',
    },
    {
      title: 'Completion Rate',
      value: `${stats?.completion_rate || 0}%`,
      total: null,
      icon: TrendingUp,
      color: 'text-accent-blue',
      bgColor: 'bg-accent-blue bg-opacity-10',
    },
    {
      title: 'Active Sprints',
      value: stats?.active_sprints_count || 0,
      total: null,
      icon: Calendar,
      color: 'text-accent-yellow',
      bgColor: 'bg-accent-yellow bg-opacity-10',
    },
  ];

  // Prepare chart data
  const categoryData = tracksByCategory
    ? tracksByCategory.map((item) => ({
        name: item.category.name,
        count: item.tracks.length,
      }))
    : [];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="p-8 space-y-6">
      {/* Welcome Widget */}
      <div className="card-elevated">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {stats?.greeting}, {stats?.user_name}
            </h1>
            <div className="flex items-center gap-4 text-text-secondary">
              {stats?.high_priority_pending > 0 && (
                <div className="flex items-center gap-2">
                  <Flame className="text-accent-red" size={20} />
                  <span>
                    You have <span className="font-semibold text-accent-red">{stats.high_priority_pending}</span> high-priority tasks
                  </span>
                </div>
              )}
              {stats?.overdue_tasks > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-accent-yellow" size={20} />
                  <span>
                    <span className="font-semibold text-accent-yellow">{stats.overdue_tasks}</span> overdue tasks
                  </span>
                </div>
              )}
              {stats?.high_priority_pending === 0 && stats?.overdue_tasks === 0 && (
                <span className="text-accent-green flex items-center gap-2">
                  <CheckSquare size={20} />
                  You're all caught up!
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary">{stats?.pending_tasks || 0}</div>
            <div className="text-sm text-text-muted">Pending Tasks</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:shadow-dark-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-muted text-sm mb-2">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.total && <p className="text-text-muted text-sm">/ {stat.total}</p>}
                  </div>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Widget */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Activity Heatmap (Last 30 Days)</h2>
        <p className="text-text-muted text-sm mb-6">Your task completion contribution graph</p>
        <Heatmap data={stats?.heatmap_data || []} />
      </div>

      {/* Sprint Progress */}
      {stats?.sprint_progress && stats.sprint_progress.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Active Sprint Progress</h2>
          <div className="space-y-4">
            {stats.sprint_progress.map((sprint) => (
              <div key={sprint.id} className="p-4 bg-dark-elevated rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{sprint.name}</h3>
                    <p className="text-text-muted text-sm">Track: {sprint.track_title || 'No track'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{sprint.progress_percentage}%</div>
                    <div className="text-xs text-text-muted">{sprint.days_remaining} days left</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="h-3 bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all"
                      style={{ width: `${sprint.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>{sprint.completed_tasks} / {sprint.total_tasks} tasks completed</span>
                  <span>
                    {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Track Cards */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Track Progress Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracksByCategory &&
            tracksByCategory.map((item) => {
              if (item.tracks.length === 0) return null;

              return item.tracks.slice(0, 3).map((track) => (
                <div key={track.id} className="p-4 bg-dark-elevated rounded-lg hover:bg-dark-hover transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 line-clamp-1">{track.title}</h3>
                      <span className="text-xs text-primary">{item.category.name}</span>
                    </div>
                    <span className="text-2xl font-bold text-primary ml-2">{track.progress_percentage}%</span>
                  </div>
                  <div className="h-2 bg-dark-surface rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${track.progress_percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>{track.task_count || 0} tasks</span>
                    {track.deadline && <span>Due: {new Date(track.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
              ));
            })}
        </div>
      </div>

      {/* Today's Todo */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Today's Todo</h2>
        </div>

        {/* Add New Todo Form */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && newTodoTitle.trim()) {
                try {
                  await dailyTodoAPI.create({
                    title: newTodoTitle,
                    date: new Date().toISOString().split('T')[0]
                  });
                  setNewTodoTitle('');
                  fetchDashboardData();
                } catch (error) {
                  console.error('Failed to create todo:', error);
                }
              }
            }}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={async () => {
              if (newTodoTitle.trim()) {
                try {
                  await dailyTodoAPI.create({
                    title: newTodoTitle,
                    date: new Date().toISOString().split('T')[0]
                  });
                  setNewTodoTitle('');
                  fetchDashboardData();
                } catch (error) {
                  console.error('Failed to create todo:', error);
                }
              }
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>

        {todayTodos.length > 0 ? (
          <div className="space-y-3">
            {todayTodos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 p-3 bg-dark-elevated rounded-lg group">
                <input
                  type="checkbox"
                  checked={todo.is_completed}
                  onChange={async () => {
                    try {
                      await dailyTodoAPI.update(todo.id, { is_completed: !todo.is_completed });
                      fetchDashboardData();
                    } catch (error) {
                      console.error('Failed to update todo:', error);
                    }
                  }}
                  className="w-5 h-5 text-primary bg-dark-surface border-dark-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
                />
                <span className={`flex-1 ${todo.is_completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                  {todo.title}
                </span>
                <button
                  onClick={async () => {
                    try {
                      await dailyTodoAPI.delete(todo.id);
                      fetchDashboardData();
                    } catch (error) {
                      console.error('Failed to delete todo:', error);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-accent-red hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted">
            <p>No todos for today. Add one above to get started!</p>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tracks by Category */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Tracks by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-text-muted">
              No goals yet. Create your first goal to get started!
            </div>
          )}
        </div>

        {/* Activity Summary */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Activity Summary (30 Days)</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-dark-border">
              <span className="text-text-secondary">Total Focus Hours</span>
              <span className="text-xl font-semibold text-primary">{stats?.total_focus_hours || 0}h</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-dark-border">
              <span className="text-text-secondary">Average Mood Score</span>
              <span className="text-xl font-semibold text-accent-blue">{stats?.avg_mood_score || 0}/10</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-dark-border">
              <span className="text-text-secondary">Tasks In Progress</span>
              <span className="text-xl font-semibold text-accent-yellow">{stats?.in_progress_tasks || 0}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-text-secondary">Completion Rate</span>
              <span className="text-xl font-semibold text-accent-green">{stats?.completion_rate || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Activity Heatmap</h2>
        <Heatmap />
      </div>
    </div>
  );
};

export default Dashboard;
