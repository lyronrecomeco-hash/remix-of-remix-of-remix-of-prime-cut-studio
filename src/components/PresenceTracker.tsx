import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PRESENCE_UPDATE_INTERVAL = 30000; // 30 segundos
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos

/**
 * Componente invisível que rastreia a presença do usuário
 * Deve ser montado quando o usuário está autenticado
 */
export function PresenceTracker() {
  const { user } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<string | null>(null);

  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user) return;
    
    try {
      const currentPage = window.location.pathname;
      const deviceInfo = `${navigator.userAgent.slice(0, 100)}`;

      // Upsert presença
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: isOnline,
          last_seen_at: new Date().toISOString(),
          last_login_at: isOnline && !sessionStartRef.current 
            ? new Date().toISOString() 
            : undefined,
          current_page: currentPage,
          device_info: deviceInfo,
          session_started_at: sessionStartRef.current || new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('[PresenceTracker] Error updating presence:', error);
      }

      // Marcar início da sessão
      if (!sessionStartRef.current && isOnline) {
        sessionStartRef.current = new Date().toISOString();
      }
    } catch (err) {
      console.error('[PresenceTracker] Exception:', err);
    }
  }, [user]);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const checkInactivity = useCallback(() => {
    const timeSinceActivity = Date.now() - lastActivityRef.current;
    const isActive = timeSinceActivity < INACTIVITY_TIMEOUT;
    return isActive;
  }, []);

  useEffect(() => {
    if (!user) return;

    // Registrar presença inicial
    updatePresence(true);

    // Atualizar presença periodicamente
    intervalRef.current = setInterval(() => {
      const isActive = checkInactivity();
      updatePresence(isActive);
    }, PRESENCE_UPDATE_INTERVAL);

    // Detectar atividade do usuário
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Marcar como offline ao sair
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Detectar visibilidade da página
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        updatePresence(true);
        lastActivityRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Marcar como offline ao desmontar
      updatePresence(false);
    };
  }, [user, updatePresence, handleActivity, checkInactivity]);

  // Componente invisível
  return null;
}

export default PresenceTracker;
