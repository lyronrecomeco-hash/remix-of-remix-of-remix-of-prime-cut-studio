import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Palette, Upload, Save, Loader2, Image, Building2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface BrandingData {
  logo_url: string;
  logo_dark_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  company_name: string;
  custom_domain: string;
  custom_css: string;
}

const defaultBranding: BrandingData = {
  logo_url: '',
  logo_dark_url: '',
  favicon_url: '',
  primary_color: '#6366f1',
  secondary_color: '#22c55e',
  company_name: '',
  custom_domain: '',
  custom_css: '',
};

export function BrandingSettings() {
  const { genesisUser } = useGenesisAuth();
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (genesisUser) fetchBranding();
  }, [genesisUser]);

  const fetchBranding = async () => {
    if (!genesisUser) return;

    const { data, error } = await supabase
      .from('genesis_branding')
      .select('*')
      .eq('user_id', genesisUser.id)
      .maybeSingle();

    if (data) {
      setBranding({
        logo_url: data.logo_url || '',
        logo_dark_url: data.logo_dark_url || '',
        favicon_url: data.favicon_url || '',
        primary_color: data.primary_color || '#6366f1',
        secondary_color: data.secondary_color || '#22c55e',
        company_name: data.company_name || '',
        custom_domain: data.custom_domain || '',
        custom_css: data.custom_css || '',
      });
    }
    setLoading(false);
  };

  const updateBranding = <K extends keyof BrandingData>(key: K, value: BrandingData[K]) => {
    setBranding(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveBranding = async () => {
    if (!genesisUser) return;
    setSaving(true);

    const { error } = await supabase
      .from('genesis_branding')
      .upsert({
        user_id: genesisUser.id,
        ...branding,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Erro ao salvar personalização');
    } else {
      toast.success('Personalização salva!');
      setHasChanges(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Palette className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Personalização</h2>
            <p className="text-sm text-muted-foreground">Logo, cores e identidade visual</p>
          </div>
        </div>
        {hasChanges && (
          <Button onClick={saveBranding} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar
          </Button>
        )}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-primary" />
              Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input
                value={branding.company_name}
                onChange={(e) => updateBranding('company_name', e.target.value)}
                placeholder="Minha Empresa"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Domínio Personalizado
              </Label>
              <Input
                value={branding.custom_domain}
                onChange={(e) => updateBranding('custom_domain', e.target.value)}
                placeholder="chat.minhaempresa.com"
              />
              <p className="text-xs text-muted-foreground">
                Requer configuração DNS (entre em contato)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5 text-primary" />
              Cores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => updateBranding('primary_color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={branding.primary_color}
                    onChange={(e) => updateBranding('primary_color', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Secundária</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={branding.secondary_color}
                    onChange={(e) => updateBranding('secondary_color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={branding.secondary_color}
                    onChange={(e) => updateBranding('secondary_color', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <div className="flex gap-2">
                <div 
                  className="w-16 h-8 rounded"
                  style={{ backgroundColor: branding.primary_color }}
                />
                <div 
                  className="w-16 h-8 rounded"
                  style={{ backgroundColor: branding.secondary_color }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logos */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="w-5 h-5 text-primary" />
              Logotipos
            </CardTitle>
            <CardDescription>URLs dos seus logos (recomendado: PNG transparente)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Logo (Modo Claro)</Label>
                <Input
                  value={branding.logo_url}
                  onChange={(e) => updateBranding('logo_url', e.target.value)}
                  placeholder="https://..."
                />
                {branding.logo_url && (
                  <div className="p-4 bg-white rounded border">
                    <img src={branding.logo_url} alt="Logo" className="max-h-12 object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Logo (Modo Escuro)</Label>
                <Input
                  value={branding.logo_dark_url}
                  onChange={(e) => updateBranding('logo_dark_url', e.target.value)}
                  placeholder="https://..."
                />
                {branding.logo_dark_url && (
                  <div className="p-4 bg-zinc-900 rounded border">
                    <img src={branding.logo_dark_url} alt="Logo Dark" className="max-h-12 object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Favicon</Label>
                <Input
                  value={branding.favicon_url}
                  onChange={(e) => updateBranding('favicon_url', e.target.value)}
                  placeholder="https://..."
                />
                {branding.favicon_url && (
                  <div className="p-4 bg-muted rounded border flex items-center gap-2">
                    <img src={branding.favicon_url} alt="Favicon" className="w-8 h-8 object-contain" />
                    <span className="text-sm text-muted-foreground">32x32px</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSS Personalizado */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">CSS Personalizado</CardTitle>
            <CardDescription>Estilos avançados (para desenvolvedores)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={branding.custom_css}
              onChange={(e) => updateBranding('custom_css', e.target.value)}
              placeholder=".my-class { ... }"
              className="font-mono text-sm min-h-[120px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
