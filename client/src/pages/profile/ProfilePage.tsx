import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Save, Award, Flame, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AchievementInfo } from '@arduino/shared';
import { userApi } from '../../services/api';
import { Card, ProgressBar, StatCard } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';

interface ProfileData {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  xp: number;
  level: number;
  streak: number;
  completedAssignments: number;
  averageScore: number;
  xpProgress?: { current: number; needed: number; percent: number };
  achievements?: AchievementInfo[];
}

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then((r) => r.data as ProfileData),
  });

  const updateMutation = useMutation({
    mutationFn: () => userApi.updateProfile({ displayName }),
    onSuccess: (res) => {
      updateUser(res.data);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  const data: ProfileData = (profile || user) as ProfileData;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Target} label="Level" value={data.level} />
        <StatCard icon={Flame} label="Streak" value={`${data.streak} days`} color="text-orange-400" />
        <StatCard icon={Award} label="Completed" value={data.completedAssignments} />
      </div>

      <Card>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-arduino-400" /> Account Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input type="email" value={data.email} disabled className="input-field opacity-50" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <input type="text" value={data.username} disabled className="input-field opacity-50" />
          </div>

          <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="btn-primary">
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4">XP Progress</h2>
        {data.xpProgress && (
          <ProgressBar
            percent={data.xpProgress.percent}
            label={`${data.xpProgress.current} / ${data.xpProgress.needed} XP to Level ${data.level + 1}`}
          />
        )}
        <p className="text-sm text-gray-400 mt-2">Total XP: {data.xp} · Average Score: {data.averageScore}%</p>
      </Card>

      {data.achievements && data.achievements.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" /> Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.achievements.map((a: AchievementInfo) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-medium text-sm">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
