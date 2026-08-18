import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ClipboardList, Search, Plus, Users, CheckSquare, Square, Shuffle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { AdminSyntaxQuestion, SyntaxExamSummary } from '@arduino/shared';
import { adminApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Loading';
import { useDebounce } from '../../hooks/useUtils';
import type { AdminUser } from './types';

export function AdminExamsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionCategory, setQuestionCategory] = useState('all');
  const [assignExamId, setAssignExamId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const debouncedQuestionSearch = useDebounce(questionSearch, 300);

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: () => adminApi.getQuestions().then((r) => r.data),
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data as AdminUser[]),
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['admin-exams'],
    queryFn: () => adminApi.getExams().then((r) => r.data),
  });

  const students = useMemo(
    () => (users ?? []).filter((u) => u.role !== 'ADMIN'),
    [users]
  );

  const questionCategories = useMemo(() => {
    if (!questions) return [];
    return [...new Set(questions.map((q) => q.category))].sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    return questions.filter((q) => {
      if (questionCategory !== 'all' && q.category !== questionCategory) return false;
      if (!debouncedQuestionSearch) return true;
      const s = debouncedQuestionSearch.toLowerCase();
      return q.prompt.toLowerCase().includes(s) || q.id.toLowerCase().includes(s);
    });
  }, [questions, questionCategory, debouncedQuestionSearch]);

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createExam({ title, questionIds: [...selectedQuestionIds] }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
      setTitle('');
      setSelectedQuestionIds(new Set());
      setAssignExamId(res.data.id);
      toast.success('Exam created — now assign it to students');
    },
    onError: () => toast.error('Failed to create exam'),
  });

  const randomAssignMutation = useMutation({
    mutationFn: () => adminApi.assignRandomExams({ assignToAll: true }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
      toast.success(
        `Assigned ${res.data.questionsPerStudent} random questions to ${res.data.assignedCount} student(s)`
      );
    },
    onError: () => toast.error('Failed to assign random exams'),
  });

  const assignMutation = useMutation({
    mutationFn: (payload: { examId: string; userIds?: string[]; assignToAll?: boolean }) =>
      adminApi.assignExam(payload.examId, {
        userIds: payload.userIds,
        assignToAll: payload.assignToAll,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-exams'] });
      setSelectedUserIds(new Set());
      toast.success(`Assigned to ${res.data.assignedCount} student(s)`);
    },
    onError: () => toast.error('Failed to assign exam'),
  });

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisibleQuestions = () => {
    setSelectedQuestionIds(new Set(filteredQuestions.map((q) => q.id)));
  };

  const selectAllStudents = () => {
    setSelectedUserIds(new Set(students.map((u) => u.id)));
  };

  if (questionsLoading || examsLoading) return <LoadingSpinner size="lg" />;

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
          <ClipboardList className="w-8 h-8 text-purple-400" />
          Syntax Exams
        </h1>
        <p className="text-gray-400 mt-1">
          Create question exams and assign them to all students or specific users.
        </p>
      </div>

      <Card className="border-purple-500/30 bg-purple-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-purple-400" />
              Quick Random Exam
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Assign 10 random syntax questions to every student. Each student gets their own
              unique set of questions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => randomAssignMutation.mutate()}
            disabled={randomAssignMutation.isPending || students.length === 0}
            className="btn-primary whitespace-nowrap"
          >
            <Shuffle className="w-4 h-4" />
            {randomAssignMutation.isPending
              ? 'Assigning...'
              : `Assign 10 Random to All (${students.length})`}
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4">Create New Exam</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Exam title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Variables Quiz — Week 1"
              className="input-field w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search questions..."
                className="input-field pl-9 py-2 text-sm w-full"
              />
            </div>
            <select
              value={questionCategory}
              onChange={(e) => setQuestionCategory(e.target.value)}
              className="input-field py-2 text-sm sm:w-48"
            >
              <option value="all">All categories</option>
              {questionCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="button" onClick={selectAllVisibleQuestions} className="btn-secondary text-sm whitespace-nowrap">
              Select visible ({filteredQuestions.length})
            </button>
          </div>

          <p className="text-sm text-gray-400">{selectedQuestionIds.size} question(s) selected</p>

          <div className="max-h-64 overflow-y-auto space-y-1 border border-white/10 rounded-xl p-2">
            {filteredQuestions.map((q) => (
              <QuestionPickRow
                key={q.id}
                question={q}
                selected={selectedQuestionIds.has(q.id)}
                onToggle={() => toggleQuestion(q.id)}
              />
            ))}
          </div>

          <button
            onClick={() => createMutation.mutate()}
            disabled={!title.trim() || selectedQuestionIds.size === 0 || createMutation.isPending}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4">Existing Exams</h2>
        {!exams?.length ? (
          <p className="text-gray-400 text-sm text-center py-6">No exams created yet.</p>
        ) : (
          <div className="space-y-4">
            {(exams as SyntaxExamSummary[]).map((exam) => (
              <div key={exam.id} className="rounded-xl bg-white/5 border border-white/5 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {exam.questionCount} questions · {exam.assignedCount} assigned ·{' '}
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignExamId(assignExamId === exam.id ? null : exam.id);
                      setSelectedUserIds(new Set());
                    }}
                    className="btn-secondary text-sm"
                  >
                    <Users className="w-4 h-4" />
                    Assign Students
                  </button>
                </div>

                {assignExamId === exam.id && (
                  <AssignPanel
                    students={students}
                    selectedUserIds={selectedUserIds}
                    onToggleUser={toggleUser}
                    onSelectAll={selectAllStudents}
                    onAssignAll={() =>
                      assignMutation.mutate({ examId: exam.id, assignToAll: true })
                    }
                    onAssignSelected={() =>
                      assignMutation.mutate({
                        examId: exam.id,
                        userIds: [...selectedUserIds],
                      })
                    }
                    assigning={assignMutation.isPending}
                    assignments={exam.assignments}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function QuestionPickRow({
  question,
  selected,
  onToggle,
}: {
  question: AdminSyntaxQuestion;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors ${
        selected ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-white/5'
      }`}
    >
      {selected ? (
        <CheckSquare className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
      ) : (
        <Square className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        <span className="text-xs text-gray-500">#{question.order} · {question.category}</span>
        <p className="text-sm">{question.prompt}</p>
      </div>
    </button>
  );
}

function AssignPanel({
  students,
  selectedUserIds,
  onToggleUser,
  onSelectAll,
  onAssignAll,
  onAssignSelected,
  assigning,
  assignments,
}: {
  students: AdminUser[];
  selectedUserIds: Set<string>;
  onToggleUser: (id: string) => void;
  onSelectAll: () => void;
  onAssignAll: () => void;
  onAssignSelected: () => void;
  assigning: boolean;
  assignments: SyntaxExamSummary['assignments'];
}) {
  const assignedUserIds = new Set(assignments.map((a) => a.userId));

  return (
    <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onSelectAll} className="btn-secondary text-sm">
          Select all students ({students.length})
        </button>
        <button
          type="button"
          onClick={onAssignAll}
          disabled={assigning || students.length === 0}
          className="btn-primary text-sm"
        >
          Assign to all students
        </button>
        <button
          type="button"
          onClick={onAssignSelected}
          disabled={assigning || selectedUserIds.size === 0}
          className="btn-primary text-sm"
        >
          Assign to selected ({selectedUserIds.size})
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1">
        {students.map((u) => {
          const assigned = assignedUserIds.has(u.id);
          const assignment = assignments.find((a) => a.userId === u.id);
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onToggleUser(u.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left ${
                selectedUserIds.has(u.id) ? 'bg-purple-500/15' : 'hover:bg-white/5'
              }`}
            >
              {selectedUserIds.has(u.id) ? (
                <CheckSquare className="w-4 h-4 text-purple-400" />
              ) : (
                <Square className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm flex-1">{u.displayName || u.username}</span>
              <span className="text-xs text-gray-500">{u.email}</span>
              {assigned && (
                <span className={`text-xs badge ${assignment?.completedAt ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {assignment?.completedAt
                    ? `Done ${assignment.score}%`
                    : 'Assigned'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
