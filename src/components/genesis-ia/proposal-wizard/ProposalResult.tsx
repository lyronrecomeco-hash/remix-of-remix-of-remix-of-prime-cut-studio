import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Copy, 
  Check, 
  MessageSquare, 
  RotateCcw,
  Sparkles,
  Target,
  Lightbulb,
  Gift,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { GeneratedProposal } from './types';

interface ProposalResultProps {
  proposal: GeneratedProposal;
  companyName: string;
  phone?: string;
  onReset: () => void;
}

export const ProposalResult = ({ proposal, companyName, phone, onReset }: ProposalResultProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success('Copiado!');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const openWhatsApp = () => {
    if (!phone) {
      toast.error('Nenhum telefone informado');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(proposal.mensagem_whatsapp)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-[520px] bg-white/5 border border-white/10 overflow-hidden" style={{ borderRadius: '12px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Proposta Gerada!</h4>
            <p className="text-xs text-white/40">{companyName}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-white/50 hover:text-white hover:bg-white/10 h-9"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Nova Proposta
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400">HEADLINE</span>
            </div>
            <p className="text-base font-semibold text-white leading-relaxed">
              {proposal.headline}
            </p>
          </motion.div>

          {/* Problema */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold text-red-400">PROBLEMA IDENTIFICADO</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {proposal.problema_identificado}
            </p>
          </motion.div>

          {/* Solução */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">SOLUÇÃO PROPOSTA</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {proposal.solucao_proposta}
            </p>
          </motion.div>

          {/* Benefícios */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400">BENEFÍCIOS</span>
            </div>
            <ul className="space-y-2">
              {proposal.beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  {beneficio}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Oferta Especial */}
          {proposal.oferta_especial && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">OFERTA ESPECIAL</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                {proposal.oferta_especial}
              </p>
            </motion.div>
          )}

          {/* Investimento */}
          {proposal.investimento && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-4 bg-white/5 border border-white/10 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-white/60" />
                <span className="text-xs font-semibold text-white/60">INVESTIMENTO</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                {proposal.investimento}
              </p>
            </motion.div>
          )}

          {/* WhatsApp Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <span className="text-xs font-semibold text-green-400">MENSAGEM WHATSAPP</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(proposal.mensagem_whatsapp, 'whatsapp')}
                className="h-7 px-2 text-xs text-white/50 hover:text-white hover:bg-white/10"
              >
                {copied === 'whatsapp' ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                Copiar
              </Button>
            </div>
            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg">
              {proposal.mensagem_whatsapp}
            </p>
          </motion.div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <div className="flex gap-2">
          <Button
            onClick={() => copyToClipboard(proposal.mensagem_whatsapp, 'footer')}
            variant="outline"
            className="flex-1 h-10 border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            {copied === 'footer' ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            Copiar Mensagem
          </Button>
          {phone && (
            <Button
              onClick={openWhatsApp}
              className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Enviar WhatsApp
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
