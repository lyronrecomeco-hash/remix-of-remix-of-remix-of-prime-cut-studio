import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Palette, 
  Building2, 
  Phone, 
  MapPin,
  Globe,
  Clock,
  Settings2,
  Calendar,
  Star,
  Users,
  ImageIcon,
  MessageCircle,
  Instagram,
  Facebook,
  Sparkles,
  Check,
  X,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TemplateInfo } from './CriarProjetosSelector';
import { ProjectConfig } from './CriarProjetosManager';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface CriarProjetosCustomizerProps {
  template: TemplateInfo;
  editingConfig: ProjectConfig | null;
  affiliateId: string;
  onBack: () => void;
  onSaved: () => void;
}

interface TemplateConfigData {
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
    showScheduling: boolean;
    showTestimonials: boolean;
    showContact: boolean;
  };
  social: {
    instagram: string;
    facebook: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

const defaultConfig: TemplateConfigData = {
  business: {
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    slogan: '',
  },
  branding: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#60a5fa',
    logoUrl: null,
  },
  features: {
    showPricing: true,
    showTeam: true,
    showGallery: true,
    showScheduling: true,
    showTestimonials: true,
    showContact: true,
  },
  social: {
    instagram: '',
    facebook: '',
  },
  hours: {
    weekdays: '08:00 - 18:00',
    saturday: '09:00 - 14:00',
    sunday: 'Fechado',
  },
};

type Section = 'info' | 'branding' | 'features' | 'social' | 'link';

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'info', label: 'Informações', icon: Building2 },
  { id: 'branding', label: 'Visual', icon: Palette },
  { id: 'features', label: 'Recursos', icon: Settings2 },
  { id: 'social', label: 'Redes & Horários', icon: Clock },
  { id: 'link', label: 'Publicar', icon: Globe },
];

