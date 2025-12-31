import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Kanban,
  Tag,
  XCircle,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Funnel {
  id: string;
  name: string;
  description: string | null;
  color: string;
  position: number;
  is_active: boolean;
  stages: Stage[];
}

interface Stage {
  id: string;
  name: string;
  color: string;
  position: number;
  is_final: boolean;
  is_won: boolean;
}

interface TagData {
  id: string;
  name: string;
  color: string;
}

interface LossReason {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

const colorOptions = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

export default function CRMSettings() {
  const { crmTenant, isAdmin } = useCRM();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('funnels');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);
  const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
  
  // Modals
  const [isFunnelModalOpen, setIsFunnelModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isLossReasonModalOpen, setIsLossReasonModalOpen] = useState(false);
  
  // Selected items
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [selectedLossReason, setSelectedLossReason] = useState<LossReason | null>(null);
  
  // Form states
  const [funnelForm, setFunnelForm] = useState({ name: '', description: '', color: '#3b82f6' });
  const [stageForm, setStageForm] = useState({ name: '', color: '#6b7280', is_final: false, is_won: false });
  const [tagForm, setTagForm] = useState({ name: '', color: '#3b82f6' });
  const [lossReasonForm, setLossReasonForm] = useState({ name: '', description: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (crmTenant) {
      fetchData();
    }
  }, [crmTenant]);

