import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      className={`glass-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

export function StatCard({ icon: Icon, label, value, subtext, color = 'text-arduino-400' }: StatCardProps) {
  return (
    <Card hover>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
      </div>
    </Card>
  );
}

interface ProgressBarProps {
  percent: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
}

export function ProgressBar({ percent, label, showPercent = true, color = 'bg-arduino-500' }: ProgressBarProps) {
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between text-sm mb-2">
          {label && <span className="text-gray-400">{label}</span>}
          {showPercent && <span className="text-arduino-400 font-medium">{percent}%</span>}
        </div>
      )}
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

interface DifficultyBadgeProps {
  difficulty: number;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  if (difficulty === 0) {
    return (
      <span className="badge bg-blue-500/20 text-blue-400">
        Foundations
      </span>
    );
  }

  const colors =
    difficulty <= 3 ? 'bg-green-500/20 text-green-400' :
    difficulty <= 6 ? 'bg-yellow-500/20 text-yellow-400' :
    difficulty <= 8 ? 'bg-orange-500/20 text-orange-400' :
    'bg-red-500/20 text-red-400';

  return (
    <span className={`badge ${colors}`}>
      Level {difficulty}/10
    </span>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative glass-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </motion.div>
    </div>
  );
}
