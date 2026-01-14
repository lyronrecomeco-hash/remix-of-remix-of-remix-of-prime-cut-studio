import React from 'react';
import { WizardContainer } from './wizard';

interface CustomTemplateWizardProps {
  onBack: () => void;
  onComplete: (prompt: string) => void;
}

export function CustomTemplateWizard({ onBack, onComplete }: CustomTemplateWizardProps) {
  return (
    <div className="h-[80vh] min-h-[550px] overflow-hidden flex flex-col bg-background rounded-xl p-6">
      <WizardContainer onBack={onBack} onComplete={onComplete} />
    </div>
  );
}
