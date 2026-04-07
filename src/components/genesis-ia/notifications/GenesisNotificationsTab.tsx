import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCheck, Lightbulb, Megaphone, Rocket, TrendingUp, 
  Gift, Shield, BookOpen, Zap, Filter, X, ChevronRight, Clock
} from 'lucide-react';

export type NotificationCategory = 'tips' | 'updates' | 'news' | 'achievements' | 'system';

export interface SmartNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  detail?: string;
  time: Date;
  read: boolean;
  actionLabel?: string;
  actionTab?: string;
}

interface GenesisNotificationsTabProps {
  onNavigate?: (tab: string) => void;
}

const categoryConfig: Record<NotificationCategory, { icon: typeof Bell; label: string; color: string; bg: string }> = {
  tips: { icon: Lightbulb, label: 'Dicas', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  updates: { icon: Rocket, label: 'Atualizações', color: 'text-sky-400', bg: 'bg-sky-500/15' },
  news: { icon: Megaphone, label: 'Novidades', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  achievements: { icon: Gift, label: 'Conquistas', color: 'text-purple-400', bg: 'bg-purple-500/15' },
  system: { icon: Shield, label: 'Sistema', color: 'text-slate-400', bg: 'bg-slate-500/15' },
};

// Smart notifications engine
function generateSmartNotifications(): SmartNotification[] {
  const now = Date.now();
  return [
    {
      id: 'tip-scanner',
      category: 'tips',
      title: '💡 Dica: Aumente suas conversões',
      message: 'Use o Scanner IA para encontrar empresas sem presença digital na sua região.',
      detail: 'O Scanner IA analisa automaticamente empresas que ainda não possuem site ou redes sociais otimizadas. Filtre por cidade e nicho para encontrar os melhores leads. Empresas sem site convertem até 3x mais quando você oferece uma solução pronta.',
      time: new Date(now - 60000 * 10),
      read: false,
      actionLabel: 'Abrir Scanner',
      actionTab: 'prospects',
    },
    {
      id: 'tip-proposals',
      category: 'tips',
      title: '📊 Dica: Propostas que vendem',
      message: 'Personalize suas propostas com dados reais do cliente para aumentar a taxa de aceite.',
      detail: 'Propostas personalizadas com análise de mercado, concorrentes e oportunidades específicas têm uma taxa de conversão 5x maior. Use o gerador de propostas da Genesis para criar documentos profissionais automaticamente.',
      time: new Date(now - 60000 * 45),
      read: false,
      actionLabel: 'Criar Proposta',
      actionTab: 'prospects',
    },
    {
      id: 'tip-radar',
      category: 'tips',
      title: '🎯 Dica: Radar Global',
      message: 'Ative o Radar para receber leads automaticamente em tempo real.',
      detail: 'O Radar Global monitora constantemente novas oportunidades de negócio e envia alertas quando encontra empresas que precisam de soluções digitais. Configure seus filtros de nicho e região para receber apenas leads relevantes.',
      time: new Date(now - 60000 * 120),
      read: true,
      actionLabel: 'Configurar Radar',
      actionTab: 'radar',
    },
    {
      id: 'update-v3',
      category: 'updates',
      title: '🚀 Nova versão: Motor de Propostas v3',
      message: 'Agora o motor de propostas gera documentos ainda mais completos e profissionais.',
      detail: 'O Motor de Propostas v3 inclui: análise de concorrentes automática, estimativa de ROI para o cliente, design profissional com a marca Genesis, e exportação em PDF de alta qualidade. As propostas agora incluem seções de depoimentos e cases de sucesso.',
      time: new Date(now - 60000 * 60 * 3),
      read: true,
    },
    {
      id: 'update-templates',
      category: 'updates',
      title: '📦 +17 Templates Novos na Biblioteca',
      message: 'Templates profissionais para estética, advocacia, imobiliárias e mais.',
      detail: 'Adicionamos 17 novos templates de alta qualidade para setores específicos: Clínicas de Estética, Escritórios de Advocacia, Imobiliárias, Restaurantes, Academias, Pet Shops e mais. Cada template vem com design responsivo, SEO otimizado e pronto para personalização.',
      time: new Date(now - 60000 * 60 * 8),
      read: true,
      actionLabel: 'Ver Templates',
      actionTab: 'criar-projetos',
    },
    {
      id: 'news-ai',
      category: 'news',
      title: '🤖 Genesis IA: Suporte por Chat',
      message: 'Agora você pode tirar dúvidas diretamente pelo chat com nossa IA.',
      detail: 'O chat de suporte Genesis IA está disponível 24/7 no canto inferior direito do painel. A IA pode ajudar com dúvidas sobre a plataforma, dicas de vendas, configurações e troubleshooting. Para questões complexas, um atendente humano será acionado automaticamente.',
      time: new Date(now - 60000 * 60 * 24),
      read: true,
    },
    {
      id: 'news-contracts',
      category: 'news',
      title: '📝 Contratos Digitais',
      message: 'Gere e envie contratos profissionais diretamente pela plataforma.',
      detail: 'O módulo de Contratos permite criar documentos legais personalizados com dados do cliente, valores, prazos e escopo do projeto. Os contratos podem ser assinados digitalmente e ficam armazenados no seu painel para consulta.',
      time: new Date(now - 60000 * 60 * 48),
      read: true,
      actionLabel: 'Ver Contratos',
      actionTab: 'contracts',
    },
    {
      id: 'achievement-first',
      category: 'achievements',
      title: '🏆 Primeira Conquista!',
      message: 'Parabéns! Você acessou o painel Genesis Hub pela primeira vez.',
      detail: 'Bem-vindo à Genesis Hub! Você deu o primeiro passo para construir um negócio digital de sucesso. Explore todas as ferramentas disponíveis: Scanner IA, Radar Global, Biblioteca de Templates, Gerador de Propostas e muito mais.',
      time: new Date(now - 60000 * 60 * 72),
      read: true,
    },
    {
      id: 'system-welcome',
      category: 'system',
      title: '👋 Bem-vindo à Genesis Hub',
      message: 'Seu painel está configurado e pronto para uso. Explore as ferramentas disponíveis.',
      detail: 'A Genesis Hub é sua central de operações para encontrar clientes, criar projetos e fechar contratos. Comece pelo Scanner IA para encontrar seus primeiros leads, depois use a Biblioteca para criar projetos profissionais. Se precisar de ajuda, use o chat de suporte no canto inferior direito.',
      time: new Date(now - 60000 * 60 * 96),
      read: true,
    },
  ];
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

export function GenesisNotificationsTab({ onNavigate }: GenesisNotificationsTabProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>(generateSmartNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.category === activeFilter);
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
    markRead(id);
  };

  const filters: { key: NotificationCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'tips', label: 'Dicas' },
    { key: 'updates', label: 'Atualizações' },
    { key: 'news', label: 'Novidades' },
    { key: 'achievements', label: 'Conquistas' },
    { key: 'system', label: 'Sistema' },
  ];

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
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo em dia'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f.key
                ? 'bg-sky-500/20 text-sky-400'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {notifications.filter(n => n.category === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-16 text-white/30">
            <Bell className="mb-4 h-12 w-12 opacity-30" />
            <p className="text-sm">Nenhuma notificação nesta categoria</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map(n => {
              const config = categoryConfig[n.category];
              const Icon = config.icon;
              const isExpanded = expandedId === n.id;

              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    !n.read 
                      ? 'border-sky-500/20 bg-sky-500/[0.03]' 
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(n.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                      <Icon className={`h-4.5 w-4.5 ${config.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${!n.read ? 'text-white' : 'text-white/80'}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-400" />}
                      </div>
                      <p className="mt-0.5 text-xs text-white/45 line-clamp-2">{n.message}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-white/30">
                          <Clock className="h-3 w-3" /> {timeAgo(n.time)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`mt-1 h-4 w-4 shrink-0 text-white/20 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 px-4 pb-4 pt-3">
                          {n.detail && (
                            <p className="text-xs leading-relaxed text-white/50">{n.detail}</p>
                          )}
                          {n.actionLabel && n.actionTab && onNavigate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate(n.actionTab!);
                              }}
                              className="mt-3 flex items-center gap-1.5 rounded-lg bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/25"
                            >
                              <Zap className="h-3.5 w-3.5" /> {n.actionLabel}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
