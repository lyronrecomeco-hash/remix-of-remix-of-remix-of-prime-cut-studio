import { useState, useEffect } from 'react';
import { Save, Loader2, Palette, Type, Layout, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SiteCustomization {
  header: {
    title: string;
    subtitle: string;
  };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    ctaText: string;
    ctaSecondaryText: string;
  };
  pricing: {
    title: string;
    subtitle: string;
  };
  footer: {
    description: string;
    copyright: string;
  };
}

const DEFAULT_CUSTOMIZATION: SiteCustomization = {
  header: {
    title: 'Genesis Hub',
    subtitle: '',
  },
  hero: {
    badge: '🚀 Plataforma #1 em Automação Inteligente',
    title: 'Transforme seu negócio com',
    highlight: 'Inteligência Artificial',
    subtitle: 'A plataforma mais completa para automação de atendimento, geração de leads e gestão inteligente do seu negócio.',
    ctaText: 'Começar Agora',
    ctaSecondaryText: 'Ver Demonstração',
  },
  pricing: {
    title: 'Planos e Preços',
    subtitle: 'Escolha o plano ideal para o seu negócio',
  },
  footer: {
    description: 'A plataforma mais completa para automação e gestão inteligente do seu negócio.',
    copyright: '© 2025 Genesis Hub. Todos os direitos reservados.',
  },
};

export function SiteCustomizationSection() {
  const [customization, setCustomization] = useState<SiteCustomization>(DEFAULT_CUSTOMIZATION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomization();
  }, []);

  const loadCustomization = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('settings')
        .eq('setting_type', 'site_customization')
        .is('user_id', null)
        .maybeSingle();

      if (data?.settings) {
        setCustomization({ ...DEFAULT_CUSTOMIZATION, ...(data.settings as Partial<SiteCustomization>) });
      }
    } catch (error) {
      console.error('Error loading site customization:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomization = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_type', 'site_customization')
        .is('user_id', null)
        .maybeSingle();

      const payload = JSON.parse(JSON.stringify(customization));

      if (existing) {
        const { error } = await supabase
          .from('admin_settings')
          .update({ settings: payload, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_settings')
          .insert([{ setting_type: 'site_customization', settings: payload }]);
        if (error) throw error;
      }

      toast.success('Site atualizado com sucesso! As alterações já estão visíveis.');
    } catch (error) {
      console.error('Error saving site customization:', error);
      toast.error('Erro ao salvar personalização');
    } finally {
      setSaving(false);
    }
  };

  const update = (section: keyof SiteCustomization, field: string, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Palette className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Personalização do Site</h3>
            <p className="text-xs text-white/50">Edite textos do site comercial. Salve para aplicar globalmente.</p>
          </div>
        </div>
        <Button onClick={saveCustomization} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Site
        </Button>
      </div>

      {/* Header Section */}
      <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Layout className="w-4 h-4 text-blue-400" />
            <h4 className="font-medium text-white text-sm">Cabeçalho</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Título do Site</Label>
              <Input
                value={customization.header.title}
                onChange={(e) => update('header', 'title', e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Subtítulo (opcional)</Label>
              <Input
                value={customization.header.subtitle}
                onChange={(e) => update('header', 'subtitle', e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Section */}
      <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Type className="w-4 h-4 text-emerald-400" />
            <h4 className="font-medium text-white text-sm">Hero (Seção Principal)</h4>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Badge</Label>
              <Input
                value={customization.hero.badge}
                onChange={(e) => update('hero', 'badge', e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Título</Label>
                <Input
                  value={customization.hero.title}
                  onChange={(e) => update('hero', 'title', e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Destaque (cor diferente)</Label>
                <Input
                  value={customization.hero.highlight}
                  onChange={(e) => update('hero', 'highlight', e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Subtítulo</Label>
              <Textarea
                value={customization.hero.subtitle}
                onChange={(e) => update('hero', 'subtitle', e.target.value)}
                className="bg-white/5 border-white/10 min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Botão Principal</Label>
                <Input
                  value={customization.hero.ctaText}
                  onChange={(e) => update('hero', 'ctaText', e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/60">Botão Secundário</Label>
                <Input
                  value={customization.hero.ctaSecondaryText}
                  onChange={(e) => update('hero', 'ctaSecondaryText', e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Section */}
      <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Image className="w-4 h-4 text-amber-400" />
            <h4 className="font-medium text-white text-sm">Seção de Planos</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Título</Label>
              <Input
                value={customization.pricing.title}
                onChange={(e) => update('pricing', 'title', e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Subtítulo</Label>
              <Input
                value={customization.pricing.subtitle}
                onChange={(e) => update('pricing', 'subtitle', e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Layout className="w-4 h-4 text-rose-400" />
            <h4 className="font-medium text-white text-sm">Rodapé</h4>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Descrição</Label>
              <Textarea
                value={customization.footer.description}
                onChange={(e) => update('footer', 'description', e.target.value)}
                className="bg-white/5 border-white/10 min-h-[60px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/60">Copyright</Label>
              <Input
                value={customization.footer.copyright}
                onChange={(e) => update('footer', 'copyright', e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
