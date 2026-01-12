import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PresenceType } from '../types';

interface UsePresenceOptions {
  instanceId: string;
  phone: string;
  intervalMs?: number;
}

export const usePresence = ({ instanceId, phone, intervalMs = 3000 }: UsePresenceOptions) => {
  const [currentPresence, setCurrentPresence] = useState<PresenceType | null>(null);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendPresence = useCallback(async (presence: PresenceType) => {
    if (!instanceId || !phone) return { success: false, error: 'Missing instanceId or phone' };

    try {
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'send-presence',
          instanceId,
          phone: phone.replace(/\D/g, ''),
          presence
        }
      });

      if (error) throw error;
      return { success: data?.success, error: data?.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [instanceId, phone]);

  const startPresence = useCallback(async (presence: PresenceType) => {
    // Stop any existing presence
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Send initial presence
    await sendPresence(presence);
    setCurrentPresence(presence);
    setIsActive(true);

    // Keep sending every intervalMs to maintain presence
    intervalRef.current = setInterval(() => {
      sendPresence(presence);
    }, intervalMs);
  }, [sendPresence, intervalMs]);

  const stopPresence = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Send paused to stop the indicator
    await sendPresence('paused');
    setCurrentPresence(null);
    setIsActive(false);
  }, [sendPresence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    currentPresence,
    isActive,
    sendPresence,
    startPresence,
    stopPresence
  };
};
