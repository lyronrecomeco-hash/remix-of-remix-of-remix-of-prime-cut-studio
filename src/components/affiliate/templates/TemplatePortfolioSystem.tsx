import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutGrid, FolderOpen } from 'lucide-react';
import { TemplateEditor } from './TemplateEditor';
import { PortfolioManager } from './PortfolioManager';
import { useTemplateConfigs } from './useTemplateConfigs';
import { TemplateInfo, AffiliateTemplateConfig, TemplateConfig } from './types';
import { TemplateSelector } from './TemplateSelector';
import { TemplateChoiceModal } from './TemplateChoiceModal';
import { CustomTemplateWizard } from './CustomTemplateWizard';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { toast } from 'sonner';

interface TemplatePortfolioSystemProps {
  affiliateId: string;
}

type ViewState = 
  | { type: 'list' }
  | { type: 'select-template' }
  | { type: 'custom-wizard' }
  | { type: 'editor'; template: TemplateInfo; existingConfig?: AffiliateTemplateConfig };

// Templates disponíveis
const TEMPLATES: TemplateInfo[] = [
  {
    id: 'barbearia',
    name: 'Barbearia Premium',
    description: 'Para barbearias modernas e tradicionais',
    category: 'beauty',
    route: '/barbearia',
    gradient: 'from-amber-900 via-zinc-900 to-zinc-950',
    accent: 'amber',
    available: true,
    preview: {
      title: 'Barber Studio',
      subtitle: 'Tradição e Estilo',
      badge: '✂️ Experiência Premium'
    }
  },
  {
    id: 'academia',
    name: 'Academia Fitness',
    description: 'Para academias, personal trainers e crossfit',
    category: 'health',
    route: '/academia',
    gradient: 'from-red-900 via-zinc-900 to-zinc-950',
    accent: 'red',
    available: true,
    preview: {
      title: 'Power Gym',
      subtitle: 'Transforme seu corpo',
      badge: '💪 Treine com os melhores'
    }
  },
  {
    id: 'clinica-estetica',
    name: 'Clínica de Estética',
    description: 'Para clínicas de estética e estética avançada',
    category: 'beauty',
    route: '/clinica-estetica',
    gradient: 'from-stone-800 via-stone-900 to-stone-950',
    accent: 'amber',
    available: true,
    preview: {
      title: 'Essence Estética',
      subtitle: 'Realce sua beleza natural',
      badge: '✨ Estética Avançada'
    }
  },
];

export function TemplatePortfolioSystem({ affiliateId }: TemplatePortfolioSystemProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'portfolios'>('templates');
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  
  const {
    configs,
    loading,
    saving,
    createConfig,
    updateConfig,
    deleteConfig,
  } = useTemplateConfigs(affiliateId);

  const handleSelectTemplate = (template: TemplateInfo) => {
    setViewState({ type: 'editor', template });
  };

  const handleEditConfig = (config: AffiliateTemplateConfig) => {
    const template = TEMPLATES.find(t => t.id === config.template_slug);
    if (template) {
      setViewState({ type: 'editor', template, existingConfig: config });
    }
  };

  const handleSaveConfig = async (clientName: string, config: TemplateConfig) => {
    if (viewState.type !== 'editor') return null;
    
    const result = await createConfig(
      viewState.template.id,
      viewState.template.name,
      clientName,
      config
    );
    
    return result;
  };

  const handleUpdateConfig = async (id: string, updates: { client_name: string; config: TemplateConfig }) => {
    return await updateConfig(id, updates);
  };

  const handleBack = () => {
    setViewState({ type: 'list' });
  };

  const handleCreateNew = () => {
    setChoiceModalOpen(true);
  };

  const handleChooseReady = () => {
    setActiveTab('templates');
  };

  const handleChooseCustom = () => {
    setWizardOpen(true);
  };

  const handleWizardComplete = (prompt: string) => {
    setWizardOpen(false);
    toast.success('Prompt gerado! Cole na Lovable para criar seu site personalizado.');
  };

  // Se estiver no editor, mostrar o editor
  if (viewState.type === 'editor') {
    return (
      <TemplateEditor
        template={viewState.template}
        existingConfig={viewState.existingConfig}
        onBack={handleBack}
        onSave={handleSaveConfig}
        onUpdate={handleUpdateConfig}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com título e ação principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Central de Templates</h2>
          <p className="text-sm text-muted-foreground">
            Crie portfólios personalizados para seus clientes
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2 shrink-0">
          <LayoutGrid className="w-4 h-4" />
          Criar Novo Portfólio
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'templates' | 'portfolios')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="templates" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            Templates Disponíveis
          </TabsTrigger>
          <TabsTrigger value="portfolios" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Meus Portfólios
            {configs.length > 0 && (
              <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                {configs.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === 'portfolios' && (
            <TabsContent value="portfolios" className="mt-6" forceMount>
              <motion.div
                key="portfolios-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PortfolioManager
                  configs={configs}
                  loading={loading}
                  onEdit={handleEditConfig}
                  onDelete={deleteConfig}
                  onCreateNew={handleCreateNew}
                />
              </motion.div>
            </TabsContent>
          )}

          {activeTab === 'templates' && (
            <TabsContent value="templates" className="mt-6" forceMount>
              <motion.div
                key="templates-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TemplateSelector onSelect={handleSelectTemplate} />
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>

      {/* Choice Modal */}
      <TemplateChoiceModal
        open={choiceModalOpen}
        onOpenChange={setChoiceModalOpen}
        onChooseReady={handleChooseReady}
        onChooseCustom={handleChooseCustom}
      />

      {/* Custom Wizard Modal */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-4xl p-0 h-[90vh] overflow-hidden flex flex-col [&>button]:hidden" aria-describedby={undefined}>
          <VisuallyHidden>
            <DialogTitle>Criar Template com IA</DialogTitle>
          </VisuallyHidden>
          <CustomTemplateWizard
            onBack={() => setWizardOpen(false)}
            onComplete={handleWizardComplete}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
