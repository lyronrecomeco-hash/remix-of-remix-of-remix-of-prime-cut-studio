import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Check,
  Copy,
  Rocket,
  Sparkles,
  ChevronRight,
  Layout,
  Palette,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateGallery } from '../prompt-builder/TemplateGallery';
import { PromptBuilderFormV2 } from '../prompt-builder/PromptBuilderFormV2';
import { PromptPreviewV2 } from '../prompt-builder/PromptPreviewV2';
import { NicheTemplate, PromptBuilderState } from '../prompt-builder/types';
import { NICHE_TEMPLATES } from '../prompt-builder/templates';
import { generateMasterPrompt } from '../prompt-builder/masterPromptGenerator';
import { toast } from 'sonner';

interface ReadyTemplatesTabProps {
  affiliateId: string;
}

type BuilderStep = 'gallery' | 'customize' | 'preview';

export const ReadyTemplatesTab = ({ affiliateId }: ReadyTemplatesTabProps) => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('gallery');
  const [selectedTemplate, setSelectedTemplate] = useState<NicheTemplate | null>(null);
  const [builderState, setBuilderState] = useState<PromptBuilderState | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [fieldsCompleted, setFieldsCompleted] = useState(0);
  const [totalFields, setTotalFields] = useState(14);

  // Calculate completed fields
  useEffect(() => {
    if (!builderState) return;
    
    let completed = 0;
    if (builderState.appName) completed++;
    if (builderState.targetAudience) completed++;
    if (builderState.mainTask) completed++;
    if (builderState.mainBenefit) completed++;
    if (builderState.dailyUsers) completed++;
    if (builderState.pages.length > 0) completed++;
    if (builderState.colors.primary) completed++;
    if (builderState.colors.secondary) completed++;
    if (builderState.colors.background) completed++;
    if (builderState.colors.text) completed++;
    if (builderState.typography) completed++;
    if (builderState.language) completed++;
    if (builderState.platform) completed++;
    if (builderState.selectedSuggestedFeatures.length > 0) completed++;
    
    setFieldsCompleted(completed);
  }, [builderState]);

  const handleSelectTemplate = (template: NicheTemplate) => {
    setSelectedTemplate(template);
    // Initialize builder state with template defaults - 90% pre-filled
    setBuilderState({
      appName: template.defaultAppName,
      targetAudience: template.targetAudience,
      mainTask: template.mainTask,
      mainBenefit: template.mainBenefit,
      dailyUsers: template.dailyUsers,
      businessModel: template.businessModel,
      mainProblem: template.mainProblem,
      expectedOutcome: template.expectedOutcome,
      pages: [...template.defaultPages],
      additionalFeatures: '',
      coreFeatures: [...template.coreFeatures],
      integrations: [...template.integrations],
      userFlows: [...template.userFlows],
      colors: {
        primary: template.suggestedColors.primary,
        secondary: template.suggestedColors.secondary,
        accent: template.suggestedColors.accent,
        background: template.suggestedColors.background,
        text: '#ffffff',
      },
      typography: 'Poppins',
      designStyle: template.designStyle,
      iconStyle: template.iconStyle,
      language: 'pt-BR',
      platform: 'lovable',
      suggestedFeatures: [...template.suggestedFeatures],
      selectedSuggestedFeatures: template.suggestedFeatures.slice(0, 6),
      authType: 'email',
      paymentMethods: ['pix', 'credit-card'],
      notificationChannels: ['whatsapp', 'email'],
      mobileFirst: true,
      pwaSupport: true,
      darkMode: true,
    });
    setCurrentStep('customize');
  };

  const handleCustomize = (state: PromptBuilderState) => {
    setBuilderState(state);
  };

  const handleGeneratePrompt = () => {
    if (!builderState || !selectedTemplate) return;
    
    const prompt = generateMasterPrompt(builderState, selectedTemplate);
    setGeneratedPrompt(prompt);
    setCurrentStep('preview');
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success('Prompt Master copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar prompt');
    }
  };

  const handleBack = () => {
    if (currentStep === 'customize') {
      setCurrentStep('gallery');
      setSelectedTemplate(null);
      setBuilderState(null);
    } else if (currentStep === 'preview') {
      setCurrentStep('customize');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'gallery', label: 'Escolher Modelo', icon: Layout, description: 'Selecione um template' },
      { id: 'customize', label: 'Personalizar', icon: Palette, description: 'Configure seu app' },
      { id: 'preview', label: 'Materializar', icon: Rocket, description: 'Gere o prompt' },
    ];

    return (
      <div className="flex items-center justify-center gap-1 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isPast = steps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/30' 
                  : isPast 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted/50 text-muted-foreground'
                }
              `}>
                {isPast ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      {currentStep === 'customize' && (
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Materializar SaaS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {getGreeting()}, Criador(a)!
          </h1>
          <p className="text-muted-foreground">
            Vamos começar a construir seu próximo grande projeto.
          </p>
          <p className="text-sm text-primary font-medium">
            {fieldsCompleted}/{totalFields} campos preenchidos
          </p>
        </div>
      )}

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Back Button */}
      {currentStep !== 'gallery' && (
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
      {currentStep === 'gallery' && (
        <TemplateGallery 
          templates={NICHE_TEMPLATES}
          onSelect={handleSelectTemplate}
        />
      )}

      {currentStep === 'customize' && builderState && selectedTemplate && (
        <PromptBuilderFormV2
          state={builderState}
          template={selectedTemplate}
          onChange={handleCustomize}
          onGenerate={handleGeneratePrompt}
        />
      )}

      {currentStep === 'preview' && (
        <PromptPreviewV2
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
