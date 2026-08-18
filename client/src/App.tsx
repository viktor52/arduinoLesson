import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout, ProtectedRoute, AdminRoute } from './components/layout/Layout';
import { LandingPage, NotFoundPage } from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { WorkspacePage, WorkspaceRedirect } from './pages/workspace/WorkspacePage';
import { HistoryPage } from './pages/history/HistoryPage';
import { LeaderboardPage } from './pages/leaderboard/LeaderboardPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AdminPage } from './pages/admin/AdminPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import { AdminQuestionsPage } from './pages/admin/AdminQuestionsPage';
import { AdminExamsPage } from './pages/admin/AdminExamsPage';
import { QuestionsPage } from './pages/questions/QuestionsPage';
import { ExamsPage } from './pages/exams/ExamsPage';
import { ExamTakePage } from './pages/exams/ExamTakePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/workspace" element={<ProtectedRoute><Layout><WorkspaceRedirect /></Layout></ProtectedRoute>} />
      <Route path="/workspace/:id" element={<ProtectedRoute><Layout><WorkspacePage /></Layout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><Layout><HistoryPage /></Layout></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Layout><LeaderboardPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/questions" element={<ProtectedRoute><Layout><QuestionsPage /></Layout></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute><Layout><ExamsPage /></Layout></ProtectedRoute>} />
      <Route path="/exams/:assignmentId" element={<ProtectedRoute><Layout><ExamTakePage /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminRoute><Layout><AdminPage /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><Layout><AdminUsersPage /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/users/:userId" element={<ProtectedRoute><AdminRoute><Layout><AdminUserDetailPage /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/questions" element={<ProtectedRoute><AdminRoute><Layout><AdminQuestionsPage /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/exams" element={<ProtectedRoute><AdminRoute><Layout><AdminExamsPage /></Layout></AdminRoute></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
