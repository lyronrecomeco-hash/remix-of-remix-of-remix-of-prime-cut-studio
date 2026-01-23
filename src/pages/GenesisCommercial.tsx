import GenesisCommercialHeader from '@/components/genesis-commercial/GenesisCommercialHeader';
import GenesisCommercialHero from '@/components/genesis-commercial/GenesisCommercialHero';
import GenesisCommercialRadar from '@/components/genesis-commercial/GenesisCommercialRadar';
import GenesisCommercialFeatures from '@/components/genesis-commercial/GenesisCommercialFeatures';
import GenesisWhyChoose from '@/components/genesis-commercial/GenesisWhyChoose';
import GenesisCommercialPartnerships from '@/components/genesis-commercial/GenesisCommercialPartnerships';
import GenesisCommercialPricing from '@/components/genesis-commercial/GenesisCommercialPricing';
import GenesisCommercialFAQ from '@/components/genesis-commercial/GenesisCommercialFAQ';
import GenesisCommercialFooter from '@/components/genesis-commercial/GenesisCommercialFooter';

const GenesisCommercial = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <GenesisCommercialHeader />
      <GenesisCommercialHero />
      <GenesisCommercialRadar />
      <GenesisCommercialFeatures />
      <GenesisWhyChoose />
      <GenesisCommercialPartnerships />
      <GenesisCommercialPricing />
      <GenesisCommercialFAQ />
      <GenesisCommercialFooter />
    </div>
  );
};

export default GenesisCommercial;
