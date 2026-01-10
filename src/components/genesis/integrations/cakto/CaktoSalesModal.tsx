/**
 * CAKTO SALES MODAL
 * Modal para exibir vendas por status com atualização em tempo real
 * Filtro por categoria dropdown organizado + PIX Não Pago verificado
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
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Filter,
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

// Tipo para as categorias de filtro
type FilterCategory = 'all' | CaktoEventType | 'pix_unpaid' | 'boleto_generated' | 'boleto_expired';

// Configuração das categorias de filtro
const FILTER_OPTIONS: { value: FilterCategory; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'all', label: 'Todos os Eventos', icon: TrendingUp, color: 'text-foreground' },
  { value: 'purchase_approved', label: 'Aprovados', icon: CheckCircle2, color: 'text-green-500' },
  { value: 'pix_generated', label: 'PIX Gerado', icon: CreditCard, color: 'text-purple-500' },
  { value: 'pix_unpaid', label: '🔥 PIX Não Pago', icon: Banknote, color: 'text-red-500' },
  { value: 'initiate_checkout', label: 'Checkout Iniciado', icon: ShoppingCart, color: 'text-blue-500' },
  { value: 'checkout_abandonment', label: 'Abandonados', icon: AlertTriangle, color: 'text-yellow-500' },
  { value: 'purchase_refused', label: 'Recusados', icon: XCircle, color: 'text-red-400' },
  { value: 'purchase_refunded', label: 'Reembolsos', icon: RotateCcw, color: 'text-orange-500' },
  { value: 'boleto_generated', label: 'Boleto Gerado', icon: CreditCard, color: 'text-indigo-500' },
];

export function CaktoSalesModal({ open, onOpenChange, instanceId }: CaktoSalesModalProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [events, setEvents] = useState<CaktoEvent[]>([]);
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
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá${name ? ` ${name.split(' ')[0]}` : ''}! Vi que você gerou um PIX mas ainda não completou o pagamento. Posso te ajudar com alguma dúvida?`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // Sincronizar pedidos históricos
  const handleSyncOrders = useCallback(async () => {
    if (!integration?.id) return;
    setSyncing(true);
    try {
      await syncOrders(integration.id, { fullSync: true });
      // Refetch events after sync
      await fetchEvents(activeFilter);
      await fetchCounts();
    } finally {
      setSyncing(false);
    }
  }, [integration?.id, syncOrders]);

  // Buscar eventos com verificação precisa de PIX não pago
  const fetchEvents = useCallback(async (filter: FilterCategory = activeFilter) => {
    if (!instanceId) {
      console.log('[CaktoSales] No instanceId provided');
      return;
    }
    
    console.log('[CaktoSales] Fetching events for instance:', instanceId, 'filter:', filter);
    setLoading(true);
    try {
      // PIX Não Pago: lógica especial para verificar pagamentos
      if (filter === 'pix_unpaid') {
        // 1. Buscar todos os pix_generated
        const { data: pixEvents, error: pixError } = await supabase
          .from('genesis_cakto_events')
          .select('*')
          .eq('instance_id', instanceId)
          .in('event_type', ['pix_generated', 'pix_expired'])
          .order('created_at', { ascending: false });

        if (pixError) {
          console.error('[CaktoSales] Error fetching PIX events:', pixError);
          setEvents([]);
          return;
        }

        // 2. Buscar todos os purchase_approved para cruzamento
        const { data: approvedEvents, error: approvedError } = await supabase
          .from('genesis_cakto_events')
          .select('external_id, customer_phone, created_at')
          .eq('instance_id', instanceId)
          .eq('event_type', 'purchase_approved');

        if (approvedError) {
          console.error('[CaktoSales] Error fetching approved events:', approvedError);
          setEvents([]);
          return;
        }

        // 3. Criar maps para verificação rápida e precisa
        const approvedExternalIds = new Set(approvedEvents?.map(e => e.external_id).filter(Boolean) || []);
        const approvedPhoneMap = new Map<string, Date>();
        
        (approvedEvents || []).forEach(e => {
          if (e.customer_phone) {
            const eventDate = new Date(e.created_at);
            const existing = approvedPhoneMap.get(e.customer_phone);
            if (!existing || eventDate > existing) {
              approvedPhoneMap.set(e.customer_phone, eventDate);
            }
          }
        });

        // 4. Filtrar PIX que NÃO foram pagos - sem duplicatas
        const seenPhones = new Set<string>();
        const unpaidPix = (pixEvents || []).filter(pixEvent => {
          // Verificar se já foi aprovado pelo external_id
          if (pixEvent.external_id && approvedExternalIds.has(pixEvent.external_id)) {
            return false;
          }

          // Verificar se há aprovação posterior para o mesmo telefone
          if (pixEvent.customer_phone) {
            const approvedDate = approvedPhoneMap.get(pixEvent.customer_phone);
            if (approvedDate && approvedDate > new Date(pixEvent.created_at)) {
              return false;
            }
            
            // Evitar duplicatas por telefone (mantém o mais recente)
            if (seenPhones.has(pixEvent.customer_phone)) {
              return false;
            }
            seenPhones.add(pixEvent.customer_phone);
          }

          return true;
        });

        console.log('[CaktoSales] Found', unpaidPix.length, 'unpaid PIX events');
        setEvents(unpaidPix as CaktoEvent[]);
        return;
      }

      // Busca normal para outras categorias
      let query = supabase
        .from('genesis_cakto_events')
        .select('*')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('event_type', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[CaktoSales] Error fetching sales:', error);
        setEvents([]);
        return;
      }

      console.log('[CaktoSales] Fetched', data?.length || 0, 'events');
      setEvents((data || []) as CaktoEvent[]);
    } catch (err) {
      console.error('[CaktoSales] Error:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [instanceId, activeFilter]);

  // Buscar contagens precisas por tipo
  const fetchCounts = useCallback(async () => {
    if (!instanceId) return;

    console.log('[CaktoSales] Fetching counts for instance:', instanceId);
    try {
      // Buscar todos os eventos para contagem
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

      // Calcular PIX não pagos com precisão
      const pixEvents = [...(eventsByType['pix_generated'] || []), ...(eventsByType['pix_expired'] || [])];
      const approvedEvents = eventsByType['purchase_approved'] || [];
      const approvedExternalIds = new Set(approvedEvents.map(e => e.external_id).filter(Boolean));
      const approvedPhoneMap = new Map<string, Date>();
      
      approvedEvents.forEach(e => {
        if (e.customer_phone) {
          const eventDate = new Date(e.created_at);
          const existing = approvedPhoneMap.get(e.customer_phone);
          if (!existing || eventDate > existing) {
            approvedPhoneMap.set(e.customer_phone, eventDate);
          }
        }
      });

      const seenPhones = new Set<string>();
      const unpaidPixCount = pixEvents.filter(pixEvent => {
        if (pixEvent.external_id && approvedExternalIds.has(pixEvent.external_id)) return false;
        if (pixEvent.customer_phone) {
          const approvedDate = approvedPhoneMap.get(pixEvent.customer_phone);
          if (approvedDate && approvedDate > new Date(pixEvent.created_at)) return false;
          if (seenPhones.has(pixEvent.customer_phone)) return false;
          seenPhones.add(pixEvent.customer_phone);
        }
        return true;
      }).length;

      // Montar contagens
      const countsMap: Record<string, number> = { 
        all: (allEvents || []).length, 
        pix_unpaid: unpaidPixCount 
      };
      
      FILTER_OPTIONS.filter(f => f.value !== 'all' && f.value !== 'pix_unpaid').forEach(opt => {
        countsMap[opt.value] = (eventsByType[opt.value] || []).length;
      });

      console.log('[CaktoSales] Counts:', countsMap);
      setCounts(countsMap);
    } catch (err) {
      console.error('[CaktoSales] Error fetching counts:', err);
    }
  }, [instanceId]);

  // Fetch inicial
  useEffect(() => {
    if (open && instanceId && !initialized) {
      console.log('[CaktoSales] Initial fetch on open');
      setInitialized(true);
      fetchEvents('all');
      fetchCounts();
      
      // Auto-sync inicial
      if (integration?.id) {
        handleSyncOrders();
      }
    }
    if (!open) {
      setInitialized(false);
      setActiveFilter('all');
    }
  }, [open, instanceId, initialized, fetchEvents, fetchCounts, integration?.id, handleSyncOrders]);

  // Auto-sync a cada 1 minuto
  useEffect(() => {
    if (!open || !integration?.id) return;
    
    const syncInterval = setInterval(() => {
      console.log('[CaktoSales] Auto-sync triggered (1 min interval)');
      handleSyncOrders();
    }, 60000);
    
    return () => clearInterval(syncInterval);
  }, [open, integration?.id, handleSyncOrders]);

  // Refetch quando filtro muda
  useEffect(() => {
    if (open && initialized && instanceId) {
      console.log('[CaktoSales] Filter changed to:', activeFilter);
      fetchEvents(activeFilter);
    }
  }, [activeFilter, open, initialized, instanceId, fetchEvents]);

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
          if (activeFilter === 'all' || newEvent.event_type === activeFilter) {
            setEvents(prev => [newEvent, ...prev]);
          }
          fetchCounts();
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
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [open, instanceId, activeFilter, fetchCounts]);

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
      case 'purchase_refused': return XCircle;
      case 'purchase_refunded': return RotateCcw;
      case 'purchase_chargeback': return AlertTriangle;
      case 'checkout_abandonment': return AlertTriangle;
      case 'initiate_checkout': return ShoppingCart;
      case 'pix_generated': return CreditCard;
      case 'pix_expired': return XCircle;
      case 'boleto_generated': return CreditCard;
      default: return CreditCard;
    }
  };

  // Cor do evento
  const getEventColor = (type: CaktoEventType | string) => {
    switch (type) {
      case 'purchase_approved': return 'text-green-500 bg-green-500/10';
      case 'purchase_refused': return 'text-red-500 bg-red-500/10';
      case 'purchase_refunded': return 'text-orange-500 bg-orange-500/10';
      case 'purchase_chargeback': return 'text-red-600 bg-red-600/10';
      case 'checkout_abandonment': return 'text-yellow-500 bg-yellow-500/10';
      case 'initiate_checkout': return 'text-blue-500 bg-blue-500/10';
      case 'pix_generated': return 'text-purple-500 bg-purple-500/10';
      case 'pix_expired': return 'text-red-400 bg-red-400/10';
      case 'boleto_generated': return 'text-indigo-500 bg-indigo-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const isPixUnpaidFilter = activeFilter === 'pix_unpaid';
  const currentFilter = FILTER_OPTIONS.find(f => f.value === activeFilter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            Vendas & Eventos
            <Badge variant="secondary" className="ml-2">
              {counts.all || 0} total
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Barra de Filtros Organizada */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Categoria */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterCategory)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {currentFilter && <currentFilter.icon className={`w-4 h-4 ${currentFilter.color}`} />}
                      <span>{currentFilter?.label}</span>
                      {counts[activeFilter] !== undefined && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                          {counts[activeFilter]}
                        </Badge>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2 w-full">
                        <opt.icon className={`w-4 h-4 ${opt.color}`} />
                        <span className="flex-1">{opt.label}</span>
                        {counts[opt.value] !== undefined && (
                          <Badge variant="outline" className="h-5 px-1.5 text-xs">
                            {counts[opt.value]}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            {/* Botão de Sync */}
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
              <span className="hidden md:inline">Sincronizar</span>
            </Button>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-48"
              />
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => { fetchEvents(); fetchCounts(); }}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Info para PIX Não Pago */}
          {isPixUnpaidFilter && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <Banknote className="w-4 h-4" />
                PIX Não Pagos (Verificados)
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Clientes que geraram PIX mas NÃO completaram o pagamento. 
                Verificação precisa: sem aprovação posterior para o mesmo pedido ou telefone.
              </p>
            </div>
          )}
        </div>

        {/* Lista de Eventos */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum evento encontrado</p>
                <p className="text-sm">
                  {activeFilter !== 'all' 
                    ? 'Tente outro filtro ou sincronize os dados'
                    : 'Clique em "Sincronizar" para importar dados'}
                </p>
              </div>
            ) : (
              filteredEvents.map((event, index) => {
                const EventIcon = getEventIcon(event.event_type);
                const colorClass = getEventColor(event.event_type);
                const whatsappLink = generateWhatsAppLink(event.customer_phone, event.customer_name);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="group p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Ícone do evento */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <EventIcon className="w-5 h-5" />
                      </div>

                      {/* Info principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {event.customer_name || 'Cliente'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {CAKTO_EVENT_LABELS[event.event_type as CaktoEventType] || event.event_type}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {event.customer_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {event.customer_phone}
                            </span>
                          )}
                          {event.customer_email && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <Mail className="w-3 h-3" />
                              {event.customer_email}
                            </span>
                          )}
                          {event.product_name && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <Package className="w-3 h-3" />
                              {event.product_name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          <span className="text-muted-foreground/50">
                            ({formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })})
                          </span>
                        </div>
                      </div>

                      {/* Valor e ações */}
                      <div className="flex flex-col items-end gap-2">
                        {event.order_value && (
                          <span className="font-semibold text-lg">
                            {formatCurrency(event.order_value)}
                          </span>
                        )}

                        {/* Ação WhatsApp para PIX não pago */}
                        {isPixUnpaidFilter && whatsappLink && (
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1.5 bg-green-600 hover:bg-green-700"
                            onClick={() => window.open(whatsappLink, '_blank')}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Contatar
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
