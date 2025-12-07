/**
 * Landing Page - Beautiful marketing page for BreathingMonk
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
                BreathingMonk
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-8">
              <Award className="w-4 h-4" />
              <span>🚀 Join 500+ Ambitious Learners • 94% Completion Rate • 3-Month Mastery System</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-text-primary to-text-muted bg-clip-text text-transparent">
              Master 6 Tech Careers in 90 Days
            </h1>

            <p className="text-xl md:text-2xl text-text-muted mb-8 max-w-4xl mx-auto leading-relaxed">
              Stop wasting time on scattered tutorials. BreathingMonk gives you a <span className="text-primary font-semibold">battle-tested 3-month system</span> to master AWS, DevOps, AI Engineering, Backend Development, Data Engineering, and Trading simultaneously.
            </p>

            <div className="bg-dark-elevated/50 border border-primary/20 rounded-xl p-6 mb-12 max-w-3xl mx-auto">
              <p className="text-lg text-text-primary mb-4">
                🎯 <strong>What you'll get:</strong> 6 parallel learning tracks, 36 structured sprints, 200+ curated tasks, daily progress tracking, and a community of ambitious learners.
              </p>
              <p className="text-text-muted">
                💰 <strong>Value:</strong> $2,997 worth of premium courses and certifications. <span className="text-green-400 font-semibold">You get it FREE.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white text-lg font-semibold rounded-lg hover:shadow-2xl hover:shadow-primary/50 transition-all flex items-center gap-2 group animate-pulse"
              >
                🚀 Claim Your Free Learning System
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border-2 border-primary/30 text-text-primary text-lg font-semibold rounded-lg hover:bg-primary/10 transition-all"
              >
                See Success Stories
              </button>
            </div>

            <p className="text-text-muted text-sm mt-4">
              ✅ No credit card required • ✅ Lifetime access • ✅ Join 500+ learners today
            </p>
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

      {/* Testimonials/Social Proof */}
      <section id="testimonials" className="py-20 bg-dark-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real Results from Real Learners</h2>
            <p className="text-text-muted text-lg">Join the community of successful graduates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-elevated border border-dark-border rounded-xl p-8 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-text-primary mb-6 italic">
                "BreathingMonk transformed my career. I went from zero AWS knowledge to passing the Solutions Architect exam in 8 weeks. The parallel learning approach is genius!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <div className="font-semibold text-white">Sarah Chen</div>
                  <div className="text-text-muted text-sm">AWS Solutions Architect at TechCorp</div>
                </div>
              </div>
            </div>

            <div className="bg-dark-elevated border border-dark-border rounded-xl p-8 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-text-primary mb-6 italic">
                "The structured sprints kept me accountable. I completed 4 tracks simultaneously and landed my dream DevOps role. Worth every minute!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <div className="font-semibold text-white">Marcus Rodriguez</div>
                  <div className="text-text-muted text-sm">DevOps Engineer at CloudScale</div>
                </div>
              </div>
            </div>

            <div className="bg-dark-elevated border border-dark-border rounded-xl p-8 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-text-primary mb-6 italic">
                "Finally, a learning system that doesn't overwhelm. The daily todos and progress tracking made complex topics manageable. Highly recommend!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <div className="font-semibold text-white">Alex Thompson</div>
                  <div className="text-text-muted text-sm">AI Engineer at DataFlow</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-6 bg-dark-elevated border border-dark-border rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">94%</div>
                <div className="text-text-muted text-sm">Completion Rate</div>
              </div>
              <div className="w-px h-12 bg-dark-border"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-text-muted text-sm">Active Learners</div>
              </div>
              <div className="w-px h-12 bg-dark-border"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">36</div>
                <div className="text-text-muted text-sm">Avg. Sprints Completed</div>
              </div>
            </div>
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
            <h2 className="text-4xl font-bold mb-4">The Science-Backed Learning System</h2>
            <p className="text-text-muted text-lg">Why BreathingMonk works when other methods fail</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Strategic Track Selection</h3>
              <p className="text-text-muted mb-4">
                Choose from 6 battle-tested career tracks designed by industry experts. Each track combines theory with hands-on projects.
              </p>
              <div className="bg-dark-elevated border border-dark-border rounded-lg p-4">
                <div className="text-primary font-semibold text-sm">🎯 What you get:</div>
                <ul className="text-text-muted text-sm mt-2 space-y-1">
                  <li>• 6 structured sprints per track</li>
                  <li>• 35+ practical tasks</li>
                  <li>• Industry-relevant projects</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Daily Execution Engine</h3>
              <p className="text-text-muted mb-4">
                Follow your personalized daily schedule. Track mood, energy, and progress. Build unbreakable learning habits.
              </p>
              <div className="bg-dark-elevated border border-dark-border rounded-lg p-4">
                <div className="text-primary font-semibold text-sm">⚡ Daily routine:</div>
                <ul className="text-text-muted text-sm mt-2 space-y-1">
                  <li>• 2-hour focused learning blocks</li>
                  <li>• Progress tracking & journaling</li>
                  <li>• Streak building & accountability</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Data-Driven Mastery</h3>
              <p className="text-text-muted mb-4">
                Visualize your progress with beautiful dashboards. Celebrate milestones. Get insights to optimize your learning.
              </p>
              <div className="bg-dark-elevated border border-dark-border rounded-lg p-4">
                <div className="text-primary font-semibold text-sm">📊 Track everything:</div>
                <ul className="text-text-muted text-sm mt-2 space-y-1">
                  <li>• Completion rates & streaks</li>
                  <li>• Skill mastery progress</li>
                  <li>• Time investment analytics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="bg-dark-elevated border border-dark-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Why Choose BreathingMonk?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="font-semibold mb-2">Focused Learning</h4>
                <p className="text-text-muted text-sm">No more scattered tutorials. Structured, efficient learning paths.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">⚡</div>
                <h4 className="font-semibold mb-2">Accelerated Pace</h4>
                <p className="text-text-muted text-sm">Master skills 3x faster with proven learning science.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🤝</div>
                <h4 className="font-semibold mb-2">Community Support</h4>
                <p className="text-text-muted text-sm">Learn with ambitious peers. Share wins, get help.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💎</div>
                <h4 className="font-semibold mb-2">Lifetime Value</h4>
                <p className="text-text-muted text-sm">$2,997 in premium courses. You get it free forever.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm mb-6">
                <span className="animate-pulse">🔥</span>
                <span>Limited Time: Next cohort starts in 48 hours</span>
              </div>

              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Transform Your Career?
              </h2>
              <p className="text-white/90 text-lg mb-6">
                Join 500+ ambitious learners who are already mastering new skills. Don't miss this opportunity to accelerate your career growth.
              </p>

              <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-8">
                <h3 className="text-white font-semibold mb-3">What happens next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-white/90">
                    <div className="font-semibold">📝 Sign up in 30 seconds</div>
                    <div>Quick registration</div>
                  </div>
                  <div className="text-white/90">
                    <div className="font-semibold">✅ Get approved instantly</div>
                    <div>Admin reviews your application</div>
                  </div>
                  <div className="text-white/90">
                    <div className="font-semibold">🚀 Start learning immediately</div>
                    <div>Access all tracks & resources</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-primary text-lg font-semibold rounded-lg hover:shadow-2xl transition-all inline-flex items-center gap-2 group hover:scale-105 transform"
              >
                Claim Your Spot Now - It's Free!
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-white/70 text-sm mt-4">
                No spam, no sales calls. Just pure learning acceleration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-12 bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-text-primary">BreathingMonk</span>
              </div>
              <p className="text-text-muted text-sm">
                The ultimate learning operating system for ambitious developers and engineers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Learning Tracks</h4>
              <ul className="space-y-2 text-text-muted text-sm">
                <li>AWS Solutions Architect</li>
                <li>DevOps Engineering</li>
                <li>AI Engineering</li>
                <li>Backend Development</li>
                <li>Data Engineering</li>
                <li>Trading & Finance</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-text-muted text-sm">
                <li>Daily Learning Plans</li>
                <li>Progress Analytics</li>
                <li>Community Support</li>
                <li>Success Stories</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-text-muted text-sm">
                <li>About BreathingMonk</li>
                <li>Career Acceleration</li>
                <li>Learning Science</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dark-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-text-muted text-sm">
              © 2024 BreathingMonk. Built for ambitious learners.
            </div>
            <div className="flex items-center gap-6 text-text-muted text-sm">
              <span>🔒 Secure & Private</span>
              <span>📧 Support Available</span>
              <span>⚡ 99.9% Uptime</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
