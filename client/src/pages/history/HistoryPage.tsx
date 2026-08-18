import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, RotateCcw, Star, Bookmark, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { TOPICS } from '@arduino/shared';
import { historyApi, assignmentApi } from '../../services/api';
import { Card, DifficultyBadge } from '../../components/ui/Card';
import { SkeletonGrid } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useUtils';

export function HistoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'score' | 'difficulty' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const debouncedSearch = useDebounce(search, 300);

  const { data: items, isLoading, error, refetch } = useQuery({
    queryKey: ['history', debouncedSearch, topic, sortBy, sortOrder],
    queryFn: () =>
      historyApi.getAll({
        search: debouncedSearch || undefined,
        topic: topic || undefined,
        sortBy,
        sortOrder,
      }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assignmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success('Assignment deleted');
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: (id: string) => assignmentApi.toggleFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (id: string) => assignmentApi.toggleBookmark(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  });

  if (isLoading) return <SkeletonGrid count={6} />;
  if (error) return <ErrorState message="Failed to load history" onRetry={() => refetch()} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assignment History</h1>
        <p className="text-gray-400 mt-1">Review, redo, and track your progress</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments..."
              className="input-field pl-11"
            />
          </div>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input-field sm:w-48">
            <option value="">All Topics</option>
            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="input-field sm:w-40">
            <option value="createdAt">Date</option>
            <option value="score">Score</option>
            <option value="difficulty">Difficulty</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary"
          >
            <Filter className="w-4 h-4" />
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </Card>

      {!items?.length ? (
        <Card className="text-center py-12">
          <p className="text-gray-400">No assignments found. Generate your first one!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} hover>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                <DifficultyBadge difficulty={item.difficulty} />
              </div>

              <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.objective}</p>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                {item.topic && <span className="badge bg-white/10">{item.topic}</span>}
                {item.bestScore !== null && (
                  <span className={`badge ${item.passed ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {item.bestScore}%
                  </span>
                )}
                <span>{item.submissionCount} attempts</span>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => navigate(`/workspace/${item.id}`)} className="btn-primary flex-1 text-xs py-2">
                  <RotateCcw className="w-3 h-3" /> {item.passed ? 'Review' : 'Continue'}
                </button>
                <button onClick={() => favoriteMutation.mutate(item.id)} className="btn-ghost p-2">
                  <Star className={`w-4 h-4 ${item.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                </button>
                <button onClick={() => bookmarkMutation.mutate(item.id)} className="btn-ghost p-2">
                  <Bookmark className={`w-4 h-4 ${item.isBookmarked ? 'text-arduino-400 fill-arduino-400' : ''}`} />
                </button>
                <button onClick={() => deleteMutation.mutate(item.id)} className="btn-ghost p-2 text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
