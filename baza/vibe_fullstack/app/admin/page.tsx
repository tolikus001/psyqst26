'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Users, MessageSquare, RefreshCw, ArrowLeft, Terminal, ExternalLink, Search, Trash2, Download } from 'lucide-react';
import { LoginModal } from '@/components/admin/LoginModal';
import { DeleteModal } from '@/components/admin/DeleteModal';

interface AiResponseRecord {
  id: string;
  prompt: string;
  response: string;
  model: string;
  createdAt: string;
}

interface UserRecord {
  id: string;
  displayName?: string;
  telegramId?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'responses' | 'users'>('responses');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ usersCount: 0, responsesCount: 0 });
  const [responses, setResponses] = useState<AiResponseRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModel, setDeleteModel] = useState<'aiResponse' | 'user' | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        loadAdminData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки данных');

      setStats(data.stats || { usersCount: 0, responsesCount: 0 });
      setResponses(data.responses || []);
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить данные из БД');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleDeleteRecord = async () => {
    if (!deletingId || !deleteModel) return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/admin/crud', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: deleteModel, id: deletingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка удаления');

      setDeletingId(null);
      setDeleteModel(null);
      loadAdminData();
    } catch (err: any) {
      alert(`Ошибка при удалении: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const exportToCSV = (data: Record<string, any>[], filename: string) => {
    if (!data || data.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(f => `"${String(row[f] ?? '').replace(/"/g, '""')}"`).join(','))
    ];

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredResponses = responses.filter(r => 
    r.prompt.toLowerCase().includes(search.toLowerCase()) || r.response.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    (u.displayName || '').toLowerCase().includes(search.toLowerCase()) || (u.telegramId || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mr-2" /> Проверка сессии...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal onSuccess={() => { setIsAuthenticated(true); loadAdminData(); }} />;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition mb-2">
            <ArrowLeft className="w-4 h-4" /> На главную
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Database className="w-8 h-8 text-indigo-500" />
            <span>Админ-панель БД (No-SQL)</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Просмотр, управление и экспорт данных SQLite</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(activeTab === 'responses' ? responses : users, activeTab)} className="bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition cursor-pointer">
            <Download className="w-4 h-4" /> Скачать CSV
          </button>
          <button onClick={loadAdminData} disabled={loading} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 rounded-2xl p-5 mb-8 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Terminal className="w-4 h-4" /> Визуальный GUI БД (Prisma Studio)
          </div>
          <p className="text-sm text-slate-300">Запусти в терминале: <code className="bg-slate-950 px-2 py-0.5 rounded text-indigo-300">npx prisma studio</code></p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" /> http://localhost:5555
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.responsesCount}</div>
            <div className="text-xs text-slate-400">Запросов к ИИ в базе</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.usersCount}</div>
            <div className="text-xs text-slate-400">Пользователей в базе</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
            <button onClick={() => setActiveTab('responses')} className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeTab === 'responses' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              Ответы ИИ ({responses.length})
            </button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              Пользователи ({users.length})
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
          </div>
        </div>

        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">⚠️ {error}</div>}

        {activeTab === 'responses' ? (
          <div className="space-y-4">
            {filteredResponses.length === 0 ? <div className="text-center py-12 text-slate-500 text-sm">Записей не найдено</div> : (
              filteredResponses.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-indigo-400">{item.model}</span>
                    <div className="flex items-center gap-3">
                      <span>{new Date(item.createdAt).toLocaleString('ru-RU')}</span>
                      <button onClick={() => { setDeletingId(item.id); setDeleteModel('aiResponse'); }} className="text-slate-500 hover:text-red-400 transition cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-200"><span className="text-slate-500 mr-2">Вопрос:</span>{item.prompt}</div>
                  <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800/80 leading-relaxed whitespace-pre-wrap">{item.response}</div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.length === 0 ? <div className="text-center py-12 text-slate-500 text-sm">Пользователи не найдены</div> : (
              filteredUsers.map((u) => (
                <div key={u.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-200 text-sm">{u.displayName || 'Без имени'}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {u.id}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString('ru-RU')}</span>
                    <button onClick={() => { setDeletingId(u.id); setDeleteModel('user'); }} className="text-slate-500 hover:text-red-400 transition cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {deletingId && <DeleteModal loading={deleteLoading} onConfirm={handleDeleteRecord} onCancel={() => { setDeletingId(null); setDeleteModel(null); }} />}
    </main>
  );
}
