import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAiResponse } from '@/lib/ai';
import { parseAIJson, isPromptInjection } from '@/lib/aiParser';

export const dynamic = 'force-dynamic';

const PersonaRequestSchema = z.object({
  niche: z.string().min(1, 'Укажите нишу'),
  productName: z.string().optional(),
});

const PERSONA_SYSTEM_PROMPT = `
Ты — Hydra AI Persona Engine. Анализируешь целевую аудиторию и генерируешь идей лид-магнитов.

ВЫДАВАЙ ТОЛЬКО ЧИСТЫЙ JSON по следующей схеме:

{
  "avatar_name": "Имя и роль аватара аудитории",
  "pain_points": ["Боль 1", "Боль 2", "Боль 3"],
  "desired_outcome": "Главное желание клиента",
  "lead_magnet_ideas": [
    { "title": "Название 1", "type": "Чек-лист / Гайд / Шаблон", "reason": "Почему это сработает" }
  ]
}
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = PersonaRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации данных', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { niche, productName } = validation.data;

    if (isPromptInjection(niche)) {
      return NextResponse.json(
        { success: false, error: 'Запрещенный ввод' },
        { status: 400 }
      );
    }

    const prompt = `Ниша: ${niche}\nПродукт: ${productName || 'Не указан'}`;

    const rawAiText = await generateAiResponse({
      prompt,
      systemPrompt: PERSONA_SYSTEM_PROMPT,
      temperature: 0.7,
    });

    const data = parseAIJson(rawAiText);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Hydra API Persona Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка генерации персоны' },
      { status: 500 }
    );
  }
}
