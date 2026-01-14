import React from 'react';
import { WizardContainer } from './wizard';

interface CustomTemplateWizardProps {
  onBack: () => void;
  onComplete: (prompt: string) => void;
}

export function CustomTemplateWizard({ onBack, onComplete }: CustomTemplateWizardProps) {
  return (
    <div className="h-full min-h-[500px] max-h-[80vh] overflow-hidden flex flex-col bg-background rounded-xl p-6">
      <WizardContainer onBack={onBack} onComplete={onComplete} />
    </div>
  );
}
