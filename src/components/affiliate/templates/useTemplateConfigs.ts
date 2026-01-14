import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AffiliateTemplateConfig, TemplateConfig, DEFAULT_CONFIG } from './types';

export function useTemplateConfigs(affiliateId: string) {
  const [configs, setConfigs] = useState<AffiliateTemplateConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = useCallback(async () => {
    if (!affiliateId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliate_template_configs')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        config: item.config as unknown as TemplateConfig
      })) as AffiliateTemplateConfig[];
      
      setConfigs(transformedData);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar portfólios');
    } finally {
      setLoading(false);
    }
  }, [affiliateId]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const generateUniqueCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createConfig = async (
    templateSlug: string,
    templateName: string,
    clientName: string,
    config: TemplateConfig
  ): Promise<AffiliateTemplateConfig | null> => {
    if (!affiliateId) return null;

    try {
      setSaving(true);
      const uniqueCode = generateUniqueCode();

      const insertData = {
        affiliate_id: affiliateId,
        template_slug: templateSlug,
        template_name: templateName,
        unique_code: uniqueCode,
        client_name: clientName,
        config: JSON.parse(JSON.stringify(config)),
      };

      const { data, error } = await supabase
        .from('affiliate_template_configs')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newConfig = {
        ...data,
        config: data.config as unknown as TemplateConfig
      } as AffiliateTemplateConfig;

      setConfigs(prev => [newConfig, ...prev]);
      toast.success('Portfólio criado com sucesso!');
      return newConfig;
    } catch (error) {
      console.error('Erro ao criar configuração:', error);
      toast.error('Erro ao criar portfólio');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = async (
    id: string,
    updates: Partial<{
      client_name: string;
      config: TemplateConfig;
      is_active: boolean;
    }>
  ): Promise<boolean> => {
    try {
      setSaving(true);
      
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.config) {
        updateData.config = updates.config as unknown as Record<string, unknown>;
      }

      const { error } = await supabase
        .from('affiliate_template_configs')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setConfigs(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, ...updates }
            : c
        )
      );

      toast.success('Portfólio atualizado!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar portfólio');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteConfig = async (id: string): Promise<boolean> => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('affiliate_template_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConfigs(prev => prev.filter(c => c.id !== id));
      toast.success('Portfólio excluído!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir portfólio');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    configs,
    loading,
    saving,
    fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    generateUniqueCode,
  };
}
