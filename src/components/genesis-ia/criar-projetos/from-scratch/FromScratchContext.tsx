import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { FromScratchFormData, initialFromScratchFormData } from './types';
import { getNicheById } from './nicheContexts';
import { generateAdvancedPrompt } from './generateAdvancedPrompt';

interface FromScratchContextType {
  formData: FromScratchFormData;
  updateFormData: <K extends keyof FromScratchFormData>(key: K, value: FromScratchFormData[K]) => void;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  canProceed: boolean;
  generatedPrompt: string;
  generatePrompt: () => string;
  resetWizard: () => void;
  selectedNiche: ReturnType<typeof getNicheById>;
}

const FromScratchContext = createContext<FromScratchContextType | null>(null);

export function useFromScratch() {
  const context = useContext(FromScratchContext);
  if (!context) {
    throw new Error('useFromScratch must be used within FromScratchProvider');
  }
  return context;
}

interface FromScratchProviderProps {
  children: React.ReactNode;
}

export function FromScratchProvider({ children }: FromScratchProviderProps) {
  const [formData, setFormData] = useState<FromScratchFormData>(initialFromScratchFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 11;

  const selectedNiche = useMemo(() => {
    return formData.nicheId ? getNicheById(formData.nicheId) : undefined;
  }, [formData.nicheId]);

  const updateFormData = useCallback(<K extends keyof FromScratchFormData>(
    key: K,
    value: FromScratchFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1: // Project Type
        return !!formData.projectType;
      case 2: // Niche
        return !!formData.nicheId || !!formData.customNiche;
      case 3: // Identity
        return !!formData.projectName && !!formData.companyName;
      case 4: // Language
        return !!formData.language;
      case 5: // Objectives
        return formData.selectedObjectives.length > 0 || formData.customObjectives.length > 0;
      case 6: // Structure
        return formData.selectedPages.length > 0 || formData.customPages.length > 0;
      case 7: // Visual
        return !!formData.primaryColor && !!formData.typography;
      case 8: // Features
        return true; // Optional
      case 9: // Extras
        return true; // Optional
      case 10: // Target AI
        return !!formData.targetAI && (formData.targetAI !== 'other' || !!formData.otherAI);
      case 11: // Preview
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, canProceed]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const generatePrompt = useCallback(() => {
    return generateAdvancedPrompt(formData, selectedNiche);
  }, [formData, selectedNiche]);

  const generatedPrompt = useMemo(() => {
    if (currentStep === 11) {
      return generatePrompt();
    }
    return '';
  }, [currentStep, generatePrompt]);

  const resetWizard = useCallback(() => {
    setFormData(initialFromScratchFormData);
    setCurrentStep(1);
  }, []);

  const value: FromScratchContextType = {
    formData,
    updateFormData,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    generatedPrompt,
    generatePrompt,
    resetWizard,
    selectedNiche,
  };

  return (
    <FromScratchContext.Provider value={value}>
      {children}
    </FromScratchContext.Provider>
  );
}
