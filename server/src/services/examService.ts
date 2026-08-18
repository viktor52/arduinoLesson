import { prisma } from '../lib/prisma';
import { getSyntaxQuestionById, SYNTAX_QUESTIONS } from '../data/syntaxQuestions';
import { checkSyntaxQuestionAnswer } from './syntaxQuestionService';

const PASS_THRESHOLD = 70;
const RANDOM_EXAM_QUESTION_COUNT = 10;

function pickRandomQuestionIds(count: number): string[] {
  const pool = SYNTAX_QUESTIONS.map((q) => q.id);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export async function createSyntaxExam(createdById: string, title: string, questionIds: string[]) {
  const validIds = new Set(SYNTAX_QUESTIONS.map((q) => q.id));
  const filtered = questionIds.filter((id) => validIds.has(id));
  if (filtered.length === 0) {
    throw new Error('Select at least one valid question');
  }

  return prisma.syntaxExam.create({
    data: {
      title: title.trim(),
      questionIds: filtered,
      createdById,
    },
  });
}

export async function assignSyntaxExam(
  examId: string,
  options: { userIds?: string[]; assignToAll?: boolean }
) {
  const exam = await prisma.syntaxExam.findUnique({ where: { id: examId } });
  if (!exam) throw new Error('Exam not found');

  let userIds = options.userIds ?? [];
  if (options.assignToAll) {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  }

  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) throw new Error('Select at least one user');

  const results = await Promise.all(
    uniqueIds.map((userId) =>
      prisma.syntaxExamAssignment.upsert({
        where: { examId_userId: { examId, userId } },
        create: { examId, userId },
        update: { assignedAt: new Date(), completedAt: null, score: null, passed: false },
      })
    )
  );

  // Reset answers on re-assign
  await prisma.syntaxExamAnswer.deleteMany({
    where: { assignmentId: { in: results.map((r) => r.id) } },
  });

  return { assignedCount: results.length };
}

export async function assignRandomExamsToStudents(
  createdById: string,
  options: { userIds?: string[]; assignToAll?: boolean } = { assignToAll: true }
) {
  let userIds = options.userIds ?? [];
  if (options.assignToAll) {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, username: true, displayName: true },
    });
    userIds = users.map((u) => u.id);
  }

  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) throw new Error('No students to assign');

  const users = await prisma.user.findMany({
    where: { id: { in: uniqueIds }, role: 'USER' },
    select: { id: true, username: true, displayName: true },
  });

  if (users.length === 0) throw new Error('No students to assign');

  const dateLabel = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  await Promise.all(
    users.map(async (user) => {
      const questionIds = pickRandomQuestionIds(RANDOM_EXAM_QUESTION_COUNT);
      const label = user.displayName || user.username;
      const exam = await prisma.syntaxExam.create({
        data: {
          title: `Random Quiz — ${label} (${dateLabel})`,
          questionIds,
          createdById,
        },
      });

      await prisma.syntaxExamAssignment.create({
        data: { examId: exam.id, userId: user.id },
      });
    })
  );

  return { assignedCount: users.length, questionsPerStudent: RANDOM_EXAM_QUESTION_COUNT };
}

export async function getAdminExams() {
  const exams = await prisma.syntaxExam.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { assignments: true } },
      assignments: {
        include: {
          user: { select: { id: true, username: true, displayName: true, email: true } },
        },
      },
    },
  });

  return exams.map((exam) => ({
    id: exam.id,
    title: exam.title,
    questionCount: exam.questionIds.length,
    questionIds: exam.questionIds,
    createdAt: exam.createdAt.toISOString(),
    assignedCount: exam._count.assignments,
    assignments: exam.assignments.map((a) => ({
      id: a.id,
      userId: a.userId,
      username: a.user.username,
      displayName: a.user.displayName,
      email: a.user.email,
      assignedAt: a.assignedAt.toISOString(),
      completedAt: a.completedAt?.toISOString() ?? null,
      score: a.score,
      passed: a.passed,
    })),
  }));
}

export async function getUserExams(userId: string) {
  const assignments = await prisma.syntaxExamAssignment.findMany({
    where: { userId },
    orderBy: { assignedAt: 'desc' },
    include: {
      exam: true,
      responses: { select: { questionId: true, passed: true } },
    },
  });

  return assignments.map((a) => {
    const answered = a.responses.filter((r) => r.passed).length;
    const total = a.exam.questionIds.length;
    return {
      assignmentId: a.id,
      examId: a.examId,
      title: a.exam.title,
      questionCount: total,
      assignedAt: a.assignedAt.toISOString(),
      completedAt: a.completedAt?.toISOString() ?? null,
      score: a.score,
      passed: a.passed,
      progress: total > 0 ? Math.round((answered / total) * 100) : 0,
      answeredCount: answered,
    };
  });
}

