import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  GitBranch,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  leadsCount?: number;
  totalValue?: number;
}

export default function CRMPipelines() {
  const { crmTenant, crmUser, isAdmin } = useCRM();
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false,
  });

  useEffect(() => {
    if (crmTenant) {
      fetchPipelines();
    }
  }, [crmTenant]);

  const fetchPipelines = async () => {
    if (!crmTenant) return;

    try {
      setIsLoading(true);

      const { data: pipelinesData } = await supabase
        .from('crm_pipelines')
        .select('*')
        .eq('crm_tenant_id', crmTenant.id)
        .order('created_at');

      if (pipelinesData) {
        // Get leads count and value for each pipeline
        const { data: leadsData } = await supabase
          .from('crm_leads')
          .select('id, value, pipeline_id')
          .eq('crm_tenant_id', crmTenant.id);

        const enrichedPipelines = pipelinesData.map((pipeline) => {
          const pipelineLeads = leadsData?.filter((l) => l.pipeline_id === pipeline.id) || [];
          return {
            ...pipeline,
            leadsCount: pipelineLeads.length,
            totalValue: pipelineLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0),
          };
        });

        setPipelines(enrichedPipelines);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (pipeline?: Pipeline) => {
    if (pipeline) {
      setSelectedPipeline(pipeline);
      setFormData({
        name: pipeline.name,
        description: pipeline.description || '',
        is_default: pipeline.is_default,
      });
    } else {
      setSelectedPipeline(null);
      setFormData({
        name: '',
        description: '',
        is_default: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmTenant || !formData.name.trim()) return;

    try {
      setIsSubmitting(true);

      // If setting as default, unset others
      if (formData.is_default) {
        await supabase
          .from('crm_pipelines')
          .update({ is_default: false })
          .eq('crm_tenant_id', crmTenant.id);
      }

      const pipelineData = {
        crm_tenant_id: crmTenant.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_default: formData.is_default,
        created_by: crmUser?.id,
      };

      if (selectedPipeline) {
        const { error } = await supabase
          .from('crm_pipelines')
          .update(pipelineData)
          .eq('id', selectedPipeline.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('crm_pipelines')
          .insert(pipelineData);

        if (error) throw error;
      }

      toast({
        title: selectedPipeline ? 'Pipeline atualizado' : 'Pipeline criado',
        description: 'As alterações foram salvas com sucesso',
      });

      setIsModalOpen(false);
      fetchPipelines();
    } catch (error) {
      console.error('Error saving pipeline:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o pipeline',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pipeline: Pipeline) => {
    if (pipeline.is_default) {
      toast({
        title: 'Atenção',
        description: 'Não é possível excluir o pipeline padrão',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Deseja realmente excluir o pipeline "${pipeline.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('crm_pipelines')
        .delete()
        .eq('id', pipeline.id);

      if (error) throw error;

      toast({
        title: 'Pipeline excluído',
        description: 'O pipeline foi removido com sucesso',
      });

      fetchPipelines();
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o pipeline',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (pipeline: Pipeline) => {
    try {
      const { error } = await supabase
        .from('crm_pipelines')
        .update({ is_active: !pipeline.is_active })
        .eq('id', pipeline.id);

      if (error) throw error;

      setPipelines((prev) =>
        prev.map((p) =>
          p.id === pipeline.id ? { ...p, is_active: !p.is_active } : p
        )
      );

      toast({
        title: pipeline.is_active ? 'Pipeline desativado' : 'Pipeline ativado',
      });
    } catch (error) {
      console.error('Error toggling pipeline:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pipelines</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pipelines</h1>
          <p className="text-muted-foreground">
            Gerencie seus pipelines de vendas
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Pipeline
          </Button>
        )}
      </div>

      {/* Pipelines Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pipelines.map((pipeline, index) => (
          <motion.div
            key={pipeline.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`hover:shadow-lg transition-all ${
                !pipeline.is_active && 'opacity-60'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GitBranch className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {pipeline.name}
                        {pipeline.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Padrão
                          </Badge>
                        )}
                      </CardTitle>
                      {pipeline.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {pipeline.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenModal(pipeline)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(pipeline)}
                          className="text-destructive"
                          disabled={pipeline.is_default}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{pipeline.leadsCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Leads</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-bold">
                        {formatCurrency(pipeline.totalValue || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Ativo</span>
                    <Switch
                      checked={pipeline.is_active}
                      onCheckedChange={() => toggleActive(pipeline)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {pipelines.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum pipeline</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro pipeline para organizar suas vendas
              </p>
              {isAdmin && (
                <Button onClick={() => handleOpenModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Pipeline
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPipeline ? 'Editar Pipeline' : 'Novo Pipeline'}
            </DialogTitle>
            <DialogDescription>
              {selectedPipeline
                ? 'Atualize as informações do pipeline'
                : 'Crie um novo pipeline para organizar suas vendas'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do pipeline"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição do pipeline..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_default">Pipeline padrão</Label>
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_default: checked })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
                {isSubmitting ? 'Salvando...' : selectedPipeline ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
