/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FASE 1-7: HOOK DE STATUS UNIFICADO
 * 
 * Este hook é a ÚNICA fonte de verdade para status de instâncias.
 * - FASE 1: orchestrated_status como autoridade absoluta
 * - FASE 2: is_usable baseado em heartbeat
 * - FASE 3: Bloqueio de auto-reconexão
 * - FASE 4: Heartbeat como juiz supremo
 * - FASE 5: Debounce visual
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES IMUTÁVEIS
// ═══════════════════════════════════════════════════════════════════════════════
export const STATUS_CONSTANTS = {
  // FASE 4: Limites de heartbeat (VPS é juiz supremo)
  HEARTBEAT_STALE_MS: 180000, // 3 minutos - heartbeat considerado stale
  HEARTBEAT_DEAD_MS: 300000, // 5 minutos - instância considerada morta
  
  // FASE 3: Limites de reconexão
  MAX_RECONNECT_ATTEMPTS: 3,
  RECONNECT_COOLDOWN_MS: 120000, // 2 minutos
  
  // FASE 5: Debounce visual
  STATUS_DEBOUNCE_MS: 1500, // Não piscar status por menos de 1.5s
  
  // Polling
  POLL_INTERVAL_MS: 5000,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════
export type OrchestratedStatus = 
  | 'idle' 
  | 'connecting' 
  | 'qr_pending' 
  | 'stabilizing' 
  | 'connected' 
  | 'disconnected' 
  | 'error'
  | 'cooldown';

export interface UnifiedInstanceStatus {
  // FASE 1: Status orquestrado (ÚNICA fonte de verdade)
  orchestratedStatus: OrchestratedStatus;
  
  // FASE 2: Flag de usabilidade (conexão real + heartbeat saudável)
  isUsable: boolean;
  
  // FASE 4: Dados de heartbeat
  lastHeartbeat: Date | null;
  isHeartbeatStale: boolean;
  isHeartbeatDead: boolean;
  
  // Dados adicionais
  phoneNumber: string | null;
  
  // FASE 3: Estado de cooldown
  isInCooldown: boolean;
  cooldownEndsAt: Date | null;
  reconnectAttempts: number;
}

interface InstanceData {
  id: string;
  orchestrated_status?: string;
  effective_status?: string;
  status?: string;
  last_heartbeat?: string;
  phone_number?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PURAS (SEM SIDE EFFECTS)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * FASE 1: Normaliza status para o schema unificado
 * orchestrated_status é a ÚNICA fonte de verdade
 */
export function normalizeStatus(rawStatus: string | null | undefined): OrchestratedStatus {
  if (!rawStatus) return 'idle';
  
  const statusMap: Record<string, OrchestratedStatus> = {
    'idle': 'idle',
    'connecting': 'connecting',
    'qr_pending': 'qr_pending',
    'stabilizing': 'stabilizing',
    'connected': 'connected',
    'disconnected': 'disconnected',
    'error': 'error',
    'cooldown': 'cooldown',
    // Mapeamentos legados
    'waiting': 'qr_pending',
    'ready': 'connected',
    'offline': 'disconnected',
    'failed': 'error',
  };
  
  return statusMap[rawStatus.toLowerCase()] || 'idle';
}

/**
 * FASE 4: Calcula estado do heartbeat
 * VPS é o juiz supremo - se não há heartbeat recente, não há conexão real
 */
export function calculateHeartbeatState(lastHeartbeat: string | null | undefined): {
  lastHeartbeatDate: Date | null;
  isStale: boolean;
  isDead: boolean;
} {
  if (!lastHeartbeat) {
    return { lastHeartbeatDate: null, isStale: true, isDead: true };
  }
  
  const heartbeatDate = new Date(lastHeartbeat);
  const now = Date.now();
  const age = now - heartbeatDate.getTime();
  
  return {
    lastHeartbeatDate: heartbeatDate,
    isStale: age > STATUS_CONSTANTS.HEARTBEAT_STALE_MS,
    isDead: age > STATUS_CONSTANTS.HEARTBEAT_DEAD_MS,
  };
}

/**
 * FASE 2: Calcula se a instância é utilizável
 * is_usable = orchestrated_status == 'connected' AND heartbeat < limite
 */
export function calculateIsUsable(
  orchestratedStatus: OrchestratedStatus,
  heartbeatState: { isStale: boolean; isDead: boolean }
): boolean {
  // Só é utilizável se:
  // 1. Status orquestrado é "connected"
  // 2. Heartbeat não está morto (pode estar stale, mas não morto)
  return orchestratedStatus === 'connected' && !heartbeatState.isDead;
}

/**
 * Calcula o status unificado de uma instância
 */
export function calculateUnifiedStatus(
  instance: InstanceData,
  cooldownState: { isInCooldown: boolean; cooldownEndsAt: Date | null; attempts: number }
): UnifiedInstanceStatus {
  // FASE 1: orchestrated_status é a única fonte de verdade
  const rawStatus = instance.orchestrated_status || instance.effective_status || instance.status;
  const orchestratedStatus = normalizeStatus(rawStatus);
  
  // FASE 4: Estado do heartbeat
  const heartbeatState = calculateHeartbeatState(instance.last_heartbeat);
  
  // FASE 2: Usabilidade
  const isUsable = calculateIsUsable(orchestratedStatus, heartbeatState);
  
  return {
    orchestratedStatus,
    isUsable,
    lastHeartbeat: heartbeatState.lastHeartbeatDate,
    isHeartbeatStale: heartbeatState.isStale,
    isHeartbeatDead: heartbeatState.isDead,
    phoneNumber: instance.phone_number || null,
    isInCooldown: cooldownState.isInCooldown,
    cooldownEndsAt: cooldownState.cooldownEndsAt,
    reconnectAttempts: cooldownState.attempts,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook para gerenciar status unificado de uma instância
 * Implementa TODAS as fases do sistema de estabilização
 */
export function useUnifiedInstanceStatus(instanceId: string | null) {
  // Estado principal
  const [status, setStatus] = useState<UnifiedInstanceStatus>({
    orchestratedStatus: 'idle',
    isUsable: false,
    lastHeartbeat: null,
    isHeartbeatStale: true,
    isHeartbeatDead: true,
    phoneNumber: null,
    isInCooldown: false,
    cooldownEndsAt: null,
    reconnectAttempts: 0,
  });
  
  // FASE 3: Controle de cooldown (persistente entre renders)
  const cooldownRef = useRef({
    attempts: 0,
    cooldownEndsAt: null as Date | null,
    lastAttemptAt: 0,
  });
  
  // FASE 5: Debounce de status
  const lastStatusRef = useRef<OrchestratedStatus>('idle');
  const statusChangeTimeRef = useRef(0);
  
  // Ref para controle de montagem
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  
  /**
   * FASE 3: Registra tentativa de reconexão
   * Retorna true se permitido, false se em cooldown
   */
  const registerReconnectAttempt = useCallback((): boolean => {
    const now = Date.now();
    const state = cooldownRef.current;
    
    // Verificar se ainda está em cooldown
    if (state.cooldownEndsAt && state.cooldownEndsAt.getTime() > now) {
      return false;
    }
    
    // Limpar cooldown expirado
    if (state.cooldownEndsAt && state.cooldownEndsAt.getTime() <= now) {
      state.attempts = 0;
      state.cooldownEndsAt = null;
    }
    
    // Incrementar tentativas
    state.attempts++;
    state.lastAttemptAt = now;
    
    // Verificar se excedeu limite
    if (state.attempts > STATUS_CONSTANTS.MAX_RECONNECT_ATTEMPTS) {
      state.cooldownEndsAt = new Date(now + STATUS_CONSTANTS.RECONNECT_COOLDOWN_MS);
      state.attempts = 0;
      
      // Atualizar estado
      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          isInCooldown: true,
          cooldownEndsAt: state.cooldownEndsAt,
          reconnectAttempts: 0,
        }));
      }
      
      return false;
    }
    
    // Atualizar estado
    if (mountedRef.current) {
      setStatus(prev => ({
        ...prev,
        reconnectAttempts: state.attempts,
      }));
    }
    
    return true;
  }, []);
  
  /**
   * FASE 3: Reset de cooldown (após conexão bem-sucedida)
   */
  const resetCooldown = useCallback(() => {
    cooldownRef.current = {
      attempts: 0,
      cooldownEndsAt: null,
      lastAttemptAt: 0,
    };
    
    if (mountedRef.current) {
      setStatus(prev => ({
        ...prev,
        isInCooldown: false,
        cooldownEndsAt: null,
        reconnectAttempts: 0,
      }));
    }
  }, []);
  
  /**
   * Atualiza status a partir de dados da instância
   * Aplica debounce visual (FASE 5)
   */
  const updateFromInstance = useCallback((instance: InstanceData) => {
    if (!mountedRef.current) return;
    
    const now = Date.now();
    const cooldownState = {
      isInCooldown: cooldownRef.current.cooldownEndsAt 
        ? cooldownRef.current.cooldownEndsAt.getTime() > now 
        : false,
      cooldownEndsAt: cooldownRef.current.cooldownEndsAt,
      attempts: cooldownRef.current.attempts,
    };
    
    const newStatus = calculateUnifiedStatus(instance, cooldownState);
    
    // FASE 5: Debounce - não mudar status muito rapidamente
    const timeSinceLastChange = now - statusChangeTimeRef.current;
    if (
      newStatus.orchestratedStatus !== lastStatusRef.current &&
      timeSinceLastChange < STATUS_CONSTANTS.STATUS_DEBOUNCE_MS
    ) {
      // Status mudou muito rápido, ignorar esta mudança
      // (será aplicada na próxima atualização após o debounce)
      return;
    }
    
    // Atualizar refs de debounce
    if (newStatus.orchestratedStatus !== lastStatusRef.current) {
      lastStatusRef.current = newStatus.orchestratedStatus;
      statusChangeTimeRef.current = now;
    }
    
    setStatus(newStatus);
  }, []);
  
  /**
   * Busca status atual do banco e atualiza
   */
  const fetchStatus = useCallback(async () => {
    if (!instanceId || !mountedRef.current) return;
    
    try {
      const { data, error } = await supabase
        .from('genesis_instances')
        .select('id, orchestrated_status, effective_status, status, last_heartbeat, phone_number')
        .eq('id', instanceId)
        .single();
      
      if (!error && data && mountedRef.current) {
        updateFromInstance(data);
      }
    } catch (err) {
      console.error('[useUnifiedInstanceStatus] Fetch error:', err);
    }
  }, [instanceId, updateFromInstance]);
  
  // Polling automático
  useEffect(() => {
    if (!instanceId) return;
    
    // Fetch inicial
    fetchStatus();
    
    // Polling
    const interval = setInterval(fetchStatus, STATUS_CONSTANTS.POLL_INTERVAL_MS);
    
    // Realtime subscription
    const channel = supabase
      .channel(`unified-status-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'genesis_instances',
          filter: `id=eq.${instanceId}`,
        },
        (payload) => {
          if (payload.new && mountedRef.current) {
            updateFromInstance(payload.new as InstanceData);
          }
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [instanceId, fetchStatus, updateFromInstance]);
  
  return {
    status,
    registerReconnectAttempt,
    resetCooldown,
    fetchStatus,
    updateFromInstance,
  };
}

/**
 * Hook para verificar cooldown global (sem polling)
 */
export function useCooldownCheck() {
  const cooldownRef = useRef({
    attempts: 0,
    cooldownEndsAt: null as Date | null,
  });
  
  const isInCooldown = useCallback((): boolean => {
    const now = Date.now();
    return cooldownRef.current.cooldownEndsAt 
      ? cooldownRef.current.cooldownEndsAt.getTime() > now 
      : false;
  }, []);
  
  const getRemainingCooldown = useCallback((): number => {
    const now = Date.now();
    if (!cooldownRef.current.cooldownEndsAt) return 0;
    const remaining = cooldownRef.current.cooldownEndsAt.getTime() - now;
    return Math.max(0, Math.ceil(remaining / 1000));
  }, []);
  
  const registerAttempt = useCallback((): boolean => {
    const now = Date.now();
    
    // Verificar cooldown ativo
    if (cooldownRef.current.cooldownEndsAt && 
        cooldownRef.current.cooldownEndsAt.getTime() > now) {
      return false;
    }
    
    // Limpar cooldown expirado
    if (cooldownRef.current.cooldownEndsAt &&
        cooldownRef.current.cooldownEndsAt.getTime() <= now) {
      cooldownRef.current.attempts = 0;
      cooldownRef.current.cooldownEndsAt = null;
    }
    
    cooldownRef.current.attempts++;
    
    if (cooldownRef.current.attempts > STATUS_CONSTANTS.MAX_RECONNECT_ATTEMPTS) {
      cooldownRef.current.cooldownEndsAt = new Date(now + STATUS_CONSTANTS.RECONNECT_COOLDOWN_MS);
      cooldownRef.current.attempts = 0;
      return false;
    }
    
    return true;
  }, []);
  
  const resetCooldown = useCallback(() => {
    cooldownRef.current = { attempts: 0, cooldownEndsAt: null };
  }, []);
  
  return {
    isInCooldown,
    getRemainingCooldown,
    registerAttempt,
    resetCooldown,
  };
}
