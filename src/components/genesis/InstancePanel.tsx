import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Pause,
  Play,
  RefreshCw,
  Settings2,
  Link2,
  Lock,
  Coins,
  AlertCircle,
  CheckCircle2,
  Phone,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { GenesisWhatsAppConnect } from './GenesisWhatsAppConnect';
import { TestMessageModal } from './TestMessageModal';
import { useUnifiedInstanceStatus } from './hooks/useUnifiedInstanceStatus';
import { useInstanceIntegrations, IntegrationProvider } from './hooks/useInstanceIntegrations';
import { IntegrationConfigModal } from './integrations/IntegrationConfigModal';
import { cn } from '@/lib/utils';

// Import integration logos
import shopifyLogo from '@/assets/integrations/shopify.png';
import woocommerceLogo from '@/assets/integrations/woocommerce.png';
import nuvemshopLogo from '@/assets/integrations/nuvemshop.png';
import mercadoshopsLogo from '@/assets/integrations/mercadoshops.png';
import rdstationLogo from '@/assets/integrations/rdstation.png';
import caktoLogo from '@/assets/integrations/cakto-logo.png';
import caktoIcon from '@/assets/integrations/cakto-icon.png';

// Cakto Panel
import { CaktoPanel } from './integrations/cakto';

interface Instance {
  id: string;
  name: string;
  phone_number?: string;
  status: string;
  is_paused: boolean;
  created_at: string;
  backend_url?: string;
  backend_token?: string;
  last_heartbeat?: string;
  effective_status?: string;
  orchestrated_status?: string;
}

interface InstancePanelProps {
  instance: Instance;
  onBack: () => void;
}

// Integration cards
const integrations = [
  { id: 'shopify', name: 'Shopify', description: 'E-commerce global', logo: shopifyLogo },
  { id: 'woocommerce', name: 'WooCommerce', description: 'Plugin WordPress', logo: woocommerceLogo },
  { id: 'nuvemshop', name: 'Nuvemshop', description: 'E-commerce LATAM', logo: nuvemshopLogo },
  { id: 'mercadoshops', name: 'Mercado Shops', description: 'Mercado Livre', logo: mercadoshopsLogo },
  { id: 'rdstation', name: 'RD Station', description: 'Marketing CRM', logo: rdstationLogo },
  { id: 'cakto', name: 'Cakto', description: 'Infoprodutos', logo: caktoLogo },
];

