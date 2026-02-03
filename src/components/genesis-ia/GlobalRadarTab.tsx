import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  XCircle,
  RefreshCw,
  Building2,
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
  Eye,
  Search,
  Settings2,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
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
import { COUNTRIES as GLOBAL_COUNTRIES, getNichesForCountry, getCountryByCode } from '@/components/affiliate/prospecting/global/globalSearchData';
import { AutoScanFiltersModal, AutoScanFilters, DEFAULT_AUTO_SCAN_FILTERS } from './radar/AutoScanFiltersModal';

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
  has_website: boolean | null;
}

interface GlobalRadarTabProps {
  userId: string;
  affiliateId?: string | null;
  onAccepted?: () => void;
}

// Countries for scanning - using central data source
const COUNTRIES = GLOBAL_COUNTRIES;

const LEVEL_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  basic: { label: 'Básico', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: '⚪' },
  intermediate: { label: 'Intermediário', color: 'text-amber-500', bgColor: 'bg-amber-500/10', icon: '🟡' },
  advanced: { label: 'Avançado', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', icon: '🔵' },
};

const AUTO_SCAN_INTERVAL = 45 * 1000; // 45 seconds for faster results
const ITEMS_PER_PAGE = 12;
const LIMIT_OPTIONS = [25, 50, 100, 200]; // User-selectable limits
const DEFAULT_LIMIT = 50;

