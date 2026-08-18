import { AssignmentJson, HintResult, SolutionExplanation } from '@arduino/shared';
import {
  getCatalogAssignment,
  catalogEntryToAssignmentJson,
  MIN_LIBRARY_DIFFICULTY,
  topicNameRequiresLibrary,
} from '../data/assignmentCatalog';
import { reviewAgainstTestVariables } from './codeReviewService';

export function generateAssignment(difficulty: number, topic?: string): AssignmentJson {
  const effectiveDifficulty =
    topic && topicNameRequiresLibrary(topic) && difficulty < MIN_LIBRARY_DIFFICULTY
      ? MIN_LIBRARY_DIFFICULTY
      : difficulty;
  const entry = getCatalogAssignment(effectiveDifficulty, topic);
  return catalogEntryToAssignmentJson(entry);
}

export function generateHint(
  assignment: {
    hint: string;
    objective: string;
    instructions: string[];
    testVariables: string[];
    syntaxConcepts: string[];
    solutionCode?: string;
  },
  studentCode: string,
  hintLevel: number
): HintResult {
  const review = reviewAgainstTestVariables(
    studentCode,
    assignment.testVariables,
    'Assignment',
    assignment.solutionCode
  );
  const missing = review.tests.filter((t) => !t.passed).map((t) => t.name.replace('Uses ', ''));

  if (hintLevel <= 1) {
    return {
      hint: assignment.hint,
      level: 1,
    };
  }

  if (hintLevel === 2) {
    const missingLine = missing.length
      ? ` Focus on defining: ${missing.join(', ')}.`
      : ' You have the required variables — check your setup() and loop() logic.';
    return {
      hint: `${assignment.hint}${missingLine}`,
      level: 2,
    };
  }

  const instruction = assignment.instructions[0] || assignment.objective;
  const concept = assignment.syntaxConcepts[0] || '';
  return {
    hint: `${assignment.hint} Step hint: ${instruction}.${concept ? ` Remember: ${concept}` : ''}${
      missing.length ? ` Still missing in code: ${missing.join(', ')}.` : ''
    }`,
    level: 3,
  };
}

export function explainSolution(
  assignment: {
    title: string;
    objective: string;
    solutionCode: string;
    testVariables: string[];
    syntaxConcepts: string[];
  },
  studentCode: string
): SolutionExplanation {
  const review = reviewAgainstTestVariables(
    studentCode,
    assignment.testVariables,
    assignment.title,
    assignment.solutionCode
  );

  const differences: string[] = review.mistakes;
  if (studentCode.trim() && differences.length === 0) {
    differences.push('Your code includes the required variables — compare logic with the solution.');
  }
  if (!studentCode.trim()) {
    differences.push('You had no saved code — study how the solution declares each required variable.');
  }

  return {
    explanation: `${assignment.objective} The solution demonstrates this using ${assignment.testVariables.join(', ')}. ${assignment.syntaxConcepts.join(' ')}`,
    differences,
    keyConcepts: assignment.syntaxConcepts,
  };
}
