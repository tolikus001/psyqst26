'use client';

import { useState, useEffect } from 'react';
import { useNotibot } from '@/lib/bridge';
import { Sparkles, Send, Bot, RefreshCw } from 'lucide-react';
import { HistoryList, HistoryItem } from '@/components/HistoryList';

export default function Home() {
  const { user } = useNotibot();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success) setHistory(data.history || []);
    } catch (err) {
      console.error('Ошибка загрузки истории:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt: 'Ты — экспертный ИИ-ментор по вайбкодингу. Давай краткие, воодушевляющие и практичные ответы.',
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка генерации');

      setAiResult(data.response);
      setPrompt('');
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при обращении к ИИ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Vibe Fullstack Kit • Level 2</span>
        </div>
        <a
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-400 text-xs font-semibold transition"
        >
          📊 Админка БД (/admin)
        </a>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          Привет, {user?.displayName || 'Вайбкодер'}! 🚀
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Интерактивное Vibe-приложение с ИИ-генератором и базой данных SQLite
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Задай вопрос ИИ-ментору:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Например: Посоветуй 3 фичи для моего приложения..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Отправить</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {aiResult && (
          <div className="mt-6 p-5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-slate-200">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Bot className="w-4 h-4" /> Ответ ИИ:
            </div>
            <p className="whitespace-pre-wrap leading-relaxed">{aiResult}</p>
          </div>
        )}
      </div>

      <HistoryList history={history} onRefresh={loadHistory} />
    </main>
  );
}
