/**
 * Login Page Component
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Sales Copy - Left Side */}
        <div className="hidden md:block space-y-6">
          <div>
            <h1 className="text-5xl font-bold text-primary mb-4">BreathingMonk</h1>
            <p className="text-2xl text-text-primary font-semibold mb-2">
              Your Life Operating System
            </p>
            <p className="text-lg text-text-secondary">
              Built by engineers, for engineers who refuse to let chaos win.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="text-primary text-2xl">✓</div>
              <div>
                <h3 className="font-semibold text-text-primary">Sprint-Based Goal Tracking</h3>
                <p className="text-text-muted text-sm">
                  Apply Agile methodology to your life. Set goals, break them into sprints, and ship results.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-primary text-2xl">✓</div>
              <div>
                <h3 className="font-semibold text-text-primary">Kanban Board for Everything</h3>
                <p className="text-text-muted text-sm">
                  Visualize your entire life pipeline. From career goals to personal projects, track it all.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-primary text-2xl">✓</div>
              <div>
                <h3 className="font-semibold text-text-primary">Daily Logs & Analytics</h3>
                <p className="text-text-muted text-sm">
                  Track mood, energy, and productivity. Data-driven insights for continuous improvement.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-primary text-2xl">✓</div>
              <div>
                <h3 className="font-semibold text-text-primary">Zero Distractions</h3>
                <p className="text-text-muted text-sm">
                  No ads. No social features. No BS. Just you and your goals.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-border">
            <p className="text-sm text-text-muted italic">
              "Stop using 15 different apps. One system to rule them all."
            </p>
          </div>
        </div>

        {/* Login Form - Right Side */}
        <div className="space-y-6">
          {/* Mobile Header */}
          <div className="md:hidden text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">BreathingMonk</h1>
            <p className="text-text-muted">Life Operating System for Engineers</p>
          </div>

          <div className="card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <LogIn className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold">Sign In</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-accent-red bg-opacity-10 border border-accent-red rounded-lg">
              <p className="text-accent-red text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="text-text-muted hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-text-muted text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-light font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
