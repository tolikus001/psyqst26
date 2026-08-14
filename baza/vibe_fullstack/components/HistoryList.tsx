'use client';

import { Database, RefreshCw } from 'lucide-react';

export interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
}

interface HistoryListProps {
  history: HistoryItem[];
  onRefresh: () => void;
}

export function HistoryList({ history, onRefresh }: HistoryListProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <span>История генераций из SQLite</span>
        </h2>
        <button
          onClick={onRefresh}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Обновить
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-slate-500 text-sm italic">История пока пуста. Отправьте первый запрос!</p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm"
            >
              <div className="text-xs text-indigo-400 font-semibold mb-1">
                Запрос: «{item.prompt}»
              </div>
              <div className="text-slate-300 line-clamp-2">{item.response}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
