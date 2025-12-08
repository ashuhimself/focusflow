/**
 * Enhanced Layout Component with Sidebar and Topbar
 */
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Calendar,
  BookOpen,
  LogOut,
  User,
  Menu,
  X,
  Kanban,
  PenLine,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tracks', href: '/tracks', icon: Target },
    { name: 'Board', href: '/board', icon: Kanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Sprints', href: '/sprints', icon: Calendar },
    { name: 'Daily Logs', href: '/daily-logs', icon: BookOpen },
    { name: 'Journal', href: '/journal', icon: PenLine },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-dark-surface border-r border-dark-border flex-col hidden md:flex transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-dark-border">
          {!sidebarCollapsed ? (
            <>
              <h1 className="text-2xl font-bold text-primary">BreathingMonk</h1>
              <p className="text-sm text-text-muted mt-1">Life Operating System</p>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-primary text-center">BM</h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-dark-hover hover:text-text-primary'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-dark-border space-y-2">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-dark-elevated">
                <User size={20} className="text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-dark-hover hover:text-accent-red transition-all w-full"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button className="flex items-center justify-center p-3 rounded-lg bg-dark-elevated text-primary w-full">
                <User size={20} />
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center p-3 rounded-lg text-text-secondary hover:bg-dark-hover hover:text-accent-red transition-all w-full"
              >
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-dark-surface border-r border-dark-border flex flex-col animate-fade-in">
            {/* Logo */}
            <div className="p-6 border-b border-dark-border flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-primary">BreathingMonk</h1>
                <p className="text-sm text-text-muted mt-1">Life Operating System</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-dark-hover hover:text-text-primary'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-dark-border space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-dark-elevated">
                <User size={20} className="text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-dark-hover hover:text-accent-red transition-all w-full"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-dark-elevated rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden md:block p-2 hover:bg-dark-elevated rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Page Title */}
            <div>
              <h2 className="text-lg font-semibold capitalize">
                {location.pathname.split('/')[1].replace('-', ' ') || 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Right Side - User Info */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-dark-elevated rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full"></span>
            </button>

            {/* User Profile - Desktop */}
            <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-dark-elevated rounded-lg">
              <User size={20} className="text-primary" />
              <div className="text-sm">
                <p className="font-medium">{user?.username || 'User'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
