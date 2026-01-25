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

const GenesisCommercial = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Interactive particle background */}
      <InteractiveBackground />
      
      {/* Content */}
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
  );
};

export default GenesisCommercial;
