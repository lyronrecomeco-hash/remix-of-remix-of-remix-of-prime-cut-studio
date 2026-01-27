/**
 * Aba de Configuração de Comissões (Admin)
 * Gerencia as taxas de comissão por indicação
 */

import { useState, useEffect } from 'react';
import { 
  Percent, 
  Save, 
  Loader2,
  Info,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CommissionConfig {
  defaultRate: number;
  influencerRate: number;
  partnerRate: number;
}

export function CommissionsConfigTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<CommissionConfig>({
    defaultRate: 10,
    influencerRate: 15,
    partnerRate: 20,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      // Buscar configuração existente
      const { data } = await supabase
        .from('admin_settings')
        .select('settings')
        .eq('setting_type', 'commission_rates')
        .maybeSingle();

      if (data?.settings) {
        const settings = data.settings as { defaultRate?: number; influencerRate?: number; partnerRate?: number };
        setConfig({
          defaultRate: settings.defaultRate ?? 10,
          influencerRate: settings.influencerRate ?? 15,
          partnerRate: settings.partnerRate ?? 20,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_type', 'commission_rates')
        .maybeSingle();

      const settingsJson = {
        defaultRate: config.defaultRate,
        influencerRate: config.influencerRate,
        partnerRate: config.partnerRate,
      };

      if (existing) {
        // Update
        const { error: updateError } = await supabase
          .from('admin_settings')
          .update({
            settings: settingsJson,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('admin_settings')
          .insert([{
            setting_type: 'commission_rates',
            settings: settingsJson,
          }]);
        if (insertError) throw insertError;
      }

      toast.success('Configurações salvas!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Percent className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Configurar Comissões</h2>
          <p className="text-sm text-white/50">Defina as taxas de comissão por tipo de usuário</p>
        </div>
      </div>

      {/* Info */}
      <Card className="bg-blue-500/10 border-blue-500/20" style={{ borderRadius: '14px' }}>
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Como funciona:</p>
            <p className="text-blue-300/80">
              A comissão é calculada automaticamente sobre o valor de cada assinatura convertida através 
              do link de indicação do usuário. O percentual varia conforme o tipo de usuário.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <div className="grid gap-4">
        {/* Taxa Padrão */}
        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-white">Clientes Normais</h3>
                <p className="text-sm text-white/50">Taxa para clientes que pagaram assinatura</p>
              </div>
              <TrendingUp className="w-5 h-5 text-white/30" />
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={config.defaultRate}
                onChange={(e) => setConfig(prev => ({ ...prev, defaultRate: parseFloat(e.target.value) || 0 }))}
                className="w-32 bg-white/5 border-white/10 text-white text-center text-lg font-bold"
                style={{ borderRadius: '10px' }}
              />
              <span className="text-white/50 text-lg">%</span>
              <span className="text-sm text-white/40">por indicação convertida</span>
            </div>
          </CardContent>
        </Card>

        {/* Taxa Influencer */}
        <Card className="bg-purple-500/5 border-purple-500/20" style={{ borderRadius: '14px' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-white">Influencers</h3>
                <p className="text-sm text-white/50">Taxa para usuários do tipo Influencer</p>
              </div>
              <div className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-medium">
                INFLUENCER
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={config.influencerRate}
                onChange={(e) => setConfig(prev => ({ ...prev, influencerRate: parseFloat(e.target.value) || 0 }))}
                className="w-32 bg-white/5 border-white/10 text-white text-center text-lg font-bold"
                style={{ borderRadius: '10px' }}
              />
              <span className="text-white/50 text-lg">%</span>
              <span className="text-sm text-white/40">por indicação convertida</span>
            </div>
          </CardContent>
        </Card>

        {/* Taxa Parceiro */}
        <Card className="bg-emerald-500/5 border-emerald-500/20" style={{ borderRadius: '14px' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-white">Parceiros</h3>
                <p className="text-sm text-white/50">Taxa para usuários do tipo Parceiro</p>
              </div>
              <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                PARCEIRO
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={config.partnerRate}
                onChange={(e) => setConfig(prev => ({ ...prev, partnerRate: parseFloat(e.target.value) || 0 }))}
                className="w-32 bg-white/5 border-white/10 text-white text-center text-lg font-bold"
                style={{ borderRadius: '10px' }}
              />
              <span className="text-white/50 text-lg">%</span>
              <span className="text-sm text-white/40">por indicação convertida</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Salvar */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full gap-2"
        style={{ borderRadius: '10px' }}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {isSaving ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  );
}
