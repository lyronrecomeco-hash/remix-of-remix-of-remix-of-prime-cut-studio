import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, CheckCheck, Clock, X } from 'lucide-react';

export interface GenesisNotificationItem {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

interface GenesisNotificationsTabProps {
  notifications: GenesisNotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Agora';
  if (m < 60) return `${m} min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

export function GenesisNotificationsTab({ notifications, onMarkAllRead, onClearAll, onMarkRead, onRemove }: GenesisNotificationsTabProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15">
            <Bell className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Notificações</h2>
            <p className="text-xs text-white/50">
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Nenhuma notificação pendente'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Marcar lidas
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" /> Limpar tudo
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-20 text-white/30">
            <Bell className="mb-4 h-14 w-14 opacity-20" />
            <p className="text-sm font-medium">Nenhuma notificação</p>
            <p className="mt-1 text-xs opacity-60">Novas notificações aparecerão aqui automaticamente</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map(n => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`group flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  !n.read
                    ? 'border-sky-500/20 bg-sky-500/[0.04]'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!n.read ? 'bg-sky-500/15' : 'bg-white/5'}`}>
                  <Bell className={`h-4 w-4 ${!n.read ? 'text-sky-400' : 'text-white/30'}`} />
                </div>
                <div className="min-w-0 flex-1" onClick={() => onMarkRead(n.id)} role="button">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${!n.read ? 'text-white' : 'text-white/70'}`}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-400" />}
                  </div>
                  <p className="mt-0.5 text-xs text-white/45">{n.message}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] text-white/25">
                    <Clock className="h-3 w-3" /> {timeAgo(n.time)}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(n.id)}
                  className="shrink-0 rounded-lg p-1 text-white/20 opacity-0 transition-all hover:bg-white/10 hover:text-white/60 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
