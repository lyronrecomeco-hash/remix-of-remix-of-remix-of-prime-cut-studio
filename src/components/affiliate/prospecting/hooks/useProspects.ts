import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Prospect, ProspectStats, ProspectSettings } from '../types';

export function useProspects(affiliateId: string) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [settings, setSettings] = useState<ProspectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchProspects = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliate_prospects')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProspects((data || []) as unknown as Prospect[]);
    } catch (error) {
      console.error('Erro ao buscar prospects:', error);
      toast.error('Erro ao carregar prospects');
    } finally {
      setLoading(false);
    }
  }, [affiliateId]);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_prospect_settings')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data as unknown as ProspectSettings);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  }, [affiliateId]);

  useEffect(() => {
    if (affiliateId) {
      fetchProspects();
      fetchSettings();
    }
  }, [affiliateId, fetchProspects, fetchSettings]);

  const createProspect = async (data: Partial<Prospect>): Promise<Prospect | null> => {
    try {
      const { data: newProspect, error } = await supabase
        .from('affiliate_prospects')
        .insert({
          affiliate_id: affiliateId,
          company_name: data.company_name,
          company_phone: data.company_phone || null,
          company_email: data.company_email || null,
          company_website: data.company_website || null,
          company_city: data.company_city || null,
          company_state: data.company_state || null,
          niche: data.niche || null,
          notes: data.notes || null,
          source: 'manual',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      
      const typedProspect = newProspect as unknown as Prospect;
      setProspects(prev => [typedProspect, ...prev]);
      toast.success('Prospect adicionado!');
      return typedProspect;
    } catch (error) {
      console.error('Erro ao criar prospect:', error);
      toast.error('Erro ao adicionar prospect');
      return null;
    }
  };

  const analyzeProspect = async (prospectId: string): Promise<boolean> => {
    try {
      setAnalyzing(true);
      const prospect = prospects.find(p => p.id === prospectId);
      if (!prospect) return false;

      const { data, error } = await supabase.functions.invoke('prospect-analyzer', {
        body: {
          prospect_id: prospectId,
          company_name: prospect.company_name,
          company_website: prospect.company_website,
          company_phone: prospect.company_phone,
          niche: prospect.niche,
          company_city: prospect.company_city,
          action: 'analyze_and_propose',
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Análise concluída e proposta gerada!');
        await fetchProspects();
        return true;
      } else {
        toast.error(data?.error || 'Erro na análise');
        return false;
      }
    } catch (error) {
      console.error('Erro ao analisar prospect:', error);
      toast.error('Erro ao analisar prospect');
      return false;
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeAll = async (): Promise<number> => {
    const pending = prospects.filter(p => p.status === 'pending');
    if (pending.length === 0) {
      toast.info('Nenhum prospect pendente para analisar');
      return 0;
    }

    toast.info(`Analisando ${pending.length} prospects...`);
    let success = 0;

    for (const prospect of pending) {
      const result = await analyzeProspect(prospect.id);
      if (result) success++;
      // Pequeno delay entre análises
      await new Promise(r => setTimeout(r, 1000));
    }

    toast.success(`${success} de ${pending.length} prospects analisados!`);
    return success;
  };

  const sendProposal = async (prospectId: string): Promise<boolean> => {
    try {
      setSending(true);
      
      const { data, error } = await supabase.functions.invoke('prospect-sender', {
        body: {
          action: 'send_single',
          prospect_id: prospectId,
          affiliate_id: affiliateId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Proposta enviada com sucesso!');
        await fetchProspects();
        return true;
      } else {
        toast.error(data?.error || 'Erro ao enviar');
        return false;
      }
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      toast.error('Erro ao enviar proposta');
      return false;
    } finally {
      setSending(false);
    }
  };

  const sendBatch = async (batchSize: number = 5): Promise<{ sent: number; failed: number }> => {
    try {
      setSending(true);
      
      const { data, error } = await supabase.functions.invoke('prospect-sender', {
        body: {
          action: 'send_batch',
          affiliate_id: affiliateId,
          batch_size: batchSize,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`${data.sent} propostas enviadas!`);
        await fetchProspects();
        return { sent: data.sent || 0, failed: data.failed || 0 };
      } else {
        toast.error(data?.error || 'Erro ao enviar lote');
        return { sent: 0, failed: 0 };
      }
    } catch (error) {
      console.error('Erro ao enviar lote:', error);
      toast.error('Erro ao enviar propostas');
      return { sent: 0, failed: 0 };
    } finally {
      setSending(false);
    }
  };

  const updateProspect = async (id: string, data: Partial<Prospect>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('affiliate_prospects')
        .update(data as never)
        .eq('id', id);

      if (error) throw error;

      setProspects(prev => prev.map(p => 
        p.id === id ? { ...p, ...data } as Prospect : p
      ));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar prospect:', error);
      toast.error('Erro ao atualizar');
      return false;
    }
  };

  const deleteProspect = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('affiliate_prospects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProspects(prev => prev.filter(p => p.id !== id));
      toast.success('Prospect removido');
      return true;
    } catch (error) {
      console.error('Erro ao deletar prospect:', error);
      toast.error('Erro ao remover prospect');
      return false;
    }
  };

  const saveSettings = async (newSettings: Partial<ProspectSettings>): Promise<boolean> => {
    try {
      if (settings) {
        // Atualizar
        const { error } = await supabase
          .from('affiliate_prospect_settings')
          .update(newSettings as never)
          .eq('affiliate_id', affiliateId);

        if (error) throw error;
      } else {
        // Criar
        const { data, error } = await supabase
          .from('affiliate_prospect_settings')
          .insert({
            affiliate_id: affiliateId,
            ...newSettings,
          } as never)
          .select()
          .single();

        if (error) throw error;
        setSettings(data as unknown as ProspectSettings);
      }

      await fetchSettings();
      toast.success('Configurações salvas!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
      return false;
    }
  };

  const getStats = (): ProspectStats => {
    const total = prospects.length;
    const pending = prospects.filter(p => p.status === 'pending').length;
    const analyzing = prospects.filter(p => p.status === 'analyzing').length;
    const analyzed = prospects.filter(p => p.status === 'analyzed').length;
    const proposal_ready = prospects.filter(p => p.status === 'proposal_ready').length;
    const sent = prospects.filter(p => p.status === 'sent').length;
    const replied = prospects.filter(p => p.status === 'replied').length;
    const converted = prospects.filter(p => p.status === 'converted').length;
    const failed = prospects.filter(p => p.status === 'failed').length;
    const avgScore = total > 0 
      ? Math.round(prospects.reduce((sum, p) => sum + p.analysis_score, 0) / total)
      : 0;

    return {
      total,
      pending,
      analyzing,
      analyzed,
      proposal_ready,
      sent,
      replied,
      converted,
      failed,
      avgScore,
    };
  };

  return {
    prospects,
    settings,
    loading,
    analyzing,
    sending,
    fetchProspects,
    createProspect,
    analyzeProspect,
    analyzeAll,
    sendProposal,
    sendBatch,
    updateProspect,
    deleteProspect,
    saveSettings,
    getStats,
  };
}
