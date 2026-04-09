import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Type, MapPin, Users, FileText, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFromScratch } from '../FromScratchContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProposalForImport {
  id: string;
  company_name: string;
  contact_name: string | null;
  niche_id: string | null;
  company_email: string | null;
  company_phone: string | null;
  questionnaire_answers: any;
  ai_analysis: any;
}

export function StepIdentity() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposals, setProposals] = useState<ProposalForImport[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [analyzingAudience, setAnalyzingAudience] = useState(false);

  const handleLoadProposals = async () => {
    setLoadingProposals(true);
    setShowProposalModal(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to get affiliate ID
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const affId = affiliate?.id;
      if (!affId) {
        setLoadingProposals(false);
        return;
      }

      const { data, error } = await supabase
        .from('affiliate_proposals')
        .select('id, company_name, contact_name, niche_id, company_email, company_phone, questionnaire_answers, ai_analysis')
        .eq('affiliate_id', affId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProposals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleImportProposal = async (proposal: ProposalForImport) => {
    const answers = proposal.questionnaire_answers as any;
    updateFormData('companyName', proposal.company_name || '');
    updateFormData('projectName', proposal.company_name || '');
    if (answers?.slogan) updateFormData('slogan', answers.slogan);
    
    // Extract city from address field (format: "Rua X, N - Bairro, Cidade - UF, CEP")
    const address = answers?.address || answers?.city || answers?.location || '';
    if (address) {
      // Try to extract "Cidade - UF" from Brazilian address format
      const cityMatch = address.match(/,\s*([^,]+?)\s*-\s*([A-Z]{2})\s*,/);
      if (cityMatch) {
        updateFormData('cityRegion', `${cityMatch[1].trim()}, ${cityMatch[2]}`);
      } else {
        updateFormData('cityRegion', address);
      }
    }
    
    setShowProposalModal(false);
    toast.success('Dados importados!', { description: `Dados de "${proposal.company_name}" aplicados.` });

    // Auto-analyze target audience
    setAnalyzingAudience(true);
    try {
      const nicheInfo = answers?.niche || (proposal.ai_analysis as any)?.niche || selectedNiche?.name || '';
      const analysisText = typeof proposal.ai_analysis === 'object' && proposal.ai_analysis ? JSON.stringify(proposal.ai_analysis) : '';

      const { data: funcData } = await supabase.functions.invoke('genesis-ai-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Com base nestes dados, gere um BREVE público-alvo (máximo 2 linhas):
Empresa: ${proposal.company_name}
Nicho: ${nicheInfo}
Endereço: ${address}
Website: ${answers?.website || ''}
Avaliação: ${answers?.rating || ''}
${analysisText ? `Análise: ${analysisText.slice(0, 500)}` : ''}
Responda APENAS o público-alvo, sem introdução.`
            }
          ],
          max_tokens: 150,
        }
      });
      if (funcData?.content) {
        updateFormData('targetAudience', funcData.content.trim());
      }
    } catch (e) {
      console.error('Audience analysis error:', e);
    } finally {
      setAnalyzingAudience(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Import Proposal Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleLoadProposals}
        className="w-full p-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 bg-white/5 hover:bg-primary/5 transition-all flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div className="text-left">
          <p className="text-xs sm:text-sm font-medium">Possui uma proposta salva?</p>
          <p className="text-[10px] text-muted-foreground">Importe os dados de uma proposta aceita automaticamente</p>
        </div>
      </motion.button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1.5 sm:space-y-2"
        >
          <Label className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            Nome do Projeto *
          </Label>
          <Input
            value={formData.projectName}
            onChange={(e) => updateFormData('projectName', e.target.value)}
            placeholder={selectedNiche ? `Ex: ${selectedNiche.name} Pro` : 'Ex: Meu Projeto'}
            className="bg-white/5 border-white/10 h-9 sm:h-10 text-xs sm:text-sm"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-1.5 sm:space-y-2"
        >
          <Label className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            Nome da Empresa *
          </Label>
          <Input
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
            placeholder="Ex: Empresa XYZ"
            className="bg-white/5 border-white/10 h-9 sm:h-10 text-xs sm:text-sm"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1.5 sm:space-y-2"
        >
          <Label className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Slogan (opcional)
          </Label>
          <Input
            value={formData.slogan || ''}
            onChange={(e) => updateFormData('slogan', e.target.value)}
            placeholder="Ex: Inovação que transforma"
            className="bg-white/5 border-white/10 h-9 sm:h-10 text-xs sm:text-sm"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-1.5 sm:space-y-2"
        >
          <Label className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Cidade/Região (opcional)
          </Label>
          <Input
            value={formData.cityRegion || ''}
            onChange={(e) => updateFormData('cityRegion', e.target.value)}
            placeholder="Ex: São Paulo, SP"
            className="bg-white/5 border-white/10 h-9 sm:h-10 text-xs sm:text-sm"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-1.5 sm:space-y-2"
      >
        <Label className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Público-Alvo (opcional)
          {analyzingAudience && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
        </Label>
        <Textarea
          value={formData.targetAudience || ''}
          onChange={(e) => updateFormData('targetAudience', e.target.value)}
          placeholder="Descreva seu público-alvo: idade, interesses, comportamento..."
          className="bg-white/5 border-white/10 min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm resize-none"
        />
      </motion.div>

      {/* Proposal Modal */}
      <AnimatePresence>
        {showProposalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowProposalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold">📋 Propostas Aceitas</h3>
                <button onClick={() => setShowProposalModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {loadingProposals ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : proposals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma proposta aceita encontrada.</p>
              ) : (
                <div className="space-y-2">
                  {proposals.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleImportProposal(p)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                    >
                      <p className="text-xs sm:text-sm font-semibold">{p.company_name}</p>
                      {p.contact_name && <p className="text-[10px] text-muted-foreground">{p.contact_name}</p>}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
