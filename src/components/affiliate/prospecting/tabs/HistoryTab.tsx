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
  XCircle,
  LayoutGrid,
  List,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  // Stats cards data
  const stats = {
    total: prospects.length,
    proposalReady: (statusCounts['proposal_ready'] || 0) + (statusCounts['analyzed'] || 0),
    sent: statusCounts['sent'] || 0,
    converted: statusCounts['converted'] || 0,
    replied: statusCounts['replied'] || 0,
  };

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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.proposalReady}</p>
                <p className="text-xs text-muted-foreground">Prontas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-green-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-cyan-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.replied}</p>
                <p className="text-xs text-muted-foreground">Respostas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.converted}</p>
                <p className="text-xs text-muted-foreground">Convertidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
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

              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  className="h-8 w-8 p-0"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  className="h-8 w-8 p-0"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prospects List/Grid */}
      <Card className="border-border">
        <CardContent className="p-4">
          <ScrollArea className="h-[500px] pr-4">
            {filteredProspects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum prospect encontrado com os filtros selecionados.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProspects.map((prospect) => {
                  const status = STATUS_CONFIG[prospect.status] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card 
                      key={prospect.id} 
                      className="border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                      onClick={() => onView(prospect)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {prospect.company_name}
                            </h4>
                            <Badge className={`${status.bg} ${status.color} border mt-1 gap-1`}>
                              <StatusIcon className={`w-3 h-3 ${prospect.status === 'analyzing' ? 'animate-spin' : ''}`} />
                              {status.label}
                            </Badge>
                          </div>
                        </div>

                        {prospect.company_phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                            <Phone className="w-3.5 h-3.5" />
                            {prospect.company_phone}
                          </p>
                        )}

                        {prospect.niche && (
                          <Badge variant="secondary" className="text-xs gap-1 mt-2">
                            <Tag className="w-3 h-3" />
                            {prospect.niche}
                          </Badge>
                        )}

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                          {(prospect.status === 'analyzed' || prospect.status === 'proposal_ready') && (
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); onSend(prospect.id); }}
                              disabled={sending}
                              className="flex-1 gap-1.5 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <Send className="w-3.5 h-3.5" />
                              WhatsApp
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); onDelete(prospect.id); }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProspects.map((prospect) => {
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

                            {prospect.analysis_score > 0 && (
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
                                className="gap-1.5 text-xs bg-green-600 hover:bg-green-700"
                              >
                                <Send className={`w-3.5 h-3.5 ${sending ? 'animate-pulse' : ''}`} />
                                WhatsApp
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
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