export const GlobalRadarTab = ({ userId, affiliateId: affiliateIdProp, onAccepted }: GlobalRadarTabProps) => {
  const [opportunities, setOpportunities] = useState<RadarOpportunity[]>([]);
  const [affiliateId, setAffiliateId] = useState<string | null>(affiliateIdProp ?? null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [maxLeadsLimit, setMaxLeadsLimit] = useState(DEFAULT_LIMIT);
  const [autoScanFilters, setAutoScanFilters] = useState<AutoScanFilters>(DEFAULT_AUTO_SCAN_FILTERS);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const autoScanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  // Load auto-scan filters from settings
  useEffect(() => {
    const loadFilters = async () => {
      if (!userId) return;
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('settings')
          .eq('user_id', userId)
          .eq('setting_type', 'radar_auto_scan_filters')
          .maybeSingle();
        
        if (data?.settings) {
          setAutoScanFilters({ ...DEFAULT_AUTO_SCAN_FILTERS, ...(data.settings as Partial<AutoScanFilters>) });
        }
      } catch (error) {
        console.error('Error loading auto-scan filters:', error);
      }
    };
    loadFilters();
  }, [userId]);

  // Save auto-scan filters and optionally enable auto-scan
  const saveAutoScanFilters = async (filters: AutoScanFilters, enableAutoScan = false) => {
    setAutoScanFilters(filters);
    if (!userId) return;
    
    try {
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('user_id', userId)
        .eq('setting_type', 'radar_auto_scan_filters')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('admin_settings')
          .update({ settings: JSON.parse(JSON.stringify(filters)), updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('admin_settings')
          .insert([{ user_id: userId, setting_type: 'radar_auto_scan_filters', settings: JSON.parse(JSON.stringify(filters)) }]);
      }
      
      toast.success('Filtros do auto-scan salvos!');
      
      // Enable auto-scan after filters are saved
      if (enableAutoScan && filters.enabled) {
        setAutoScanEnabled(true);
        toast.success('Auto-scan ativado com os filtros configurados!');
      }
    } catch (error) {
      console.error('Error saving auto-scan filters:', error);
      toast.error('Erro ao salvar filtros');
    }
  };

  // Filter and Pagination with search
  const filteredOpportunities = useMemo(() => {
    if (!searchQuery.trim()) return opportunities;
    const query = searchQuery.toLowerCase().trim();
    return opportunities.filter(opp => 
      opp.company_name?.toLowerCase().includes(query) ||
      opp.niche?.toLowerCase().includes(query) ||
      opp.company_city?.toLowerCase().includes(query) ||
      opp.company_address?.toLowerCase().includes(query)
    );
  }, [opportunities, searchQuery]);

  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE);
  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
        .limit(maxLeadsLimit);

      // Filter only without website (high conversion %)
      if (filterNoWebsite) {
        query = query.eq('has_website', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setOpportunities(data || []);
      setUnreadCount((data || []).filter(o => !o.is_read).length);
      
      // Check if limit reached
      const reachedLimit = (data?.length || 0) >= maxLeadsLimit;
      setLimitReached(reachedLimit);
      
      if (reachedLimit && autoScanEnabled) {
        setAutoScanEnabled(false);
        toast.info(`🎯 Limite de ${maxLeadsLimit} leads atingido! Auto-scan pausado.`);
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
  }, [affiliateId, filterNoWebsite, autoScanEnabled, maxLeadsLimit]);

  // Run scan - always applies filters when enabled
  const runScan = useCallback(async (isAuto = false) => {
    if (scanning || !affiliateId) return;
    
    // Don't scan if limit reached
    if (limitReached) {
      if (!isAuto) {
        toast.warning(`Limite de ${maxLeadsLimit} leads atingido. Aceite ou rejeite alguns para continuar.`);
      }
      return;
    }
    
    setScanning(true);
    
    // Add initial scanning log
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setScanLogs(prev => [`[${timestamp}] 🔍 Iniciando varredura...`, ...prev.slice(0, 49)]);
    
    try {
      // Build request body - always apply filters when enabled
      const requestBody: any = { affiliateId };
      
      if (autoScanFilters.enabled) {
        // Apply filters to all scans (auto and manual)
        if (autoScanFilters.countries.length > 0) {
          requestBody.countries = autoScanFilters.countries;
        }
        if (autoScanFilters.citySizes.length > 0) {
          requestBody.citySizes = autoScanFilters.citySizes;
        }
        if (autoScanFilters.niches.length > 0) {
          requestBody.niches = autoScanFilters.niches;
        }
        // Apply website filter
        if (autoScanFilters.websiteFilter) {
          requestBody.websiteFilter = autoScanFilters.websiteFilter;
        }
      }
      
      const { data, error } = await supabase.functions.invoke('global-radar', {
        body: requestBody,
      });

      if (error) throw error;

      setLastScanTime(new Date());

      // Process logs from backend
      if (data?.logs && Array.isArray(data.logs)) {
        const logTimestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const formattedLogs = data.logs.map((log: string) => `[${logTimestamp}] ${log}`);
        setScanLogs(prev => [...formattedLogs, ...prev.slice(0, 49 - formattedLogs.length)]);
      }

      if (data?.success && data.opportunities?.length > 0) {
        const highConversion = data.opportunities.filter((o: any) => !o.has_website);
        
        if (highConversion.length > 0) {
          playNotificationSound();
          toast.success(`🌍 ${highConversion.length} oportunidades de alta conversão!`, {
            description: `${data.scanInfo?.region} • ${data.scanInfo?.city}`,
            duration: 5000,
          });
        }
        
        fetchOpportunities();
      } else if (!isAuto) {
        toast.info('Nenhuma nova oportunidade encontrada neste scan');
      }
    } catch (error) {
      console.error('Radar scan error:', error);
      const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setScanLogs(prev => [`[${timestamp}] ❌ Erro no scan`, ...prev.slice(0, 49)]);
      if (!isAuto) {
        toast.error('Erro ao executar scan global');
      }
    } finally {
      setScanning(false);
    }
  }, [affiliateId, scanning, fetchOpportunities, playNotificationSound, limitReached, autoScanFilters, maxLeadsLimit]);

  // Handle auto-scan toggle - show filters modal first if enabling
  const handleAutoScanToggle = (enabled: boolean) => {
    if (enabled && !autoScanFilters.enabled) {
      // Open filters modal before enabling auto-scan
      setFiltersModalOpen(true);
      toast.info('Configure os filtros antes de ativar o auto-scan');
    } else {
      setAutoScanEnabled(enabled);
    }
  };

  // Auto scan effect
  useEffect(() => {
    if (!affiliateId) return;

    fetchOpportunities();

    if (autoScanEnabled) {
      const initialScan = setTimeout(() => runScan(true), 3000); // 3 seconds initial delay
      
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
          status: 'pending',
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
        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Radar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-white/50">Total</p>
                <p className="text-xl font-bold text-white">{scanStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-white/50">Hoje</p>
                <p className="text-xl font-bold text-white">{scanStats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-white/50">Score Médio</p>
                <p className="text-xl font-bold text-white">{scanStats.avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-white/50">Não Lidos</p>
                <p className="text-xl font-bold text-white">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
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
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Clock className="w-4 h-4" />
                  <span>Próximo: {formatTime(nextScanIn)}</span>
                </div>
              )}
            </div>

            {/* Right - Toggles */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Limit Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/50">Limite:</span>
                <Select value={String(maxLeadsLimit)} onValueChange={(v) => setMaxLeadsLimit(Number(v))}>
                  <SelectTrigger className="w-20 h-8 bg-white/5 border-white/10 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIMIT_OPTIONS.map((limit) => (
                      <SelectItem key={limit} value={String(limit)}>
                        {limit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                {autoScanEnabled ? <Wifi className="w-4 h-4 text-primary" /> : <WifiOff className="w-4 h-4 text-white/30" />}
                <span className="text-sm text-white/50">Auto-Scan</span>
                <Switch
                  checked={autoScanEnabled}
                  onCheckedChange={handleAutoScanToggle}
                />
              </div>

              {/* Auto-scan filters button - always visible */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersModalOpen(true)}
                className={cn(
                  "gap-1.5 border-white/20 hover:bg-white/10",
                  autoScanFilters.enabled ? "text-primary border-primary/50" : "text-white/70"
                )}
              >
                <Settings2 className="w-4 h-4" />
                Filtros
                {autoScanFilters.enabled && (
                  <Badge variant="secondary" className="h-5 px-1.5 bg-primary/20 text-primary text-[10px]">
                    {autoScanFilters.countries.length + autoScanFilters.citySizes.length + (autoScanFilters.niches.length > 0 ? autoScanFilters.niches.length : 0)}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Volume2 className={cn("w-4 h-4", soundEnabled ? "text-primary" : "text-white/30")} />
                <span className="text-sm text-white/50">Som</span>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className={cn("w-4 h-4", filterNoWebsite ? "text-primary" : "text-white/30")} />
                <span className="text-sm text-white/50">Alta Conversão</span>
                <Switch
                  checked={filterNoWebsite}
                  onCheckedChange={setFilterNoWebsite}
                />
              </div>

              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead} className="border-white/20 text-white/70 hover:text-white hover:bg-white/10">
                  Marcar lidos
                </Button>
              )}
              
              {opportunities.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    if (!affiliateId) return;
                    const { error } = await supabase
                      .from('global_radar_opportunities')
                      .update({ status: 'rejected' })
                      .eq('affiliate_id', affiliateId)
                      .eq('status', 'new');
                    if (!error) {
                      setOpportunities([]);
                      setLimitReached(false);
                      toast.success('Resultados limpos com sucesso!');
                    }
                  }}
                  className="border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Limpar Tudo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limit reached alert */}
      {limitReached && (
        <Card className="border-primary/30 bg-primary/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  Limite de {maxLeadsLimit} leads atingido
                </p>
                <p className="text-xs text-white/50">
                  Aceite ou rejeite alguns leads para liberar espaço e continuar o scan automático.
                </p>
              </div>
              <Badge variant="outline" className="border-primary/50 text-primary">
                {opportunities.length}/{maxLeadsLimit}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Scan Logs */}
      {autoScanEnabled && (
        <Card className="bg-black/30 border-primary/20 overflow-hidden" style={{ borderRadius: '14px' }}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-2.5 bg-primary/10 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Radar className="w-4 h-4 text-primary" />
                  {scanning && (
                    <motion.div
                      className="absolute -inset-1 rounded-full border border-primary/50"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-primary">Radar Ativo</span>
                {scanning && (
                  <Badge variant="outline" className="border-primary/50 text-primary text-[10px] animate-pulse">
                    ESCANEANDO
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScanLogs([])}
                className="h-7 px-2 text-white/40 hover:text-white/70 text-xs"
              >
                Limpar logs
              </Button>
            </div>
            <div 
              ref={logsContainerRef}
              className="h-32 overflow-y-auto p-3 font-mono text-xs space-y-1"
              style={{ scrollbarWidth: 'thin' }}
            >
              <AnimatePresence mode="popLayout">
                {scanLogs.length === 0 ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/30 italic"
                  >
                    Aguardando próximo scan... ({formatTime(nextScanIn)})
                  </motion.p>
                ) : (
                  scanLogs.map((log, i) => (
                    <motion.p
                      key={`${log}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "leading-relaxed",
                        log.includes('✅') && "text-emerald-400",
                        log.includes('🔥') && "text-cyan-400",
                        log.includes('❌') && "text-red-400",
                        log.includes('⚠️') && "text-amber-400",
                        log.includes('🔍') && "text-primary",
                        log.includes('📍') && "text-blue-400",
                        log.includes('🎯') && "text-purple-400",
                        log.includes('⚡') && "text-yellow-400",
                        !log.match(/✅|🔥|❌|⚠️|🔍|📍|🎯|⚡/) && "text-white/60"
                      )}
                    >
                      {log}
                    </motion.p>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities Grid */}
      <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Globe2 className="w-5 h-5 text-primary" />
              Oportunidades Detectadas
              {opportunities.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-white/10 text-white/70">
                  {filteredOpportunities.length !== opportunities.length 
                    ? `${filteredOpportunities.length}/${opportunities.length}`
                    : `${opportunities.length}/${maxLeadsLimit}`
                  }
                </Badge>
              )}
            </CardTitle>
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                type="text"
                placeholder="Pesquisar empresa, nicho, cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-white/5 border-white/10"
                style={{ borderRadius: '10px' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-white/50">Carregando oportunidades...</p>
            </div>
          ) : filteredOpportunities.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-white/30" />
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-1">Nenhum resultado</p>
                <p className="text-sm text-white/50 max-w-sm">
                  Não encontramos oportunidades para "{searchQuery}". Tente outro termo.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="border-white/20 text-white/70 hover:text-white hover:bg-white/10">
                Limpar pesquisa
              </Button>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Radar className="w-8 h-8 text-primary/50" />
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-1">Radar ativo</p>
                <p className="text-sm text-white/50 max-w-sm">
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
                          "relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-white/20",
                          "bg-white/5 border-white/10",
                          !opp.is_read && "ring-1 ring-primary/30"
                        )} style={{ borderRadius: '14px' }}>
                          {/* Color accent bar based on level */}
                          <div className={cn(
                            "absolute top-0 left-0 right-0 h-1",
                            opp.opportunity_level === 'advanced' && "bg-primary",
                            opp.opportunity_level === 'intermediate' && "bg-primary/60",
                            opp.opportunity_level === 'basic' && "bg-muted-foreground/30",
                          )} />

                          <CardContent className="p-5 pt-6">
                            {/* Header Row */}
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white leading-tight line-clamp-1">
                                  {opp.company_name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-white/50">{opp.niche || 'Negócio local'}</span>
                                  <Badge variant="outline" className={cn(
                                    "text-[10px] px-1.5 py-0 h-5",
                                    opp.opportunity_level === 'advanced' && "border-cyan-500/50 text-cyan-500",
                                    opp.opportunity_level === 'intermediate' && "border-amber-500/50 text-amber-500",
                                    opp.opportunity_level === 'basic' && "border-muted-foreground/50 text-muted-foreground",
                                  )}>
                                    {levelConfig.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Value Section */}
                            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> Valor Estimado
                                </p>
                                <p className="text-xs text-white/50 mt-1">
                                  R$ {opp.estimated_value_min.toLocaleString()} (mín)
                                </p>
                                <p className="text-base font-bold text-primary">
                                  R$ {opp.estimated_value_max.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-white/40">
                                  📅 Recorrência
                                </p>
                                <p className="text-sm font-semibold text-primary mt-1">
                                  +R$ {opp.monthly_recurrence?.toLocaleString() || '0'}/mês
                                </p>
                              </div>
                            </div>

                            {/* Description */}
                            {opp.ai_description && (
                              <p className="text-xs text-white/50 mb-3 line-clamp-2 leading-relaxed">
                                ✨ {opp.ai_description}
                              </p>
                            )}

                            {/* Location & Contact */}
                            <div className="space-y-1.5 mb-3">
                              <p className="text-xs text-white/50 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 flex-shrink-0 text-white/30" />
                                <span className="truncate">{opp.company_address || opp.company_city || 'Localização não informada'}</span>
                              </p>
                              {opp.company_phone && (
                                <p className="text-xs text-white/50 flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 flex-shrink-0 text-emerald-500/70" />
                                  <span className="truncate">{opp.company_phone}</span>
                                </p>
                              )}
                            </div>

                            {/* Digital Presence Status */}
                            <div className={cn(
                              "flex items-center gap-2 p-2.5 rounded-lg mb-4",
                              !opp.has_website 
                                ? "bg-cyan-500/10" 
                                : "bg-emerald-500/10"
                            )}>
                              {!opp.has_website ? (
                                <>
                                  <XCircle className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                                  <span className="text-xs text-cyan-500 font-medium">
                                    Sem site — Oportunidade máxima
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Globe2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  <span className="text-xs text-emerald-500 font-medium">
                                    Possui site — Pode melhorar
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Service Tags */}
                            {opp.service_tags && opp.service_tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {opp.service_tags.slice(0, 3).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white/50"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Actions - Icon buttons for WhatsApp, Email */}
                            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                              {/* WhatsApp Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (opp.company_phone) {
                                    const cleanPhone = opp.company_phone.replace(/\D/g, '');
                                    // Map country codes to phone codes
                                    const countryPhoneCodes: Record<string, string> = {
                                      'BR': '55', 'USA': '1', 'PT': '351', 'ES': '34',
                                      'MX': '52', 'AR': '54', 'CO': '57', 'CL': '56',
                                      'Europe': '44', 'LATAM': '55'
                                    };
                                    const countryCode = countryPhoneCodes[opp.company_country || 'BR'] || '55';
                                    // Only add country code if not already present
                                    const phone = cleanPhone.startsWith(countryCode) ? cleanPhone : `${countryCode}${cleanPhone}`;
                                    window.open(`https://wa.me/${phone}`, '_blank');
                                  }
                                }}
                                disabled={!opp.company_phone}
                                className={cn(
                                  "h-9 w-9 sm:h-10 sm:w-10 p-0 border-white/20",
                                  opp.company_phone 
                                    ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30" 
                                    : "text-white/20 cursor-not-allowed"
                                )}
                                title={opp.company_phone ? `WhatsApp: ${opp.company_phone}` : 'Telefone não disponível'}
                              >
                                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                              </Button>
                              
                              {/* Email Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (opp.company_email) {
                                    window.open(`mailto:${opp.company_email}`, '_blank');
                                  }
                                }}
                                disabled={!opp.company_email}
                                className={cn(
                                  "h-9 w-9 sm:h-10 sm:w-10 p-0 border-white/20",
                                  opp.company_email 
                                    ? "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30" 
                                    : "text-white/20 cursor-not-allowed"
                                )}
                                title={opp.company_email ? 'Abrir Email' : 'Email não disponível'}
                              >
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                              </Button>

                              {/* Ver Perfil Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(opp);
                                }}
                                className="flex-1 h-9 sm:h-10 border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
                              >
                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                Ver Perfil
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
                      selectedOpportunity.opportunity_level === 'advanced' && "bg-primary/20 text-primary border-primary/30",
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
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Valor Estimado
                  </p>
                  <p className="text-sm text-muted-foreground">Min: R$ {selectedOpportunity.estimated_value_min.toLocaleString()}</p>
                  <p className="text-xl font-bold text-primary">R$ {selectedOpportunity.estimated_value_max.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Recorrência Mensal
                  </p>
                  <p className="text-xl font-bold text-primary">+R$ {selectedOpportunity.monthly_recurrence?.toLocaleString() || '0'}/mês</p>
                </div>
              </div>

              {/* Digital Presence */}
              <div className={cn(
                "p-4 rounded-xl flex items-center gap-3",
                !selectedOpportunity.has_website ? "bg-primary/10 border border-primary/30" : "bg-white/5 border border-white/10"
              )}>
                <Globe2 className={cn("w-5 h-5", !selectedOpportunity.has_website ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-medium", !selectedOpportunity.has_website ? "text-primary" : "text-foreground")}>
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
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedOpportunity.company_phone}
                    onClick={() => {
                      if (selectedOpportunity.company_phone) {
                        const cleanPhone = selectedOpportunity.company_phone.replace(/\D/g, '');
                        const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                        window.open(`https://wa.me/${phone}`, '_blank');
                      }
                    }}
                    className={cn(
                      "h-9 w-9 p-0 border-white/20",
                      selectedOpportunity.company_phone
                        ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                        : "text-white/20 cursor-not-allowed"
                    )}
                    title={selectedOpportunity.company_phone ? 'Abrir WhatsApp' : 'Telefone não disponível'}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedOpportunity.company_email}
                    onClick={() => {
                      if (selectedOpportunity.company_email) {
                        window.open(`mailto:${selectedOpportunity.company_email}`, '_blank');
                      }
                    }}
                    className={cn(
                      "h-9 w-9 p-0 border-white/20",
                      selectedOpportunity.company_email
                        ? "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30"
                        : "text-white/20 cursor-not-allowed"
                    )}
                    title={selectedOpportunity.company_email ? 'Abrir Email' : 'Email não disponível'}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
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

            <ModalFooter className="flex-wrap sm:flex-nowrap">
              <Button
                variant="outline"
                onClick={() => {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedOpportunity.company_name)}`, '_blank');
                }}
                className="gap-2 border-white/20 hover:bg-white/10"
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
                className="gap-2 bg-primary hover:bg-primary/80"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aceitar Projeto
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Auto-scan Filters Modal */}
      <AutoScanFiltersModal
        open={filtersModalOpen}
        onOpenChange={setFiltersModalOpen}
        filters={autoScanFilters}
        onSave={(filters) => saveAutoScanFilters(filters, !autoScanEnabled)}
      />
    </div>
  );
};
