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
    <div className="space-y-8">
      {/* APP NAME - Full Width */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label className="text-base text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Qual o nome do seu aplicativo?
            </Label>
            <p className="text-sm text-muted-foreground">
              Ex: AgendaFácil, MeuTreino, Pizzaria do Zé
            </p>
            <Input
              value={state.appName}
              onChange={(e) => updateState({ appName: e.target.value })}
              placeholder={template.defaultAppName}
              className="text-lg h-14 border-2 focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* VISÃO E CONCEITO */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Visão e Conceito Central
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Para quem é este aplicativo?
              </Label>
              <p className="text-xs text-muted-foreground">
                Descreva o público-alvo detalhadamente
              </p>
              <Textarea
                value={state.targetAudience}
                onChange={(e) => updateState({ targetAudience: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Ex: Donos de barbearias e salões masculinos..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Qual é a principal tarefa do app?
              </Label>
              <p className="text-xs text-muted-foreground">
                A função core que resolve o problema principal
              </p>
              <Textarea
                value={state.mainTask}
                onChange={(e) => updateState({ mainTask: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Ex: Permitir que clientes agendem cortes..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Qual o maior benefício para o usuário?
              </Label>
              <Textarea
                value={state.mainBenefit}
                onChange={(e) => updateState({ mainBenefit: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Ex: Eliminar agendamentos por telefone..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Quem utiliza o app no dia a dia?
              </Label>
              <Textarea
                value={state.dailyUsers}
                onChange={(e) => updateState({ dailyUsers: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Ex: Clientes finais, barbeiros..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODELO DE NEGÓCIO */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" />
            Modelo de Negócio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Como o negócio gera receita?
              </Label>
              <Textarea
                value={state.businessModel}
                onChange={(e) => updateState({ businessModel: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Ex: Agendamento online com cobrança de sinal..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Qual problema principal o app resolve?
              </Label>
              <Textarea
                value={state.mainProblem}
                onChange={(e) => updateState({ mainProblem: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Ex: Barbearias perdem até 30% com no-shows..."
              />
            </div>

            <div className="lg:col-span-2 space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Qual o resultado esperado do dashboard?
              </Label>
              <Textarea
                value={state.expectedOutcome}
                onChange={(e) => updateState({ expectedOutcome: e.target.value })}
                className="min-h-[80px] resize-none"
                placeholder="Ex: Dashboard mostrando agenda do dia, taxa de ocupação..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PÁGINAS E FUNCIONALIDADES - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PÁGINAS */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              Estrutura de Páginas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {state.pages.map((page, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="gap-1 pr-1 py-1.5 text-xs"
                >
                  {page}
                  <button 
                    onClick={() => removeFromArray('pages', index)}
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
                placeholder="Adicionar página..."
                onKeyDown={(e) => e.key === 'Enter' && addToArray('pages', newPage, setNewPage)}
                className="text-sm"
              />
              <Button onClick={() => addToArray('pages', newPage, setNewPage)} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* INTEGRAÇÕES */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wifi className="w-5 h-5 text-primary" />
              Integrações e APIs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {state.integrations.map((integration, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="gap-1 pr-1 py-1.5 text-xs"
                >
                  {integration}
                  <button 
                    onClick={() => removeFromArray('integrations', index)}
                    className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newIntegration}
                onChange={(e) => setNewIntegration(e.target.value)}
                placeholder="Adicionar integração..."
                onKeyDown={(e) => e.key === 'Enter' && addToArray('integrations', newIntegration, setNewIntegration)}
                className="text-sm"
              />
              <Button onClick={() => addToArray('integrations', newIntegration, setNewIntegration)} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FUNCIONALIDADES CORE */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Funcionalidades Core do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {state.coreFeatures.map((feature, index) => (
              <Badge 
                key={index} 
                variant="default"
                className="gap-1 pr-1 py-1.5 bg-primary/20 text-primary border border-primary/30"
              >
                {feature}
                <button 
                  onClick={() => removeFromArray('coreFeatures', index)}
                  className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Adicionar funcionalidade..."
              onKeyDown={(e) => e.key === 'Enter' && addToArray('coreFeatures', newFeature, setNewFeature)}
            />
            <Button onClick={() => addToArray('coreFeatures', newFeature, setNewFeature)} size="icon" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggested Features */}
          <div className="pt-4 border-t">
            <Label className="text-sm mb-3 block">Funcionalidades Sugeridas para {template.niche}</Label>
            <div className="flex flex-wrap gap-2">
              {template.suggestedFeatures.map((feature) => {
                const isSelected = state.selectedSuggestedFeatures.includes(feature);
                return (
                  <Badge
                    key={feature}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all py-1.5 px-3 text-xs ${
                      isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-primary/10 hover:border-primary'
                    }`}
                    onClick={() => toggleArrayItem('selectedSuggestedFeatures', feature)}
                  >
                    {isSelected && <Check className="w-3 h-3 mr-1" />}
                    {feature}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Additional Features */}
          <div className="pt-4 border-t">
            <Label className="text-sm flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              Recursos adicionais personalizados
            </Label>
            <Textarea
              value={state.additionalFeatures}
              onChange={(e) => updateState({ additionalFeatures: e.target.value })}
              placeholder="Liste outros recursos importantes..."
              className="min-h-[60px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* FLUXOS DE USUÁRIO */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Workflow className="w-6 h-6 text-primary" />
            Fluxos de Usuário (User Flows)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Descreva as jornadas principais dos usuários no app
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.userFlows.map((flow, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl border">
                <span className="text-xs text-primary font-bold min-w-[24px]">{index + 1}.</span>
                <p className="text-sm flex-1">{flow}</p>
                <button 
                  onClick={() => removeFromArray('userFlows', index)}
                  className="p-1 rounded-full hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newUserFlow}
              onChange={(e) => setNewUserFlow(e.target.value)}
              placeholder="Ex: Cliente abre app → Escolhe serviço → Agenda → Paga"
              onKeyDown={(e) => e.key === 'Enter' && addToArray('userFlows', newUserFlow, setNewUserFlow)}
            />
            <Button onClick={() => addToArray('userFlows', newUserFlow, setNewUserFlow)} size="icon" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* IDENTIDADE VISUAL */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            Identidade Visual
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Personalize sua paleta de cores e tipografia
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Grid - 2x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'primary', label: '1. Cor Primária', desc: 'A cor de destaque da marca, usada em CTAs e ícones.' },
              { key: 'secondary', label: '2. Cor Secundária', desc: 'Uma cor de apoio para seções ou cards.' },
              { key: 'background', label: '3. Cor de Fundo', desc: 'A cor de base para o fundo de toda a aplicação.' },
              { key: 'text', label: '4. Cor do Texto', desc: 'Cor para todos os textos e ícones.' },
            ].map((color) => (
              <div key={color.key} className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
                <div>
                  <Label className="text-sm font-medium">{color.label}</Label>
                  <p className="text-xs text-muted-foreground mt-1">{color.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer relative overflow-hidden shadow-inner"
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
                    className="font-mono text-sm uppercase"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <Label className="text-sm">Pré-visualização da Interface</Label>
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: state.colors.background,
                borderColor: `${state.colors.text}20`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold" style={{ color: state.colors.text }}>
                    Card de Exemplo
                  </p>
                  <p className="text-sm opacity-70" style={{ color: state.colors.text }}>
                    Este texto demonstra a legibilidade.
                  </p>
                </div>
                <Button 
                  size="sm"
                  style={{ backgroundColor: state.colors.primary, color: '#fff' }}
                >
                  Novo
                </Button>
              </div>
              <div className="mt-3">
                <Button 
                  className="w-full"
                  style={{ backgroundColor: state.colors.primary, color: '#fff' }}
                >
                  Ação Principal
                </Button>
              </div>
            </div>
          </div>

          {/* Color Presets */}
          <div className="pt-4 border-t">
            <Label className="text-sm mb-3 block">Paletas Prontas</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyColorPreset(preset)}
                  className="p-2 rounded-lg border hover:border-primary transition-all text-center"
                >
                  <div className="flex gap-1 justify-center mb-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }} />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TIPOGRAFIA E ESTILO - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TIPOGRAFIA */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Tipografia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {visibleTypography.map((font) => (
                <button
                  key={font.id}
                  onClick={() => updateState({ typography: font.id })}
                  className={`
                    p-3 rounded-xl border-2 text-left transition-all
                    ${state.typography === font.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <p className="font-bold text-sm">{font.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {font.description}
                  </p>
                </button>
              ))}
            </div>
            {TYPOGRAPHY_OPTIONS.length > 6 && (
              <button
                onClick={() => setShowMoreTypography(!showMoreTypography)}
                className="text-xs text-primary hover:underline"
              >
                {showMoreTypography ? 'Ver menos' : 'Ver mais opções'}
              </button>
            )}
          </CardContent>
        </Card>

        {/* ESTILO DE DESIGN */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brush className="w-5 h-5 text-primary" />
              Estilo de Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {DESIGN_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => updateState({ designStyle: style.id })}
                  className={`
                    p-3 rounded-xl border-2 text-left transition-all
                    ${state.designStyle === style.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <p className="font-bold text-sm">{style.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {style.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AUTENTICAÇÃO E PAGAMENTOS - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AUTENTICAÇÃO */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {AUTH_TYPES.map((auth) => (
                <button
                  key={auth.id}
                  onClick={() => updateState({ authType: auth.id })}
                  className={`
                    p-3 rounded-xl border-2 text-left transition-all
                    ${state.authType === auth.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <p className="font-bold text-sm">{auth.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {auth.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PAGAMENTOS */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Métodos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = state.paymentMethods.includes(method.id);
                return (
                  <button
                    key={method.id}
                    onClick={() => toggleArrayItem('paymentMethods', method.id)}
                    className={`
                      p-3 rounded-xl border-2 text-left transition-all
                      ${isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                      <p className="font-bold text-sm">{method.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NOTIFICAÇÕES E CONFIGURAÇÕES - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NOTIFICAÇÕES */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Canais de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {NOTIFICATION_CHANNELS.map((channel) => {
                const isSelected = state.notificationChannels.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    onClick={() => toggleArrayItem('notificationChannels', channel.id)}
                    className={`
                      p-3 rounded-xl border-2 text-left transition-all
                      ${isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                      <p className="font-bold text-sm">{channel.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CONFIGURAÇÕES TÉCNICAS */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Configurações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Mobile First</p>
                  <p className="text-xs text-muted-foreground">Design responsivo</p>
                </div>
              </div>
              <Switch
                checked={state.mobileFirst}
                onCheckedChange={(checked) => updateState({ mobileFirst: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Tema escuro</p>
                </div>
              </div>
              <Switch
                checked={state.darkMode}
                onCheckedChange={(checked) => updateState({ darkMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">PWA Support</p>
                  <p className="text-xs text-muted-foreground">Instalar como app</p>
                </div>
              </div>
              <Switch
                checked={state.pwaSupport}
                onCheckedChange={(checked) => updateState({ pwaSupport: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IDIOMA E PLATAFORMA - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IDIOMA */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Qual será o idioma principal do seu aplicativo?
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              A interface e todo o conteúdo serão gerados neste idioma.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => updateState({ language: lang.id })}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                    ${state.language === lang.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium text-sm">{lang.name}</span>
                  {state.language === lang.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PLATAFORMA */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Por onde será desenvolvido seu app?
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Selecione a plataforma de IA que você planeja usar.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {AI_PLATFORMS.slice(0, 6).map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => updateState({ platform: platform.id })}
                  className={`
                    p-3 rounded-xl border-2 text-left transition-all
                    ${state.platform === platform.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Cpu className="w-4 h-4 text-primary" />
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
      </div>

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
  );
};