import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import type { UserExamListItem } from '@arduino/shared';
import { examsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, ProgressBar } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Loading';

export function ExamsPage() {
  const { user } = useAuth();
  const { data: exams, isLoading } = useQuery({
    queryKey: ['user-exams'],
    queryFn: () => examsApi.getAll().then((r) => r.data),
    enabled: user?.role !== 'ADMIN',
  });

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/exams" replace />;
  }

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-arduino-400" />
          My Exams
        </h1>
        <p className="text-gray-400 mt-1">
          Assigned syntax exams from your instructor. Complete each question to finish the exam.
        </p>
      </div>

      {!exams?.length ? (
        <Card>
          <p className="text-gray-400 text-center py-8">No exams assigned yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {(exams as UserExamListItem[]).map((exam) => (
            <Link key={exam.assignmentId} to={`/exams/${exam.assignmentId}`} className="block group">
              <Card className="hover:border-arduino-500/30 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold group-hover:text-arduino-400 transition-colors">
                        {exam.title}
                      </h2>
                      {exam.completedAt ? (
                        <span className={`badge ${exam.passed ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          {exam.score}%
                        </span>
                      ) : (
                        <span className="badge bg-yellow-500/20 text-yellow-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          In progress
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {exam.questionCount} questions · Assigned {new Date(exam.assignedAt).toLocaleDateString()}
                    </p>
                    {!exam.completedAt && (
                      <div className="mt-3">
                        <ProgressBar
                          percent={exam.progress}
                          label={`${exam.answeredCount}/${exam.questionCount} correct`}
                        />
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-arduino-400 shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
