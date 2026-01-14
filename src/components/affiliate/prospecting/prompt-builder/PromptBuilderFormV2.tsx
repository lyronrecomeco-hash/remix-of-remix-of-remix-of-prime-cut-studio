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
import { LivePreviewV2 } from './LivePreviewV2';

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

  // Array helpers
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

  // Color presets based on design style
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

  const countFilledFields = () => {
    let count = 0;
    if (state.appName) count++;
    if (state.targetAudience) count++;
    if (state.mainTask) count++;
    if (state.mainBenefit) count++;
    if (state.dailyUsers) count++;
    if (state.businessModel) count++;
    if (state.mainProblem) count++;
    if (state.expectedOutcome) count++;
    if (state.pages.length > 0) count++;
    if (state.coreFeatures.length > 0) count++;
    if (state.integrations.length > 0) count++;
    if (state.userFlows.length > 0) count++;
    if (state.colors.primary) count++;
    if (state.typography) count++;
    if (state.language) count++;
    if (state.platform) count++;
    if (state.authType) count++;
    if (state.paymentMethods.length > 0) count++;
    if (state.notificationChannels.length > 0) count++;
    if (state.designStyle) count++;
    return count;
  };

  const totalFields = 20;
  const filledFields = countFilledFields();
  const progressPercentage = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Progress Bar */}
        <Card className="border border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso do Conceito</span>
              <span className="text-sm text-primary font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filledFields} de {totalFields} seções preenchidas
            </p>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 1: APP NAME */}
        {/* ============================================ */}
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

        {/* ============================================ */}
        {/* SECTION 2: VISÃO E CONCEITO */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Visão e Conceito Central
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                Para quem é este aplicativo?
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Descreva o público-alvo detalhadamente
              </p>
              <Textarea
                value={state.targetAudience}
                onChange={(e) => updateState({ targetAudience: e.target.value })}
                className="min-h-[80px] resize-none"
                placeholder="Ex: Donos de barbearias e salões masculinos que desejam modernizar o atendimento..."
              />
              {state.targetAudience && <p className="text-xs text-green-500 mt-1">✓ preenchido</p>}
            </div>

            <div>
              <Label className="text-sm flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-primary" />
                Qual é a principal tarefa do app?
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                A função core que resolve o problema principal
              </p>
              <Textarea
                value={state.mainTask}
                onChange={(e) => updateState({ mainTask: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Ex: Permitir que clientes agendem cortes de cabelo, visualizando horários disponíveis de cada barbeiro..."
              />
              {state.mainTask && <p className="text-xs text-green-500 mt-1">✓ preenchido</p>}
            </div>

            <div>
              <Label className="text-sm flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-primary" />
                Qual o maior benefício para o usuário?
              </Label>
              <Textarea
                value={state.mainBenefit}
                onChange={(e) => updateState({ mainBenefit: e.target.value })}
                className="min-h-[80px] resize-none"
                placeholder="Ex: Eliminar agendamentos por telefone, reduzir faltas em até 70%..."
              />
              {state.mainBenefit && <p className="text-xs text-green-500 mt-1">✓ preenchido</p>}
            </div>

            <div>
              <Label className="text-sm flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                Quem utiliza o app no dia a dia?
              </Label>
              <Textarea
                value={state.dailyUsers}
                onChange={(e) => updateState({ dailyUsers: e.target.value })}
                className="min-h-[60px] resize-none"
                placeholder="Ex: Clientes finais, barbeiros, e administradores..."
              />
              {state.dailyUsers && <p className="text-xs text-green-500 mt-1">✓ preenchido</p>}
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 3: MODELO DE NEGÓCIO */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Modelo de Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-primary" />
                Como o negócio gera receita?
              </Label>
              <Textarea
                value={state.businessModel}
                onChange={(e) => updateState({ businessModel: e.target.value })}
                className="min-h-[80px] resize-none"
                placeholder="Ex: Agendamento online com cobrança de sinal (10-30% do valor)..."
              />
              {state.businessModel && <p className="text-xs text-green-500 mt-1">✓ preenchido</p>}
            </div>

            <div>
              <Label className="text-sm flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-primary" />
                Qual problema principal o app resolve?
              </Label>
              <Textarea
                value={state.mainProblem}
                onChange={(e) => updateState({ mainProblem: e.target.value })}
                className="min-h-[80px] resize-none"
                placeholder="Ex: Barbearias perdem até 30% do faturamento com no-shows..."
              />
              {state.mainProblem && <p className="text-xs text-green-500 mt-1">✓ preenchido</p>}
            </div>

            <div>
              <Label className="text-sm flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                Qual o resultado esperado do dashboard?
              </Label>
              <Textarea
                value={state.expectedOutcome}
                onChange={(e) => updateState({ expectedOutcome: e.target.value })}
                className="min-h-[80px] resize-none"
                placeholder="Ex: Dashboard mostrando agenda do dia, taxa de ocupação, faturamento..."
              />
              {state.expectedOutcome && <p className="text-xs text-green-500 mt-1">✓ preenchido</p>}
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 4: PÁGINAS E NAVEGAÇÃO */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              Estrutura de Páginas e Navegação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Páginas pré-configuradas para o nicho de {template.niche}. Adicione ou remova conforme necessário.
            </p>
            
            <div className="flex flex-wrap gap-2">
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
                placeholder="Adicionar nova página..."
                onKeyDown={(e) => e.key === 'Enter' && addToArray('pages', newPage, setNewPage)}
              />
              <Button onClick={() => addToArray('pages', newPage, setNewPage)} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-xs text-green-500">✓ {state.pages.length} páginas configuradas</p>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 5: FUNCIONALIDADES CORE */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
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

            {/* Suggested Features from Template */}
            <div className="pt-4 border-t">
              <Label className="text-sm mb-2 block">Funcionalidades Sugeridas para {template.niche}</Label>
              <div className="flex flex-wrap gap-2">
                {template.suggestedFeatures.map((feature) => {
                  const isSelected = state.selectedSuggestedFeatures.includes(feature);
                  return (
                    <Badge
                      key={feature}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all py-1.5 px-2 text-xs ${
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
              <Label className="text-sm flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-primary" />
                Recursos adicionais personalizados
              </Label>
              <Textarea
                value={state.additionalFeatures}
                onChange={(e) => updateState({ additionalFeatures: e.target.value })}
                placeholder="Liste outros recursos importantes que não estão nas sugestões..."
                className="min-h-[60px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 6: INTEGRAÇÕES */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wifi className="w-5 h-5 text-primary" />
              Integrações e APIs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
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
              />
              <Button onClick={() => addToArray('integrations', newIntegration, setNewIntegration)} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 7: FLUXOS DE USUÁRIO */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Workflow className="w-5 h-5 text-primary" />
              Fluxos de Usuário (User Flows)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Descreva as jornadas principais dos usuários no app
            </p>
            
            <div className="space-y-2">
              {state.userFlows.map((flow, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground min-w-[24px]">{index + 1}.</span>
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
                placeholder="Ex: Cliente abre app → Escolhe serviço → Agenda → Paga → Recebe confirmação"
                onKeyDown={(e) => e.key === 'Enter' && addToArray('userFlows', newUserFlow, setNewUserFlow)}
              />
              <Button onClick={() => addToArray('userFlows', newUserFlow, setNewUserFlow)} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 8: IDENTIDADE VISUAL */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Identidade Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Presets */}
            <div>
              <Label className="text-sm mb-3 block">Paletas Sugeridas</Label>
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
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.accent }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'primary', label: 'Cor Primária', desc: 'CTAs, headers, ícones principais' },
                { key: 'secondary', label: 'Cor Secundária', desc: 'Cards de destaque, badges' },
                { key: 'accent', label: 'Cor de Destaque', desc: 'Detalhes, hover states' },
                { key: 'background', label: 'Cor de Fundo', desc: 'Background da aplicação' },
                { key: 'text', label: 'Cor do Texto', desc: 'Textos e ícones' },
              ].map((color) => (
                <div key={color.key} className="space-y-2">
                  <Label className="text-sm">{color.label}</Label>
                  <p className="text-xs text-muted-foreground">{color.desc}</p>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer relative overflow-hidden"
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
                      className="font-mono text-xs flex-1"
                    />
                  </div>
                </div>
              ))}
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
                Preview da Identidade Visual
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
                <Badge style={{ backgroundColor: state.colors.accent, color: 'white' }}>
                  Destaque
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 9: TIPOGRAFIA & DESIGN */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Tipografia e Estilo de Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Typography */}
            <div>
              <Label className="text-sm mb-3 block">Fonte Principal</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {visibleTypography.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => updateState({ typography: font.name })}
                    className={`
                      p-3 rounded-xl border-2 text-left transition-all
                      ${state.typography === font.name 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                    style={{ fontFamily: font.name }}
                  >
                    <p className="font-bold text-sm">{font.name}</p>
                    <p className="text-xs text-muted-foreground">{font.category}</p>
                  </button>
                ))}
              </div>

              {!showMoreTypography && (
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground mt-2"
                  onClick={() => setShowMoreTypography(true)}
                >
                  Ver mais opções
                </Button>
              )}
            </div>

            {/* Design Style */}
            <div className="pt-4 border-t">
              <Label className="text-sm mb-3 block flex items-center gap-2">
                <Brush className="w-4 h-4 text-primary" />
                Estilo de Design
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    <p className="font-semibold text-sm">{style.name}</p>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Style */}
            <div className="pt-4 border-t">
              <Label className="text-sm mb-3 block">Estilo de Ícones</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_STYLES.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => updateState({ iconStyle: icon.id })}
                    className={`
                      px-4 py-2 rounded-lg border-2 transition-all
                      ${state.iconStyle === icon.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <p className="font-medium text-sm">{icon.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 10: CONFIGURAÇÕES TÉCNICAS */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Configurações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auth Type */}
            <div>
              <Label className="text-sm mb-3 block">Tipo de Autenticação</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    <p className="font-semibold text-sm">{auth.name}</p>
                    <p className="text-xs text-muted-foreground">{auth.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="pt-4 border-t">
              <Label className="text-sm mb-3 block flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Métodos de Pagamento
              </Label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = state.paymentMethods.includes(method.id);
                  return (
                    <Badge
                      key={method.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all py-2 px-3 ${
                        isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-primary/10 hover:border-primary'
                      }`}
                      onClick={() => toggleArrayItem('paymentMethods', method.id)}
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1" />}
                      {method.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Notification Channels */}
            <div className="pt-4 border-t">
              <Label className="text-sm mb-3 block flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Canais de Notificação
              </Label>
              <div className="flex flex-wrap gap-2">
                {NOTIFICATION_CHANNELS.map((channel) => {
                  const isSelected = state.notificationChannels.includes(channel.id);
                  return (
                    <Badge
                      key={channel.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all py-2 px-3 ${
                        isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-primary/10 hover:border-primary'
                      }`}
                      onClick={() => toggleArrayItem('notificationChannels', channel.id)}
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1" />}
                      {channel.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <div>
                    <Label className="text-sm">Mobile First</Label>
                    <p className="text-xs text-muted-foreground">Priorizar design para dispositivos móveis</p>
                  </div>
                </div>
                <Switch 
                  checked={state.mobileFirst}
                  onCheckedChange={(checked) => updateState({ mobileFirst: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  <div>
                    <Label className="text-sm">PWA Support</Label>
                    <p className="text-xs text-muted-foreground">Instalar como app no celular</p>
                  </div>
                </div>
                <Switch 
                  checked={state.pwaSupport}
                  onCheckedChange={(checked) => updateState({ pwaSupport: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-primary" />
                  <div>
                    <Label className="text-sm">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Suporte a modo escuro</p>
                  </div>
                </div>
                <Switch 
                  checked={state.darkMode}
                  onCheckedChange={(checked) => updateState({ darkMode: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 11: IDIOMA */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Idioma e Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  <span className="font-medium text-sm">{lang.name}</span>
                  {state.language === lang.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SECTION 12: PLATAFORMA DE IA */}
        {/* ============================================ */}
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Plataforma de Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Selecione a plataforma de IA que você planeja usar. Isso otimizará o prompt.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AI_PLATFORMS.map((platform) => (
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
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center mb-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
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

        {/* Generate Button */}
        <Button 
          size="lg" 
          className="w-full gap-2 h-16 text-lg bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-lg shadow-primary/25"
          onClick={onGenerate}
        >
          <Rocket className="w-6 h-6" />
          Materializar Conceito ({progressPercentage}% completo)
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
