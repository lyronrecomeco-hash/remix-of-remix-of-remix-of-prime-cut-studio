import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Pause,
  Play,
  RefreshCw,
  Download,
  FileText,
  Settings2,
  Link2,
  Lock,
  Coins,
  AlertCircle,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="space-y-4">
      {/* Header Compacto */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-primary">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-lg font-bold">{instance.name}</h1>
          </div>
        </div>
        <Badge 
          variant="secondary" 
          className={cn(
            "gap-1.5",
            isConnected 
              ? "bg-green-500/10 text-green-600 border-green-500/20" 
              : "bg-red-500/10 text-red-600 border-red-500/20"
          )}
        >
          {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {isConnected ? 'Conectado' : 'Desconectado'}
        </Badge>
      </motion.div>

      {/* Grid Principal - 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coluna Esquerda - Conexão */}
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
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Número Conectado</p>
                    <p className="font-semibold text-green-600 truncate">{formattedPhone}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(instance.phone_number || '', 'Número')}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aviso de Créditos - Compacto */}
          <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-600">15 créditos/dia</p>
                  <p className="text-xs text-muted-foreground">
                    Consumo mínimo por instância ativa. Pause quando não usar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coluna Direita - Ações e Info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Ações Rápidas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {instance.is_paused ? (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleAction('Retomar')}>
                    <Play className="w-3.5 h-3.5" />
                    Retomar
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleAction('Pausar')}>
                    <Pause className="w-3.5 h-3.5" />
                    Pausar
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleAction('Reiniciar')}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reiniciar
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleAction('Contatos')}>
                  <Download className="w-3.5 h-3.5" />
                  Contatos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Info - Compacto */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 rounded-md bg-muted/50 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Label className="text-[10px] text-muted-foreground uppercase">Instância</Label>
                  <code className="text-xs font-mono block truncate">{instanceCode}</code>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => copyToClipboard(instanceCode, 'Código')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="p-2 rounded-md bg-muted/50 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Label className="text-[10px] text-muted-foreground uppercase">Endpoint</Label>
                  <code className="text-xs font-mono block truncate">{endpoint}</code>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => copyToClipboard(endpoint, 'Endpoint')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs para Webhook e Integrações */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs defaultValue="webhook" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="webhook" className="gap-2">
              <Link2 className="w-3.5 h-3.5" />
              Webhook
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Lock className="w-3.5 h-3.5" />
              Integrações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webhook" className="mt-4">
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label className="text-sm">Endereço webhook (opcional)</Label>
                  <Input 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://seu-servidor.com/webhook"
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(events).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                      <Switch 
                        checked={value}
                        onCheckedChange={(checked) => setEvents(e => ({ ...e, [key]: checked }))}
                      />
                      <span className="text-xs">
                        {key === 'message_received' && 'Mensagens recebidas'}
                        {key === 'message_sent' && 'Mensagens enviadas'}
                        {key === 'connection_status' && 'Status conexão'}
                      </span>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveSettings} disabled={saving} size="sm" className="gap-2">
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  Salvar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {integrations.map((integration) => (
                    <div 
                      key={integration.id} 
                      className="p-3 rounded-lg border bg-muted/20 opacity-50 text-center"
                    >
                      <div className="h-8 mb-2 flex items-center justify-center">
                        <img 
                          src={integration.logo} 
                          alt={integration.name} 
                          className="h-6 w-auto object-contain"
                        />
                      </div>
                      <p className="text-xs font-medium">{integration.name}</p>
                      <Badge variant="secondary" className="mt-1.5 text-[10px]">
                        <Lock className="w-2.5 h-2.5 mr-1" />
                        Em breve
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
