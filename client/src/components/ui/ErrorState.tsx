import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 text-center max-w-md mx-auto"
    >
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Error</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </motion.div>
  );
}

export function OfflineBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white text-center py-2 text-sm font-medium">
      You are offline. Some features may not work.
    </div>
  );
}
