import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GeneratedSprint, SprintMissionFormData } from './types';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface SprintMission {
  id: string;
  sprint: GeneratedSprint;
  formData: SprintMissionFormData;
  createdAt: string;
  lastResetAt: string;
  isActive: boolean;
}

export interface ActionProgress {
  actionId: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  date: string;
}

export const useSprintMissions = (affiliateId: string | undefined) => {
  const [missions, setMissions] = useState<SprintMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all missions for the user
  const fetchMissions = useCallback(async () => {
    if (!affiliateId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('genesis_sprint_missions')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedMissions: SprintMission[] = (data || []).map((m) => ({
        id: m.id,
        sprint: m.mission_data as unknown as GeneratedSprint,
        formData: m.form_answers as unknown as SprintMissionFormData,
        createdAt: m.created_at,
        lastResetAt: m.last_reset_at,
        isActive: m.is_active,
      }));

      setMissions(formattedMissions);
    } catch (err) {
      console.error('Error fetching missions:', err);
      setError('Erro ao carregar missões');
    } finally {
      setLoading(false);
    }
  }, [affiliateId]);

  // Fetch progress for a specific mission (today only)
  const fetchProgress = useCallback(async (missionId: string): Promise<ActionProgress[]> => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('genesis_sprint_progress')
      .select('*')
      .eq('mission_id', missionId)
      .eq('date', today);

    if (error) {
      console.error('Error fetching progress:', error);
      return [];
    }

    return (data || []).map((p) => ({
      actionId: p.action_id,
      status: p.status as 'pending' | 'in_progress' | 'completed',
      completedAt: p.completed_at || undefined,
      date: p.date,
    }));
  }, []);

  // Create a new mission
  const createMission = useCallback(async (
    sprint: GeneratedSprint,
    formData: SprintMissionFormData
  ): Promise<SprintMission | null> => {
    if (!affiliateId) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const insertData: {
        affiliate_id: string;
        mission_data: Json;
        form_answers: Json;
        is_active: boolean;
      } = {
        affiliate_id: affiliateId,
        mission_data: sprint as unknown as Json,
        form_answers: formData as unknown as Json,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('genesis_sprint_missions')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      const newMission: SprintMission = {
        id: data.id,
        sprint: data.mission_data as unknown as GeneratedSprint,
        formData: data.form_answers as unknown as SprintMissionFormData,
        createdAt: data.created_at,
        lastResetAt: data.last_reset_at,
        isActive: data.is_active,
      };

      setMissions((prev) => [newMission, ...prev]);
      toast.success('Meta salva com sucesso!');
      return newMission;
    } catch (err) {
      console.error('Error creating mission:', err);
      toast.error('Erro ao salvar meta');
      return null;
    }
  }, [affiliateId]);

  // Delete a mission
  const deleteMission = useCallback(async (missionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('genesis_sprint_missions')
        .delete()
        .eq('id', missionId);

      if (error) throw error;

      setMissions((prev) => prev.filter((m) => m.id !== missionId));
      toast.success('Meta removida');
      return true;
    } catch (err) {
      console.error('Error deleting mission:', err);
      toast.error('Erro ao remover meta');
      return false;
    }
  }, []);

  // Update action progress
  const updateActionProgress = useCallback(async (
    missionId: string,
    actionId: string,
    status: 'pending' | 'in_progress' | 'completed'
  ): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('genesis_sprint_progress')
        .upsert({
          mission_id: missionId,
          action_id: actionId,
          status,
          date: today,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        }, {
          onConflict: 'mission_id,action_id,date',
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Erro ao atualizar progresso');
      return false;
    }
  }, []);

  // Get progress count for a mission (today)
  const getProgressCount = useCallback(async (missionId: string): Promise<number> => {
    const progress = await fetchProgress(missionId);
    return progress.filter((p) => p.status === 'completed').length;
  }, [fetchProgress]);

  // Initial load
  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return {
    missions,
    loading,
    error,
    fetchMissions,
    fetchProgress,
    createMission,
    deleteMission,
    updateActionProgress,
    getProgressCount,
  };
};
