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

  while (attempt < opts.maxRetries) {
    try {
      console.log(`[sendWithRetry] Tentativa ${attempt + 1}/${opts.maxRetries} para ${phone}`);

      const { data, error } = await supabase.functions.invoke('whatsapp-backend-proxy', {
        body: {
          path: `/api/instance/${instanceId}/send`,
          method: 'POST',
          body: { phone, message },
        },
      });

      // Erro de invocação do Supabase
      if (error) {
        lastError = error.message;
        if (!isRetryableError(lastError)) {
          return { success: false, error: lastError, attempts: attempt + 1 };
        }
        throw new Error(lastError);
      }

      const response = data as ProxyResponse;

      // Resposta OK do proxy
      if (response?.ok) {
        const resultData = response.data as { success?: boolean; error?: string };
        if (resultData?.success !== false) {
          return { success: true, data: resultData, attempts: attempt + 1 };
        }
        // Backend retornou success: false
        lastError = resultData?.error || 'Erro no envio';
        if (!isRetryableError(lastError)) {
          return { success: false, error: lastError, attempts: attempt + 1 };
        }
        throw new Error(lastError);
      }

      // Proxy retornou ok: false
      lastError = response?.error || 'Erro de conexão com VPS';
      if (!isRetryableError(lastError)) {
        return { success: false, error: lastError, attempts: attempt + 1 };
      }
      throw new Error(lastError);

    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      
      // Última tentativa - não fazer delay
      if (attempt >= opts.maxRetries - 1) {
        break;
      }

      // Calcular delay e notificar
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
