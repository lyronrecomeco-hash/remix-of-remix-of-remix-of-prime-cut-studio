import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EvolutionCards } from './EvolutionCards';
import { EvolutionForm } from './EvolutionForm';
import { EvolutionPreview } from './EvolutionPreview';
import { EvolutionType } from './evolutionTypes';
import { generateEvolutionPrompt, ProjectContext } from '@/lib/evolution/promptGenerator';
import { ProjectConfig } from '../ProjectCard';

interface EvolutionWizardProps {
  project: ProjectConfig;
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'select' | 'form' | 'preview';

export function EvolutionWizard({ project, onBack, onComplete }: EvolutionWizardProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<EvolutionType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | boolean | string[]>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSelectType = (type: EvolutionType) => {
    setSelectedType(type);
  };

  const handleAnswerChange = (fieldId: string, value: string | boolean | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    if (step === 'select' && selectedType) {
      setStep('form');
    } else if (step === 'form' && selectedType) {
      // Validate required fields
      const missingRequired = selectedType.fields
        .filter((f) => f.required)
        .filter((f) => {
          const value = answers[f.id];
          return !value || (typeof value === 'string' && value.trim() === '');
        });

      if (missingRequired.length > 0) {
        toast.error('Preencha os campos obrigatórios', {
          description: missingRequired.map((f) => f.label).join(', '),
        });
        return;
      }

      // Generate prompt
      const projectContext: ProjectContext = {
        name: project.client_name || project.template_name,
        templateName: project.template_name,
        templateSlug: project.template_slug,
        platform: project.platform || 'lovable',
        customSlug: project.custom_slug || undefined,
        updatedAt: new Date(project.updated_at).toLocaleDateString('pt-BR'),
      };

      const prompt = generateEvolutionPrompt(projectContext, selectedType, answers);
      setGeneratedPrompt(prompt);
      setStep('preview');
    }
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('select');
    } else if (step === 'preview') {
      setStep('form');
    } else {
      onBack();
    }
  };

  const handleSave = async () => {
    if (!selectedType) return;

    setSaving(true);
    try {
      // Save to project_evolutions table
      const { error } = await supabase.from('project_evolutions').insert({
        project_id: project.id,
        evolution_type: selectedType.id,
        prompt_generated: generatedPrompt,
        answers: answers,
      });

      if (error) throw error;

      // Update project's evolution_history
      const newHistory = [
        ...(Array.isArray(project.evolution_history) ? project.evolution_history : []),
        {
          type: selectedType.id,
          title: selectedType.title,
          date: new Date().toISOString(),
        },
      ];

      await supabase
        .from('affiliate_template_configs')
        .update({
          evolution_history: newHistory,
          last_prompt: generatedPrompt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);

      toast.success('Evolução salva!', {
        description: 'O prompt foi salvo no histórico do projeto.',
      });

      onComplete();
    } catch (error) {
      console.error('Error saving evolution:', error);
      toast.error('Erro ao salvar evolução');
    } finally {
      setSaving(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'select':
        return 'Selecione o tipo de evolução';
      case 'form':
        return 'Preencha as informações';
      case 'preview':
        return 'Prompt gerado';
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'select':
        return 1;
      case 'form':
        return 2;
      case 'preview':
        return 3;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Evoluir: {project.client_name || project.template_name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Passo {getStepNumber()} de 3 • {getStepTitle()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= getStepNumber()
                ? 'bg-gradient-to-r from-primary to-purple-600'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <EvolutionCards
              selectedType={selectedType}
              onSelect={handleSelectType}
            />
          </motion.div>
        )}

        {step === 'form' && selectedType && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <EvolutionForm
              evolutionType={selectedType}
              answers={answers}
              onChange={handleAnswerChange}
            />
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <EvolutionPreview
              prompt={generatedPrompt}
              platform={project.platform || 'lovable'}
              onSave={handleSave}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      {step !== 'preview' && (
        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            onClick={handleNext}
            disabled={step === 'select' && !selectedType}
            className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            {step === 'form' ? (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Prompt
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
