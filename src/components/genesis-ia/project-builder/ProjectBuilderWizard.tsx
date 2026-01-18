import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectBuilderProvider, useProjectBuilder } from './ProjectBuilderContext';
import { TemplateSelector } from './TemplateSelector';
import { StepTargetAI } from './steps/StepTargetAI';
import { StepIdentity } from './steps/StepIdentity';
import { StepObjectives } from './steps/StepObjectives';
import { StepStructure } from './steps/StepStructure';
import { StepDesign } from './steps/StepDesign';
import { StepFeatures } from './steps/StepFeatures';
import { StepQuality } from './steps/StepQuality';
import { StepResult } from './steps/StepResult';

interface ProjectBuilderWizardProps {
  onBack: () => void;
}

const STEP_TITLES = [
  'IA Destino',
  'Identidade',
  'Objetivos',
  'Estrutura',
  'Design',
  'Funcionalidades',
  'Qualidade',
];

const STEP_DESCRIPTIONS = [
  'Escolha a plataforma de IA para gerar seu projeto',
  'Defina as informações básicas do seu negócio',
  'Quais são os objetivos principais do site?',
  'Defina as páginas e seções do projeto',
  'Configure o visual e identidade',
  'Adicione funcionalidades específicas',
  'Defina os padrões de qualidade',
];

const WizardContent: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    selectedTemplate,
    setSelectedTemplate,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    canProceed,
    resetBuilder,
  } = useProjectBuilder();

  const [showTemplates, setShowTemplates] = useState(!selectedTemplate);

  const handleTemplateSelect = (template: typeof selectedTemplate) => {
    setSelectedTemplate(template);
  };

  const handleTemplateContinue = () => {
    if (selectedTemplate) {
      setShowTemplates(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setShowTemplates(true);
    } else {
      prevStep();
    }
  };

  const handleMainBack = () => {
    resetBuilder();
    onBack();
  };

  // Show template selector
  if (showTemplates) {
    return (
      <TemplateSelector
        selectedTemplate={selectedTemplate}
        onSelect={handleTemplateSelect}
        onBack={handleMainBack}
        onContinue={handleTemplateContinue}
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepTargetAI />;
      case 2: return <StepIdentity />;
      case 3: return <StepObjectives />;
      case 4: return <StepStructure />;
      case 5: return <StepDesign />;
      case 6: return <StepFeatures />;
      case 7: return <StepQuality />;
      default: return null;
    }
  };

  const isLastStep = currentStep === totalSteps;
  const showResult = currentStep === totalSteps && canProceed;

  return (
    <div className="w-full min-h-[calc(100vh-200px)]">
      {/* Main Container with proper max-width for desktop */}
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBack} 
              className="h-12 w-12 rounded-xl shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl lg:text-4xl">{selectedTemplate?.icon}</span>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground truncate">
                  {selectedTemplate?.name}
                </h1>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground">
                {STEP_DESCRIPTIONS[currentStep - 1]}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-border">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Etapa {currentStep} de {totalSteps}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Steps - Desktop Style */}
        <div className="hidden lg:block mb-10">
          <div className="flex items-center justify-between">
            {STEP_TITLES.map((title, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;
              
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
                        ${isCompleted 
                          ? 'bg-primary text-primary-foreground' 
                          : isActive 
                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/30' 
                            : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : stepNum}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {title}
                    </span>
                  </div>
                  
                  {i < STEP_TITLES.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                      i < currentStep - 1 ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Mobile Progress */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              {STEP_TITLES[currentStep - 1]}
            </span>
            <span className="text-sm text-muted-foreground">
              {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-card border border-border rounded-2xl p-6 lg:p-10 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={showResult ? 'result' : currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="min-h-[400px] lg:min-h-[500px]"
            >
              {showResult ? <StepResult /> : renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        {!showResult && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-border">
            <Button 
              variant="outline" 
              onClick={handleBack}
              size="lg"
              className="h-12 px-6 text-base"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>

            <Button 
              onClick={nextStep} 
              disabled={!canProceed}
              size="lg"
              className="h-12 px-8 text-base"
            >
              {isLastStep ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Prompt
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProjectBuilderWizard: React.FC<ProjectBuilderWizardProps> = ({ onBack }) => {
  return (
    <ProjectBuilderProvider>
      <WizardContent onBack={onBack} />
    </ProjectBuilderProvider>
  );
};
