/**
 * DailyJournal Page - Daily logging with text editor and mood slider
 */
import { useState, useEffect } from 'react';
import { dailyLogAPI } from '../services/api';
import { Calendar, Smile, Zap, Clock, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';

const DailyJournal = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [log, setLog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogForDate(currentDate);
  }, [currentDate]);

  const fetchLogForDate = async (date) => {
    setLoading(true);
    try {
      // Check if it's today
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      if (isToday) {
        const response = await dailyLogAPI.getToday();
        setLog(response);
      } else {
        // For other dates, get all logs and filter
        const response = await dailyLogAPI.getAll({
          start_date: format(date, 'yyyy-MM-dd'),
          end_date: format(date, 'yyyy-MM-dd'),
        });
        const logs = response.results || response;
        setLog(logs.length > 0 ? logs[0] : createEmptyLog(date));
      }
    } catch (error) {
      console.error('Failed to fetch log:', error);
      setLog(createEmptyLog(date));
    } finally {
      setLoading(false);
    }
  };

  const createEmptyLog = (date) => ({
    date: format(date, 'yyyy-MM-dd'),
    mood_score: 5,
    energy_level: 5,
    notes: '',
    habits_completed: [],
    focus_hours: 0,
  });

  const handleSave = async () => {
    if (!log) return;

    setSaving(true);
    setSaved(false);

    try {
      if (log.id) {
        await dailyLogAPI.update(log.id, log);
      } else {
        const newLog = await dailyLogAPI.create(log);
        setLog(newLog);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save log:', error);
      alert('Failed to save log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setLog({ ...log, [field]: value });
  };

  const handlePreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    const today = new Date();
    if (currentDate < today) {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
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

  const commonHabits = [
    'Exercise',
    'Meditation',
    'Reading',
    'Coding',
    'Learning',
    'Healthy Eating',
    'Early Wake Up',
    'Journaling',
  ];

  const toggleHabit = (habit) => {
    const habits = log.habits_completed || [];
    const newHabits = habits.includes(habit)
      ? habits.filter((h) => h !== habit)
      : [...habits, habit];
    handleFieldChange('habits_completed', newHabits);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-surface rounded w-1/4"></div>
          <div className="h-64 bg-dark-surface rounded"></div>
        </div>
      </div>
    );
  }

  const isToday = currentDate.toDateString() === new Date().toDateString();
  const isFuture = currentDate > new Date();

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Daily Journal</h1>
          <p className="text-text-muted">Track your daily progress, mood, and habits</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || isFuture}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Entry'}
        </button>
      </div>

      {/* Date Navigator */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousDay}
            className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center gap-4">
            <Calendar className="text-primary" size={24} />
            <div className="text-center">
              <div className="text-2xl font-bold">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </div>
              {!isToday && (
                <button
                  onClick={handleToday}
                  className="text-sm text-primary hover:underline mt-1"
                >
                  Jump to Today
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleNextDay}
            disabled={isToday || isFuture}
            className="p-2 hover:bg-dark-elevated rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {isFuture ? (
        <div className="card text-center py-16">
          <Calendar className="mx-auto mb-4 text-text-muted" size={48} />
          <h3 className="text-xl font-semibold mb-2">Future Date</h3>
          <p className="text-text-muted">You cannot create logs for future dates.</p>
        </div>
      ) : (
        <>
          {/* Mood & Energy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mood Score */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Smile className="text-primary" size={24} />
                <h2 className="text-xl font-semibold">Mood Score</h2>
              </div>

              <div className="text-center mb-6">
                <div className="text-6xl mb-2">{getMoodEmoji(log?.mood_score || 5)}</div>
                <div className="text-4xl font-bold text-primary">{log?.mood_score || 5}/10</div>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={log?.mood_score || 5}
                onChange={(e) => handleFieldChange('mood_score', parseInt(e.target.value))}
                className="w-full h-3 bg-dark-surface rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
                         [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                         [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
                         [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />

              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>Very Bad</span>
                <span>Neutral</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-accent-yellow" size={24} />
                <h2 className="text-xl font-semibold">Energy Level</h2>
              </div>

              <div className="text-center mb-6">
                <div className={`text-4xl font-bold ${getEnergyColor(log?.energy_level || 5)}`}>
                  {log?.energy_level || 5}/10
                </div>
                <p className="text-text-muted mt-2">
                  {log?.energy_level <= 3 && 'Low Energy'}
                  {log?.energy_level > 3 && log?.energy_level <= 6 && 'Moderate Energy'}
                  {log?.energy_level > 6 && 'High Energy'}
                </p>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={log?.energy_level || 5}
                onChange={(e) => handleFieldChange('energy_level', parseInt(e.target.value))}
                className="w-full h-3 bg-dark-surface rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
                         [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-accent-yellow [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                         [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent-yellow
                         [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />

              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>Exhausted</span>
                <span>Normal</span>
                <span>Energized</span>
              </div>
            </div>
          </div>

          {/* Focus Hours */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-accent-blue" size={24} />
              <h2 className="text-xl font-semibold">Focus Hours</h2>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={log?.focus_hours || 0}
                onChange={(e) => handleFieldChange('focus_hours', parseFloat(e.target.value) || 0)}
                className="input-field w-32 text-center text-2xl font-bold"
              />
              <span className="text-text-muted">hours of focused work today</span>
            </div>
          </div>

          {/* Habits Tracker */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Habits Completed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {commonHabits.map((habit) => {
                const isCompleted = (log?.habits_completed || []).includes(habit);
                return (
                  <button
                    key={habit}
                    onClick={() => toggleHabit(habit)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isCompleted
                        ? 'border-accent-green bg-accent-green bg-opacity-10 text-accent-green'
                        : 'border-dark-border hover:border-text-muted text-text-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{habit}</span>
                      {isCompleted && <span className="text-xl">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Journal Entry */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Journal Entry</h2>
            <textarea
              value={log?.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="How was your day? What did you accomplish? Any reflections or thoughts?"
              className="input-field min-h-[300px] resize-y font-mono"
            />
            <p className="text-sm text-text-muted mt-2">
              {(log?.notes || '').length} characters
            </p>
          </div>

          {/* Save Button (Mobile) */}
          <div className="md:hidden">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Entry'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DailyJournal;
