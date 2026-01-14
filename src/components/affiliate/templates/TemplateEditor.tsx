import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Loader2, Building2, Palette, Globe, Type, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  TemplateConfig, 
  TemplateInfo, 
  DEFAULT_CONFIG, 
  AVAILABLE_LANGUAGES, 
  AVAILABLE_FONTS,
  AffiliateTemplateConfig
} from './types';

interface TemplateEditorProps {
  template: TemplateInfo;
  existingConfig?: AffiliateTemplateConfig;
  onBack: () => void;
  onSave: (clientName: string, config: TemplateConfig) => Promise<AffiliateTemplateConfig | null>;
  onUpdate?: (id: string, updates: { client_name: string; config: TemplateConfig }) => Promise<boolean>;
  saving: boolean;
}

export function TemplateEditor({ 
  template, 
  existingConfig, 
  onBack, 
  onSave, 
  onUpdate,
  saving 
}: TemplateEditorProps) {
  const [clientName, setClientName] = useState(existingConfig?.client_name || '');
  const [config, setConfig] = useState<TemplateConfig>(
    existingConfig?.config || { ...DEFAULT_CONFIG }
  );
  const [savedConfig, setSavedConfig] = useState<AffiliateTemplateConfig | null>(existingConfig || null);

  const updateBusiness = (key: keyof TemplateConfig['business'], value: string) => {
    setConfig(prev => ({
      ...prev,
      business: { ...prev.business, [key]: value }
    }));
  };

  const updateBranding = (key: keyof TemplateConfig['branding'], value: string | null) => {
    setConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, [key]: value }
    }));
  };

  const updateTypography = (key: keyof TemplateConfig['typography'], value: string) => {
    setConfig(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value }
    }));
  };

  const updateFeatures = (key: keyof TemplateConfig['features'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }));
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      return;
    }

    if (existingConfig && onUpdate) {
      const success = await onUpdate(existingConfig.id, { client_name: clientName, config });
      if (success) {
        setSavedConfig({ ...existingConfig, client_name: clientName, config });
      }
    } else {
      const result = await onSave(clientName, config);
      if (result) {
        setSavedConfig(result);
      }
    }
  };

  const handlePreview = () => {
    if (savedConfig) {
      window.open(`/demo/${savedConfig.unique_code}`, '_blank');
    }
  };

  const copyLink = () => {
    if (savedConfig) {
      const link = `${window.location.origin}/demo/${savedConfig.unique_code}`;
      navigator.clipboard.writeText(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {existingConfig ? 'Editar Portfólio' : 'Novo Portfólio'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Template: {template.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedConfig && (
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || !clientName.trim()}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {existingConfig ? 'Atualizar' : 'Salvar e Gerar Link'}
          </Button>
        </div>
      </motion.div>

      {/* Link gerado */}
      {savedConfig && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-primary/10 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Link do Portfólio:</p>
              <p className="text-sm text-muted-foreground font-mono">
                {window.location.origin}/demo/{savedConfig.unique_code}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={copyLink}>
              Copiar Link
            </Button>
          </div>
        </motion.div>
      )}

      {/* Nome do Cliente */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente/Prospect *</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Barbearia do João"
              />
              <p className="text-xs text-muted-foreground">
                Para sua organização interna
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Informações do Negócio */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Informações do Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nome do Estabelecimento</Label>
                <Input
                  id="businessName"
                  value={config.business.name}
                  onChange={(e) => updateBusiness('name', e.target.value)}
                  placeholder="Ex: Barber Studio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan</Label>
                <Input
                  id="slogan"
                  value={config.business.slogan}
                  onChange={(e) => updateBusiness('slogan', e.target.value)}
                  placeholder="Ex: Tradição e Estilo"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={config.business.phone}
                  onChange={(e) => updateBusiness('phone', e.target.value)}
                  placeholder="+55 11 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={config.business.whatsapp}
                  onChange={(e) => updateBusiness('whatsapp', e.target.value)}
                  placeholder="+55 11 99999-9999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={config.business.address}
                onChange={(e) => updateBusiness('address', e.target.value)}
                placeholder="Rua das Flores, 123 - Centro"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Identidade Visual */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              Identidade Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Principal</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={config.branding.primaryColor}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                    className="h-10 w-14 rounded border border-input cursor-pointer"
                  />
                  <Input
                    value={config.branding.primaryColor}
                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={config.branding.secondaryColor}
                    onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                    className="h-10 w-14 rounded border border-input cursor-pointer"
                  />
                  <Input
                    value={config.branding.secondaryColor}
                    onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={config.branding.accentColor}
                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                    className="h-10 w-14 rounded border border-input cursor-pointer"
                  />
                  <Input
                    value={config.branding.accentColor}
                    onChange={(e) => updateBranding('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Idioma e Tipografia */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Idioma & Tipografia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select
                  value={config.language}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fonte dos Títulos</Label>
                <Select
                  value={config.typography.headingFont}
                  onValueChange={(value) => updateTypography('headingFont', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fonte dos Textos</Label>
                <Select
                  value={config.typography.bodyFont}
                  onValueChange={(value) => updateTypography('bodyFont', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Seções Visíveis */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Seções Visíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  id="showPricing"
                  checked={config.features.showPricing}
                  onCheckedChange={(value) => updateFeatures('showPricing', value)}
                />
                <Label htmlFor="showPricing">Mostrar Preços</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="showTeam"
                  checked={config.features.showTeam}
                  onCheckedChange={(value) => updateFeatures('showTeam', value)}
                />
                <Label htmlFor="showTeam">Mostrar Equipe</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="showGallery"
                  checked={config.features.showGallery}
                  onCheckedChange={(value) => updateFeatures('showGallery', value)}
                />
                <Label htmlFor="showGallery">Mostrar Galeria</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
