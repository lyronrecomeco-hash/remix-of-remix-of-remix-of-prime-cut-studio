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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Prospect, ProspectStatus } from './types';

interface HistoryCardProps {
  prospects: Prospect[];
  loading: boolean;
  analyzing: boolean;
  sending: boolean;
  onAnalyze: (id: string) => void;
  onSend: (id: string) => void;
  onView: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ProspectStatus) => void;
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

export const HistoryCard = ({
  prospects,
  loading,
  analyzing,
  sending,
  onAnalyze,
  onSend,
  onView,
  onDelete,
  onUpdateStatus,
}: HistoryCardProps) => {
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

  return (
    <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Histórico</CardTitle>
              <CardDescription>
                Todos os seus prospects e propostas
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {prospects.length} prospects
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, nicho ou cidade..."
              className="pl-9 bg-background/50"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="w-4 h-4" />
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

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum prospect encontrado</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-2">
              {filtered.map((prospect) => {
                const statusConfig = STATUS_CONFIG[prospect.status];
                const canAnalyze = prospect.status === 'pending';
                const canSend = (prospect.status === 'proposal_ready' || prospect.status === 'analyzed') && prospect.company_phone;

                return (
                  <div
                    key={prospect.id}
                    className="bg-background/80 border border-border rounded-lg p-3 hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm truncate">{prospect.company_name}</h5>
                          <Badge className={`${statusConfig.color} border text-xs gap-1 shrink-0`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {prospect.niche && <span>{prospect.niche}</span>}
                          {prospect.company_city && <span>• {prospect.company_city}</span>}
                          {prospect.analysis_score > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Score: {prospect.analysis_score}%
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {canAnalyze && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onAnalyze(prospect.id)}
                            disabled={analyzing}
                            className="h-8 w-8 p-0"
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {canSend && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onSend(prospect.id)}
                            disabled={sending}
                            className="h-8 w-8 p-0 text-green-500"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(prospect)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
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
      </CardContent>
    </Card>
  );
};
