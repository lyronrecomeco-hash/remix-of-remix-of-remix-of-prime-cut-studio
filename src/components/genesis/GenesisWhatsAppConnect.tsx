import { useState, useEffect, useMemo } from 'react';
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
  Zap,
  Shield,
  Radio,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGenesisWhatsAppConnection } from './hooks/useGenesisWhatsAppConnection';
import { 
  useUnifiedInstanceStatus,
  normalizeStatus,
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
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card via-card to-muted/30">
      <CardContent className="p-0">
        {/* Status Header */}
        <div className={cn(
          "p-6 transition-all duration-500",
          isConnected 
            ? "bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent" 
            : isConnecting
              ? "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent"
              : displayStatus === 'error' || isInCooldown
                ? "bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent"
                : "bg-gradient-to-r from-muted/50 via-muted/30 to-transparent"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500",
                  isConnected 
                    ? "bg-green-500/20 shadow-lg shadow-green-500/20" 
                    : isConnecting
                      ? "bg-blue-500/20 shadow-lg shadow-blue-500/20"
                      : displayStatus === 'error' || isInCooldown
                        ? "bg-red-500/20"
                        : "bg-muted"
                )}
                animate={isConnecting ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: isConnecting ? Infinity : 0 }}
              >
                {displayStatus === 'connecting' && (
                  <Radio className="w-7 h-7 text-blue-500 animate-pulse" />
                )}
                {displayStatus === 'qr_pending' && !connectionState.qrCode && (
                  <Sparkles className="w-7 h-7 text-blue-500 animate-pulse" />
                )}
                {displayStatus === 'qr_pending' && connectionState.qrCode && (
                  <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                )}
                {displayStatus === 'stabilizing' && (
                  <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                )}
                {isConnected && (
                  <Wifi className="w-7 h-7 text-green-500" />
                )}
                {(displayStatus === 'error' || isInCooldown) && (
                  <XCircle className="w-7 h-7 text-red-500" />
                )}
                {displayStatus === 'idle' && !isConnected && !isInCooldown && (
                  <WifiOff className="w-7 h-7 text-muted-foreground" />
                )}
                {displayStatus === 'disconnected' && !isInCooldown && (
                  <WifiOff className="w-7 h-7 text-muted-foreground" />
                )}
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">Conexão WhatsApp</h3>
                <motion.p 
                  key={displayStatus}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  {isConnected 
                    ? unifiedStatus.phoneNumber || 'Conectado' 
                    : getPhaseText()}
                </motion.p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {isConnecting && (
                <Badge variant="secondary" className="gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {displayStatus === 'connecting' ? 'Verificando' : 'Conectando'}
                </Badge>
              )}
              {isConnected && (
                <Badge variant="secondary" className="gap-1.5 bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conectado
                </Badge>
              )}
              {/* FASE 2: Mostrar alerta se conectado mas não usável */}
              {isConnected && !isUsable && (
                <Badge variant="secondary" className="gap-1.5 bg-orange-500/10 text-orange-600 border-orange-500/20 px-3 py-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Verificando
                </Badge>
              )}
              {displayStatus === 'error' && (
                <Badge variant="secondary" className="gap-1.5 bg-red-500/10 text-red-600 border-red-500/20 px-3 py-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Erro
                </Badge>
              )}
              {isInCooldown && (
                <Badge variant="secondary" className="gap-1.5 bg-orange-500/10 text-orange-600 border-orange-500/20 px-3 py-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Cooldown
                </Badge>
              )}
              {isStabilizing && (
                <Badge variant="secondary" className="gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Estabilizando
                </Badge>
              )}
              {displayStatus === 'disconnected' && !isInCooldown && (
                <Badge variant="secondary" className="gap-1.5 bg-muted text-muted-foreground border-border px-3 py-1.5">
                  <WifiOff className="w-3.5 h-3.5" />
                  Desconectado
                </Badge>
              )}
              {displayStatus === 'idle' && !isConnected && !isConnecting && !isInCooldown && (
                <Badge variant="secondary" className="gap-1.5 bg-muted text-muted-foreground border-border px-3 py-1.5">
                  <WifiOff className="w-3.5 h-3.5" />
                  Desconectado
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 pt-2">
          {/* QR Code Section */}
          <AnimatePresence mode="wait">
            {!isConnected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {/* Loading States */}
                {displayStatus === 'connecting' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-12"
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Radio className="w-10 h-10 text-blue-500" />
                    </motion.div>
                    <p className="mt-4 text-sm font-medium">Verificando infraestrutura...</p>
                    <p className="text-xs text-muted-foreground mt-1">Conectando ao WhatsApp Automação</p>
                  </motion.div>
                )}

                {displayStatus === 'qr_pending' && !connectionState.qrCode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-12"
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-10 h-10 text-blue-500" />
                    </motion.div>
                    <p className="mt-4 text-sm font-medium">Gerando QR Code...</p>
                    <p className="text-xs text-muted-foreground mt-1">Aguarde um momento</p>
                  </motion.div>
                )}

                {/* QR Code Display */}
                {hasQrCode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-8"
                  >
                    <div className="relative">
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="relative bg-white p-5 rounded-2xl shadow-2xl border-4 border-primary/20">
                        <motion.img
                          key={connectionState.qrCode}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={connectionState.qrCode}
                          alt="QR Code"
                          className="w-56 h-56 sm:w-64 sm:h-64"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center space-y-2">
                      <p className="text-sm font-medium">Escaneie o código com o WhatsApp</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-medium">1)</span> Abra o WhatsApp no celular</p>
                        <p><span className="font-medium">2)</span> Configurações → <span className="font-medium">Aparelhos conectados</span></p>
                        <p><span className="font-medium">3)</span> Conectar um aparelho → Escaneie o QR</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <motion.div 
                          className="w-2 h-2 rounded-full bg-blue-500"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-xs text-muted-foreground">
                          Aguardando... ({Math.floor(connectionState.attempts / 60)}:{String(connectionState.attempts % 60).padStart(2, '0')})
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Placeholder when idle or disconnected */}
                {(displayStatus === 'idle' || displayStatus === 'disconnected') && !isConnecting && !isInCooldown && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-10"
                  >
                    <motion.div 
                      className="relative cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                      onClick={handleConnect}
                    >
                      <div className="w-48 h-48 rounded-2xl bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                        <QrCode className="w-20 h-20 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-lg group-hover:shadow-xl transition-shadow"
                          whileHover={{ y: -2 }}
                        >
                          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            Clique para conectar
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-md">
                      {[
                        { icon: Zap, label: 'Conexão Rápida' },
                        { icon: Shield, label: '100% Seguro' },
                        { icon: RefreshCw, label: 'Auto Reconexão' },
                      ].map((feature, i) => (
                        <motion.div 
                          key={feature.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30"
                        >
                          <feature.icon className="w-5 h-5 text-primary" />
                          <span className="text-xs text-center text-muted-foreground">{feature.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* FASE 3: Cooldown State */}
                {isInCooldown && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-orange-500" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-orange-600">Muitas tentativas</p>
                    <p className="text-xs text-muted-foreground mt-1">Aguarde antes de tentar novamente</p>
                    {unifiedStatus.cooldownEndsAt && (
                      <p className="text-xs text-orange-500 mt-2">
                        Cooldown até: {unifiedStatus.cooldownEndsAt.toLocaleTimeString()}
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connected State - Test Message */}
          <AnimatePresence>
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 py-4"
              >
                <motion.div 
                  className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Instância conectada com sucesso!</p>
                    <p className="text-xs text-muted-foreground">
                      {instance.phone_number || 'Pronto para enviar mensagens'}
                    </p>
                  </div>
                </motion.div>

                <div className="p-4 rounded-xl bg-muted/30 border">
                  <p className="text-xs text-muted-foreground">
                    Uma mensagem de teste automática é enviada ao conectar para validar a estabilidade.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {connectionState.error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
              >
                <p className="text-sm text-destructive flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  {connectionState.error.includes('backend') || connectionState.error.includes('Configure') 
                    ? 'Backend não configurado' 
                    : 'QR Code não disponível'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-2 ml-6">
                  {connectionState.error.includes('backend') || connectionState.error.includes('Configure')
                    ? 'Acesse as configurações da instância e configure a URL e Token do seu backend VPS antes de conectar.'
                    : 'Verifique a configuração do WhatsApp Automação ou contate o suporte.'
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t">
            {!shouldHideConnectButton && !isConnecting && (
              <Button onClick={handleConnect} className="gap-2 flex-1 sm:flex-none" size="lg">
                <QrCode className="w-5 h-5" />
                Conectar WhatsApp
              </Button>
            )}

            {isConnecting && (
              <Button
                variant="outline"
                onClick={() => cancelConnection(instance.id)}
                className="gap-2 flex-1 sm:flex-none"
                size="lg"
              >
                <XCircle className="w-5 h-5" />
                Cancelar
              </Button>
            )}

            {isConnected && (
              <Button 
                variant="outline" 
                onClick={handleDisconnect} 
                className="gap-2 text-destructive hover:text-destructive flex-1 sm:flex-none"
                size="lg"
              >
                <WifiOff className="w-5 h-5" />
                Desconectar
              </Button>
            )}

            <Button variant="ghost" onClick={onRefresh} size="icon" className="shrink-0">
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
