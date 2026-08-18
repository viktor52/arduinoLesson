import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Award } from 'lucide-react';
import { leaderboardApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { SkeletonGrid } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAuth } from '../../context/AuthContext';

const rankIcons = [Trophy, Medal, Award];

export function LeaderboardPage() {
  const { user } = useAuth();

  const { data: entries, isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardApi.get().then((r) => r.data),
  });

  if (isLoading) return <SkeletonGrid count={5} />;
  if (error) return <ErrorState message="Failed to load leaderboard" onRetry={() => refetch()} />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-gray-400 mt-1">Top Arduino learners</p>
      </div>

      <div className="space-y-3">
        {entries?.map((entry) => {
          const RankIcon = rankIcons[entry.rank - 1] || Award;
          const isCurrentUser = entry.username === user?.username;

          return (
            <Card
              key={entry.rank}
              className={`flex items-center gap-4 ${isCurrentUser ? 'border-arduino-500/50 bg-arduino-500/5' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                entry.rank <= 3 ? 'bg-yellow-500/20' : 'bg-white/5'
              }`}>
                {entry.rank <= 3 ? (
                  <RankIcon className={`w-5 h-5 ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-300' : 'text-orange-400'}`} />
                ) : (
                  <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold">
                  {entry.displayName || entry.username}
                  {isCurrentUser && <span className="text-xs text-arduino-400 ml-2">(You)</span>}
                </p>
                <p className="text-xs text-gray-500">Level {entry.level} · {entry.completedAssignments} completed</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-arduino-400">{entry.xp} XP</p>
                <p className="text-xs text-gray-500">{entry.averageScore}% avg</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
