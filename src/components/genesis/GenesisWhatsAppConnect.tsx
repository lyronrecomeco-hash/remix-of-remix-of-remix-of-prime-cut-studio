import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGenesisWhatsAppConnection } from './hooks/useGenesisWhatsAppConnection';
import { 
  useUnifiedInstanceStatus,
  type OrchestratedStatus
} from './hooks/useUnifiedInstanceStatus';
import { cn } from '@/lib/utils';

interface Instance {
  id: string;
  name: string;
  phone_number?: string;
  status: string;
  backend_url?: string;
  backend_token?: string;
  last_heartbeat?: string;
  effective_status?: string;
  orchestrated_status?: string;
}

interface GenesisWhatsAppConnectProps {
  instance: Instance;
  onRefresh: () => void;
}

export function GenesisWhatsAppConnect({ instance, onRefresh }: GenesisWhatsAppConnectProps) {
  /**
   * FASE 1: Hook unificado é a ÚNICA fonte de verdade
   * - Consome orchestrated_status do banco
   * - Calcula isUsable baseado em heartbeat (FASE 2)
   * - Gerencia cooldown (FASE 3)
   */
  const { 
    status: unifiedStatus, 
    registerReconnectAttempt,
    resetCooldown,
  } = useUnifiedInstanceStatus(instance.id);

  const {
    connectionState,
    startConnection,
    disconnect,
    cancelConnection,
    stopPolling,
    resetSession,
  } = useGenesisWhatsAppConnection();

  /**
   * FASE 1 + FASE 4: Status derivado APENAS do hook unificado
   * - orchestratedStatus é a verdade absoluta
   * - isUsable indica se podemos confiar na conexão
   * - Frontend NUNCA calcula status, apenas consome
   */
  const displayStatus = useMemo((): OrchestratedStatus => {
    // Se houve erro local, mostrar erro (senão o banco pode ficar em qr_pending e a UI fica em loop)
    if (connectionState.phase === 'error' && connectionState.error) {
      return 'error';
    }

    // Durante operação ativa de conexão, mostrar o phase do hook de conexão
    if (connectionState.isConnecting || connectionState.isPolling) {
      if (connectionState.phase === 'connected') return 'connected';
      if (connectionState.phase === 'stabilizing') return 'stabilizing';
      if (connectionState.phase === 'waiting') return 'qr_pending';
      if (connectionState.phase === 'generating' || connectionState.phase === 'validating') return 'connecting';
      if (connectionState.phase === 'error') return 'error';
    }

    // Fora de operação ativa, usar status unificado (orchestrated_status)
    // Se ficou preso em qr_pending sem QR (ex: backend caiu), não manter loop visual.
    if (unifiedStatus.orchestratedStatus === 'qr_pending' && !connectionState.qrCode) {
      return 'disconnected';
    }

    return unifiedStatus.orchestratedStatus;
  }, [
    connectionState.phase,
    connectionState.error,
    connectionState.isConnecting,
    connectionState.isPolling,
    connectionState.qrCode,
    unifiedStatus.orchestratedStatus,
  ]);

  // FASE 1: Estados derivados do displayStatus

  const isConnected = displayStatus === 'connected';
  const isStabilizing = displayStatus === 'stabilizing';
  const isConnecting = displayStatus === 'connecting' || displayStatus === 'qr_pending';
  const hasQrCode = connectionState.qrCode && displayStatus === 'qr_pending';

  // FASE 2: Flag de usabilidade (conexão real + heartbeat saudável)
  const isUsable = unifiedStatus.isUsable;

  // FASE 3: Estado de cooldown
  const isInCooldown = unifiedStatus.isInCooldown;

  const handleConnect = async () => {
    // FASE 3: Verificar cooldown antes de permitir conexão
    if (isInCooldown) {
      return; // UI deve mostrar estado de cooldown
    }

    // FASE 3: Registrar tentativa de reconexão
    const allowed = registerReconnectAttempt();
    if (!allowed) {
      return; // Entrou em cooldown
    }

    await startConnection(instance.id, undefined, undefined, () => {
      // FASE 3: Sucesso - resetar cooldown
      resetCooldown();
      onRefresh();
    });
  };

  const handleDisconnect = async () => {
    await disconnect(instance.id, instance.backend_url, instance.backend_token);
    onRefresh();
  };

  /**
   * CORREÇÃO DEFINITIVA: Reset de sessão quando WhatsApp deslogou (401)
   */
  const [isResetting, setIsResetting] = useState(false);
  
  const handleResetSession = async () => {
    setIsResetting(true);
    try {
      await resetSession(instance.id, instance.name, () => {
        resetCooldown();
        onRefresh();
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Detectar se precisa de reset (erro + não tem QR + tentativas esgotadas)
  const needsReset = displayStatus === 'error' || 
    (displayStatus === 'disconnected' && connectionState.error) ||
    isInCooldown;

  /**
   * FASE 1: Texto de fase baseado no displayStatus
   * - Não usa estados locais, apenas o status unificado
   */
  const getPhaseText = () => {
    if (isInCooldown) return 'Aguarde para tentar novamente...';
    
    switch (displayStatus) {
      case 'connecting': return 'Verificando servidor...';
      case 'qr_pending': return connectionState.qrCode ? 'Aguardando leitura...' : 'Gerando QR Code...';
      case 'stabilizing': return 'Finalizando conexão...';
      case 'connected': return isUsable ? 'Conectado!' : 'Verificando conexão...';
      case 'error': return 'Erro na conexão';
      case 'cooldown': return 'Em cooldown...';
      default: return 'Clique para conectar';
    }
  };

  /**
   * FASE 1 + FASE 2: Determinar se botão de conectar deve aparecer
   * - Esconder se connected, stabilizing, ou em cooldown
   */
  const shouldHideConnectButton = isConnected || isStabilizing || isInCooldown;

  return (
    <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
      <CardContent className="p-0">
        {/* Header Compacto */}
        <div className={cn(
          "px-5 py-4 flex items-center justify-between border-b transition-colors",
          isConnected 
            ? "bg-green-500/5 border-green-500/20" 
            : isConnecting
              ? "bg-blue-500/5 border-blue-500/20"
              : displayStatus === 'error' || isInCooldown
                ? "bg-red-500/5 border-red-500/20"
                : "bg-muted/30"
        )}>
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isConnected ? "bg-green-500/15" 
                  : isConnecting ? "bg-blue-500/15"
                  : displayStatus === 'error' || isInCooldown ? "bg-red-500/15"
                  : "bg-muted"
              )}
              animate={isConnecting ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: isConnecting ? Infinity : 0 }}
            >
              {isConnected && <Wifi className="w-5 h-5 text-green-500" />}
              {isConnecting && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
              {(displayStatus === 'error' || isInCooldown) && <XCircle className="w-5 h-5 text-red-500" />}
              {(displayStatus === 'idle' || displayStatus === 'disconnected') && !isInCooldown && !isConnecting && (
                <WifiOff className="w-5 h-5 text-muted-foreground" />
              )}
            </motion.div>
            <div>
              <p className="font-semibold text-sm">
                {isConnected ? 'WhatsApp Conectado' 
                  : isConnecting ? 'Conectando...'
                  : displayStatus === 'error' ? 'Erro na Conexão'
                  : isInCooldown ? 'Aguardando...'
                  : 'WhatsApp Desconectado'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isConnected && unifiedStatus.phoneNumber 
                  ? unifiedStatus.phoneNumber 
                  : getPhaseText()}
              </p>
            </div>
          </div>

          {/* Badge de Status */}
          <Badge 
            variant="secondary" 
            className={cn(
              "gap-1.5 px-2.5 py-1 text-xs",
              isConnected ? "bg-green-500/10 text-green-600 border-green-500/20"
                : isConnecting ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                : displayStatus === 'error' ? "bg-red-500/10 text-red-600 border-red-500/20"
                : isInCooldown ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isConnected && <CheckCircle2 className="w-3 h-3" />}
            {isConnecting && <Loader2 className="w-3 h-3 animate-spin" />}
            {displayStatus === 'error' && <XCircle className="w-3 h-3" />}
            {isInCooldown && <AlertCircle className="w-3 h-3" />}
            {(displayStatus === 'idle' || displayStatus === 'disconnected') && !isInCooldown && !isConnecting && (
              <WifiOff className="w-3 h-3" />
            )}
            {isConnected ? 'Online' 
              : isConnecting ? 'Conectando'
              : displayStatus === 'error' ? 'Erro'
              : isInCooldown ? 'Cooldown'
              : 'Offline'}
          </Badge>
        </div>

        {/* Main Content Area */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* Estado Conectado */}
            {isConnected && (
              <motion.div
                key="connected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Pronto para uso</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {instance.phone_number || 'Envie mensagens normalmente'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDisconnect} 
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <WifiOff className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Estado Conectando */}
            {(displayStatus === 'connecting' || (displayStatus === 'qr_pending' && !connectionState.qrCode)) && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-6"
              >
                <motion.div
                  className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                </motion.div>
                <p className="mt-3 text-sm font-medium">
                  {displayStatus === 'connecting' ? 'Conectando...' : 'Gerando QR Code...'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancelConnection(instance.id)}
                  className="mt-2 text-muted-foreground"
                >
                  Cancelar
                </Button>
              </motion.div>
            )}

            {/* QR Code */}
            {hasQrCode && (
              <motion.div
                key="qrcode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-4"
              >
                <div className="bg-white p-3 rounded-xl shadow-lg border">
                  <img
                    src={connectionState.qrCode}
                    alt="QR Code"
                    className="w-40 h-40 sm:w-48 sm:h-48"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium">Escaneie com o WhatsApp</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configurações → Aparelhos conectados
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <motion.div 
                      className="w-1.5 h-1.5 rounded-full bg-blue-500"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs text-muted-foreground">Aguardando leitura...</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancelConnection(instance.id)}
                  className="mt-3 text-muted-foreground"
                >
                  Cancelar
                </Button>
              </motion.div>
            )}

            {/* Estado Desconectado / Idle */}
            {(displayStatus === 'idle' || displayStatus === 'disconnected') && !isConnecting && !isInCooldown && !isConnected && (
              <motion.div
                key="disconnected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-6"
              >
                <motion.div 
                  className="relative cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  onClick={handleConnect}
                >
                  <div className="w-32 h-32 rounded-xl bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                    <QrCode className="w-12 h-12 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                </motion.div>
                <Button onClick={handleConnect} className="mt-4 gap-2">
                  <QrCode className="w-4 h-4" />
                  Conectar WhatsApp
                </Button>
              </motion.div>
            )}

            {/* Cooldown */}
            {isInCooldown && (
              <motion.div
                key="cooldown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-6"
              >
                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-orange-500" />
                </div>
                <p className="mt-3 text-sm font-medium text-orange-600">Muitas tentativas</p>
                <p className="text-xs text-muted-foreground mt-1">Aguarde antes de tentar novamente</p>
                <Button 
                  onClick={handleResetSession} 
                  disabled={isResetting}
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-2"
                >
                  {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  {isResetting ? 'Resetando...' : 'Resetar Sessão'}
                </Button>
              </motion.div>
            )}

            {/* Erro */}
            {displayStatus === 'error' && connectionState.error && !isInCooldown && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">
                      {connectionState.error.includes('invalidada') || connectionState.error.includes('401')
                        ? 'Sessão expirada'
                        : 'Erro na conexão'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {connectionState.error.includes('invalidada') || connectionState.error.includes('401')
                        ? 'O WhatsApp foi desconectado do celular.'
                        : connectionState.error}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetSession}
                      disabled={isResetting}
                      className="mt-3 gap-2"
                    >
                      {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      {isResetting ? 'Resetando...' : 'Resetar Sessão'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Refresh Button - Discreto */}
          <div className="flex justify-end mt-3 pt-3 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={onRefresh} className="text-muted-foreground gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
