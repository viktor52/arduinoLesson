import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Code2, History, Trophy, User, LogOut,
  Sun, Moon, Shield, WifiOff, Zap, HelpCircle, ListChecks, ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useOnlineStatus } from '../../hooks/useUtils';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/questions', icon: HelpCircle, label: 'Questions' },
  { path: '/exams', icon: ClipboardList, label: 'Exams' },
  { path: '/workspace', icon: Code2, label: 'Workspace' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600/90 text-white text-center py-2 text-sm flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" /> You are offline
        </div>
      )}

      <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-surface-900/50 backdrop-blur-xl">
        <div className="p-6 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-arduino-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">ArduinoLearn</h1>
              <p className="text-xs text-gray-500">Interactive Learning</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems
            .filter(({ path }) => {
              if (user?.role !== 'ADMIN') return true;
              return path !== '/questions' && path !== '/exams';
            })
            .map(({ path, icon: Icon, label }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-arduino-500/20 text-arduino-400 border border-arduino-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
          {user?.role === 'ADMIN' && (
            <>
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === '/admin'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Shield className="w-5 h-5" />
                Admin
              </Link>
              <Link
                to="/admin/users"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname.startsWith('/admin/users')
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <User className="w-5 h-5" />
                Users
              </Link>
              <Link
                to="/admin/questions"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname.startsWith('/admin/questions')
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ListChecks className="w-5 h-5" />
                Question Bank
              </Link>
              <Link
                to="/admin/exams"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname.startsWith('/admin/exams')
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                Exams
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-arduino-500/30 flex items-center justify-center text-sm font-bold text-arduino-400">
              {(user?.displayName || user?.username || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName || user?.username}</p>
              <p className="text-xs text-gray-500">Level {user?.level}</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="btn-ghost w-full justify-start">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={() => logout()} className="btn-ghost w-full justify-start text-red-400 hover:text-red-300">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-40 bg-surface-900/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-arduino-400" />
              <span className="font-bold">ArduinoLearn</span>
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="btn-ghost p-2">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <nav className="flex gap-1 mt-3 overflow-x-auto pb-1">
            {navItems
              .filter(({ path }) => {
                if (user?.role !== 'ADMIN') return true;
                return path !== '/questions' && path !== '/exams';
              })
              .map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  location.pathname.startsWith(path)
                    ? 'bg-arduino-500/20 text-arduino-400'
                    : 'text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                    location.pathname === '/admin'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
                <Link
                  to="/admin/users"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                    location.pathname.startsWith('/admin/users')
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Users
                </Link>
                <Link
                  to="/admin/questions"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                    location.pathname.startsWith('/admin/questions')
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400'
                  }`}
                >
                  <ListChecks className="w-4 h-4" />
                  Bank
                </Link>
                <Link
                  to="/admin/exams"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                    location.pathname.startsWith('/admin/exams')
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Exams
                </Link>
              </>
            )}
          </nav>
        </header>

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-4 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-8 h-8 border-2 border-arduino-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user?.role !== 'ADMIN') {
    window.location.href = '/dashboard';
    return null;
  }

  return <>{children}</>;
}
