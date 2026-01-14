import { useState } from 'react';
import { 
  Layout, 
  Palette, 
  Type, 
  Globe, 
  Cpu, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Wand2,
  Eye,
  ChevronRight,
  Rocket
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TemplateSelector } from '../prompt-builder/TemplateSelector';
import { PromptBuilderForm } from '../prompt-builder/PromptBuilderForm';
import { PromptPreview } from '../prompt-builder/PromptPreview';
import { NicheTemplate, PromptBuilderState } from '../prompt-builder/types';
import { NICHE_TEMPLATES } from '../prompt-builder/templates';
import { generateFinalPrompt } from '../prompt-builder/promptGenerator';
import { toast } from 'sonner';

interface ReadyTemplatesTabProps {
  affiliateId: string;
}

type BuilderStep = 'templates' | 'customize' | 'preview';

export const ReadyTemplatesTab = ({ affiliateId }: ReadyTemplatesTabProps) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<NicheTemplate | null>(null);
  const [builderState, setBuilderState] = useState<PromptBuilderState | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (template: NicheTemplate) => {
    setSelectedTemplate(template);
    // Initialize builder state with template defaults
    setBuilderState({
      appName: template.defaultAppName,
      targetAudience: template.targetAudience,
      mainTask: template.mainTask,
      mainBenefit: template.mainBenefit,
      dailyUsers: template.dailyUsers,
      pages: [...template.defaultPages],
      additionalFeatures: '',
      colors: {
        primary: template.suggestedColors.primary,
        secondary: template.suggestedColors.secondary,
        background: '#ffffff',
        text: '#1a1a1a',
      },
      typography: 'Poppins',
      language: 'pt-BR',
      platform: 'lovable',
      suggestedFeatures: [...template.suggestedFeatures],
      selectedSuggestedFeatures: [],
    });
    setCurrentStep('customize');
  };

  const handleCustomize = (state: PromptBuilderState) => {
    setBuilderState(state);
  };

  const handleGeneratePrompt = () => {
    if (!builderState || !selectedTemplate) return;
    
    const prompt = generateFinalPrompt(builderState, selectedTemplate);
    setGeneratedPrompt(prompt);
    setCurrentStep('preview');
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success('Prompt copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar prompt');
    }
  };

  const handleBack = () => {
    if (currentStep === 'customize') {
      setCurrentStep('templates');
      setSelectedTemplate(null);
      setBuilderState(null);
    } else if (currentStep === 'preview') {
      setCurrentStep('customize');
    }
  };

  const handleStartFromScratch = () => {
    // Create empty state for custom build
    setSelectedTemplate({
      id: 'custom',
      name: 'Projeto Personalizado',
      niche: 'Personalizado',
      icon: 'Wand2',
      description: 'Crie seu projeto do zero com total liberdade',
      defaultAppName: 'Meu App',
      targetAudience: '',
      mainTask: '',
      mainBenefit: '',
      dailyUsers: '',
      defaultPages: [],
      suggestedFeatures: [],
      suggestedColors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
      },
    });
    setBuilderState({
      appName: 'Meu App',
      targetAudience: '',
      mainTask: '',
      mainBenefit: '',
      dailyUsers: '',
      pages: [],
      additionalFeatures: '',
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#1a1a1a',
      },
      typography: 'Poppins',
      language: 'pt-BR',
      platform: 'lovable',
      suggestedFeatures: [],
      selectedSuggestedFeatures: [],
    });
    setCurrentStep('customize');
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'templates', label: 'Escolher Modelo', icon: Layout },
      { id: 'customize', label: 'Personalizar', icon: Palette },
      { id: 'preview', label: 'Gerar Prompt', icon: Rocket },
    ];

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isPast = steps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : isPast 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {isPast ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Back Button */}
      {currentStep !== 'templates' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      )}

      {/* Step Content */}
      {currentStep === 'templates' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Modelos Prontos
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Escolha um template por nicho para começar rapidamente, ou crie do zero com nosso Prompt Builder profissional
            </p>
          </div>

          {/* Start from Scratch Card */}
          <Card 
            className="border-dashed border-2 border-primary/30 bg-primary/5 cursor-pointer hover:border-primary hover:bg-primary/10 transition-all group"
            onClick={handleStartFromScratch}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                <Wand2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Criar do Zero
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use o Prompt Builder para criar um prompt totalmente personalizado
              </p>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Personalização Total
              </Badge>
            </CardContent>
          </Card>

          {/* Template Selector */}
          <TemplateSelector 
            templates={NICHE_TEMPLATES}
            onSelect={handleSelectTemplate}
          />
        </div>
      )}

      {currentStep === 'customize' && builderState && selectedTemplate && (
        <PromptBuilderForm
          state={builderState}
          template={selectedTemplate}
          onChange={handleCustomize}
          onGenerate={handleGeneratePrompt}
        />
      )}

      {currentStep === 'preview' && (
        <PromptPreview
          prompt={generatedPrompt}
          platform={builderState?.platform || 'lovable'}
          onCopy={handleCopyPrompt}
          copied={copied}
          onRegenerate={() => setCurrentStep('customize')}
        />
      )}
    </div>
  );
};
