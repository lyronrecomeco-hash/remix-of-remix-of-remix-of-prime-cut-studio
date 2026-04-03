import { motion } from 'framer-motion';
import { ExternalLink, Bookmark, BookmarkCheck, Clock, Eye, BarChart3, Globe } from 'lucide-react';
import { HotOffer } from '../types';
import { HeatScoreBadge } from './HeatScoreBadge';

interface OfferCardProps {
  offer: HotOffer;
  index: number;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: () => void;
  onSave: () => void;
  onUnsave: () => void;
}

export const OfferCard = ({ offer, index, isSelected, isSaved, onSelect, onSave, onUnsave }: OfferCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className={`group relative rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'bg-white/10 border-blue-500/40 shadow-lg shadow-blue-500/10'
          : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
      }`}
    >
      {/* Score ribbon */}
      <div className="absolute top-3 right-3 z-10">
        <HeatScoreBadge score={offer.heat_score} size="sm" />
      </div>

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="pr-20">
          <p className="text-xs text-blue-400/80 font-medium uppercase tracking-wider mb-1">
            {offer.platform} • {offer.format}
          </p>
          <h3 className="text-sm font-semibold text-white/90 line-clamp-2 leading-snug">
            {offer.headline}
          </h3>
        </div>

        {/* Copy preview */}
        <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
          {offer.copy}
        </p>

        {/* Metrics row */}
        <div className="flex items-center gap-3 text-[11px] text-white/40">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {offer.days_active}d ativo
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {offer.recurrence_count}x visto
          </span>
          <span className="inline-flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Eng: {offer.engagement_score}
          </span>
        </div>

        {/* Tags */}
        {offer.tags && offer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {offer.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Globe className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{offer.advertiser_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {offer.landing_url && (
              <button
                onClick={(e) => { e.stopPropagation(); window.open(offer.landing_url!, '_blank'); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); isSaved ? onUnsave() : onSave(); }}
              className={`p-1.5 rounded-lg transition-colors ${
                isSaved ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
