import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { GeneratedProposal } from './types';
import { supabase } from '@/integrations/supabase/client';

interface ProposalResultProps {
  proposal: GeneratedProposal;
  companyName: string;
  userName: string;
  phone?: string;
  onReset: () => void;
}

export const ProposalResult = ({ proposal, companyName, userName, phone, onReset }: ProposalResultProps) => {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(proposal.mensagem_prospecao);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentMessage);
      setCopied(true);
      toast.success('Mensagem copiada!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const openWhatsApp = () => {
    if (!phone) {
      // Just copy if no phone
      copyToClipboard();
      toast.info('Mensagem copiada! Cole no WhatsApp.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(currentMessage)}`;
    window.open(url, '_blank');
  };

  const regenerateVariant = async () => {
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('luna-generate-full-proposal', {
        body: {
          answers: { company_name: companyName },
          affiliateName: userName,
          regenerate: true
        }
      });

      if (error) throw error;
      
      if (data?.proposal) {
        setCurrentMessage(data.proposal);
        toast.success('Nova variação gerada!');
      }
    } catch (error) {
      console.error('Erro ao regenerar:', error);
      toast.error('Erro ao gerar variação');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Format the message with proper styling
  const formatMessage = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Check if line starts with emoji/icon
      if (line.startsWith('✅') || line.startsWith('•') || line.startsWith('-')) {
        return (
          <p key={index} className="text-white/80 text-sm leading-relaxed pl-1">
            {line}
          </p>
        );
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} className="text-white/90 text-sm leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col min-h-[400px] sm:min-h-[480px] bg-white/5 border border-white/10 overflow-hidden" style={{ borderRadius: '14px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-xs sm:text-sm">Proposta Pronta!</h4>
            <p className="text-[10px] sm:text-xs text-white/40">Para {companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerateVariant}
            disabled={isRegenerating}
            className="text-white/50 hover:text-white hover:bg-white/10 h-7 sm:h-8 px-2 text-[10px] sm:text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Variação</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-white/50 hover:text-white hover:bg-white/10 h-7 sm:h-8 px-2 text-[10px] sm:text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Nova</span>
          </Button>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="px-3 sm:px-4 py-2 bg-purple-500/10 border-b border-purple-500/20">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-purple-300">
          <Wand2 className="w-3 h-3 flex-shrink-0" />
          <span>Mensagem personalizada com seu nome ({userName}) e dados do prospect</span>
        </div>
      </div>

      {/* Message Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 sm:p-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl space-y-1"
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <MessageSquare className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400">MENSAGEM DE PROSPECÇÃO</span>
            </div>
            <div className="space-y-0.5">
              {formatMessage(currentMessage)}
            </div>
          </motion.div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="px-3 sm:px-4 py-3 border-t border-white/10 bg-white/5">
        <div className="flex gap-2">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="flex-1 h-9 sm:h-10 border-white/10 bg-white/5 text-white hover:bg-white/10 text-xs sm:text-sm"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            ) : (
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Copiar Mensagem</span>
            <span className="sm:hidden">Copiar</span>
          </Button>
          <Button
            onClick={openWhatsApp}
            className="flex-1 h-9 sm:h-10 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Enviar WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </Button>
        </div>
        
        {/* Success indicator */}
        <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-white/5">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="text-[10px] sm:text-xs text-white/40">
            Gerada por IA • Pronta para enviar
          </span>
        </div>
      </div>
    </div>
  );
};
