/**
 * Tracks Page - Manage learning tracks with full CRUD
 */
import { useState, useEffect } from 'react';
import { trackAPI, categoryAPI } from '../services/api';
import { Target, Plus, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import Modal from '../components/Modal';

const Tracks = () => {
  const [tracks, setTracks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    deadline: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tracksResponse, categoriesResponse] = await Promise.all([
        trackAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setTracks(tracksResponse.results || tracksResponse);
      setCategories(categoriesResponse.results || categoriesResponse);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (track = null) => {
    if (track) {
      setEditingTrack(track);
      setFormData({
        title: track.title,
        description: track.description || '',
        category: track.category || '',
        deadline: track.deadline || '',
        is_active: track.is_active,
      });
    } else {
      setEditingTrack(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        deadline: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrack(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrack) {
        await trackAPI.update(editingTrack.id, formData);
      } else {
        await trackAPI.create(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Failed to save track:', error);
      alert('Failed to save track. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      await trackAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete track:', error);
      alert('Failed to delete track. Please try again.');
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return 'text-text-muted bg-dark-elevated';
    const colors = {
      'Development': 'text-primary bg-primary bg-opacity-10',
      'Trading': 'text-accent-blue bg-accent-blue bg-opacity-10',
      'Life': 'text-accent-green bg-accent-green bg-opacity-10',
    };
    return colors[category.name] || 'text-text-muted bg-dark-elevated';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tracks</h1>
          <p className="text-text-muted">Track your high-level objectives</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Track
        </button>
      </div>

      {/* Tracks List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-dark-elevated rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-dark-elevated rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="card text-center py-16">
          <Target size={48} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tracks yet</h3>
          <p className="text-text-muted mb-6">Create your first track to start tracking your progress</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            Create First Track
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <div key={track.id} className="card hover:shadow-dark-lg transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(track.category)}`}>
                  {track.category_name || 'No Category'}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(track)}
                    className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(track.id)}
                    className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-accent-red" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">{track.title}</h3>
              {track.description && (
                <p className="text-text-muted text-sm mb-4 line-clamp-2">{track.description}</p>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-primary font-medium">{track.progress_percentage}%</span>
                </div>
                <div className="h-2 bg-dark-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${track.progress_percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-text-muted">
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

      {/* Track Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTrack ? 'Edit Track' : 'Create New Track'}
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
              placeholder="e.g., Master Django Framework"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="input-field"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What do you want to achieve with this goal?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deadline</label>
              <input
                type="date"
                className="input-field"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 text-primary bg-dark-elevated border-dark-border rounded focus:ring-primary focus:ring-2"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              Mark as active goal
            </label>
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
              {editingTrack ? 'Update Track' : 'Create Track'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tracks;
