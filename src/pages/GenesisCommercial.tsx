import { useSiteCustomization } from '@/hooks/useSiteCustomization';
import GenesisCommercialHeader from '@/components/genesis-commercial/GenesisCommercialHeader';
import GenesisCommercialHero from '@/components/genesis-commercial/GenesisCommercialHero';
import GenesisCommercialResources from '@/components/genesis-commercial/GenesisCommercialResources';
import GenesisCommercialRadar from '@/components/genesis-commercial/GenesisCommercialRadar';
import GenesisCommercialFeatures from '@/components/genesis-commercial/GenesisCommercialFeatures';
import GenesisWhyChoose from '@/components/genesis-commercial/GenesisWhyChoose';
import GenesisCommercialPartnerships from '@/components/genesis-commercial/GenesisCommercialPartnerships';
import GenesisCommercialPricing from '@/components/genesis-commercial/GenesisCommercialPricing';
import GenesisCommercialFAQ from '@/components/genesis-commercial/GenesisCommercialFAQ';
import GenesisCommercialFooter from '@/components/genesis-commercial/GenesisCommercialFooter';
import InteractiveBackground from '@/components/genesis-commercial/InteractiveBackground';
import { createContext, useContext } from 'react';
import type { SiteCustomization } from '@/types/siteCustomization';
import { DEFAULT_CUSTOMIZATION } from '@/types/siteCustomization';

export const SiteCustomizationContext = createContext<SiteCustomization>(DEFAULT_CUSTOMIZATION);
export const useSiteTexts = () => useContext(SiteCustomizationContext);

const GenesisCommercial = () => {
  const { customization, loading } = useSiteCustomization();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <SiteCustomizationContext.Provider value={customization}>
      <div className="min-h-screen bg-background overflow-x-hidden relative">
        <InteractiveBackground />
        <div className="relative z-10">
          <GenesisCommercialHeader />
          <GenesisCommercialHero />
          <GenesisCommercialResources />
          <GenesisCommercialRadar />
          <GenesisCommercialFeatures />
          <GenesisWhyChoose />
          <GenesisCommercialPartnerships />
          <GenesisCommercialPricing />
          <GenesisCommercialFAQ />
          <GenesisCommercialFooter />
        </div>
      </div>
    </SiteCustomizationContext.Provider>
  );
};

export default GenesisCommercial;
