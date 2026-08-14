'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, KeyRound } from 'lucide-react';

interface LoginModalProps {
  onSuccess: () => void;
}

export function LoginModal({ onSuccess }: LoginModalProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Неверный пароль');

      setPasswordInput('');
      onSuccess();
    } catch (err: any) {
      setAuthError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-center mb-2">Вход в Админку БД</h1>
        <p className="text-xs text-slate-400 text-center mb-6">
          Защищено для деплоя на Amvera. Введите `ADMIN_PASSWORD` из файла `.env` (по умолчанию: <code className="text-indigo-300 font-mono">vibe</code>).
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Пароль администратора:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Введите пароль..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition"
                autoFocus
              />
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              ⚠️ {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition cursor-pointer text-sm"
          >
            {loading ? 'Проверка...' : 'Войти в админку'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition">
            ← Вернуться на главный сайт
          </Link>
        </div>
      </div>
    </main>
  );
}
