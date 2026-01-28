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
  Eye,
  MessageSquare,
  Mail
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
  company_email: string | null;
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

      {/* Modal de Oportunidades - Mobile Responsive */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90dvh] p-0 gap-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
              <Radar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              Radar Global — Oportunidades
            </DialogTitle>
          </DialogHeader>

          {/* Ações */}
          <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={runScan}
              disabled={scanning}
              className="gap-1.5 h-8 text-xs sm:text-sm"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Escaneando...</span>
                  <span className="sm:hidden">Scan...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Escanear Agora</span>
                  <span className="sm:hidden">Scan</span>
                </>
              )}
            </Button>
            
            <Badge variant="secondary" className="text-[10px] sm:text-xs">
              <Globe2 className="w-3 h-3 mr-1" />
              {opportunities.length} ativas
            </Badge>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-3">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-purple-500" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Carregando oportunidades...</p>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-3 text-center">
                  <Globe2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Nenhuma oportunidade no momento</p>
                  <Button variant="outline" size="sm" onClick={runScan} disabled={scanning} className="h-8 text-xs">
                    <Radar className="w-3.5 h-3.5 mr-1.5" />
                    Iniciar Scan Global
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {opportunities.map((opp) => {
                    const levelConfig = LEVEL_CONFIG[opp.opportunity_level] || LEVEL_CONFIG.basic;
                    const cleanPhone = opp.company_phone?.replace(/\D/g, '') || '';
                    const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : '';
                    const emailUrl = opp.company_email ? `mailto:${opp.company_email}` : '';
                    
                    return (
                      <div
                        key={opp.id}
                        className={cn(
                          "relative p-3 sm:p-4 rounded-lg border-2 transition-all",
                          opp.opportunity_level === 'advanced' && "border-emerald-500/50 bg-gradient-to-r from-emerald-500/5 to-transparent",
                          opp.opportunity_level === 'intermediate' && "border-amber-500/50 bg-gradient-to-r from-amber-500/5 to-transparent",
                          opp.opportunity_level === 'basic' && "border-border",
                        )}
                      >
                        {/* Score Badge */}
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <Badge className={cn(
                            "text-[10px] sm:text-xs",
                            opp.opportunity_score >= 80 && "bg-emerald-500",
                            opp.opportunity_score >= 60 && opp.opportunity_score < 80 && "bg-amber-500",
                            opp.opportunity_score < 60 && "bg-slate-400",
                          )}>
                            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                            {opp.opportunity_score}%
                          </Badge>
                        </div>

                        {/* Header */}
                        <div className="flex items-start gap-2 sm:gap-3 mb-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-base sm:text-xl shrink-0">
                            🏢
                          </div>
                          <div className="flex-1 min-w-0 pr-12 sm:pr-16">
                            <h4 className="font-semibold text-sm sm:text-base truncate">{opp.company_name}</h4>
                            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {opp.company_city}, {opp.search_region || opp.company_country}
                            </p>
                          </div>
                        </div>

                        {/* Level & Values */}
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className={cn("text-[10px] sm:text-xs py-0", levelConfig.color)}>
                            {levelConfig.icon} {levelConfig.label}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] sm:text-xs py-0">
                            R$ {opp.estimated_value_min}~{opp.estimated_value_max}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] sm:text-xs text-blue-600 py-0">
                            +R$ {opp.monthly_recurrence}/mês
                          </Badge>
                        </div>

                        {/* Description */}
                        {opp.ai_description && (
                          <p className="text-[11px] sm:text-sm text-muted-foreground mb-2 line-clamp-1">
                            {opp.ai_description}
                          </p>
                        )}

                        {/* Tags */}
                        {opp.service_tags && opp.service_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                            {opp.service_tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-[9px] sm:text-xs py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Actions - WhatsApp / Email / Reject */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!opp.company_phone}
                            onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank')}
                            className={cn(
                              "flex-1 gap-1.5 h-8 text-xs",
                              opp.company_phone 
                                ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" 
                                : "text-muted-foreground/50 border-border cursor-not-allowed"
                            )}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!opp.company_email}
                            onClick={() => emailUrl && window.open(emailUrl, '_blank')}
                            className={cn(
                              "flex-1 gap-1.5 h-8 text-xs",
                              opp.company_email 
                                ? "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" 
                                : "text-muted-foreground/50 border-border cursor-not-allowed"
                            )}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Email</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(opp)}
                            disabled={acceptingId === opp.id}
                            className={cn(
                              "flex-1 gap-1.5 h-8 text-xs",
                              opp.opportunity_level === 'advanced' && "bg-emerald-600 hover:bg-emerald-700",
                              opp.opportunity_level === 'intermediate' && "bg-amber-600 hover:bg-amber-700",
                            )}
                          >
                            {acceptingId === opp.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            <span className="hidden sm:inline">Aceitar</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(opp.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
