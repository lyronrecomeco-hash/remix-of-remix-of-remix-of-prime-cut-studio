import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
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

  const handleSelectTemplate = (template: NicheTemplate) => {
    setSelectedTemplate(template);
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

  return (
    <div className="space-y-6">
      {/* Header with greeting - only for customize step */}
      {currentStep === 'customize' && (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <div className="text-center space-y-2">
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
          </div>
        </div>
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
          onBack={() => setCurrentStep('customize')}
        />
      )}
    </div>
  );
};
