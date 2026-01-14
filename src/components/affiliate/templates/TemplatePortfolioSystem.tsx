import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, FolderOpen } from 'lucide-react';
import { TemplateEditor } from './TemplateEditor';
import { PortfolioManager } from './PortfolioManager';
import { useTemplateConfigs } from './useTemplateConfigs';
import { TemplateInfo, AffiliateTemplateConfig, TemplateConfig } from './types';
import { TemplateSelector } from './TemplateSelector';

interface TemplatePortfolioSystemProps {
  affiliateId: string;
}

type ViewState = 
  | { type: 'list' }
  | { type: 'select-template' }
  | { type: 'editor'; template: TemplateInfo; existingConfig?: AffiliateTemplateConfig };

export function TemplatePortfolioSystem({ affiliateId }: TemplatePortfolioSystemProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'portfolios'>('templates');
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });
  
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
    // Encontrar o template correspondente
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'templates' | 'portfolios')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="templates" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            Templates
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
          <TabsContent value="templates" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TemplateSelector onSelect={handleSelectTemplate} />
            </motion.div>
          </TabsContent>

          <TabsContent value="portfolios" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PortfolioManager
                configs={configs}
                loading={loading}
                onEdit={handleEditConfig}
                onDelete={deleteConfig}
                onCreateNew={() => setActiveTab('templates')}
              />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

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
    description: 'Academias, personal trainers e crossfit',
    category: 'health',
    route: '/academia',
    gradient: 'from-red-900 via-zinc-900 to-zinc-950',
    accent: 'red',
    available: false,
    preview: {
      title: 'Power Gym',
      subtitle: 'Transforme seu corpo',
      badge: '💪 Treine com os melhores'
    }
  },
  {
    id: 'clinica',
    name: 'Clínica Médica',
    description: 'Consultórios, clínicas e especialistas',
    category: 'health',
    route: '/clinica',
    gradient: 'from-blue-900 via-zinc-900 to-zinc-950',
    accent: 'blue',
    available: false,
    preview: {
      title: 'Clínica Vida',
      subtitle: 'Cuidando de você',
      badge: '🏥 Saúde em primeiro lugar'
    }
  },
  {
    id: 'restaurante',
    name: 'Restaurante & Delivery',
    description: 'Cardápio digital e pedidos online',
    category: 'food',
    route: '/restaurante',
    gradient: 'from-orange-900 via-zinc-900 to-zinc-950',
    accent: 'orange',
    available: false,
    preview: {
      title: 'Sabor & Arte',
      subtitle: 'Gastronomia de verdade',
      badge: '🍽️ Cardápio digital'
    }
  },
  {
    id: 'salao',
    name: 'Salão de Beleza',
    description: 'Salões, nail designers e estéticas',
    category: 'beauty',
    route: '/salao',
    gradient: 'from-pink-900 via-zinc-900 to-zinc-950',
    accent: 'pink',
    available: false,
    preview: {
      title: 'Belle Studio',
      subtitle: 'Realce sua beleza',
      badge: '💅 Beleza & Bem-estar'
    }
  },
  {
    id: 'petshop',
    name: 'Pet Shop',
    description: 'Banho, tosa e produtos pet',
    category: 'services',
    route: '/petshop',
    gradient: 'from-violet-900 via-zinc-900 to-zinc-950',
    accent: 'violet',
    available: false,
    preview: {
      title: 'Pet Love',
      subtitle: 'Amor em cada patinha',
      badge: '🐾 Cuidado especial'
    }
  },
];
