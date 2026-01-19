import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CriarProjetosSelector, TemplateInfo } from './CriarProjetosSelector';
import { CriarProjetosManager, ProjectConfig } from './CriarProjetosManager';

interface CriarProjetosTabProps {
  affiliateId: string | null;
  onBack: () => void;
}

type View = 'list' | 'select' | 'customize';

export function CriarProjetosTab({ affiliateId, onBack }: CriarProjetosTabProps) {
  const [view, setView] = useState<View>('list');
  const [configs, setConfigs] = useState<ProjectConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Customization state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);
  const [editingConfig, setEditingConfig] = useState<ProjectConfig | null>(null);
  const [clientName, setClientName] = useState('');
  const [customSlug, setCustomSlug] = useState('');

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
    setClientName('');
    setCustomSlug('');
    setEditingConfig(null);
    setView('customize');
  };

  const handleEdit = (config: ProjectConfig) => {
    setEditingConfig(config);
    setClientName(config.client_name || '');
    setCustomSlug(config.custom_slug || '');
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
    return true;
  };

  const generateUniqueCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSave = async () => {
    if (!affiliateId || !selectedTemplate) return;

    // Validate custom slug
    if (customSlug) {
      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(customSlug)) {
        toast.error('Rota inválida', {
          description: 'Use apenas letras minúsculas, números e hífens'
        });
        return;
      }

      // Check if slug is unique
      const { data: existing } = await supabase
        .from('affiliate_template_configs')
        .select('id')
        .eq('custom_slug', customSlug)
        .neq('id', editingConfig?.id || '')
        .maybeSingle();

      if (existing) {
        toast.error('Rota já em uso', {
          description: 'Escolha outra rota personalizada'
        });
        return;
      }
    }

    setSaving(true);

    try {
      if (editingConfig) {
        // Update existing
        const { error } = await supabase
          .from('affiliate_template_configs')
          .update({
            client_name: clientName || null,
            custom_slug: customSlug || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast.success('Projeto atualizado!');
      } else {
        // Create new
        const uniqueCode = generateUniqueCode();
        const { error } = await supabase
          .from('affiliate_template_configs')
          .insert({
            affiliate_id: affiliateId,
            template_slug: selectedTemplate.id,
            template_name: selectedTemplate.name,
            unique_code: uniqueCode,
            custom_slug: customSlug || null,
            client_name: clientName || null,
            config: {},
            is_active: true
          });

        if (error) throw error;
        toast.success('Projeto criado!', {
          description: `Link: genesishub.cloud/${customSlug || uniqueCode}`
        });
      }

      await loadConfigs();
      setView('list');
      setSelectedTemplate(null);
      setEditingConfig(null);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar projeto');
    }

    setSaving(false);
  };

  const handleBack = () => {
    if (view === 'customize') {
      setView('select');
      setSelectedTemplate(null);
      setEditingConfig(null);
    } else if (view === 'select') {
      setView('list');
    } else {
      onBack();
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'list': return 'Criar Projetos';
      case 'select': return 'Escolher Template';
      case 'customize': return editingConfig ? 'Editar Projeto' : 'Personalizar';
      default: return 'Criar Projetos';
    }
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{getTitle()}</h1>
      </div>

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
            <CriarProjetosSelector onSelect={handleSelectTemplate} />
          </motion.div>
        )}

        {view === 'customize' && selectedTemplate && (
          <motion.div
            key="customize"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-lg mx-auto"
          >
            <div className="space-y-6">
              {/* Template Info */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <h3 className="font-semibold text-foreground">{selectedTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nome do Cliente (opcional)</Label>
                  <Input
                    id="clientName"
                    placeholder="Ex: Pet Shop do João"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customSlug">Rota Personalizada (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      genesishub.cloud/
                    </span>
                    <Input
                      id="customSlug"
                      placeholder="minha-rota"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use apenas letras minúsculas, números e hífens
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingConfig ? 'Atualizar' : 'Criar Projeto'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
