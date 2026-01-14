import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import type { TemplateConfig } from '@/components/affiliate/templates/types';

// Importar os templates renderizáveis
import Index from './Index';

interface TemplateConfigData {
  id: string;
  template_slug: string;
  template_name: string;
  config: TemplateConfig;
  views_count: number;
}

export default function DemoPage() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [configData, setConfigData] = useState<TemplateConfigData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!code) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        // Buscar a configuração pelo código único
        const { data, error: fetchError } = await supabase
          .from('affiliate_template_configs')
          .select('id, template_slug, template_name, config, views_count')
          .eq('unique_code', code)
          .eq('is_active', true)
          .single();

        if (fetchError || !data) {
          console.error('Erro ao buscar configuração:', fetchError);
          setError(true);
          setLoading(false);
          return;
        }

        // Incrementar contador de visualizações (fire and forget)
        supabase
          .from('affiliate_template_configs')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', data.id)
          .then(() => {});

        setConfigData({
          ...data,
          config: data.config as unknown as TemplateConfig
        });
      } catch (err) {
        console.error('Erro:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !configData) {
    return <Navigate to="/404" replace />;
  }

  // Renderizar o template apropriado baseado no template_slug
  // Por enquanto, renderiza a página Index padrão
  // As personalizações serão aplicadas via CSS variables no futuro
  return <Index />;
}
