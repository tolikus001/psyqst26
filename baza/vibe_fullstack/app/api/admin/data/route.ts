import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibe';

function checkAuth(req: Request): boolean {
  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader.includes('admin_session=authenticated')) return true;

  const authHeader = req.headers.get('x-admin-password');
  if (authHeader === ADMIN_PASSWORD) return true;

  return false;
}

export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { success: false, error: '401 Unauthorized: Требуется авторизация в админ-панели' },
      { status: 401 }
    );
  }

  try {
    const [usersCount, responsesCount, responses, users] = await Promise.all([
      db.user.count(),
      db.aiResponse.count(),
      db.aiResponse.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { displayName: true, photoURL: true, telegramId: true },
          },
        },
      }),
      db.user.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        usersCount,
        responsesCount,
      },
      responses,
      users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка загрузки данных БД' },
      { status: 500 }
    );
  }
}
