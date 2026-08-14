import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAiResponse } from '@/lib/ai';
import { parseAIJson, isPromptInjection } from '@/lib/aiParser';

export const dynamic = 'force-dynamic';

const AuthorRequestSchema = z.object({
  authorInfo: z.object({
    name: z.string().min(1, 'Укажите имя автора'),
    position: z.string().optional(),
    raw_bio: z.string().optional(),
  }),
});

const AUTHOR_SYSTEM_PROMPT = `
Ты — Hydra AI Author Engine. Создаешь структурированную карточку автора.

ВЫДАВАЙ ТОЛЬКО ЧИСТЫЙ JSON по следующей схеме:

{
  "name": "Имя автора",
  "title": "Должность / Специализация",
  "short_bio": "Краткое био (1-2 предложения)",
  "achievements": [
    "Достижение 1",
    "Достижение 2"
  ]
}
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = AuthorRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации данных', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { authorInfo } = validation.data;

    if (isPromptInjection(authorInfo.name) || isPromptInjection(authorInfo.raw_bio || '')) {
      return NextResponse.json(
        { success: false, error: 'Запрещенный ввод' },
        { status: 400 }
      );
    }

    const prompt = `Имя: ${authorInfo.name}\nДолжность: ${authorInfo.position || 'Не указана'}\nО себе: ${authorInfo.raw_bio || 'Опытный эксперт'}`;

    const rawAiText = await generateAiResponse({
      prompt,
      systemPrompt: AUTHOR_SYSTEM_PROMPT,
      temperature: 0.7,
    });

    const data = parseAIJson(rawAiText);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Hydra API Author Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка генерации карточки автора' },
      { status: 500 }
    );
  }
}
