import { useState, useMemo } from 'react';
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
  Zap,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Prospect, ProspectStatus } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AutomationConfigModal, ActiveJobCard, useAutomationJobs, AutomationConfig } from '../automation';

interface HistoryTabProps {
  prospects: Prospect[];
  loading: boolean;
  analyzing: boolean;
  sending: boolean;
  affiliateId: string;
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

const ITEMS_PER_PAGE = 10;

export const HistoryTab = ({
  prospects,
  loading,
  analyzing,
  sending,
  affiliateId,
  onAnalyze,
  onSend,
  onView,
  onDelete,
}: HistoryTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    activeJob,
    instances,
    creating,
    createJob,
    pauseJob,
    resumeJob,
    cancelJob,
    deleteJob,
  } = useAutomationJobs(affiliateId);

  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      const matchesSearch = prospect.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.company_address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || prospect.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [prospects, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProspects.length / ITEMS_PER_PAGE);
  const paginatedProspects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProspects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProspects, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const statusCounts = prospects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = {
    total: prospects.length,
    proposalReady: (statusCounts['proposal_ready'] || 0) + (statusCounts['analyzed'] || 0),
    sent: statusCounts['sent'] || 0,
    converted: statusCounts['converted'] || 0,
    replied: statusCounts['replied'] || 0,
  };

  // Selectable prospects (only analyzed or proposal_ready)
  const selectableProspects = filteredProspects.filter(
    p => p.status === 'analyzed' || p.status === 'proposal_ready'
  );

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === selectableProspects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableProspects.map(p => p.id)));
    }
  };

  const selectedProspects = prospects.filter(p => selectedIds.has(p.id));

  const handleStartAutomation = async (config: AutomationConfig) => {
    await createJob(Array.from(selectedIds), config);
    setSelectedIds(new Set());
    setShowAutomationModal(false);
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
      {/* Active Job Card */}
      {activeJob && (
        <ActiveJobCard
          job={activeJob}
          onPause={pauseJob}
          onResume={resumeJob}
          onCancel={cancelJob}
          onDelete={deleteJob}
        />
      )}

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

      {/* Selection Bar */}
      {selectedIds.size > 0 && (
        <Card className="border-primary bg-primary/5 sticky top-0 z-10">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-sm">
                {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Limpar
              </Button>
            </div>
            <Button
              onClick={() => setShowAutomationModal(true)}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Automatizar Envio
            </Button>
          </CardContent>
        </Card>
      )}

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
              {selectableProspects.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="gap-2"
                >
                  {selectedIds.size === selectableProspects.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectedIds.size === selectableProspects.length ? 'Desmarcar' : 'Selecionar'} Todos
                </Button>
              )}

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

      {/* Prospects List */}
      <Card className="border-border">
        <CardContent className="p-4">
          {filteredProspects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum prospect encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedProspects.map((prospect) => {
                const status = STATUS_CONFIG[prospect.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;
                const isSelectable = prospect.status === 'analyzed' || prospect.status === 'proposal_ready';
                const isSelected = selectedIds.has(prospect.id);
                
                return (
                  <div
                    key={prospect.id}
                    className={`bg-background border rounded-xl p-4 transition-all duration-300 group ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      {isSelectable && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(prospect.id)}
                          className="mt-1"
                        />
                      )}

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
                          
                          {isSelectable && (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProspects.length)} de {filteredProspects.length}
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation Modal */}
      <AutomationConfigModal
        open={showAutomationModal}
        onOpenChange={setShowAutomationModal}
        selectedProspects={selectedProspects}
        instances={instances}
        onStart={handleStartAutomation}
        creating={creating}
      />
    </div>
  );
};
