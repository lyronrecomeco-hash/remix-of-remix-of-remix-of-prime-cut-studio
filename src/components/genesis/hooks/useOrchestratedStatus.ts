import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * FASE 7: Hook para transições de status via orquestrador central
 * 
 * Substitui escritas diretas ao banco por chamadas ao orquestrador,
 * que valida transições e registra eventos imutáveis.
 */

interface TransitionResult {
  success: boolean;
  changed?: boolean;
  from?: string;
  to?: string;
  error?: string;
  event_id?: string;
}

interface HealthPingResult {
  success: boolean;
  health_status?: string;
  last_health_ping?: string;
  error?: string;
}

interface StatusResult {
  success: boolean;
  orchestrated_status?: string;
  status?: string;
  effective_status?: string;
  health_status?: string;
  last_health_ping?: string;
  error?: string;
}

export function useOrchestratedStatus() {
  /**
   * Solicita transição de status ao orquestrador central
   */
  const requestTransition = useCallback(async (
    instanceId: string,
    newStatus: string,
    source: string = 'frontend',
    payload: Record<string, unknown> = {}
  ): Promise<TransitionResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('genesis-connection-orchestrator', {
        body: {
          instanceId,
          action: 'transition',
          newStatus,
          source,
          payload,
        },
      });

      if (error) {
        console.error('[useOrchestratedStatus] Transition error:', error);
        return { success: false, error: error.message };
      }

      return data as TransitionResult;
    } catch (err) {
      console.error('[useOrchestratedStatus] Exception:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  /**
   * Envia ping de saúde ao orquestrador
   */
  const sendHealthPing = useCallback(async (
    instanceId: string,
    healthy: boolean
  ): Promise<HealthPingResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('genesis-connection-orchestrator', {
        body: {
          instanceId,
          action: 'health_ping',
          source: 'frontend',
          payload: { healthy },
        },
      });

      if (error) {
        console.error('[useOrchestratedStatus] Health ping error:', error);
        return { success: false, error: error.message };
      }

      return data as HealthPingResult;
    } catch (err) {
      console.error('[useOrchestratedStatus] Exception:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  /**
   * Obtém status atual do orquestrador
   */
  const getStatus = useCallback(async (instanceId: string): Promise<StatusResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('genesis-connection-orchestrator', {
        body: {
          instanceId,
          action: 'get_status',
        },
      });

      if (error) {
        console.error('[useOrchestratedStatus] Get status error:', error);
        return { success: false, error: error.message };
      }

      return data as StatusResult;
    } catch (err) {
      console.error('[useOrchestratedStatus] Exception:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  /**
   * Mapeia status legado para novo schema
   */
  const mapLegacyStatus = useCallback((legacyStatus: string): string => {
    const mapping: Record<string, string> = {
      'qr_pending': 'qr_pending',
      'connecting': 'connecting',
      'connected': 'connected',
      'disconnected': 'disconnected',
      'error': 'error',
      'paused': 'disconnected', // Pausado é tratado como desconectado na state machine
    };
    return mapping[legacyStatus] || 'idle';
  }, []);

  /**
   * Tenta transição, mas aceita falha silenciosamente se inválida
   * (para compatibilidade com código legado)
   */
  const tryTransition = useCallback(async (
    instanceId: string,
    newStatus: string,
    source: string = 'frontend',
    payload: Record<string, unknown> = {}
  ): Promise<boolean> => {
    const result = await requestTransition(instanceId, newStatus, source, payload);
    
    if (!result.success) {
      // Log mas não falha - permite que código legado continue funcionando
      console.warn(`[useOrchestratedStatus] Transition ${newStatus} not allowed:`, result.error);
    }
    
    return result.success;
  }, [requestTransition]);

  return {
    requestTransition,
    tryTransition,
    sendHealthPing,
    getStatus,
    mapLegacyStatus,
  };
}
