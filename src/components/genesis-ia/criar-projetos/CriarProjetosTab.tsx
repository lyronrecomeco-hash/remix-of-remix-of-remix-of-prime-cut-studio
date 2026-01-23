import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CriarProjetosSelector, TemplateInfo } from './CriarProjetosSelector';
import { CriarProjetosCustomizer } from './CriarProjetosCustomizer';
import { ProjectLibrary } from '../library/ProjectLibrary';
import { ProjectConfig } from '../library/ProjectCard';
import { CreationMethodModal } from './from-scratch/CreationMethodModal';
import { FromScratchWizard } from './from-scratch/FromScratchWizard';

interface CriarProjetosTabProps {
  affiliateId: string | null;
  userId?: string;
  onBack: () => void;
}

type View = 'library' | 'select' | 'customize' | 'from-scratch';

export function CriarProjetosTab({ affiliateId, userId, onBack }: CriarProjetosTabProps) {
  const [view, setView] = useState<View>('library');
  const [showMethodModal, setShowMethodModal] = useState(false);
  
  // Customization state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);
  const [editingConfig, setEditingConfig] = useState<ProjectConfig | null>(null);

  // Usar affiliateId se disponível, senão userId (para novos usuários que compraram acesso)
  const effectiveId = affiliateId || userId || null;

  const handleSelectTemplate = (template: TemplateInfo) => {
    setSelectedTemplate(template);
    setEditingConfig(null);
    setView('customize');
  };

  const handleEdit = (config: ProjectConfig) => {
    setEditingConfig(config);
    setSelectedTemplate({
      id: config.template_slug,
      name: config.template_name,
      description: '',
      category: 'all',
      route: '',
      gradient: '',
      accent: '',
      available: true,
      preview: { title: '', subtitle: '', badge: '' }
    });
    setView('customize');
  };

  const handleSaved = () => {
    setView('library');
    setSelectedTemplate(null);
    setEditingConfig(null);
  };

  const handleBackFromCustomize = () => {
    if (editingConfig) {
      setView('library');
    } else {
      setView('select');
    }
    setSelectedTemplate(null);
    setEditingConfig(null);
  };

  const handleCreateNew = () => {
    setShowMethodModal(true);
  };

  const handleSelectTemplateMethod = () => {
    setShowMethodModal(false);
    setView('select');
  };

  const handleStartFromScratch = () => {
    setShowMethodModal(false);
    setView('from-scratch');
  };

  const handleFromScratchComplete = () => {
    setView('library');
  };

  const handleFromScratchBack = () => {
    setView('library');
  };

  if (!effectiveId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-2">
          <Loader2 className="w-8 h-8 text-white/30" />
        </div>
        <p className="text-muted-foreground">Carregando sua biblioteca...</p>
        <p className="text-sm text-muted-foreground/70">Se demorar, atualize a página.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Creation Method Modal */}
      <AnimatePresence>
        {showMethodModal && (
          <CreationMethodModal
            isOpen={showMethodModal}
            onClose={() => setShowMethodModal(false)}
            onSelectTemplate={handleSelectTemplateMethod}
            onStartFromScratch={handleStartFromScratch}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ProjectLibrary
              affiliateId={effectiveId}
              onEdit={handleEdit}
              onCreateNew={handleCreateNew}
              onBack={onBack}
            />
          </motion.div>
        )}

        {view === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CriarProjetosSelector 
              onSelect={handleSelectTemplate} 
              onBack={() => setView('library')}
            />
          </motion.div>
        )}

        {view === 'customize' && selectedTemplate && (
          <motion.div
            key="customize"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CriarProjetosCustomizer
              template={selectedTemplate}
              editingConfig={editingConfig}
              affiliateId={effectiveId}
              onBack={handleBackFromCustomize}
              onSaved={handleSaved}
            />
          </motion.div>
        )}

        {view === 'from-scratch' && (
          <motion.div
            key="from-scratch"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FromScratchWizard
              onBack={handleFromScratchBack}
              onComplete={handleFromScratchComplete}
              affiliateId={effectiveId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}