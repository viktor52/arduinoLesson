import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ListChecks, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { AdminSyntaxQuestion } from '@arduino/shared';
import { adminApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Loading';
import { useDebounce } from '../../hooks/useUtils';

export function AdminQuestionsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: questions, isLoading } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: () => adminApi.getQuestions().then((r) => r.data),
  });

  const categories = useMemo(() => {
    if (!questions) return [];
    return [...new Set(questions.map((q) => q.category))].sort();
  }, [questions]);

  const filtered = useMemo(() => {
    if (!questions) return [];
    return questions.filter((q) => {
      if (category !== 'all' && q.category !== category) return false;
      if (!debouncedSearch) return true;
      const s = debouncedSearch.toLowerCase();
      return (
        q.prompt.toLowerCase().includes(s) ||
        q.hint.toLowerCase().includes(s) ||
        q.category.toLowerCase().includes(s) ||
        q.id.toLowerCase().includes(s)
      );
    });
  }, [questions, category, debouncedSearch]);

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ListChecks className="w-8 h-8 text-purple-400" />
          Question Bank
        </h1>
        <p className="text-gray-400 mt-1">
          Review all {questions?.length ?? 0} syntax practice questions, hints, and accepted answer patterns.
        </p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts, hints, or IDs..."
              className="input-field pl-9 py-2 text-sm w-full"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field py-2 text-sm sm:w-48"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Showing {filtered.length} of {questions?.length ?? 0} questions
        </p>

        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              expanded={expandedId === q.id}
              onToggle={() => setExpandedId((id) => (id === q.id ? null : q.id))}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No questions match your filters.</p>
        )}
      </Card>
    </div>
  );
}

function QuestionRow({
  question: q,
  expanded,
  onToggle,
}: {
  question: AdminSyntaxQuestion;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-xs font-mono text-gray-500 w-10 shrink-0 pt-0.5">#{q.order}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="badge bg-purple-500/20 text-purple-400">{q.category}</span>
            <span className="text-xs text-gray-500 font-mono">{q.id}</span>
          </div>
          <p className="text-sm font-medium">{q.prompt}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 ml-13 space-y-3 border-t border-white/5">
          <div className="pt-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Hint / Example answer</p>
            <p className="text-sm font-mono text-arduino-400 bg-black/20 rounded-lg px-3 py-2">{q.hint}</p>
          </div>
          {q.failureHint && q.failureHint !== q.hint && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Wrong-answer feedback</p>
              <p className="text-sm text-gray-300">{q.failureHint}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Accepted patterns (regex)</p>
            <ul className="space-y-1">
              {q.patterns.map((pattern, i) => (
                <li key={i} className="text-xs font-mono text-gray-400 bg-black/20 rounded px-2 py-1 break-all">
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
