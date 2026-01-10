/**
 * CAKTO SALES MODAL
 * Modal para exibir vendas por status com atualização em tempo real
 * Inclui tab especial para PIX Não Pago com verificação precisa
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
  CreditCard,
  MessageCircle,
  ExternalLink,
  Banknote,
  Download,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CaktoEvent, CaktoEventType, CAKTO_EVENT_LABELS, CAKTO_EVENT_COLORS } from './types';
import { useCaktoSync } from './hooks/useCaktoSync';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';

interface CaktoSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceId: string;
}

// Tipo para as tabs de status - agora inclui 'pix_unpaid' para PIX não pagos verificados
type SalesTab = 'all' | CaktoEventType | 'pix_unpaid';

// Configuração de cada tab
const TABS_CONFIG: { value: SalesTab; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'all', label: 'Todos', icon: TrendingUp, color: 'text-foreground' },
  { value: 'purchase_approved', label: 'Aprovadas', icon: CheckCircle2, color: 'text-green-500' },
  { value: 'initiate_checkout', label: 'Checkout', icon: ShoppingCart, color: 'text-blue-500' },
  { value: 'pix_generated', label: 'PIX Gerado', icon: CreditCard, color: 'text-purple-500' },
  { value: 'pix_unpaid', label: 'PIX Não Pago', icon: Banknote, color: 'text-red-500' },
  { value: 'checkout_abandonment', label: 'Abandonados', icon: AlertTriangle, color: 'text-yellow-500' },
  { value: 'purchase_refunded', label: 'Reembolsos', icon: RotateCcw, color: 'text-orange-500' },
];

export function CaktoSalesModal({ open, onOpenChange, instanceId }: CaktoSalesModalProps) {
  const [activeTab, setActiveTab] = useState<SalesTab>('all');
  const [events, setEvents] = useState<CaktoEvent[]>([]);
  const [unpaidPixEvents, setUnpaidPixEvents] = useState<CaktoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [initialized, setInitialized] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CaktoEvent | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Hooks
  const { syncOrders, loading: syncLoading } = useCaktoSync();
  const { integration } = useCaktoIntegration(instanceId);

  // Gerar link do WhatsApp
  const generateWhatsAppLink = (phone: string | null, name: string | null) => {
    if (!phone) return null;
    // Limpa o número para apenas dígitos
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá${name ? ` ${name.split(' ')[0]}` : ''}! Vi que você gerou um PIX mas ainda não completou o pagamento. Posso te ajudar com alguma dúvida?`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // Sincronizar pedidos históricos
  const handleSyncOrders = async () => {
    if (!integration?.id) return;
    setSyncing(true);
    try {
      await syncOrders(integration.id, { fullSync: true });
      // Refetch events after sync
      await fetchEvents(activeTab);
      await fetchCounts();
    } finally {
      setSyncing(false);
    }
  };

  // Buscar eventos - agora suporta tab pix_unpaid com verificação
  const fetchEvents = useCallback(async (tab: SalesTab = activeTab) => {
    if (!instanceId) {
      console.log('[CaktoSales] No instanceId provided');
      return;
    }
    
    console.log('[CaktoSales] Fetching events for instance:', instanceId, 'tab:', tab);
    setLoading(true);
    try {
      // Tab especial: PIX Não Pago - busca PIX gerados que NÃO têm purchase_approved posterior
      if (tab === 'pix_unpaid') {
        // 1. Buscar todos os pix_generated e pix_expired
        const { data: pixEvents, error: pixError } = await supabase
          .from('genesis_cakto_events')
          .select('*')
          .eq('instance_id', instanceId)
          .in('event_type', ['pix_generated', 'pix_expired', 'purchase_refused'])
          .order('created_at', { ascending: false });

        if (pixError) {
          console.error('[CaktoSales] Error fetching PIX events:', pixError);
          return;
        }

        // 2. Buscar todos os purchase_approved para verificação
        const { data: approvedEvents, error: approvedError } = await supabase
          .from('genesis_cakto_events')
          .select('external_id, customer_phone, created_at')
          .eq('instance_id', instanceId)
          .eq('event_type', 'purchase_approved');

        if (approvedError) {
          console.error('[CaktoSales] Error fetching approved events:', approvedError);
          return;
        }

        // 3. Criar sets para verificação rápida
        const approvedExternalIds = new Set(approvedEvents?.map(e => e.external_id) || []);
        const approvedPhones = new Set(approvedEvents?.map(e => e.customer_phone).filter(Boolean) || []);

        // 4. Filtrar PIX que NÃO foram pagos posteriormente
        // Um PIX é considerado não pago se:
        // - Não existe purchase_approved com mesmo external_id
        // - E não existe purchase_approved posterior com mesmo customer_phone
        const unpaidPix = (pixEvents || []).filter(pixEvent => {
          // Se já tem aprovação com mesmo ID da transação, está pago
          if (approvedExternalIds.has(pixEvent.external_id)) {
            return false;
          }

          // Verificar se há aprovação posterior para o mesmo telefone
          if (pixEvent.customer_phone) {
            const hasLaterApproval = (approvedEvents || []).some(approved => 
              approved.customer_phone === pixEvent.customer_phone &&
              new Date(approved.created_at) > new Date(pixEvent.created_at)
            );
            if (hasLaterApproval) {
              return false;
            }
          }

          return true;
        });

        console.log('[CaktoSales] Found', unpaidPix.length, 'unpaid PIX events');
        setUnpaidPixEvents(unpaidPix as CaktoEvent[]);
        setEvents(unpaidPix as CaktoEvent[]);
        return;
      }

      // Busca normal para outras tabs
      let query = supabase
        .from('genesis_cakto_events')
        .select('*')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false });

      if (tab !== 'all') {
        query = query.eq('event_type', tab);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[CaktoSales] Error fetching sales:', error);
        return;
      }

      console.log('[CaktoSales] Fetched', data?.length || 0, 'events');
      setEvents((data || []) as CaktoEvent[]);
    } catch (err) {
      console.error('[CaktoSales] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [instanceId, activeTab]);

  // Buscar contagens por tipo - agora inclui contagem de PIX não pagos
  const fetchCounts = useCallback(async () => {
    if (!instanceId) return;

    console.log('[CaktoSales] Fetching counts for instance:', instanceId);
    try {
      // Buscar todos os eventos para contagem correta
      const { data: allEvents, error } = await supabase
        .from('genesis_cakto_events')
        .select('event_type, external_id, customer_phone, created_at')
        .eq('instance_id', instanceId);

      if (error) {
        console.error('[CaktoSales] Error fetching counts:', error);
        return;
      }

      // Separar eventos por tipo
      const eventsByType: Record<string, typeof allEvents> = {};
      (allEvents || []).forEach(event => {
        if (!eventsByType[event.event_type]) {
          eventsByType[event.event_type] = [];
        }
        eventsByType[event.event_type]!.push(event);
      });

      // Contar PIX não pagos
      const pixEvents = [...(eventsByType['pix_generated'] || []), ...(eventsByType['pix_expired'] || []), ...(eventsByType['purchase_refused'] || [])];
      const approvedEvents = eventsByType['purchase_approved'] || [];
      const approvedExternalIds = new Set(approvedEvents.map(e => e.external_id));
      
      const unpaidPixCount = pixEvents.filter(pixEvent => {
        if (approvedExternalIds.has(pixEvent.external_id)) return false;
        if (pixEvent.customer_phone) {
          const hasLaterApproval = approvedEvents.some(approved => 
            approved.customer_phone === pixEvent.customer_phone &&
            new Date(approved.created_at) > new Date(pixEvent.created_at)
          );
          if (hasLaterApproval) return false;
        }
        return true;
      }).length;

      // Contar por tipo
      const countsMap: Record<string, number> = { all: 0, pix_unpaid: unpaidPixCount };
      TABS_CONFIG.filter(t => t.value !== 'all' && t.value !== 'pix_unpaid').forEach(tab => {
        countsMap[tab.value] = (eventsByType[tab.value] || []).length;
      });
      countsMap.all = (allEvents || []).length;

      console.log('[CaktoSales] Counts:', countsMap);
      setCounts(countsMap);
    } catch (err) {
      console.error('[CaktoSales] Error fetching counts:', err);
    }
  }, [instanceId]);

  // Fetch inicial quando abrir
  useEffect(() => {
    if (open && instanceId && !initialized) {
      console.log('[CaktoSales] Initial fetch on open');
      setInitialized(true);
      fetchEvents('all');
      fetchCounts();
    }
    if (!open) {
      setInitialized(false);
    }
  }, [open, instanceId, initialized, fetchEvents, fetchCounts]);

  // Refetch quando tab muda
  useEffect(() => {
    if (open && initialized && instanceId) {
      console.log('[CaktoSales] Tab changed to:', activeTab);
      fetchEvents(activeTab);
    }
  }, [activeTab, open, initialized, instanceId]);

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
  const getEventIcon = (type: CaktoEventType | string) => {
    switch (type) {
      case 'purchase_approved': return CheckCircle2;
      case 'purchase_refused': return Banknote;
      case 'purchase_refunded': return RotateCcw;
      case 'purchase_chargeback': return AlertTriangle;
      case 'checkout_abandonment': return AlertTriangle;
      case 'initiate_checkout': return ShoppingCart;
      case 'pix_generated': return CreditCard;
      case 'pix_expired': return XCircle;
      default: return CreditCard;
    }
  };

  // Verificar se estamos na tab de PIX não pago
  const isPixUnpaidTab = activeTab === 'pix_unpaid';

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
                  {/* Sync button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncOrders}
                    disabled={syncing || syncLoading || !integration?.id}
                    className="gap-2"
                  >
                    {syncing || syncLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="hidden md:inline">Importar Histórico</span>
                  </Button>

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

              {/* Info para tab PIX Não Pago */}
              {isPixUnpaidTab && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <Banknote className="w-4 h-4" />
                    PIX Não Pagos (Verificados)
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lista de clientes que geraram PIX mas NÃO completaram o pagamento. 
                    Verificação: sem aprovação posterior para o mesmo pedido ou telefone.
                  </p>
                </div>
              )}
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
                      {isPixUnpaidTab ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      ) : (
                        <TrendingUp className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      {isPixUnpaidTab ? 'Nenhum PIX pendente!' : 'Nenhum evento encontrado'}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      {isPixUnpaidTab 
                        ? 'Todos os PIX gerados foram pagos ou não há PIX pendentes.'
                        : search ? 'Nenhum resultado para sua busca.' : 'Os eventos aparecerão aqui assim que chegarem.'}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                      {filteredEvents.map((event, index) => {
                        const Icon = getEventIcon(event.event_type);
                        const colors = CAKTO_EVENT_COLORS[event.event_type] || { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/20' };
                        const whatsappLink = generateWhatsAppLink(event.customer_phone, event.customer_name);
                        
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.02 }}
                            className={`p-4 rounded-xl border ${isPixUnpaidTab ? 'bg-red-500/5 border-red-500/20' : colors.bg + ' ' + colors.border} hover:shadow-md transition-shadow cursor-pointer`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-lg ${isPixUnpaidTab ? 'bg-red-500/10' : colors.bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${isPixUnpaidTab ? 'text-red-600' : colors.text}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-semibold ${isPixUnpaidTab ? 'text-red-600' : colors.text}`}>
                                        {isPixUnpaidTab ? 'PIX Não Pago' : CAKTO_EVENT_LABELS[event.event_type]}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {event.external_id?.slice(0, 8)}...
                                      </Badge>
                                      {isPixUnpaidTab && (
                                        <Badge variant="destructive" className="text-xs">
                                          Aguardando
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Customer Info - Enhanced for PIX Unpaid */}
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                      {event.customer_name && (
                                        <div className="flex items-center gap-1">
                                          <User className="w-3.5 h-3.5" />
                                          <span className="font-medium text-foreground">{event.customer_name}</span>
                                        </div>
                                      )}
                                      {event.customer_phone && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="w-3.5 h-3.5" />
                                          <span className="font-medium text-foreground">{event.customer_phone}</span>
                                        </div>
                                      )}
                                      {event.customer_email && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="w-3.5 h-3.5" />
                                          <span className="truncate max-w-[200px]">{event.customer_email}</span>
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

                                  {/* Right Side - Value & Time & WhatsApp Button */}
                                  <div className="text-right flex-shrink-0">
                                    {event.order_value && (
                                      <div className="flex items-center gap-1 text-lg font-bold">
                                        <DollarSign className={`w-4 h-4 ${isPixUnpaidTab ? 'text-red-500' : 'text-green-500'}`} />
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

                                    {/* WhatsApp Button for PIX Unpaid */}
                                    {isPixUnpaidTab && whatsappLink && (
                                      <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        Contatar via WhatsApp
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>

                                {/* Status badges */}
                                <div className="flex items-center gap-2 mt-2">
                                  {event.processed && !isPixUnpaidTab && (
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
                                  {isPixUnpaidTab && !event.customer_phone && (
                                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Sem telefone
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

        {/* Detail Modal for selected event */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-red-500" />
                  Detalhes do Evento
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Customer Details */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Dados do Cliente
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {selectedEvent.customer_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{selectedEvent.customer_name}</span>
                      </div>
                    )}
                    
                    {selectedEvent.customer_phone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono">{selectedEvent.customer_phone}</span>
                        </div>
                        <a
                          href={generateWhatsAppLink(selectedEvent.customer_phone, selectedEvent.customer_name) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      </div>
                    )}
                    
                    {selectedEvent.customer_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedEvent.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Dados do Pedido
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Produto</span>
                      <p className="font-medium">{selectedEvent.product_name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Oferta</span>
                      <p className="font-medium">{selectedEvent.offer_name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Valor</span>
                      <p className="font-bold text-lg text-red-600">{formatCurrency(selectedEvent.order_value)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">ID Externo</span>
                      <p className="font-mono text-sm">{selectedEvent.external_id}</p>
                    </div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Informações de Tempo
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PIX gerado</span>
                    <span className="font-medium">
                      {format(new Date(selectedEvent.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo decorrido</span>
                    <span className="font-medium text-red-600">
                      {formatDistanceToNow(new Date(selectedEvent.created_at), { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {selectedEvent.customer_phone && (
                  <div className="flex gap-2">
                    <a
                      href={generateWhatsAppLink(selectedEvent.customer_phone, selectedEvent.customer_name) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Contatar via WhatsApp
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedEvent(null)}
                    >
                      Fechar
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
