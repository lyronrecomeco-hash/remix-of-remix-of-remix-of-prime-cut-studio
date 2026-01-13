import { useState } from 'react';
import { 
  Search, 
  Globe, 
  Phone, 
  Send, 
  Eye, 
  Trash2, 
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Prospect, ProspectStatus } from './types';

interface ProspectListProps {
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
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: <Clock className="w-3 h-3" /> },
  analyzing: { label: 'Analisando', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: <Sparkles className="w-3 h-3 animate-pulse" /> },
  analyzed: { label: 'Analisado', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', icon: <Search className="w-3 h-3" /> },
  proposal_ready: { label: 'Proposta Pronta', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30', icon: <CheckCircle className="w-3 h-3" /> },
  sent: { label: 'Enviada', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', icon: <Send className="w-3 h-3" /> },
  replied: { label: 'Respondeu', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: <MessageCircle className="w-3 h-3" /> },
  converted: { label: 'Convertido', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rejeitado', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: <XCircle className="w-3 h-3" /> },
  failed: { label: 'Falhou', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
};

export const ProspectList = ({
  prospects,
  loading,
  analyzing,
  sending,
  onAnalyze,
  onSend,
  onView,
  onDelete,
  onUpdateStatus,
}: ProspectListProps) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, nicho ou cidade..."
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {statusFilter === 'all' ? 'Todos os Status' : STATUS_CONFIG[statusFilter].label}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              Todos os Status
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
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum prospect encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((prospect) => {
            const statusConfig = STATUS_CONFIG[prospect.status];
            const canAnalyze = prospect.status === 'pending';
            const canSend = prospect.status === 'proposal_ready' || prospect.status === 'analyzed';

            return (
              <div
                key={prospect.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Info Principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {prospect.company_name}
                      </h3>
                      <Badge className={`${statusConfig.color} border text-xs gap-1`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </Badge>
                      {prospect.analysis_score > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Score: {prospect.analysis_score}%
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {prospect.niche && (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {prospect.niche}
                        </span>
                      )}
                      {prospect.company_city && (
                        <span className="flex items-center gap-1">
                          📍 {prospect.company_city}{prospect.company_state && `/${prospect.company_state}`}
                        </span>
                      )}
                      {prospect.company_website && (
                        <a 
                          href={`https://${prospect.company_website.replace(/^https?:\/\//, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          Site
                        </a>
                      )}
                      {prospect.company_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {prospect.company_phone}
                        </span>
                      )}
                    </div>

                    {/* Features faltantes */}
                    {prospect.missing_features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prospect.missing_features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="destructive" className="text-xs">
                            ❌ {feature.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {prospect.missing_features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{prospect.missing_features.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    {canAnalyze && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAnalyze(prospect.id)}
                        disabled={analyzing}
                        className="gap-1.5"
                      >
                        <Sparkles className="w-4 h-4" />
                        Analisar
                      </Button>
                    )}
                    
                    {canSend && prospect.company_phone && (
                      <Button
                        size="sm"
                        onClick={() => onSend(prospect.id)}
                        disabled={sending}
                        className="gap-1.5"
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
      )}
    </div>
  );
};
