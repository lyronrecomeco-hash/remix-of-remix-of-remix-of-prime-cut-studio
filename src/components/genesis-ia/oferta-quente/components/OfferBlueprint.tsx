import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Target, Lightbulb, Brain, Compass, DollarSign, Percent, 
  Zap, Package, FileText, Sparkles, TrendingUp, Copy
} from 'lucide-react';
import { HotOffer } from '../types';
import { HeatScoreBadge } from './HeatScoreBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface OfferBlueprintProps {
  offer: HotOffer | null;
  onClose: () => void;
  isMobile?: boolean;
}

export const OfferBlueprint = ({ offer, onClose, isMobile }: OfferBlueprintProps) => {
  if (!offer) return null;

  const blueprint = offer.ai_blueprint;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const InfoRow = ({ icon: Icon, label, value, copyable = false }: { icon: any; label: string; value: string | number | null; copyable?: boolean }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] group/row">
        <div className="mt-0.5 p-1.5 rounded-md bg-blue-500/10">
          <Icon className="w-3.5 h-3.5 text-blue-400/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-sm text-white/80 leading-relaxed">{value}</p>
        </div>
        {copyable && typeof value === 'string' && (
          <button
            onClick={() => copyToClipboard(value, label)}
            className="opacity-0 group-hover/row:opacity-100 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <HeatScoreBadge score={offer.heat_score} size="md" />
            <span className="text-xs text-white/40">{offer.platform}</span>
          </div>
          <h3 className="text-base font-semibold text-white/90 leading-snug">{offer.headline}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Ad Info */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-blue-400/60 uppercase tracking-widest font-semibold">Anúncio Original</p>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
          <p className="text-xs text-white/60 leading-relaxed">{offer.copy}</p>
          {offer.cta_text && (
            <div className="mt-2 inline-flex px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              {offer.cta_text}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Blueprint Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <p className="text-[11px] text-amber-400/80 uppercase tracking-widest font-semibold">Blueprint Comercial</p>
        </div>
        
        <div className="space-y-2">
          <InfoRow icon={Zap} label="Hook" value={offer.hook || blueprint?.hook} copyable />
          <InfoRow icon={Target} label="Promessa" value={offer.promise || blueprint?.promise} copyable />
          <InfoRow icon={Brain} label="Gatilho Mental" value={offer.mental_trigger || blueprint?.mental_trigger} />
          <InfoRow icon={Compass} label="Ângulo" value={offer.angle || blueprint?.angle} />
          <InfoRow icon={Lightbulb} label="Por que funciona" value={blueprint?.why_it_works} />
          <InfoRow icon={FileText} label="Análise da Copy" value={blueprint?.copy_breakdown} />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Money Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <p className="text-[11px] text-emerald-400/80 uppercase tracking-widest font-semibold">Inteligência de Venda</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center">
            <p className="text-[10px] text-emerald-400/60 uppercase mb-1">Ticket Sugerido</p>
            <p className="text-lg font-bold text-emerald-400">
              R$ {(offer.suggested_ticket || blueprint?.suggested_ticket || 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-center">
            <p className="text-[10px] text-blue-400/60 uppercase mb-1">Chance Fechamento</p>
            <p className="text-lg font-bold text-blue-400">
              {offer.closing_chance || blueprint?.closing_chance || 0}%
            </p>
          </div>
        </div>

        <InfoRow icon={TrendingUp} label="Melhor Abordagem" value={blueprint?.best_approach} copyable />
        <InfoRow icon={Package} label="Entrega Sugerida" value={blueprint?.delivery_suggestion} />

        {/* Ideal Niches */}
        {(offer.ideal_niches || blueprint?.ideal_niches) && (
          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Nichos Ideais</p>
            <div className="flex flex-wrap gap-1.5">
              {(offer.ideal_niches || blueprint?.ideal_niches || []).map((n: string) => (
                <span key={n} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-400/80">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-white/[0.03] text-center">
          <p className="text-[10px] text-white/30 mb-0.5">Dias Ativo</p>
          <p className="text-sm font-semibold text-white/70">{offer.days_active}d</p>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.03] text-center">
          <p className="text-[10px] text-white/30 mb-0.5">Vezes Visto</p>
          <p className="text-sm font-semibold text-white/70">{offer.recurrence_count}x</p>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.03] text-center">
          <p className="text-[10px] text-white/30 mb-0.5">Engajamento</p>
          <p className="text-sm font-semibold text-white/70">{offer.engagement_score}</p>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-[hsl(220_25%_12%)] border-t border-white/10 overflow-hidden"
          >
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-2" />
            <ScrollArea className="h-[80vh] px-4 pb-8">
              {content}
            </ScrollArea>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-[340px] shrink-0 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden"
    >
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-5">
          {content}
        </div>
      </ScrollArea>
    </motion.div>
  );
};
