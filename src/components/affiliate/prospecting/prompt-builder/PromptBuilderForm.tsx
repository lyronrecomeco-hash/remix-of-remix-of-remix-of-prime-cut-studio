import { useState } from 'react';
import { 
  Layout, 
  Palette, 
  Type, 
  Globe, 
  Cpu, 
  Sparkles,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Rocket,
  Eye,
  Users,
  Target,
  Heart,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NicheTemplate, PromptBuilderState, AI_PLATFORMS, TYPOGRAPHY_OPTIONS, LANGUAGE_OPTIONS } from './types';
import { ColorPicker } from './ColorPicker';
import { LivePreview } from './LivePreview';

interface PromptBuilderFormProps {
  state: PromptBuilderState;
  template: NicheTemplate;
  onChange: (state: PromptBuilderState) => void;
  onGenerate: () => void;
}

export const PromptBuilderForm = ({ state, template, onChange, onGenerate }: PromptBuilderFormProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['info', 'pages', 'visual']);
  const [newPage, setNewPage] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

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

  const SectionCard = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: React.ComponentType<{ className?: string }>; 
    children: React.ReactNode 
  }) => {
    const isExpanded = expandedSections.includes(id);
    
    return (
      <Card className="border border-border">
        <Collapsible open={isExpanded} onOpenChange={() => toggleSection(id)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {children}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Sections */}
      <div className="lg:col-span-2 space-y-4">
        {/* Basic Info */}
        <SectionCard id="info" title="Informações do Aplicativo" icon={FileText}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="appName">Nome do aplicativo/site</Label>
              <Input
                id="appName"
                value={state.appName}
                onChange={(e) => updateState({ appName: e.target.value })}
                placeholder="Ex: Barbearia Fácil"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="targetAudience" className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Para quem é este aplicativo
              </Label>
              <Input
                id="targetAudience"
                value={state.targetAudience}
                onChange={(e) => updateState({ targetAudience: e.target.value })}
                placeholder="Ex: Donos de barbearia"
                className="mt-1"
              />
              {template.targetAudience && state.targetAudience === template.targetAudience && (
                <p className="text-xs text-muted-foreground mt-1">
                  ✓ Preenchido automaticamente do modelo
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="mainTask" className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                Principal tarefa do aplicativo
              </Label>
              <Input
                id="mainTask"
                value={state.mainTask}
                onChange={(e) => updateState({ mainTask: e.target.value })}
                placeholder="Ex: Gerenciar agendamentos online"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="mainBenefit" className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                Maior benefício oferecido
              </Label>
              <Input
                id="mainBenefit"
                value={state.mainBenefit}
                onChange={(e) => updateState({ mainBenefit: e.target.value })}
                placeholder="Ex: Reduzir faltas e organizar agenda"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="dailyUsers">Quem utiliza o app no dia a dia</Label>
              <Input
                id="dailyUsers"
                value={state.dailyUsers}
                onChange={(e) => updateState({ dailyUsers: e.target.value })}
                placeholder="Ex: Clientes e administradores"
                className="mt-1"
              />
            </div>
          </div>
        </SectionCard>

        {/* Pages & Menu */}
        <SectionCard id="pages" title="Páginas e Menus" icon={Layout}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {state.pages.map((page, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="gap-1 pr-1"
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
            
            <div>
              <Label htmlFor="additionalFeatures">Recursos adicionais (opcional)</Label>
              <Textarea
                id="additionalFeatures"
                value={state.additionalFeatures}
                onChange={(e) => updateState({ additionalFeatures: e.target.value })}
                placeholder="Descreva funcionalidades extras que você deseja..."
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>
        </SectionCard>

        {/* Visual Identity */}
        <SectionCard id="visual" title="Identidade Visual" icon={Palette}>
          <ColorPicker
            colors={state.colors}
            onChange={(colors) => updateState({ colors })}
          />
        </SectionCard>

        {/* Typography */}
        <SectionCard id="typography" title="Tipografia" icon={Type}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TYPOGRAPHY_OPTIONS.map((font) => (
              <button
                key={font.id}
                onClick={() => updateState({ typography: font.name })}
                className={`
                  p-3 rounded-lg border text-left transition-all
                  ${state.typography === font.name 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
                style={{ fontFamily: font.name }}
              >
                <p className="font-medium text-sm">{font.name}</p>
                <p className="text-xs text-muted-foreground">{font.category}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Language */}
        <SectionCard id="language" title="Idioma do Aplicativo" icon={Globe}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.id}
                onClick={() => updateState({ language: lang.id })}
                className={`
                  p-3 rounded-lg border text-left transition-all flex items-center gap-2
                  ${state.language === lang.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
          {state.language === 'other' && (
            <Input
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              placeholder="Digite o idioma..."
              className="mt-2"
            />
          )}
        </SectionCard>

        {/* AI Platform */}
        <SectionCard id="platform" title="Plataforma de Criação (IA)" icon={Cpu}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AI_PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => updateState({ platform: platform.id })}
                className={`
                  p-3 rounded-lg border text-left transition-all
                  ${state.platform === platform.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <p className="font-medium text-sm">{platform.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{platform.description}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Suggested Features */}
        <SectionCard id="features" title="Funcionalidades Sugeridas" icon={Sparkles}>
          <p className="text-sm text-muted-foreground mb-3">
            Selecione as funcionalidades que deseja incluir no seu projeto:
          </p>
          <div className="flex flex-wrap gap-2">
            {template.suggestedFeatures.map((feature) => {
              const isSelected = state.selectedSuggestedFeatures.includes(feature);
              return (
                <Badge
                  key={feature}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'bg-primary' : 'hover:bg-primary/10'
                  }`}
                  onClick={() => toggleSuggestedFeature(feature)}
                >
                  {isSelected && <Check className="w-3 h-3 mr-1" />}
                  {feature}
                </Badge>
              );
            })}
          </div>
        </SectionCard>

        {/* Generate Button */}
        <Button 
          size="lg" 
          className="w-full gap-2 h-14 text-lg"
          onClick={onGenerate}
        >
          <Rocket className="w-5 h-5" />
          Materializar Conceito
        </Button>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <LivePreview state={state} template={template} />
        </div>
      </div>
    </div>
  );
};
