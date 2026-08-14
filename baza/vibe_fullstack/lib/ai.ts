import OpenAI from 'openai';

/**
 * Universal AI Provider & Hydra AI LLM Gateway Helper
 * Supports HYDRA_AI_API_KEY / AI_API_KEY, HYDRA_AI_BASE_URL / AI_BASE_URL, HYDRA_AI_MODEL / AI_MODEL
 */
export async function generateAiResponse({
  prompt,
  systemPrompt = "Ты — полезный и вежливый ИИ-помощник.",
  temperature = 0.7,
}: {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.HYDRA_AI_API_KEY || process.env.AI_API_KEY;
  const baseURL = process.env.HYDRA_AI_BASE_URL || process.env.AI_BASE_URL || "https://api.hydra-ai.com/v1";
  const model = process.env.HYDRA_AI_MODEL || process.env.AI_MODEL || "deepseek-v3";

  if (!apiKey) {
    throw new Error(
      "❌ Ошибка: API-ключ HYDRA_AI_API_KEY не найден в файле .env! Пожалуйста, добавьте ваш ключ в .env."
    );
  }

  const client = new OpenAI({
    apiKey,
    baseURL,
  });

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("ИИ отдал пустой ответ.");
  }

  return content;
}
