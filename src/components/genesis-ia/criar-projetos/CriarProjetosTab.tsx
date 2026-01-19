import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CriarProjetosSelector, TemplateInfo } from './CriarProjetosSelector';
import { CriarProjetosManager, ProjectConfig } from './CriarProjetosManager';
import { CriarProjetosCustomizer } from './CriarProjetosCustomizer';

interface CriarProjetosTabProps {
  affiliateId: string | null;
  onBack: () => void;
}

type View = 'list' | 'select' | 'customize';

export function CriarProjetosTab({ affiliateId, onBack }: CriarProjetosTabProps) {
  const [view, setView] = useState<View>('list');
  const [configs, setConfigs] = useState<ProjectConfig[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Customization state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);
  const [editingConfig, setEditingConfig] = useState<ProjectConfig | null>(null);

  useEffect(() => {
    if (affiliateId) {
      loadConfigs();
    }
  }, [affiliateId]);

  const loadConfigs = async () => {
    if (!affiliateId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('affiliate_template_configs')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading configs:', error);
      toast.error('Erro ao carregar projetos');
    } else {
      setConfigs(data as ProjectConfig[]);
    }
    setLoading(false);
  };

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

  const handleDelete = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('affiliate_template_configs')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir projeto');
      return false;
    }

    toast.success('Projeto excluído');
    await loadConfigs();
    return true;
  };

  const handleSaved = async () => {
    await loadConfigs();
    setView('list');
    setSelectedTemplate(null);
    setEditingConfig(null);
  };

  const handleBackFromCustomize = () => {
    if (editingConfig) {
      setView('list');
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
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <CriarProjetosManager
              configs={configs}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
              onBack={() => setView('list')}
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
