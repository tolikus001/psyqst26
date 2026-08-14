import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibe';

function checkAuth(req: Request): boolean {
  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader.includes('admin_session=authenticated')) return true;

  const authHeader = req.headers.get('x-admin-password');
  if (authHeader === ADMIN_PASSWORD) return true;

  return false;
}

const deleteSchema = z.object({
  model: z.enum(['aiResponse', 'user']),
  id: z.string().min(1, 'ID записи обязателен'),
});

export async function DELETE(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { success: false, error: '401 Unauthorized: Требуется авторизация админа' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { model, id } = deleteSchema.parse(body);

    if (model === 'aiResponse') {
      await db.aiResponse.delete({ where: { id } });
    } else if (model === 'user') {
      await db.user.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: 'Запись успешно удалена' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка удаления записи' },
      { status: 400 }
    );
  }
}
