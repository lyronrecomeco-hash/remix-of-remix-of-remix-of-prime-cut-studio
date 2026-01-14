import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Eye, Loader2, Building2, Palette, Globe, 
  Settings, Copy, Check, ExternalLink, Sparkles,
  Phone, MapPin, MessageCircle, Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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
  const [copied, setCopied] = useState(false);

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
      toast.error('Informe o nome do cliente');
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
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header com Preview do Template */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center shadow-lg`}>
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">
                      {existingConfig ? 'Editar Portfólio' : 'Novo Portfólio'}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {template.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Personalize o template para seu cliente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {savedConfig && (
                  <Button variant="outline" size="sm" onClick={handlePreview} className="gap-2">
                    <Eye className="w-4 h-4" />
                    Visualizar
                  </Button>
                )}
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !clientName.trim()}
                  className="gap-2 min-w-[160px]"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {existingConfig ? 'Salvar Alterações' : 'Gerar Link'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Link gerado - Destaque */}
      {savedConfig && (
        <motion.div
          variants={itemVariants}
        >
          <Card className="border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Link Gerado com Sucesso!</p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
                      {window.location.origin}/demo/{savedConfig.unique_code}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePreview} className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Abrir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identificação */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Identificação</CardTitle>
                  <CardDescription className="text-xs">Para sua organização interna</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-sm font-medium">
                  Nome do Cliente/Prospect <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Barbearia do João"
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Identidade Visual */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Identidade Visual</CardTitle>
                  <CardDescription className="text-xs">Cores da marca do cliente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Principal</Label>
                  <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                    <input
                      type="color"
                      value={config.branding.primaryColor}
                      onChange={(e) => updateBranding('primaryColor', e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-muted-foreground">
                      {config.branding.primaryColor}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Secundária</Label>
                  <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                    <input
                      type="color"
                      value={config.branding.secondaryColor}
                      onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-muted-foreground">
                      {config.branding.secondaryColor}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Destaque</Label>
                  <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                    <input
                      type="color"
                      value={config.branding.accentColor}
                      onChange={(e) => updateBranding('accentColor', e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-muted-foreground">
                      {config.branding.accentColor}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Informações do Negócio */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Informações do Negócio</CardTitle>
                  <CardDescription className="text-xs">Dados que aparecerão no site</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-sm flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    Nome do Estabelecimento
                  </Label>
                  <Input
                    id="businessName"
                    value={config.business.name}
                    onChange={(e) => updateBusiness('name', e.target.value)}
                    placeholder="Ex: Barber Studio"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan" className="text-sm flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                    Slogan
                  </Label>
                  <Input
                    id="slogan"
                    value={config.business.slogan}
                    onChange={(e) => updateBusiness('slogan', e.target.value)}
                    placeholder="Ex: Tradição e Estilo"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={config.business.phone}
                    onChange={(e) => updateBusiness('phone', e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={config.business.whatsapp}
                    onChange={(e) => updateBusiness('whatsapp', e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  Endereço
                </Label>
                <Input
                  id="address"
                  value={config.business.address}
                  onChange={(e) => updateBusiness('address', e.target.value)}
                  placeholder="Rua das Flores, 123 - Centro"
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Idioma e Tipografia */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Type className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Tipografia</CardTitle>
                  <CardDescription className="text-xs">Idioma e fontes do site</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Idioma</Label>
                <Select
                  value={config.language}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="h-11">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Fonte Títulos</Label>
                  <Select
                    value={config.typography.headingFont}
                    onValueChange={(value) => updateTypography('headingFont', value)}
                  >
                    <SelectTrigger className="h-10">
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
                  <Label className="text-xs text-muted-foreground">Fonte Textos</Label>
                  <Select
                    value={config.typography.bodyFont}
                    onValueChange={(value) => updateTypography('bodyFont', value)}
                  >
                    <SelectTrigger className="h-10">
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
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Seções Visíveis</CardTitle>
                  <CardDescription className="text-xs">Escolha o que mostrar no site</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      💰
                    </div>
                    <div>
                      <p className="text-sm font-medium">Preços</p>
                      <p className="text-xs text-muted-foreground">Exibir valores dos serviços</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.features.showPricing}
                    onCheckedChange={(value) => updateFeatures('showPricing', value)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      👥
                    </div>
                    <div>
                      <p className="text-sm font-medium">Equipe</p>
                      <p className="text-xs text-muted-foreground">Mostrar profissionais</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.features.showTeam}
                    onCheckedChange={(value) => updateFeatures('showTeam', value)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      🖼️
                    </div>
                    <div>
                      <p className="text-sm font-medium">Galeria</p>
                      <p className="text-xs text-muted-foreground">Exibir fotos do trabalho</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.features.showGallery}
                    onCheckedChange={(value) => updateFeatures('showGallery', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
