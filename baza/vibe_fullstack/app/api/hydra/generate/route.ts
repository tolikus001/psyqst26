import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAiResponse } from '@/lib/ai';
import { parseAIJson, isPromptInjection } from '@/lib/aiParser';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const HydraRequestSchema = z.object({
  niche: z.string().min(1, 'Укажите нишу'),
  topic: z.string().min(1, 'Укажите тему'),
  audience: z.string().optional(),
  userId: z.string().optional(),
});

const HYDRA_SYSTEM_PROMPT = `
Ты — Hydra AI, экспертный маркетолог и разработчик контента.
Твоя задача — сгенерировать структурированный лид-магнит в формате JSON.

ВЫДАВАЙ ТОЛЬКО ЧИСТЫЙ JSON по следующей схеме (без вводного текста и комментариев):

{
  "title": "Заголовок лид-магнита",
  "subtitle": "Подзаголовок с обещанием результата",
  "target_audience": "Описание целевой аудитории",
  "read_time_minutes": 5,
  "sections": [
    {
      "id": "sec_1",
      "title": "Название раздела",
      "intro": "Вводный абзац",
      "text": "Основной текст раздела",
      "bullets": [
        { "text": "Ключевая мысль 1", "description": "Пояснение" }
      ],
      "checklist": [
        { "text": "Действие 1", "checked": false }
      ],
      "quote": "Инсайт или цитата",
      "summary": "Главный вывод раздела"
    }
  ]
}
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Zod Validation
    const validation = HydraRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации данных', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { niche, topic, audience, userId } = validation.data;

    // Prompt Injection Check
    if (isPromptInjection(niche) || isPromptInjection(topic)) {
      return NextResponse.json(
        { success: false, error: 'Обнаружены запрещенные фразы в запросе.' },
        { status: 400 }
      );
    }

    const prompt = `Ниша: ${niche}\nТема лид-магнита: ${topic}\nЦелевая аудитория: ${audience || 'Общая'}`;

    // Call AI provider
    const rawAiText = await generateAiResponse({
      prompt,
      systemPrompt: HYDRA_SYSTEM_PROMPT,
      temperature: 0.7,
    });

    // Safely parse JSON
    const data = parseAIJson(rawAiText);

    // Save into Prisma DB
    await db.aiResponse.create({
      data: {
        prompt,
        systemPrompt: HYDRA_SYSTEM_PROMPT,
        response: JSON.stringify(data),
        userId: userId || null,
        model: process.env.AI_MODEL || 'gpt-4o-mini',
      },
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Hydra API Generate Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка сервера Hydra AI' },
      { status: 500 }
    );
  }
}
