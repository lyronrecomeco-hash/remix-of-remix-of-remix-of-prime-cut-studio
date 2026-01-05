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
}

export function useWhatsAppConnection() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    isPolling: false,
    qrCode: null,
    error: null,
    attempts: 0,
  });
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const statusInFlightRef = useRef(false);
  const lastQrRefreshAtRef = useRef<number>(0);
  const backendFlavorRef = useRef<'unknown' | 'v8' | 'legacy'>('unknown');
  const maxPollingAttempts = 150; // ~2.5 minutes total (1s * 150)
  const pollingInterval = 1000;
  const qrAutoRefreshMs = 45000;

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setConnectionState(prev => ({ ...prev, isPolling: false }));
  }, []);

  const updateInstanceStatus = async (instanceId: string, status: string, phoneNumber?: string) => {
    try {
      const nowIso = new Date().toISOString();

      const updateData: Record<string, unknown> = {
        status,
        last_seen: nowIso,
        updated_at: nowIso,
      };

      if (phoneNumber) {
        updateData.phone_number = phoneNumber;
      }

      // Baseline de heartbeat ao detectar conexão pelo painel.
      // A instância deve permanecer viva pelo backend (heartbeat), mas isso evita
      // o efeito colateral de "stale imediato" logo após conectar.
      if (status === 'connected') {
        updateData.last_heartbeat = nowIso;
        updateData.last_heartbeat_at = nowIso;
        updateData.effective_status = 'connected';
        updateData.heartbeat_age_seconds = 0;
      }

      if (status === 'disconnected') {
        updateData.effective_status = 'disconnected';
      }

      await supabase
        .from('whatsapp_instances')
        .update(updateData)
        .eq('id', instanceId);
    } catch (error) {
      console.error('Error updating instance status:', error);
    }
  };

  const shouldUseProxy = (backendUrl: string) => {
    try {
      const u = new URL(backendUrl);
      const isHttp = u.protocol === 'http:';
      const isLocalhost = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
      return typeof window !== 'undefined' && window.location.protocol === 'https:' && isHttp && !isLocalhost;
    } catch {
      return false;
    }
  };

  const proxyRequest = async (
    path: string,
    method: 'GET' | 'POST',
    body?: unknown
  ): Promise<{ ok: boolean; status: number; data: any }> => {
    const { data, error } = await supabase.functions.invoke('whatsapp-backend-proxy', {
      body: { path, method, body },
    });

    if (error) {
      throw new Error(error.message);
    }

    return (data || { ok: false, status: 0, data: null }) as any;
  };

  const checkStatus = async (
    instanceId: string,
    backendUrl: string,
    token: string
  ): Promise<{ connected: boolean; phoneNumber?: string }> => {
    const parseConnected = (result: any): { connected: boolean; phoneNumber?: string } => {
      const isConnected =
        result?.connected === true ||
        result?.status === 'connected' ||
        result?.state === 'open' ||
        result?.connectionStatus === 'connected' ||
        result?.whatsapp === 'connected';

      return {
        connected: Boolean(isConnected),
        phoneNumber: result?.phone || result?.phoneNumber || result?.jid?.split?.('@')?.[0],
      };
    };

    // VPS HTTP em página HTTPS -> usa proxy (evita Mixed Content/CORS)
    if (shouldUseProxy(backendUrl)) {
      try {
        // If already detected legacy, use legacy endpoint
        if (backendFlavorRef.current === 'legacy') {
          const legacyRes = await proxyRequest('/status', 'GET');
          if (!legacyRes.ok) return { connected: false };
          return parseConnected(legacyRes.data || {});
        }

        const res = await proxyRequest(`/api/instance/${instanceId}/status`, 'GET');

        // Legacy backend: multi-instance endpoint doesn't exist
        if (
          res.status === 404 &&
          typeof res.data === 'string' &&
          res.data.includes('Cannot GET /api/instance/')
        ) {
          backendFlavorRef.current = 'legacy';
          const legacyRes = await proxyRequest('/status', 'GET');
          if (!legacyRes.ok) return { connected: false };
          return parseConnected(legacyRes.data || {});
        }

        if (!res.ok) return { connected: false };
        backendFlavorRef.current = 'v8';
        return parseConnected(res.data || {});
      } catch {
        return { connected: false };
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Legacy mode
      if (backendFlavorRef.current === 'legacy') {
        const response = await fetch(`${backendUrl}/status`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) return { connected: false };
        const result = await response.json().catch(() => ({} as any));
        return parseConnected(result);
      }

      const response = await fetch(`${backendUrl}/api/instance/${instanceId}/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        // Detect legacy by probing /status
        if (response.status === 404) {
          const legacyProbe = await fetch(`${backendUrl}/status`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });

          if (legacyProbe.ok) {
            backendFlavorRef.current = 'legacy';
            const legacyJson = await legacyProbe.json().catch(() => ({} as any));
            return parseConnected(legacyJson);
          }
        }
        return { connected: false };
      }

      const result = await response.json().catch(() => ({} as any));
      backendFlavorRef.current = 'v8';
      return parseConnected(result);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { connected: false };
      }
      console.log('Status check failed:', error);
      return { connected: false };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const ensureInstanceExists = async (
    instanceId: string,
    backendUrl: string,
    token: string,
    instanceName?: string
  ): Promise<{ exists: boolean; created: boolean }> => {
    if (backendFlavorRef.current === 'legacy') {
      return { exists: true, created: false };
    }

    const name = instanceName || `instance-${instanceId.slice(0, 8)}`;

    // HTTPS page calling HTTP VPS must go through proxy
    if (shouldUseProxy(backendUrl)) {
      const statusRes = await proxyRequest(`/api/instance/${instanceId}/status`, 'GET');

      if (statusRes.ok) {
        backendFlavorRef.current = 'v8';
        return { exists: true, created: false };
      }

      // Legacy backend: multi-instance endpoint doesn't exist
      if (
        statusRes.status === 404 &&
        typeof statusRes.data === 'string' &&
        statusRes.data.includes('Cannot GET /api/instance/')
      ) {
        backendFlavorRef.current = 'legacy';
        return { exists: true, created: false };
      }

      const statusMsg = String(statusRes.data?.error || statusRes.data?.message || '').toLowerCase();
      const notFound =
        statusRes.status === 404 ||
        statusMsg.includes('não encontrada') ||
        statusMsg.includes('nao encontrada') ||
        statusMsg.includes('not found');

      // If it's some other error, the endpoint exists; treat as "exists".
      if (!notFound) {
        backendFlavorRef.current = 'v8';
        return { exists: true, created: false };
      }

      const createRes = await proxyRequest('/api/instances', 'POST', { instanceId, name });

      if (createRes.ok || createRes.data?.success) {
        backendFlavorRef.current = 'v8';
        return { exists: true, created: true };
      }

      // If /api/instances doesn't exist, it's a legacy backend (single-instance)
      if (
        createRes.status === 404 &&
        typeof createRes.data === 'string' &&
        createRes.data.includes('Cannot POST /api/instances')
      ) {
        backendFlavorRef.current = 'legacy';
        return { exists: true, created: false };
      }

      const createMsg = String(createRes.data?.error || createRes.data?.message || '');
      if (createMsg.toLowerCase().includes('já existe') || createMsg.toLowerCase().includes('ja existe')) {
        backendFlavorRef.current = 'v8';
        return { exists: true, created: false };
      }

      throw new Error(createMsg || `Falha ao criar instância (HTTP ${createRes.status || 'erro'})`);
    }

    // Direct mode (localhost or HTTPS backend)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      let statusResponse: Response;
      try {
        statusResponse = await fetch(`${backendUrl}/api/instance/${instanceId}/status`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return { exists: true, created: false };
        }
        throw err;
      }

      if (statusResponse.ok) {
        backendFlavorRef.current = 'v8';
        return { exists: true, created: false };
      }

      if (statusResponse.status === 404) {
        // Probe legacy backend
        const legacyProbe = await fetch(`${backendUrl}/status`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (legacyProbe.ok) {
          backendFlavorRef.current = 'legacy';
          return { exists: true, created: false };
        }
      }

      if (statusResponse.status !== 404) {
        backendFlavorRef.current = 'v8';
        return { exists: true, created: false };
      }

      const createResponse = await fetch(`${backendUrl}/api/instances`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId, name }),
        signal: controller.signal,
      });

      if (createResponse.ok) {
        backendFlavorRef.current = 'v8';
        return { exists: true, created: true };
      }

      if (createResponse.status === 404) {
        // Probably legacy
        const legacyProbe = await fetch(`${backendUrl}/status`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (legacyProbe.ok) {
          backendFlavorRef.current = 'legacy';
          return { exists: true, created: false };
        }
      }

      const rawText = await createResponse.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = {};
      }

      const createMsg = String(data?.error || data?.message || rawText || '');
      if (createMsg.toLowerCase().includes('já existe') || createMsg.toLowerCase().includes('ja existe')) {
        backendFlavorRef.current = 'v8';
        return { exists: true, created: false };
      }

      throw new Error(createMsg || `Falha ao criar instância (HTTP ${createResponse.status})`);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const normalizeQrToDataUrl = useCallback(async (rawQr: string): Promise<string> => {
    if (rawQr.startsWith('data:')) return rawQr;

    // If backend already returns base64 PNG without prefix
    if (/^[A-Za-z0-9+/=]+$/.test(rawQr.slice(0, 50))) {
      return `data:image/png;base64,${rawQr}`;
    }

    // Baileys QR payload string (ex: "2@...") -> render it as an image in the browser
    try {
      return await QRCode.toDataURL(rawQr, { width: 256, margin: 1 });
    } catch (err) {
      console.error('Failed to render QR payload as image:', err);
      throw new Error('QR Code inválido/inesperado. Clique em “Atualizar QR Code”.');
    }
  }, []);

  const generateQRCode = async (
    instanceId: string,
    backendUrl: string,
    token: string,
    phoneHint?: string
  ): Promise<string | null> => {
    const useProxy = shouldUseProxy(backendUrl);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const getPaths = () => {
      const isLegacy = backendFlavorRef.current === 'legacy';
      return {
        connectPath: isLegacy ? '/connect' : `/api/instance/${instanceId}/connect`,
        qrPath: isLegacy ? '/qrcode' : `/api/instance/${instanceId}/qrcode`,
      };
    };

    const startConnect = async () => {
      const { connectPath } = getPaths();

      if (useProxy) {
        await proxyRequest(connectPath, 'POST', {});
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        await fetch(`${backendUrl}${connectPath}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    };

    const getQr = async (): Promise<{ ok: boolean; status: number; data: any }> => {
      const { qrPath } = getPaths();

      if (useProxy) {
        return await proxyRequest(qrPath, 'GET');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(`${backendUrl}${qrPath}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const rawText = await response.text();
        let result: any = {};
        try {
          result = rawText ? JSON.parse(rawText) : {};
        } catch {
          result = {};
        }

        return { ok: response.ok, status: response.status, data: result };
      } finally {
        clearTimeout(timeoutId);
      }
    };

    try {
      // V8 requires instance existence + a started connection before QR appears
      await ensureInstanceExists(instanceId, backendUrl, token);

      try {
        await startConnect();
      } catch {
        // ignore; we'll still try to read QR (some backends auto-connect)
      }

      await sleep(1200);

      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await getQr();
        const result = res.data || {};

        if (res.ok) {
          if (result.connected || result.status === 'connected') {
            return 'CONNECTED';
          }

          const rawQr = result.qrcode || result.qr || result.base64;
          if (typeof rawQr === 'string' && rawQr.length > 0) {
            return await normalizeQrToDataUrl(rawQr);
          }
        } else {
          // If legacy backend, a 404 here means it doesn't expose /qrcode
          if (res.status === 404 && backendFlavorRef.current === 'legacy') {
            throw new Error('Endpoint /qrcode não encontrado no backend.');
          }

          // 404 here is almost always "instance not created yet" in V8; create + reconnect once.
          if (res.status === 404 && attempt === 0 && backendFlavorRef.current !== 'legacy') {
            await ensureInstanceExists(instanceId, backendUrl, token);
            try {
              await startConnect();
            } catch {
              // ignore
            }
            await sleep(1200);
            continue;
          }

          if (res.status === 404) {
            // Try to auto-detect legacy backend and retry once
            backendFlavorRef.current = 'legacy';
            try {
              await startConnect();
              await sleep(900);
              const legacyTry = await getQr();
              if (legacyTry.ok) {
                const rawQr = legacyTry.data?.qrcode || legacyTry.data?.qr || legacyTry.data?.base64;
                if (typeof rawQr === 'string' && rawQr.length > 0) {
                  return await normalizeQrToDataUrl(rawQr);
                }
              }
            } catch {
              // ignore
            }

            throw new Error('Backend desatualizado: baixe o script novamente e reinicie o serviço.');
          }

          const msg =
            result?.error ||
            result?.message ||
            `Erro ao gerar QR Code (HTTP ${res.status || 'erro'})`;
          throw new Error(msg);
        }

        if (attempt < 2) await sleep(1500);
      }

      throw new Error('QR Code não disponível - aguarde ou tente novamente');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(message);
    }
  };

  type BackendHealthResult =
    | { ok: true }
    | { ok: false; reason: 'unauthorized' | 'unreachable' | 'error'; status?: number };

  // Pre-connection health check to prevent ghost connections
  const validateBackendHealth = async (backendUrl: string, token: string): Promise<BackendHealthResult> => {
    if (shouldUseProxy(backendUrl)) {
      try {
        const res = await proxyRequest('/health', 'GET');
        if (res.ok) return { ok: true };
        if (res.status === 401 || res.status === 403) {
          return { ok: false, reason: 'unauthorized', status: res.status };
        }
        return { ok: false, reason: 'error', status: res.status };
      } catch {
        return { ok: false, reason: 'unreachable' };
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: {
          // v4 local backend protects /health with the same Bearer token
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (response.ok) {
        // Accept common formats: {status:'ok'} or {success:true}
        const data = await response.json().catch(() => ({} as any));
        if (data?.status === 'ok' || data?.success === true) return { ok: true };
        return { ok: true }; // if it responded 200, it's alive
      }

      if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: 'unauthorized', status: response.status };
      }

      return { ok: false, reason: 'error', status: response.status };
    } catch {
      return { ok: false, reason: 'unreachable' };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const startConnection = useCallback(async (
    instanceId: string,
    backendUrl: string,
    token: string,
    phoneHint?: string,
    onConnected?: () => void
  ) => {
    stopPolling();
    
    setConnectionState({
      isConnecting: true,
      isPolling: false,
      qrCode: null,
      error: null,
      attempts: 0,
    });

    try {
      // ANTI-GHOST: Validate backend is actually running before attempting connection
      const health = await validateBackendHealth(backendUrl, token);

      if (health.ok === false) {
        if (health.reason === 'unauthorized') {
          throw new Error('Token do Backend inválido. Verifique o token e reinicie o backend local.');
        }
        throw new Error('Backend não está respondendo. Verifique se o CMD está rodando com o script.');
      }

      // First check if already connected
      const initialStatus = await checkStatus(instanceId, backendUrl, token);
      
      if (initialStatus.connected) {
        await updateInstanceStatus(instanceId, 'connected', initialStatus.phoneNumber);
        toast.success('WhatsApp já está conectado!');
        setConnectionState(prev => ({ ...prev, isConnecting: false }));
        onConnected?.();
        return;
      }

      // Ensure V8 instance exists in the backend before requesting QR
      await ensureInstanceExists(instanceId, backendUrl, token);

      // Update status to pending
      await updateInstanceStatus(instanceId, 'qr_pending');

      // Generate QR Code
      const qrResult = await generateQRCode(instanceId, backendUrl, token, phoneHint);
      
      if (qrResult === 'CONNECTED') {
        await updateInstanceStatus(instanceId, 'connected');
        toast.success('WhatsApp conectado!');
        setConnectionState(prev => ({ ...prev, isConnecting: false }));
        onConnected?.();
        return;
      }

      if (!qrResult) {
        throw new Error('Não foi possível gerar o QR Code');
      }

      // Show QR and start polling
      lastQrRefreshAtRef.current = Date.now();
      setConnectionState({
        isConnecting: false,
        isPolling: true,
        qrCode: qrResult,
        error: null,
        attempts: 0,
      });

      // Start polling for connection status
      let attempts = 0;

      pollingRef.current = setInterval(async () => {
        // Avoid overlapping network calls (helps prevent AbortError spam)
        if (statusInFlightRef.current) return;
        statusInFlightRef.current = true;

        try {
          attempts++;
          setConnectionState((prev) => ({ ...prev, attempts }));

          if (attempts >= maxPollingAttempts) {
            stopPolling();
            setConnectionState((prev) => ({
              ...prev,
              error: 'Tempo limite excedido. Tente novamente.',
              isPolling: false,
            }));
            await updateInstanceStatus(instanceId, 'disconnected');
            toast.error('Tempo limite para conexão excedido');
            return;
          }

          // Auto-refresh QR (bem menos agressivo) para evitar expiração
          if (Date.now() - lastQrRefreshAtRef.current > qrAutoRefreshMs) {
            try {
              const nextQr = await generateQRCode(instanceId, backendUrl, token, phoneHint);
              if (nextQr && nextQr !== 'CONNECTED') {
                lastQrRefreshAtRef.current = Date.now();
                setConnectionState((prev) => ({ ...prev, qrCode: nextQr }));
              }
            } catch {
              // ignore refresh failures; polling continues
            }
          }

          // Se ficar preso em QR_PENDING por muito tempo, NÃO faz reset via /disconnect.
          // O /disconnect pode apagar a sessão no backend e forçar novo QR, causando "perda de sessão".
          // Aqui a correção é apenas renovar o QR (sem destruir sessão).
          if (attempts === 35) {
            try {
              const freshQr = await generateQRCode(instanceId, backendUrl, token, phoneHint);
              if (freshQr && freshQr !== 'CONNECTED') {
                lastQrRefreshAtRef.current = Date.now();
                setConnectionState((prev) => ({ ...prev, qrCode: freshQr }));
              }
              toast.message('Conexão travada — gerando novo QR automaticamente.');
            } catch {
              // se falhar, segue o fluxo normal
            }
          }

          const statusResult = await checkStatus(instanceId, backendUrl, token);

          if (statusResult.connected) {
            stopPolling();
            await updateInstanceStatus(instanceId, 'connected', statusResult.phoneNumber);
            setConnectionState({
              isConnecting: false,
              isPolling: false,
              qrCode: null,
              error: null,
              attempts: 0,
            });
            toast.success('WhatsApp conectado com sucesso!');
            onConnected?.();
          }
        } finally {
          statusInFlightRef.current = false;
        }
      }, pollingInterval);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao conectar';
      console.error('Connection error:', error);
      
      setConnectionState({
        isConnecting: false,
        isPolling: false,
        qrCode: null,
        error: message,
        attempts: 0,
      });
      
      await updateInstanceStatus(instanceId, 'disconnected');
      toast.error(message);
    }
  }, [stopPolling]);

  const refreshQRCode = useCallback(async (
    instanceId: string,
    backendUrl: string,
    token: string,
    phoneHint?: string
  ) => {
    setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const qrResult = await generateQRCode(instanceId, backendUrl, token, phoneHint);
      
      if (qrResult === 'CONNECTED') {
        await updateInstanceStatus(instanceId, 'connected');
        toast.success('WhatsApp conectado!');
        setConnectionState(prev => ({ 
          ...prev, 
          isConnecting: false,
          qrCode: null,
        }));
        return true;
      }

      if (qrResult) {
        setConnectionState(prev => ({
          ...prev,
          isConnecting: false,
          qrCode: qrResult,
          attempts: 0,
        }));
        return true;
      }

      throw new Error('Não foi possível atualizar o QR Code');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar QR';
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: message,
      }));
      toast.error(message);
      return false;
    }
  }, []);

  const disconnect = useCallback(async (
    instanceId: string,
    backendUrl: string,
    token: string
  ) => {
    try {
      const isLegacy = backendFlavorRef.current === 'legacy';
      const path = isLegacy ? '/disconnect' : `/api/instance/${instanceId}/disconnect`;

      if (shouldUseProxy(backendUrl)) {
        const res = await proxyRequest(path, 'POST', {});
        if (!res.ok) throw new Error(`HTTP ${res.status || 'erro'}`);
      } else {
        await fetch(`${backendUrl}${path}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      await updateInstanceStatus(instanceId, 'disconnected');
      toast.success('Desconectado');
      return true;
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Erro ao desconectar');
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    connectionState,
    startConnection,
    refreshQRCode,
    disconnect,
    stopPolling,
    checkStatus,
  };
}
