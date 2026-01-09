import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BackupResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export function useBackup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBackup = useCallback(async (): Promise<BackupResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await supabase.functions.invoke('database-backup', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar backup');
      }

      const backup = response.data;
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido ao criar backup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restoreBackup = useCallback(async (file: File): Promise<BackupResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const backup = JSON.parse(content);

      if (!backup.version || !backup.tables) {
        throw new Error('Formato de backup inválido');
      }

      // For now, just validate the backup
      // Full restore would need additional edge function
      console.log('Backup validated:', {
        version: backup.version,
        createdAt: backup.createdAt,
        tables: Object.keys(backup.tables),
        totalRecords: backup.metadata?.totalRecords,
      });

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao restaurar backup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createBackup,
    restoreBackup,
    isLoading,
    error,
  };
}
