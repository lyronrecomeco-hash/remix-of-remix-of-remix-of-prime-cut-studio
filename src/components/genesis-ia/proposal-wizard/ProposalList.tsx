import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, X, Copy, Check, Trash2, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SavedProposal {
  id: string;
  company_name: string;
  company_niche: string;
  generated_proposal: string;
  created_at: string;
}

interface ProposalListProps {
  affiliateId: string;
}

export const ProposalList = ({ affiliateId }: ProposalListProps) => {
  const [proposals, setProposals] = useState<SavedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<SavedProposal | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, [affiliateId]);

  const fetchProposals = async () => {
    if (!affiliateId) return;

    try {
      const { data, error } = await supabase
        .from('genesis_saved_proposals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      toast.error('Erro ao carregar propostas');
    } finally {
      setLoading(false);
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('genesis_saved_proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProposals(prev => prev.filter(p => p.id !== id));
      setSelectedProposal(null);
      toast.success('Proposta removida');
    } catch (error) {
      console.error('Erro ao remover proposta:', error);
      toast.error('Erro ao remover proposta');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Proposta copiada!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white/5 border border-white/10 rounded-2xl p-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-white/50 mt-2">Carregando propostas...</p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-primary/50" />
        </div>
        <h3 className="text-sm font-semibold text-white">Nenhuma proposta salva</h3>
        <p className="text-xs text-white/40 mt-1">
          Crie propostas personalizadas e elas aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Propostas Salvas</h4>
              <p className="text-xs text-white/40">{proposals.length} proposta(s)</p>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[320px]">
          <div className="p-3 space-y-2">
            {proposals.map((proposal) => (
              <motion.button
                key={proposal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedProposal(proposal)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/[0.07] transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-white truncate">
                      {proposal.company_name}
                    </h5>
                    <p className="text-xs text-white/40">{proposal.company_niche}</p>
                    <p className="text-[10px] text-white/30 mt-1">{formatDate(proposal.created_at)}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Modal de Visualização */}
      <AnimatePresence>
        {selectedProposal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedProposal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[hsl(220,20%,10%)] border border-white/10 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Building className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{selectedProposal.company_name}</h4>
                    <p className="text-xs text-white/40">{selectedProposal.company_niche}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProposal(null)}
                  className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="h-[300px]">
                <div className="p-4">
                  <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                    {selectedProposal.generated_proposal}
                  </p>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex gap-2">
                <Button
                  onClick={() => copyToClipboard(selectedProposal.generated_proposal)}
                  className="flex-1 h-9 gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => deleteProposal(selectedProposal.id)}
                  className="h-9 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
