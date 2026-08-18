import { TestResult } from '@arduino/shared';

function stripComments(code: string): string {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Replace string/char literals with placeholders so delimiter checks ignore them. */
function maskStrings(code: string): string {
  return code
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

function countChar(text: string, char: string): number {
  let count = 0;
  for (const c of text) if (c === char) count++;
  return count;
}

function checkBalanced(code: string, open: string, close: string, label: string): TestResult {
  const masked = maskStrings(stripComments(code));
  const opens = countChar(masked, open);
  const closes = countChar(masked, close);

  return {
    name: `Syntax: balanced ${label}`,
    passed: opens === closes,
    message:
      opens === closes
        ? `${label} are balanced (${opens} ${open}${opens !== 1 ? 's' : ''})`
        : `Unbalanced ${label}: ${opens} '${open}' vs ${closes} '${close}'`,
  };
}

function extractFunctionBody(code: string, funcName: string): string | null {
  const clean = stripComments(code);
  const masked = maskStrings(clean);
  const headerMatch = masked.match(new RegExp(`void\\s+${funcName}\\s*\\(\\s*\\)\\s*\\{`));
  if (!headerMatch || headerMatch.index === undefined) return null;

  const start = headerMatch.index + headerMatch[0].length;
  let depth = 1;
  let i = start;

  while (i < masked.length && depth > 0) {
    if (masked[i] === '{') depth++;
    else if (masked[i] === '}') depth--;
    i++;
  }

  if (depth !== 0) return null;

  return clean.slice(start, i - 1);
}

function checkFunctionHasCode(code: string, funcName: string): TestResult {
  const body = extractFunctionBody(code, funcName);
  const bodyCode = body ? stripComments(body).replace(/\s/g, '') : '';

  return {
    name: `Syntax: ${funcName}() contains code`,
    passed: bodyCode.length > 0,
    message:
      bodyCode.length > 0
        ? `${funcName}() has executable code`
        : `${funcName}() is empty — add your code inside the function body`,
  };
}

function checkArduinoStructure(code: string): TestResult[] {
  const clean = stripComments(code);

  const hasSetup = /\bvoid\s+setup\s*\(\s*\)/.test(clean);
  const hasLoop = /\bvoid\s+loop\s*\(\s*\)/.test(clean);

  const setupBodyContent = extractFunctionBody(code, 'setup');
  const loopBodyContent = extractFunctionBody(code, 'loop');
  const setupHasBody = setupBodyContent !== null && stripComments(setupBodyContent).replace(/\s/g, '').length > 0;
  const loopHasBody = loopBodyContent !== null && stripComments(loopBodyContent).replace(/\s/g, '').length > 0;

  return [
    {
      name: 'Syntax: void setup()',
      passed: hasSetup,
      message: hasSetup ? 'setup() function is declared' : 'Missing void setup() — every Arduino sketch needs one',
    },
    {
      name: 'Syntax: void loop()',
      passed: hasLoop,
      message: hasLoop ? 'loop() function is declared' : 'Missing void loop() — every Arduino sketch needs one',
    },
    {
      name: 'Syntax: setup() has body',
      passed: !hasSetup || setupHasBody,
      message: setupHasBody || !hasSetup
        ? 'setup() has a valid body { }'
        : 'setup() is missing its body — add { } with your initialization code',
    },
    {
      name: 'Syntax: loop() has body',
      passed: !hasLoop || loopHasBody,
      message: loopHasBody || !hasLoop
        ? 'loop() has a valid body { }'
        : 'loop() is missing its body — add { } with your main code',
    },
    checkFunctionHasCode(code, 'setup'),
    checkFunctionHasCode(code, 'loop'),
  ];
}

function checkStringLiterals(code: string): TestResult {
  const lines = code.split('\n');
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const withoutComment = line.replace(/\/\/.*$/, '');
    let inString = false;
    let escaped = false;

    for (const ch of withoutComment) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = !inString;
    }

    if (inString) {
      errors.push(`Line ${i + 1}: unclosed string literal`);
    }
  }

  return {
    name: 'Syntax: string literals',
    passed: errors.length === 0,
    message: errors.length === 0 ? 'All string literals are properly closed' : errors[0],
  };
}

