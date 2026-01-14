import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Globe,
  Palette,
  Type,
  Sparkles,
  Copy,
  Check,
  Wand2,
  Monitor,
  Smartphone,
  Users,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface CustomTemplateWizardProps {
  onBack: () => void;
  onComplete: (prompt: string) => void;
}

const LANGUAGES = [
  { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', label: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
];

const VISUAL_STYLES = [
  { id: 'modern', label: 'Moderno', description: 'Clean e minimalista' },
  { id: 'apple', label: 'Estilo Apple', description: 'Elegante e premium' },
  { id: 'neon', label: 'Neon Vibrante', description: 'Cores vivas e impactantes' },
  { id: 'corporate', label: 'Corporativo', description: 'Profissional e confiável' },
];

const FONTS = [
  { value: 'Inter', label: 'Inter', category: 'Sans-serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans-serif' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans-serif' },
];

const FEATURES = [
  { id: 'animations', label: 'Animações visuais', icon: Sparkles },
  { id: 'responsive', label: 'Design responsivo', icon: Smartphone },
  { id: 'gallery', label: 'Galeria de fotos', icon: Monitor },
  { id: 'contact', label: 'Formulário de contato', icon: FileText },
  { id: 'testimonials', label: 'Depoimentos', icon: Users },
];

export function CustomTemplateWizard({ onBack, onComplete }: CustomTemplateWizardProps) {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  
  // Form data
  const [projectType, setProjectType] = useState<'site' | 'app'>('site');
  const [language, setLanguage] = useState('pt-BR');
  const [visualStyle, setVisualStyle] = useState('modern');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#1f2937');
  const [font, setFont] = useState('Inter');
  const [features, setFeatures] = useState<string[]>(['animations', 'responsive']);
  const [targetAudience, setTargetAudience] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [inspiration, setInspiration] = useState('');

  const totalSteps = 5;

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const generatePrompt = () => {
    const selectedLanguage = LANGUAGES.find(l => l.code === language);
    const selectedStyle = VISUAL_STYLES.find(s => s.id === visualStyle);
    const selectedFeatures = features.map(f => FEATURES.find(feat => feat.id === f)?.label).join(', ');
    
    const prompt = `Quero um ${projectType === 'site' ? 'site' : 'aplicativo'} para ${businessName || 'meu negócio'} completo.

**Idioma:** ${selectedLanguage?.label || language}

**Estilo Visual:** ${selectedStyle?.label || visualStyle} - ${selectedStyle?.description || ''}

**Cores:**
- Cor primária: ${primaryColor}
- Cor secundária: ${secondaryColor}

**Fonte:** ${font}

**Funcionalidades incluídas:** ${selectedFeatures}

**Público-alvo:** ${targetAudience || 'Clientes em geral'}

**Descrição do projeto:**
${projectDescription}

${inspiration ? `**Inspiração:** Quero que fique parecido com ${inspiration}` : ''}

**Requisitos técnicos:**
- 100% funcional e responsivo
- Design profissional e moderno
- Carregamento rápido
- SEO otimizado

Por favor, crie este ${projectType} seguindo todas as especificações acima.`;

    return prompt;
  };

  const handleCopyPrompt = async () => {
    const prompt = generatePrompt();
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success('Prompt copiado! Cole na IA para criar seu site.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    onComplete(generatePrompt());
  };

  const canProceed = () => {
    switch (step) {
      case 1: return language;
      case 2: return visualStyle && primaryColor;
      case 3: return font;
      case 4: return features.length > 0;
      case 5: return projectDescription.trim().length > 10;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Globe className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Configurações Básicas</h3>
              <p className="text-sm text-muted-foreground">Defina o tipo e idioma do projeto</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Tipo de Projeto</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card 
                    className={`cursor-pointer transition-all ${projectType === 'site' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setProjectType('site')}
                  >
                    <CardContent className="p-4 text-center">
                      <Monitor className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <span className="font-medium">Site</span>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${projectType === 'app' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setProjectType('app')}
                  >
                    <CardContent className="p-4 text-center">
                      <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <span className="font-medium">Aplicativo</span>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Idioma Principal</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Nome do Negócio</Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Restaurante Vila"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Palette className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Estilo Visual</h3>
              <p className="text-sm text-muted-foreground">Escolha o visual do seu projeto</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Estilo</Label>
                <div className="grid grid-cols-2 gap-3">
                  {VISUAL_STYLES.map(style => (
                    <Card 
                      key={style.id}
                      className={`cursor-pointer transition-all ${visualStyle === style.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setVisualStyle(style.id)}
                    >
                      <CardContent className="p-4">
                        <span className="font-medium block">{style.label}</span>
                        <span className="text-xs text-muted-foreground">{style.description}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Cor Primária</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Type className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Tipografia</h3>
              <p className="text-sm text-muted-foreground">Escolha a fonte do projeto</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Fonte Principal</Label>
                <div className="grid gap-2">
                  {FONTS.map(f => (
                    <Card 
                      key={f.value}
                      className={`cursor-pointer transition-all ${font === f.value ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setFont(f.value)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <span className="font-medium" style={{ fontFamily: f.value }}>{f.label}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">{f.category}</Badge>
                        </div>
                        {font === f.value && <CheckCircle className="w-5 h-5 text-primary" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Funcionalidades</h3>
              <p className="text-sm text-muted-foreground">O que seu projeto deve ter?</p>
            </div>

            <div className="space-y-3">
              {FEATURES.map(feature => {
                const Icon = feature.icon;
                const isSelected = features.includes(feature.id);
                return (
                  <Card 
                    key={feature.id}
                    className={`cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => toggleFeature(feature.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Checkbox checked={isSelected} />
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">{feature.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Detalhes do Projeto</h3>
              <p className="text-sm text-muted-foreground">Descreva o que você precisa</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Público-Alvo</Label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: Pessoas que querem pedir marmita"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Descrição do Projeto *</Label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Descreva o que você precisa... Ex: Quero um site para restaurante completo com sistema de venda de marmitas, com escolha de marmita P ou G, escolha de complementos à vontade..."
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Inspiração (opcional)</Label>
                <Input
                  value={inspiration}
                  onChange={(e) => setInspiration(e.target.value)}
                  placeholder="Ex: iFood, Mercado Livre, ou um link de site"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Final step - show generated prompt
  if (step > totalSteps) {
    const prompt = generatePrompt();
    
    return (
      <div className="space-y-6 p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Prompt Gerado!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Copie o prompt abaixo e cole na Lovable ou outra IA para criar seu site
          </p>
        </div>

        <div className="relative">
          <Textarea
            value={prompt}
            readOnly
            className="min-h-[250px] text-sm font-mono bg-muted/50"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 gap-1.5"
            onClick={handleCopyPrompt}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
          <Button onClick={handleComplete} className="flex-1 gap-2">
            <CheckCircle className="w-4 h-4" />
            Concluir
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={step === 1 ? onBack : () => setStep(s => s - 1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 === step 
                  ? 'bg-primary' 
                  : i + 1 < step 
                    ? 'bg-primary/50' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {step} de {totalSteps}
        </span>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <Button 
          onClick={() => setStep(s => s + 1)}
          disabled={!canProceed()}
          className="gap-2"
        >
          {step === totalSteps ? 'Gerar Prompt' : 'Próximo'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
