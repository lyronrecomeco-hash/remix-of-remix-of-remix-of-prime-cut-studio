import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, ExternalLink, UserPlus, AlertTriangle, FileText, Zap } from 'lucide-react';

interface GenesisNotification {
  id: string;
  type: 'lead' | 'system' | 'proposal' | 'alert';
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

interface GenesisNotificationBellProps {
  onViewAll?: () => void;
}

const iconMap = {
  lead: UserPlus,
  system: Zap,
  proposal: FileText,
  alert: AlertTriangle,
};

const colorMap = {
  lead: 'bg-sky-500/20 text-sky-400',
  system: 'bg-emerald-500/20 text-emerald-400',
  proposal: 'bg-amber-500/20 text-amber-400',
  alert: 'bg-red-500/20 text-red-400',
};

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Agora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return date.toLocaleDateString('pt-BR');
}

export function GenesisNotificationBell({ onViewAll }: GenesisNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<GenesisNotification[]>([
    {
      id: '1',
      type: 'system',
      title: 'Bem-vindo à Genesis Hub',
      message: 'Explore o Scanner IA para encontrar seus primeiros clientes.',
      time: new Date(Date.now() - 60000 * 5),
      read: false,
    },
  ]);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl sm:w-96"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-sky-400" />
                  <h3 className="text-sm font-semibold text-white">Notificações</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <CheckCheck className="h-3 w-3" /> Marcar lidas
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-white/40">
                    <Bell className="mb-3 h-10 w-10 opacity-40" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const Icon = iconMap[n.type];
                    return (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5 ${!n.read ? 'bg-sky-500/5' : ''}`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorMap[n.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-medium text-white">{n.title}</p>
                            {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-400" />}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-white/50">{n.message}</p>
                          <p className="mt-1 text-[10px] text-white/30">{timeAgo(n.time)}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {onViewAll && (
                <div className="border-t border-white/10 p-2">
                  <button
                    onClick={() => { setIsOpen(false); onViewAll(); }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/10"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Ver todas
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