function checkIncludes(code: string): TestResult {
  const includes = code.match(/#\s*include\s+[^\n]+/g) || [];
  const invalid = includes.filter((line) => !/#include\s*[<"]/.test(line));

  return {
    name: 'Syntax: #include directives',
    passed: invalid.length === 0,
    message:
      invalid.length === 0
        ? includes.length
          ? '#include directives look valid'
          : 'No #include directives (OK if not needed)'
        : 'Use #include <Library.h> or #include "file.h" format',
  };
}

function checkSemicolons(code: string): TestResult {
  const lines = code.split('\n');
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\/\/.*$/, '').trim();
    if (!line) continue;

    // Skip preprocessor, braces-only, control flow headers, block comments
    if (
      line.startsWith('#') ||
      line === '{' ||
      line === '}' ||
      line.endsWith('{') ||
      /^\}/.test(line) ||
      /^(if|else|for|while|switch|case|default|do)\b/.test(line) ||
      /^(public|private|protected):/.test(line) ||
      /^\*\//.test(line) ||
      /^\/\*/.test(line)
    ) {
      continue;
    }

    // Skip function/method definitions only (not function calls)
    if (/^(void|int|float|double|bool|byte|long|char|unsigned)\s+\w+\s*\([^)]*\)\s*\{?\s*$/.test(line)) continue;

    // Skip lines that are clearly block continuations
    if (line.includes('{') || line.includes('}')) continue;

    if (!line.endsWith(';') && !line.endsWith(',')) {
      errors.push(`Line ${i + 1} may be missing a semicolon`);
      if (errors.length >= 3) break;
    }
  }

  return {
    name: 'Syntax: semicolons',
    passed: errors.length === 0,
    message:
      errors.length === 0
        ? 'Statements appear to end with semicolons'
        : errors.join('; '),
  };
}

function checkInvalidTokens(code: string): TestResult {
  const clean = stripComments(code);
  const issues: string[] = [];

  if (/\bvoid\s+setup\s*\[/.test(clean)) issues.push('setup uses [ ] instead of ( )');
  if (/\bvoid\s+loop\s*\[/.test(clean)) issues.push('loop uses [ ] instead of ( )');
  if (/;\s*;/.test(clean)) issues.push('Double semicolon detected');
  if (/\bint\s+\w+\s*=\s*;/.test(clean)) issues.push('Variable declared without a value');
  if (/\b=\s*=/.test(clean.replace(/==/g, ''))) issues.push('Possible typo: = = instead of ==');

  return {
    name: 'Syntax: common errors',
    passed: issues.length === 0,
    message:
      issues.length === 0
        ? 'No common syntax errors detected'
        : issues.join('; '),
  };
}

function usesSerialOutput(code: string): boolean {
  const clean = stripComments(code);
  return /\bSerial\s*\.\s*(print|println|write)\s*\(/.test(clean);
}

function hasSerialBeginInSetup(code: string): boolean {
  const setupBody = extractFunctionBody(code, 'setup');
  if (!setupBody) return false;
  return /\bSerial\s*\.\s*begin\s*\(/.test(stripComments(setupBody));
}

function usesPinIo(code: string): boolean {
  const clean = stripComments(code);
  return /\b(digitalWrite|digitalRead|analogWrite|analogRead|tone)\s*\(/.test(clean);
}

function hasPinModeInSetup(code: string): boolean {
  const setupBody = extractFunctionBody(code, 'setup');
  if (!setupBody) return false;
  return /\bpinMode\s*\(/.test(stripComments(setupBody));
}

/** Validates Serial.begin() and pinMode() based on what the student's sketch actually uses. */
export function checkArduinoPractices(code: string): TestResult[] {
  const results: TestResult[] = [];
  const requiresSerial = usesSerialOutput(code);

  if (requiresSerial) {
    const hasBegin = hasSerialBeginInSetup(code);
    results.push({
      name: 'Arduino: Serial.begin() in setup()',
      passed: hasBegin,
      message: hasBegin
        ? 'Serial.begin() is called in setup() before printing'
        : 'You use Serial.print/println but forgot Serial.begin() in setup() — the Serial Monitor will show nothing without it',
    });
  }

  const requiresPinMode = usesPinIo(code);

  if (requiresPinMode) {
    const pinModeInSetup = hasPinModeInSetup(code);
    const hasAnyPinMode = /\bpinMode\s*\(/.test(stripComments(code));

    if (!hasAnyPinMode) {
      results.push({
        name: 'Arduino: pinMode() required',
        passed: false,
        message:
          'You use pin I/O (digitalWrite, digitalRead, analogRead, etc.) but never call pinMode() — configure each pin in setup() first',
      });
    } else if (!pinModeInSetup) {
      results.push({
        name: 'Arduino: pinMode() in setup()',
        passed: false,
        message: 'pinMode() must be called in setup(), not in loop() — pins are configured once at startup',
      });
    } else {
      results.push({
        name: 'Arduino: pinMode() in setup()',
        passed: true,
        message: 'pinMode() is correctly called in setup() before pin I/O',
      });
    }
  }

  return results;
}

export function checkSyntax(code: string): TestResult[] {
  if (!code.trim()) {
    return [
      {
        name: 'Syntax: code submitted',
        passed: false,
        message: 'Your sketch is empty — write some code first',
      },
    ];
  }

  return [
    ...checkArduinoStructure(code),
    checkBalanced(code, '{', '}', 'braces'),
    checkBalanced(code, '(', ')', 'parentheses'),
    checkBalanced(code, '[', ']', 'brackets'),
    checkStringLiterals(code),
    checkIncludes(code),
    checkSemicolons(code),
    checkInvalidTokens(code),
  ];
}

export { stripComments };
