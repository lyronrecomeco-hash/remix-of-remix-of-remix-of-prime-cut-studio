import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HotOffer, SearchFilters } from '../types';
import { toast } from 'sonner';

export const useHotOffers = () => {
  const [offers, setOffers] = useState<HotOffer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedOfferIds, setSavedOfferIds] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchOffers = useCallback(async (query: string, filters: SearchFilters) => {
    if (!query.trim()) return;
    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke('search-hot-offers', {
        body: {
          query,
          niche: query,
          platform: filters.platform,
          minScore: filters.minScore,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const results = (data?.offers || []).map((o: any) => ({
        ...o,
        is_saved: savedOfferIds.has(o.id),
      }));

      // Sort
      results.sort((a: HotOffer, b: HotOffer) => {
        switch (filters.sortBy) {
          case 'days_active': return b.days_active - a.days_active;
          case 'recurrence_count': return b.recurrence_count - a.recurrence_count;
          case 'suggested_ticket': return (b.suggested_ticket || 0) - (a.suggested_ticket || 0);
          default: return b.heat_score - a.heat_score;
        }
      });

      setOffers(results);
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
        return updated;
      });

      if (results.length === 0) {
        toast.info('Nenhuma oferta encontrada. Tente outro nicho.');
      }
    } catch (err) {
      console.error('Error searching offers:', err);
      toast.error('Erro ao buscar ofertas. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  }, [savedOfferIds]);

  const saveOffer = useCallback(async (offer: HotOffer) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!offer.id) {
        // Insert offer first
        const { data: insertedOffer, error: insertError } = await supabase
          .from('hot_offers' as any)
          .insert({
            niche: offer.niche,
            headline: offer.headline,
            copy: offer.copy,
            cta_text: offer.cta_text,
            platform: offer.platform,
            format: offer.format,
            heat_score: offer.heat_score,
            days_active: offer.days_active,
            advertiser_name: offer.advertiser_name,
            creative_url: offer.creative_url,
            landing_url: offer.landing_url,
            hook: offer.hook,
            promise: offer.promise,
            mental_trigger: offer.mental_trigger,
            angle: offer.angle,
            ideal_niches: offer.ideal_niches,
            suggested_ticket: offer.suggested_ticket,
            closing_chance: offer.closing_chance,
            ai_blueprint: offer.ai_blueprint,
            engagement_score: offer.engagement_score,
            recurrence_count: offer.recurrence_count,
            tags: offer.tags,
          } as any)
          .select('id')
          .single() as any;

        if (insertError) throw insertError;
        offer.id = insertedOffer.id;
      }

      await supabase.from('hot_offer_saves' as any).insert({
        user_id: user.id,
        offer_id: offer.id,
      } as any);

      setSavedOfferIds(prev => new Set([...prev, offer.id!]));
      toast.success('Oferta salva!');
    } catch (err) {
      console.error('Error saving offer:', err);
      toast.error('Erro ao salvar oferta.');
    }
  }, []);

  const unsaveOffer = useCallback(async (offerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('hot_offer_saves' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('offer_id', offerId);

      setSavedOfferIds(prev => {
        const next = new Set(prev);
        next.delete(offerId);
        return next;
      });
      toast.success('Oferta removida dos salvos.');
    } catch (err) {
      console.error('Error unsaving offer:', err);
    }
  }, []);

  const loadSavedOffers = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('hot_offer_saves' as any)
        .select('offer_id')
        .eq('user_id', user.id) as any;

      if (data) {
        setSavedOfferIds(new Set(data.map((d: any) => d.offer_id)));
      }
    } catch (err) {
      console.error('Error loading saved offers:', err);
    }
  }, []);

  return {
    offers,
    isSearching,
    savedOfferIds,
    recentSearches,
    searchOffers,
    saveOffer,
    unsaveOffer,
    loadSavedOffers,
  };
};