export function CriarProjetosCustomizer({
  template,
  editingConfig,
  affiliateId,
  onBack,
  onSaved,
}: CriarProjetosCustomizerProps) {
  const [saving, setSaving] = useState(false);
  const [clientName, setClientName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [config, setConfig] = useState<TemplateConfigData>(defaultConfig);
  const [activeSection, setActiveSection] = useState<Section>('info');

  useEffect(() => {
    if (editingConfig) {
      setClientName(editingConfig.client_name || '');
      setCustomSlug(editingConfig.custom_slug || '');
      const savedConfig = editingConfig.config as unknown as TemplateConfigData;
      if (savedConfig && typeof savedConfig === 'object') {
        setConfig({
          ...defaultConfig,
          ...savedConfig,
          business: { ...defaultConfig.business, ...savedConfig.business },
          branding: { ...defaultConfig.branding, ...savedConfig.branding },
          features: { ...defaultConfig.features, ...savedConfig.features },
          social: { ...defaultConfig.social, ...savedConfig.social },
          hours: { ...defaultConfig.hours, ...savedConfig.hours },
        });
      }
    }
  }, [editingConfig]);

  const generateUniqueCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSave = async () => {
    if (customSlug) {
      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(customSlug)) {
        toast.error('Rota inválida', {
          description: 'Use apenas letras minúsculas, números e hífens'
        });
        return;
      }

      const { data: existing } = await supabase
        .from('affiliate_template_configs')
        .select('id')
        .eq('custom_slug', customSlug)
        .neq('id', editingConfig?.id || '')
        .maybeSingle();

      if (existing) {
        toast.error('Rota já em uso', {
          description: 'Escolha outra rota personalizada'
        });
        return;
      }
    }

    setSaving(true);

    try {
      if (editingConfig) {
        const { error } = await supabase
          .from('affiliate_template_configs')
          .update({
            client_name: clientName || null,
            custom_slug: customSlug || null,
            config: JSON.parse(JSON.stringify(config)),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast.success('Projeto atualizado!');
      } else {
        const uniqueCode = generateUniqueCode();
        const { error } = await supabase
          .from('affiliate_template_configs')
          .insert([{
            affiliate_id: affiliateId,
            template_slug: template.id,
            template_name: template.name,
            unique_code: uniqueCode,
            custom_slug: customSlug || null,
            client_name: clientName || null,
            config: JSON.parse(JSON.stringify(config)),
            is_active: true
          }]);

        if (error) throw error;
        toast.success('Projeto criado!', {
          description: `Acesse: /p/${customSlug || uniqueCode}`
        });
      }

      onSaved();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar projeto');
    }

    setSaving(false);
  };

  const updateBusiness = (field: keyof typeof config.business, value: string) => {
    setConfig(prev => ({
      ...prev,
      business: { ...prev.business, [field]: value }
    }));
  };

  const updateBranding = (field: keyof typeof config.branding, value: string | null) => {
    setConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: value }
    }));
  };

  const updateFeature = (field: keyof typeof config.features, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: { ...prev.features, [field]: value }
    }));
  };

  const updateSocial = (field: keyof typeof config.social, value: string) => {
    setConfig(prev => ({
      ...prev,
      social: { ...prev.social, [field]: value }
    }));
  };

  const updateHours = (field: keyof typeof config.hours, value: string) => {
    setConfig(prev => ({
      ...prev,
      hours: { ...prev.hours, [field]: value }
    }));
  };

  const featuresList = [
    { key: 'showScheduling' as const, label: 'Agendamento Online', icon: Calendar, description: 'Permitir agendamentos' },
    { key: 'showPricing' as const, label: 'Tabela de Preços', icon: Star, description: 'Serviços e valores' },
    { key: 'showTeam' as const, label: 'Equipe', icon: Users, description: 'Membros da equipe' },
    { key: 'showGallery' as const, label: 'Galeria', icon: ImageIcon, description: 'Fotos e trabalhos' },
    { key: 'showTestimonials' as const, label: 'Depoimentos', icon: MessageCircle, description: 'Avaliações de clientes' },
    { key: 'showContact' as const, label: 'Contato', icon: Phone, description: 'Formulário de contato' },
  ];

  const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 sm:h-9 sm:w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {editingConfig ? 'Editar' : 'Criar'} Projeto
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{template.name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Salvar</span>
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
          Etapa {currentSectionIndex + 1} de {sections.length}
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isCompleted = index < currentSectionIndex;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : isCompleted 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {isCompleted && !isActive ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="pb-6"
          >
            {/* Informações */}
            {activeSection === 'info' && (
              <div className="space-y-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Dados do Negócio
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs">Nome do Negócio *</Label>
                        <Input
                          placeholder="Ex: Pet Shop Amigo Fiel"
                          value={config.business.name}
                          onChange={(e) => updateBusiness('name', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs">Slogan</Label>
                        <Input
                          placeholder="Ex: Cuidando com amor desde 2010"
                          value={config.business.slogan}
                          onChange={(e) => updateBusiness('slogan', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Telefone</Label>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={config.business.phone}
                          onChange={(e) => updateBusiness('phone', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">WhatsApp</Label>
                        <Input
                          placeholder="5511999999999"
                          value={config.business.whatsapp}
                          onChange={(e) => updateBusiness('whatsapp', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs">Endereço</Label>
                        <Input
                          placeholder="Rua, número - Bairro, Cidade"
                          value={config.business.address}
                          onChange={(e) => updateBusiness('address', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Branding */}
            {activeSection === 'branding' && (
              <div className="space-y-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      Cores do Site
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Cor Principal</Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-12 h-10 sm:h-11 rounded-lg border cursor-pointer"
                            style={{ backgroundColor: config.branding.primaryColor }}
                          >
                            <input
                              type="color"
                              value={config.branding.primaryColor}
                              onChange={(e) => updateBranding('primaryColor', e.target.value)}
                              className="w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <Input
                            value={config.branding.primaryColor}
                            onChange={(e) => updateBranding('primaryColor', e.target.value)}
                            className="flex-1 font-mono text-xs h-10 sm:h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Cor Secundária</Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-12 h-10 sm:h-11 rounded-lg border cursor-pointer"
                            style={{ backgroundColor: config.branding.secondaryColor }}
                          >
                            <input
                              type="color"
                              value={config.branding.secondaryColor}
                              onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                              className="w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <Input
                            value={config.branding.secondaryColor}
                            onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                            className="flex-1 font-mono text-xs h-10 sm:h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Cor de Destaque</Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-12 h-10 sm:h-11 rounded-lg border cursor-pointer"
                            style={{ backgroundColor: config.branding.accentColor }}
                          >
                            <input
                              type="color"
                              value={config.branding.accentColor}
                              onChange={(e) => updateBranding('accentColor', e.target.value)}
                              className="w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <Input
                            value={config.branding.accentColor}
                            onChange={(e) => updateBranding('accentColor', e.target.value)}
                            className="flex-1 font-mono text-xs h-10 sm:h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-6 p-4 rounded-xl border bg-background">
                      <p className="text-xs text-muted-foreground mb-3">Preview das cores</p>
                      <div className="flex gap-3">
                        <div 
                          className="flex-1 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: config.branding.primaryColor }}
                        >
                          Principal
                        </div>
                        <div 
                          className="flex-1 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: config.branding.secondaryColor }}
                        >
                          Secundária
                        </div>
                        <div 
                          className="flex-1 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: config.branding.accentColor }}
                        >
                          Destaque
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Features */}
            {activeSection === 'features' && (
              <div className="space-y-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-primary" />
                      Recursos do Site
                    </h3>
                    <div className="grid gap-3">
                      {featuresList.map((feature) => {
                        const Icon = feature.icon;
                        const isEnabled = config.features[feature.key];
                        
                        return (
                          <div 
                            key={feature.key}
                            className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all ${
                              isEnabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                                isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                              }`}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{feature.label}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">{feature.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) => updateFeature(feature.key, checked)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Social & Hours */}
            {activeSection === 'social' && (
              <div className="space-y-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Redes Sociais
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-2">
                          <Instagram className="w-3.5 h-3.5" /> Instagram
                        </Label>
                        <Input
                          placeholder="@usuario"
                          value={config.social.instagram}
                          onChange={(e) => updateSocial('instagram', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-2">
                          <Facebook className="w-3.5 h-3.5" /> Facebook
                        </Label>
                        <Input
                          placeholder="facebook.com/pagina"
                          value={config.social.facebook}
                          onChange={(e) => updateSocial('facebook', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Horário de Funcionamento
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Seg - Sex</Label>
                        <Input
                          placeholder="08:00 - 18:00"
                          value={config.hours.weekdays}
                          onChange={(e) => updateHours('weekdays', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Sábado</Label>
                        <Input
                          placeholder="09:00 - 14:00"
                          value={config.hours.saturday}
                          onChange={(e) => updateHours('saturday', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Domingo</Label>
                        <Input
                          placeholder="Fechado"
                          value={config.hours.sunday}
                          onChange={(e) => updateHours('sunday', e.target.value)}
                          className="h-10 sm:h-11"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Link / Publish */}
            {activeSection === 'link' && (
              <div className="space-y-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Publicação
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Nome do Cliente (opcional)</Label>
                        <Input
                          placeholder="Ex: Pet Shop do João"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="h-10 sm:h-11"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Este nome aparecerá na sua lista de projetos
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">URL Personalizada (opcional)</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">/p/</span>
                          <Input
                            placeholder="minha-empresa"
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="h-10 sm:h-11 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Use apenas letras minúsculas, números e hífens
                        </p>
                      </div>

                      {/* Preview URL */}
                      <div className="p-4 rounded-xl bg-muted/50 border">
                        <p className="text-xs text-muted-foreground mb-2">URL do seu projeto:</p>
                        <p className="text-sm font-mono text-primary break-all">
                          /p/{customSlug || '[código-automático]'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="w-full h-12 sm:h-14 text-base gap-2"
                  size="lg"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {editingConfig ? 'Atualizar Projeto' : 'Criar Projeto'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-4 pt-4 border-t">
        {currentSectionIndex > 0 && (
          <Button 
            variant="outline" 
            onClick={() => setActiveSection(sections[currentSectionIndex - 1].id)}
            className="flex-1"
          >
            Anterior
          </Button>
        )}
        {currentSectionIndex < sections.length - 1 && (
          <Button 
            onClick={() => setActiveSection(sections[currentSectionIndex + 1].id)}
            className="flex-1 gap-2"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
