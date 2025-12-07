/**
 * Daily Logs Page - View history of daily logs
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailyLogAPI } from '../services/api';
import { Calendar, Smile, Zap, Clock, Eye, Plus } from 'lucide-react';

const DailyLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await dailyLogAPI.getAll();
      setLogs(response.results || response);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (score) => {
    if (score <= 2) return '😢';
    if (score <= 4) return '😕';
    if (score <= 6) return '😐';
    if (score <= 8) return '🙂';
    return '😄';
  };

  const getEnergyColor = (level) => {
    if (level <= 3) return 'text-accent-red';
    if (level <= 6) return 'text-accent-yellow';
    return 'text-accent-green';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-surface rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-dark-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Daily Logs</h1>
          <p className="text-text-muted">View your daily progress history</p>
        </div>
        <button
          onClick={() => navigate('/journal')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Entry
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="mx-auto mb-4 text-text-muted" size={48} />
          <h3 className="text-xl font-semibold mb-2">No Daily Logs Yet</h3>
          <p className="text-text-muted mb-6">Start tracking your daily progress by creating your first journal entry.</p>
          <button
            onClick={() => navigate('/journal')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create First Entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logs.map((log) => (
            <div
              key={log.id}
              className="card hover:shadow-dark-lg transition-shadow cursor-pointer"
              onClick={() => navigate('/journal')}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar size={16} />
                  <span className="text-sm">
                    {new Date(log.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-text-muted mb-1">
                    <Smile size={14} />
                    Mood
                  </div>
                  <div className="text-2xl mb-1">{getMoodEmoji(log.mood_score)}</div>
                  <div className="text-sm font-semibold text-primary">{log.mood_score}/10</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-text-muted mb-1">
                    <Zap size={14} />
                    Energy
                  </div>
                  <div className={`text-2xl font-bold ${getEnergyColor(log.energy_level)}`}>
                    {log.energy_level}
                  </div>
                  <div className="text-sm text-text-muted">/10</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-text-muted mb-1">
                    <Clock size={14} />
                    Focus
                  </div>
                  <div className="text-2xl font-bold text-accent-blue">{log.focus_hours}</div>
                  <div className="text-sm text-text-muted">hours</div>
                </div>
              </div>

              {log.habits_completed && log.habits_completed.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-text-muted mb-2">Habits Completed</div>
                  <div className="flex flex-wrap gap-1">
                    {log.habits_completed.slice(0, 3).map((habit) => (
                      <span
                        key={habit}
                        className="px-2 py-1 bg-accent-green bg-opacity-10 text-accent-green text-xs rounded"
                      >
                        {habit}
                      </span>
                    ))}
                    {log.habits_completed.length > 3 && (
                      <span className="px-2 py-1 bg-dark-elevated text-text-muted text-xs rounded">
                        +{log.habits_completed.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {log.notes && (
                <div className="border-t border-dark-border pt-3">
                  <p className="text-sm text-text-muted line-clamp-2">{log.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-dark-border flex items-center justify-end">
                <button className="text-primary hover:text-primary-light text-sm flex items-center gap-1">
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyLogs;