export async function getExamAssignmentForUser(assignmentId: string, userId: string) {
  const assignment = await prisma.syntaxExamAssignment.findFirst({
    where: { id: assignmentId, userId },
    include: {
      exam: true,
      responses: true,
    },
  });

  if (!assignment) return null;

  const questions = assignment.exam.questionIds
    .map((id) => {
      const q = getSyntaxQuestionById(id);
      if (!q) return null;
      const response = assignment.responses.find((r) => r.questionId === id);
      return {
        id: q.id,
        order: q.order,
        category: q.category,
        prompt: q.prompt,
        answered: !!response?.passed,
        lastAnswer: response?.answer ?? null,
      };
    })
    .filter(Boolean);

  return {
    assignmentId: assignment.id,
    examId: assignment.examId,
    title: assignment.exam.title,
    completedAt: assignment.completedAt?.toISOString() ?? null,
    score: assignment.score,
    passed: assignment.passed,
    questions,
  };
}

function mapAssignmentToExamDetail(
  assignment: {
    id: string;
    examId: string;
    assignedAt: Date;
    completedAt: Date | null;
    score: number | null;
    passed: boolean;
    exam: { title: string; questionIds: string[] };
    responses: Array<{
      questionId: string;
      answer: string;
      passed: boolean;
      submittedAt: Date;
    }>;
  }
) {
  const questions = assignment.exam.questionIds
    .map((id) => {
      const q = getSyntaxQuestionById(id);
      if (!q) return null;
      const response = assignment.responses.find((r) => r.questionId === id);
      return {
        id: q.id,
        order: q.order,
        category: q.category,
        prompt: q.prompt,
        answer: response?.answer ?? null,
        passed: !!response?.passed,
        submittedAt: response?.submittedAt.toISOString() ?? null,
      };
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);

  return {
    assignmentId: assignment.id,
    examId: assignment.examId,
    title: assignment.exam.title,
    questionCount: assignment.exam.questionIds.length,
    assignedAt: assignment.assignedAt.toISOString(),
    completedAt: assignment.completedAt?.toISOString() ?? null,
    score: assignment.score,
    passed: assignment.passed,
    questions,
  };
}

export async function getAdminUserExamResults(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) return null;

  const assignments = await prisma.syntaxExamAssignment.findMany({
    where: { userId },
    orderBy: { assignedAt: 'desc' },
    include: {
      exam: true,
      responses: true,
    },
  });

  const exams = assignments.map(mapAssignmentToExamDetail);
  const completed = exams.filter((e) => e.completedAt);
  const averageScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, e) => sum + (e.score ?? 0), 0) / completed.length
        )
      : null;

  return {
    summary: {
      total: exams.length,
      completed: completed.length,
      inProgress: exams.filter((e) => !e.completedAt && e.questions.some((q) => q.answer)).length,
      averageScore,
    },
    exams,
  };
}

export async function submitExamAnswer(
  assignmentId: string,
  userId: string,
  questionId: string,
  answer: string
) {
  const assignment = await prisma.syntaxExamAssignment.findFirst({
    where: { id: assignmentId, userId },
    include: { exam: true, responses: true },
  });

  if (!assignment) throw new Error('Exam assignment not found');
  if (assignment.completedAt) throw new Error('Exam already completed');
  if (!assignment.exam.questionIds.includes(questionId)) {
    throw new Error('Question not part of this exam');
  }

  const question = getSyntaxQuestionById(questionId);
  if (!question) throw new Error('Question not found');

  const result = checkSyntaxQuestionAnswer(question, answer, { examMode: true });

  await prisma.syntaxExamAnswer.upsert({
    where: {
      assignmentId_questionId: { assignmentId, questionId },
    },
    create: {
      assignmentId,
      questionId,
      answer,
      passed: result.passed,
    },
    update: {
      answer,
      passed: result.passed,
      submittedAt: new Date(),
    },
  });

  const allResponses = await prisma.syntaxExamAnswer.findMany({
    where: { assignmentId },
  });

  const totalQuestions = assignment.exam.questionIds.length;
  const passedCount = allResponses.filter((r) => r.passed).length;
  const allAttempted = assignment.exam.questionIds.every((id) =>
    allResponses.some((r) => r.questionId === id)
  );

  let completed = false;
  let score: number | null = null;
  let passed = false;

  if (allAttempted) {
    score = Math.round((passedCount / totalQuestions) * 100);
    passed = score >= PASS_THRESHOLD;
    await prisma.syntaxExamAssignment.update({
      where: { id: assignmentId },
      data: { completedAt: new Date(), score, passed },
    });
    completed = true;
  }

  return {
    passed: result.passed,
    message: result.message,
    tests: result.tests,
    examCompleted: completed,
    score,
    examPassed: passed,
    answeredCount: passedCount,
    totalQuestions,
  };
}
