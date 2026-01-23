import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CriarProjetosSelector, TemplateInfo } from './CriarProjetosSelector';
import { CriarProjetosCustomizer } from './CriarProjetosCustomizer';
import { ProjectLibrary } from '../library/ProjectLibrary';
import { ProjectConfig } from '../library/ProjectCard';

interface CriarProjetosTabProps {
  affiliateId: string | null;
  onBack: () => void;
}

type View = 'library' | 'select' | 'customize';

export function CriarProjetosTab({ affiliateId, onBack }: CriarProjetosTabProps) {
  const [view, setView] = useState<View>('library');
  
  // Customization state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);
  const [editingConfig, setEditingConfig] = useState<ProjectConfig | null>(null);

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

  if (!affiliateId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      <AnimatePresence mode="wait">
        {view === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ProjectLibrary
              affiliateId={affiliateId}
              onEdit={handleEdit}
              onCreateNew={() => setView('select')}
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
              affiliateId={affiliateId}
              onBack={handleBackFromCustomize}
              onSaved={handleSaved}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
