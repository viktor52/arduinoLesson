import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, FileCode, BarChart3, Trash2, Sparkles, ChevronRight, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { Card, StatCard } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Loading';

export function AdminPage() {
  const queryClient = useQueryClient();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data),
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['admin-assignments'],
    queryFn: () => adminApi.getAssignments().then((r) => r.data),
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-completions'] });
      toast.success('Assignment deleted');
    },
  });

  const generateTemplateMutation = useMutation({
    mutationFn: () => adminApi.generateTemplate({ difficulty: 5, topic: 'LED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      toast.success('Assignment added from catalog');
    },
  });

  if (analyticsLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview and assignment management</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={analytics.userCount} />
          <StatCard icon={FileCode} label="Assignments" value={analytics.assignmentCount} />
          <StatCard icon={BarChart3} label="Submissions" value={analytics.submissionCount} />
          <StatCard icon={Users} label="New This Week" value={analytics.newUsersThisWeek} subtext={`Avg score: ${analytics.averageScore}%`} />
        </div>
      )}

      <Link to="/admin/users" className="block group">
        <Card className="hover:border-arduino-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-arduino-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-arduino-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold group-hover:text-arduino-400 transition-colors">Manage Users</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  View all users, profiles, and assignment progress
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-arduino-400 transition-colors" />
          </div>
        </Card>
      </Link>

      <Link to="/admin/questions" className="block group">
        <Card className="hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <ListChecks className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold group-hover:text-purple-400 transition-colors">Question Bank</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Review all 200 syntax questions, hints, and answer patterns
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
          </div>
        </Card>
      </Link>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-arduino-400" /> Assignment Catalog
          </h2>
          <button onClick={() => generateTemplateMutation.mutate()} disabled={generateTemplateMutation.isPending} className="btn-primary text-sm">
            Add from Catalog
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileCode className="w-5 h-5" /> Recent Assignments
        </h2>
        {assignmentsLoading ? <LoadingSpinner /> : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(assignments as Array<{ id: string; title: string; difficulty: number; user?: { username: string } }>)?.slice(0, 20).map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-gray-500">Level {a.difficulty} · {a.user?.username}</p>
                </div>
                <button onClick={() => deleteAssignmentMutation.mutate(a.id)} className="btn-ghost p-1 text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
