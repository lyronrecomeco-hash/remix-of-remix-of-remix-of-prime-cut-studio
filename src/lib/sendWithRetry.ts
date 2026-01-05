/**
 * PACK ENTERPRISE: Sistema de Envio com Retry Infinito e Backoff Exponencial
 * Garante resiliência máxima em falhas de rede e timeouts
 */

import { supabase } from '@/integrations/supabase/client';

export interface SendOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: string, nextDelayMs: number) => void;
}

interface ProxyResponse {
  ok: boolean;
  status: number;
  data: unknown;
  error?: string;
}

const defaultOptions: Required<Omit<SendOptions, 'onRetry'>> = {
  maxRetries: 10, // Alto número de tentativas
  baseDelay: 1000,
  maxDelay: 30000,
};

/**
 * Verifica se o erro é recuperável (deve tentar novamente)
 */
const isRetryableError = (error: string): boolean => {
  const lower = error.toLowerCase();
  // Não fazer retry em erros de autenticação/autorização
  if (lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('token inválido')) {
    return false;
  }
  // Não fazer retry se backend não está configurado
  if (lower.includes('não configurado')) {
    return false;
  }
  // Retry em erros de rede, timeout, conexão
  return true;
};

/**
 * Calcula delay com exponential backoff + jitter
 */
