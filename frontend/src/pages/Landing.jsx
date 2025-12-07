/**
 * Landing Page - Beautiful marketing page for FocusFlow
 */
import { useNavigate } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Zap,
  Users,
  BookOpen,
  ArrowRight,
  BarChart3,
  Rocket,
  Award,
  Clock
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Goal Tracking',
      description: 'Set ambitious tracks and break them down into manageable sprints and tasks. Visualize your progress in real-time.'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Sprint Planning',
      description: 'Organize your learning in 2-week sprints. Stay focused with time-boxed goals and clear milestones.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Progress Analytics',
      description: 'Beautiful dashboards show your productivity trends, completion rates, and focus hours over time.'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Daily Todos',
      description: 'Manage daily tasks effortlessly. Keep your momentum going with simple, actionable daily plans.'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Daily Journal',
      description: 'Track your mood, energy, habits, and reflections. Build self-awareness and stay motivated.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Heatmap View',
      description: 'GitHub-style activity heatmap shows your consistency. Build streaks and maintain discipline.'
    },
  ];

  const stats = [
    { number: '6', label: 'Learning Tracks', icon: <Rocket /> },
    { number: '36', label: 'Structured Sprints', icon: <Calendar /> },
    { number: '213', label: 'Curated Tasks', icon: <CheckCircle /> },
    { number: '450+', label: 'Learning Hours', icon: <Clock /> },
  ];

  const tracks = [
    {
      name: 'AWS Solutions Architect',
      category: 'Cloud & Infrastructure',
      color: 'from-orange-500 to-red-500',
      icon: '☁️'
    },
    {
      name: 'DevOps Engineering',
      category: 'CI/CD & Automation',
      color: 'from-blue-500 to-cyan-500',
      icon: '⚙️'
    },
    {
      name: 'AI Engineering',
      category: 'LLMs & RAG Systems',
      color: 'from-purple-500 to-pink-500',
      icon: '🤖'
    },
    {
      name: 'Backend Development',
      category: 'Django & REST APIs',
      color: 'from-green-500 to-emerald-500',
      icon: '🔧'
    },
    {
      name: 'Data Engineering',
      category: 'PySpark & Observability',
      color: 'from-yellow-500 to-orange-500',
      icon: '📊'
    },
    {
      name: 'Trading & Finance',
      category: 'Technical Analysis',
      color: 'from-indigo-500 to-purple-500',
      icon: '📈'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg">
      {/* Navigation */}
      <nav className="border-b border-dark-border bg-dark-surface/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                FocusFlow
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-text-primary hover:text-primary transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary-light/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-8">
              <Award className="w-4 h-4" />
              <span>Complete 3-Month Learning System</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-text-primary to-text-muted bg-clip-text text-transparent">
              Master Your Learning Journey
            </h1>

            <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your ambitions into achievements with FocusFlow.
              A comprehensive system to learn <span className="text-primary font-semibold">AWS</span>,
              <span className="text-primary font-semibold"> DevOps</span>,
              <span className="text-primary font-semibold"> AI Engineering</span>,
              <span className="text-primary font-semibold"> Backend Development</span>, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white text-lg font-semibold rounded-lg hover:shadow-2xl hover:shadow-primary/50 transition-all flex items-center gap-2 group"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border-2 border-primary/30 text-text-primary text-lg font-semibold rounded-lg hover:bg-primary/10 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-dark-elevated border border-dark-border rounded-xl p-6 text-center hover:border-primary/50 transition-all"
              >
                <div className="text-primary mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-4xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-text-muted text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Tracks */}
      <section className="py-20 bg-dark-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">6 Parallel Learning Tracks</h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Follow a structured curriculum designed for high-intensity parallel learning. Each track is carefully curated with sprints and tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track, index) => (
              <div
                key={index}
                className="group relative bg-dark-elevated border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative">
                  <div className="text-4xl mb-4">{track.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{track.name}</h3>
                  <p className="text-primary text-sm mb-4">{track.category}</p>
                  <div className="text-text-muted text-sm">
                    6 Sprints • 35+ Tasks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Built for serious learners who want to achieve ambitious goals through disciplined, focused execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-dark-elevated border border-dark-border rounded-xl p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-dark-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How FocusFlow Works</h2>
            <p className="text-text-muted text-lg">Simple, powerful, effective</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Your Tracks</h3>
              <p className="text-text-muted">
                Select from 6 pre-built learning tracks or create your own. Each track has structured sprints and tasks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Execute Daily</h3>
              <p className="text-text-muted">
                Follow your schedule, complete tasks, track your mood and energy. Build consistency with daily journaling.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Achieve Mastery</h3>
              <p className="text-text-muted">
                Watch your progress on dashboards. Celebrate milestones. Reach your goals with data-driven insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Join thousands of learners who are mastering new skills with FocusFlow.
              Start your journey today—completely free.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-primary text-lg font-semibold rounded-lg hover:shadow-2xl transition-all inline-flex items-center gap-2 group"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-12 bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">FocusFlow</span>
            </div>
            <div className="text-text-muted text-sm">
              © 2024 FocusFlow. Built for ambitious learners.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
