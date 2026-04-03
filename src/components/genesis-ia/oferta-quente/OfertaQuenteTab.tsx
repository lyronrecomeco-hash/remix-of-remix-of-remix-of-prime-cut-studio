import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Radar } from 'lucide-react';
import { SearchHeader } from './components/SearchHeader';
import { KPICards } from './components/KPICards';
import { OfferCard } from './components/OfferCard';
import { OfferBlueprint } from './components/OfferBlueprint';
import { useHotOffers } from './hooks/useHotOffers';
import { HotOffer, SearchFilters } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

interface OfertaQuenteTabProps {
  onBack?: () => void;
}

export const OfertaQuenteTab = ({ onBack }: OfertaQuenteTabProps) => {
  const isMobile = useIsMobile();
  const { offers, isSearching, savedOfferIds, recentSearches, searchOffers, saveOffer, unsaveOffer, loadSavedOffers } = useHotOffers();
  const [selectedOffer, setSelectedOffer] = useState<HotOffer | null>(null);

  useEffect(() => {
    loadSavedOffers();
  }, [loadSavedOffers]);

  const handleSearch = (query: string, filters: SearchFilters) => {
    setSelectedOffer(null);
    searchOffers(query, filters);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white/90 flex items-center gap-2">
            Oferta Quente
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/20 text-orange-400 font-semibold uppercase tracking-wider">
              Premium
            </span>
          </h1>
          <p className="text-xs text-white/40">Descubra as ofertas mais quentes do mercado em tempo real</p>
        </div>
      </div>

      {/* Search */}
      <SearchHeader 
        onSearch={handleSearch} 
        isSearching={isSearching} 
        recentSearches={recentSearches} 
      />

      {/* KPIs */}
      {offers.length > 0 && <KPICards offers={offers} />}

      {/* Main content */}
      <div className="flex gap-4">
        {/* Offers grid */}
        <div className="flex-1 min-w-0">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Radar className="w-10 h-10 text-orange-400/60" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm text-white/60 font-medium">Rastreando ofertas...</p>
                <p className="text-xs text-white/30 mt-1">Analisando anúncios ativos com IA</p>
              </div>
            </div>
          ) : offers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {offers.map((offer, i) => (
                <OfferCard
                  key={`${offer.headline}-${i}`}
                  offer={offer}
                  index={i}
                  isSelected={selectedOffer?.headline === offer.headline}
                  isSaved={offer.id ? savedOfferIds.has(offer.id) : false}
                  onSelect={() => setSelectedOffer(offer)}
                  onSave={() => saveOffer(offer)}
                  onUnsave={() => offer.id && unsaveOffer(offer.id)}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/10">
                <Sparkles className="w-10 h-10 text-orange-400/40" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white/50 font-medium">Busque um nicho para começar</p>
                <p className="text-xs text-white/30 mt-1">Digite um nicho ou clique em uma sugestão acima</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Blueprint panel - desktop only */}
        {!isMobile && (
          <AnimatePresence>
            {selectedOffer && (
              <OfferBlueprint 
                offer={selectedOffer} 
                onClose={() => setSelectedOffer(null)} 
              />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Blueprint drawer - mobile */}
      {isMobile && selectedOffer && (
        <OfferBlueprint 
          offer={selectedOffer} 
          onClose={() => setSelectedOffer(null)} 
          isMobile 
        />
      )}
    </div>
  );
};
