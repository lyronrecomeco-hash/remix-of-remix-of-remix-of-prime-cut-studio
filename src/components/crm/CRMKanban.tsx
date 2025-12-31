import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  User,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  value: number;
  stage_id: string | null;
  responsible_id: string | null;
  stage_entered_at: string;
  responsible?: { name: string } | null;
  tags?: { id: string; name: string; color: string }[];
}

interface Stage {
  id: string;
  name: string;
  color: string;
  position: number;
  is_final: boolean;
  is_won: boolean;
  funnel_id: string;
}

interface Funnel {
  id: string;
  name: string;
}

export default function CRMKanban() {
  const { crmTenant, crmUser } = useCRM();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  useEffect(() => {
    if (crmTenant) {
      fetchFunnels();
    }
  }, [crmTenant]);

  useEffect(() => {
    if (selectedFunnel) {
      fetchStagesAndLeads();
    }
  }, [selectedFunnel]);

  const fetchFunnels = async () => {
    if (!crmTenant) return;

    try {
      const { data } = await supabase
        .from('crm_funnels')
        .select('id, name')
        .eq('crm_tenant_id', crmTenant.id)
        .eq('is_active', true)
        .order('position');

      setFunnels(data || []);
      if (data && data.length > 0 && !selectedFunnel) {
        setSelectedFunnel(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching funnels:', error);
    }
  };

  const fetchStagesAndLeads = async () => {
    if (!crmTenant || !selectedFunnel) return;

    try {
      setIsLoading(true);

      // Fetch stages
      const { data: stagesData } = await supabase
        .from('crm_funnel_stages')
        .select('*')
        .eq('crm_tenant_id', crmTenant.id)
        .eq('funnel_id', selectedFunnel)
        .order('position');

      setStages(stagesData || []);

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('crm_leads')
        .select(`
          id, name, email, phone, value, stage_id, responsible_id, stage_entered_at,
          responsible:crm_users(name)
        `)
        .eq('crm_tenant_id', crmTenant.id)
        .eq('funnel_id', selectedFunnel)
        .in('status', ['new', 'active']);

      // Fetch tags
      if (leadsData) {
        const leadIds = leadsData.map((l) => l.id);
        const { data: leadTagsData } = await supabase
          .from('crm_lead_tags')
          .select('lead_id, tag:crm_tags(id, name, color)')
          .in('lead_id', leadIds);

        const leadsWithTags = leadsData.map((lead) => ({
          ...lead,
          responsible: null,
          tags: leadTagsData
            ?.filter((lt) => lt.lead_id === lead.id)
            .map((lt) => lt.tag as unknown as { id: string; name: string; color: string })
            .filter(Boolean) || [],
        }));

        setLeads(leadsWithTags as Lead[]);
      }
    } catch (error) {
      console.error('Error fetching kanban data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedLead || draggedLead.stage_id === stageId) {
      setDraggedLead(null);
      return;
    }

    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;

    try {
      // Update lead
      const updateData: Record<string, unknown> = {
        stage_id: stageId,
        stage_entered_at: new Date().toISOString(),
      };

      // If moving to a final stage
      if (stage.is_final) {
        updateData.status = stage.is_won ? 'won' : 'lost';
        if (stage.is_won) {
          updateData.won_at = new Date().toISOString();
        } else {
          updateData.lost_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('crm_leads')
        .update(updateData)
        .eq('id', draggedLead.id);

      if (error) throw error;

      // Log history
      await supabase.from('crm_lead_history').insert({
        crm_tenant_id: crmTenant?.id,
        lead_id: draggedLead.id,
        user_id: crmUser?.id,
        action: 'stage_changed',
        old_value: { stage_id: draggedLead.stage_id },
        new_value: { stage_id: stageId },
      });

      // Update local state
      setLeads((prev) =>
        prev.map((l) =>
          l.id === draggedLead.id
            ? { ...l, stage_id: stageId, stage_entered_at: new Date().toISOString() }
            : l
        ).filter((l) => !stage.is_final || l.id !== draggedLead.id)
      );

      toast({
        title: 'Lead movido',
        description: `${draggedLead.name} foi movido para ${stage.name}`,
      });
    } catch (error) {
      console.error('Error moving lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível mover o lead',
        variant: 'destructive',
      });
    } finally {
      setDraggedLead(null);
    }
  };

  const getLeadsForStage = (stageId: string) => {
    return leads.filter((l) => l.stage_id === stageId);
  };

  const getTotalValue = (stageId: string) => {
    return getLeadsForStage(stageId).reduce(
      (sum, l) => sum + (Number(l.value) || 0),
      0
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(value);
  };

  const getTimeInStage = (enteredAt: string) => {
    const now = new Date();
    const entered = new Date(enteredAt);
    const diffMs = now.getTime() - entered.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return '1 dia';
    return `${diffDays} dias`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Funis & Kanban</h1>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-80 shrink-0">
              <Card className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-40 bg-muted rounded" />
                </CardContent>
              </Card>
            </div>
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
          <h1 className="text-2xl font-bold">Funis & Kanban</h1>
          <p className="text-muted-foreground">
            Arraste os leads entre as etapas do funil
          </p>
        </div>
        <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Selecione um funil" />
          </SelectTrigger>
          <SelectContent>
            {funnels.map((funnel) => (
              <SelectItem key={funnel.id} value={funnel.id}>
                {funnel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      {stages.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {stages.map((stage) => {
            const stageLeads = getLeadsForStage(stage.id);
            const totalValue = getTotalValue(stage.id);

            return (
              <div
                key={stage.id}
                className="w-80 shrink-0"
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <Card
                  className={cn(
                    'h-full transition-all',
                    dragOverStage === stage.id && 'ring-2 ring-primary'
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <CardTitle className="text-base">{stage.name}</CardTitle>
                        <Badge variant="secondary" className="ml-1">
                          {stageLeads.length}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(totalValue)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    <AnimatePresence>
                      {stageLeads.map((lead) => (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lead)}
                          className={cn(
                            'p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing',
                            'hover:shadow-md transition-shadow',
                            draggedLead?.id === lead.id && 'opacity-50'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{lead.name}</p>
                              {lead.email && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {lead.email}
                                </p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center justify-between mt-3 text-xs">
                            <div className="flex items-center gap-1 text-primary font-medium">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(Number(lead.value) || 0)}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {getTimeInStage(lead.stage_entered_at)}
                            </div>
                          </div>

                          {lead.responsible && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              {lead.responsible.name}
                            </div>
                          )}

                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {lead.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0"
                                  style={{
                                    borderColor: tag.color,
                                    color: tag.color,
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {lead.tags.length > 2 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  +{lead.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {stageLeads.length === 0 && (
                      <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                        Arraste leads para cá
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhuma etapa configurada neste funil
            </p>
            <Button variant="outline">Configurar Funil</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
