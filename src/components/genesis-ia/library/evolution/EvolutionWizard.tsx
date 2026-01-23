import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
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
    // Auto advance to form when selecting
    setStep('form');
  };

  const handleAnswerChange = (fieldId: string, value: string | boolean | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleGeneratePrompt = () => {
    if (!selectedType) return;

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

  return (
    <div className="space-y-4">
      {/* Modal-like Header - Primary Color */}
      <div className="flex items-center justify-between p-3 rounded-t-xl bg-white/5 border border-white/10 border-b-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Evoluir {project.client_name || project.template_name}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Selecione o tipo de atualização
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-7 w-7 rounded-full hover:bg-white/10"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="p-3 rounded-b-xl bg-white/5 border border-white/10 border-t-0 -mt-4">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Form Header with selected type - Primary Color */}
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  {selectedType.title}
                </span>
              </div>

              <EvolutionForm
                evolutionType={selectedType}
                answers={answers}
                onChange={handleAnswerChange}
              />

              {/* Generate Button - Primary Color */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-[11px] h-7"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleGeneratePrompt}
                  size="sm"
                  className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-7 text-[11px]"
                >
                  GERAR UPDATE
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
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
      </div>
    </div>
  );
}
