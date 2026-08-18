export interface AssignmentJson {
  title: string;
  objective: string;
  difficulty: number;
  components: string[];
  instructions: string[];
  hint: string;
  starterCode: string;
  solutionCode: string;
  testVariables: string[];
  syntaxConcepts: string[];
  estimatedMinutes?: number;
  topic?: string;
}

export interface ReviewResult {
  score: number;
  passed: boolean;
  feedback: string[];
  mistakes: string[];
  suggestions: string[];
  tests: TestResult[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface SyntaxQuestionSummary {
  id: string;
  order: number;
  category: string;
  prompt: string;
}

export interface SyntaxQuestionDetail extends SyntaxQuestionSummary {
  hint: string;
}

export interface SyntaxQuestionCheckResult {
  passed: boolean;
  message: string;
  tests: TestResult[];
  hint?: string;
}

export interface SyntaxQuestionProgress {
  total: number;
  completedCount: number;
  completedIds: string[];
}

export interface AdminSyntaxQuestion extends SyntaxQuestionDetail {
  patterns: string[];
  failureHint?: string;
}

export interface SyntaxExamSummary {
  id: string;
  title: string;
  questionCount: number;
  questionIds: string[];
  createdAt: string;
  assignedCount: number;
  assignments: SyntaxExamAssignmentInfo[];
}

export interface SyntaxExamAssignmentInfo {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  email: string;
  assignedAt: string;
  completedAt: string | null;
  score: number | null;
  passed: boolean;
}

export interface UserExamListItem {
  assignmentId: string;
  examId: string;
  title: string;
  questionCount: number;
  assignedAt: string;
  completedAt: string | null;
  score: number | null;
  passed: boolean;
  progress: number;
  answeredCount: number;
}

export interface UserExamDetail {
  assignmentId: string;
  examId: string;
  title: string;
  completedAt: string | null;
  score: number | null;
  passed: boolean;
  questions: Array<{
    id: string;
    order: number;
    category: string;
    prompt: string;
    answered: boolean;
    lastAnswer: string | null;
  }>;
}

export interface ExamCheckResult {
  passed: boolean;
  message: string;
  tests: TestResult[];
  examCompleted: boolean;
  score: number | null;
  examPassed: boolean;
  answeredCount: number;
  totalQuestions: number;
}

export interface AdminUserExamQuestion {
  id: string;
  order: number;
  category: string;
  prompt: string;
  answer: string | null;
  passed: boolean;
  submittedAt: string | null;
}

export interface AdminUserExamResult {
  assignmentId: string;
  examId: string;
  title: string;
  questionCount: number;
  assignedAt: string;
  completedAt: string | null;
  score: number | null;
  passed: boolean;
  questions: AdminUserExamQuestion[];
}

export interface AdminUserExamsResponse {
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    averageScore: number | null;
  };
  exams: AdminUserExamResult[];
}

export interface HintResult {
  hint: string;
  level: number;
}

export interface SolutionExplanation {
  explanation: string;
  differences: string[];
  keyConcepts: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  xp: number;
  level: number;
  streak: number;
  completedAssignments: number;
  averageScore: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string | null;
  xp: number;
  level: number;
  completedAssignments: number;
  averageScore: number;
}

export interface AchievementInfo {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  earned: boolean;
  earnedAt?: string;
}

export interface DashboardStats {
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
}

export interface HistoryFilters {
  search?: string;
  topic?: string;
  difficulty?: number;
  sortBy?: 'createdAt' | 'score' | 'difficulty' | 'title';
  sortOrder?: 'asc' | 'desc';
  passed?: boolean;
}

export const TOPICS = [
  'LED',
  'Button',
  'Servo',
  'Ultrasonic',
  'LCD',
  'Temperature',
  'Buzzer',
  'Motors',
  'Loops',
  'Functions',
  'Arrays',
  'Serial',
  'Sensors',
  'Random challenge',
] as const;

/** Assignments that need #include libraries are only offered at this difficulty or higher. */
export const MIN_LIBRARY_DIFFICULTY = 7;

export const LIBRARY_TOPICS = ['Servo'] as const;

export type Topic = (typeof TOPICS)[number];

export const ACHIEVEMENT_DEFINITIONS = [
  { slug: 'first-assignment', name: 'First Assignment', description: 'Complete your first assignment', icon: 'rocket', xpReward: 50 },
  { slug: 'perfect-score', name: 'Perfect Score', description: 'Score 100% on an assignment', icon: 'star', xpReward: 100 },
  { slug: 'seven-day-streak', name: '7 Day Streak', description: 'Maintain a 7-day learning streak', icon: 'flame', xpReward: 200 },
  { slug: 'fifty-assignments', name: '50 Assignments', description: 'Complete 50 assignments', icon: 'trophy', xpReward: 500 },
  { slug: 'servo-master', name: 'Servo Master', description: 'Complete 5 Servo assignments', icon: 'cog', xpReward: 150 },
  { slug: 'sensor-expert', name: 'Sensor Expert', description: 'Complete 5 Sensor assignments', icon: 'activity', xpReward: 150 },
  { slug: 'function-wizard', name: 'Function Wizard', description: 'Complete 5 Functions assignments', icon: 'wand', xpReward: 150 },
] as const;

export function xpForLevel(level: number): number {
  return level * 100;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let totalXpNeeded = 0;
  while (totalXpNeeded + xpForLevel(level) <= xp) {
    totalXpNeeded += xpForLevel(level);
    level++;
  }
  return level;
}

export function xpProgressInLevel(xp: number): { current: number; needed: number; percent: number } {
  const level = levelFromXp(xp);
  let totalXpForPreviousLevels = 0;
  for (let i = 1; i < level; i++) {
    totalXpForPreviousLevels += xpForLevel(i);
  }
  const current = xp - totalXpForPreviousLevels;
  const needed = xpForLevel(level);
  const percent = Math.round((current / needed) * 100);
  return { current, needed, percent };
}
