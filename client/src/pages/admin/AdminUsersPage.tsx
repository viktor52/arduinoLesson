import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Trash2, ChevronRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { adminApi } from '../../services/api';
import { Card, Modal } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useUtils';
import type { AdminUser } from './types';

export function AdminUsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data as AdminUser[]),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-completions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      setUserToDelete(null);
      toast.success('User deleted');
    },
    onError: (error) => {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message || 'Failed to delete user'
        : 'Failed to delete user';
      toast.error(message);
    },
  });

  const filteredUsers = (users ?? []).filter((u) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.displayName?.toLowerCase().includes(q) ?? false)
    );
  });

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
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-gray-400 mt-1">Browse all users and view their profiles and assignment progress</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-arduino-400" />
            All Users
            {users && (
              <span className="text-sm font-normal text-gray-500">({filteredUsers.length})</span>
            )}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-9 py-2 text-sm w-full sm:w-72"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            {debouncedSearch ? 'No users match your search.' : 'No users found.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Level</th>
                  <th className="pb-3 pr-4">XP</th>
                  <th className="pb-3 pr-4">Completed</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-arduino-500/30 flex items-center justify-center text-sm font-bold text-arduino-400 shrink-0">
                          {(u.displayName || u.username)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-arduino-400 transition-colors">
                            {u.displayName || u.username}
                          </p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{u.level}</td>
                    <td className="py-3 pr-4 text-arduino-400">{u.xp.toLocaleString()}</td>
                    <td className="py-3 pr-4">{u.completedAssignments}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {currentUser?.id !== u.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(u);
                            }}
                            disabled={deleteUserMutation.isPending}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-arduino-400 transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Delete User?">
        {userToDelete && (
          <>
            <p className="text-gray-300 text-sm mb-2">
              Are you sure you want to permanently delete{' '}
              <span className="text-white font-medium">{userToDelete.displayName || userToDelete.username}</span>
              {' '}({userToDelete.email})?
            </p>
            <p className="text-gray-500 text-sm mb-6">
              This will remove their account, assignments, submissions, and all related progress. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => deleteUserMutation.mutate(userToDelete.id)}
                disabled={deleteUserMutation.isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
