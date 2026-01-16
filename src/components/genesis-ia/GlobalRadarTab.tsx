import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, 
  Globe2, 
  Loader2, 
  Bell,
  TrendingUp,
  MapPin,
  CheckCircle2,
  X,
  RefreshCw,
  Building2,
  Phone,
  ExternalLink,
  Filter,
  Clock,
  Wifi,
  WifiOff,
  Volume2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Star,
  MessageSquare,
  Mail,
  Calendar,
  Tag,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  has_website: boolean | null;
}

interface GlobalRadarTabProps {
  userId: string;
  affiliateId?: string | null;
  onAccepted?: () => void;
}

// Countries for scanning
const COUNTRIES = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
];

const LEVEL_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  basic: { label: 'Básico', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: '⚪' },
  intermediate: { label: 'Intermediário', color: 'text-amber-500', bgColor: 'bg-amber-500/10', icon: '🟡' },
  advanced: { label: 'Avançado', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', icon: '🟢' },
};

const AUTO_SCAN_INTERVAL = 2 * 60 * 1000; // 2 minutes
const ITEMS_PER_PAGE = 12;
const MAX_LEADS_LIMIT = 200; // Maximum leads before stopping scan

export const GlobalRadarTab = ({ userId, affiliateId: affiliateIdProp, onAccepted }: GlobalRadarTabProps) => {
  const [opportunities, setOpportunities] = useState<RadarOpportunity[]>([]);
  const [affiliateId, setAffiliateId] = useState<string | null>(affiliateIdProp ?? null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterNoWebsite, setFilterNoWebsite] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('BR');
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [nextScanIn, setNextScanIn] = useState<number>(0);
  const [scanStats, setScanStats] = useState({ total: 0, today: 0, avgScore: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOpportunity, setSelectedOpportunity] = useState<RadarOpportunity | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const autoScanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Pagination
  const totalPages = Math.ceil(opportunities.length / ITEMS_PER_PAGE);
  const paginatedOpportunities = opportunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // If affiliateId is provided by parent, keep state in sync
  useEffect(() => {
    if (typeof affiliateIdProp !== 'undefined') {
      setAffiliateId(affiliateIdProp ?? null);
    }
  }, [affiliateIdProp]);

  // Fetch affiliate ID from user_id
  useEffect(() => {
    if (typeof affiliateIdProp !== 'undefined') return;

    const fetchAffiliateId = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setAffiliateId(data.id);
      } else {
        console.log('User is not an affiliate, using userId as fallback');
        // Se não for afiliado, pode-se criar um ou apenas não usar o radar
        setAffiliateId(null);
      }
    };

    fetchAffiliateId();
  }, [userId, affiliateIdProp]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQYLj9LU6ZNdECOI07vdmnoQL4HGs9eraDc1da2xxLN/STBmqrOupH5TO2Cjrq6gflNEWp6qqqKeU0xUl6WqpZpWUVGPn6Ogl1lTToual5+YWVRPiJWXmJVdVE+EkJWVk1tUT4COlJSRWVVPfoqSkZBYVlB8iJCPj1dWUnqGjo6NV1dUeISMi4xXV1Z2gYqKildZWHR/iImIV1pZc36Hh4dYW1pyfoaGhVhcW3F9hYSEWFxbcH2EhINYXVxvfIODgllcXG59goKBWV1dbn2BgYBZXl5tfYCAgFleXm19gICAWV9fb36AgIBaX19ufoCAgFpfX25+gICAWmBgbn6AgIBaYGBufoCAgFpgYG5+gICAWmBgbn6AgIBaYGBufoCAgFpgYG5+gICAWmBgbn6AgIBaYGBufoCAgFpgYG4=');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      console.log('Sound not available');
    }
  }, [soundEnabled]);

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    if (!affiliateId) {
      setLoading(false);
      return;
    }
    
    try {
      let query = supabase
        .from('global_radar_opportunities')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .eq('status', 'new')
        .order('opportunity_score', { ascending: false })
        .limit(MAX_LEADS_LIMIT);

      // Filter only without website (high conversion %)
      if (filterNoWebsite) {
        query = query.eq('has_website', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setOpportunities(data || []);
      setUnreadCount((data || []).filter(o => !o.is_read).length);
      
      // Check if limit reached
      const reachedLimit = (data?.length || 0) >= MAX_LEADS_LIMIT;
      setLimitReached(reachedLimit);
      
      if (reachedLimit && autoScanEnabled) {
        setAutoScanEnabled(false);
        toast.info(`🎯 Limite de ${MAX_LEADS_LIMIT} leads atingido! Auto-scan pausado.`);
      }
      
      // Calculate stats
      if (data && data.length > 0) {
        const today = new Date().toDateString();
        const todayCount = data.filter(o => new Date(o.found_at).toDateString() === today).length;
        const avgScore = Math.round(data.reduce((acc, o) => acc + o.opportunity_score, 0) / data.length);
        setScanStats({
          total: data.length,
          today: todayCount,
          avgScore,
        });
      }
    } catch (error) {
      console.error('Error fetching radar opportunities:', error);
    } finally {
      setLoading(false);
    }
  }, [affiliateId, filterNoWebsite, autoScanEnabled]);

  // Run scan
  const runScan = useCallback(async (isAuto = false) => {
    if (scanning || !affiliateId) return;
    
    // Don't scan if limit reached
    if (limitReached) {
      if (!isAuto) {
        toast.warning(`Limite de ${MAX_LEADS_LIMIT} leads atingido. Aceite ou rejeite alguns para continuar.`);
      }
      return;
    }
    
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('global-radar', {
        body: { affiliateId },
      });

      if (error) throw error;

      setLastScanTime(new Date());

      if (data?.success && data.opportunities?.length > 0) {
        const highConversion = data.opportunities.filter((o: any) => !o.has_website);
        
        if (highConversion.length > 0) {
          playNotificationSound();
          toast.success(`🌍 ${highConversion.length} oportunidades de alta conversão!`, {
            description: `${data.scanned?.region} • ${data.scanned?.city}`,
            duration: 5000,
          });
        }
        
        fetchOpportunities();
      } else if (!isAuto) {
        toast.info('Nenhuma nova oportunidade encontrada neste scan');
      }
    } catch (error) {
      console.error('Radar scan error:', error);
      if (!isAuto) {
        toast.error('Erro ao executar scan global');
      }
    } finally {
      setScanning(false);
    }
  }, [affiliateId, scanning, fetchOpportunities, playNotificationSound, limitReached]);

  // Auto scan effect
  useEffect(() => {
    if (!affiliateId) return;

    fetchOpportunities();

    if (autoScanEnabled) {
      const initialScan = setTimeout(() => runScan(true), 10000);
      
      autoScanIntervalRef.current = setInterval(() => {
        runScan(true);
      }, AUTO_SCAN_INTERVAL);

      setNextScanIn(AUTO_SCAN_INTERVAL / 1000);
      countdownRef.current = setInterval(() => {
        setNextScanIn(prev => prev > 0 ? prev - 1 : AUTO_SCAN_INTERVAL / 1000);
      }, 1000);

      return () => {
        clearTimeout(initialScan);
        if (autoScanIntervalRef.current) clearInterval(autoScanIntervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }

    return () => {
      if (autoScanIntervalRef.current) clearInterval(autoScanIntervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [affiliateId, autoScanEnabled, fetchOpportunities, runScan]);

  // Realtime subscription
  useEffect(() => {
    if (!affiliateId) return;

    const channel = supabase
      .channel('genesis-radar')
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
          if (!newOpp.has_website && newOpp.opportunity_score >= 70) {
            playNotificationSound();
            setOpportunities(prev => [newOpp, ...prev]);
            setUnreadCount(prev => prev + 1);
            toast.success(`🎯 Nova oportunidade: ${newOpp.company_name}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [affiliateId, playNotificationSound]);

  // Mark as read
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    const unreadIds = opportunities.filter(o => !o.is_read).map(o => o.id);
    
    await supabase
      .from('global_radar_opportunities')
      .update({ is_read: true })
      .in('id', unreadIds);
    
    setUnreadCount(0);
    setOpportunities(prev => prev.map(o => ({ ...o, is_read: true })));
  };

  // Accept opportunity
  const handleAccept = async (opportunity: RadarOpportunity) => {
    if (!affiliateId) {
      toast.error('Não foi possível identificar seu afiliado. Recarregue a página.');
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('affiliate_prospects')
        .insert({
          affiliate_id: affiliateId,
          company_name: opportunity.company_name,
          company_phone: opportunity.company_phone,
          company_website: opportunity.company_website,
          company_address: opportunity.company_address,
          company_city: opportunity.company_city,
          niche: opportunity.niche,
          analysis_score: opportunity.opportunity_score,
          analysis_data: {
            digital_presence_status: opportunity.digital_presence_status,
            service_tags: opportunity.service_tags,
            estimated_value_min: opportunity.estimated_value_min,
            estimated_value_max: opportunity.estimated_value_max,
            monthly_recurrence: opportunity.monthly_recurrence,
          },
          source: 'radar_global',
          status: 'new',
        });

      if (insertError) throw insertError;

      // Update opportunity status
      await supabase
        .from('global_radar_opportunities')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', opportunity.id);

      setOpportunities((prev) => prev.filter((o) => o.id !== opportunity.id));

      toast.success(`✅ ${opportunity.company_name} aceito e enviado para Propostas Aceitas!`);
      onAccepted?.();
    } catch (error) {
      console.error('Error accepting opportunity:', error);
      const msg = (error as { message?: string })?.message;
      toast.error(msg || 'Erro ao aceitar oportunidade');
    }
  };

  // Reject opportunity
  const handleReject = async (id: string) => {
    await supabase
      .from('global_radar_opportunities')
      .update({ status: 'rejected' })
      .eq('id', id);
    
    setOpportunities(prev => prev.filter(o => o.id !== id));
  };

  // Open detail modal
  const handleOpenDetail = (opp: RadarOpportunity) => {
    setSelectedOpportunity(opp);
    setDetailModalOpen(true);
    
    // Mark as read
    if (!opp.is_read) {
      supabase
        .from('global_radar_opportunities')
        .update({ is_read: true })
        .eq('id', opp.id)
        .then(() => {
          setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, is_read: true } : o));
          setUnreadCount(prev => Math.max(0, prev - 1));
        });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Radar className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{scanStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className="text-xl font-bold text-foreground">{scanStats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score Médio</p>
                <p className="text-xl font-bold text-foreground">{scanStats.avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Bell className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Não Lidos</p>
                <p className="text-xl font-bold text-foreground">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left - Scan controls */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => runScan(false)}
                disabled={scanning}
                className="gap-2"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Scan Agora
                  </>
                )}
              </Button>

              {autoScanEnabled && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Próximo: {formatTime(nextScanIn)}</span>
                </div>
              )}
            </div>

            {/* Right - Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {autoScanEnabled ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">Auto-Scan</span>
                <Switch
                  checked={autoScanEnabled}
                  onCheckedChange={setAutoScanEnabled}
                />
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className={cn("w-4 h-4", soundEnabled ? "text-blue-400" : "text-muted-foreground")} />
                <span className="text-sm text-muted-foreground">Som</span>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className={cn("w-4 h-4", filterNoWebsite ? "text-amber-400" : "text-muted-foreground")} />
                <span className="text-sm text-muted-foreground">Alta Conversão</span>
                <Switch
                  checked={filterNoWebsite}
                  onCheckedChange={setFilterNoWebsite}
                />
              </div>

              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Marcar lidos
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limit reached alert */}
      {limitReached && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-500">
                  Limite de {MAX_LEADS_LIMIT} leads atingido
                </p>
                <p className="text-xs text-muted-foreground">
                  Aceite ou rejeite alguns leads para liberar espaço e continuar o scan automático.
                </p>
              </div>
              <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                {opportunities.length}/{MAX_LEADS_LIMIT}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities Grid */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-primary" />
              Oportunidades Detectadas
              {opportunities.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {opportunities.length}/{MAX_LEADS_LIMIT}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando oportunidades...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Radar className="w-8 h-8 text-primary/50" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground mb-1">Radar ativo</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {autoScanEnabled 
                    ? 'O radar está escaneando automaticamente. Novas oportunidades aparecerão aqui.'
                    : 'Ative o auto-scan ou clique em "Scan Agora" para encontrar oportunidades.'
                  }
                </p>
              </div>
              {!autoScanEnabled && (
                <Button onClick={() => runScan(false)} disabled={scanning} className="gap-2">
                  <Radar className="w-4 h-4" />
                  Iniciar Scan
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grid Layout - Cards profissionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {paginatedOpportunities.map((opp, index) => {
                    const levelConfig = LEVEL_CONFIG[opp.opportunity_level] || LEVEL_CONFIG.basic;
                    
                    return (
                      <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Card className={cn(
                          "relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30",
                          "bg-card border-border/50",
                          !opp.is_read && "ring-1 ring-primary/20"
                        )}>
                          {/* Color accent bar based on level */}
                          <div className={cn(
                            "absolute top-0 left-0 right-0 h-1",
                            opp.opportunity_level === 'advanced' && "bg-emerald-500",
                            opp.opportunity_level === 'intermediate' && "bg-amber-500",
                            opp.opportunity_level === 'basic' && "bg-muted-foreground/30",
                          )} />

                          <CardContent className="p-5 pt-6">
                            {/* Header Row */}
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground leading-tight line-clamp-1">
                                  {opp.company_name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">{opp.niche || 'Negócio local'}</span>
                                  <Badge variant="outline" className={cn(
                                    "text-[10px] px-1.5 py-0 h-5",
                                    opp.opportunity_level === 'advanced' && "border-emerald-500/50 text-emerald-500",
                                    opp.opportunity_level === 'intermediate' && "border-amber-500/50 text-amber-500",
                                    opp.opportunity_level === 'basic' && "border-muted-foreground/50 text-muted-foreground",
                                  )}>
                                    {levelConfig.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Value Section */}
                            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> Valor Estimado
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  R$ {opp.estimated_value_min.toLocaleString()} (mín)
                                </p>
                                <p className="text-base font-bold text-emerald-500">
                                  R$ {opp.estimated_value_max.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  📅 Recorrência
                                </p>
                                <p className="text-sm font-semibold text-emerald-400 mt-1">
                                  +R$ {opp.monthly_recurrence?.toLocaleString() || '0'}/mês
                                </p>
                              </div>
                            </div>

                            {/* Description */}
                            {opp.ai_description && (
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                                ✨ {opp.ai_description}
                              </p>
                            )}

                            {/* Location & Phone */}
                            <div className="space-y-1.5 mb-3">
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 flex-shrink-0 text-muted-foreground/70" />
                                <span className="truncate">{opp.company_address || opp.company_city || 'Localização não informada'}</span>
                              </p>
                              {opp.company_phone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 flex-shrink-0 text-muted-foreground/70" />
                                  <span>{opp.company_phone}</span>
                                </p>
                              )}
                            </div>

                            {/* Digital Presence Status */}
                            {!opp.has_website && (
                              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 rounded-lg mb-4">
                                <Globe2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span className="text-xs text-emerald-500 font-medium">
                                  Sem presença digital — oportunidade máxima
                                </span>
                              </div>
                            )}

                            {/* Service Tags */}
                            {opp.service_tags && opp.service_tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {opp.service_tags.slice(0, 3).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2 py-1 bg-muted/50 border border-border/50 rounded text-[10px] text-muted-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(opp);
                                }}
                                className="flex-1 h-10"
                              >
                                <Eye className="w-4 h-4 mr-1.5" />
                                Ver Perfil
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAccept(opp);
                                }}
                                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                Aceitar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                      Math.max(0, currentPage - 3),
                      Math.min(totalPages, currentPage + 2)
                    ).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Perfil do Estabelecimento"
        size="4xl"
      >
        {selectedOpportunity && (
          <>
            <ModalBody className="space-y-6">
              {/* Header with score */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground">{selectedOpportunity.company_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedOpportunity.niche || 'Negócio local'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={cn(
                      selectedOpportunity.opportunity_level === 'advanced' && "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
                      selectedOpportunity.opportunity_level === 'intermediate' && "bg-amber-500/20 text-amber-500 border-amber-500/30",
                      selectedOpportunity.opportunity_level === 'basic' && "bg-muted text-muted-foreground border-border",
                    )}>
                      {LEVEL_CONFIG[selectedOpportunity.opportunity_level]?.label || 'Básico'}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      Score: {selectedOpportunity.opportunity_score}%
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Estimated Values */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Valor Estimado
                  </p>
                  <p className="text-sm text-muted-foreground">Min: R$ {selectedOpportunity.estimated_value_min.toLocaleString()}</p>
                  <p className="text-xl font-bold text-emerald-500">R$ {selectedOpportunity.estimated_value_max.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Recorrência Mensal
                  </p>
                  <p className="text-xl font-bold text-emerald-400">+R$ {selectedOpportunity.monthly_recurrence?.toLocaleString() || '0'}/mês</p>
                </div>
              </div>

              {/* Digital Presence */}
              <div className={cn(
                "p-4 rounded-xl flex items-center gap-3",
                !selectedOpportunity.has_website ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-muted/30 border border-border/50"
              )}>
                <Globe2 className={cn("w-5 h-5", !selectedOpportunity.has_website ? "text-emerald-500" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-medium", !selectedOpportunity.has_website ? "text-emerald-500" : "text-foreground")}>
                    {selectedOpportunity.digital_presence_status || (selectedOpportunity.has_website ? 'Possui presença digital' : 'Sem presença digital')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {!selectedOpportunity.has_website 
                      ? 'Oportunidade máxima - empresa precisa de serviços digitais'
                      : 'Empresa já possui website'
                    }
                  </p>
                </div>
              </div>

              {/* AI Description */}
              {selectedOpportunity.ai_description && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-primary">Análise da IA</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedOpportunity.ai_description}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Informações de Contato</p>
                {selectedOpportunity.company_address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{selectedOpportunity.company_address}</span>
                  </div>
                )}
                {selectedOpportunity.company_city && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{selectedOpportunity.company_city}, {selectedOpportunity.company_country || 'Brasil'}</span>
                  </div>
                )}
                {selectedOpportunity.company_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{selectedOpportunity.company_phone}</span>
                  </div>
                )}
                {selectedOpportunity.company_website && (
                  <div className="flex items-center gap-3 text-sm">
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a 
                      href={selectedOpportunity.company_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedOpportunity.company_website}
                    </a>
                  </div>
                )}
              </div>

              {/* Service Tags */}
              {selectedOpportunity.service_tags && selectedOpportunity.service_tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Serviços Recomendados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.service_tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="pt-4 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                <span>🔍 Região: {selectedOpportunity.search_region || 'N/A'}</span>
                <span>📅 Encontrado: {new Date(selectedOpportunity.found_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedOpportunity.company_name)}`, '_blank');
                }}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Pesquisar no Google
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  handleReject(selectedOpportunity.id);
                  setDetailModalOpen(false);
                }}
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
                Rejeitar
              </Button>
              
              <Button
                onClick={() => {
                  handleAccept(selectedOpportunity);
                  setDetailModalOpen(false);
                }}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aceitar Projeto
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
};
