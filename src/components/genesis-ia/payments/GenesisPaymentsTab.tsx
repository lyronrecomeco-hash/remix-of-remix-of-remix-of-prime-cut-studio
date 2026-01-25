/**
 * GENESIS IA - Payments Management Tab
 * Painel completo de gerenciamento de pagamentos
 * Acesso restrito: lyronrp@gmail.com
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ArrowLeft, 
  RefreshCw, 
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  Bell,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/checkout/validators';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GatewayConfigSection } from './GatewayConfigSection';
import { PlansConfigSection } from './PlansConfigSection';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface GenesisPaymentsTabProps {
  userId?: string;
  onBack?: () => void;
}

interface Payment {
  id: string;
  payment_code: string;
  amount_cents: number;
  status: string;
  payment_method: string;
  description: string | null;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
  customer_id: string | null;
  pix_br_code: string | null;
  abacatepay_billing_id: string | null;
  customer_name?: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  checkout_customers?: {
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

interface PaymentEvent {
  id: string;
  payment_id: string;
  event_type: string;
  event_data: unknown;
  source: string;
  created_at: string;
}

interface WebhookConfig {
  id: string;
  webhook_secret: string;
  is_active: boolean;
  last_received_at: string | null;
}

interface PaymentStats {
  totalPayments: number;
  totalPaid: number;
  totalPending: number;
  totalExpired: number;
  totalRevenue: number;
  todayPayments: number;
  todayRevenue: number;
}

export function GenesisPaymentsTab({ userId, onBack }: GenesisPaymentsTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState('payments');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefunding, setIsRefunding] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadPayments(),
        loadWebhookConfig(),
        loadStats(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    }
    setIsLoading(false);
  };

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from('checkout_payments')
      .select(`
        *,
        checkout_customers (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    
    const now = new Date();
    
    // Map customer data and check expiration locally
    const paymentsWithData = (data || []).map((p: Payment) => {
      // Check if payment is expired locally (pending + past expires_at)
      const isLocallyExpired = p.status === 'pending' && p.expires_at && new Date(p.expires_at) < now;
      
      return {
        ...p,
        status: isLocallyExpired ? 'expired' : p.status,
        customer_name: p.checkout_customers 
          ? `${p.checkout_customers.first_name} ${p.checkout_customers.last_name}`.trim()
          : null,
        customer_email: p.checkout_customers?.email || null,
        customer_phone: p.checkout_customers?.phone || null,
      };
    });
    
    setPayments(paymentsWithData);
  };

  const loadWebhookConfig = async () => {
    const { data } = await supabase
      .from('checkout_webhook_config')
      .select('*')
      .eq('is_active', true)
      .single();

    setWebhookConfig(data);
  };

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    const { data: allPayments } = await supabase
      .from('checkout_payments')
      .select('status, amount_cents, created_at, paid_at, expires_at');

    if (allPayments) {
      // Apply local expiration check to stats too
      const processedPayments = allPayments.map(p => ({
        ...p,
        status: (p.status === 'pending' && p.expires_at && new Date(p.expires_at) < now) ? 'expired' : p.status
      }));
      
      const todayPayments = processedPayments.filter(p => 
        p.created_at.startsWith(today)
      );
      
      const paidPayments = processedPayments.filter(p => p.status === 'paid');
      const todayPaid = paidPayments.filter(p => p.paid_at?.startsWith(today));

      setStats({
        totalPayments: processedPayments.length,
        totalPaid: paidPayments.length,
        totalPending: processedPayments.filter(p => p.status === 'pending').length,
        totalExpired: processedPayments.filter(p => p.status === 'expired').length,
        totalRevenue: paidPayments.reduce((acc, p) => acc + p.amount_cents, 0),
        todayPayments: todayPayments.length,
        todayRevenue: todayPaid.reduce((acc, p) => acc + p.amount_cents, 0),
      });
    }
  };

  const loadPaymentEvents = async (paymentId: string) => {
    const { data } = await supabase
      .from('checkout_payment_events')
      .select('*')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: false });

    setEvents(data || []);
  };

  const generateWebhookSecret = async () => {
    const secret = `wh_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;
    
    // Deactivate old secrets
    await supabase
      .from('checkout_webhook_config')
      .update({ is_active: false })
      .eq('is_active', true);

    // Create new secret
    const { data, error } = await supabase
      .from('checkout_webhook_config')
      .insert({
        webhook_secret: secret,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao gerar secret');
      return;
    }

    setWebhookConfig(data);
    toast.success('Novo webhook secret gerado!');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;
    
    setIsRefunding(true);
    try {
      const { data, error } = await supabase.functions.invoke('checkout-refund-payment', {
        body: { paymentCode: selectedPayment.payment_code }
      });

      if (error) {
        console.error('Refund error:', error);
        toast.error(error.message || 'Erro ao processar reembolso');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Reembolso processado com sucesso!');
      setShowRefundConfirm(false);
      setSelectedPayment(null);
      loadData();
    } catch (err) {
      console.error('Refund exception:', err);
      toast.error('Erro ao processar reembolso');
    } finally {
      setIsRefunding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ElementType; label: string }> = {
      pending: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock, label: 'Pendente' },
      paid: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle, label: 'Pago' },
      expired: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Expirado' },
      failed: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertTriangle, label: 'Falhou' },
      refunded: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: RefreshCw, label: 'Estornado' },
    };
    
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.payment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const webhookUrl = 'https://genesishub.cloud/functions/v1/checkout-webhook';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              Gerenciamento de Pagamentos
            </h1>
            <p className="text-sm text-white/60">AbacatePay • Checkout Seguro</p>
          </div>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Receita Total</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Pagamentos Pagos</p>
                  <p className="text-lg font-bold text-white">{stats.totalPaid}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Pendentes</p>
                  <p className="text-lg font-bold text-white">{stats.totalPending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Hoje</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(stats.todayRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="gateway">Gateway</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="test">Teste PIX</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'paid', 'expired'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="text-xs"
                >
                  {status === 'all' ? 'Todos' : getStatusBadge(status)}
                </Button>
              ))}
            </div>
          </div>

          {/* Payments List */}
          <Card className="bg-white/5 border-white/10">
            <div className="p-4 space-y-3">
              {paginatedPayments.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum pagamento encontrado</p>
                </div>
              ) : (
                paginatedPayments.map((payment) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
                    onClick={() => {
                      setSelectedPayment(payment);
                      loadPaymentEvents(payment.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">
                              {payment.customer_name || 'Cliente não identificado'}
                            </span>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-xs text-white/50">
                            {payment.description || 'Pagamento'} • {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">{formatCurrency(payment.amount_cents)}</p>
                        <p className="text-xs text-white/50">{payment.payment_method || 'PIX'}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-white/50">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)} de {filteredPayments.length}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === pageNum}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <PlansConfigSection />
        </TabsContent>

        {/* Gateway Config Tab */}
        <TabsContent value="gateway" className="space-y-4">
          <GatewayConfigSection />
        </TabsContent>

        <TabsContent value="webhook" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="w-5 h-5 text-emerald-400" />
                Configuração do Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Webhook URL */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">URL do Webhook</label>
                <div className="flex gap-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="font-mono text-xs bg-white/5 border-white/10"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(webhookUrl, 'URL')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">Secret</label>
                <div className="flex gap-2">
                  <Input
                    value={webhookConfig?.webhook_secret || 'Nenhum secret configurado'}
                    readOnly
                    type="password"
                    className="font-mono text-xs bg-white/5 border-white/10"
                  />
                  {webhookConfig && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(webhookConfig.webhook_secret, 'Secret')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={generateWebhookSecret}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {webhookConfig ? 'Regenerar' : 'Gerar'}
                  </Button>
                </div>
              </div>

              {webhookConfig?.last_received_at && (
                <p className="text-xs text-white/40">
                  Último evento recebido: {format(new Date(webhookConfig.last_received_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                </p>
              )}

              {/* Instructions */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <h4 className="text-sm font-semibold text-blue-300">Como configurar no AbacatePay:</h4>
                <ol className="text-xs text-white/60 space-y-1 list-decimal list-inside">
                  <li>Acesse o painel da AbacatePay</li>
                  <li>Vá em Configurações → Webhooks</li>
                  <li>Cole a URL acima no campo "URL de destino"</li>
                  <li>Cole o Secret no campo "Secret" (ou use query param ?secret=...)</li>
                  <li>Selecione o evento: <code className="px-1 py-0.5 rounded bg-white/10">billing.paid</code></li>
                  <li>Salve as configurações</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-emerald-400" />
                Link de Teste - R$ 1,00
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-white/60">
                Use este link para testar o checkout com um pagamento real de R$ 1,00 via PIX.
              </p>

              <div className="flex gap-2">
                <Input
                  value="https://genesishub.cloud/checkout?amount=100&description=Teste%20PIX%20-%20R%241"
                  readOnly
                  className="font-mono text-xs bg-white/5 border-white/10"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard('https://genesishub.cloud/checkout?amount=100&description=Teste%20PIX%20-%20R%241', 'Link')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.open('/checkout?amount=100&description=Teste%20PIX%20-%20R%241', '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="text-sm font-semibold text-emerald-300 mb-2">Link PIX R$ 1,00</h4>
                <code className="text-xs text-white/70 break-all">
                  {window.location.origin}/checkout?amount=100&description=Teste%20PIX%20-%20R%241
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Detail Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Detalhes do Pagamento</h3>
                  {getStatusBadge(selectedPayment.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/50">Cliente</span>
                    <span className="font-semibold text-white">{selectedPayment.customer_name || 'Não identificado'}</span>
                  </div>
                  {selectedPayment.customer_email && (
                    <div className="flex justify-between">
                      <span className="text-white/50">E-mail</span>
                      <span className="text-white text-sm">{selectedPayment.customer_email}</span>
                    </div>
                  )}
                  {selectedPayment.customer_phone && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Telefone</span>
                      <span className="text-white text-sm">{selectedPayment.customer_phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/50">Código</span>
                    <span className="font-mono text-xs text-white/70">{selectedPayment.payment_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Valor</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(selectedPayment.amount_cents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Método</span>
                    <span className="text-white">{selectedPayment.payment_method || 'PIX'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Criado em</span>
                    <span className="text-white">{format(new Date(selectedPayment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  </div>
                  {selectedPayment.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-white/50">Pago em</span>
                      <span className="text-emerald-400">{format(new Date(selectedPayment.paid_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                    </div>
                  )}
                </div>

                {/* Events */}
                {events.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3">Eventos</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {events.map((event) => (
                        <div key={event.id} className="p-2 rounded-lg bg-white/5 text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium text-white">{event.event_type}</span>
                            <span className="text-white/40">{format(new Date(event.created_at), 'HH:mm:ss')}</span>
                          </div>
                          <span className="text-white/50">{event.source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refund Button - Only show for paid payments */}
                {selectedPayment.status === 'paid' && !showRefundConfirm && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowRefundConfirm(true)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reembolsar Integralmente
                  </Button>
                )}

                {/* Refund Confirmation */}
                {showRefundConfirm && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-300">Confirmar Reembolso</h4>
                        <p className="text-sm text-white/60 mt-1">
                          Você está prestes a reembolsar <span className="font-bold text-red-400">{formatCurrency(selectedPayment.amount_cents)}</span> para o cliente.
                        </p>
                        <p className="text-xs text-white/40 mt-2">
                          Esta ação não pode ser desfeita.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowRefundConfirm(false)}
                        disabled={isRefunding}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleRefund}
                        disabled={isRefunding}
                      >
                        {isRefunding ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Confirmar Reembolso
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowRefundConfirm(false);
                    setSelectedPayment(null);
                  }}
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for Zap icon
function Zap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
