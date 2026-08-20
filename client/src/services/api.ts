import axios from 'axios';
import type {
  AuthResponse,
  AssignmentJson,
  ReviewResult,
  HintResult,
  UserProfile,
  LeaderboardEntry,
  AchievementInfo,
  SyntaxQuestionSummary,
  SyntaxQuestionDetail,
  SyntaxQuestionCheckResult,
  SyntaxQuestionProgress,
  AdminSyntaxQuestion,
  SyntaxExamSummary,
  UserExamListItem,
  UserExamDetail,
  ExamCheckResult,
  AdminUserExamsResponse,
} from '@arduino/shared';

const api = axios.create({
  // Same-origin /api on Vercel; override with VITE_API_URL only for split deployments
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Assignment extends AssignmentJson {
  id: string;
  userId: string;
  savedCode?: string | null;
  solutionRevealed: boolean;
  gradingDisabled: boolean;
  isFavorite: boolean;
  isBookmarked?: boolean;
  isDailyChallenge?: boolean;
  createdAt: string;
  updatedAt: string;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  score: number;
  passed: boolean;
  feedback?: string[];
  mistakes?: string[];
  suggestions?: string[];
  tests?: Array<{ name: string; passed: boolean; message: string }>;
  createdAt: string;
}

export interface DashboardData {
  user: UserProfile & { xpProgress: { current: number; needed: number; percent: number } };
  stats: {
    totalAssignments: number;
    completedCount: number;
    completionPercent: number;
    averageScore: number;
    streak: number;
    recentFeedback: Array<{
      assignmentTitle: string;
      score: number;
      passed: boolean;
      createdAt: string;
    }>;
  };
  recentAssignments: Array<{
    id: string;
    title: string;
    difficulty: number;
    topic: string | null;
    updatedAt: string;
    lastScore: number | null;
    passed: boolean | null;
  }>;
}

export interface HistoryItem {
  id: string;
  title: string;
  objective: string;
  difficulty: number;
  topic: string | null;
  isFavorite: boolean;
  isBookmarked: boolean;
  solutionRevealed: boolean;
  createdAt: string;
  updatedAt: string;
  bestScore: number | null;
  passed: boolean | null;
  submissionCount: number;
}

export interface ReviewResponse extends ReviewResult {
  submissionId: string;
  xpEarned: number;
  newAchievements: string[];
  streak: number;
}

export interface SolutionRevealResponse {
  solutionCode: string;
  explanation: {
    explanation: string;
    differences: string[];
    keyConcepts: string[];
  };
}

export const authApi = {
  register: (data: { email: string; username: string; password: string; displayName?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const userApi = {
  getProfile: () => api.get<UserProfile & { xpProgress: { current: number; needed: number; percent: number }; achievements: AchievementInfo[] }>('/user'),
  updateProfile: (data: { displayName?: string; avatarUrl?: string | null }) =>
    api.put<UserProfile>('/user', data),
  getDashboard: () => api.get<DashboardData>('/user/dashboard'),
};

export const assignmentApi = {
  generate: (data: { difficulty: number; topic?: string }) =>
    api.post<Assignment>('/assignment/generate', data),
  getById: (id: string) => api.get<Assignment>(`/assignment/${id}`),
  saveCode: (id: string, code: string) => api.put(`/assignment/${id}/code`, { code }),
  revealSolution: (id: string) => api.post<SolutionRevealResponse>(`/assignment/${id}/reveal`),
  delete: (id: string) => api.delete(`/assignment/${id}`),
  toggleFavorite: (id: string) => api.post<{ isFavorite: boolean }>(`/assignment/${id}/favorite`),
  toggleBookmark: (id: string) => api.post<{ bookmarked: boolean }>(`/assignment/${id}/bookmark`),
};

export const submissionApi = {
  review: (data: { assignmentId: string; code: string }) =>
    api.post<ReviewResponse>('/submission/review', data),
};

export const hintApi = {
  getHint: (data: { assignmentId: string; code: string; hintLevel?: number }) =>
    api.post<HintResult>('/hint', data),
};

export const historyApi = {
  getAll: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<HistoryItem[]>('/history', { params: Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== undefined)) }),
  getBookmarks: () => api.get<Array<{ id: string; title: string; difficulty: number; topic: string | null; bestScore: number | null }>>('/history/bookmarks'),
  getNotes: () => api.get<Array<{ id: string; title: string; content: string; assignmentId: string | null; createdAt: string; updatedAt: string }>>('/history/notes'),
};

export const leaderboardApi = {
  get: () => api.get<LeaderboardEntry[]>('/leaderboard'),
};

export const dailyApi = {
  get: () => api.get<{ date: string; completed: boolean; score: number | null; assignment: Assignment }>('/daily'),
};

export const notesApi = {
  create: (data: { title: string; content: string; assignmentId?: string }) =>
    api.post('/notes', data),
  update: (id: string, data: { title: string; content: string }) =>
    api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
};

export interface AdminCompletionItem {
  assignmentId: string;
  userId: string;
  username: string;
  displayName: string | null;
  email: string;
  title: string;
  difficulty: number;
  topic: string | null;
  attempts: number;
  completed: boolean;
  bestScore: number | null;
  lastScore: number | null;
  lastAttemptAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AdminCompletionsResponse {
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    totalAttempts: number;
  };
  items: AdminCompletionItem[];
}

export const questionsApi = {
  getAll: () => api.get<SyntaxQuestionSummary[]>('/questions'),
  getProgress: () => api.get<SyntaxQuestionProgress>('/questions/progress'),
  getById: (id: string) => api.get<SyntaxQuestionDetail>(`/questions/${id}`),
  check: (id: string, answer: string) =>
    api.post<SyntaxQuestionCheckResult>(`/questions/${id}/check`, { answer }),
};

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  getUserExams: (userId: string) => api.get<AdminUserExamsResponse>(`/admin/users/${userId}/exams`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getAssignments: () => api.get('/admin/assignments'),
  getCompletions: (params?: { completed?: boolean; userId?: string; search?: string }) =>
    api.get<AdminCompletionsResponse>('/admin/completions', {
      params: {
        ...(params?.completed && { completed: 'true' }),
        ...(params?.userId && { userId: params.userId }),
        ...(params?.search && { search: params.search }),
      },
    }),
  deleteAssignment: (id: string) => api.delete(`/admin/assignments/${id}`),
  generateTemplate: (data: { difficulty: number; topic?: string }) =>
    api.post('/admin/templates/generate', data),
  seedCatalog: () => api.post('/admin/catalog/seed'),
  getAnalytics: () => api.get('/admin/analytics'),
  getQuestions: () => api.get<AdminSyntaxQuestion[]>('/admin/questions'),
  getExams: () => api.get<SyntaxExamSummary[]>('/admin/exams'),
  createExam: (data: { title: string; questionIds: string[] }) =>
    api.post<SyntaxExamSummary>('/admin/exams', data),
  assignExam: (examId: string, data: { userIds?: string[]; assignToAll?: boolean }) =>
    api.post<{ assignedCount: number }>(`/admin/exams/${examId}/assign`, data),
  assignRandomExams: (data?: { userIds?: string[]; assignToAll?: boolean }) =>
    api.post<{ assignedCount: number; questionsPerStudent: number }>('/admin/exams/assign-random', data ?? { assignToAll: true }),
  deleteExam: (id: string) => api.delete(`/admin/exams/${id}`),
};

export const examsApi = {
  getAll: () => api.get<UserExamListItem[]>('/exams'),
  getById: (assignmentId: string) => api.get<UserExamDetail>(`/exams/${assignmentId}`),
  checkAnswer: (assignmentId: string, questionId: string, answer: string) =>
    api.post<ExamCheckResult>(`/exams/${assignmentId}/questions/${questionId}/check`, { answer }),
};

export default api;
