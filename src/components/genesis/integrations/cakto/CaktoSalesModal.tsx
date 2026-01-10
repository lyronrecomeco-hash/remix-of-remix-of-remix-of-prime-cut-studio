/**
 * CAKTO SALES MODAL
 * Modal para exibir vendas por status com atualização em tempo real
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingCart, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  AlertTriangle,
  Search,
  RefreshCw,
  User,
  Phone,
  Mail,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CaktoEvent, CaktoEventType, CAKTO_EVENT_LABELS, CAKTO_EVENT_COLORS } from './types';

interface CaktoSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceId: string;
}

// Tipo para as tabs de status
type SalesTab = 'all' | CaktoEventType;

// Configuração de cada tab
const TABS_CONFIG: { value: SalesTab; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'all', label: 'Todos', icon: TrendingUp, color: 'text-foreground' },
  { value: 'purchase_approved', label: 'Aprovadas', icon: CheckCircle2, color: 'text-green-500' },
  { value: 'initiate_checkout', label: 'Checkout', icon: ShoppingCart, color: 'text-blue-500' },
  { value: 'checkout_abandonment', label: 'Abandonados', icon: AlertTriangle, color: 'text-yellow-500' },
  { value: 'purchase_refused', label: 'Recusadas', icon: XCircle, color: 'text-red-500' },
  { value: 'purchase_refunded', label: 'Reembolsos', icon: RotateCcw, color: 'text-orange-500' },
];

export function CaktoSalesModal({ open, onOpenChange, instanceId }: CaktoSalesModalProps) {
  const [activeTab, setActiveTab] = useState<SalesTab>('all');
  const [events, setEvents] = useState<CaktoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Buscar eventos
  const fetchEvents = useCallback(async () => {
    if (!instanceId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('genesis_cakto_events')
        .select('*')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('event_type', activeTab);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sales:', error);
        return;
      }

      setEvents((data || []) as CaktoEvent[]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [instanceId, activeTab]);

  // Buscar contagens por tipo
  const fetchCounts = useCallback(async () => {
    if (!instanceId) return;

    try {
      const promises = TABS_CONFIG.filter(t => t.value !== 'all').map(async (tab) => {
        const { count } = await supabase
          .from('genesis_cakto_events')
          .select('*', { count: 'exact', head: true })
          .eq('instance_id', instanceId)
          .eq('event_type', tab.value);
        return { type: tab.value, count: count || 0 };
      });

      const results = await Promise.all(promises);
      const countsMap: Record<string, number> = { all: 0 };
      results.forEach(r => {
        countsMap[r.type] = r.count;
        countsMap.all += r.count;
      });
      setCounts(countsMap);
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  }, [instanceId]);

  // Fetch inicial quando abrir
  useEffect(() => {
    if (open) {
      fetchEvents();
      fetchCounts();
    }
  }, [open, fetchEvents, fetchCounts]);

  // Realtime updates
  useEffect(() => {
    if (!open || !instanceId) return;

    const channel = supabase
      .channel(`cakto-sales-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'genesis_cakto_events',
          filter: `instance_id=eq.${instanceId}`,
        },
        (payload) => {
          const newEvent = payload.new as CaktoEvent;
          if (activeTab === 'all' || newEvent.event_type === activeTab) {
            setEvents(prev => [newEvent, ...prev]);
          }
          // Atualizar contagem
          setCounts(prev => ({
            ...prev,
            [newEvent.event_type]: (prev[newEvent.event_type] || 0) + 1,
            all: (prev.all || 0) + 1,
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'genesis_cakto_events',
          filter: `instance_id=eq.${instanceId}`,
        },
        (payload) => {
          const updatedEvent = payload.new as CaktoEvent;
          setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [open, instanceId, activeTab]);

  // Filtrar por busca
  const filteredEvents = events.filter(event => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      event.customer_name?.toLowerCase().includes(searchLower) ||
      event.customer_email?.toLowerCase().includes(searchLower) ||
      event.customer_phone?.includes(search) ||
      event.product_name?.toLowerCase().includes(searchLower)
    );
  });

  // Formatar valor
  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Ícone por tipo de evento
  const getEventIcon = (type: CaktoEventType) => {
    switch (type) {
      case 'purchase_approved': return CheckCircle2;
      case 'purchase_refused': return XCircle;
      case 'purchase_refunded': return RotateCcw;
      case 'checkout_abandonment': return AlertTriangle;
      case 'initiate_checkout': return ShoppingCart;
      default: return CreditCard;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            Vendas & Eventos
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as SalesTab)} 
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-6 pt-4 flex-shrink-0">
              <div className="flex items-center justify-between gap-4 mb-4">
                <TabsList className="h-auto flex-wrap">
                  {TABS_CONFIG.map((tab) => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.value ? '' : tab.color}`} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {counts[tab.value] !== undefined && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {counts[tab.value]}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => { fetchEvents(); fetchCounts(); }}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value={activeTab} className="flex-1 min-h-0 overflow-hidden m-0 px-6 pb-6">
              <div className="h-full overflow-y-auto pr-2">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <TrendingUp className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">Nenhum evento encontrado</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      {search ? 'Nenhum resultado para sua busca.' : 'Os eventos aparecerão aqui assim que chegarem.'}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                      {filteredEvents.map((event, index) => {
                        const Icon = getEventIcon(event.event_type);
                        const colors = CAKTO_EVENT_COLORS[event.event_type];
                        
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.02 }}
                            className={`p-4 rounded-xl border ${colors.bg} ${colors.border} hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${colors.text}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-semibold ${colors.text}`}>
                                        {CAKTO_EVENT_LABELS[event.event_type]}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {event.external_id?.slice(0, 8)}...
                                      </Badge>
                                    </div>
                                    
                                    {/* Customer Info */}
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                      {event.customer_name && (
                                        <div className="flex items-center gap-1">
                                          <User className="w-3.5 h-3.5" />
                                          <span>{event.customer_name}</span>
                                        </div>
                                      )}
                                      {event.customer_phone && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="w-3.5 h-3.5" />
                                          <span>{event.customer_phone}</span>
                                        </div>
                                      )}
                                      {event.customer_email && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="w-3.5 h-3.5" />
                                          <span className="truncate max-w-[150px]">{event.customer_email}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Product Info */}
                                    {event.product_name && (
                                      <div className="flex items-center gap-1 mt-1 text-sm">
                                        <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-foreground">{event.product_name}</span>
                                        {event.offer_name && (
                                          <span className="text-muted-foreground">• {event.offer_name}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Right Side - Value & Time */}
                                  <div className="text-right flex-shrink-0">
                                    {event.order_value && (
                                      <div className="flex items-center gap-1 text-lg font-bold">
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                        <span>{formatCurrency(event.order_value)}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {formatDistanceToNow(new Date(event.created_at), { 
                                          addSuffix: true, 
                                          locale: ptBR 
                                        })}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {format(new Date(event.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                                    </div>
                                  </div>
                                </div>

                                {/* Status badges */}
                                <div className="flex items-center gap-2 mt-2">
                                  {event.processed && (
                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Processado
                                    </Badge>
                                  )}
                                  {event.campaign_triggered_id && (
                                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                                      Campanha Disparada
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
