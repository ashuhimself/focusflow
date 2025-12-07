/**
 * Sprints Page - Manage 2-week sprint periods with full CRUD
 */
import { useState, useEffect } from 'react';
import { sprintAPI, trackAPI } from '../services/api';
import { Calendar, Plus, Edit, Trash2, Target, TrendingUp } from 'lucide-react';
import Modal from '../components/Modal';

const Sprints = () => {
  const [sprints, setSprints] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    track: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sprintsData, tracksData] = await Promise.all([
        sprintAPI.getAll(),
        trackAPI.getAll(),
      ]);
      setSprints(sprintsData.results || sprintsData);
      setTracks(tracksData.results || tracksData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sprint = null) => {
    if (sprint) {
      setEditingSprint(sprint);
      setFormData({
        name: sprint.name,
        track: sprint.track || '',
        start_date: sprint.start_date,
        end_date: sprint.end_date,
      });
    } else {
      setEditingSprint(null);
      // Auto-calculate 2-week sprint
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 14);

      setFormData({
        name: '',
        track: '',
        start_date: today.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSprint(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        track: formData.track || null,
      };

      if (editingSprint) {
        await sprintAPI.update(editingSprint.id, submitData);
      } else {
        await sprintAPI.create(submitData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Failed to save sprint:', error);
      alert('Failed to save sprint. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sprint?')) return;

    try {
      await sprintAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete sprint:', error);
      alert('Failed to delete sprint. Please try again.');
    }
  };

  const getSprintStatus = (sprint) => {
    const today = new Date();
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);

    if (today < startDate) return { status: 'upcoming', color: 'text-accent-blue' };
    if (today > endDate) return { status: 'completed', color: 'text-text-muted' };
    return { status: 'active', color: 'text-accent-green' };
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sprints</h1>
          <p className="text-text-muted">Plan and track your 2-week work periods</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Sprint
        </button>
      </div>

      {/* Sprints List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-dark-elevated rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-dark-elevated rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : sprints.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar size={48} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No sprints yet</h3>
          <p className="text-text-muted mb-6">Create your first sprint to organize work into 2-week periods</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            Create First Sprint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map((sprint) => {
            const { status, color } = getSprintStatus(sprint);
            const daysRemaining = getDaysRemaining(sprint.end_date);

            return (
              <div key={sprint.id} className="card hover:shadow-dark-lg transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${color} bg-opacity-10 bg-current`}>
                    {status}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(sprint)}
                      className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                    >
                      <Edit size={16} className="text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(sprint.id)}
                      className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-accent-red" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{sprint.name}</h3>

                {sprint.track_title && (
                  <div className="flex items-center gap-2 mb-4">
                    <Target size={16} className="text-primary" />
                    <span className="text-sm text-text-muted">{sprint.track_title}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Start Date</span>
                    <span className="font-medium">{new Date(sprint.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">End Date</span>
                    <span className="font-medium">{new Date(sprint.end_date).toLocaleDateString()}</span>
                  </div>

                  {status === 'active' && (
                    <div className="pt-3 border-t border-dark-border">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-text-muted">Days Remaining</span>
                        <span className={`font-medium ${daysRemaining <= 3 ? 'text-accent-red' : 'text-accent-green'}`}>
                          {daysRemaining} days
                        </span>
                      </div>
                      {sprint.progress_percentage !== undefined && (
                        <>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-text-muted flex items-center gap-1">
                              <TrendingUp size={14} />
                              Progress
                            </span>
                            <span className="text-primary font-medium">{sprint.progress_percentage}%</span>
                          </div>
                          <div className="h-2 bg-dark-elevated rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${sprint.progress_percentage}%` }}
                            ></div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sprint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSprint ? 'Edit Sprint' : 'Create New Sprint'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sprint Name <span className="text-accent-red">*</span>
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sprint 1 - Authentication Module"
            />
          </div>

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
            <p className="text-xs text-text-muted mt-1">Link this sprint to a specific track</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date <span className="text-accent-red">*</span>
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.start_date}
                onChange={(e) => {
                  const startDate = new Date(e.target.value);
                  const endDate = new Date(startDate);
                  endDate.setDate(endDate.getDate() + 14);
                  setFormData({
                    ...formData,
                    start_date: e.target.value,
                    end_date: endDate.toISOString().split('T')[0],
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                End Date <span className="text-accent-red">*</span>
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-dark-elevated p-4 rounded-lg">
            <p className="text-sm text-text-muted">
              <strong>Tip:</strong> Sprints are typically 2-week periods. The end date is automatically set to 14 days after the start date, but you can adjust it.
            </p>
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
              {editingSprint ? 'Update Sprint' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sprints;
