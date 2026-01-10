/**
 * CAKTO EVENT RULES - Configuração de regras evento → campanha
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Settings2 } from 'lucide-react';
import { useCaktoRules } from './hooks/useCaktoRules';
import { CaktoEventType, CAKTO_EVENT_LABELS, CAKTO_EVENT_COLORS } from './types';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  id: string;
  name: string;
}

interface CaktoEventRulesProps {
  instanceId: string;
  integrationId?: string;
}

export function CaktoEventRules({ instanceId, integrationId }: CaktoEventRulesProps) {
  const { rules, loading, saving, toggleRule, deleteRule } = useCaktoRules(instanceId, integrationId);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data } = await supabase
        .from('genesis_campaigns')
        .select('id, name')
        .eq('instance_id', instanceId)
        .order('name');
      setCampaigns((data || []) as Campaign[]);
      setLoadingCampaigns(false);
    };
    fetchCampaigns();
  }, [instanceId]);

  const eventTypes: CaktoEventType[] = [
    'initiate_checkout',
    'purchase_approved',
    'purchase_refused',
    'purchase_refunded',
    'checkout_abandonment',
  ];

  if (loading || loadingCampaigns) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!integrationId) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          Configure a integração Cakto primeiro
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Regras de Automação</h3>
          <p className="text-sm text-muted-foreground">
            Configure quais campanhas disparam para cada evento
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {eventTypes.map((eventType) => {
          const eventRules = rules.filter(r => r.event_type === eventType);
          const colors = CAKTO_EVENT_COLORS[eventType];
          const hasRule = eventRules.length > 0;
          const activeRule = eventRules.find(r => r.is_active);

          return (
            <Card key={eventType} className={`${colors.border} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <Settings2 className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="font-medium">{CAKTO_EVENT_LABELS[eventType]}</p>
                      {activeRule && (
                        <p className="text-xs text-muted-foreground">
                          → {campaigns.find(c => c.id === activeRule.campaign_id)?.name || 'Sem campanha'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasRule && activeRule && (
                      <Badge variant="outline" className={`${colors.bg} ${colors.text}`}>
                        Ativo
                      </Badge>
                    )}
                    {!hasRule && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {campaigns.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Crie campanhas primeiro para configurar automações
        </p>
      )}
    </div>
  );
}
