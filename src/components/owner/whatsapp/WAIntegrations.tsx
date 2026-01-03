import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug,
  Calendar,
  Users,
  Megaphone,
  Bell,
  Globe,
  Database,
  Zap,
  ArrowRight,
  ExternalLink,
  Check,
  Settings2,
  Code,
  Copy,
  Sparkles,
  ShoppingCart,
  CreditCard,
  Mail,
  MessageCircle,
  Webhook,
  Bot
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'available' | 'coming_soon';
  category: 'internal' | 'external' | 'automation';
  features?: string[];
}

const integrations: Integration[] = [
  // Internal
  {
    id: 'crm',
    name: 'CRM Genesis',
    description: 'Envie mensagens automaticamente quando leads mudarem de estágio no funil',
    icon: <Users className="w-5 h-5" />,
    status: 'connected',
    category: 'internal',
    features: ['Notificação de novo lead', 'Mudança de estágio', 'Follow-up automático']
  },
  {
    id: 'agendamentos',
    name: 'Sistema de Agendamentos',
    description: 'Notifique clientes sobre confirmações, lembretes e cancelamentos',
    icon: <Calendar className="w-5 h-5" />,
    status: 'connected',
    category: 'internal',
    features: ['Confirmação automática', 'Lembrete 1h antes', 'Notificação de cancelamento']
  },
  {
    id: 'campanhas',
    name: 'Campanhas de Marketing',
    description: 'Dispare campanhas em massa com templates personalizados',
    icon: <Megaphone className="w-5 h-5" />,
    status: 'available',
    category: 'internal',
    features: ['Envio em massa', 'Templates dinâmicos', 'Segmentação por tags']
  },
  {
    id: 'fila',
    name: 'Fila de Espera',
    description: 'Notifique clientes quando chegar a vez deles na fila',
    icon: <Bell className="w-5 h-5" />,
    status: 'available',
    category: 'internal',
    features: ['Chamada automática', 'Posição na fila', 'Estimativa de tempo']
  },
  // External
  {
    id: 'api',
    name: 'API REST',
    description: 'Conecte com qualquer sistema externo via REST API',
    icon: <Globe className="w-5 h-5" />,
    status: 'connected',
    category: 'external',
    features: ['Endpoints documentados', 'Rate limiting', 'Webhooks']
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    description: 'Receba eventos em tempo real no seu sistema',
    icon: <Webhook className="w-5 h-5" />,
    status: 'available',
    category: 'external',
    features: ['Eventos em tempo real', 'Retry automático', 'Assinatura HMAC']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Integre com mais de 5000 apps via Zapier',
    icon: <Zap className="w-5 h-5" />,
    status: 'coming_soon',
    category: 'external',
  },
  {
    id: 'n8n',
    name: 'N8N',
    description: 'Automações avançadas com N8N self-hosted',
    icon: <Database className="w-5 h-5" />,
    status: 'coming_soon',
    category: 'external',
  },
  // Automation
  {
    id: 'chatbot',
    name: 'Chatbot Inteligente',
    description: 'Responda automaticamente com IA generativa',
    icon: <Bot className="w-5 h-5" />,
    status: 'connected',
    category: 'automation',
    features: ['GPT-4 / Gemini', 'Contexto de conversa', 'Fallback humano']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Notificações de pedidos, pagamentos e entregas',
    icon: <ShoppingCart className="w-5 h-5" />,
    status: 'coming_soon',
    category: 'automation',
  },
  {
    id: 'payments',
    name: 'Pagamentos',
    description: 'Envie links de pagamento e reciba confirmações',
    icon: <CreditCard className="w-5 h-5" />,
    status: 'coming_soon',
    category: 'automation',
  },
];

const categories = [
  { id: 'internal', label: 'Sistema Genesis', icon: Sparkles, description: 'Integrações nativas do sistema' },
  { id: 'external', label: 'APIs Externas', icon: Globe, description: 'Conecte sistemas externos' },
  { id: 'automation', label: 'Automação', icon: Bot, description: 'Automatize processos' },
];

