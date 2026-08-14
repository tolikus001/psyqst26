import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await db.aiResponse.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error('[API /api/history Error]:', error);
    return NextResponse.json(
      { error: 'Не удалось получить историю' },
      { status: 500 }
    );
  }
}
