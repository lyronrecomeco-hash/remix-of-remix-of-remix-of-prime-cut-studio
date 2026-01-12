import { useEffect } from 'react';
import ComercialNav from '@/components/comercial/ComercialNav';
import ComercialHero from '@/components/comercial/ComercialHero';
import ComercialProblems from '@/components/comercial/ComercialProblems';
import ComercialDemo from '@/components/comercial/ComercialDemo';
import ComercialFeatures from '@/components/comercial/ComercialFeatures';
import ComercialTools from '@/components/comercial/ComercialTools';
import ComercialTestimonials from '@/components/comercial/ComercialTestimonials';
import ComercialPricing from '@/components/comercial/ComercialPricing';
import ComercialFAQ from '@/components/comercial/ComercialFAQ';
import ComercialCTA from '@/components/comercial/ComercialCTA';
import ComercialFooter from '@/components/comercial/ComercialFooter';

const Comercial = () => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ComercialNav />
      <ComercialHero />
      <ComercialProblems />
      <ComercialDemo />
      <ComercialFeatures />
      <ComercialTools />
      <ComercialTestimonials />
      <ComercialPricing />
      <ComercialFAQ />
      <ComercialCTA />
      <ComercialFooter />
    </div>
  );
};

export default Comercial;
