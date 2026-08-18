import { TestResult } from '@arduino/shared';
import { SyntaxQuestion } from '../data/syntaxQuestionBank';
import { stripComments } from './syntaxChecker';

function normalizeLine(line: string): string {
  const trimmed = line.trim();
  // Comment-only answers must not go through stripComments (it would erase the whole line).
  if (trimmed.startsWith('//')) {
    return trimmed.replace(/\s+/g, ' ');
  }
  return stripComments(line).trim().replace(/\s+/g, ' ');
}

function checkSingleLineSyntax(line: string): TestResult[] {
  const tests: TestResult[] = [];

  if (line.includes('\n')) {
    tests.push({
      name: 'Format: one line only',
      passed: false,
      message: 'Write your answer on a single line only',
    });
    return tests;
  }

  const trimmed = line.trim();
  if (!trimmed) {
    tests.push({
      name: 'Format: not empty',
      passed: false,
      message: 'Type your one-line answer before checking',
    });
    return tests;
  }

  const normalized = normalizeLine(line);
  const isComment = trimmed.startsWith('//');
  const isForHeader = /^for\s*\(/.test(normalized);

  if (!isComment && !normalized.endsWith(';') && !isForHeader) {
    tests.push({
      name: 'Syntax: semicolon',
      passed: false,
      message: 'Arduino statements should end with a semicolon (;)',
    });
  } else if (!isComment) {
    tests.push({
      name: 'Syntax: semicolon',
      passed: true,
      message: 'Statement ends correctly',
    });
  }

  const body = isComment ? normalized : normalized.replace(/;+\s*$/, '');
  const opens = (body.match(/\(/g) || []).length;
  const closes = (body.match(/\)/g) || []).length;
  if (opens !== closes) {
    tests.push({
      name: 'Syntax: parentheses',
      passed: false,
      message: `Unbalanced parentheses: ${opens} '(' and ${closes} ')'`,
    });
  } else if (opens > 0 || body.includes('(')) {
    tests.push({
      name: 'Syntax: parentheses',
      passed: true,
      message: 'Parentheses are balanced',
    });
  }

  const dblQuotes = (body.match(/"/g) || []).length;
  if (dblQuotes % 2 !== 0) {
    tests.push({
      name: 'Syntax: string quotes',
      passed: false,
      message: 'Unclosed double-quoted string — every " must have a matching pair',
    });
  }

  const sglQuotes = (body.match(/'/g) || []).length;
  if (sglQuotes % 2 !== 0) {
    tests.push({
      name: 'Syntax: character quotes',
      passed: false,
      message: "Unclosed character literal — every ' must have a matching pair",
    });
  }

  return tests;
}

export function checkSyntaxQuestionAnswer(
  question: SyntaxQuestion,
  answer: string,
  options?: { examMode?: boolean }
): { passed: boolean; tests: TestResult[]; message: string } {
  const syntaxTests = checkSingleLineSyntax(answer);
  const syntaxFailed = syntaxTests.filter((t) => !t.passed);

  if (syntaxFailed.length > 0) {
    return {
      passed: false,
      tests: syntaxTests,
      message: syntaxFailed[0].message,
    };
  }

  const normalized = normalizeLine(answer);
  const patternMatch = question.patterns.some((pattern) => {
    try {
      return new RegExp(pattern, 'i').test(normalized);
    } catch {
      return false;
    }
  });

  const answerTest: TestResult = {
    name: 'Answer',
    passed: patternMatch,
    message: patternMatch
      ? 'Correct!'
      : options?.examMode
        ? 'Incorrect answer. Check your syntax and try again.'
        : question.failureHint || question.hint,
  };

  const tests = [...syntaxTests, answerTest];

  return {
    passed: patternMatch,
    tests,
    message: answerTest.message,
  };
}
