import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ClipboardList, CheckCircle, XCircle, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { ExamCheckResult, UserExamDetail } from '@arduino/shared';
import { examsApi } from '../../services/api';
import { Card, ProgressBar } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Loading';

export function ExamTakePage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checkResult, setCheckResult] = useState<ExamCheckResult | null>(null);

  const { data: exam, isLoading, refetch } = useQuery({
    queryKey: ['user-exam', assignmentId],
    queryFn: () => examsApi.getById(assignmentId!).then((r) => r.data as UserExamDetail),
    enabled: !!assignmentId,
  });

  const checkMutation = useMutation({
    mutationFn: (payload: { questionId: string; answer: string }) =>
      examsApi.checkAnswer(assignmentId!, payload.questionId, payload.answer).then((r) => r.data),
    onSuccess: (result) => {
      setCheckResult(result);
      if (result.passed) toast.success('Correct!');
      if (result.examCompleted) {
        queryClient.invalidateQueries({ queryKey: ['user-exams'] });
        refetch();
        toast.success(`Exam complete! Score: ${result.score}%`);
      } else if (result.passed) {
        refetch();
      }
    },
    onError: () => toast.error('Could not submit answer'),
  });

  const current = exam?.questions[index];
  const isComplete = !!exam?.completedAt;

  useEffect(() => {
    setAnswer(current?.lastAnswer ?? '');
    setCheckResult(null);
  }, [index, current?.id, current?.lastAnswer]);

  if (isLoading || !exam) return <LoadingSpinner size="lg" />;

  const answeredCount = exam.questions.filter((q) => q.answered).length;
  const progress = exam.questions.length
    ? Math.round((answeredCount / exam.questions.length) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/exams"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Exams
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-arduino-400" />
          {exam.title}
        </h1>
        {isComplete ? (
          <p className={`mt-2 text-lg font-semibold ${exam.passed ? 'text-green-400' : 'text-orange-400'}`}>
            Exam completed — Score: {exam.score}% {exam.passed ? '(Passed)' : '(Needs improvement)'}
          </p>
        ) : (
          <p className="text-gray-400 mt-1">Answer each question. Hints are disabled during exams.</p>
        )}
      </div>

      <Card>
        <ProgressBar percent={isComplete ? (exam.score ?? 0) : progress} label={isComplete ? 'Final score' : 'Progress'} />
      </Card>

      {isComplete ? (
        <Card>
          <h2 className="font-bold mb-4">Results</h2>
          <ul className="space-y-2">
            {exam.questions.map((q, i) => (
              <li key={q.id} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-white/5">
                {q.answered ? (
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <span className="text-gray-500">Q{i + 1}:</span> {q.prompt}
                  {q.lastAnswer && (
                    <p className="font-mono text-xs text-gray-400 mt-1">{q.lastAnswer}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="badge bg-arduino-500/20 text-arduino-400">{current?.category}</span>
            <span className="text-sm text-gray-400">
              Question {index + 1} of {exam.questions.length}
            </span>
            {current?.answered && (
              <span className="badge bg-green-500/20 text-green-400">Correct</span>
            )}
          </div>

          <p className="text-lg font-medium mb-6">{current?.prompt}</p>

          <label className="block text-sm text-gray-400 mb-2">Your answer (one line)</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (checkResult && !checkResult.passed) setCheckResult(null);
            }}
            className="input-field font-mono text-sm w-full"
            spellCheck={false}
            disabled={current?.answered}
          />

          {!current?.answered && (
            <button
              onClick={() =>
                current &&
                checkMutation.mutate({ questionId: current.id, answer })
              }
              disabled={!answer.trim() || checkMutation.isPending}
              className="btn-primary mt-4"
            >
              <Zap className="w-4 h-4" />
              {checkMutation.isPending ? 'Checking...' : 'Submit Answer'}
            </button>
          )}

          <AnimatePresence>
            {checkResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl border ${
                  checkResult.passed
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <p className={`font-semibold ${checkResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {checkResult.passed ? 'Correct!' : 'Incorrect'}
                </p>
                <p className="text-sm text-gray-300 mt-1">{checkResult.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="btn-secondary text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(exam.questions.length - 1, i + 1))}
              disabled={index >= exam.questions.length - 1}
              className="btn-secondary text-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
