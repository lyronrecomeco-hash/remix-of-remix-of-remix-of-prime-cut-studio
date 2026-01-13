import { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Globe, 
  MapPin,
  Sparkles,
  Send,
  Eye,
  Trash2,
  Loader2,
  Calendar,
  Tag,
  Search,
  Filter,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
  MessageSquare,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Prospect, ProspectStatus } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryTabProps {
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

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'text-yellow-600', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: Clock },
  analyzing: { label: 'Analisando', color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/30', icon: Loader2 },
  analyzed: { label: 'Analisado', color: 'text-purple-600', bg: 'bg-purple-500/10 border-purple-500/30', icon: Sparkles },
  proposal_ready: { label: 'Proposta Pronta', color: 'text-primary', bg: 'bg-primary/10 border-primary/30', icon: CheckCircle },
  sent: { label: 'Enviado', color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/30', icon: Send },
  replied: { label: 'Respondido', color: 'text-cyan-600', bg: 'bg-cyan-500/10 border-cyan-500/30', icon: MessageSquare },
  converted: { label: 'Convertido', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/30', icon: TrendingUp },
  rejected: { label: 'Rejeitado', color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle },
  failed: { label: 'Falhou', color: 'text-gray-600', bg: 'bg-gray-500/10 border-gray-500/30', icon: XCircle },
};

export const HistoryTab = ({
  prospects,
  loading,
  analyzing,
  sending,
  onAnalyze,
  onSend,
  onView,
  onDelete,
}: HistoryTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.company_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || prospect.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = prospects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Carregando prospects...</p>
        </CardContent>
      </Card>
    );
  }

  if (prospects.length === 0) {
    return (
      <Card className="border-dashed border-2 border-primary/20">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum Prospect Ainda
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Use a aba "Buscar" para encontrar e adicionar estabelecimentos à sua lista de prospects.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Header */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, nicho ou endereço..."
                className="pl-9 bg-background border-border"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-background border-border">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({prospects.length})</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  statusCounts[key] ? (
                    <SelectItem key={key} value={key}>
                      {config.label} ({statusCounts[key]})
                    </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-primary">{prospects.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending || 0}</div>
          <div className="text-xs text-muted-foreground">Pendentes</div>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.sent || 0}</div>
          <div className="text-xs text-muted-foreground">Enviados</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">{statusCounts.converted || 0}</div>
          <div className="text-xs text-muted-foreground">Convertidos</div>
        </div>
      </div>

      {/* Prospects List */}
      <Card className="border-border">
        <CardContent className="p-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredProspects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum prospect encontrado com os filtros selecionados.
                </div>
              ) : (
                filteredProspects.map((prospect) => {
                  const status = STATUS_CONFIG[prospect.status] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  
                  return (
                    <div
                      key={prospect.id}
                      className="bg-background border border-border rounded-xl p-4 hover:border-primary/50 transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {prospect.company_name}
                              </h4>
                              
                              {prospect.company_address && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 truncate">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                                  {prospect.company_address}
                                </p>
                              )}
                            </div>
                            
                            <Badge className={`shrink-0 gap-1.5 ${status.bg} ${status.color} border`}>
                              <StatusIcon className={`w-3 h-3 ${prospect.status === 'analyzing' ? 'animate-spin' : ''}`} />
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {prospect.company_phone && (
                              <Badge variant="outline" className="text-xs gap-1 font-mono">
                                <Phone className="w-3 h-3" />
                                {prospect.company_phone}
                              </Badge>
                            )}
                            
                            {prospect.company_website && (
                              <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30">
                                <Globe className="w-3 h-3" />
                                Site
                              </Badge>
                            )}
                            
                            {prospect.niche && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Tag className="w-3 h-3" />
                                {prospect.niche}
                              </Badge>
                            )}

                            {prospect.analysis_score && (
                              <Badge variant="secondary" className="text-xs gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                                <Star className="w-3 h-3" />
                                Score: {prospect.analysis_score}
                              </Badge>
                            )}
                            
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(prospect.created_at), "dd/MM/yy", { locale: ptBR })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onView(prospect)}
                              className="gap-1.5 text-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Detalhes
                            </Button>
                            
                            {(prospect.status === 'pending' || prospect.status === 'analyzed') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onAnalyze(prospect.id)}
                                disabled={analyzing}
                                className="gap-1.5 text-xs"
                              >
                                <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-pulse' : ''}`} />
                                Analisar
                              </Button>
                            )}
                            
                            {(prospect.status === 'analyzed' || prospect.status === 'proposal_ready') && (
                              <Button
                                size="sm"
                                onClick={() => onSend(prospect.id)}
                                disabled={sending}
                                className="gap-1.5 text-xs bg-primary hover:bg-primary/90"
                              >
                                <Send className={`w-3.5 h-3.5 ${sending ? 'animate-pulse' : ''}`} />
                                Enviar
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(prospect.id)}
                              className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
