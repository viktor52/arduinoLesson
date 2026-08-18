import { ReviewResult, TestResult } from '@arduino/shared';
import { checkSyntax, checkArduinoPractices, stripComments } from './syntaxChecker';

function hasVariableUsage(code: string, name: string): boolean {
  const clean = stripComments(code);

  const declaration = new RegExp(
    `\\b(?:const|int|long|float|double|char|byte|bool|unsigned|Servo|String)\\s+[\\w\\s\\[\\]*]*\\b${name}\\b`
  );
  const assignment = new RegExp(`\\b${name}\\s*=`);
  const arrayDecl = new RegExp(`\\b${name}\\s*\\[`);
  const arrayAccess = new RegExp(`\\b${name}\\s*\\[`);

  return (
    declaration.test(clean) ||
    assignment.test(clean) ||
    arrayDecl.test(clean) ||
    arrayAccess.test(clean)
  );
}

function hasFunctionUsage(code: string, name: string): boolean {
  const clean = stripComments(code);
  const definition = new RegExp(`\\b(?:void|int|float|double|bool|byte|long)\\s+${name}\\s*\\(`);
  const call = new RegExp(`\\b${name}\\s*\\(`);
  return definition.test(clean) && call.test(clean);
}

function buildVariableTests(studentCode: string, testVariables: string[]): TestResult[] {
  return testVariables.map((variable) => {
    const isFunction = variable === 'blinkLed' || variable.includes('()');
    const name = variable.replace('()', '');

    let passed = false;
    let message = '';

    if (isFunction) {
      passed = hasFunctionUsage(studentCode, name);
      message = passed
        ? `Function ${name}() is defined and called`
        : `Define function ${name}() and call it in your code`;
    } else if (name === 'ledPins') {
      passed = hasVariableUsage(studentCode, name);
      message = passed
        ? `Array ${name}[] is declared and used`
        : `Declare ledPins[] array and use it in a loop`;
    } else {
      passed = hasVariableUsage(studentCode, name);
      message = passed
        ? `Variable ${name} is declared and used in code`
        : `Declare and use variable ${name} (not just in a comment)`;
    }

    return { name: `Variable: ${variable}`, passed, message };
  });
}

function buildStructuralFailureSummary(failed: TestResult[]): string {
  const topics: string[] = [];
  if (failed.some((t) => t.name.includes('setup()') || t.name.startsWith('Syntax:'))) {
    topics.push('setup');
  }
  if (failed.some((t) => t.name.includes('Serial'))) {
    topics.push('Serial');
  }
  if (failed.some((t) => t.name.includes('pinMode') || t.name.includes('pin I/O'))) {
    topics.push('pin configuration');
  }
  if (topics.length === 0) {
    return 'Fix the issues below before resubmitting.';
  }
  return `Fix the issues below before resubmitting — ${topics.join(' and ')} must be correct.`;
}

export function reviewAgainstTestVariables(
  studentCode: string,
  testVariables: string[],
  assignmentTitle: string,
  solutionCode?: string
): ReviewResult {
  const syntaxTests = checkSyntax(studentCode);
  const practiceTests = checkArduinoPractices(studentCode);
  const variableTests = buildVariableTests(studentCode, testVariables);
  const tests = [...syntaxTests, ...practiceTests, ...variableTests];

  const structuralFailed = [...syntaxTests, ...practiceTests].filter((t) => !t.passed);
  const syntaxPassed = [...syntaxTests, ...practiceTests].filter((t) => t.passed);
  const variablePassed = variableTests.filter((t) => t.passed);
  const variableFailed = variableTests.filter((t) => !t.passed);

  const hasSyntaxErrors = structuralFailed.length > 0;

  let score: number;
  let passed: boolean;

  if (hasSyntaxErrors) {
    score = 0;
    passed = false;
  } else {
    const passedCount = tests.filter((t) => t.passed).length;
    score = tests.length ? Math.round((passedCount / tests.length) * 100) : 0;
    passed = score >= 70;
  }

  const feedback: string[] = [
    ...syntaxPassed.map((t) => t.message),
    ...variablePassed.map((t) => t.message),
  ];

  const mistakes: string[] = hasSyntaxErrors
    ? [buildStructuralFailureSummary(structuralFailed), ...structuralFailed.map((t) => t.message)]
    : [...structuralFailed.map((t) => t.message), ...variableFailed.map((t) => t.message)];

  const suggestions: string[] = [];
  if (hasSyntaxErrors) {
    suggestions.push('Fix all syntax errors first — your score will remain 0% until syntax is correct.');
  }
  if (variableFailed.length > 0 && !hasSyntaxErrors) {
    suggestions.push(`Review the required variables for "${assignmentTitle}" and write real declarations for each one.`);
  }
  if (mistakes.length === 0 || (!hasSyntaxErrors && variableFailed.length === 0)) {
    if (!hasSyntaxErrors) {
      suggestions.push('Excellent work — syntax and required variables look good!');
    }
  }

  return {
    score,
    passed,
    feedback: feedback.length ? feedback : ['Keep going — write your Arduino sketch.'],
    mistakes,
    suggestions,
    tests,
  };
}
