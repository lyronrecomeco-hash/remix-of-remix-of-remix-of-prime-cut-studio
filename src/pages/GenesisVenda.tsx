import SiteHero from '@/components/site/SiteHero';
import SiteProblem from '@/components/site/SiteProblem';
import SiteSolution from '@/components/site/SiteSolution';
import SiteConversations from '@/components/site/SiteConversations';
import SiteFeatures from '@/components/site/SiteFeatures';
import SiteTestimonials from '@/components/site/SiteTestimonials';
import SitePricing from '@/components/site/SitePricing';
import SiteFAQ from '@/components/site/SiteFAQ';
import SiteFinalCTA from '@/components/site/SiteFinalCTA';
import SiteFooter from '@/components/site/SiteFooter';

const GenesisVenda = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SiteHero />
      <SiteProblem />
      <SiteSolution />
      <SiteConversations />
      <SiteFeatures />
      <SiteTestimonials />
      <SitePricing />
      <SiteFAQ />
      <SiteFinalCTA />
      <SiteFooter />
    </div>
  );
};

export default GenesisVenda;