export function InstancePanel({ instance: initialInstance, onBack }: InstancePanelProps) {
  const [instance, setInstance] = useState<Instance>(initialInstance);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [events, setEvents] = useState({
    message_received: true,
    message_sent: true,
    connection_status: true,
  });
  const [saving, setSaving] = useState(false);
  
  /**
   * FASE 1: Hook unificado é a ÚNICA fonte de verdade
   * - Consome orchestrated_status do banco
   * - Calcula isUsable baseado em heartbeat (FASE 2)
   * - Nunca calcula status localmente
   */
  const { status: unifiedStatus } = useUnifiedInstanceStatus(instance.id);
  
  // Modais
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  
  // Cakto Panel state
  const [showCaktoPanel, setShowCaktoPanel] = useState(false);
  
  // Integration config modal
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
  const [showIntegrationConfig, setShowIntegrationConfig] = useState(false);
  
  // Hook de integrações
  const { integrations: instanceIntegrations, loading: integrationsLoading, refetch: refetchIntegrations, getIntegration, getStatus } = useInstanceIntegrations(instance.id);
  
  // Check if Cakto is connected
  const caktoStatus = getStatus('cakto' as IntegrationProvider);
  const isCaktoConnected = caktoStatus === 'connected';
  
  // Colapsável
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);

  // Backend GLOBAL sempre disponível via fallback nativo no proxy
  // Não precisamos mais validar pois há fallback hardcoded
  const hasGlobalBackend = true;

  // Variáveis derivadas da instância
  const instanceCode = `genesis-${instance.id.slice(0, 8)}`;
  const endpoint = `https://api.genesis.com.br/instances/${instanceCode}`;

  const fetchInstance = async () => {
    const { data, error } = await supabase
      .from('genesis_instances')
      .select('*')
      .eq('id', instance.id)
      .single();

    if (!error && data) {
      setInstance(data as Instance);
    }
  };

  // Polling automático para manter status sincronizado
  useEffect(() => {
    fetchInstance();
    
    const interval = setInterval(fetchInstance, 5000);
    
    // Realtime subscription para updates instantâneos
    const channel = supabase
      .channel(`instance-${instance.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'genesis_instances',
          filter: `id=eq.${instance.id}`,
        },
        (payload) => {
          if (payload.new) {
            setInstance(payload.new as Instance);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [instance.id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    toast.success('Configurações salvas!');
    setSaving(false);
  };

  const handleAction = async (action: string) => {
    if (action === 'Pausar') {
      await supabase
        .from('genesis_instances')
        .update({ is_paused: true })
        .eq('id', instance.id);
      toast.success('Instância pausada');
      fetchInstance();
    } else if (action === 'Retomar') {
      await supabase
        .from('genesis_instances')
        .update({ is_paused: false })
        .eq('id', instance.id);
      toast.success('Instância retomada');
      fetchInstance();
    } else {
      toast.info(`${action} - Em implementação`);
    }
  };

  /**
   * FASE 1: Status derivado APENAS do hook unificado
   * - orchestratedStatus é a verdade absoluta
   * - isUsable indica se podemos confiar na conexão (FASE 2)
   * - Frontend NUNCA calcula status, apenas consome
   */
  const isConnected = unifiedStatus.orchestratedStatus === 'connected';
  const isUsable = unifiedStatus.isUsable;
  
  const formattedPhone = instance.phone_number 
    ? instance.phone_number.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')
    : null;

  // If Cakto panel is open, show only that
  if (showCaktoPanel) {
    return (
      <CaktoPanel 
        instanceId={instance.id} 
        onBack={() => setShowCaktoPanel(false)} 
      />
    );
  }

  return (
    <div className="space-y-4 w-full">
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 1 — IDENTIDADE DA INSTÂNCIA (TOPO) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Lado Esquerdo - Nome e Voltar */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-primary">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold leading-none">{instance.name}</h1>
                </div>
              </div>

              {/* Lado Direito - Status e Métricas */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Principal */}
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "gap-2 px-4 py-2 text-sm font-semibold",
                    isConnected 
                      ? "bg-green-500/15 text-green-600 border-2 border-green-500/30" 
                      : "bg-red-500/15 text-red-600 border-2 border-red-500/30"
                  )}
                >
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full animate-pulse",
                    isConnected ? "bg-green-500" : "bg-red-500"
                  )} />
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </Badge>

                {/* Consumo Diário (removido do header conforme solicitado) */}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 2 — CONEXÃO WHATSAPP (LIMPO) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <GenesisWhatsAppConnect 
          instance={instance} 
          onRefresh={fetchInstance} 
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 3 — NÚMERO CONECTADO */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isConnected && instance.phone_number && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-green-500/30 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      Número WhatsApp
                    </p>
                    <p className="font-semibold text-foreground text-base mt-0.5">{formattedPhone}</p>
                  </div>
                  <code className="text-xs text-muted-foreground font-mono hidden sm:block">
                    {instance.phone_number}@s.whatsapp.net
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(instance.phone_number || '', 'Número')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 4 — AÇÕES RÁPIDAS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="gap-3 h-20 text-base font-medium border-2 hover:border-primary/50 hover:bg-primary/5 transition-all flex-col"
            onClick={() => setShowActionsModal(true)}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <span>Ações Rápidas</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-3 h-20 text-base font-medium border-2 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex-col"
            onClick={() => setShowWebhookModal(true)}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <span>Webhook</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-3 h-20 text-base font-medium border-2 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all flex-col"
            onClick={() => setShowCreditsModal(true)}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-500" />
            </div>
            <span>Créditos</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="gap-3 h-20 text-base font-medium border-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex-col"
            onClick={() => setShowTestModal(true)}
            disabled={!isConnected}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <span>Testes</span>
          </Button>

          {/* Cakto Button - Only shows if integration is connected */}
          {isCaktoConnected && (
            <Button 
              variant="outline" 
              className="gap-3 h-20 text-base font-medium border-2 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex-col"
              onClick={() => setShowCaktoPanel(true)}
            >
              <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                <img src={caktoIcon} alt="Cakto" className="w-6 h-6 object-contain" />
              </div>
              <span>Cakto</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 5 — INTEGRAÇÕES (RESUMO + MODAL) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => setShowIntegrationsModal(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Link2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Integrações</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Conecte com e-commerces, CRMs e ferramentas de marketing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                  {integrations.length} disponíveis
                </Badge>
                <Button variant="ghost" size="icon" className="w-10 h-10">
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BLOCO 6 — INFORMAÇÕES TÉCNICAS (COLAPSÁVEL) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Collapsible open={showTechnicalInfo} onOpenChange={setShowTechnicalInfo}>
          <Card className="border">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Settings2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    Informações Técnicas
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm font-normal">
                      {showTechnicalInfo ? 'Ocultar' : 'Mostrar'}
                    </span>
                    {showTechnicalInfo ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        ID da Instância
                      </Label>
                      <code className="text-base font-mono block mt-2 text-foreground">{instanceCode}</code>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => copyToClipboard(instanceCode, 'Código')}>
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Endpoint da API
                      </Label>
                      <code className="text-sm font-mono block mt-2 text-foreground truncate">{endpoint}</code>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => copyToClipboard(endpoint, 'Endpoint')}>
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        ID Completo
                      </Label>
                      <code className="text-xs font-mono block mt-2 text-foreground truncate opacity-70">{instance.id}</code>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => copyToClipboard(instance.id, 'ID')}>
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Nota: Script VPS deve ser configurado via WhatsApp Automação no Painel Owner */}
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground">
                    💡 Para configurar o backend VPS, acesse <strong>WhatsApp Automação</strong> no painel administrativo.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAIS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Modal: Ações Rápidas */}
      <Dialog open={showActionsModal} onOpenChange={setShowActionsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-primary" />
              </div>
              Ações Rápidas
            </DialogTitle>
            <DialogDescription className="text-base">
              Gerencie sua instância WhatsApp de forma simples e rápida
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 pt-4">
            {instance.is_paused ? (
              <Button 
                variant="outline" 
                className="gap-4 justify-start h-16 text-base border-2 hover:border-green-500/50 hover:bg-green-500/5" 
                onClick={() => { handleAction('Retomar'); setShowActionsModal(false); }}
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Retomar Instância</p>
                  <p className="text-xs text-muted-foreground">Reativar a conexão</p>
                </div>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="gap-4 justify-start h-16 text-base border-2 hover:border-amber-500/50 hover:bg-amber-500/5" 
                onClick={() => { handleAction('Pausar'); setShowActionsModal(false); }}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Pause className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Pausar Instância</p>
                  <p className="text-xs text-muted-foreground">Economize créditos</p>
                </div>
              </Button>
            )}
            <Button 
              variant="outline" 
              className="gap-4 justify-start h-16 text-base border-2 hover:border-blue-500/50 hover:bg-blue-500/5" 
              onClick={() => { handleAction('Reiniciar'); setShowActionsModal(false); }}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Reiniciar Conexão</p>
                <p className="text-xs text-muted-foreground">Reconectar WhatsApp</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="gap-4 justify-start h-16 text-base border-2 hover:border-purple-500/50 hover:bg-purple-500/5" 
              onClick={() => { handleAction('Contatos'); setShowActionsModal(false); }}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Exportar Contatos</p>
                <p className="text-xs text-muted-foreground">Download em CSV</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Webhook */}
      <Dialog open={showWebhookModal} onOpenChange={setShowWebhookModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              Configurar Webhook
            </DialogTitle>
            <DialogDescription className="text-base">
              Receba eventos em tempo real na sua aplicação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <Label className="text-sm font-medium">URL do Webhook</Label>
              <Input 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://seu-servidor.com/webhook"
                className="mt-2 h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Eventos para Enviar</Label>
              {Object.entries(events).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                  <div>
                    <p className="font-medium">
                      {key === 'message_received' && 'Mensagens Recebidas'}
                      {key === 'message_sent' && 'Mensagens Enviadas'}
                      {key === 'connection_status' && 'Status da Conexão'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {key === 'message_received' && 'Notificar quando receber mensagens'}
                      {key === 'message_sent' && 'Notificar quando enviar mensagens'}
                      {key === 'connection_status' && 'Notificar mudanças de status'}
                    </p>
                  </div>
                  <Switch 
                    checked={value}
                    onCheckedChange={(checked) => setEvents(e => ({ ...e, [key]: checked }))}
                  />
                </div>
              ))}
            </div>

            <Button 
              onClick={() => { handleSaveSettings(); setShowWebhookModal(false); }} 
              disabled={saving} 
              className="w-full h-12 text-base gap-2"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Consumo de Créditos */}
      <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-500" />
              </div>
              Consumo de Créditos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Destaque Principal */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-2 border-amber-500/30">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 flex items-center justify-center shadow-xl shadow-amber-500/20">
                  <Coins className="w-10 h-10 text-amber-500" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-amber-600">15</p>
                  <p className="text-base text-muted-foreground">créditos por dia</p>
                  <p className="text-sm text-muted-foreground">por instância ativa</p>
                </div>
              </div>
            </div>

            {/* Explicações */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">Cobrança Automática</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Os créditos são debitados automaticamente uma vez por dia enquanto a instância estiver conectada e ativa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Pause className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Pause para Economizar</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Instâncias pausadas não consomem créditos. Pause quando não estiver usando para economizar seus créditos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Renovação Diária</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    O consumo é calculado diariamente às 00:00. A cobrança é feita apenas nos dias em que a instância estiver ativa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Integrações */}
      <Dialog open={showIntegrationsModal} onOpenChange={setShowIntegrationsModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              Integrações Disponíveis
            </DialogTitle>
            <DialogDescription className="text-base">
              Conecte sua instância com as principais plataformas do mercado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            {integrationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              integrations.map((integration) => {
                const status = getStatus(integration.id as IntegrationProvider);
                const existingIntegration = getIntegration(integration.id as IntegrationProvider);
                const isConnected = status === 'connected';
                const hasError = status === 'error';

                return (
                  <div 
                    key={integration.id} 
                    className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    {/* Ícones maiores */}
                    <div className="w-16 h-16 rounded-xl bg-white border-2 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <img 
                        src={integration.logo} 
                        alt={integration.name} 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base">{integration.name}</p>
                        {isConnected && (
                          <Badge variant="default" className="text-xs bg-green-500/20 text-green-600 border-green-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Conectado
                          </Badge>
                        )}
                        {hasError && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      {existingIntegration?.store_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">{existingIntegration.store_name}</p>
                      )}
                    </div>
                    <Button 
                      variant={isConnected ? "outline" : "default"} 
                      size="sm" 
                      className="gap-2 px-4"
                      onClick={() => {
                        setSelectedProvider(integration.id as IntegrationProvider);
                        setShowIntegrationConfig(true);
                      }}
                    >
                      {isConnected ? (
                        <>
                          <Settings2 className="w-3.5 h-3.5" />
                          Configurar
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3.5 h-3.5" />
                          Conectar
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configuração de Integração */}
      <IntegrationConfigModal
        isOpen={showIntegrationConfig}
        onClose={() => {
          setShowIntegrationConfig(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        instanceId={instance.id}
        existingIntegration={selectedProvider ? getIntegration(selectedProvider) : null}
        onSuccess={refetchIntegrations}
      />

      {/* Modal de Teste de Mensagem */}
      <TestMessageModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        instanceId={instance.id}
        instanceName={instance.name}
      />
    </div>
  );
}
