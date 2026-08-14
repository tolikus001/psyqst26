'use client';

import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface DeleteModalProps {
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ loading, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-lg font-bold">Подтверждение удаления</h3>
        </div>
        <p className="text-slate-300 text-sm">
          Вы действительно хотите удалить эту запись из базы данных? Действие нельзя будет отменить.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Удалить из БД
          </button>
        </div>
      </div>
    </div>
  );
}
