export function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 50000);
}

export function sanitizePromptInput(input: string): string {
  const sanitized = sanitizeInput(input);
  const blockedPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /you\s+are\s+now\s+/gi,
    /system\s*:\s*/gi,
    /\[INST\]/gi,
  ];

  let result = sanitized;
  for (const pattern of blockedPatterns) {
    result = result.replace(pattern, '[filtered]');
  }
  return result;
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeUsername(username: string): string {
  return username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
}
