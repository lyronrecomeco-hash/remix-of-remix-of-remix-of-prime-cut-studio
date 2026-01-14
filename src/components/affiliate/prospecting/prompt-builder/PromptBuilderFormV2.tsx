import { useState } from 'react';
import { 
  Palette, 
  Type, 
  Globe, 
  Cpu, 
  Sparkles,
  Plus,
  X,
  Check,
  Rocket,
  Users,
  Target,
  Heart,
  Lightbulb,
  Layout,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { NicheTemplate, PromptBuilderState, AI_PLATFORMS, TYPOGRAPHY_OPTIONS, LANGUAGE_OPTIONS } from './types';
import { LivePreviewV2 } from './LivePreviewV2';

interface PromptBuilderFormV2Props {
  state: PromptBuilderState;
  template: NicheTemplate;
  onChange: (state: PromptBuilderState) => void;
  onGenerate: () => void;
}

export const PromptBuilderFormV2 = ({ state, template, onChange, onGenerate }: PromptBuilderFormV2Props) => {
  const [newPage, setNewPage] = useState('');
  const [showMoreTypography, setShowMoreTypography] = useState(false);

  const updateState = (updates: Partial<PromptBuilderState>) => {
    onChange({ ...state, ...updates });
  };

  const addPage = () => {
    if (newPage.trim()) {
      updateState({ pages: [...state.pages, newPage.trim()] });
      setNewPage('');
    }
  };

  const removePage = (index: number) => {
    updateState({ pages: state.pages.filter((_, i) => i !== index) });
  };

  const toggleSuggestedFeature = (feature: string) => {
    const selected = state.selectedSuggestedFeatures;
    if (selected.includes(feature)) {
      updateState({ selectedSuggestedFeatures: selected.filter(f => f !== feature) });
    } else {
      updateState({ selectedSuggestedFeatures: [...selected, feature] });
    }
  };

  const updateColor = (key: keyof typeof state.colors, value: string) => {
    updateState({ colors: { ...state.colors, [key]: value } });
  };

  // Color presets
  const colorPresets = [
    { name: 'Roxo', primary: '#7c3aed', secondary: '#a855f7' },
    { name: 'Azul', primary: '#2563eb', secondary: '#3b82f6' },
    { name: 'Verde', primary: '#059669', secondary: '#10b981' },
    { name: 'Rosa', primary: '#db2777', secondary: '#ec4899' },
    { name: 'Laranja', primary: '#ea580c', secondary: '#f97316' },
    { name: 'Dourado', primary: '#1a1a2e', secondary: '#d4af37' },
  ];

  const visibleTypography = showMoreTypography ? TYPOGRAPHY_OPTIONS : TYPOGRAPHY_OPTIONS.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* App Name - Main Input */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Qual o nome do seu aplicativo?
              </Label>
              <p className="text-xs text-muted-foreground">
                Ex: AgendaFácil, MeuTreino, Pizzaria do Zé
              </p>
              <Input
                value={state.appName}
                onChange={(e) => updateState({ appName: e.target.value })}
                placeholder={template.defaultAppName}
                className="text-lg h-12 border-2 focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pre-filled Section - Para quem é */}
        <Card className="border border-border">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-foreground flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  Para quem é este aplicativo?
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Ex: Donos de barbearia, Professores de academia, Pessoas que querem emagrecer
                </p>
                <Textarea
                  value={state.targetAudience}
                  onChange={(e) => updateState({ targetAudience: e.target.value })}
                  className="min-h-[60px] resize-none"
                />
                <p className="text-xs text-green-500 mt-1">✓ preenchido</p>
              </div>

              <div>
                <Label className="text-sm text-foreground flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                  Qual é a principal tarefa que este app vai fazer?
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Ex: 'Marcar horários para clientes', 'Anotar pedidos de comida', 'Calcular calorias'
                </p>
                <Textarea
                  value={state.mainTask}
                  onChange={(e) => updateState({ mainTask: e.target.value })}
                  className="min-h-[60px] resize-none"
                />
                <p className="text-xs text-green-500 mt-1">✓ preenchido</p>
              </div>

              <div>
                <Label className="text-sm text-foreground flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-primary" />
                  Qual a maior ajuda que o app oferece ao usuário?
                </Label>
                <Textarea
                  value={state.mainBenefit}
                  onChange={(e) => updateState({ mainBenefit: e.target.value })}
                  className="min-h-[60px] resize-none"
                />
                <p className="text-xs text-green-500 mt-1">✓ preenchido</p>
              </div>

              <div>
                <Label className="text-sm text-foreground flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  Quem utiliza o app no dia a dia?
                </Label>
                <Input
                  value={state.dailyUsers}
                  onChange={(e) => updateState({ dailyUsers: e.target.value })}
                  placeholder="Ex: Clientes e administradores"
                />
                <p className="text-xs text-green-500 mt-1">✓ preenchido</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pages & Menu */}
        <Card className="border border-border">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm text-foreground flex items-center gap-2 mb-1">
                <Layout className="w-4 h-4 text-primary" />
                Páginas e menus do aplicativo
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Já preenchido automaticamente para o nicho de {template.niche}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {state.pages.map((page, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="gap-1 pr-1 py-1.5"
                  >
                    {page}
                    <button 
                      onClick={() => removePage(index)}
                      className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newPage}
                  onChange={(e) => setNewPage(e.target.value)}
                  placeholder="Adicionar nova página..."
                  onKeyDown={(e) => e.key === 'Enter' && addPage()}
                />
                <Button onClick={addPage} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Features (Optional) */}
        <Card className="border border-border">
          <CardContent className="p-6">
            <div>
              <Label className="text-sm text-foreground flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-primary" />
                Que outros recursos o app precisa ter? (Opcional)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Ex: 'Mandar lembretes automáticos', 'Salvar fotos de antes e depois'
              </p>
              <Textarea
                value={state.additionalFeatures}
                onChange={(e) => updateState({ additionalFeatures: e.target.value })}
                placeholder="Liste outros recursos importantes..."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual Identity Section */}
        <Card className="border border-border">
          <CardContent className="p-6 space-y-6">
            <div>
              <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
                <Palette className="w-5 h-5 text-primary" />
                Identidade Visual
              </Label>
              <p className="text-xs text-muted-foreground">
                Personalize sua paleta de cores e tipografia
              </p>
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">1. Cor Primária</Label>
                <p className="text-xs text-muted-foreground">A cor de destaque da marca, usada em CTAs e ícones.</p>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: state.colors.primary }}
                  >
                    <input
                      type="color"
                      value={state.colors.primary}
                      onChange={(e) => updateColor('primary', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={state.colors.primary}
                    onChange={(e) => updateColor('primary', e.target.value)}
                    className="font-mono text-sm flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">2. Cor Secundária</Label>
                <p className="text-xs text-muted-foreground">Uma cor de apoio para seções ou cards.</p>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: state.colors.secondary }}
                  >
                    <input
                      type="color"
                      value={state.colors.secondary}
                      onChange={(e) => updateColor('secondary', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={state.colors.secondary}
                    onChange={(e) => updateColor('secondary', e.target.value)}
                    className="font-mono text-sm flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">3. Cor de Fundo</Label>
                <p className="text-xs text-muted-foreground">A cor de base do fundo de toda a aplicação.</p>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: state.colors.background }}
                  >
                    <input
                      type="color"
                      value={state.colors.background}
                      onChange={(e) => updateColor('background', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={state.colors.background}
                    onChange={(e) => updateColor('background', e.target.value)}
                    className="font-mono text-sm flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">4. Cor do Texto</Label>
                <p className="text-xs text-muted-foreground">Cor para todos os textos e ícones.</p>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: state.colors.text }}
                  >
                    <input
                      type="color"
                      value={state.colors.text}
                      onChange={(e) => updateColor('text', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={state.colors.text}
                    onChange={(e) => updateColor('text', e.target.value)}
                    className="font-mono text-sm flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Live Color Preview */}
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: state.colors.background,
                borderColor: `${state.colors.text}20`,
              }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: state.colors.text }}>
                Card de Exemplo
              </p>
              <p className="text-xs opacity-70 mb-3" style={{ color: state.colors.text }}>
                Este texto demonstra a legibilidade.
              </p>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 rounded-lg text-sm text-white font-medium"
                  style={{ backgroundColor: state.colors.primary }}
                >
                  Ação Principal
                </button>
                <Badge style={{ backgroundColor: state.colors.secondary, color: 'white' }}>
                  Nova
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="border border-border">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
                <Type className="w-5 h-5 text-primary" />
                Tipografia
              </Label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {visibleTypography.map((font) => (
                <button
                  key={font.id}
                  onClick={() => updateState({ typography: font.name })}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${state.typography === font.name 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  style={{ fontFamily: font.name }}
                >
                  <p className="font-bold text-base mb-1">{font.name}</p>
                  <p className="text-xs text-muted-foreground">{font.category}</p>
                  <p className="text-[10px] mt-1 opacity-50">Clara e moderna, ótima para leitura.</p>
                </button>
              ))}
            </div>

            {!showMoreTypography && (
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground"
                onClick={() => setShowMoreTypography(true)}
              >
                Ver mais opções
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="border border-border">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
                <Globe className="w-5 h-5 text-primary" />
                Qual será o idioma principal do seu aplicativo?
              </Label>
              <p className="text-xs text-muted-foreground">
                A interface e todo o conteúdo serão gerados neste idioma.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => updateState({ language: lang.id })}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all
                    ${state.language === lang.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {state.language === lang.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Platform */}
        <Card className="border border-border">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
                <Cpu className="w-5 h-5 text-primary" />
                Por onde será desenvolvido seu app?
              </Label>
              <p className="text-xs text-muted-foreground">
                Selecione a plataforma de IA que você planeja usar. Isso otimizará o prompt para o melhor resultado.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AI_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => updateState({ platform: platform.id })}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${state.platform === platform.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mb-2">
                    <Cpu className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="font-bold text-sm">{platform.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
                    {platform.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Features */}
        <Card className="border border-border">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-primary" />
                Funcionalidades Complementares
              </Label>
              <p className="text-xs text-muted-foreground">
                Selecione funcionalidades extras que podem enriquecer seu aplicativo.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {template.suggestedFeatures.map((feature) => {
                const isSelected = state.selectedSuggestedFeatures.includes(feature);
                return (
                  <Badge
                    key={feature}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all py-2 px-3 text-sm ${
                      isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-primary/10 hover:border-primary'
                    }`}
                    onClick={() => toggleSuggestedFeature(feature)}
                  >
                    {isSelected && <Check className="w-3 h-3 mr-1" />}
                    {feature}
                  </Badge>
                );
              })}
            </div>

            <Button variant="outline" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Sugerir Novos Recursos
            </Button>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button 
          size="lg" 
          className="w-full gap-2 h-16 text-lg bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-lg shadow-primary/25"
          onClick={onGenerate}
        >
          <Rocket className="w-6 h-6" />
          Materializar Conceito
        </Button>
      </div>

      {/* Live Preview Column */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <LivePreviewV2 state={state} template={template} />
        </div>
      </div>
    </div>
  );
};
