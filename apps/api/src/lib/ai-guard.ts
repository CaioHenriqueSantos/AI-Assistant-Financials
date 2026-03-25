const PROMPT_INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /disregard (all|the) (above|previous)/i,
  /you are now/i,
  /act as/i,
  /pretend (you are|to be)/i,
  /system prompt/i,
  /\[INST\]/i,
];

export function sanitizeUserMessage(message: string): string {
  const maxLength = 2000;
  const truncated = message.slice(0, maxLength);

  if (PROMPT_INJECTION_PATTERNS.some(p => p.test(truncated))) {
    return truncated.replace(/[<>[\]|]/g, "");
  }

  return truncated;
}
