import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Image,
  Settings2,
  Check,
  Calendar,
  Star,
  Users,
  ImageIcon,
  MessageCircle,
  Instagram,
  Facebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TemplateInfo } from './CriarProjetosSelector';
import { ProjectConfig } from './CriarProjetosManager';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    // Validate custom slug
    if (customSlug) {
      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(customSlug)) {
        toast.error('Rota inválida', {
          description: 'Use apenas letras minúsculas, números e hífens'
        });
        return;
      }

      // Check if slug is unique
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
        // Update existing
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
        // Create new
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
          description: `Link: /p/${customSlug || uniqueCode}`
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
    { key: 'showScheduling' as const, label: 'Agendamento Online', icon: Calendar, description: 'Permitir agendamentos pelo site' },
    { key: 'showPricing' as const, label: 'Tabela de Preços', icon: Star, description: 'Mostrar serviços e valores' },
    { key: 'showTeam' as const, label: 'Equipe', icon: Users, description: 'Exibir membros da equipe' },
    { key: 'showGallery' as const, label: 'Galeria', icon: ImageIcon, description: 'Galeria de fotos e trabalhos' },
    { key: 'showTestimonials' as const, label: 'Depoimentos', icon: MessageCircle, description: 'Avaliações de clientes' },
    { key: 'showContact' as const, label: 'Contato', icon: Phone, description: 'Formulário de contato' },
  ];

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {editingConfig ? 'Editar Projeto' : 'Personalizar Template'}
            </h1>
            <p className="text-xs text-muted-foreground">{template.name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="info" className="text-xs sm:text-sm">
              <Building2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Informações</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs sm:text-sm">
              <Palette className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Visual</span>
              <span className="sm:hidden">Cores</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs sm:text-sm">
              <Settings2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Recursos</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="text-xs sm:text-sm">
              <Globe className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Link</span>
              <span className="sm:hidden">URL</span>
            </TabsTrigger>
          </TabsList>

          {/* Informações do Negócio */}
          <TabsContent value="info" className="space-y-4 mt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nome do Negócio</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="businessName"
                    placeholder="Ex: Pet Shop do João"
                    value={config.business.name}
                    onChange={(e) => updateBusiness('name', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan</Label>
                <Input
                  id="slogan"
                  placeholder="Ex: Cuidando com amor"
                  value={config.business.slogan}
                  onChange={(e) => updateBusiness('slogan', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={config.business.phone}
                    onChange={(e) => updateBusiness('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="whatsapp"
                    placeholder="5511999999999"
                    value={config.business.whatsapp}
                    onChange={(e) => updateBusiness('whatsapp', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Rua, número - Bairro, Cidade"
                    value={config.business.address}
                    onChange={(e) => updateBusiness('address', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Horários */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Horário de Funcionamento</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="weekdays">Segunda a Sexta</Label>
                  <Input
                    id="weekdays"
                    placeholder="08:00 - 18:00"
                    value={config.hours.weekdays}
                    onChange={(e) => updateHours('weekdays', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saturday">Sábado</Label>
                  <Input
                    id="saturday"
                    placeholder="09:00 - 14:00"
                    value={config.hours.saturday}
                    onChange={(e) => updateHours('saturday', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sunday">Domingo</Label>
                  <Input
                    id="sunday"
                    placeholder="Fechado"
                    value={config.hours.sunday}
                    onChange={(e) => updateHours('sunday', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Redes Sociais</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="instagram"
                      placeholder="@usuario"
                      value={config.social.instagram}
                      onChange={(e) => updateSocial('instagram', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="facebook"
                      placeholder="facebook.com/pagina"
                      value={config.social.facebook}
                      onChange={(e) => updateSocial('facebook', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Visual / Branding */}
          <TabsContent value="branding" className="space-y-4 mt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={config.branding.primaryColor}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.branding.primaryColor}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={config.branding.secondaryColor}
                    onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.branding.secondaryColor}
                    onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={config.branding.accentColor}
                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.branding.accentColor}
                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL do Logo (opcional)</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="logoUrl"
                    placeholder="https://..."
                    value={config.branding.logoUrl || ''}
                    onChange={(e) => updateBranding('logoUrl', e.target.value || null)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-medium text-foreground mb-4">Preview das Cores</h3>
              <div className="flex gap-4">
                <div 
                  className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: config.branding.primaryColor }}
                >
                  Primária
                </div>
                <div 
                  className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: config.branding.secondaryColor }}
                >
                  Secundária
                </div>
                <div 
                  className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: config.branding.accentColor }}
                >
                  Destaque
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Recursos / Features */}
          <TabsContent value="features" className="space-y-3 mt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Escolha quais seções serão exibidas no site do seu cliente.
            </p>
            {featuresList.map((feature) => {
              const Icon = feature.icon;
              const isEnabled = config.features[feature.key];
              return (
                <motion.div
                  key={feature.key}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isEnabled 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-border bg-card'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isEnabled ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => updateFeature(feature.key, checked)}
                  />
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Link / URL */}
          <TabsContent value="link" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente (para identificação)</Label>
              <Input
                id="clientName"
                placeholder="Ex: João Silva - Pet Shop Centro"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Apenas para sua organização, não aparece no site.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customSlug">Rota Personalizada</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  /p/
                </span>
                <Input
                  id="customSlug"
                  placeholder="minha-rota-personalizada"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="font-mono border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use apenas letras minúsculas, números e hífens. Se deixar vazio, será gerado um código automático.
              </p>
            </div>

            {(customSlug || editingConfig?.unique_code) && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-1">Link do Projeto:</p>
                <code className="text-sm text-primary">
                  /p/{customSlug || editingConfig?.unique_code}
                </code>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