  const fetchData = async () => {
    if (!crmTenant) return;

    try {
      setIsLoading(true);

      // Fetch funnels with stages
      const { data: funnelsData } = await supabase
        .from('crm_funnels')
        .select('*')
        .eq('crm_tenant_id', crmTenant.id)
        .order('position');

      const { data: stagesData } = await supabase
        .from('crm_funnel_stages')
        .select('*')
        .eq('crm_tenant_id', crmTenant.id)
        .order('position');

      if (funnelsData) {
        const funnelsWithStages = funnelsData.map((funnel) => ({
          ...funnel,
          stages: stagesData?.filter((s) => s.funnel_id === funnel.id) || [],
        }));
        setFunnels(funnelsWithStages);
      }

      // Fetch tags
      const { data: tagsData } = await supabase
        .from('crm_tags')
        .select('*')
        .eq('crm_tenant_id', crmTenant.id)
        .order('name');

      setTags(tagsData || []);

      // Fetch loss reasons
      const { data: lossReasonsData } = await supabase
        .from('crm_loss_reasons')
        .select('*')
        .eq('crm_tenant_id', crmTenant.id)
        .order('name');

      setLossReasons(lossReasonsData || []);
    } catch (error) {
      console.error('Error fetching settings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funnel handlers
  const handleSaveFunnel = async () => {
    if (!crmTenant || !funnelForm.name.trim()) return;

    try {
      setIsSubmitting(true);

      if (selectedFunnel) {
        await supabase
          .from('crm_funnels')
          .update({
            name: funnelForm.name.trim(),
            description: funnelForm.description.trim() || null,
            color: funnelForm.color,
          })
          .eq('id', selectedFunnel.id);
      } else {
        const position = funnels.length;
        await supabase.from('crm_funnels').insert({
          crm_tenant_id: crmTenant.id,
          name: funnelForm.name.trim(),
          description: funnelForm.description.trim() || null,
          color: funnelForm.color,
          position,
        });
      }

      toast({ title: 'Funil salvo com sucesso' });
      setIsFunnelModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving funnel:', error);
      toast({ title: 'Erro ao salvar funil', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stage handlers
  const handleSaveStage = async () => {
    if (!crmTenant || !selectedFunnel || !stageForm.name.trim()) return;

    try {
      setIsSubmitting(true);

      if (selectedStage) {
        await supabase
          .from('crm_funnel_stages')
          .update({
            name: stageForm.name.trim(),
            color: stageForm.color,
            is_final: stageForm.is_final,
            is_won: stageForm.is_won,
          })
          .eq('id', selectedStage.id);
      } else {
        const position = selectedFunnel.stages.length;
        await supabase.from('crm_funnel_stages').insert({
          crm_tenant_id: crmTenant.id,
          funnel_id: selectedFunnel.id,
          name: stageForm.name.trim(),
          color: stageForm.color,
          position,
          is_final: stageForm.is_final,
          is_won: stageForm.is_won,
        });
      }

      toast({ title: 'Etapa salva com sucesso' });
      setIsStageModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving stage:', error);
      toast({ title: 'Erro ao salvar etapa', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tag handlers
  const handleSaveTag = async () => {
    if (!crmTenant || !tagForm.name.trim()) return;

    try {
      setIsSubmitting(true);

      if (selectedTag) {
        await supabase
          .from('crm_tags')
          .update({
            name: tagForm.name.trim(),
            color: tagForm.color,
          })
          .eq('id', selectedTag.id);
      } else {
        await supabase.from('crm_tags').insert({
          crm_tenant_id: crmTenant.id,
          name: tagForm.name.trim(),
          color: tagForm.color,
        });
      }

      toast({ title: 'Tag salva com sucesso' });
      setIsTagModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({ title: 'Erro ao salvar tag', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (tag: TagData) => {
    if (!confirm(`Excluir a tag "${tag.name}"?`)) return;

    try {
      await supabase.from('crm_tags').delete().eq('id', tag.id);
      toast({ title: 'Tag excluída' });
      fetchData();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({ title: 'Erro ao excluir tag', variant: 'destructive' });
    }
  };

  // Loss reason handlers
  const handleSaveLossReason = async () => {
    if (!crmTenant || !lossReasonForm.name.trim()) return;

    try {
      setIsSubmitting(true);

      if (selectedLossReason) {
        await supabase
          .from('crm_loss_reasons')
          .update({
            name: lossReasonForm.name.trim(),
            description: lossReasonForm.description.trim() || null,
          })
          .eq('id', selectedLossReason.id);
      } else {
        await supabase.from('crm_loss_reasons').insert({
          crm_tenant_id: crmTenant.id,
          name: lossReasonForm.name.trim(),
          description: lossReasonForm.description.trim() || null,
        });
      }

      toast({ title: 'Motivo de perda salvo' });
      setIsLossReasonModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving loss reason:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Acesso restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar as configurações
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Configure funis, etapas, tags e mais
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="funnels" className="gap-2">
            <Kanban className="w-4 h-4" />
            <span className="hidden sm:inline">Funis</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <Tag className="w-4 h-4" />
            <span className="hidden sm:inline">Tags</span>
          </TabsTrigger>
          <TabsTrigger value="loss-reasons" className="gap-2">
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Motivos de Perda</span>
          </TabsTrigger>
        </TabsList>

        {/* Funnels Tab */}
        <TabsContent value="funnels" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedFunnel(null);
                setFunnelForm({ name: '', description: '', color: '#3b82f6' });
                setIsFunnelModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Funil
            </Button>
          </div>

          <div className="space-y-4">
            {funnels.map((funnel, index) => (
              <motion.div
                key={funnel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: funnel.color }}
                        />
                        <CardTitle className="text-lg">{funnel.name}</CardTitle>
                        {!funnel.is_active && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFunnel(funnel);
                          setFunnelForm({
                            name: funnel.name,
                            description: funnel.description || '',
                            color: funnel.color,
                          });
                          setIsFunnelModalOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                    {funnel.description && (
                      <CardDescription>{funnel.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Etapas</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFunnel(funnel);
                            setSelectedStage(null);
                            setStageForm({ name: '', color: '#6b7280', is_final: false, is_won: false });
                            setIsStageModalOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Etapa
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {funnel.stages.map((stage) => (
                          <Badge
                            key={stage.id}
                            variant="secondary"
                            className="cursor-pointer hover:opacity-80"
                            style={{
                              backgroundColor: `${stage.color}20`,
                              color: stage.color,
                              borderColor: stage.color,
                            }}
                            onClick={() => {
                              setSelectedFunnel(funnel);
                              setSelectedStage(stage);
                              setStageForm({
                                name: stage.name,
                                color: stage.color,
                                is_final: stage.is_final,
                                is_won: stage.is_won,
                              });
                              setIsStageModalOpen(true);
                            }}
                          >
                            {stage.name}
                            {stage.is_final && (stage.is_won ? ' ✓' : ' ✗')}
                          </Badge>
                        ))}
                        {funnel.stages.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            Nenhuma etapa configurada
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedTag(null);
                setTagForm({ name: '', color: '#3b82f6' });
                setIsTagModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Tag
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="cursor-pointer text-sm py-1 px-3 group"
                    style={{
                      backgroundColor: tag.color,
                      color: '#fff',
                    }}
                    onClick={() => {
                      setSelectedTag(tag);
                      setTagForm({ name: tag.name, color: tag.color });
                      setIsTagModalOpen(true);
                    }}
                  >
                    {tag.name}
                    <button
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(tag);
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <p className="text-muted-foreground">Nenhuma tag cadastrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loss Reasons Tab */}
        <TabsContent value="loss-reasons" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedLossReason(null);
                setLossReasonForm({ name: '', description: '' });
                setIsLossReasonModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Motivo
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                {lossReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedLossReason(reason);
                      setLossReasonForm({
                        name: reason.name,
                        description: reason.description || '',
                      });
                      setIsLossReasonModalOpen(true);
                    }}
                  >
                    <div>
                      <p className="font-medium">{reason.name}</p>
                      {reason.description && (
                        <p className="text-sm text-muted-foreground">
                          {reason.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={reason.is_active ? 'default' : 'secondary'}>
                      {reason.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
                {lossReasons.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum motivo de perda cadastrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Funnel Modal */}
      <Dialog open={isFunnelModalOpen} onOpenChange={setIsFunnelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedFunnel ? 'Editar Funil' : 'Novo Funil'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={funnelForm.name}
                onChange={(e) => setFunnelForm({ ...funnelForm, name: e.target.value })}
                placeholder="Nome do funil"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={funnelForm.description}
                onChange={(e) => setFunnelForm({ ...funnelForm, description: e.target.value })}
                placeholder="Descrição (opcional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      funnelForm.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFunnelForm({ ...funnelForm, color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsFunnelModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveFunnel} disabled={isSubmitting || !funnelForm.name.trim()}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stage Modal */}
      <Dialog open={isStageModalOpen} onOpenChange={setIsStageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStage ? 'Editar Etapa' : 'Nova Etapa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={stageForm.name}
                onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                placeholder="Nome da etapa"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      stageForm.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setStageForm({ ...stageForm, color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Etapa final</Label>
              <Switch
                checked={stageForm.is_final}
                onCheckedChange={(checked) =>
                  setStageForm({ ...stageForm, is_final: checked, is_won: checked ? stageForm.is_won : false })
                }
              />
            </div>
            {stageForm.is_final && (
              <div className="flex items-center justify-between">
                <Label>Lead ganho?</Label>
                <Switch
                  checked={stageForm.is_won}
                  onCheckedChange={(checked) => setStageForm({ ...stageForm, is_won: checked })}
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsStageModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveStage} disabled={isSubmitting || !stageForm.name.trim()}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Modal */}
      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTag ? 'Editar Tag' : 'Nova Tag'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={tagForm.name}
                onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                placeholder="Nome da tag"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      tagForm.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setTagForm({ ...tagForm, color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsTagModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTag} disabled={isSubmitting || !tagForm.name.trim()}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loss Reason Modal */}
      <Dialog open={isLossReasonModalOpen} onOpenChange={setIsLossReasonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLossReason ? 'Editar Motivo' : 'Novo Motivo de Perda'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={lossReasonForm.name}
                onChange={(e) => setLossReasonForm({ ...lossReasonForm, name: e.target.value })}
                placeholder="Ex: Preço alto"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={lossReasonForm.description}
                onChange={(e) =>
                  setLossReasonForm({ ...lossReasonForm, description: e.target.value })
                }
                placeholder="Descrição adicional"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsLossReasonModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveLossReason}
                disabled={isSubmitting || !lossReasonForm.name.trim()}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
