import { useState, useEffect } from 'react';
import { Save, Loader2, Palette, Type, Layout, Radar, Sparkles, HelpCircle, DollarSign, Handshake, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SiteCustomization, DEFAULT_CUSTOMIZATION } from '@/types/siteCustomization';

// Re-export for backward compat
export type { SiteCustomization };

function Section({ icon: Icon, iconColor, title, children, defaultOpen = false }: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <h4 className="font-medium text-white text-sm">{title}</h4>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      {open && <CardContent className="px-5 pb-5 pt-0 space-y-4">{children}</CardContent>}
    </Card>
  );
}

function Field({ label, value, onChange, multiline = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-white/60">{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={e => onChange(e.target.value)} className="bg-white/5 border-white/10 min-h-[60px]" />
      ) : (
        <Input value={value} onChange={e => onChange(e.target.value)} className="bg-white/5 border-white/10" />
      )}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

export function SiteCustomizationSection() {
  const [c, setC] = useState<SiteCustomization>(DEFAULT_CUSTOMIZATION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('settings')
          .eq('setting_type', 'site_customization')
          .is('user_id', null)
          .maybeSingle();
        if (data?.settings) {
          const merged = JSON.parse(JSON.stringify(DEFAULT_CUSTOMIZATION));
          const saved = data.settings as any;
          for (const section in saved) {
            if (merged[section]) {
              for (const field in saved[section]) {
                if (merged[section][field] !== undefined) {
                  merged[section][field] = saved[section][field];
                }
              }
            }
          }
          setC(merged);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const u = (section: keyof SiteCustomization, field: string, value: string) => {
    setC(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = JSON.parse(JSON.stringify(c));
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_type', 'site_customization')
        .is('user_id', null)
        .maybeSingle();

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
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar personalização');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Palette className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Personalização do Site</h3>
            <p className="text-xs text-white/50">Edite todos os textos do site comercial.</p>
          </div>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Site
        </Button>
      </div>

      {/* Header */}
      <Section icon={Layout} iconColor="text-blue-400" title="Cabeçalho" defaultOpen>
        <Row>
          <Field label="Nome da Marca" value={c.header.brandName} onChange={v => u('header', 'brandName', v)} />
          <Field label="Links de Navegação (separados por vírgula)" value={c.header.navLinks} onChange={v => u('header', 'navLinks', v)} />
        </Row>
      </Section>

      {/* Hero */}
      <Section icon={Type} iconColor="text-emerald-400" title="Hero (Seção Principal)">
        <Field label="Badge" value={c.hero.badge} onChange={v => u('hero', 'badge', v)} />
        <Row>
          <Field label="Título" value={c.hero.title} onChange={v => u('hero', 'title', v)} />
          <Field label="Texto Animado (destaque)" value={c.hero.highlight} onChange={v => u('hero', 'highlight', v)} />
        </Row>
        <Field label="Subtítulo" value={c.hero.subtitle} onChange={v => u('hero', 'subtitle', v)} multiline />
        <Row>
          <Field label="Botão Principal" value={c.hero.ctaText} onChange={v => u('hero', 'ctaText', v)} />
          <Field label="Botão Secundário" value={c.hero.ctaSecondaryText} onChange={v => u('hero', 'ctaSecondaryText', v)} />
        </Row>
        <Field label="Pontos de Confiança (separados por vírgula)" value={c.hero.trustPoints} onChange={v => u('hero', 'trustPoints', v)} />
      </Section>

      {/* Resources */}
      <Section icon={Sparkles} iconColor="text-cyan-400" title="Seção Recursos">
        <Row>
          <Field label="Badge" value={c.resources.badge} onChange={v => u('resources', 'badge', v)} />
          <Field label="Badge Inferior" value={c.resources.bottomBadge} onChange={v => u('resources', 'bottomBadge', v)} />
        </Row>
        <Row>
          <Field label="Título" value={c.resources.title} onChange={v => u('resources', 'title', v)} />
          <Field label="Destaque" value={c.resources.highlight} onChange={v => u('resources', 'highlight', v)} />
        </Row>
        <div className="border-t border-white/10 pt-4 space-y-3">
          <p className="text-xs text-white/40 font-medium">Card 1</p>
          <Row>
            <Field label="Título" value={c.resources.card1Title} onChange={v => u('resources', 'card1Title', v)} />
            <Field label="Descrição" value={c.resources.card1Description} onChange={v => u('resources', 'card1Description', v)} />
          </Row>
          <p className="text-xs text-white/40 font-medium">Card 2</p>
          <Row>
            <Field label="Título" value={c.resources.card2Title} onChange={v => u('resources', 'card2Title', v)} />
            <Field label="Descrição" value={c.resources.card2Description} onChange={v => u('resources', 'card2Description', v)} />
          </Row>
          <p className="text-xs text-white/40 font-medium">Card 3</p>
          <Row>
            <Field label="Título" value={c.resources.card3Title} onChange={v => u('resources', 'card3Title', v)} />
            <Field label="Descrição" value={c.resources.card3Description} onChange={v => u('resources', 'card3Description', v)} />
          </Row>
        </div>
      </Section>

      {/* Radar */}
      <Section icon={Radar} iconColor="text-amber-400" title="Seção Radar (Oportunidades)">
        <Field label="Badge" value={c.radar.badge} onChange={v => u('radar', 'badge', v)} />
        <Row>
          <Field label="Título" value={c.radar.title} onChange={v => u('radar', 'title', v)} />
          <Field label="Destaque" value={c.radar.highlight} onChange={v => u('radar', 'highlight', v)} />
        </Row>
        <Field label="Subtítulo" value={c.radar.subtitle} onChange={v => u('radar', 'subtitle', v)} multiline />
        <Field label="Texto do Botão CTA" value={c.radar.ctaText} onChange={v => u('radar', 'ctaText', v)} />
      </Section>

      {/* Features (Como Funciona) */}
      <Section icon={Sparkles} iconColor="text-violet-400" title="Como Funciona (Steps)">
        <Row>
          <Field label="Badge" value={c.features.badge} onChange={v => u('features', 'badge', v)} />
          <Field label="Destaque" value={c.features.highlight} onChange={v => u('features', 'highlight', v)} />
        </Row>
        <Field label="Título" value={c.features.title} onChange={v => u('features', 'title', v)} />
        <Field label="Subtítulo" value={c.features.subtitle} onChange={v => u('features', 'subtitle', v)} multiline />
        <div className="border-t border-white/10 pt-4 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <p className="text-xs text-white/40 font-medium">Passo {i}</p>
              <Row>
                <Field label="Título" value={(c.features as any)[`step${i}Title`]} onChange={v => u('features', `step${i}Title`, v)} />
                <Field label="Descrição" value={(c.features as any)[`step${i}Description`]} onChange={v => u('features', `step${i}Description`, v)} />
              </Row>
            </div>
          ))}
        </div>
      </Section>

      {/* Why Choose */}
      <Section icon={Sparkles} iconColor="text-pink-400" title="Diferenciais (Por que escolher)">
        <Field label="Badge" value={c.whyChoose.badge} onChange={v => u('whyChoose', 'badge', v)} />
        <Row>
          <Field label="Título" value={c.whyChoose.title} onChange={v => u('whyChoose', 'title', v)} />
          <Field label="Destaque" value={c.whyChoose.highlight} onChange={v => u('whyChoose', 'highlight', v)} />
        </Row>
        <Field label="Subtítulo" value={c.whyChoose.subtitle} onChange={v => u('whyChoose', 'subtitle', v)} multiline />
      </Section>

      {/* Partnerships */}
      <Section icon={Handshake} iconColor="text-orange-400" title="Parcerias">
        <Field label="Badge" value={c.partnerships.badge} onChange={v => u('partnerships', 'badge', v)} />
        <Row>
          <Field label="Título" value={c.partnerships.title} onChange={v => u('partnerships', 'title', v)} />
          <Field label="Destaque" value={c.partnerships.highlight} onChange={v => u('partnerships', 'highlight', v)} />
        </Row>
        <Field label="Subtítulo" value={c.partnerships.subtitle} onChange={v => u('partnerships', 'subtitle', v)} multiline />
      </Section>

      {/* Pricing */}
      <Section icon={DollarSign} iconColor="text-green-400" title="Seção de Planos">
        <Row>
          <Field label="Título" value={c.pricing.title} onChange={v => u('pricing', 'title', v)} />
          <Field label="Subtítulo" value={c.pricing.subtitle} onChange={v => u('pricing', 'subtitle', v)} />
        </Row>
        <Field label="Itens de Confiança (separados por vírgula)" value={c.pricing.trustItems} onChange={v => u('pricing', 'trustItems', v)} />
      </Section>

      {/* FAQ */}
      <Section icon={HelpCircle} iconColor="text-teal-400" title="FAQ">
        <Row>
          <Field label="Badge" value={c.faq.badge} onChange={v => u('faq', 'badge', v)} />
          <Field label="Destaque" value={c.faq.highlight} onChange={v => u('faq', 'highlight', v)} />
        </Row>
        <Field label="Título" value={c.faq.title} onChange={v => u('faq', 'title', v)} />
        <Field label="Subtítulo" value={c.faq.subtitle} onChange={v => u('faq', 'subtitle', v)} multiline />
        <div className="border-t border-white/10 pt-4 space-y-3">
          <p className="text-xs text-white/40 font-medium">CTA Final</p>
          <Row>
            <Field label="Título CTA" value={c.faq.ctaTitle} onChange={v => u('faq', 'ctaTitle', v)} />
            <Field label="Subtítulo CTA" value={c.faq.ctaSubtitle} onChange={v => u('faq', 'ctaSubtitle', v)} />
          </Row>
          <Row>
            <Field label="Texto do Botão" value={c.faq.ctaButtonText} onChange={v => u('faq', 'ctaButtonText', v)} />
            <Field label="WhatsApp (com DDI)" value={c.faq.ctaWhatsapp} onChange={v => u('faq', 'ctaWhatsapp', v)} />
          </Row>
        </div>
      </Section>

      {/* Footer */}
      <Section icon={Layout} iconColor="text-rose-400" title="Rodapé">
        <Row>
          <Field label="Nome da Marca" value={c.footer.brandName} onChange={v => u('footer', 'brandName', v)} />
          <Field label="Copyright" value={c.footer.copyright} onChange={v => u('footer', 'copyright', v)} />
        </Row>
      </Section>
    </div>
  );
}
