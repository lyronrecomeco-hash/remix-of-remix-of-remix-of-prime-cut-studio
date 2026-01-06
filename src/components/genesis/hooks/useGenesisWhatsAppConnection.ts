import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import * as QRCode from 'qrcode';

/**
 * FASE 7: Orquestrador central para transições de status
 * Substitui escritas diretas por chamadas RPC validadas
 */
const requestOrchestratedTransition = async (
  instanceId: string,
  newStatus: string,
  source: string = 'frontend',
  payload: Record<string, unknown> = {}
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('genesis-connection-orchestrator', {
      body: { instanceId, action: 'transition', newStatus, source, payload },
    });
    if (error) {
      console.warn('[Orchestrator] Transition error:', error);
      return { success: false, error: error.message };
    }
    return data as { success: boolean; error?: string };
  } catch (err) {
    console.warn('[Orchestrator] Exception:', err);
    return { success: false, error: String(err) };
  }
};
interface ConnectionState {
  isConnecting: boolean;
  isPolling: boolean;
  qrCode: string | null;
  error: string | null;
  attempts: number;
  phase: 'idle' | 'validating' | 'generating' | 'waiting' | 'stabilizing' | 'connected' | 'error';
}

interface InstanceStatus {
  status: string;
  phoneNumber?: string;
  lastHeartbeat?: string;
  isStale: boolean;
  // HARDENING: Campos de proteção do backend
  degraded?: boolean;
  inCooldown?: boolean;
  cooldownRemaining?: number;
  sessionHealthy?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HARDENING: CONFIGURAÇÕES DE ESTABILIDADE FRONTEND
// ═══════════════════════════════════════════════════════════════════════════════
const HARDENING = {
  // Threshold de stale reduzido para 3 minutos (fast-path mais preciso)
  STALE_THRESHOLD_MS: 180000,
  
  // Anti-loop: máximo de tentativas antes de cooldown forçado
  MAX_CONNECT_ATTEMPTS: 5,
  CONNECT_COOLDOWN_MS: 120000, // 2 minutos de cooldown
  
  // Backoff exponencial para reconexão no frontend
  RECONNECT_BASE_DELAY: 3000,
  RECONNECT_MAX_DELAY: 60000,
  RECONNECT_BACKOFF_FACTOR: 1.5,
  RECONNECT_JITTER_FACTOR: 0.2,
  
  // Polling otimizado (mais rápido para UX fluida)
  POLLING_INTERVAL: 1200, // Reduzido para 1.2s
  MAX_POLLING_ATTEMPTS: 100, // 2min total
  QR_AUTO_REFRESH_MS: 45000, // 45s
  
  // Status polling menos frequente
  STATUS_POLL_INTERVAL: 5000, // 5s
  
  // Delay de estabilização (aguardar backend ficar ready)
  STABILIZATION_WAIT_ATTEMPTS: 10,
  STABILIZATION_WAIT_INTERVAL: 800, // 800ms entre checks (mais rápido)
  
  // Rate limit de operações
  MIN_OPERATION_INTERVAL: 1500, // 1.5s entre operações
  
  // Fast-path: heartbeat recente = já conectado
  FAST_PATH_HEARTBEAT_MS: 60000, // Se heartbeat < 1min, confiar no banco
};

export function useGenesisWhatsAppConnection() {
  const { genesisUser } = useGenesisAuth();

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    isPolling: false,
    qrCode: null,
    error: null,
    attempts: 0,
    phase: 'idle',
  });
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastQrRefreshAtRef = useRef<number>(0);
  const mountedRef = useRef(true);
  
  // HARDENING: Refs para controle anti-loop
  const connectAttemptsRef = useRef(0);
  const lastConnectAtRef = useRef(0);
  const cooldownUntilRef = useRef(0);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSetState = useCallback((updater: (prev: ConnectionState) => ConnectionState) => {
    if (mountedRef.current) {
      setConnectionState(updater);
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    safeSetState(prev => ({ ...prev, isPolling: false }));
  }, [safeSetState]);

  const stopStatusPolling = useCallback(() => {
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
      statusPollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      stopStatusPolling();
    };
  }, [stopPolling, stopStatusPolling]);

  /**
   * FASE 7: Atualiza instância no DB
   * - Para mudanças de STATUS: usa orquestrador central (valida transições)
   * - Para outros campos: atualização direta permitida
   */
  const updateInstanceInDB = async (instanceId: string, updates: Record<string, unknown>) => {
    try {
      const statusFields = ['status', 'effective_status'];
      const hasStatusChange = statusFields.some(f => updates[f] !== undefined);
      
      // Se há mudança de status, tentar via orquestrador primeiro
      if (hasStatusChange) {
        const newStatus = (updates.effective_status || updates.status) as string;
        
        // Mapear status legado para novo schema
        const statusMap: Record<string, string> = {
          'qr_pending': 'qr_pending',
          'connecting': 'connecting', 
          'connected': 'connected',
          'disconnected': 'disconnected',
          'error': 'error',
        };
        const mappedStatus = statusMap[newStatus] || newStatus;
        
        // Tentar transição via orquestrador (validação de state machine)
        const orchestratorResult = await requestOrchestratedTransition(
          instanceId,
          mappedStatus,
          'frontend',
          { originalUpdates: updates }
        );
        
        if (orchestratorResult.success) {
          console.log(`[updateInstanceInDB] Orchestrated transition to ${mappedStatus} succeeded`);
        } else {
          // Transição inválida na state machine - log mas continua com outros campos
          console.warn(`[updateInstanceInDB] Orchestrated transition failed: ${orchestratorResult.error}`);
        }
      }
      
      // Atualizar campos não-status diretamente (session_data, phone_number, etc)
      const nonStatusUpdates = { ...updates };
      delete nonStatusUpdates.status;
      delete nonStatusUpdates.effective_status;
      
      if (Object.keys(nonStatusUpdates).length > 0) {
        const { error } = await supabase
          .from('genesis_instances')
          .update({ ...nonStatusUpdates, updated_at: new Date().toISOString() })
          .eq('id', instanceId);
        
        if (error) {
          console.error('Error updating genesis instance non-status fields:', error);
        }
      }
      
      // Log para genesis_event_logs (legado, mantido para compatibilidade)
      if (updates.status) {
        try {
          const eventType = updates.status === 'connected' ? 'connected' : updates.status === 'disconnected' ? 'disconnected' : 'status_change';
          await supabase.from('genesis_event_logs').insert([{
            instance_id: instanceId,
            event_type: eventType,
            severity: 'info',
            message: `Status alterado para: ${updates.status}`,
            details: JSON.parse(JSON.stringify(updates)),
          }]);
        } catch (logError) {
          console.error('Error logging event:', logError);
        }
      }
    } catch (error) {
      console.error('Error updating genesis instance:', error);
    }
  };

  // Merge session_data preservando valores existentes
  const mergeSessionData = async (
    instanceId: string,
    newFields: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    try {
      const { data: instanceRow } = await supabase
        .from('genesis_instances')
        .select('session_data')
        .eq('id', instanceId)
        .single();

      const existing =
        instanceRow?.session_data && typeof instanceRow.session_data === 'object'
          ? (instanceRow.session_data as Record<string, unknown>)
          : {};

      return { ...existing, ...newFields };
    } catch (err) {
      console.error('mergeSessionData error:', err);
      return newFields;
    }
  };

  // === FASE 0: DIAGNÓSTICO - Logs detalhados para cada chamada ===
  const logDiagnostic = (context: string, data: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [DIAG][${timestamp}] ${context}:`, JSON.stringify(data, null, 2));
  };

  // Make proxy request through genesis-backend-proxy
  const proxyRequest = async (
    instanceId: string,
    path: string,
    method: 'GET' | 'POST',
    body?: unknown
  ): Promise<{ ok: boolean; status: number; data: any; error?: string; needsConfig?: boolean }> => {
    const requestStart = Date.now();
    
    logDiagnostic('PROXY_REQUEST_START', {
      instanceId,
      path,
      method,
      hasBody: Boolean(body),
      bodyPreview: body ? JSON.stringify(body).slice(0, 200) : null,
    });

    try {
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: { instanceId, path, method, body },
      });

      const duration = Date.now() - requestStart;

      if (error) {
        logDiagnostic('PROXY_REQUEST_ERROR', {
          instanceId,
          path,
          method,
          duration,
          errorType: 'supabase_invoke',
          errorMessage: error.message,
          errorCode: (error as any).code,
        });
        return { ok: false, status: 0, data: null, error: error.message };
      }
      
      logDiagnostic('PROXY_REQUEST_RESPONSE', {
        instanceId,
        path,
        method,
        duration,
        responseOk: data?.ok,
        responseStatus: data?.status,
        responseError: data?.error,
        needsConfig: data?.needsConfig,
        dataPreview: data?.data ? JSON.stringify(data.data).slice(0, 300) : null,
      });

      // Handle needsConfig response specifically
      if (data?.needsConfig) {
        return { 
          ok: false, 
          status: 400, 
          data: null, 
          error: data.error || 'Configure o backend da instância primeiro',
          needsConfig: true 
        };
      }

      // Handle error response from proxy
      if (data?.error && !data?.ok) {
        return { 
          ok: false, 
          status: data.status || 0, 
          data: data.data || null, 
          error: data.error,
          needsConfig: data.needsConfig 
        };
      }
      
      return (data || { ok: false, status: 0, data: null }) as any;
    } catch (err) {
      const duration = Date.now() - requestStart;
      logDiagnostic('PROXY_REQUEST_EXCEPTION', {
        instanceId,
        path,
        method,
        duration,
        errorType: 'exception',
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack?.slice(0, 500) : null,
      });
      return { ok: false, status: 0, data: null, error: 'Erro de conexão' };
    }
  };

  const normalizeQrToDataUrl = useCallback(async (rawQr: string): Promise<string> => {
    if (rawQr.startsWith('data:')) return rawQr;
    if (/^[A-Za-z0-9+/=]+$/.test(rawQr.slice(0, 50))) {
      return `data:image/png;base64,${rawQr}`;
    }
    try {
      return await QRCode.toDataURL(rawQr, { width: 256, margin: 1 });
    } catch {
      throw new Error('QR Code inválido');
    }
  }, []);

  const validateBackendHealth = async (instanceId: string): Promise<{ healthy: boolean; error?: string; needsConfig?: boolean }> => {
    const res = await proxyRequest(instanceId, '/health', 'GET');
    
    if (res.needsConfig) {
      return { 
        healthy: false, 
        error: 'Configure a URL e Token do backend nas configurações da instância antes de conectar.',
        needsConfig: true 
      };
    }
    
    if (res.error) {
      return { healthy: false, error: res.error };
    }
    
    return { healthy: res.ok };
  };

  // Detectar se backend é V8 (multi-instância) ou Legacy (single-instance)
  // COM CACHE em session_data para evitar requests repetidas
  const detectBackendFlavor = async (instanceId: string, forceRefresh = false): Promise<'v8' | 'legacy'> => {
    // Verificar cache primeiro (a menos que forceRefresh)
    if (!forceRefresh) {
      try {
        const { data: cached } = await supabase
          .from('genesis_instances')
          .select('session_data')
          .eq('id', instanceId)
          .single();
        
        const session = cached?.session_data as Record<string, unknown> | null;
        if (session?.backend_flavor && typeof session.backend_flavor === 'string') {
          return session.backend_flavor as 'v8' | 'legacy';
        }
      } catch {}
    }
    
    // Tentar health primeiro para ver se servidor está up
    const healthRes = await proxyRequest(instanceId, '/health', 'GET');
    if (!healthRes.ok) {
      // Servidor offline, assumir v8 (mais moderno)
      return 'v8';
    }
    
    // Tentar endpoint V8 específico
    const v8Res = await proxyRequest(instanceId, `/api/instance/${instanceId}/status`, 'GET');
    const dataStr = typeof v8Res.data === 'string' ? v8Res.data : JSON.stringify(v8Res.data || '');
    
    let flavor: 'v8' | 'legacy' = 'v8'; // Default para v8 (mais moderno)
    
    // Se V8 retornou 404 ou "Cannot GET", é legacy
    if (!v8Res.ok && (v8Res.status === 404 || dataStr.includes('Cannot GET'))) {
      flavor = 'legacy';
      logDiagnostic('FLAVOR_DETECTED_LEGACY', { instanceId, status: v8Res.status });
    } else if (v8Res.ok) {
      flavor = 'v8';
      logDiagnostic('FLAVOR_DETECTED_V8', { instanceId });
    }
    
    // Salvar no cache
    try {
      const merged = await mergeSessionData(instanceId, { backend_flavor: flavor });
      await supabase
        .from('genesis_instances')
        .update({ session_data: JSON.parse(JSON.stringify(merged)) })
        .eq('id', instanceId);
    } catch {}
    
    return flavor;
  };

  // V8: Criar instância no backend se não existir (só para backends V8)
  const ensureInstanceExists = async (instanceId: string, instanceName?: string): Promise<{ exists: boolean; created: boolean; error?: string; flavor?: 'v8' | 'legacy' }> => {
    // Primeiro detectar flavor do backend
    const flavor = await detectBackendFlavor(instanceId);
    logDiagnostic('BACKEND_FLAVOR_DETECTED', { instanceId, flavor });
    
    if (flavor === 'legacy') {
      // Backend legacy não precisa criar instância - já existe por padrão
      return { exists: true, created: false, flavor: 'legacy' };
    }
    
    // Backend V8: verificar se instância existe
    const statusRes = await proxyRequest(instanceId, `/api/instance/${instanceId}/status`, 'GET');
    
    // Se retornou dados, instância existe
    if (statusRes.ok || (statusRes.data && !statusRes.data?.error?.includes('não encontrada'))) {
      return { exists: true, created: false, flavor: 'v8' };
    }
    
    // Instância não existe, criar
    logDiagnostic('CREATING_INSTANCE_IN_BACKEND', { instanceId, instanceName });
    
    const createRes = await proxyRequest(instanceId, '/api/instances', 'POST', {
      instanceId,
      name: instanceName || `instance-${instanceId.slice(0, 8)}`,
    });
    
    if (createRes.ok || createRes.data?.success) {
      logDiagnostic('INSTANCE_CREATED_SUCCESSFULLY', { instanceId });
      return { exists: true, created: true, flavor: 'v8' };
    }
    
    // Se erro é "já existe", tudo bem
    if (createRes.data?.error?.includes('já existe')) {
      return { exists: true, created: false, flavor: 'v8' };
    }
    
    return { exists: false, created: false, error: createRes.error || createRes.data?.error, flavor: 'v8' };
  };

  const checkStatus = async (instanceId: string): Promise<{ connected: boolean; phoneNumber?: string; isStale?: boolean; readyToSend?: boolean; notFound?: boolean; flavor?: 'v8' | 'legacy' }> => {
    // IMPORTANT: Não “derrubar” a instância pelo frontend.
    // Stale aqui é apenas sinalização. A conexão real é confirmada pelo backend.
    const { data: instanceRow } = await supabase
      .from('genesis_instances')
      .select('last_heartbeat, effective_status')
      .eq('id', instanceId)
      .single();

    const lastHb = instanceRow?.last_heartbeat ? new Date(instanceRow.last_heartbeat).getTime() : 0;
    const isStale = lastHb > 0 && (Date.now() - lastHb) > HARDENING.STALE_THRESHOLD_MS;

    // Usar flavor cacheado (evita 404 v8 -> fallback legacy em TODA checagem)
    let flavor: 'v8' | 'legacy' = await detectBackendFlavor(instanceId);

    const fetchStatus = async (f: 'v8' | 'legacy') => {
      const path = f === 'v8' ? `/api/instance/${instanceId}/status` : '/status';
      return proxyRequest(instanceId, path, 'GET');
    };

    let res = await fetchStatus(flavor);

    // Se o flavor cacheado estiver errado (mudança de script VPS), tenta fallback 1x
    const dataStr = typeof res.data === 'string' ? res.data : JSON.stringify(res.data || '');
    const looksLikeMissingRoute =
      !res.ok &&
      (res.status === 404 || dataStr.includes('Cannot GET') || dataStr.includes('Cannot POST'));

    if (looksLikeMissingRoute) {
      const other: 'v8' | 'legacy' = flavor === 'v8' ? 'legacy' : 'v8';
      logDiagnostic('STATUS_FLAVOR_MISMATCH_TRYING_FALLBACK', {
        instanceId,
        from: flavor,
        to: other,
        status: res.status,
      });

      const fallback = await fetchStatus(other);
      if (fallback.ok) {
        flavor = other;
        res = fallback;

        // Atualizar cache best-effort
        try {
          const merged = await mergeSessionData(instanceId, { backend_flavor: flavor });
          await supabase
            .from('genesis_instances')
            .update({ session_data: JSON.parse(JSON.stringify(merged)) })
            .eq('id', instanceId);
        } catch {}
      }
    }

    // V8: Detectar se instância não existe no backend
    if (!res.ok && res.data?.error?.includes('não encontrada')) {
      return { connected: false, notFound: true, flavor };
    }

    if (!res.ok) return { connected: false, isStale, flavor };

    const result = res.data || {};

    // Normalizações (V8 e Legacy retornam formatos diferentes)
    const connected =
      result.connected === true ||
      result.status === 'connected' ||
      result.state === 'open' ||
      result.connectionStatus === 'connected';

    const phoneNumber =
      result.connectedPhone ||
      result.phone ||
      result.phoneNumber ||
      (typeof result.jid === 'string' ? result.jid.split('@')[0] : undefined);

    // V8: Backend retorna readyToSend; Legacy não expõe isso, então conectado => pronto
    const readyToSend =
      result.readyToSend === true ||
      result.ready_to_send === true ||
      (connected && flavor === 'legacy');

    return {
      connected,
      phoneNumber,
      readyToSend,
      isStale,
      flavor,
    };
  };

  const generateQRCode = async (instanceId: string, skipConnect = false): Promise<string | null> => {
    // Detectar flavor do backend
    const flavor = await detectBackendFlavor(instanceId);
    logDiagnostic('GENERATE_QR_BACKEND_FLAVOR', { instanceId, flavor });
    
    // Primeiro iniciar conexão se ainda não foi feito (a menos que skipConnect = true)
    if (!skipConnect) {
      const connectPath = flavor === 'v8' 
        ? `/api/instance/${instanceId}/connect` 
        : '/connect';
      const connectRes = await proxyRequest(instanceId, connectPath, 'POST', {});
      logDiagnostic('GENERATE_QR_CONNECT_RESULT', { instanceId, ok: connectRes.ok, data: connectRes.data, flavor });
      
      // Aguardar um momento para o QR ser gerado
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // Tentar obter QR até 3 vezes com intervalos
    for (let attempt = 0; attempt < 3; attempt++) {
      // Tentar endpoint baseado no flavor detectado
      const qrPath = flavor === 'v8' 
        ? `/api/instance/${instanceId}/qrcode` 
        : '/qrcode';
      
      let res = await proxyRequest(instanceId, qrPath, 'GET');
      
      // Se V8 falhou com 404, tentar legacy
      const dataStr = typeof res.data === 'string' ? res.data : JSON.stringify(res.data || '');
      if (flavor === 'v8' && !res.ok && (dataStr.includes('Cannot GET') || res.status === 404)) {
        logDiagnostic('V8_QRCODE_FAILED_TRYING_LEGACY', { instanceId, attempt });
        res = await proxyRequest(instanceId, '/qrcode', 'GET');
      }
      
      if (res.data?.connected || res.data?.status === 'connected') {
        return 'CONNECTED';
      }
      
      const rawQr = res.data?.qrcode || res.data?.qr || res.data?.base64;
      if (typeof rawQr === 'string' && rawQr.length > 10) {
        return await normalizeQrToDataUrl(rawQr);
      }
      
      // Aguardar antes da próxima tentativa
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    
    throw new Error('QR Code não disponível - aguarde ou tente novamente');
  };

  // === ENVIO AUTOMÁTICO ROBUSTO COM RETENTATIVAS ===
  const sendWelcomeMessage = async (
    instanceId: string,
    connectedPhoneNumber: string
  ): Promise<{ success: boolean; status?: number; error?: string }> => {
    const sendStart = Date.now();

    const digits = (v?: string | null) => (v || '').replace(/\D/g, '');

    // Destino do teste: o número salvo na conta (whatsapp_commercial).
    // Fallback: whatsapp_test; se ambos ausentes, tenta o número conectado.
    const testRecipient = digits((genesisUser as any)?.whatsapp_commercial) || digits((genesisUser as any)?.whatsapp_test);
    const phoneNumber = testRecipient || digits(connectedPhoneNumber);

    logDiagnostic('WELCOME_MESSAGE_START', {
      instanceId,
      connectedPhoneNumber,
      targetPhoneNumber: phoneNumber,
      timestamp: new Date().toISOString(),
    });

    const message = `✅ *WhatsApp conectado com sucesso!*

🚀 Sua instância Genesis Hub está ativa e pronta para uso.

📱 Sistema: Genesis Auto
⏰ ${new Date().toLocaleString('pt-BR')}

Agora você pode automatizar seu atendimento!`;

    // Delay pequeno para dar tempo do backend finalizar a estabilização (sem travar a UX)
    const initialDelay = 800;
    logDiagnostic('WELCOME_MESSAGE_DELAY', { instanceId, delayMs: initialDelay, reason: 'brief_settle' });
    await new Promise((r) => setTimeout(r, initialDelay));

    // Detectar flavor do backend para escolher endpoints corretos
    // Forçar refresh do cache pois o usuário pode ter reinstalado o script
    const flavor = await detectBackendFlavor(instanceId, true);
    logDiagnostic('WELCOME_MESSAGE_FLAVOR', { instanceId, flavor });

    const maxAttempts = 10;

    // Lista de endpoints para tentar - PRIORIZAR V8 sempre (mais moderno)
    // Os endpoints V8 (/api/instance/:id/send) são mais confiáveis
    const sendEndpoints = [
      `/api/instance/${instanceId}/send`,
      `/api/instance/${instanceId}/send-message`,
      `/api/instance/${instanceId}/sendText`,
      `/api/instance/${instanceId}/send-text`,
      // Fallback para legacy só se V8 não funcionar
      ...(flavor === 'legacy' ? ['/api/send', '/send'] : []),
    ];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const attemptStart = Date.now();

      logDiagnostic('WELCOME_MESSAGE_ATTEMPT', {
        instanceId,
        phoneNumber,
        attempt,
        maxAttempts,
        elapsedTotal: Date.now() - sendStart,
      });

      // Tentar cada endpoint nesta tentativa; se um falhar por payload/ready, tenta o próximo
      let lastRes: any = null;

      for (const endpoint of sendEndpoints) {
        try {
          const res = await proxyRequest(instanceId, endpoint, 'POST', {
            instanceId,
            to: phoneNumber,
            phone: phoneNumber,
            number: phoneNumber,
            message,
            text: message,
          });

          const resStr = typeof res.data === 'string' ? res.data : JSON.stringify(res.data || '');
          const missingRoute = !res.ok && (res.status === 404 || resStr.includes('Cannot POST') || resStr.includes('Cannot GET'));

          // Endpoint não existe nessa versão: tenta o próximo
          if (missingRoute) continue;

          lastRes = res;

          // Sucesso imediato
          if ((res.ok && res.status >= 200 && res.status < 300) || res.data?.success === true) {
            logDiagnostic('WELCOME_MESSAGE_SUCCESS', {
              instanceId,
              phoneNumber,
              attempt,
              totalTime: Date.now() - sendStart,
              endpoint,
            });

            try {
              await supabase.from('genesis_event_logs').insert({
                instance_id: instanceId,
                event_type: 'welcome_sent',
                severity: 'info',
                message: `Mensagem de boas-vindas enviada para ${phoneNumber}`,
                details: { attempt, endpoint, totalTime: Date.now() - sendStart },
              });
            } catch {}

            return { success: true, status: res.status };
          }

          // Falhou mas endpoint existe: tenta próximos endpoints antes de esperar/backoff
          const errText = String(res?.data?.error || res?.error || '').toLowerCase();
          logDiagnostic('WELCOME_MESSAGE_ENDPOINT_FAILED', {
            instanceId,
            attempt,
            endpoint,
            status: res.status,
            errText: errText.slice(0, 200),
          });
        } catch {
          // Continua para o próximo endpoint
        }
      }

      const res = lastRes;
      if (!res) continue;

      const attemptDuration = Date.now() - attemptStart;

      logDiagnostic('WELCOME_MESSAGE_RESPONSE', {
        instanceId,
        attempt,
        attemptDuration,
        ok: res.ok,
        status: res.status,
        error: res.error,
        dataSuccess: res.data?.success,
      });

      // Sucesso: status 200-299 ou data.success = true
      if ((res.ok && res.status >= 200 && res.status < 300) || res.data?.success === true) {
        logDiagnostic('WELCOME_MESSAGE_SUCCESS', {
          instanceId,
          phoneNumber,
          attempt,
          totalTime: Date.now() - sendStart,
        });

        try {
          await supabase.from('genesis_event_logs').insert({
            instance_id: instanceId,
            event_type: 'welcome_sent',
            severity: 'info',
            message: `Mensagem de boas-vindas enviada para ${phoneNumber}`,
            details: { attempt, totalTime: Date.now() - sendStart },
          });
        } catch {}

        return { success: true, status: res.status };
      }

      const errText = String(res?.data?.error || res?.error || '').toLowerCase();
      const retryablePatterns = [
        'não conectado',
        'not connected',
        'socket',
        'aguard',
        'timeout',
        'unavailable',
        'not ready',
        'nao pronto',
        'connection',
        'retry',
        'busy',
        'initializing',
        'waiting',
        'pending',
      ];

      const shouldRetry =
        res.status === 503 ||
        res.status === 0 ||
        res.status === 500 ||
        res.status === 502 ||
        res.status === 504 ||
        retryablePatterns.some((p) => errText.includes(p));

      logDiagnostic('WELCOME_MESSAGE_RETRY_DECISION', {
        instanceId,
        attempt,
        shouldRetry,
        status: res.status,
        errText: errText.slice(0, 200),
      });

      if (!shouldRetry) {
        logDiagnostic('WELCOME_MESSAGE_FAILED_NON_RETRYABLE', {
          instanceId,
          phoneNumber,
          attempt,
          totalTime: Date.now() - sendStart,
          finalError: res.error || res.data?.error,
          finalStatus: res.status,
        });

        try {
          await supabase.from('genesis_event_logs').insert({
            instance_id: instanceId,
            event_type: 'welcome_failed',
            severity: 'error',
            message: `Falha ao enviar mensagem de boas-vindas: ${res.error || res.data?.error}`,
            details: {
              attempt,
              totalTime: Date.now() - sendStart,
              status: res.status,
              error: res.error || res.data?.error,
            },
          });
        } catch {}

        return { success: false, status: res.status, error: res.error || res.data?.error };
      }

      // Backoff exponencial mais suave
      const backoffMs = Math.min(1500 + attempt * 800, 8000);
      logDiagnostic('WELCOME_MESSAGE_BACKOFF', { instanceId, attempt, backoffMs });
      await new Promise((r) => setTimeout(r, backoffMs));
    }

    logDiagnostic('WELCOME_MESSAGE_EXHAUSTED', {
      instanceId,
      phoneNumber,
      totalAttempts: maxAttempts,
      totalTime: Date.now() - sendStart,
    });

    try {
      await supabase.from('genesis_event_logs').insert({
        instance_id: instanceId,
        event_type: 'welcome_exhausted',
        severity: 'warning',
        message: `Tentativas esgotadas para ${phoneNumber} - instância pode estar conectada`,
        details: { totalAttempts: maxAttempts, totalTime: Date.now() - sendStart },
      });
    } catch {}

    // Retorna success = false mas não é crítico - a instância pode estar funcionando
    return { success: false, error: 'exhausted' };
  };

  const startConnection = useCallback(async (
    instanceId: string,
    _backendUrl?: string,
    _token?: string,
    onConnected?: () => void
  ) => {
    stopPolling();
    
    // ═══════════════════════════════════════════════════════════════════════════
    // HARDENING: Verificação anti-loop de reconexão
    // ═══════════════════════════════════════════════════════════════════════════
    const now = Date.now();
    
    // Verificar cooldown forçado
    if (cooldownUntilRef.current > now) {
      const remaining = Math.ceil((cooldownUntilRef.current - now) / 1000);
      console.warn(`[HARDENING] Connection blocked - cooldown active for ${remaining}s`);
      toast.error(`Aguarde ${remaining}s antes de tentar novamente`);
      safeSetState(() => ({
        isConnecting: false,
        isPolling: false,
        qrCode: null,
        error: `Cooldown ativo. Aguarde ${remaining}s`,
        attempts: 0,
        phase: 'error',
      }));
      return;
    }
    
    // Verificar intervalo mínimo entre operações
    if (lastConnectAtRef.current > 0 && (now - lastConnectAtRef.current) < HARDENING.MIN_OPERATION_INTERVAL) {
      console.warn('[HARDENING] Connection throttled - too fast');
      await new Promise(r => setTimeout(r, HARDENING.MIN_OPERATION_INTERVAL));
    }
    
    // Incrementar contador de tentativas
    connectAttemptsRef.current++;
    lastConnectAtRef.current = now;
    
    // Se excedeu máximo de tentativas, entrar em cooldown
    if (connectAttemptsRef.current > HARDENING.MAX_CONNECT_ATTEMPTS) {
      cooldownUntilRef.current = now + HARDENING.CONNECT_COOLDOWN_MS;
      connectAttemptsRef.current = 0;
      const cooldownSeconds = HARDENING.CONNECT_COOLDOWN_MS / 1000;
      
      console.warn(`[HARDENING] Too many attempts (${HARDENING.MAX_CONNECT_ATTEMPTS}) - cooldown for ${cooldownSeconds}s`);
      toast.error(`Muitas tentativas. Aguarde ${cooldownSeconds}s`);
      safeSetState(() => ({
        isConnecting: false,
        isPolling: false,
        qrCode: null,
        error: `Cooldown de ${cooldownSeconds}s após múltiplas tentativas`,
        attempts: 0,
        phase: 'error',
      }));
      return;
    }
    
    // Iniciar validação
    safeSetState(() => ({
      isConnecting: true,
      isPolling: false,
      qrCode: null,
      error: null,
      attempts: 0,
      phase: 'validating',
    }));

    try {
      // PASSO 1: Buscar dados atuais da instância
      const { data: instanceRow } = await supabase
        .from('genesis_instances')
        .select('session_data, effective_status, phone_number, last_heartbeat, name')
        .eq('id', instanceId)
        .single();

      // PASSO 2: Validar saúde do backend
      // (Sem fast-path: sempre confirmar status REAL no backend)

      const healthCheck = await validateBackendHealth(instanceId);
      
      if (!healthCheck.healthy) {
        throw new Error(healthCheck.error || 'Backend não está respondendo');
      }

      // PASSO 2.5: V8 - Garantir que instância existe no backend antes de qualquer operação
      const ensureResult = await ensureInstanceExists(instanceId, instanceRow?.name);
      if (!ensureResult.exists) {
        throw new Error(ensureResult.error || 'Não foi possível criar instância no backend');
      }
      if (ensureResult.created) {
        logDiagnostic('INSTANCE_CREATED_IN_BACKEND', { instanceId, name: instanceRow?.name });
      }

      // PASSO 3: Verificar status real no backend (fonte da verdade)
      const realStatus = await checkStatus(instanceId);
      const nowIso = new Date().toISOString();
      
      // === JÁ CONECTADO: Reconhecer e enviar teste ===
      if (realStatus.connected) {
        console.log(`[startConnection] Instance ${instanceId} is ALREADY CONNECTED, readyToSend=${realStatus.readyToSend}`);
        
        const phoneNumber = realStatus.phoneNumber ?? instanceRow?.phone_number;
        
        // Atualizar banco imediatamente com status conectado
        await updateInstanceInDB(instanceId, {
          status: 'connected',
          effective_status: 'connected',
          phone_number: phoneNumber,
          last_heartbeat: nowIso,
        });

        // SEMPRE enviar mensagem de teste ao clicar "Conectar" (mesmo reconexão)
        if (phoneNumber) {
          // Enviar teste automático
          safeSetState(() => ({
            isConnecting: true,
            isPolling: false,
            qrCode: null,
            error: null,
            attempts: 0,
            phase: 'stabilizing',
          }));

          toast.info('WhatsApp conectado! Aguardando socket estabilizar...');

          // V7: Aguardar ready_to_send do backend (socket estável)
          let isReady = realStatus.readyToSend === true;
          if (!isReady) {
            logDiagnostic('WAITING_READY_TO_SEND', { instanceId, phoneNumber });
            
            for (let waitAttempt = 0; waitAttempt < 10; waitAttempt++) {
              await new Promise(r => setTimeout(r, 1000));
              const statusCheck = await checkStatus(instanceId);
              
              logDiagnostic('READY_CHECK', { 
                instanceId, 
                attempt: waitAttempt + 1, 
                connected: statusCheck.connected,
                readyToSend: statusCheck.readyToSend 
              });
              
              if (statusCheck.readyToSend) {
                isReady = true;
                break;
              }
            }
          }

          if (isReady) {
            toast.info('Socket estável! Enviando teste...');
            const result = await sendWelcomeMessage(instanceId, phoneNumber);
            
            const mergedReady = await mergeSessionData(instanceId, {
              ready_to_send: result.success,
              welcome_sent_at: nowIso,
              last_send_success_at: result.success ? nowIso : undefined,
              last_send_error_at: !result.success ? nowIso : undefined,
              ready_phase: result.success ? 'ready_to_send' : 'send_attempted',
              ready_updated_at: nowIso,
            });

            await updateInstanceInDB(instanceId, {
              effective_status: 'connected',
              session_data: mergedReady,
            });

            if (result.success) {
              toast.success('✅ WhatsApp conectado e funcionando!');
            } else {
              toast.success('✅ WhatsApp conectado! Pronto para uso.');
            }
          } else {
            // Socket não ficou ready, mas está conectado
            toast.success('✅ WhatsApp conectado! Pronto para uso.');
            
            const mergedReady = await mergeSessionData(instanceId, {
              ready_to_send: false,
              ready_phase: 'connected_not_tested',
              ready_updated_at: nowIso,
            });

            await updateInstanceInDB(instanceId, {
              effective_status: 'connected',
              session_data: mergedReady,
            });
          }
        } else {
          toast.success('✅ WhatsApp já está conectado e operacional!');
        }

        // Finalizar com sucesso
        // HARDENING: Reset contador de tentativas em sucesso
        connectAttemptsRef.current = 0;
        
        safeSetState(() => ({
          isConnecting: false,
          isPolling: false,
          qrCode: null,
          error: null,
          attempts: 0,
          phase: 'connected',
        }));
        
        onConnected?.();
        return;
      }

      // Antes de gerar um novo QR, tenta reconectar sessão existente
      try {
        safeSetState(prev => ({ ...prev, phase: 'generating' }));

        const connectPath = ensureResult.flavor === 'legacy'
          ? '/connect'
          : `/api/instance/${instanceId}/connect`;

        await proxyRequest(instanceId, connectPath, 'POST', {});

        // Aguarda até 8 segundos para o backend reaproveitar credenciais
        for (let i = 0; i < 8; i++) {
          await new Promise((r) => setTimeout(r, 1000));
          const resumed = await checkStatus(instanceId);
          
          if (resumed.connected) {
            const nowIso = new Date().toISOString();

            await updateInstanceInDB(instanceId, {
              status: 'connected',
              phone_number: resumed.phoneNumber,
              last_heartbeat: nowIso,
              effective_status: 'connected',
            });

            safeSetState(() => ({
              isConnecting: true,
              isPolling: false,
              qrCode: null,
              error: null,
              attempts: 0,
              phase: 'stabilizing',
            }));

            // V7: Aguardar ready_to_send do backend
            if (resumed.phoneNumber) {
              toast.info('Sessão restaurada! Aguardando estabilização...');
              
              let isReady = resumed.readyToSend === true;
              if (!isReady) {
                for (let waitAttempt = 0; waitAttempt < 8; waitAttempt++) {
                  await new Promise(r => setTimeout(r, 1000));
                  const statusCheck = await checkStatus(instanceId);
                  if (statusCheck.readyToSend) {
                    isReady = true;
                    break;
                  }
                }
              }

              if (isReady) {
                toast.info('Enviando teste...');
                const result = await sendWelcomeMessage(instanceId, resumed.phoneNumber);
                
                const mergedReady = await mergeSessionData(instanceId, {
                  ready_to_send: result.success,
                  welcome_sent_at: nowIso,
                  last_send_success_at: result.success ? nowIso : undefined,
                  ready_phase: result.success ? 'ready_to_send' : 'send_attempted',
                  ready_updated_at: nowIso,
                });

                await updateInstanceInDB(instanceId, {
                  effective_status: 'connected',
                  session_data: mergedReady,
                });

                toast.success(result.success 
                  ? '✅ WhatsApp reconectado e funcionando!' 
                  : '✅ WhatsApp reconectado! Pronto para uso.');
              } else {
                toast.success('✅ WhatsApp reconectado! Pronto para uso.');
              }
            } else {
              toast.success('✅ WhatsApp reconectado com sucesso!');
            }

            safeSetState(() => ({
              isConnecting: false,
              isPolling: false,
              qrCode: null,
              error: null,
              attempts: 0,
              phase: 'connected',
            }));
            onConnected?.();
            return;
          }
        }
      } catch {
        // Sessão não existe, continua para QR
      }

      // Gerar QR Code - skipConnect=true pois já chamamos connect acima
      safeSetState(prev => ({ ...prev, phase: 'generating' }));
      await updateInstanceInDB(instanceId, { status: 'qr_pending' });
      
      const qrResult = await generateQRCode(instanceId, true);
      
      // Se retornou CONNECTED, já está conectado (sessão existia)
      if (qrResult === 'CONNECTED') {
        const nowIso = new Date().toISOString();
        const statusAfter = await checkStatus(instanceId);
        const phone = statusAfter.phoneNumber;

        await updateInstanceInDB(instanceId, {
          status: 'connected',
          phone_number: phone,
          last_heartbeat: nowIso,
          effective_status: 'connected',
        });

        safeSetState(() => ({
          isConnecting: true,
          isPolling: false,
          qrCode: null,
          error: null,
          attempts: 0,
          phase: 'stabilizing',
        }));

        if (phone) {
          toast.info('Conexão detectada! Aguardando estabilização...');
          
          // V7: Aguardar ready_to_send
          let isReady = statusAfter.readyToSend === true;
          if (!isReady) {
            for (let waitAttempt = 0; waitAttempt < 8; waitAttempt++) {
              await new Promise(r => setTimeout(r, 1000));
              const statusCheck = await checkStatus(instanceId);
              if (statusCheck.readyToSend) {
                isReady = true;
                break;
              }
            }
          }

          if (isReady) {
            toast.info('Enviando teste...');
            const result = await sendWelcomeMessage(instanceId, phone);
            
            const mergedReady = await mergeSessionData(instanceId, {
              ready_to_send: result.success,
              welcome_sent_at: nowIso,
              last_send_success_at: result.success ? nowIso : undefined,
              ready_phase: result.success ? 'ready_to_send' : 'send_attempted',
              ready_updated_at: nowIso,
            });

            await updateInstanceInDB(instanceId, {
              effective_status: 'connected',
              session_data: mergedReady,
            });

            toast.success(result.success 
              ? '✅ WhatsApp conectado e funcionando!' 
              : '✅ WhatsApp conectado! Pronto para uso.');
          } else {
            toast.success('✅ WhatsApp conectado! Pronto para uso.');
          }
        } else {
          toast.success('✅ WhatsApp conectado!');
        }

        safeSetState(() => ({
          isConnecting: false,
          isPolling: false,
          qrCode: null,
          error: null,
          attempts: 0,
          phase: 'connected',
        }));
        onConnected?.();
        return;
      }

      if (!qrResult) throw new Error('Não foi possível gerar o QR Code');

      // Show QR and start polling
      lastQrRefreshAtRef.current = Date.now();
      safeSetState(() => ({
        isConnecting: false,
        isPolling: true,
        qrCode: qrResult,
        error: null,
        attempts: 0,
        phase: 'waiting',
      }));

      let attempts = 0;
      pollingRef.current = setInterval(async () => {
        if (!mountedRef.current) {
          stopPolling();
          return;
        }

        attempts++;
        safeSetState(prev => ({ ...prev, attempts }));

        if (attempts >= HARDENING.MAX_POLLING_ATTEMPTS) {
          stopPolling();
          safeSetState(prev => ({
            ...prev,
            error: 'Tempo limite excedido. Tente novamente.',
            isPolling: false,
            phase: 'error',
          }));
          // NÃO altera status no banco aqui: o lifecycle da instância não pode depender do frontend.
          toast.error('Tempo limite para conexão excedido');
          return;
        }

        // Auto-refresh QR every 45 seconds
        if (Date.now() - lastQrRefreshAtRef.current > HARDENING.QR_AUTO_REFRESH_MS) {
          try {
            const nextQr = await generateQRCode(instanceId);
            if (nextQr && nextQr !== 'CONNECTED') {
              lastQrRefreshAtRef.current = Date.now();
              safeSetState(prev => ({ ...prev, qrCode: nextQr }));
            }
          } catch {}
        }

        // Check connection status
        const statusResult = await checkStatus(instanceId);
        if (statusResult.connected) {
          stopPolling();

          const nowIso = new Date().toISOString();

          await updateInstanceInDB(instanceId, {
            status: 'connected',
            phone_number: statusResult.phoneNumber,
            last_heartbeat: nowIso,
            effective_status: 'connected',
          });

          safeSetState(() => ({
            isConnecting: true,
            isPolling: false,
            qrCode: null,
            error: null,
            attempts: 0,
            phase: 'stabilizing',
          }));

          // V7: Aguardar ready_to_send antes de enviar teste
          if (statusResult.phoneNumber) {
            toast.info('Conectado! Aguardando estabilização...');
            
            let isReady = statusResult.readyToSend === true;
            if (!isReady) {
              for (let waitAttempt = 0; waitAttempt < 8; waitAttempt++) {
                await new Promise(r => setTimeout(r, 1000));
                const statusCheck = await checkStatus(instanceId);
                if (statusCheck.readyToSend) {
                  isReady = true;
                  break;
                }
              }
            }

            if (isReady) {
              toast.info('Enviando teste de validação...');
              const result = await sendWelcomeMessage(instanceId, statusResult.phoneNumber);
              
              const mergedReady = await mergeSessionData(instanceId, {
                ready_to_send: result.success,
                welcome_sent_at: nowIso,
                last_send_success_at: result.success ? nowIso : undefined,
                ready_phase: result.success ? 'ready_to_send' : 'send_attempted',
                ready_updated_at: nowIso,
              });

              await updateInstanceInDB(instanceId, {
                effective_status: 'connected',
                session_data: mergedReady,
              });

              toast.success(result.success 
                ? '✅ WhatsApp conectado e funcionando!' 
                : '✅ WhatsApp conectado! Pronto para uso.');
            } else {
              toast.success('✅ WhatsApp conectado! Pronto para uso.');
            }
          } else {
            toast.success('✅ WhatsApp conectado com sucesso!');
          }

          // HARDENING: Reset contador de tentativas em sucesso
          connectAttemptsRef.current = 0;
          
          safeSetState(() => ({
            isConnecting: false,
            isPolling: false,
            qrCode: null,
            error: null,
            attempts: 0,
            phase: 'connected',
          }));
          onConnected?.();
        }
      }, HARDENING.POLLING_INTERVAL);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao conectar';
      safeSetState(() => ({
        isConnecting: false,
        isPolling: false,
        qrCode: null,
        error: message,
        attempts: 0,
        phase: 'error',
      }));
      // NÃO altera status no banco aqui: evita "desconectar" por erro de tela/reload.
      toast.error(message);
    }
  }, [stopPolling, normalizeQrToDataUrl, safeSetState]);

  const disconnect = useCallback(async (
    instanceId: string,
    _backendUrl?: string,
    _token?: string
  ) => {
    stopPolling();

    try {
      const flavor = await detectBackendFlavor(instanceId);
      const path = flavor === 'legacy' ? '/disconnect' : `/api/instance/${instanceId}/disconnect`;
      await proxyRequest(instanceId, path, 'POST', {});
    } catch {}

    await updateInstanceInDB(instanceId, {
      status: 'disconnected',
      effective_status: 'disconnected',
      qr_code: null,
    });

    safeSetState(() => ({
      isConnecting: false,
      isPolling: false,
      qrCode: null,
      error: null,
      attempts: 0,
      phase: 'idle',
    }));

    toast.success('Desconectado');
  }, [stopPolling, safeSetState]);

  const getInstanceStatus = useCallback(async (instanceId: string): Promise<InstanceStatus> => {
    const { data, error } = await supabase
      .from('genesis_instances')
      .select('status, phone_number, last_heartbeat, effective_status')
      .eq('id', instanceId)
      .single();

    if (error || !data) {
      return { status: 'disconnected', isStale: true };
    }

    const lastHeartbeatMs = data.last_heartbeat ? new Date(data.last_heartbeat).getTime() : 0;
    const isStale = lastHeartbeatMs > 0 && Date.now() - lastHeartbeatMs > HARDENING.STALE_THRESHOLD_MS;

    // IMPORTANTE: NÃO forçar disconnected apenas por stale
    // O status do banco (effective_status) é a fonte de verdade
    // Stale é APENAS um indicador visual, não deve alterar o status real
    const normalizedStatus = data.effective_status || data.status || 'disconnected';

    return {
      status: normalizedStatus,
      phoneNumber: data.phone_number || undefined,
      lastHeartbeat: data.last_heartbeat || undefined,
      isStale,
    };
  }, []);

  const startStatusPolling = useCallback((
    instanceId: string,
    onStatusChange: (status: InstanceStatus) => void
  ) => {
    stopStatusPolling();

    const poll = async () => {
      const status = await getInstanceStatus(instanceId);
      onStatusChange(status);
    };

    poll();
    statusPollingRef.current = setInterval(poll, 3000);
  }, [getInstanceStatus, stopStatusPolling]);

  const resetState = useCallback(() => {
    stopPolling();
    safeSetState(() => ({
      isConnecting: false,
      isPolling: false,
      qrCode: null,
      error: null,
      attempts: 0,
      phase: 'idle',
    }));
  }, [stopPolling, safeSetState]);

  return {
    connectionState,
    startConnection,
    disconnect,
    stopPolling,
    getInstanceStatus,
    startStatusPolling,
    stopStatusPolling,
    resetState,
  };
}
