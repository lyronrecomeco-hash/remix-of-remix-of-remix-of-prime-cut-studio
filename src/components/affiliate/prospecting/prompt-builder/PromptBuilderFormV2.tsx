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
  MessageSquare,
  Building,
  AlertCircle,
  TrendingUp,
  Workflow,
  Lock,
  CreditCard,
  Bell,
  Smartphone,
  Moon,
  Wifi,
  Brush,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  NicheTemplate, 
  PromptBuilderState, 
  AI_PLATFORMS, 
  TYPOGRAPHY_OPTIONS, 
  LANGUAGE_OPTIONS,
  AUTH_TYPES,
  PAYMENT_METHODS,
  NOTIFICATION_CHANNELS,
  DESIGN_STYLES,
  ICON_STYLES
} from './types';


interface PromptBuilderFormV2Props {
  state: PromptBuilderState;
  template: NicheTemplate;
  onChange: (state: PromptBuilderState) => void;
  onGenerate: () => void;
}

export const PromptBuilderFormV2 = ({ state, template, onChange, onGenerate }: PromptBuilderFormV2Props) => {
  const [newPage, setNewPage] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newIntegration, setNewIntegration] = useState('');
  const [newUserFlow, setNewUserFlow] = useState('');
  const [showMoreTypography, setShowMoreTypography] = useState(false);

  const updateState = (updates: Partial<PromptBuilderState>) => {
    onChange({ ...state, ...updates });
  };

  const addToArray = (key: keyof PromptBuilderState, value: string, setter: (v: string) => void) => {
    if (value.trim()) {
      const current = state[key] as string[];
      updateState({ [key]: [...current, value.trim()] });
      setter('');
    }
  };

  const removeFromArray = (key: keyof PromptBuilderState, index: number) => {
    const current = state[key] as string[];
    updateState({ [key]: current.filter((_, i) => i !== index) });
  };

  const toggleArrayItem = (key: keyof PromptBuilderState, value: string) => {
    const current = state[key] as string[];
    if (current.includes(value)) {
      updateState({ [key]: current.filter(v => v !== value) });
    } else {
      updateState({ [key]: [...current, value] });
    }
  };

  const updateColor = (key: keyof typeof state.colors, value: string) => {
    updateState({ colors: { ...state.colors, [key]: value } });
  };

  const colorPresets = [
    { name: 'Roxo Premium', primary: '#7c3aed', secondary: '#a855f7', accent: '#c084fc', background: '#0f0f1a' },
    { name: 'Azul Corporate', primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa', background: '#0a1628' },
    { name: 'Verde Saúde', primary: '#059669', secondary: '#10b981', accent: '#34d399', background: '#021a14' },
    { name: 'Rosa Moderno', primary: '#db2777', secondary: '#ec4899', accent: '#f472b6', background: '#1a0a14' },
    { name: 'Laranja Food', primary: '#ea580c', secondary: '#f97316', accent: '#fb923c', background: '#1a0f06' },
    { name: 'Dourado Luxo', primary: '#d4af37', secondary: '#c9a227', accent: '#f4d03f', background: '#1a1a2e' },
  ];

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updateState({ 
      colors: { 
        ...state.colors, 
        primary: preset.primary, 
        secondary: preset.secondary, 
        accent: preset.accent,
        background: preset.background 
      } 
    });
  };

  const visibleTypography = showMoreTypography ? TYPOGRAPHY_OPTIONS : TYPOGRAPHY_OPTIONS.slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ============================================ */}
      {/* SECTION 1: APP NAME */}
      {/* ============================================ */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-8">
          <div className="space-y-4">
            <Label className="text-lg font-medium text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              Qual o nome do seu aplicativo?
            </Label>
            <p className="text-base text-muted-foreground">
              Ex: AgendaFácil, MeuTreino, Pizzaria do Zé
            </p>
            <Input
              value={state.appName}
              onChange={(e) => updateState({ appName: e.target.value })}
              placeholder={template.defaultAppName}
              className="text-xl h-16 border-2 focus:border-primary bg-background/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 2: VISÃO E CONCEITO */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            Visão e Conceito Central
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Para quem é este aplicativo?
            </Label>
            <p className="text-sm text-muted-foreground">
              Descreva o público-alvo detalhadamente
            </p>
            <Textarea
              value={state.targetAudience}
              onChange={(e) => updateState({ targetAudience: e.target.value })}
              className="min-h-[120px] text-base resize-none bg-background/50"
              placeholder="Ex: Donos de barbearias e salões masculinos que desejam modernizar o atendimento..."
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Qual é a principal tarefa do app?
            </Label>
            <p className="text-sm text-muted-foreground">
              A função core que resolve o problema principal
            </p>
            <Textarea
              value={state.mainTask}
              onChange={(e) => updateState({ mainTask: e.target.value })}
              className="min-h-[140px] text-base resize-none bg-background/50"
              placeholder="Ex: Permitir que clientes agendem cortes de cabelo, barba e outros serviços diretamente pelo celular..."
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Qual o maior benefício para o usuário?
            </Label>
            <Textarea
              value={state.mainBenefit}
              onChange={(e) => updateState({ mainBenefit: e.target.value })}
              className="min-h-[120px] text-base resize-none bg-background/50"
              placeholder="Ex: Eliminar agendamentos por telefone, reduzir faltas em até 70%..."
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Quem utiliza o app no dia a dia?
            </Label>
            <Textarea
              value={state.dailyUsers}
              onChange={(e) => updateState({ dailyUsers: e.target.value })}
              className="min-h-[100px] text-base resize-none bg-background/50"
              placeholder="Ex: Clientes finais, barbeiros, e administradores..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 3: MODELO DE NEGÓCIO */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Building className="w-6 h-6 text-primary" />
            </div>
            Modelo de Negócio
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Como o negócio gera receita?
            </Label>
            <Textarea
              value={state.businessModel}
              onChange={(e) => updateState({ businessModel: e.target.value })}
              className="min-h-[120px] text-base resize-none bg-background/50"
              placeholder="Ex: Agendamento online com cobrança de sinal (10-30% do valor)..."
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Qual problema principal o app resolve?
            </Label>
            <Textarea
              value={state.mainProblem}
              onChange={(e) => updateState({ mainProblem: e.target.value })}
              className="min-h-[120px] text-base resize-none bg-background/50"
              placeholder="Ex: Barbearias perdem até 30% do faturamento com no-shows..."
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Qual o resultado esperado do dashboard?
            </Label>
            <Textarea
              value={state.expectedOutcome}
              onChange={(e) => updateState({ expectedOutcome: e.target.value })}
              className="min-h-[120px] text-base resize-none bg-background/50"
              placeholder="Ex: Dashboard mostrando agenda do dia, taxa de ocupação, faturamento..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 4: PÁGINAS E NAVEGAÇÃO */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Layout className="w-6 h-6 text-primary" />
            </div>
            Estrutura de Páginas e Navegação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <p className="text-base text-muted-foreground">
            Páginas pré-configuradas para o nicho de {template.niche}. Adicione ou remova conforme necessário.
          </p>
          
          <div className="flex flex-wrap gap-3 min-h-[80px]">
            {state.pages.map((page, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="gap-2 pr-2 py-2.5 px-4 text-sm"
              >
                {page}
                <button 
                  onClick={() => removeFromArray('pages', index)}
                  className="ml-1 p-1 rounded-full hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Input
              value={newPage}
              onChange={(e) => setNewPage(e.target.value)}
              placeholder="Adicionar nova página..."
              onKeyDown={(e) => e.key === 'Enter' && addToArray('pages', newPage, setNewPage)}
              className="h-14 text-base"
            />
            <Button onClick={() => addToArray('pages', newPage, setNewPage)} size="lg" variant="outline" className="h-14 px-6">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 5: FUNCIONALIDADES CORE */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            Funcionalidades Core do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="flex flex-wrap gap-3">
            {state.coreFeatures.map((feature, index) => (
              <Badge 
                key={index} 
                variant="default"
                className="gap-2 pr-2 py-2.5 px-4 text-sm bg-primary/20 text-primary border border-primary/30"
              >
                {feature}
                <button 
                  onClick={() => removeFromArray('coreFeatures', index)}
                  className="ml-1 p-1 rounded-full hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Adicionar funcionalidade..."
              onKeyDown={(e) => e.key === 'Enter' && addToArray('coreFeatures', newFeature, setNewFeature)}
              className="h-14 text-base"
            />
            <Button onClick={() => addToArray('coreFeatures', newFeature, setNewFeature)} size="lg" variant="outline" className="h-14 px-6">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Suggested Features from Template */}
          <div className="pt-6 border-t space-y-4">
            <Label className="text-base font-medium">Funcionalidades Sugeridas para {template.niche}</Label>
            <div className="flex flex-wrap gap-3">
              {template.suggestedFeatures.map((feature) => {
                const isSelected = state.selectedSuggestedFeatures.includes(feature);
                return (
                  <Badge
                    key={feature}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all py-2.5 px-4 text-sm ${
                      isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-primary/10 hover:border-primary'
                    }`}
                    onClick={() => toggleArrayItem('selectedSuggestedFeatures', feature)}
                  >
                    {isSelected && <Check className="w-4 h-4 mr-2" />}
                    {feature}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Additional Features */}
          <div className="pt-6 border-t space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Recursos adicionais personalizados
            </Label>
            <Textarea
              value={state.additionalFeatures}
              onChange={(e) => updateState({ additionalFeatures: e.target.value })}
              placeholder="Liste outros recursos importantes que não estão nas sugestões..."
              className="min-h-[100px] text-base bg-background/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 6: INTEGRAÇÕES */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-primary" />
            </div>
            Integrações e APIs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="flex flex-wrap gap-3 min-h-[60px]">
            {state.integrations.map((integration, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="gap-2 pr-2 py-2.5 px-4 text-sm"
              >
                {integration}
                <button 
                  onClick={() => removeFromArray('integrations', index)}
                  className="ml-1 p-1 rounded-full hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Input
              value={newIntegration}
              onChange={(e) => setNewIntegration(e.target.value)}
              placeholder="Adicionar integração..."
              onKeyDown={(e) => e.key === 'Enter' && addToArray('integrations', newIntegration, setNewIntegration)}
              className="h-14 text-base"
            />
            <Button onClick={() => addToArray('integrations', newIntegration, setNewIntegration)} size="lg" variant="outline" className="h-14 px-6">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 7: FLUXOS DE USUÁRIO */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-primary" />
            </div>
            Fluxos de Usuário (User Flows)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <p className="text-base text-muted-foreground">
            Descreva as jornadas principais dos usuários no app
          </p>
          
          <div className="space-y-3">
            {state.userFlows.map((flow, index) => (
              <div key={index} className="flex items-start gap-4 p-5 bg-muted/30 rounded-2xl border">
                <span className="text-base text-primary font-bold min-w-[32px]">{index + 1}.</span>
                <p className="text-base flex-1">{flow}</p>
                <button 
                  onClick={() => removeFromArray('userFlows', index)}
                  className="p-2 rounded-full hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Input
              value={newUserFlow}
              onChange={(e) => setNewUserFlow(e.target.value)}
              placeholder="Ex: Cliente abre app → Escolhe serviço → Agenda → Paga → Recebe confirmação"
              onKeyDown={(e) => e.key === 'Enter' && addToArray('userFlows', newUserFlow, setNewUserFlow)}
              className="h-14 text-base"
            />
            <Button onClick={() => addToArray('userFlows', newUserFlow, setNewUserFlow)} size="lg" variant="outline" className="h-14 px-6">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 8: IDENTIDADE VISUAL */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            Identidade Visual
          </CardTitle>
          <p className="text-base text-muted-foreground mt-2">
            Personalize sua paleta de cores e tipografia
          </p>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          {/* Color Grid */}
          <div className="space-y-6">
            {[
              { key: 'primary', label: '1. Cor Primária', desc: 'A cor de destaque da marca, usada em CTAs e ícones.' },
              { key: 'secondary', label: '2. Cor Secundária', desc: 'Uma cor de apoio para seções ou cards.' },
              { key: 'background', label: '3. Cor de Fundo', desc: 'A cor de base para o fundo de toda a aplicação.' },
              { key: 'text', label: '4. Cor do Texto', desc: 'Cor para todos os textos e ícones.' },
            ].map((color) => (
              <div key={color.key} className="p-6 rounded-2xl border border-border bg-card/50 space-y-4">
                <div>
                  <Label className="text-lg font-medium">{color.label}</Label>
                  <p className="text-sm text-muted-foreground mt-1">{color.desc}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl border-2 border-border cursor-pointer relative overflow-hidden shadow-inner"
                    style={{ backgroundColor: state.colors[color.key as keyof typeof state.colors] }}
                  >
                    <input
                      type="color"
                      value={state.colors[color.key as keyof typeof state.colors]}
                      onChange={(e) => updateColor(color.key as keyof typeof state.colors, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={state.colors[color.key as keyof typeof state.colors]}
                    onChange={(e) => updateColor(color.key as keyof typeof state.colors, e.target.value)}
                    className="font-mono text-lg uppercase h-14 flex-1"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Color Preview */}
          <div className="space-y-3">
            <Label className="text-lg font-medium">Pré-visualização da Interface</Label>
            <div 
              className="p-6 rounded-2xl border"
              style={{ 
                backgroundColor: state.colors.background,
                borderColor: `${state.colors.text}20`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold" style={{ color: state.colors.text }}>
                    Card de Exemplo
                  </p>
                  <p className="text-base opacity-70" style={{ color: state.colors.text }}>
                    Este texto demonstra a legibilidade.
                  </p>
                </div>
                <Button 
                  size="lg"
                  style={{ backgroundColor: state.colors.primary, color: '#fff' }}
                >
                  Novo
                </Button>
              </div>
              <Button 
                className="w-full h-14 text-base"
                style={{ backgroundColor: state.colors.primary, color: '#fff' }}
              >
                Ação Principal
              </Button>
            </div>
          </div>

          {/* Color Presets */}
          <div className="pt-6 border-t space-y-4">
            <Label className="text-lg font-medium">Paletas Prontas</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyColorPreset(preset)}
                  className="p-4 rounded-xl border-2 hover:border-primary transition-all text-center"
                >
                  <div className="flex gap-1.5 justify-center mb-2">
                    <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: preset.primary }} />
                    <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 9: TIPOGRAFIA */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Type className="w-6 h-6 text-primary" />
            </div>
            Tipografia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {visibleTypography.map((font) => (
              <button
                key={font.id}
                onClick={() => updateState({ typography: font.id })}
                className={`
                  p-5 rounded-2xl border-2 text-left transition-all
                  ${state.typography === font.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <p className="font-bold text-base">{font.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {font.description}
                </p>
              </button>
            ))}
          </div>
          {TYPOGRAPHY_OPTIONS.length > 6 && (
            <button
              onClick={() => setShowMoreTypography(!showMoreTypography)}
              className="text-base text-primary hover:underline"
            >
              {showMoreTypography ? 'Ver menos' : 'Ver mais opções'}
            </button>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 10: ESTILO DE DESIGN */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Brush className="w-6 h-6 text-primary" />
            </div>
            Estilo de Design
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {DESIGN_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => updateState({ designStyle: style.id })}
                className={`
                  p-5 rounded-2xl border-2 text-left transition-all
                  ${state.designStyle === style.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <p className="font-bold text-base">{style.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {style.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 11: AUTENTICAÇÃO */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {AUTH_TYPES.map((auth) => (
              <button
                key={auth.id}
                onClick={() => updateState({ authType: auth.id })}
                className={`
                  p-5 rounded-2xl border-2 text-left transition-all
                  ${state.authType === auth.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <p className="font-bold text-base">{auth.name}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {auth.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 12: PAGAMENTOS */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            Métodos de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = state.paymentMethods.includes(method.id);
              return (
                <button
                  key={method.id}
                  onClick={() => toggleArrayItem('paymentMethods', method.id)}
                  className={`
                    p-5 rounded-2xl border-2 text-left transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                    <p className="font-bold text-base">{method.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 13: NOTIFICAÇÕES */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            Canais de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {NOTIFICATION_CHANNELS.map((channel) => {
              const isSelected = state.notificationChannels.includes(channel.id);
              return (
                <button
                  key={channel.id}
                  onClick={() => toggleArrayItem('notificationChannels', channel.id)}
                  className={`
                    p-5 rounded-2xl border-2 text-left transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                    <p className="font-bold text-base">{channel.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 14: CONFIGURAÇÕES TÉCNICAS */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            Configurações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-4">
          <div className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">Mobile First</p>
                <p className="text-sm text-muted-foreground">Design responsivo priorizando mobile</p>
              </div>
            </div>
            <Switch
              checked={state.mobileFirst}
              onCheckedChange={(checked) => updateState({ mobileFirst: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Suporte a tema escuro</p>
              </div>
            </div>
            <Switch
              checked={state.darkMode}
              onCheckedChange={(checked) => updateState({ darkMode: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">PWA Support</p>
                <p className="text-sm text-muted-foreground">Instalar como aplicativo nativo</p>
              </div>
            </div>
            <Switch
              checked={state.pwaSupport}
              onCheckedChange={(checked) => updateState({ pwaSupport: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 15: IDIOMA */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            Qual será o idioma principal do seu aplicativo?
          </CardTitle>
          <p className="text-base text-muted-foreground mt-2">
            A interface e todo o conteúdo serão gerados neste idioma.
          </p>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="flex flex-wrap gap-4">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.id}
                onClick={() => updateState({ language: lang.id })}
                className={`
                  flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all
                  ${state.language === lang.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium text-base">{lang.name}</span>
                {state.language === lang.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SECTION 16: PLATAFORMA */}
      {/* ============================================ */}
      <Card className="border border-border">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            Por onde será desenvolvido seu app?
          </CardTitle>
          <p className="text-base text-muted-foreground mt-2">
            Selecione a plataforma de IA que você planeja usar. Isso otimizará o prompt para o melhor resultado.
          </p>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {AI_PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => updateState({ platform: platform.id })}
                className={`
                  p-5 rounded-2xl border-2 text-left transition-all
                  ${state.platform === platform.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-lg">{platform.name}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {platform.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button 
        size="lg" 
        className="w-full gap-3 h-20 text-xl bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-xl shadow-primary/25"
        onClick={onGenerate}
      >
        <Rocket className="w-7 h-7" />
        Materializar Conceito
      </Button>
    </div>
  );
};