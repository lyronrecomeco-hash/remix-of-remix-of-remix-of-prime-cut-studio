/**
 * CAKTO PANEL - Painel de gerenciamento profissional
 * Layout SaaS - Dashboard direto, modais para Regras/Eventos
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings2, 
  Zap, 
  History, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Link2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CaktoDashboard } from './CaktoDashboard';
import { CaktoEventRules } from './CaktoEventRules';
import { CaktoEventsLog } from './CaktoEventsLog';
import { CaktoConfigModal } from './CaktoConfigModal';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';
import caktoLogo from '@/assets/integrations/cakto-logo.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CaktoPanelProps {
  instanceId: string;
  onBack: () => void;
}

export function CaktoPanel({ instanceId, onBack }: CaktoPanelProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [webhookVisible, setWebhookVisible] = useState(false);
  const { integration, loading, refetch, isConnected, hasError } = useCaktoIntegration(instanceId);

  const copyWebhookUrl = () => {
    if (integration?.webhook_url) {
      navigator.clipboard.writeText(integration.webhook_url);
      toast.success('URL do Webhook copiada!');
    }
  };

  const maskWebhookUrl = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    if (parts.length < 2) return url;
    const lastPart = parts[parts.length - 1];
    const maskedPart = lastPart.slice(0, 4) + '••••••••' + lastPart.slice(-4);
    parts[parts.length - 1] = maskedPart;
    return parts.join('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* ═══════════════════════════════════════════════════════════════
          HEADER FIXO - Logo, Status, Webhook, Configurar
      ═══════════════════════════════════════════════════════════════ */}
      <header className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b sticky top-0 z-10">
        {/* Linha Principal */}
        <div className="flex items-center justify-between px-6 py-5">
          {/* Esquerda: Voltar + Logo + Info */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack} 
              className="h-10 w-10 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Separator orientation="vertical" className="h-10" />
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-2 border-emerald-500/20 flex items-center justify-center shadow-md">
                <img src={caktoLogo} alt="Cakto" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold">Cakto</h1>
                  <StatusBadge isConnected={isConnected} hasError={hasError} />
                </div>
                <p className="text-base text-muted-foreground">Plataforma de Infoprodutos</p>
              </div>
            </div>
          </div>

          {/* Direita: Ações */}
          <div className="flex items-center gap-3">
            {/* Botões Regras e Eventos */}
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 h-10 px-4 text-base" 
              onClick={() => setShowRulesModal(true)}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Regras</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 h-10 px-4 text-base" 
              onClick={() => setShowEventsModal(true)}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Eventos</span>
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10" 
              onClick={() => refetch()}
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="gap-2 h-10 px-4 text-base" 
              onClick={() => setShowConfig(true)}
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Configurar</span>
            </Button>
          </div>
        </div>

        {/* Webhook URL - Linha secundária com máscara */}
        {isConnected && integration?.webhook_url && (
          <div className="px-6 pb-5">
            <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-muted/50 border border-border/50">
              <Link2 className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground shrink-0">Webhook:</span>
                <code className="text-sm font-mono truncate flex-1">
                  {webhookVisible ? integration.webhook_url : maskWebhookUrl(integration.webhook_url)}
                </code>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setWebhookVisible(!webhookVisible)}
                  className="gap-2 h-9 px-3"
                >
                  {webhookVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline text-sm">{webhookVisible ? 'Ocultar' : 'Mostrar'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyWebhookUrl} 
                  className="gap-2 h-9 px-3"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Copiar</span>
                </Button>
              </div>
            </div>
            {/* Nota sobre domínio */}
            <p className="text-xs text-muted-foreground mt-2 px-1">
              💡 Para usar um domínio personalizado no webhook, configure um domínio customizado nas configurações do projeto.
            </p>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          CONTEÚDO - DASHBOARD DIRETO
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <CaktoDashboard instanceId={instanceId} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODAIS
      ═══════════════════════════════════════════════════════════════ */}
      
      {/* Modal de Regras */}
      <Dialog open={showRulesModal} onOpenChange={setShowRulesModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              Regras de Automação
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CaktoEventRules instanceId={instanceId} integrationId={integration?.id} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Eventos */}
      <Dialog open={showEventsModal} onOpenChange={setShowEventsModal}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              Histórico de Eventos
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CaktoEventsLog instanceId={instanceId} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Modal */}
      <CaktoConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        instanceId={instanceId}
        existingIntegration={integration}
        onSuccess={refetch}
      />
    </motion.div>
  );
}

// Status Badge Component
function StatusBadge({ isConnected, hasError }: { isConnected: boolean; hasError: boolean }) {
  if (hasError) {
    return (
      <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-sm">
        <AlertCircle className="w-3.5 h-3.5" />
        Erro
      </Badge>
    );
  }
  
  if (isConnected) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 px-3 py-1 text-sm">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Conectado
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
      <AlertCircle className="w-3.5 h-3.5" />
      Desconectado
    </Badge>
  );
}
