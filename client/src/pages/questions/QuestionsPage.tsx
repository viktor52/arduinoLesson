import { Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight, Lightbulb, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { SyntaxQuestionCheckResult } from '@arduino/shared';
import { questionsApi } from '../../services/api';
import { Card, ProgressBar } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';

export function QuestionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checkResult, setCheckResult] = useState<SyntaxQuestionCheckResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['syntax-questions'],
    queryFn: () => questionsApi.getAll().then((r) => r.data),
  });

  const { data: progress } = useQuery({
    queryKey: ['syntax-questions-progress'],
    queryFn: () => questionsApi.getProgress().then((r) => r.data),
  });

  const current = questions?.[index];

  const { data: questionDetail } = useQuery({
    queryKey: ['syntax-question-detail', current?.id],
    queryFn: () => questionsApi.getById(current!.id).then((r) => r.data),
    enabled: showHint && !!current?.id,
  });

  const completedSet = new Set(progress?.completedIds ?? []);

  const checkMutation = useMutation({
    mutationFn: (payload: { id: string; answer: string }) =>
      questionsApi.check(payload.id, payload.answer).then((r) => r.data),
    onSuccess: (result) => {
      setCheckResult(result);
      if (result.passed) {
        toast.success('Correct!');
        queryClient.invalidateQueries({ queryKey: ['syntax-questions-progress'] });
      }
      if (!result.passed && result.hint) {
        setShowHint(true);
      }
    },
    onError: () => toast.error('Could not check your answer'),
  });

  const handleCheck = useCallback(() => {
    if (!current || !answer.trim()) return;
    setCheckResult(null);
    checkMutation.mutate({ id: current.id, answer });
  }, [current, answer, checkMutation]);

  useEffect(() => {
    setAnswer('');
    setCheckResult(null);
    setShowHint(false);
  }, [index]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleCheck();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCheck]);

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/questions" replace />;
  }

  if (questionsLoading) return <LoadingSpinner size="lg" />;

  if (!questions?.length) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <p className="text-gray-400 text-center py-8">No practice questions available.</p>
        </Card>
      </div>
    );
  }

  const total = questions.length;
  const completedCount = progress?.completedCount ?? 0;
  const isCurrentCompleted = current ? completedSet.has(current.id) : false;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-arduino-400" />
          Syntax Questions
        </h1>
        <p className="text-gray-400 mt-1">
          Write one line of Arduino/C++ code per question — get instant feedback on syntax and correctness.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            Question {current?.order ?? index + 1} of {total}
          </span>
          <span className="text-sm text-arduino-400">{completedCount}/{total} completed</span>
        </div>
        <ProgressBar
          percent={Math.round((completedCount / total) * 100)}
          label="Your progress"
        />
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="badge bg-arduino-500/20 text-arduino-400">{current?.category}</span>
          {isCurrentCompleted && (
            <span className="badge bg-green-500/20 text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Done
            </span>
          )}
        </div>

        <p className="text-lg font-medium leading-relaxed mb-6">{current?.prompt}</p>

        <label className="block text-sm text-gray-400 mb-2">Your answer (one line)</label>
        <input
          type="text"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            if (checkResult && !checkResult.passed) setCheckResult(null);
          }}
          placeholder="Type a single line of code..."
          className="input-field font-mono text-sm w-full"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <p className="text-xs text-gray-500 mt-2">Press Ctrl+Enter to check</p>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleCheck}
            disabled={!answer.trim() || checkMutation.isPending}
            className="btn-primary"
          >
            <Zap className="w-4 h-4" />
            {checkMutation.isPending ? 'Checking...' : 'Check Answer'}
          </button>
          <button
            onClick={() => setShowHint((v) => !v)}
            className="btn-secondary"
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        </div>

        <AnimatePresence>
          {showHint && current && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
            >
              <p className="text-sm text-yellow-200 font-mono">
                {checkResult?.hint || questionDetail?.hint || 'Loading hint...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {checkResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-6 p-4 rounded-xl border ${
                checkResult.passed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {checkResult.passed ? (
                  <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${checkResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {checkResult.passed ? 'Correct!' : 'Not quite — try again'}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">{checkResult.message}</p>
                  {checkResult.tests.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {checkResult.tests.map((t, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                          {t.passed ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                          {t.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="btn-secondary"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-sm text-gray-500">
          {index + 1} / {total}
        </span>
        <button
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={index >= total - 1}
          className="btn-secondary"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
