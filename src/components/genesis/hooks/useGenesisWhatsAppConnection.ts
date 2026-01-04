import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as QRCode from 'qrcode';

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
}

// Aumentado para 5 minutos (300s) para maior estabilidade 24/7
const STALE_THRESHOLD_MS = 300000;

export function useGenesisWhatsAppConnection() {
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

  const maxPollingAttempts = 180; // 3 minutes
  const pollingInterval = 1000;
  const qrAutoRefreshMs = 45000;

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

  const updateInstanceInDB = async (instanceId: string, updates: Record<string, unknown>) => {
    try {
      const { error } = await supabase
        .from('genesis_instances')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', instanceId);
      
      if (error) {
        console.error('Error updating genesis instance:', error);
      }
      
      // Log status changes to event logs
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

  // V8: Criar instância no backend se não existir
  const ensureInstanceExists = async (instanceId: string, instanceName?: string): Promise<{ exists: boolean; created: boolean; error?: string }> => {
    // Primeiro tenta obter status
    const statusRes = await proxyRequest(instanceId, `/api/instance/${instanceId}/status`, 'GET');
    
    // Se retornou dados, instância existe
    if (statusRes.ok || (statusRes.data && !statusRes.data?.error?.includes('não encontrada'))) {
      return { exists: true, created: false };
    }
    
    // Instância não existe, criar
    logDiagnostic('CREATING_INSTANCE_IN_BACKEND', { instanceId, instanceName });
    
    const createRes = await proxyRequest(instanceId, '/api/instances', 'POST', {
      instanceId,
      name: instanceName || `instance-${instanceId.slice(0, 8)}`,
    });
    
    if (createRes.ok || createRes.data?.success) {
      logDiagnostic('INSTANCE_CREATED_SUCCESSFULLY', { instanceId });
      return { exists: true, created: true };
    }
    
    // Se erro é "já existe", tudo bem
    if (createRes.data?.error?.includes('já existe')) {
      return { exists: true, created: false };
    }
    
    return { exists: false, created: false, error: createRes.error || createRes.data?.error };
  };

  const checkStatus = async (instanceId: string): Promise<{ connected: boolean; phoneNumber?: string; isStale?: boolean; readyToSend?: boolean; notFound?: boolean }> => {
    // Primeiro verificar no banco se está stale
    const { data: instanceRow } = await supabase
      .from('genesis_instances')
      .select('last_heartbeat, effective_status')
      .eq('id', instanceId)
      .single();

    if (instanceRow?.last_heartbeat) {
      const lastHb = new Date(instanceRow.last_heartbeat).getTime();
      const isStale = Date.now() - lastHb > STALE_THRESHOLD_MS;
      
      if (isStale && instanceRow.effective_status === 'connected') {
        // Forçar sync no banco
        console.log(`[checkStatus] Instance ${instanceId} is stale, forcing disconnect`);
        await supabase
          .from('genesis_instances')
          .update({ 
            effective_status: 'disconnected', 
            status: 'disconnected',
            updated_at: new Date().toISOString() 
          })
          .eq('id', instanceId);
        
        return { connected: false, isStale: true };
      }
    }

    // Se não está stale, verificar status real via proxy
    const res = await proxyRequest(instanceId, `/api/instance/${instanceId}/status`, 'GET');
    
    // V8: Detectar se instância não existe no backend
    if (!res.ok && res.data?.error?.includes('não encontrada')) {
      return { connected: false, notFound: true };
    }
    
    if (!res.ok) return { connected: false };
    
    const result = res.data || {};
    
    // V8: Backend retorna readyToSend que indica se o socket está estável
    const isReady = result.readyToSend === true || result.ready_to_send === true;
    
    return {
      connected: result.connected === true || result.status === 'connected' || result.state === 'open',
      phoneNumber: result.phone || result.phoneNumber || result.jid?.split('@')[0],
      readyToSend: isReady,
    };
  };

  const generateQRCode = async (instanceId: string, skipConnect = false): Promise<string | null> => {
    // V8: Primeiro iniciar conexão se ainda não foi feito (a menos que skipConnect = true)
    if (!skipConnect) {
      const connectRes = await proxyRequest(instanceId, `/api/instance/${instanceId}/connect`, 'POST', {});
      logDiagnostic('GENERATE_QR_CONNECT_RESULT', { instanceId, ok: connectRes.ok, data: connectRes.data });
      
      // Aguardar um momento para o QR ser gerado
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // Tentar obter QR até 3 vezes com intervalos
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await proxyRequest(instanceId, `/api/instance/${instanceId}/qrcode`, 'GET');
      
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
    phoneNumber: string
  ): Promise<{ success: boolean; status?: number; error?: string }> => {
    const sendStart = Date.now();

    logDiagnostic('WELCOME_MESSAGE_START', {
      instanceId,
      phoneNumber,
      timestamp: new Date().toISOString(),
    });

    const message = `✅ *WhatsApp conectado com sucesso!*

🚀 Sua instância Genesis Hub está ativa e pronta para uso.

📱 Sistema: Genesis Auto
⏰ ${new Date().toLocaleString('pt-BR')}

Agora você pode automatizar seu atendimento!`;

    // Delay inicial mais longo para garantir estabilidade do socket
    const initialDelay = 4000;
    logDiagnostic('WELCOME_MESSAGE_DELAY', { instanceId, delayMs: initialDelay, reason: 'socket_stabilization' });
    await new Promise((r) => setTimeout(r, initialDelay));

    const maxAttempts = 12; // Aumentado para mais tentativas
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const attemptStart = Date.now();

      logDiagnostic('WELCOME_MESSAGE_ATTEMPT', {
        instanceId,
        phoneNumber,
        attempt,
        maxAttempts,
        elapsedTotal: Date.now() - sendStart,
      });

      try {
        const res = await proxyRequest(instanceId, `/api/instance/${instanceId}/send`, 'POST', {
          phone: phoneNumber,
          message,
        });

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
      } catch (error) {
        logDiagnostic('WELCOME_MESSAGE_EXCEPTION', {
          instanceId,
          attempt,
          errorType: 'exception',
          errorMessage: error instanceof Error ? error.message : String(error),
        });
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

      // PASSO 2: Validar saúde do backend primeiro
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

        // Verificar se deve enviar mensagem de teste
        const session = instanceRow?.session_data && typeof instanceRow.session_data === 'object'
          ? (instanceRow.session_data as Record<string, unknown>)
          : {};

        const lastWelcome = session.welcome_sent_at 
          ? new Date(session.welcome_sent_at as string).getTime() 
          : 0;
        const welcomeRecent = Date.now() - lastWelcome < 24 * 60 * 60 * 1000; // 24h

        if (phoneNumber && !welcomeRecent) {
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
        await proxyRequest(instanceId, `/api/instance/${instanceId}/connect`, 'POST', {});

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

        if (attempts >= maxPollingAttempts) {
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
        if (Date.now() - lastQrRefreshAtRef.current > qrAutoRefreshMs) {
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
      }, pollingInterval);

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
      await proxyRequest(instanceId, `/api/instance/${instanceId}/disconnect`, 'POST', {});
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
    const isStale = lastHeartbeatMs > 0 && Date.now() - lastHeartbeatMs > STALE_THRESHOLD_MS;

    // Se está marcado como connected mas heartbeat é stale, mostrar como disconnected
    let normalizedStatus = data.effective_status || data.status || 'disconnected';
    if (normalizedStatus === 'connected' && isStale) {
      normalizedStatus = 'disconnected';
    }

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
