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
    <div className="space-y-8">
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
          <h1 className="text-2xl font-bold">{instance.name}</h1>
        </div>
        <Badge 
          variant="secondary" 
          className={cn(
            "gap-2 px-4 py-1.5 text-sm",
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Conexão WhatsApp */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-6"
        >
          {/* Conexão WhatsApp */}
          <GenesisWhatsAppConnect 
            instance={instance} 
            onRefresh={fetchInstance} 
          />

          {/* Número Conectado */}
          {isConnected && instance.phone_number && (
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center shadow-lg shadow-green-500/10">
                    <Phone className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Número Conectado</p>
                    <p className="font-bold text-green-600 text-2xl mt-1">{formattedPhone}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{instance.phone_number}@s.whatsapp.net</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-12 w-12 border-green-500/30 hover:bg-green-500/10"
                    onClick={() => copyToClipboard(instance.phone_number || '', 'Número')}
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Info */}
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-primary" />
                </div>
                Informações da API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">ID da Instância</Label>
                    <code className="text-base font-mono block mt-2 text-foreground">{instanceCode}</code>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => copyToClipboard(instanceCode, 'Código')}>
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Endpoint</Label>
                    <code className="text-sm font-mono block mt-2 text-foreground truncate">{endpoint}</code>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => copyToClipboard(endpoint, 'Endpoint')}>
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coluna Direita - Ações e Informações */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="gap-3 h-16 text-base font-medium border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => setShowActionsModal(true)}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              Ações Rápidas
            </Button>
            <Button 
              variant="outline" 
              className="gap-3 h-16 text-base font-medium border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => setShowWebhookModal(true)}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              Webhook
            </Button>
          </div>

          {/* Aviso de Créditos */}
          <Card 
            className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent cursor-pointer hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all"
            onClick={() => setShowCreditsModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Coins className="w-8 h-8 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold text-amber-600">15 créditos/dia</p>
                  <p className="text-sm text-muted-foreground mt-1">Consumo por instância ativa</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Info className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Info Extra */}
          <Card className="border-muted">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-base">Conexão Estável 24/7</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sua instância permanece conectada de forma estável e segura, com monitoramento automático e reconexão inteligente.
                  </p>
                </div>
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
                <Download className="w-5 h-5 text-purple-500" />
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
                  <RefreshCw className="w-5 h-5 text-blue-500" />
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
    </div>
  );
}
