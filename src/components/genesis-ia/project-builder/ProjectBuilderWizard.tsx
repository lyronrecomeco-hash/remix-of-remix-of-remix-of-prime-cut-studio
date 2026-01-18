import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
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
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="h-10 w-10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">
            {selectedTemplate?.icon} {selectedTemplate?.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Etapa {currentStep} de {totalSteps}: {STEP_TITLES[currentStep - 1]}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showResult ? 'result' : currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {showResult ? <StepResult /> : renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {!showResult && (
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Button onClick={nextStep} disabled={!canProceed}>
            {isLastStep ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Gerar Prompt
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
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
