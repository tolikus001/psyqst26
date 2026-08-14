/**
  * Defensive JSON Parser & Security Guard for AI LLM Responses
 */

/**
 * Strips markdown code fences, extracts outer JSON boundaries,
 * cleans trailing commas, and safely parses JSON.
 */
export function parseAIJson<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Получен пустой ответ от ИИ-модели.');
  }

  let cleaned = rawText.trim();

  // Strip markdown code block wrappers (```json ... ``` or ``` ...)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  // Extract JSON payload between outer braces or brackets
  const firstBrace = cleaned.search(/[\{\[]/);
  const lastBrace = cleaned.search(/[\}\]][^\}\]]*$/);

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Remove trailing commas before closing braces/brackets (e.g. , } => })
  cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');

  try {
    return JSON.parse(cleaned) as T;
  } catch (err: any) {
    console.error('[AI Safe Parser Error]:', err.message, '\nRaw text snippet:', rawText.slice(0, 300));
    throw new Error(`ИИ создал некорректный JSON формат: ${err.message}`);
  }
}

/**
 * Guard against prompt injection attacks in user input
 */
export function isPromptInjection(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const blackList = [
    'ignore previous',
    'forget your role',
    'system prompt',
    'you are no longer',
    'new instructions',
    'bypass rules',
    'игнорируй прошлые',
    'забудь свою роль',
    'системный промпт',
  ];
  return blackList.some((item) => lower.includes(item));
}
