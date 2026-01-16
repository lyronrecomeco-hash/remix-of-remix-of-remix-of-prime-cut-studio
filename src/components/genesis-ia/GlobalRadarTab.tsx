import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, 
  Globe2, 
  Loader2, 
  Bell,
  Zap,
  TrendingUp,
  MapPin,
  CheckCircle2,
  X,
  RefreshCw,
  Building2,
  Phone,
  ExternalLink,
  MessageCircle,
  Filter,
  Clock,
  Wifi,
  WifiOff,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
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
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  basic: {
    label: 'Básico',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    icon: '🔵',
  },
  intermediate: {
    label: 'Intermediário',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    icon: '🟡',
  },
  advanced: {
    label: 'Avançado',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    icon: '🟢',
  },
};

const AUTO_SCAN_INTERVAL = 2 * 60 * 1000; // 2 minutes

export const GlobalRadarTab = ({ userId }: GlobalRadarTabProps) => {
  const [opportunities, setOpportunities] = useState<RadarOpportunity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterNoWebsite, setFilterNoWebsite] = useState(true);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [nextScanIn, setNextScanIn] = useState<number>(0);
  const [scanStats, setScanStats] = useState({ total: 0, today: 0, avgScore: 0 });
  const autoScanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQYLj9LU6ZNdECOI07vdmnoQL4HGs9eraDc1da2xxLN/STBmqrOupH5TO2Cjrq6gflNEWp6qqqKeU0xUl6WqpZpWUVGPn6Ogl1lTToual5+YWVRPiJWXmJVdVE+EkJWVk1tUT4COlJSRWVVPfoqSkZBYVlB8iJCPj1dWUnqGjo6NV1dUeISMi4xXV1Z2gYqKildZWHR/iImIV1pZc36Hh4dYW1pyfoaGhVhcW3F9hYSEWFxbcH2EhINYXVxvfIODgllcXG59goKBWV1dbn2BgYBZXl5tfYCAgFleXm19gICAWV9fb36AgIBaX19ufoCAgFpfX25+gICAWmBgbn6AgIBaYGBufoCAgFpgYG5+gICAWmBgbn6AgIBaYGBufoCAgFpgYG5+gICAWmBgbn6AgIBaYGBufoCAgFpgYG4=');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      console.log('Sound not available');
    }
  }, [soundEnabled]);

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    try {
      let query = supabase
        .from('global_radar_opportunities')
        .select('*')
        .eq('affiliate_id', userId)
        .eq('status', 'new')
        .order('opportunity_score', { ascending: false })
        .limit(100);

      // Filter only without website (high conversion %)
      if (filterNoWebsite) {
        query = query.eq('has_website', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setOpportunities(data || []);
      setUnreadCount((data || []).filter(o => !o.is_read).length);
      
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
  }, [userId, filterNoWebsite]);

  // Run scan
  const runScan = useCallback(async (isAuto = false) => {
    if (scanning) return;
    
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('global-radar', {
        body: { affiliateId: userId },
      });

      if (error) throw error;

      setLastScanTime(new Date());

      if (data?.success && data.opportunities?.length > 0) {
        // Only count high-conversion opportunities (without website)
        const highConversion = data.opportunities.filter((o: any) => !o.has_website);
        
        if (highConversion.length > 0) {
          playNotificationSound();
          
          toast.success(`🌍 ${highConversion.length} oportunidades de alta conversão!`, {
            description: `${data.scanned?.region} • ${data.scanned?.city} • Score médio: ${Math.round(highConversion.reduce((a: number, o: any) => a + o.opportunity_score, 0) / highConversion.length)}%`,
            duration: 5000,
          });
        }
        
        fetchOpportunities();
      } else if (!isAuto) {
        toast.info('Nenhuma nova oportunidade encontrada neste scan', {
          description: 'Tente novamente em alguns minutos',
        });
      }
    } catch (error) {
      console.error('Radar scan error:', error);
      if (!isAuto) {
        toast.error('Erro ao executar scan global');
      }
    } finally {
      setScanning(false);
    }
  }, [userId, scanning, fetchOpportunities, playNotificationSound]);

  // Auto scan effect
  useEffect(() => {
    if (!userId) return;

    fetchOpportunities();

    if (autoScanEnabled) {
      // Initial scan after 10 seconds
      const initialScan = setTimeout(() => runScan(true), 10000);
      
      // Set up interval for every 2 minutes
      autoScanIntervalRef.current = setInterval(() => {
        runScan(true);
      }, AUTO_SCAN_INTERVAL);

      // Countdown timer
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
  }, [userId, autoScanEnabled, fetchOpportunities, runScan]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('genesis-radar')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'global_radar_opportunities',
          filter: `affiliate_id=eq.${userId}`,
        },
        (payload) => {
          const newOpp = payload.new as RadarOpportunity;
          
          // Only notify for high conversion (no website)
          if (!newOpp.has_website && newOpp.opportunity_score >= 70) {
            playNotificationSound();
            
            setOpportunities(prev => [newOpp, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast.success(`🎯 Nova oportunidade: ${newOpp.company_name}`, {
              description: `${newOpp.opportunity_score}% conversão • ${newOpp.company_city}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, playNotificationSound]);

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
    try {
      // Create prospect from opportunity
      const { error: insertError } = await supabase
        .from('affiliate_prospects')
        .insert({
          affiliate_id: userId,
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
      
      setOpportunities(prev => prev.filter(o => o.id !== opportunity.id));
      
      toast.success(`✅ ${opportunity.company_name} adicionado aos prospectos!`);
    } catch (error) {
      console.error('Error accepting opportunity:', error);
      toast.error('Erro ao aceitar oportunidade');
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Radar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{scanStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className="text-xl font-bold text-foreground">{scanStats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score Médio</p>
                <p className="text-xl font-bold text-foreground">{scanStats.avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-400" />
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
                className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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

      {/* Opportunities List */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-purple-500" />
            Oportunidades Detectadas
            {opportunities.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {opportunities.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground">Carregando oportunidades...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Radar className="w-8 h-8 text-purple-500/50" />
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
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {opportunities.map((opp, index) => {
                    const levelConfig = LEVEL_CONFIG[opp.opportunity_level] || LEVEL_CONFIG.basic;
                    
                    return (
                      <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all",
                          !opp.is_read && "ring-2 ring-purple-500/30",
                          opp.opportunity_level === 'advanced' && "border-emerald-500/50 bg-gradient-to-r from-emerald-500/5 to-transparent",
                          opp.opportunity_level === 'intermediate' && "border-amber-500/50 bg-gradient-to-r from-amber-500/5 to-transparent",
                          opp.opportunity_level === 'basic' && "border-border",
                        )}
                      >
                        {/* Unread indicator */}
                        {!opp.is_read && (
                          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        )}

                        {/* Score Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <Badge className={cn(
                            "text-xs font-bold",
                            opp.opportunity_score >= 80 && "bg-emerald-500 hover:bg-emerald-600",
                            opp.opportunity_score >= 60 && opp.opportunity_score < 80 && "bg-amber-500 hover:bg-amber-600",
                            opp.opportunity_score < 60 && "bg-slate-500 hover:bg-slate-600",
                          )}>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {opp.opportunity_score}%
                          </Badge>
                        </div>

                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3 pr-20">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{opp.company_name}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {opp.company_city}, {opp.search_region || opp.company_country}
                            </p>
                            {opp.company_phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />
                                {opp.company_phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Level & Values */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge variant="outline" className={cn(levelConfig.bgColor, levelConfig.color, "border-0")}>
                            {levelConfig.icon} {levelConfig.label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            R$ {opp.estimated_value_min.toLocaleString()}~{opp.estimated_value_max.toLocaleString()}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                            +R$ {opp.monthly_recurrence}/mês
                          </Badge>
                          {!opp.has_website && (
                            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                              🎯 Sem presença digital
                            </Badge>
                          )}
                        </div>

                        {/* Digital status */}
                        {opp.digital_presence_status && (
                          <p className="text-sm text-amber-400 mb-2 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            {opp.digital_presence_status}
                          </p>
                        )}

                        {/* Tags */}
                        {opp.service_tags && opp.service_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {opp.service_tags.map((tag, idx) => (
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
                            className={cn(
                              "flex-1 gap-1.5",
                              opp.opportunity_level === 'advanced' && "bg-emerald-600 hover:bg-emerald-700",
                              opp.opportunity_level === 'intermediate' && "bg-amber-600 hover:bg-amber-700",
                            )}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aceitar Lead
                          </Button>
                          
                          {opp.company_phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`https://wa.me/${opp.company_phone?.replace(/\D/g, '')}`, '_blank')}
                              className="gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </Button>
                          )}
                          
                          {opp.company_website && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(opp.company_website!, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(opp.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
