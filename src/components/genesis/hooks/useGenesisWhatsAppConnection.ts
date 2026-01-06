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
  const lastBackendConnectCommandAtRef = useRef<number>(0);
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
    method: 'GET' | 'POST' | 'DELETE',
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
    const toDataStr = (v: any) => (typeof v === 'string' ? v : JSON.stringify(v ?? ''));
    const looksLikeMissingRoute = (s: string) =>
      s.includes('Cannot GET') || s.includes('Cannot POST') || s.includes('Cannot DELETE');

    // Probe do backend: endpoint que NÃO depende da instância existir.
    // Se /api/instances existir, tratamos como V8.
    const probeV8Support = async (): Promise<boolean> => {
      const res = await proxyRequest(instanceId, '/api/instances', 'GET');
      const dataStr = toDataStr(res.data);

      if (res.ok) return true;

      // Mesmo sem ok, 401/403 indica que o endpoint existe e respondeu (auth falhou, mas é V8).
      if (res.status === 401 || res.status === 403) return true;

      // Legacy costuma responder 404 com HTML "Cannot GET /api/instances".
      if (res.status === 404 && looksLikeMissingRoute(dataStr)) return false;

      // Qualquer outro cenário: assumir V8 (mais moderno) para evitar mis-detect.
      return true;
    };

    // 1) Cache (a menos que forceRefresh)
    if (!forceRefresh) {
      try {
        const { data: cached } = await supabase
          .from('genesis_instances')
          .select('session_data')
          .eq('id', instanceId)
          .single();

        const session = cached?.session_data as Record<string, unknown> | null;
        const cachedFlavor = session?.backend_flavor;

        if (cachedFlavor === 'v8') return 'v8';

        // Se cache diz "legacy", VALIDAR (porque 404 em /api/instance/:id/status pode ser apenas instância ainda não criada).
        if (cachedFlavor === 'legacy') {
          const healthRes = await proxyRequest(instanceId, '/health', 'GET');
          if (!healthRes.ok) return 'v8';

          const v8Supported = await probeV8Support();
          if (v8Supported) {
            logDiagnostic('FLAVOR_CACHE_OVERRIDDEN_TO_V8', { instanceId });
            try {
              const merged = await mergeSessionData(instanceId, { backend_flavor: 'v8' });
              await supabase
                .from('genesis_instances')
                .update({ session_data: JSON.parse(JSON.stringify(merged)) })
                .eq('id', instanceId);
            } catch {}
            return 'v8';
          }

          return 'legacy';
        }
      } catch {}
    }

    // 2) Sem cache (ou forceRefresh)
    const healthRes = await proxyRequest(instanceId, '/health', 'GET');
    if (!healthRes.ok) {
      // Servidor offline, assumir v8 (mais moderno)
      return 'v8';
    }

    const v8Supported = await probeV8Support();
    const flavor: 'v8' | 'legacy' = v8Supported ? 'v8' : 'legacy';

    if (flavor === 'legacy') {
      logDiagnostic('FLAVOR_DETECTED_LEGACY', { instanceId });
    } else {
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

  // No backend V8, usamos sempre o UUID do banco como `instanceId` no VPS.
  // Isso é obrigatório porque o endpoint de heartbeat do backend espera UUID.
  const getBackendInstanceKey = async (instanceId: string): Promise<string> => instanceId;

  // V8: Criar instância no backend se não existir (só para backends V8)
  const ensureInstanceExists = async (
    instanceId: string,
    instanceName?: string
  ): Promise<{ exists: boolean; created: boolean; error?: string; flavor?: 'v8' | 'legacy'; backendKey?: string }> => {
    // Primeiro detectar flavor do backend
    const flavor = await detectBackendFlavor(instanceId);
    logDiagnostic('BACKEND_FLAVOR_DETECTED', { instanceId, flavor });

    if (flavor === 'legacy') {
      // Backend legacy não precisa criar instância - já existe por padrão
      return { exists: true, created: false, flavor: 'legacy', backendKey: 'default' };
    }

    const backendKey = instanceId;

    // Backend V8: verificar se instância existe pelo UUID
    const statusRes = await proxyRequest(instanceId, `/api/instance/${encodeURIComponent(backendKey)}/status`, 'GET');
    if (statusRes.ok) {
      return { exists: true, created: false, flavor: 'v8', backendKey };
    }

    // Instância não existe, criar com UUID e nome humano
    const createName = instanceName || `instance-${instanceId.slice(0, 8)}`;
    logDiagnostic('CREATING_INSTANCE_IN_BACKEND', { instanceId, backendKey, createName });

    const createRes = await proxyRequest(instanceId, '/api/instances', 'POST', {
      instanceId: backendKey,
      name: createName,
    });

    if (createRes.ok || createRes.data?.success || createRes.data?.id) {
      return { exists: true, created: true, flavor: 'v8', backendKey };
    }

    if (createRes.data?.error?.includes('já existe')) {
      return { exists: true, created: false, flavor: 'v8', backendKey };
    }

    return {
      exists: false,
      created: false,
      flavor: 'v8',
      backendKey,
      error: createRes.error || createRes.data?.error || 'Falha ao criar instância no backend',
    };
  };

  const checkStatus = async (instanceId: string): Promise<{ connected: boolean; phoneNumber?: string; isStale?: boolean; readyToSend?: boolean; notFound?: boolean; flavor?: 'v8' | 'legacy' }> => {
    // IMPORTANT: Não "derrubar" a instância pelo frontend.
    // Stale aqui é apenas sinalização. A conexão real é confirmada pelo backend.
    const { data: instanceRow } = await supabase
      .from('genesis_instances')
      .select('last_heartbeat, effective_status, session_data')
      .eq('id', instanceId)
      .single();

    const lastHb = instanceRow?.last_heartbeat ? new Date(instanceRow.last_heartbeat).getTime() : 0;
    const isStale = lastHb > 0 && (Date.now() - lastHb) > HARDENING.STALE_THRESHOLD_MS;

    // Usar flavor cacheado (evita 404 v8 -> fallback legacy em TODA checagem)
    let flavor: 'v8' | 'legacy' = await detectBackendFlavor(instanceId);
    
    // Obter a chave correta da instância no backend (nome, não UUID)
    const backendKey = await getBackendInstanceKey(instanceId);

    const fetchStatus = async (f: 'v8' | 'legacy', key: string) => {
      const path = f === 'v8' ? `/api/instance/${encodeURIComponent(key)}/status` : '/status';
      return proxyRequest(instanceId, path, 'GET');
    };

    let res = await fetchStatus(flavor, backendKey);

    // Se o flavor cacheado estiver errado (mudança de script VPS), tenta fallback 1x
    const dataStr = typeof res.data === 'string' ? res.data : JSON.stringify(res.data || '');
    const looksLikeMissingRoute =
      !res.ok &&
      (res.status === 404 || dataStr.includes('Cannot GET') || dataStr.includes('Cannot POST'));

    if (looksLikeMissingRoute) {
      const other: 'v8' | 'legacy' = flavor === 'v8' ? 'legacy' : 'v8';
      logDiagnostic('STATUS_FLAVOR_MISMATCH_TRYING_FALLBACK', {
        instanceId,
        backendKey,
        from: flavor,
        to: other,
        status: res.status,
      });

      const fallback = await fetchStatus(other, backendKey);
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

  const generateQRCode = async (instanceId: string, _skipConnect = false): Promise<string | null> => {
    // Detectar flavor do backend (FORÇAR refresh: usuário pode ter trocado o script VPS)
    const flavor = await detectBackendFlavor(instanceId, true);

    // No V8, backendKey = UUID
    const backendKey = await getBackendInstanceKey(instanceId);
    logDiagnostic('GENERATE_QR_BACKEND_FLAVOR', { instanceId, flavor, backendKey });

    const connectPath = flavor === 'v8'
      ? `/api/instance/${encodeURIComponent(backendKey)}/connect`
      : '/connect';

    // "Connect" é idempotente; fazemos best-effort para garantir que o backend
    // realmente iniciou a geração do QR (evita QR=null + status=disconnected em loop)
    const connectMaybe = async () => {
      const now = Date.now();
      if (now - lastBackendConnectCommandAtRef.current < 8000) return;
      lastBackendConnectCommandAtRef.current = now;
      await proxyRequest(instanceId, connectPath, 'POST', {});
    };

    // Sempre tentar iniciar conexão (throttled) antes de buscar QR
    await connectMaybe();

    // Tentar obter QR por mais tempo (alguns VPS demoram para materializar o QR)
    const maxAttempts = 15; // ~30s
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const qrPath = flavor === 'v8'
        ? `/api/instance/${encodeURIComponent(backendKey)}/qrcode`
        : '/qrcode';

      let res = await proxyRequest(instanceId, qrPath, 'GET');

      // Se backend respondeu "disconnected" sem QR, reforçar /connect de tempos em tempos
      if (attempt === 4 || attempt === 9) {
        const backendStatus = String(res?.data?.status || '').toLowerCase();
        if (backendStatus === 'disconnected' || backendStatus === 'idle' || backendStatus === '') {
          await connectMaybe();
        }
      }

      if (res.data?.connected || res.data?.status === 'connected') {
        return 'CONNECTED';
      }

      const rawQr = res.data?.qrcode || res.data?.qr || res.data?.base64 || res.data?.qrCode;
      if (typeof rawQr === 'string' && rawQr.length > 10) {
        return await normalizeQrToDataUrl(rawQr);
      }

      // aguardar antes da próxima tentativa
      await new Promise(r => setTimeout(r, 2000));
    }

    throw new Error('QR Code não disponível - aguarde e tente novamente');
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
    
    // Obter a chave correta da instância no backend (nome, não UUID)
    const backendKey = await getBackendInstanceKey(instanceId);
    logDiagnostic('WELCOME_MESSAGE_FLAVOR', { instanceId, flavor, backendKey });

    const maxAttempts = 10;

    // Lista de endpoints para tentar - PRIORIZAR V8 sempre (mais moderno)
    // Os endpoints V8 (/api/instance/:key/send) usam o backendKey (nome), não UUID
    const sendEndpoints = [
      `/api/instance/${encodeURIComponent(backendKey)}/send`,
      `/api/instance/${encodeURIComponent(backendKey)}/send-message`,
      `/api/instance/${encodeURIComponent(backendKey)}/sendText`,
      `/api/instance/${encodeURIComponent(backendKey)}/send-text`,
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
        logDiagnostic('INSTANCE_CREATED_IN_BACKEND', { instanceId, name: instanceRow?.name, backendKey: ensureResult.backendKey });
      }
      
      // Guardar a chave do backend para uso posterior
      const backendKey = ensureResult.backendKey || instanceRow?.name || instanceId;

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

          // V8 FIX: Backend V8 pode não retornar readyToSend, mas connected=true já é suficiente
          // Tentar enviar mensagem de teste SEMPRE que estiver conectado
          toast.info(isReady ? 'Socket estável! Enviando teste...' : 'Conectado! Enviando teste de validação...');
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

          // Parar polling após conexão bem-sucedida - NÃO reconectar
          stopPolling();
          
          safeSetState(() => ({
            isConnecting: false,
            isPolling: false,
            qrCode: null,
            error: null,
            attempts: 0,
            phase: 'connected',
          }));

          // Resetar contador de tentativas após sucesso
          connectAttemptsRef.current = 0;
          cooldownUntilRef.current = 0;

          onConnected?.();
          return;
        }
        
        // Sem número de telefone, mas conectado
        safeSetState(() => ({
          isConnecting: false,
          isPolling: false,
          qrCode: null,
          error: null,
          attempts: 0,
          phase: 'connected',
        }));

        // Resetar contador após sucesso
        connectAttemptsRef.current = 0;
        cooldownUntilRef.current = 0;

        toast.success('✅ WhatsApp conectado!');
        onConnected?.();
        return;
      }
      
      // === NÃO CONECTADO: Gerar QR ===
      safeSetState(() => ({
        isConnecting: true,
        isPolling: false,
        qrCode: null,
        error: null,
        attempts: 0,
        phase: 'generating',
      }));

      // Gerar QR
      const qrResult = await generateQRCode(instanceId);

      // generateQRCode retorna string (QR ou 'CONNECTED') ou null
      if (!qrResult) {
        throw new Error('QR Code não foi gerado. Tente novamente.');
      }

      if (qrResult === 'CONNECTED') {
        // Conectou durante a geração do QR (raro)
        const statusAfter = await checkStatus(instanceId);
        
        await updateInstanceInDB(instanceId, {
          status: 'connected',
          effective_status: 'connected',
          phone_number: statusAfter.phoneNumber,
          last_heartbeat: nowIso,
        });

        safeSetState(() => ({
          isConnecting: false,
          isPolling: false,
          qrCode: null,
          error: null,
          attempts: 0,
          phase: 'connected',
        }));

        // Enviar mensagem de teste se tiver número
        if (statusAfter.phoneNumber) {
          toast.info('Conectado! Enviando teste de validação...');
          const result = await sendWelcomeMessage(instanceId, statusAfter.phoneNumber);
          
          if (result.success) {
            toast.success('✅ WhatsApp conectado e funcionando!');
          } else {
            toast.success('✅ WhatsApp conectado! Pronto para uso.');
          }
        } else {
          toast.success('✅ WhatsApp conectado!');
        }

        // Resetar contadores
        connectAttemptsRef.current = 0;
        cooldownUntilRef.current = 0;

        onConnected?.();
        return;
      }

      // Temos um QR Code válido
      safeSetState(() => ({
        isConnecting: true,
        isPolling: true,
        qrCode: qrResult,
        error: null,
        attempts: 0,
        phase: 'waiting',
      }));

      // Transição para qr_pending via orquestrador
      try {
        await supabase.functions.invoke('genesis-connection-orchestrator', {
          body: {
            instanceId,
            action: 'transition',
            newStatus: 'qr_pending',
            source: 'frontend_qr_generated',
          },
        });
      } catch {}

      // Iniciar polling para aguardar conexão
      startPollingForConnection(instanceId, backendKey, onConnected);
    } catch (error: any) {
      console.error('[startConnection] Error:', error);
      
      safeSetState(() => ({
        isConnecting: false,
        isPolling: false,
        qrCode: null,
        error: error.message || 'Erro ao conectar',
        attempts: 0,
        phase: 'error',
      }));

      // Logar erro
      try {
        await supabase.from('genesis_event_logs').insert({
          instance_id: instanceId,
          event_type: 'connection_error',
          severity: 'error',
          message: error.message || 'Erro ao conectar',
        });
      } catch {}

      toast.error(error.message || 'Erro ao conectar');
    }
  }, [stopPolling, validateBackendHealth, ensureInstanceExists, checkStatus, updateInstanceInDB, logDiagnostic, mergeSessionData, sendWelcomeMessage, generateQRCode]);

  /**
   * Polling para aguardar conexão após QR Code
   * COM LIMITES ESTRITOS para evitar loops infinitos
   */
  const startPollingForConnection = useCallback(async (
    instanceId: string,
    backendKey: string,
    onConnected?: () => void
  ) => {
    const maxPollingTime = 60000; // 60 segundos máximo
    const pollInterval = 2000; // 2 segundos entre polls
    const startTime = Date.now();
    
    const pollForConnection = async () => {
      // Verificar se ainda está montado e polling ativo
      if (!mountedRef.current) return;
      
      // Verificar timeout
      if (Date.now() - startTime > maxPollingTime) {
        console.log('[Polling] Timeout - 60s sem conexão');
        stopPolling();
        safeSetState(() => ({
          isConnecting: false,
          isPolling: false,
          qrCode: null,
          error: 'Tempo esgotado. Escaneie o QR Code novamente.',
          attempts: 0,
          phase: 'error',
        }));
        return;
      }
      
      try {
        const status = await checkStatus(instanceId);
        
        if (status.connected) {
          console.log('[Polling] Conectado!', status);
          stopPolling();
          
          const nowIso = new Date().toISOString();
          
          // Atualizar banco
          await updateInstanceInDB(instanceId, {
            status: 'connected',
            effective_status: 'connected',
            phone_number: status.phoneNumber,
            last_heartbeat: nowIso,
          });
          
          safeSetState(() => ({
            isConnecting: false,
            isPolling: false,
            qrCode: null,
            error: null,
            attempts: 0,
            phase: 'connected',
          }));
          
          // Enviar mensagem de teste
          if (status.phoneNumber) {
            toast.info('Conectado! Enviando teste de validação...');
            const result = await sendWelcomeMessage(instanceId, status.phoneNumber);
            
            if (result.success) {
              toast.success('✅ WhatsApp conectado e funcionando!');
            } else {
              toast.success('✅ WhatsApp conectado! Pronto para uso.');
            }
          } else {
            toast.success('✅ WhatsApp conectado!');
          }
          
          // Resetar contadores
          connectAttemptsRef.current = 0;
          cooldownUntilRef.current = 0;
          
          onConnected?.();
          return;
        }
        
        // Continuar polling
        pollingRef.current = setTimeout(pollForConnection, pollInterval) as any;
      } catch (error) {
        console.error('[Polling] Error:', error);
        // Continuar tentando até timeout
        pollingRef.current = setTimeout(pollForConnection, pollInterval) as any;
      }
    };
    
    // Iniciar polling
    pollingRef.current = setTimeout(pollForConnection, pollInterval) as any;
  }, [stopPolling, checkStatus, updateInstanceInDB, sendWelcomeMessage]);

  const disconnect = useCallback(async (
    instanceId: string,
    _backendUrl?: string,
    _token?: string
  ) => {
    // UX: parar tudo imediatamente (sem travar UI em "Gerando QR")
    stopPolling();
    safeSetState(() => ({
      isConnecting: false,
      isPolling: false,
      qrCode: null,
      error: null,
      attempts: 0,
      phase: 'idle',
    }));

    try {
      const flavor = await detectBackendFlavor(instanceId, true);
      const path = flavor === 'legacy' ? '/disconnect' : `/api/instance/${instanceId}/disconnect`;
      await proxyRequest(instanceId, path, 'POST', {});
    } catch {}

    // Resetar status orquestrado (evita ficar preso em qr_pending) - best-effort
    await requestOrchestratedTransition(instanceId, 'disconnected', 'frontend', {
      reason: 'user_disconnect',
    });

    // Limpar QR armazenado (best-effort)
    try {
      await supabase
        .from('genesis_instances')
        .update({ qr_code: null, updated_at: new Date().toISOString() })
        .eq('id', instanceId);
    } catch {}

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

  const cancelConnection = useCallback(async (instanceId: string) => {
    // "Cancelar" = parar tentativa/polling + voltar UI ao idle + tirar a instância de qr_pending.
    stopPolling();

    safeSetState(() => ({
      isConnecting: false,
      isPolling: false,
      qrCode: null,
      error: null,
      attempts: 0,
      phase: 'idle',
    }));

    // Tirar a instância de qr_pending sem depender de transição para "idle" (pode ser inválida)
    await requestOrchestratedTransition(instanceId, 'disconnected', 'frontend', {
      reason: 'user_cancel',
    });

    // Limpar QR armazenado (best-effort)
    try {
      await supabase
        .from('genesis_instances')
        .update({ qr_code: null, updated_at: new Date().toISOString() })
        .eq('id', instanceId);
    } catch {}
  }, [stopPolling, safeSetState]);

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

  /**
   * CORREÇÃO DEFINITIVA: Reset de sessão completo
   * - Apaga instância no VPS (DELETE)
   * - Recria instância com UUID
   * - Dispara /connect para gerar novo QR
   * - Faz polling até obter QR ou conectar
   */
  const resetSession = useCallback(async (
    instanceId: string,
    instanceName?: string,
    onSuccess?: () => void
  ): Promise<{ success: boolean; error?: string; diagnostic?: Record<string, unknown> }> => {
    const diagnostic: Record<string, unknown> = {
      startedAt: new Date().toISOString(),
      instanceId,
      steps: [] as string[],
    };

    const addStep = (step: string, data?: Record<string, unknown>) => {
      (diagnostic.steps as string[]).push(step);
      if (data) diagnostic[step] = data;
      logDiagnostic(`RESET_SESSION_${step.toUpperCase()}`, { instanceId, ...data });
    };

    // 1) Parar tudo e limpar UI
    stopPolling();
    safeSetState(() => ({
      isConnecting: true,
      isPolling: false,
      qrCode: null,
      error: null,
      attempts: 0,
      phase: 'validating',
    }));

    try {
      addStep('started');

      // 2) Detectar flavor do backend
      const flavor = await detectBackendFlavor(instanceId, true);
      addStep('flavor_detected', { flavor });

      if (flavor === 'legacy') {
        // Legacy não suporta DELETE, apenas disconnect + connect
        addStep('legacy_disconnect');
        await proxyRequest(instanceId, '/disconnect', 'POST', {});
        await new Promise(r => setTimeout(r, 1000));
        
        addStep('legacy_connect');
        await proxyRequest(instanceId, '/connect', 'POST', {});
      } else {
        // V8: DELETE + CREATE + CONNECT
        const backendKey = instanceId;

        // 3) Tentar disconnect primeiro (best-effort)
        addStep('v8_disconnect');
        await proxyRequest(instanceId, `/api/instance/${encodeURIComponent(backendKey)}/disconnect`, 'POST', {});
        await new Promise(r => setTimeout(r, 500));

        // 4) DELETE da instância no VPS (remove sessão/credenciais)
        addStep('v8_delete');
        const deleteRes = await proxyRequest(instanceId, `/api/instance/${encodeURIComponent(backendKey)}`, 'DELETE', {});
        diagnostic.deleteResult = { ok: deleteRes.ok, status: deleteRes.status, data: deleteRes.data };

        await new Promise(r => setTimeout(r, 500));

        // 5) Recriar instância
        addStep('v8_create');
        const createName = instanceName || `instance-${instanceId.slice(0, 8)}`;
        const createRes = await proxyRequest(instanceId, '/api/instances', 'POST', {
          instanceId: backendKey,
          name: createName,
        });
        diagnostic.createResult = { ok: createRes.ok, status: createRes.status, data: createRes.data };

        if (!createRes.ok && !createRes.data?.success && !createRes.data?.id && !createRes.data?.error?.includes('já existe')) {
          throw new Error(createRes.error || 'Falha ao recriar instância no backend');
        }

        await new Promise(r => setTimeout(r, 500));

        // 6) Iniciar conexão
        addStep('v8_connect');
        await proxyRequest(instanceId, `/api/instance/${encodeURIComponent(backendKey)}/connect`, 'POST', {});
      }

      // 7) Resetar status no banco via orquestrador
      addStep('orchestrator_reset');
      await requestOrchestratedTransition(instanceId, 'qr_pending', 'frontend', {
        reason: 'session_reset',
      });

      // Limpar session_data antiga (backend_instance_key pode estar errado)
      const cleanSessionData = await mergeSessionData(instanceId, {
        backend_flavor: flavor,
        backend_instance_key: instanceId,
        reset_at: new Date().toISOString(),
        last_reset_diagnostic: diagnostic,
      });

      await supabase
        .from('genesis_instances')
        .update({
          qr_code: null,
          session_data: JSON.parse(JSON.stringify(cleanSessionData)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', instanceId);

      // 8) Tentar obter QR Code
      addStep('fetch_qr');
      safeSetState(prev => ({ ...prev, phase: 'generating' }));

      let qrCode: string | null = null;
      let connected = false;

      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise(r => setTimeout(r, 1500));

        const qrPath = flavor === 'v8'
          ? `/api/instance/${encodeURIComponent(instanceId)}/qrcode`
          : '/qrcode';

        const qrRes = await proxyRequest(instanceId, qrPath, 'GET');

        // Verificar se já conectou
        if (qrRes.data?.connected || qrRes.data?.status === 'connected') {
          connected = true;
          addStep('connected_during_qr_poll', { attempt });
          break;
        }

        const rawQr = qrRes.data?.qrcode || qrRes.data?.qr || qrRes.data?.base64 || qrRes.data?.qrCode;
        if (typeof rawQr === 'string' && rawQr.length > 10) {
          qrCode = await normalizeQrToDataUrl(rawQr);
          addStep('qr_obtained', { attempt });
          break;
        }

        // Se backend ainda diz "disconnected" sem QR após 6 tentativas, re-trigger connect
        if (attempt === 6 || attempt === 12) {
          const connectPath = flavor === 'v8'
            ? `/api/instance/${encodeURIComponent(instanceId)}/connect`
            : '/connect';
          await proxyRequest(instanceId, connectPath, 'POST', {});
        }
      }

      if (connected) {
        // Sucesso imediato
        toast.success('✅ Sessão restaurada!');
        safeSetState(() => ({
          isConnecting: false,
          isPolling: false,
          qrCode: null,
          error: null,
          attempts: 0,
          phase: 'connected',
        }));
        connectAttemptsRef.current = 0;
        onSuccess?.();
        return { success: true, diagnostic };
      }

      if (!qrCode) {
        // Anti-loop: não conseguiu QR, parar e mostrar erro acionável
        addStep('qr_failed');
        diagnostic.finishedAt = new Date().toISOString();
        
        safeSetState(() => ({
          isConnecting: false,
          isPolling: false,
          qrCode: null,
          error: 'Sessão invalidada. Backend não gerou QR Code.',
          attempts: 0,
          phase: 'error',
        }));

        // Salvar diagnóstico para suporte
        try {
          await supabase.from('genesis_event_logs').insert([{
            instance_id: instanceId,
            event_type: 'reset_session_failed',
            severity: 'warning',
            message: 'Reset de sessão falhou: QR não gerado',
            details: JSON.parse(JSON.stringify(diagnostic)),
          }]);
        } catch {}

        return { success: false, error: 'QR Code não disponível após reset', diagnostic };
      }

      // 9) QR obtido - iniciar polling
      addStep('polling_started');
      lastQrRefreshAtRef.current = Date.now();
      
      safeSetState(() => ({
        isConnecting: false,
        isPolling: true,
        qrCode,
        error: null,
        attempts: 0,
        phase: 'waiting',
      }));

      toast.success('Nova sessão iniciada! Escaneie o QR Code.');

      // Iniciar polling para detectar conexão
      let pollAttempts = 0;
      pollingRef.current = setInterval(async () => {
        if (!mountedRef.current) {
          stopPolling();
          return;
        }

        pollAttempts++;
        safeSetState(prev => ({ ...prev, attempts: pollAttempts }));

        // Anti-loop: limite de polling
        if (pollAttempts >= HARDENING.MAX_POLLING_ATTEMPTS) {
          stopPolling();
          safeSetState(prev => ({
            ...prev,
            error: 'Tempo limite excedido. Tente novamente.',
            isPolling: false,
            phase: 'error',
          }));
          toast.error('Tempo limite para conexão excedido');
          return;
        }

        // Verificar conexão
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

          connectAttemptsRef.current = 0;
          
          safeSetState(() => ({
            isConnecting: false,
            isPolling: false,
            qrCode: null,
            error: null,
            attempts: 0,
            phase: 'connected',
          }));

          toast.success('✅ WhatsApp conectado com sucesso!');
          onSuccess?.();
        }
      }, HARDENING.POLLING_INTERVAL);

      return { success: true, diagnostic };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao resetar sessão';
      diagnostic.error = message;
      diagnostic.finishedAt = new Date().toISOString();

      safeSetState(() => ({
        isConnecting: false,
        isPolling: false,
        qrCode: null,
        error: message,
        attempts: 0,
        phase: 'error',
      }));

      toast.error(message);
      return { success: false, error: message, diagnostic };
    }
  }, [stopPolling, safeSetState, normalizeQrToDataUrl, checkStatus, updateInstanceInDB, mergeSessionData, detectBackendFlavor, proxyRequest, logDiagnostic]);

  return {
    connectionState,
    startConnection,
    disconnect,
    cancelConnection,
    stopPolling,
    getInstanceStatus,
    startStatusPolling,
    stopStatusPolling,
    resetState,
    resetSession,
  };
}
