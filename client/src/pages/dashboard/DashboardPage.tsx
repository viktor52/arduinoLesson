import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Sparkles, Flame, Target, TrendingUp, Play, ChevronRight, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TOPICS, MIN_LIBRARY_DIFFICULTY, LIBRARY_TOPICS } from '@arduino/shared';
import { userApi, assignmentApi, dailyApi } from '../../services/api';
import { Card, StatCard, ProgressBar, DifficultyBadge } from '../../components/ui/Card';
import { SkeletonGrid } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [difficulty, setDifficulty] = useState(0);
  const [topic, setTopic] = useState<string>('LED');

  const availableTopics = TOPICS.filter(
    (t) => difficulty >= MIN_LIBRARY_DIFFICULTY || !(LIBRARY_TOPICS as readonly string[]).includes(t)
  );

  useEffect(() => {
    if (difficulty < MIN_LIBRARY_DIFFICULTY && (LIBRARY_TOPICS as readonly string[]).includes(topic)) {
      setTopic('LED');
    }
  }, [difficulty, topic]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => userApi.getDashboard().then((r) => r.data),
  });

  const { data: dailyChallenge } = useQuery({
    queryKey: ['daily'],
    queryFn: () => dailyApi.get().then((r) => r.data),
  });

  const generateMutation = useMutation({
    mutationFn: () => assignmentApi.generate({ difficulty, topic }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Assignment generated!');
      navigate(`/workspace/${res.data.id}`);
    },
    onError: () => toast.error('Failed to generate assignment'),
  });

  if (isLoading) return <SkeletonGrid count={4} />;
  if (error || !data) return <ErrorState message="Failed to load dashboard" onRetry={() => refetch()} />;

  const { user, stats, recentAssignments } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold">
          Welcome back, {user.displayName || user.username}! 👋
        </h1>
        <p className="text-gray-400 mt-1">Ready to learn something new today?</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Level" value={user.level} subtext={`${user.xp} XP total`} />
        <StatCard icon={Flame} label="Streak" value={`${stats.streak} days`} color="text-orange-400" />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${stats.averageScore}%`} />
        <StatCard icon={Sparkles} label="Completed" value={`${stats.completionPercent}%`} subtext={`${stats.completedCount}/${stats.totalAssignments} assignments`} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">XP Progress</h2>
          <span className="text-sm text-gray-400">Level {user.level}</span>
        </div>
        <ProgressBar
          percent={user.xpProgress.percent}
          label={`${user.xpProgress.current} / ${user.xpProgress.needed} XP to next level`}
        />
      </Card>

      {dailyChallenge && !dailyChallenge.completed && (
        <Card hover className="border-arduino-500/30 bg-arduino-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-arduino-500/20">
                <Calendar className="w-6 h-6 text-arduino-400" />
              </div>
              <div>
                <h3 className="font-bold">Daily Challenge</h3>
                <p className="text-sm text-gray-400">{dailyChallenge.assignment?.title}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/workspace/${dailyChallenge.assignment?.id}`)}
              className="btn-primary"
            >
              Start <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-arduino-400" />
            Generate New Assignment
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Difficulty: {difficulty === 0 ? 'Foundations' : `${difficulty}/10`}
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full accent-arduino-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Foundations</span>
                <span>Expert</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-field"
              >
                {availableTopics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="btn-primary w-full"
            >
              <Sparkles className="w-4 h-4" />
              {generateMutation.isPending ? 'Generating...' : 'Generate Assignment'}
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-4">Continue Learning</h2>
          {recentAssignments.length === 0 ? (
            <p className="text-gray-400 text-sm">No assignments yet. Generate your first one!</p>
          ) : (
            <div className="space-y-3">
              {recentAssignments.slice(0, 3).map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/workspace/${a.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
                >
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <DifficultyBadge difficulty={a.difficulty} />
                      {a.lastScore !== null && (
                        <span className="text-xs text-gray-400">{a.lastScore}%</span>
                      )}
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-arduino-400" />
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {stats.recentFeedback.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold mb-4">Recent Feedback</h2>
          <div className="space-y-2">
            {stats.recentFeedback.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm">{f.assignmentTitle}</span>
                <span className={`badge ${f.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {f.score}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
