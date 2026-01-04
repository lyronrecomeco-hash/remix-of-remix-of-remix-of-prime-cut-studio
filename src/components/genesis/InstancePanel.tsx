import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Pause,
  Play,
  RefreshCw,
  Download,
  Settings2,
  Link2,
  Lock,
  Coins,
  AlertCircle,
  CheckCircle2,
  Phone,
  X,
  Info,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { GenesisWhatsAppConnect } from './GenesisWhatsAppConnect';
import { cn } from '@/lib/utils';

// Import integration logos
import shopifyLogo from '@/assets/integrations/shopify.png';
import woocommerceLogo from '@/assets/integrations/woocommerce.png';
import nuvemshopLogo from '@/assets/integrations/nuvemshop.png';
import mercadoshopsLogo from '@/assets/integrations/mercadoshops.png';
import rdstationLogo from '@/assets/integrations/rdstation.png';

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
}

interface InstancePanelProps {
  instance: Instance;
  onBack: () => void;
}

// Integration cards
const integrations = [
  { id: 'shopify', name: 'Shopify', description: 'Loja Shopify', logo: shopifyLogo },
  { id: 'woocommerce', name: 'WooCommerce', description: 'Loja WooCommerce', logo: woocommerceLogo },
  { id: 'nuvemshop', name: 'Nuvemshop', description: 'Nuvemshop', logo: nuvemshopLogo },
  { id: 'mercadoshops', name: 'Mercado Shops', description: 'Mercado Shops', logo: mercadoshopsLogo },
  { id: 'rdstation', name: 'RD Station', description: 'RD Station', logo: rdstationLogo },
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
  
  // Modais
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

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

  useEffect(() => {
    fetchInstance();
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

  const isConnected = instance.effective_status === 'connected' || instance.status === 'connected';
  const formattedPhone = instance.phone_number 
    ? instance.phone_number.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-primary">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold">{instance.name}</h1>
        </div>
        <Badge 
          variant="secondary" 
          className={cn(
            "gap-2 px-3 py-1",
            isConnected 
              ? "bg-green-500/10 text-green-600 border-green-500/20" 
              : "bg-red-500/10 text-red-600 border-red-500/20"
          )}
        >
          {isConnected ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {isConnected ? 'Conectado' : 'Desconectado'}
        </Badge>
      </motion.div>

      {/* Grid Principal - 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Conexão WhatsApp */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          {/* Conexão WhatsApp */}
          <GenesisWhatsAppConnect 
            instance={instance} 
            onRefresh={fetchInstance} 
          />

          {/* Número Conectado */}
          {isConnected && instance.phone_number && (
            <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Número Conectado</p>
                    <p className="font-bold text-green-600 text-lg truncate">{formattedPhone}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => copyToClipboard(instance.phone_number || '', 'Número')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Coluna Direita - Ações e Informações */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="gap-2 h-12 text-sm"
              onClick={() => setShowActionsModal(true)}
            >
              <Settings2 className="w-5 h-5" />
              Ações Rápidas
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 h-12 text-sm"
              onClick={() => setShowWebhookModal(true)}
            >
              <Zap className="w-5 h-5" />
              Webhook
            </Button>
          </div>

          {/* Aviso de Créditos */}
          <Card 
            className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent cursor-pointer hover:border-amber-500/40 transition-colors"
            onClick={() => setShowCreditsModal(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-amber-600">15 créditos/dia</p>
                  <p className="text-sm text-muted-foreground">Toque para mais informações</p>
                </div>
                <Info className="w-5 h-5 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>

          {/* API Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                API
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">ID da Instância</Label>
                  <code className="text-sm font-mono block truncate mt-1">{instanceCode}</code>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => copyToClipboard(instanceCode, 'Código')}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Endpoint</Label>
                  <code className="text-sm font-mono block truncate mt-1">{endpoint}</code>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => copyToClipboard(endpoint, 'Endpoint')}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Integrações */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Integrações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {integrations.map((integration) => (
                <div 
                  key={integration.id} 
                  className="p-4 rounded-xl border bg-muted/20 opacity-50 text-center hover:opacity-70 transition-opacity"
                >
                  <div className="h-10 mb-2 flex items-center justify-center">
                    <img 
                      src={integration.logo} 
                      alt={integration.name} 
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <p className="text-sm font-medium">{integration.name}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Em breve
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal: Ações Rápidas */}
      <Dialog open={showActionsModal} onOpenChange={setShowActionsModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Ações Rápidas
            </DialogTitle>
            <DialogDescription>
              Gerencie sua instância WhatsApp
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 pt-2">
            {instance.is_paused ? (
              <Button variant="outline" className="gap-2 justify-start" onClick={() => { handleAction('Retomar'); setShowActionsModal(false); }}>
                <Play className="w-4 h-4 text-green-500" />
                Retomar Instância
              </Button>
            ) : (
              <Button variant="outline" className="gap-2 justify-start" onClick={() => { handleAction('Pausar'); setShowActionsModal(false); }}>
                <Pause className="w-4 h-4 text-amber-500" />
                Pausar Instância
              </Button>
            )}
            <Button variant="outline" className="gap-2 justify-start" onClick={() => { handleAction('Reiniciar'); setShowActionsModal(false); }}>
              <RefreshCw className="w-4 h-4 text-blue-500" />
              Reiniciar Conexão
            </Button>
            <Button variant="outline" className="gap-2 justify-start" onClick={() => { handleAction('Contatos'); setShowActionsModal(false); }}>
              <Download className="w-4 h-4 text-purple-500" />
              Exportar Contatos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Webhook */}
      <Dialog open={showWebhookModal} onOpenChange={setShowWebhookModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Configurar Webhook
            </DialogTitle>
            <DialogDescription>
              Receba eventos em tempo real na sua aplicação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm">URL do Webhook</Label>
              <Input 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://seu-servidor.com/webhook"
                className="mt-1.5"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Eventos</Label>
              {Object.entries(events).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <span className="text-sm">
                    {key === 'message_received' && 'Mensagens recebidas'}
                    {key === 'message_sent' && 'Mensagens enviadas'}
                    {key === 'connection_status' && 'Status da conexão'}
                  </span>
                  <Switch 
                    checked={value}
                    onCheckedChange={(checked) => setEvents(e => ({ ...e, [key]: checked }))}
                  />
                </div>
              ))}
            </div>

            <Button onClick={() => { handleSaveSettings(); setShowWebhookModal(false); }} disabled={saving} className="w-full gap-2">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Consumo de Créditos */}
      <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              Consumo de Créditos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">15 créditos</p>
                  <p className="text-sm text-muted-foreground">por dia / por instância</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Cobrança Automática</p>
                  <p className="text-xs text-muted-foreground">
                    Os créditos são debitados automaticamente uma vez por dia enquanto a instância estiver conectada.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Pause className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Pause para Economizar</p>
                  <p className="text-xs text-muted-foreground">
                    Instâncias pausadas não consomem créditos. Pause quando não estiver usando para economizar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Conexão 24/7</p>
                  <p className="text-xs text-muted-foreground">
                    Sua instância permanece conectada 24 horas por dia, 7 dias por semana, independente de você estar online.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setShowCreditsModal(false)}>
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