const calculateDelay = (attempt: number, baseDelay: number, maxDelay: number): number => {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Envia mensagem via proxy com retry automático e backoff exponencial
 * + Detecção e fallback automático de endpoint (V8 vs Legacy)
 */
export async function sendMessageWithRetry(
  instanceId: string,
  phone: string,
  message: string,
  options: SendOptions = {}
): Promise<{ success: boolean; data?: unknown; error?: string; attempts: number }> {
  const opts = { ...defaultOptions, ...options };
  let lastError = 'Erro desconhecido';
  let attempt = 0;

  const payload = {
    phone,
    message,
    // compat
    to: phone,
    text: message,
    number: phone,
    instanceId,
  };

  const invoke = async (path: string): Promise<ProxyResponse> => {
    const { data, error } = await supabase.functions.invoke('whatsapp-backend-proxy', {
      body: {
        path,
        method: 'POST',
        body: payload,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as ProxyResponse;
  };

  const looksLikeMissingRoute = (res: ProxyResponse, prefix: string) => {
    if (res?.status !== 404) return false;
    if (typeof res?.data !== 'string') return false;
    return res.data.includes(`Cannot POST ${prefix}`) || res.data.includes(`Cannot GET ${prefix}`);
  };

  while (attempt < opts.maxRetries) {
    try {
      console.log(`[sendWithRetry] Tentativa ${attempt + 1}/${opts.maxRetries} para ${phone}`);

      // 1) Tentar endpoints V8 multi-instância (rota pode variar entre versões)
      const v8Paths = [
        `/api/instance/${instanceId}/send`,
        `/api/instance/${instanceId}/send-message`,
        `/api/instance/${instanceId}/sendText`,
        `/api/instance/${instanceId}/send-text`,
      ];

      const handleOk = (res: ProxyResponse) => {
        const resultData = res.data as { success?: boolean; error?: string };
        if (resultData?.success !== false) {
          return { success: true as const, data: resultData };
        }
        return { success: false as const, error: resultData?.error || 'Erro no envio' };
      };

      let v8HadAnyNon404 = false;
      let v8Last: ProxyResponse | null = null;

      for (const p of v8Paths) {
        const res = await invoke(p);
        v8Last = res;

        if (res?.ok) {
          const handled = handleOk(res);
          if (handled.success) {
            return { success: true, data: handled.data, attempts: attempt + 1 };
          }
          lastError = handled.error!;
          if (!isRetryableError(lastError)) {
            return { success: false, error: lastError, attempts: attempt + 1 };
          }
          throw new Error(lastError);
        }

        // 404 "Cannot POST ..." => endpoint não existe nessa versão; tenta o próximo
        if (looksLikeMissingRoute(res, p)) {
          continue;
        }

        // Erro que não é de rota ausente (conexão/500/403/etc.)
        v8HadAnyNon404 = true;
        lastError = res?.error || 'Erro de conexão com VPS';
        if (!isRetryableError(lastError)) {
          return { success: false, error: lastError, attempts: attempt + 1 };
        }
        throw new Error(lastError);
      }

      // Se tivemos erro real no V8 (não 404), não tentar legacy nesta tentativa
      if (v8HadAnyNon404) {
        lastError = v8Last?.error || 'Erro de conexão com VPS';
        if (!isRetryableError(lastError)) {
          return { success: false, error: lastError, attempts: attempt + 1 };
        }
        throw new Error(lastError);
      }

      // 2) Fallback legacy (single-instance / rotas simplificadas)
      const legacyPaths = ['/api/send', '/send'];
      let lastLegacy: ProxyResponse | null = null;

      for (const p of legacyPaths) {
        const legacy = await invoke(p);
        lastLegacy = legacy;

        if (legacy?.ok) {
          const handled = handleOk(legacy);
          if (handled.success) {
            return { success: true, data: handled.data, attempts: attempt + 1 };
          }
          lastError = handled.error!;
          if (!isRetryableError(lastError)) {
            return { success: false, error: lastError, attempts: attempt + 1 };
          }
          throw new Error(lastError);
        }

        if (looksLikeMissingRoute(legacy, p)) {
          continue;
        }

        lastError = legacy?.error || 'Erro ao enviar (legacy)';
        if (!isRetryableError(lastError)) {
          return { success: false, error: lastError, attempts: attempt + 1 };
        }
        throw new Error(lastError);
      }

      lastError =
        (lastLegacy?.error as string) ||
        'Backend não possui endpoint de envio disponível (tentamos V8 e Legacy).';
      return { success: false, error: lastError, attempts: attempt + 1 };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);

      if (!isRetryableError(lastError)) {
        return { success: false, error: lastError, attempts: attempt + 1 };
      }

      // Última tentativa - não fazer delay
      if (attempt >= opts.maxRetries - 1) {
        break;
      }

      const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay);

      console.warn(
        `[sendWithRetry] Tentativa ${attempt + 1} falhou: ${lastError}. Retry em ${Math.round(delay)}ms`
      );

      if (opts.onRetry) {
        opts.onRetry(attempt + 1, lastError, delay);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }

  return { success: false, error: lastError, attempts: attempt + 1 };
}

/**
 * Chamada genérica ao proxy com retry
 */
export async function proxyCallWithRetry<T = unknown>(
  path: string,
  method: 'GET' | 'POST',
  body?: unknown,
  options: SendOptions = {}
): Promise<{ success: boolean; data?: T; error?: string; attempts: number }> {
  const opts = { ...defaultOptions, ...options };
  let lastError = 'Erro desconhecido';
  let attempt = 0;

  while (attempt < opts.maxRetries) {
    try {
      console.log(`[proxyCallWithRetry] Tentativa ${attempt + 1}/${opts.maxRetries} para ${path}`);

      const { data, error } = await supabase.functions.invoke('whatsapp-backend-proxy', {
        body: { path, method, body },
      });

      if (error) {
        lastError = error.message;
        if (!isRetryableError(lastError)) {
          return { success: false, error: lastError, attempts: attempt + 1 };
        }
        throw new Error(lastError);
      }

      const response = data as ProxyResponse;

      if (response?.ok) {
        return { success: true, data: response.data as T, attempts: attempt + 1 };
      }

      lastError = response?.error || 'Erro de conexão';
      if (!isRetryableError(lastError)) {
        return { success: false, error: lastError, attempts: attempt + 1 };
      }
      throw new Error(lastError);

    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      
      if (attempt >= opts.maxRetries - 1) {
        break;
      }

      const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay);
      
      console.warn(
        `[proxyCallWithRetry] Tentativa ${attempt + 1} falhou: ${lastError}. Retry em ${Math.round(delay)}ms`
      );

      if (opts.onRetry) {
        opts.onRetry(attempt + 1, lastError, delay);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }

  return { success: false, error: lastError, attempts: attempt + 1 };
}
