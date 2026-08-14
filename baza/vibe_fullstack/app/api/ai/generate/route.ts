import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAiResponse } from '@/lib/ai';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  prompt: z.string().min(1, 'Введите сообщение').max(2000, 'Сообщение слишком длинное'),
  systemPrompt: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Zod Validation
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: ' Ошибка валидации данных', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { prompt, systemPrompt, userId } = validation.data;

    // Call AI provider securely on backend
    const aiText = await generateAiResponse({
      prompt,
      systemPrompt,
    });

    // Save prompt and response history into Prisma SQLite
    const savedRecord = await db.aiResponse.create({
      data: {
        prompt,
        systemPrompt,
        response: aiText,
        userId: userId || null,
        model: process.env.AI_MODEL || 'gpt-4o-mini',
      },
    });

    return NextResponse.json({
      success: true,
      response: aiText,
      id: savedRecord.id,
    });
  } catch (error: any) {
    console.error('[API /api/ai/generate Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