const apiEndpoints = [
  { method: 'POST', path: '/send', description: 'Enviar mensagem de texto' },
  { method: 'POST', path: '/send-buttons', description: 'Enviar com botões' },
  { method: 'POST', path: '/send-list', description: 'Enviar menu de lista' },
  { method: 'POST', path: '/send-media', description: 'Enviar imagem/arquivo' },
  { method: 'GET', path: '/status/:instanceId', description: 'Status da instância' },
  { method: 'POST', path: '/qrcode/:instanceId', description: 'Gerar QR Code' },
  { method: 'GET', path: '/contacts', description: 'Listar contatos' },
  { method: 'GET', path: '/groups', description: 'Listar grupos' },
  { method: 'GET', path: '/messages/:phone', description: 'Histórico de mensagens' },
];

export const WAIntegrations = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const getStatusConfig = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return { label: 'Conectado', variant: 'default' as const, color: 'text-green-500' };
      case 'available':
        return { label: 'Disponível', variant: 'outline' as const, color: 'text-blue-500' };
      case 'coming_soon':
        return { label: 'Em breve', variant: 'secondary' as const, color: 'text-muted-foreground' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]" />
        <CardHeader className="relative">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg"
            >
              <Plug className="w-7 h-7 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl">Central de Integrações</CardTitle>
              <CardDescription className="text-base">
                Conecte o WhatsApp Automação com seus sistemas favoritos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Tabs */}
      <div className="flex gap-3 flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          const count = integrations.filter(i => i.category === category.id).length;
          
          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCategory(isActive ? null : category.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                isActive 
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                  : 'bg-card hover:bg-muted border-border'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium text-sm">{category.label}</p>
                <p className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {count} integrações
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Integrations Grid */}
      <div className="space-y-8">
        {categories.map((category) => {
          if (activeCategory && activeCategory !== category.id) return null;
          
          const categoryIntegrations = integrations.filter(i => i.category === category.id);
          const Icon = category.icon;
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">{category.label}</h3>
                <Badge variant="secondary">{categoryIntegrations.length}</Badge>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {categoryIntegrations.map((integration, index) => {
                    const statusConfig = getStatusConfig(integration.status);
                    
                    return (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`h-full transition-all hover:shadow-lg ${
                          integration.status === 'connected' ? 'border-primary/30' : ''
                        }`}>
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4 mb-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                integration.status === 'connected'
                                  ? 'bg-primary/10 text-primary'
                                  : integration.status === 'available'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {integration.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold truncate">{integration.name}</h4>
                                  <Badge variant={statusConfig.variant} className="shrink-0 text-xs">
                                    {integration.status === 'connected' && <Check className="w-3 h-3 mr-1" />}
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {integration.description}
                                </p>
                              </div>
                            </div>

                            {/* Features */}
                            {integration.features && integration.features.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {integration.features.map((feature, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Action Button */}
                            <div className="flex gap-2">
                              {integration.status === 'connected' ? (
                                <>
                                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                                    <Settings2 className="w-4 h-4" />
                                    Configurar
                                  </Button>
                                  <Switch checked className="data-[state=checked]:bg-green-500" />
                                </>
                              ) : integration.status === 'available' ? (
                                <Button variant="default" size="sm" className="w-full gap-2">
                                  <Plug className="w-4 h-4" />
                                  Conectar
                                  <ArrowRight className="w-4 h-4 ml-auto" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" className="w-full" disabled>
                                  Em desenvolvimento
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* API Documentation */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Documentação da API</CardTitle>
              <CardDescription>
                Use nossa API REST para integrar com qualquer sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div 
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
              onClick={() => copyToClipboard('/functions/v1/whatsapp-api')}
            >
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Base URL</span>
                <code className="text-sm font-mono">/functions/v1/whatsapp-api</code>
              </div>
              <Copy className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Autenticação</span>
                <code className="text-sm font-mono">Bearer Token + API Secret</code>
              </div>
              <Badge variant="outline">HMAC</Badge>
            </div>
          </div>

          {/* Endpoints */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Endpoints Disponíveis
            </h4>
            <div className="grid gap-2">
              {apiEndpoints.map((endpoint, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => copyToClipboard(endpoint.path)}
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                      className={`font-mono text-xs w-14 justify-center ${
                        endpoint.method === 'POST' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{endpoint.description}</span>
                    <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2">
            <ExternalLink className="w-4 h-4" />
            Ver Documentação Completa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
