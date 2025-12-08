/**
 * Forgot Password Page Component
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">BreathingMonk</h1>
          <p className="text-text-muted">Reset Your Password</p>
        </div>

        {/* Forgot Password Form */}
        <div className="card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold">Forgot Password</h2>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                <p className="text-green-400 text-sm">
                  ✓ Password reset instructions have been sent to your email!
                </p>
              </div>
              <p className="text-text-muted text-sm">
                Check your inbox for a link to reset your password. If you don't see it, check your spam folder.
              </p>
              <Link
                to="/login"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-accent-red bg-opacity-10 border border-accent-red rounded-lg">
                  <p className="text-accent-red text-sm">{error}</p>
                </div>
              )}

              <p className="text-text-muted text-sm mb-6">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-text-muted hover:text-primary text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-text-muted">
          <p>
            Need help?{' '}
            <a href="mailto:support@breathingmonk.com" className="text-primary hover:text-primary-light">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
