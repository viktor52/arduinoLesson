import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Code2, Sparkles, Trophy, ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-arduino-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-arduino-600/10 rounded-full blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-arduino-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl">ArduinoLearn</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn-ghost">Sign In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Learn Arduino with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-arduino-400 to-arduino-600">
              Hands-On
            </span>{' '}
            Assignments
          </h1>
          <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto">
            Master Arduino programming through structured coding challenges, instant feedback, and a gamified learning experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Start Learning Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          {[
            { icon: Sparkles, title: '100+ Assignments', desc: 'Curated Arduino challenges from beginner to expert across 10 topics' },
            { icon: Code2, title: 'Code Workspace', desc: 'Professional editor with syntax highlighting and autosave' },
            { icon: Trophy, title: 'Track Progress', desc: 'Earn XP, unlock achievements, and compete on the leaderboard' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-arduino-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-arduino-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-arduino-500">404</h1>
        <p className="text-xl text-gray-400 mt-4">Page not found</p>
        <Link to="/dashboard" className="btn-primary mt-8 inline-flex">Go Home</Link>
      </div>
    </div>
  );
}

export function ServerErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-red-500">500</h1>
        <p className="text-xl text-gray-400 mt-4">Something went wrong</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-8">Try Again</button>
      </div>
    </div>
  );
}
