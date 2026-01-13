import { useState } from 'react';
import { 
  History, 
  Search, 
  Eye, 
  Send, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Sparkles,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Prospect, ProspectStatus } from '../types';

interface HistoryPanelProps {
  prospects: Prospect[];
  loading: boolean;
  analyzing: boolean;
  sending: boolean;
  onAnalyze: (id: string) => void;
  onSend: (id: string) => void;
  onView: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ProspectStatus) => void;
  onClose: () => void;
}

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', icon: <Clock className="w-3 h-3" /> },
  analyzing: { label: 'Analisando', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', icon: <Sparkles className="w-3 h-3 animate-pulse" /> },
  analyzed: { label: 'Analisado', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30', icon: <Search className="w-3 h-3" /> },
  proposal_ready: { label: 'Pronto', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30', icon: <CheckCircle className="w-3 h-3" /> },
  sent: { label: 'Enviada', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: <Send className="w-3 h-3" /> },
  replied: { label: 'Respondeu', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30', icon: <MessageCircle className="w-3 h-3" /> },
  converted: { label: 'Convertido', color: 'bg-green-500/10 text-green-500 border-green-500/30', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rejeitado', color: 'bg-gray-500/10 text-gray-500 border-gray-500/30', icon: <XCircle className="w-3 h-3" /> },
  failed: { label: 'Falhou', color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
};

export const HistoryPanel = ({
  prospects,
  loading,
  analyzing,
  sending,
  onAnalyze,
  onSend,
  onView,
  onDelete,
  onUpdateStatus,
  onClose,
}: HistoryPanelProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'all'>('all');

  const filtered = prospects.filter(p => {
    const matchesSearch = 
      p.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.niche?.toLowerCase().includes(search.toLowerCase())) ||
      (p.company_city?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: prospects.length,
    pending: prospects.filter(p => p.status === 'pending').length,
    sent: prospects.filter(p => p.status === 'sent').length,
    converted: prospects.filter(p => p.status === 'converted').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          <p className="text-sm text-yellow-600">Pendentes</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-500">{stats.sent}</p>
          <p className="text-sm text-blue-600">Enviados</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-500">{stats.converted}</p>
          <p className="text-sm text-green-600">Convertidos</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, nicho ou cidade..."
            className="pl-10 bg-background"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              {statusFilter === 'all' ? 'Todos' : STATUS_CONFIG[statusFilter]?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              Todos
            </DropdownMenuItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <DropdownMenuItem key={key} onClick={() => setStatusFilter(key as ProspectStatus)}>
                <span className="flex items-center gap-2">
                  {config.icon}
                  {config.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-lg font-medium">Nenhum prospect encontrado</p>
          <p className="text-sm">Use a busca de clientes para adicionar prospects</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {filtered.map((prospect) => {
              const statusConfig = STATUS_CONFIG[prospect.status];
              const canAnalyze = prospect.status === 'pending';
              const canSend = (prospect.status === 'proposal_ready' || prospect.status === 'analyzed') && prospect.company_phone;

              return (
                <div
                  key={prospect.id}
                  className="bg-card border border-border rounded-xl p-4 hover:border-emerald-500/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground truncate">
                          {prospect.company_name}
                        </h4>
                        <Badge className={`${statusConfig.color} border text-xs gap-1 shrink-0`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {prospect.niche && (
                          <span className="bg-muted px-2 py-0.5 rounded">{prospect.niche}</span>
                        )}
                        {prospect.company_city && (
                          <span>📍 {prospect.company_city}, {prospect.company_state}</span>
                        )}
                        {prospect.company_phone && (
                          <span>📞 {prospect.company_phone}</span>
                        )}
                        {prospect.analysis_score > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Score: {prospect.analysis_score}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canAnalyze && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAnalyze(prospect.id)}
                          disabled={analyzing}
                          className="gap-1"
                        >
                          <Sparkles className="w-4 h-4" />
                          Analisar
                        </Button>
                      )}
                      
                      {canSend && (
                        <Button
                          size="sm"
                          onClick={() => onSend(prospect.id)}
                          disabled={sending}
                          className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Send className="w-4 h-4" />
                          Enviar
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(prospect)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(prospect)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(prospect.id, 'converted')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar Convertido
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(prospect.id, 'rejected')}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Marcar Rejeitado
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(prospect.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
