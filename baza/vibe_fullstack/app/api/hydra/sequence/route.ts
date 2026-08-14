import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAiResponse } from '@/lib/ai';
import { parseAIJson, isPromptInjection } from '@/lib/aiParser';

export const dynamic = 'force-dynamic';

const SequenceRequestSchema = z.object({
  leadMagnetTitle: z.string().min(1, 'Укажите заголовок лид-магнита'),
  productToPitch: z.string().optional(),
  stepCount: z.number().optional().default(3),
});

const SEQUENCE_SYSTEM_PROMPT = `
Ты — Hydra AI Nurturing Sequence Engine. Создаешь цепочку прогревающих сообщений.

ВЫДАВАЙ ТОЛЬКО ЧИСТЫЙ JSON по следующей схеме:

{
  "sequence": [
    {
      "step": 1,
      "delay_hours": 0,
      "title": "Тема первого сообщения",
      "message": "Текст сообщения",
      "button_text": "Текст на кнопке"
    }
  ]
}
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = SequenceRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации данных', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { leadMagnetTitle, productToPitch, stepCount } = validation.data;

    if (isPromptInjection(leadMagnetTitle)) {
      return NextResponse.json(
        { success: false, error: 'Запрещенный ввод' },
        { status: 400 }
      );
    }

    const prompt = `Лид-магнит: ${leadMagnetTitle}\nЦелевой продукт: ${productToPitch || 'Консультация'}\nКоличество сообщений: ${stepCount}`;

    const rawAiText = await generateAiResponse({
      prompt,
      systemPrompt: SEQUENCE_SYSTEM_PROMPT,
      temperature: 0.7,
    });

    const data = parseAIJson(rawAiText);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Hydra API Sequence Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка генерации цепочки прогрева' },
      { status: 500 }
    );
  }
}
