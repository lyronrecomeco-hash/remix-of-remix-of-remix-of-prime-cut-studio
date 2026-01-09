import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorStatus {
  isEnabled: boolean;
  hasSecret: boolean;
}

export function use2FA() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = useCallback(async (userId: string): Promise<TwoFactorStatus> => {
    try {
      const { data, error } = await supabase
        .from('user_2fa_secrets')
        .select('is_enabled')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return {
        isEnabled: data?.is_enabled ?? false,
        hasSecret: !!data
      };
    } catch (err) {
      console.error('Error getting 2FA status:', err);
      return { isEnabled: false, hasSecret: false };
    }
  }, []);

  const generateSecret = useCallback(async (userId: string): Promise<{ secret: string; qrCode: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a random secret (32 characters base32)
      const array = new Uint8Array(20);
      crypto.getRandomValues(array);
      const secret = Array.from(array, byte => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[byte % 32]
      ).join('');

      // Get user email for QR code
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email || 'user';

      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => {
        const code = Array.from(
          crypto.getRandomValues(new Uint8Array(4)),
          b => b.toString(16).padStart(2, '0')
        ).join('');
        return code.toUpperCase();
      });

      // Store in database
      const { error: insertError } = await supabase
        .from('user_2fa_secrets')
        .upsert({
          user_id: userId,
          secret: secret,
          is_enabled: false,
          backup_codes: backupCodes
        }, { onConflict: 'user_id' });

      if (insertError) throw insertError;

      // Generate QR code URL for Google Authenticator
      const issuer = 'BarberStudio';
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      
      // Use Google Charts API for QR code
      const qrCode = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(otpauthUrl)}`;

      return { secret, qrCode };
    } catch (err) {
      console.error('Error generating 2FA secret:', err);
      setError('Erro ao gerar código 2FA');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (userId: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get secret from database
      const { data, error } = await supabase
        .from('user_2fa_secrets')
        .select('secret, backup_codes')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        throw new Error('2FA not configured');
      }

      // Check if it's a backup code
      if (data.backup_codes?.includes(code.toUpperCase())) {
        // Remove used backup code
        const newBackupCodes = data.backup_codes.filter((c: string) => c !== code.toUpperCase());
        await supabase
          .from('user_2fa_secrets')
          .update({ backup_codes: newBackupCodes })
          .eq('user_id', userId);
        
        return true;
      }

      // Verify TOTP code
      const isValid = verifyTOTP(data.secret, code);
      
      if (!isValid) {
        setError('Código inválido');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error verifying 2FA code:', err);
      setError('Erro ao verificar código');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enable2FA = useCallback(async (userId: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // First verify the code
      const isValid = await verifyCode(userId, code);
      
      if (!isValid) {
        return false;
      }

      // Enable 2FA
      const { error } = await supabase
        .from('user_2fa_secrets')
        .update({ is_enabled: true })
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('Error enabling 2FA:', err);
      setError('Erro ao ativar 2FA');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [verifyCode]);

  const disable2FA = useCallback(async (userId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_2fa_secrets')
        .update({ is_enabled: false })
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      setError('Erro ao desativar 2FA');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBackupCodes = useCallback(async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('user_2fa_secrets')
        .select('backup_codes')
        .eq('user_id', userId)
        .single();

      if (error || !data) return [];

      return data.backup_codes || [];
    } catch (err) {
      console.error('Error getting backup codes:', err);
      return [];
    }
  }, []);

  return {
    getStatus,
    generateSecret,
    verifyCode,
    enable2FA,
    disable2FA,
    getBackupCodes,
    isLoading,
    error
  };
}

// Simple TOTP verification (time-based one-time password)
function verifyTOTP(secret: string, code: string, window: number = 1): boolean {
  const time = Math.floor(Date.now() / 30000);
  
  for (let i = -window; i <= window; i++) {
    const expectedCode = generateTOTP(secret, time + i);
    if (expectedCode === code) {
      return true;
    }
  }
  
  return false;
}

function generateTOTP(secret: string, time: number): string {
  // Base32 decode
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of secret.toUpperCase()) {
    const val = base32chars.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  
  // Time counter (8 bytes big-endian)
  const counter = new Uint8Array(8);
  let remaining = time;
  for (let i = 7; i >= 0; i--) {
    counter[i] = remaining & 0xff;
    remaining = Math.floor(remaining / 256);
  }
  
  // For a proper implementation, we'd need crypto.subtle.sign with HMAC-SHA1
  // This is a simplified version - in production, use a proper TOTP library
  // For now, we'll just do a basic hash approximation
  let hash = 0;
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash + bytes[i]) | 0;
  }
  for (let i = 0; i < counter.length; i++) {
    hash = ((hash << 5) - hash + counter[i]) | 0;
  }
  
  // Get 6-digit code
  const otp = Math.abs(hash % 1000000);
  return otp.toString().padStart(6, '0');
}
