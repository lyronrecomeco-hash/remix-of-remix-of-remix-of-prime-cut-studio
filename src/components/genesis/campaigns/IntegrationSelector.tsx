/**
 * INTEGRATION SELECTOR - Seletor de integrações configuradas para campanhas
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Import logos
import caktoLogo from '@/assets/integrations/cakto-logo.png';
import shopifyLogo from '@/assets/integrations/shopify.png';
import woocommerceLogo from '@/assets/integrations/woocommerce.png';
import nuvemshopLogo from '@/assets/integrations/nuvemshop.png';
import mercadoshopsLogo from '@/assets/integrations/mercadoshops.png';
import rdstationLogo from '@/assets/integrations/rdstation.png';

interface Integration {
  id: string;
  provider: string;
  status: string;
  store_name?: string;
}

interface IntegrationSelectorProps {
  instanceId: string;
  selectedIntegration: string | null;
  onSelect: (integrationId: string, provider: string) => void;
}

const INTEGRATION_INFO: Record<string, { name: string; logo: string; description: string }> = {
  cakto: { name: 'Cakto', logo: caktoLogo, description: 'Infoprodutos' },
  shopify: { name: 'Shopify', logo: shopifyLogo, description: 'E-commerce' },
  woocommerce: { name: 'WooCommerce', logo: woocommerceLogo, description: 'WordPress' },
  nuvemshop: { name: 'Nuvemshop', logo: nuvemshopLogo, description: 'E-commerce LATAM' },
  mercadoshops: { name: 'Mercado Shops', logo: mercadoshopsLogo, description: 'Mercado Livre' },
  rdstation: { name: 'RD Station', logo: rdstationLogo, description: 'Marketing CRM' },
  hotmart: { name: 'Hotmart', logo: caktoLogo, description: 'Infoprodutos' },
  kiwify: { name: 'Kiwify', logo: caktoLogo, description: 'Infoprodutos' },
  eduzz: { name: 'Eduzz', logo: caktoLogo, description: 'Infoprodutos' },
};

export function IntegrationSelector({ instanceId, selectedIntegration, onSelect }: IntegrationSelectorProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntegrations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('genesis_instance_integrations')
          .select('id, provider, status, store_name')
          .eq('instance_id', instanceId)
          .eq('status', 'connected');

        if (error) throw error;
        setIntegrations(data || []);
      } catch (error) {
        console.error('Error fetching integrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, [instanceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Link2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">Nenhuma integração configurada</h3>
          <p className="text-sm text-muted-foreground">
            Configure uma integração primeiro no painel da instância para usar campanhas automáticas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {integrations.map((integration) => {
        const info = INTEGRATION_INFO[integration.provider] || {
          name: integration.provider,
          logo: caktoLogo,
          description: 'Integração',
        };

        return (
          <Card
            key={integration.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedIntegration === integration.id
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/50"
            )}
            onClick={() => onSelect(integration.id, integration.provider)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center">
                  <img 
                    src={info.logo} 
                    alt={info.name} 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{info.name}</p>
                    <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Conectado
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {integration.store_name || info.description}
                  </p>
                </div>
              </div>
              
              {selectedIntegration === integration.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
