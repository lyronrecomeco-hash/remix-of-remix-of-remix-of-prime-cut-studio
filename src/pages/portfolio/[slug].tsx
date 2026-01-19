import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import DynamicPetshop from '@/components/portfolio/DynamicPetshop';
import DynamicBarbearia from '@/components/portfolio/DynamicBarbearia';
import DynamicAcademia from '@/components/portfolio/DynamicAcademia';
import NotFound from '@/pages/NotFound';

interface TemplateConfig {
  business: {
    name: string;
    phone: string;
    whatsapp: string;
    address: string;
    slogan: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
  };
  features: {
    showPricing: boolean;
    showTeam: boolean;
    showGallery: boolean;
    showScheduling?: boolean;
    showTestimonials?: boolean;
  };
  social?: {
    instagram?: string;
    facebook?: string;
  };
  hours?: {
    weekdays: string;
    saturday: string;
    sunday?: string;
  };
}

interface PortfolioData {
  id: string;
  template_slug: string;
  config: TemplateConfig;
  client_name: string | null;
}

export default function PortfolioPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('affiliate_template_configs')
          .select('id, template_slug, config, client_name')
          .or(`custom_slug.eq.${slug},unique_code.eq.${slug}`)
          .eq('is_active', true)
          .maybeSingle();

        if (fetchError || !data) {
          setError(true);
          setLoading(false);
          return;
        }

        setPortfolio({
          ...data,
          config: data.config as unknown as TemplateConfig
        });

        // Increment view count
        await supabase.rpc('increment_template_views', { p_unique_code: slug });
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !portfolio) {
    return <NotFound />;
  }

  // Render based on template type
  switch (portfolio.template_slug) {
    case 'petshop':
      return <DynamicPetshop config={portfolio.config} />;
    case 'barbearia':
      return <DynamicBarbearia config={portfolio.config} />;
    case 'academia':
      return <DynamicAcademia config={portfolio.config} />;
    default:
      return <NotFound />;
  }
}
