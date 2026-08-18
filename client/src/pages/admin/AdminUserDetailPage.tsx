import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, User, CheckCircle2, ClipboardList, BarChart3, Search, Award, Target, Calendar,
  ChevronDown, ChevronRight, XCircle, Clock,
} from 'lucide-react';
import type { AdminUserExamResult } from '@arduino/shared';
import { adminApi, AdminCompletionItem } from '../../services/api';
import { Card, StatCard, DifficultyBadge } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Loading';
import { useDebounce } from '../../hooks/useUtils';
import type { AdminUser } from './types';

export function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [search, setSearch] = useState('');
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data as AdminUser[]),
  });

  const user = users?.find((u) => u.id === userId);

  const { data: completionsData, isLoading: completionsLoading } = useQuery({
    queryKey: ['admin-completions', userId, completionFilter, debouncedSearch],
    queryFn: () =>
      adminApi
        .getCompletions({
          userId: userId!,
          completed: completionFilter === 'completed' ? true : undefined,
          search: debouncedSearch || undefined,
        })
        .then((r) => r.data),
    enabled: !!userId,
  });

  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['admin-user-exams', userId],
    queryFn: () => adminApi.getUserExams(userId!).then((r) => r.data),
    enabled: !!userId,
  });

  const completionItems: AdminCompletionItem[] =
    completionFilter === 'in-progress'
      ? (completionsData?.items.filter((i) => !i.completed && i.attempts > 0) ?? [])
      : (completionsData?.items ?? []);

  if (usersLoading) return <LoadingSpinner size="lg" />;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <Card>
          <p className="text-gray-400 text-center py-8">User not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-arduino-500/30 flex items-center justify-center text-2xl font-bold text-arduino-400 shrink-0">
            {(user.displayName || user.username)[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.displayName || user.username}</h1>
            <p className="text-gray-400 mt-1">
              @{user.username} · {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Level" value={user.level} />
        <StatCard icon={Award} label="XP" value={user.xp.toLocaleString()} color="text-arduino-400" />
        <StatCard icon={CheckCircle2} label="Completed" value={user.completedAssignments} color="text-green-400" />
        <StatCard
          icon={Calendar}
          label="Member Since"
          value={new Date(user.createdAt).toLocaleDateString()}
        />
      </div>

      <Card>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-arduino-400" />
          Profile
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500 mb-1">Username</dt>
            <dd className="font-medium">{user.username}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-1">Display Name</dt>
            <dd className="font-medium">{user.displayName || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-1">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500 mb-1">Role</dt>
            <dd>
              <span className={`badge ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10'}`}>
                {user.role}
              </span>
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-arduino-400" />
            Assignment Progress
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assignments..."
                className="input-field pl-9 py-2 text-sm w-full sm:w-48"
              />
            </div>
            <select
              value={completionFilter}
              onChange={(e) => setCompletionFilter(e.target.value as typeof completionFilter)}
              className="input-field py-2 text-sm sm:w-40"
            >
              <option value="all">All with attempts</option>
              <option value="completed">Completed only</option>
              <option value="in-progress">In progress</option>
            </select>
          </div>
        </div>

        {completionsLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {completionsData?.summary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard icon={CheckCircle2} label="Completed" value={completionsData.summary.completed} color="text-green-400" />
                <StatCard icon={ClipboardList} label="In Progress" value={completionsData.summary.inProgress} color="text-yellow-400" />
                <StatCard icon={BarChart3} label="Total Attempts" value={completionsData.summary.totalAttempts} />
              </div>
            )}

            {completionItems.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No assignment activity found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/10">
                      <th className="pb-3 pr-4">Assignment</th>
                      <th className="pb-3 pr-4">Difficulty</th>
                      <th className="pb-3 pr-4">Attempts</th>
                      <th className="pb-3 pr-4">Best Score</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Last Attempt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completionItems.map((item) => (
                      <tr key={item.assignmentId} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 pr-4">
                          <p className="font-medium">{item.title}</p>
                          {item.topic && <p className="text-xs text-gray-500">{item.topic}</p>}
                        </td>
                        <td className="py-3 pr-4">
                          <DifficultyBadge difficulty={item.difficulty} />
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-arduino-400">{item.attempts}</span>
                        </td>
                        <td className="py-3 pr-4">
                          {item.bestScore !== null ? (
                            <span className={item.bestScore >= 70 ? 'text-green-400' : 'text-orange-400'}>
                              {item.bestScore}%
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`badge ${
                              item.completed
                                ? 'bg-green-500/20 text-green-400'
                                : item.attempts > 0
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-white/10 text-gray-400'
                            }`}
                          >
                            {item.completed ? 'Completed' : item.attempts > 0 ? 'In Progress' : 'Not Started'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-xs">
                          {item.lastAttemptAt ? new Date(item.lastAttemptAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-purple-400" />
          Exam Results
        </h2>

        {examsLoading ? (
          <LoadingSpinner />
        ) : !examsData?.exams.length ? (
          <p className="text-gray-400 text-sm text-center py-8">No exams assigned to this user yet.</p>
        ) : (
          <>
            {examsData.summary && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <StatCard icon={ClipboardList} label="Total Exams" value={examsData.summary.total} />
                <StatCard icon={CheckCircle2} label="Completed" value={examsData.summary.completed} color="text-green-400" />
                <StatCard icon={Clock} label="In Progress" value={examsData.summary.inProgress} color="text-yellow-400" />
                <StatCard
                  icon={BarChart3}
                  label="Avg Score"
                  value={examsData.summary.averageScore !== null ? `${examsData.summary.averageScore}%` : '—'}
                />
              </div>
            )}

            <div className="space-y-3">
              {examsData.exams.map((exam) => (
                <ExamResultRow
                  key={exam.assignmentId}
                  exam={exam}
                  expanded={expandedExamId === exam.assignmentId}
                  onToggle={() =>
                    setExpandedExamId(
                      expandedExamId === exam.assignmentId ? null : exam.assignmentId
                    )
                  }
                />
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function ExamResultRow({
  exam,
  expanded,
  onToggle,
}: {
  exam: AdminUserExamResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  const answeredCount = exam.questions.filter((q) => q.answer !== null).length;
  const correctCount = exam.questions.filter((q) => q.passed).length;

  return (
    <div className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{exam.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            Assigned {new Date(exam.assignedAt).toLocaleString()}
            {exam.completedAt && ` · Completed ${new Date(exam.completedAt).toLocaleString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {exam.completedAt ? (
            <span className={`badge ${exam.passed ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
              {exam.score}%
            </span>
          ) : (
            <span className="badge bg-yellow-500/20 text-yellow-400">
              {correctCount}/{exam.questionCount} correct
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/10">
          <p className="text-sm text-gray-400 py-3">
            {answeredCount} of {exam.questionCount} questions attempted
            {exam.completedAt && exam.score !== null && (
              <> · Final score: <span className={exam.passed ? 'text-green-400' : 'text-orange-400'}>{exam.score}%</span></>
            )}
          </p>
          <div className="space-y-2">
            {exam.questions.map((q, i) => (
              <div key={q.id} className="rounded-lg bg-surface-900/50 border border-white/5 p-3">
                <div className="flex items-start gap-2">
                  {q.answer === null ? (
                    <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-1" />
                  ) : q.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-1" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">Q{i + 1}</span>
                      <span className="badge bg-white/10 text-gray-400 text-xs">{q.category}</span>
                      {q.answer !== null && (
                        <span className={`badge text-xs ${q.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {q.passed ? 'Correct' : 'Incorrect'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{q.prompt}</p>
                    {q.answer !== null ? (
                      <p className="font-mono text-xs text-gray-300 mt-2 bg-black/20 rounded px-2 py-1 break-all">
                        {q.answer}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2 italic">Not answered</p>
                    )}
                    {q.submittedAt && (
                      <p className="text-xs text-gray-600 mt-1">
                        Submitted {new Date(q.submittedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
