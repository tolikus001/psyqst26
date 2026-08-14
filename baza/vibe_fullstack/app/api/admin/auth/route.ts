import { NextResponse } from 'next/server';
import { z } from 'zod';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vibe';

const authSchema = z.object({
  password: z.string().min(1, 'Пароль обязателен'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = authSchema.parse(body);

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Неверный пароль администратора' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Успешная авторизация',
    });

    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка сервера при авторизации' },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const isAuthenticated = cookieHeader.includes('admin_session=authenticated');

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}
