import { useState, useEffect } from 'react';
import { 
  Radar, 
  Globe2, 
  Loader2, 
  ChevronRight,
  Bell,
  Zap,
  TrendingUp,
  MapPin,
  CheckCircle2,
  X,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RadarOpportunity {
  id: string;
  company_name: string;
  company_phone: string | null;
  company_website: string | null;
  company_address: string | null;
  company_city: string | null;
  company_country: string | null;
  niche: string | null;
  opportunity_score: number;
  opportunity_level: string;
  estimated_value_min: number;
  estimated_value_max: number;
  monthly_recurrence: number;
  digital_presence_status: string | null;
  service_tags: string[];
  ai_description: string | null;
  status: string;
  is_read: boolean;
  found_at: string;
  search_region: string | null;
}

interface GlobalRadarCardProps {
  affiliateId: string;
  onAcceptOpportunity: (opportunity: RadarOpportunity) => Promise<void>;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  basic: {
    label: 'Básico',
    color: 'bg-slate-500/10 text-slate-600',
    icon: '🔵',
  },
  intermediate: {
    label: 'Intermediário',
    color: 'bg-amber-500/10 text-amber-600',
    icon: '🟡',
  },
  advanced: {
    label: 'Avançado',
    color: 'bg-emerald-500/10 text-emerald-600',
    icon: '🟢',
  },
};

export const GlobalRadarCard = ({ affiliateId, onAcceptOpportunity }: GlobalRadarCardProps) => {
  const [opportunities, setOpportunities] = useState<RadarOpportunity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Carregar oportunidades
  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('global_radar_opportunities')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .eq('status', 'new')
        .order('opportunity_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setOpportunities(data || []);
      setUnreadCount((data || []).filter(o => !o.is_read).length);
    } catch (error) {
      console.error('Error fetching radar opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Executar scan manual
  const runScan = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('global-radar', {
        body: { affiliateId },
      });

      if (error) throw error;

      if (data?.success && data.opportunities?.length > 0) {
        toast.success(`🌍 ${data.opportunities.length} novas oportunidades encontradas!`, {
          description: `Região: ${data.scanned?.region} | Cidade: ${data.scanned?.city}`,
        });
        fetchOpportunities();
      } else {
        toast.info('Nenhuma nova oportunidade encontrada neste scan');
      }
    } catch (error) {
      console.error('Radar scan error:', error);
      toast.error('Erro ao executar scan global');
    } finally {
      setScanning(false);
    }
  };

  // Marcar como lido ao abrir
  const handleOpenDialog = async () => {
    setDialogOpen(true);
    
    // Marcar todas como lidas
    if (unreadCount > 0) {
      const unreadIds = opportunities.filter(o => !o.is_read).map(o => o.id);
      
      await supabase
        .from('global_radar_opportunities')
        .update({ is_read: true })
        .in('id', unreadIds);
      
      setUnreadCount(0);
      setOpportunities(prev => prev.map(o => ({ ...o, is_read: true })));
    }
  };

  // Aceitar oportunidade
  const handleAccept = async (opportunity: RadarOpportunity) => {
    setAcceptingId(opportunity.id);
    try {
      await onAcceptOpportunity(opportunity);
      
      // Atualizar status
      await supabase
        .from('global_radar_opportunities')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', opportunity.id);
      
      // Remover da lista
      setOpportunities(prev => prev.filter(o => o.id !== opportunity.id));
      
      toast.success(`✅ ${opportunity.company_name} aceito!`);
    } catch (error) {
      console.error('Error accepting opportunity:', error);
      toast.error('Erro ao aceitar oportunidade');
    } finally {
      setAcceptingId(null);
    }
  };

  // Rejeitar oportunidade
  const handleReject = async (id: string) => {
    await supabase
      .from('global_radar_opportunities')
      .update({ status: 'rejected' })
      .eq('id', id);
    
    setOpportunities(prev => prev.filter(o => o.id !== id));
  };

  useEffect(() => {
    if (affiliateId) {
      fetchOpportunities();
    }
  }, [affiliateId]);

  // Subscrever a mudanças em tempo real
  useEffect(() => {
    if (!affiliateId) return;

    const channel = supabase
      .channel('radar-opportunities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'global_radar_opportunities',
          filter: `affiliate_id=eq.${affiliateId}`,
        },
        (payload) => {
          const newOpp = payload.new as RadarOpportunity;
          setOpportunities(prev => [newOpp, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Notificação toast
          toast.success(`🌍 Nova oportunidade: ${newOpp.company_name}`, {
            description: newOpp.ai_description || 'Clique para ver detalhes',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [affiliateId]);

  return (
    <>
      <Card
        className="group relative overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 cursor-pointer transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
        onClick={handleOpenDialog}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-indigo-500/30 transition-colors">
                <Radar className="w-6 h-6 text-purple-500" />
              </div>
              
              {/* Badge de notificação */}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-purple-500 transition-all duration-300" />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-purple-600 transition-colors">
            Radar Global
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            Prospecção automática mundial — EUA, Europa, América Latina
          </p>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs">
              <Globe2 className="w-3 h-3 mr-1" />
              Auto-Scan
            </Badge>
            
            {opportunities.length > 0 && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Zap className="w-3 h-3" />
                {opportunities.length} oportunidades
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Oportunidades */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-purple-500" />
              Radar Global — Oportunidades
            </DialogTitle>
          </DialogHeader>

          {/* Ações */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={runScan}
              disabled={scanning}
              className="gap-1.5"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Escanear Agora
                </>
              )}
            </Button>
            
            <Badge variant="secondary">
              <Globe2 className="w-3 h-3 mr-1" />
              {opportunities.length} oportunidades ativas
            </Badge>
          </div>

          <ScrollArea className="h-[60vh] pr-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <p className="text-sm text-muted-foreground">Carregando oportunidades...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <Globe2 className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Nenhuma oportunidade no momento</p>
                <Button variant="outline" size="sm" onClick={runScan} disabled={scanning}>
                  <Radar className="w-4 h-4 mr-1.5" />
                  Iniciar Scan Global
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {opportunities.map((opp) => {
                  const levelConfig = LEVEL_CONFIG[opp.opportunity_level] || LEVEL_CONFIG.basic;
                  
                  return (
                    <div
                      key={opp.id}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all",
                        opp.opportunity_level === 'advanced' && "border-emerald-500/50 bg-gradient-to-r from-emerald-500/5 to-transparent",
                        opp.opportunity_level === 'intermediate' && "border-amber-500/50 bg-gradient-to-r from-amber-500/5 to-transparent",
                        opp.opportunity_level === 'basic' && "border-border",
                      )}
                    >
                      {/* Score Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className={cn(
                          opp.opportunity_score >= 80 && "bg-emerald-500",
                          opp.opportunity_score >= 60 && opp.opportunity_score < 80 && "bg-amber-500",
                          opp.opportunity_score < 60 && "bg-slate-400",
                        )}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {opp.opportunity_score}%
                        </Badge>
                      </div>

                      {/* Header */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                          🏢
                        </div>
                        <div className="flex-1 min-w-0 pr-16">
                          <h4 className="font-semibold truncate">{opp.company_name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {opp.company_city}, {opp.search_region || opp.company_country}
                          </p>
                        </div>
                      </div>

                      {/* Level & Values */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className={levelConfig.color}>
                          {levelConfig.icon} {levelConfig.label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          R$ {opp.estimated_value_min}~{opp.estimated_value_max}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-blue-600">
                          +R$ {opp.monthly_recurrence}/mês
                        </Badge>
                      </div>

                      {/* Description */}
                      {opp.ai_description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {opp.ai_description}
                        </p>
                      )}

                      {/* Tags */}
                      {opp.service_tags && opp.service_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {opp.service_tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(opp)}
                          disabled={acceptingId === opp.id}
                          className={cn(
                            "flex-1 gap-1.5",
                            opp.opportunity_level === 'advanced' && "bg-emerald-600 hover:bg-emerald-700",
                            opp.opportunity_level === 'intermediate' && "bg-amber-600 hover:bg-amber-700",
                          )}
                        >
                          {acceptingId === opp.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Aceitar Projeto
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(opp.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
