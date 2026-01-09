import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const { 
    timeoutMinutes = 30, 
    warningMinutes = 5,
    onTimeout 
  } = options;
  
  const { user, signOut } = useAuth();
  const { notify } = useNotification();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
  }, []);

  const handleTimeout = useCallback(async () => {
    if (onTimeout) {
      onTimeout();
    } else {
      notify.warning('Sessão expirada', 'Você foi desconectado por inatividade.');
      await signOut();
    }
  }, [onTimeout, signOut, notify]);

  const checkActivity = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    const inactiveMinutes = (now - lastActivityRef.current) / (1000 * 60);
    
    // Check if should show warning
    if (inactiveMinutes >= (timeoutMinutes - warningMinutes) && !warningShownRef.current) {
      warningShownRef.current = true;
      notify.warning(
        'Sessão expirando', 
        `Sua sessão expirará em ${warningMinutes} minutos de inatividade.`
      );
    }
    
    // Check if should timeout
    if (inactiveMinutes >= timeoutMinutes) {
      handleTimeout();
    }
  }, [user, timeoutMinutes, warningMinutes, notify, handleTimeout]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    const handleActivity = () => {
      resetActivity();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check activity every minute
    checkIntervalRef.current = setInterval(checkActivity, 60000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, checkActivity, resetActivity]);

  // Update session in database periodically
  useEffect(() => {
    if (!user) return;

    const updateSession = async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        await supabase.rpc('update_session_activity', {
          p_session_token: sessionToken
        });
      }
    };

    // Update every 5 minutes
    const interval = setInterval(updateSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return {
    resetActivity,
    lastActivity: lastActivityRef.current
  };
}
