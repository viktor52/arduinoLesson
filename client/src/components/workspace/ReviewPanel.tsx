import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb, AlertTriangle } from 'lucide-react';
import { Card, ProgressBar } from '../ui/Card';
import type { ReviewResult } from '@arduino/shared';

interface ReviewPanelProps {
  result: ReviewResult & { xpEarned?: number; newAchievements?: string[] };
  onClose?: () => void;
}

export function ReviewPanel({ result }: ReviewPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Review Results</h3>
          <span className={`badge ${result.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {result.passed ? 'Passed' : 'Needs Work'}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className={`text-5xl font-bold ${result.score >= 70 ? 'text-arduino-400' : 'text-orange-400'}`}>
            {result.score}%
          </div>
          {result.xpEarned ? (
            <p className="text-sm text-arduino-400 mt-2">+{result.xpEarned} XP earned!</p>
          ) : null}
        </div>

        <ProgressBar percent={result.score} label="Score" />

        {result.newAchievements && result.newAchievements.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <p className="text-sm font-medium text-yellow-400">New Achievements Unlocked!</p>
            <ul className="mt-1 text-sm text-gray-300">
              {result.newAchievements.map((a) => (
                <li key={a}>🏆 {a.replace(/-/g, ' ')}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {result.tests && result.tests.length > 0 && (
        <Card>
          <h4 className="font-semibold mb-3">Test Results</h4>
          <div className="space-y-4">
            {['Syntax', 'Variable'].map((group) => {
              const groupTests = result.tests!.filter((t) => t.name.startsWith(`${group}:`));
              if (groupTests.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{group} checks</p>
                  <div className="space-y-2">
                    {groupTests.map((test, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                        {test.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{test.name.replace(`${group}: `, '')}</p>
                          <p className="text-xs text-gray-400">{test.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {result.feedback.length > 0 && (
        <Card>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" /> Feedback
          </h4>
          <ul className="space-y-2">
            {result.feedback.map((item, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-green-400">•</span> {item}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.mistakes.length > 0 && (
        <Card>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Mistakes
          </h4>
          <ul className="space-y-2">
            {result.mistakes.map((item, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-red-400">•</span> {item}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.suggestions.length > 0 && (
        <Card>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" /> Suggestions
          </h4>
          <ul className="space-y-2">
            {result.suggestions.map((item, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-yellow-400">•</span> {item}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </motion.div>
  );
}
