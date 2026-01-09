import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LoginAttemptResult {
  canAttempt: boolean;
  remainingAttempts: number;
  lockoutMinutes: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export function useLoginAttempts() {
  const [isChecking, setIsChecking] = useState(false);

  const checkCanAttempt = useCallback(async (email: string): Promise<LoginAttemptResult> => {
    try {
      setIsChecking(true);
      
      const { data, error } = await supabase.rpc('check_login_attempts', {
        p_email: email
      });

      if (error) {
        console.error('Error checking login attempts:', error);
        // On error, allow attempt (fail open)
        return { canAttempt: true, remainingAttempts: MAX_ATTEMPTS, lockoutMinutes: 0 };
      }

      const canAttempt = data === true;
      
      return {
        canAttempt,
        remainingAttempts: canAttempt ? MAX_ATTEMPTS : 0,
        lockoutMinutes: canAttempt ? 0 : LOCKOUT_MINUTES
      };
    } catch (err) {
      console.error('Error in checkCanAttempt:', err);
      return { canAttempt: true, remainingAttempts: MAX_ATTEMPTS, lockoutMinutes: 0 };
    } finally {
      setIsChecking(false);
    }
  }, []);

  const recordAttempt = useCallback(async (
    email: string,
    success: boolean
  ): Promise<void> => {
    try {
      await supabase.rpc('record_login_attempt', {
        p_email: email,
        p_success: success,
        p_ip_address: null,
        p_user_agent: navigator.userAgent.slice(0, 255)
      });
    } catch (err) {
      console.error('Error recording login attempt:', err);
    }
  }, []);

  return {
    checkCanAttempt,
    recordAttempt,
    isChecking,
    maxAttempts: MAX_ATTEMPTS,
    lockoutMinutes: LOCKOUT_MINUTES
  };
}
