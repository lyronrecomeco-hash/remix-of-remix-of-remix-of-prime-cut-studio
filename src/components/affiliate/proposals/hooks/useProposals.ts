import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AffiliateProposal, CreateProposalData, UpdateProposalData, ProposalStatus } from '../types';

export function useProposals(affiliateId: string) {
  const [proposals, setProposals] = useState<AffiliateProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliate_proposals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since the table was just created
      setProposals((data || []) as unknown as AffiliateProposal[]);
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
      toast.error('Erro ao carregar propostas');
    } finally {
      setLoading(false);
    }
  }, [affiliateId]);

  useEffect(() => {
    if (affiliateId) {
      fetchProposals();
    }
  }, [affiliateId, fetchProposals]);

  const createProposal = async (data: CreateProposalData): Promise<AffiliateProposal | null> => {
    try {
      setCreating(true);
      const { data: newProposal, error } = await supabase
        .from('affiliate_proposals')
        .insert({
          affiliate_id: affiliateId,
          company_name: data.company_name,
          company_email: data.company_email || null,
          company_phone: data.company_phone || null,
          company_cnpj: data.company_cnpj || null,
          contact_name: data.contact_name || null,
          notes: data.notes || null,
          status: 'draft' as ProposalStatus,
        })
        .select()
        .single();

      if (error) throw error;
      
      const typedProposal = newProposal as unknown as AffiliateProposal;
      setProposals(prev => [typedProposal, ...prev]);
      toast.success('Proposta criada com sucesso!');
      return typedProposal;
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      toast.error('Erro ao criar proposta');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updateProposal = async (id: string, data: UpdateProposalData): Promise<boolean> => {
    try {
      setUpdating(true);
      
      const updateData: Record<string, unknown> = { ...data };
      
      // Se estiver mudando status, atualizar timestamps correspondentes
      if (data.status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (data.status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      } else if (data.status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('affiliate_proposals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      setProposals(prev => prev.map(p => 
        p.id === id ? { ...p, ...updateData, updated_at: new Date().toISOString() } as AffiliateProposal : p
      ));
      toast.success('Proposta atualizada!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      toast.error('Erro ao atualizar proposta');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deleteProposal = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('affiliate_proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProposals(prev => prev.filter(p => p.id !== id));
      toast.success('Proposta excluída!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      toast.error('Erro ao excluir proposta. Apenas rascunhos podem ser excluídos.');
      return false;
    }
  };

  const getStatsCounts = () => {
    return {
      total: proposals.length,
      draft: proposals.filter(p => p.status === 'draft').length,
      sent: proposals.filter(p => p.status === 'sent').length,
      accepted: proposals.filter(p => p.status === 'accepted').length,
      cancelled: proposals.filter(p => p.status === 'cancelled').length,
    };
  };

  return {
    proposals,
    loading,
    creating,
    updating,
    fetchProposals,
    createProposal,
    updateProposal,
    deleteProposal,
    getStatsCounts,
  };
}
