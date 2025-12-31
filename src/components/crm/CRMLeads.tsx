import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Building,
  Tag,
  User,
  Users,
  Clock,
  Edit,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  origin: string | null;
  value: number;
  status: 'new' | 'active' | 'won' | 'lost';
  notes: string | null;
  stage_id: string | null;
  funnel_id: string | null;
  responsible_id: string | null;
  created_at: string;
  updated_at: string;
  stage?: { name: string; color: string } | null;
  responsible?: { name: string } | null;
  tags?: { id: string; name: string; color: string }[];
}

interface CRMUser {
  id: string;
  name: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  funnel_id: string;
}

interface Funnel {
  id: string;
  name: string;
}

interface TagOption {
  id: string;
  name: string;
  color: string;
}

export default function CRMLeads() {
  const { crmTenant, crmUser: currentUser } = useCRM();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    origin: '',
    value: '',
    notes: '',
    funnel_id: '',
    stage_id: '',
    responsible_id: '',
    selectedTags: [] as string[],
  });

  useEffect(() => {
    if (crmTenant) {
      fetchData();
    }
  }, [crmTenant]);

  const fetchData = async () => {
    if (!crmTenant) return;

    try {
      setIsLoading(true);

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('crm_leads')
        .select(`
          *,
          stage:crm_funnel_stages(name, color)
        `)
        .eq('crm_tenant_id', crmTenant.id)
        .order('created_at', { ascending: false });

      // Fetch lead tags
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
            .map((lt) => lt.tag as unknown as TagOption)
            .filter(Boolean) || [],
        })) as unknown as Lead[];

        setLeads(leadsWithTags);
      }

      // Fetch users
      const { data: usersData } = await supabase
        .from('crm_users')
        .select('id, name')
        .eq('crm_tenant_id', crmTenant.id)
        .eq('is_active', true);

      setUsers(usersData || []);

      // Fetch funnels
      const { data: funnelsData } = await supabase
        .from('crm_funnels')
        .select('id, name')
        .eq('crm_tenant_id', crmTenant.id)
        .eq('is_active', true);

      setFunnels(funnelsData || []);

      // Fetch stages
      const { data: stagesData } = await supabase
        .from('crm_funnel_stages')
        .select('id, name, color, funnel_id')
        .eq('crm_tenant_id', crmTenant.id)
        .order('position');

      setStages(stagesData || []);

      // Fetch tags
      const { data: tagsData } = await supabase
        .from('crm_tags')
        .select('id, name, color')
        .eq('crm_tenant_id', crmTenant.id);

      setTags(tagsData || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os leads',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (lead?: Lead) => {
    if (lead) {
      setSelectedLead(lead);
      setFormData({
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        origin: lead.origin || '',
        value: String(lead.value || ''),
        notes: lead.notes || '',
        funnel_id: lead.funnel_id || '',
        stage_id: lead.stage_id || '',
        responsible_id: lead.responsible_id || '',
        selectedTags: lead.tags?.map((t) => t.id) || [],
      });
    } else {
      setSelectedLead(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        origin: '',
        value: '',
        notes: '',
        funnel_id: funnels[0]?.id || '',
        stage_id: '',
        responsible_id: currentUser?.id || '',
        selectedTags: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmTenant || !formData.name.trim()) return;

    try {
      setIsSubmitting(true);

      const leadData = {
        crm_tenant_id: crmTenant.id,
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        company: formData.company.trim() || null,
        origin: formData.origin.trim() || null,
        value: parseFloat(formData.value) || 0,
        notes: formData.notes.trim() || null,
        funnel_id: formData.funnel_id || null,
        stage_id: formData.stage_id || null,
        responsible_id: formData.responsible_id || null,
        created_by: currentUser?.id,
      };

      let leadId: string;

      if (selectedLead) {
        const { error } = await supabase
          .from('crm_leads')
          .update(leadData)
          .eq('id', selectedLead.id);

        if (error) throw error;
        leadId = selectedLead.id;

        // Log history
        await supabase.from('crm_lead_history').insert({
          crm_tenant_id: crmTenant.id,
          lead_id: selectedLead.id,
          user_id: currentUser?.id,
          action: 'updated',
          old_value: { name: selectedLead.name },
          new_value: { name: leadData.name },
        });
      } else {
        const { data, error } = await supabase
          .from('crm_leads')
          .insert(leadData)
          .select()
          .single();

        if (error) throw error;
        leadId = data.id;

        // Log history
        await supabase.from('crm_lead_history').insert({
          crm_tenant_id: crmTenant.id,
          lead_id: data.id,
          user_id: currentUser?.id,
          action: 'created',
          new_value: leadData,
        });
      }

      // Update tags
      await supabase.from('crm_lead_tags').delete().eq('lead_id', leadId);

      if (formData.selectedTags.length > 0) {
        await supabase.from('crm_lead_tags').insert(
          formData.selectedTags.map((tagId) => ({
            lead_id: leadId,
            tag_id: tagId,
          }))
        );
      }

      toast({
        title: selectedLead ? 'Lead atualizado' : 'Lead criado',
        description: selectedLead
          ? 'As alterações foram salvas com sucesso'
          : 'O lead foi adicionado com sucesso',
      });

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o lead',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!confirm(`Deseja realmente excluir o lead "${lead.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      toast({
        title: 'Lead excluído',
        description: 'O lead foi removido com sucesso',
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o lead',
        variant: 'destructive',
      });
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-500';
      case 'active':
        return 'bg-amber-500/20 text-amber-500';
      case 'won':
        return 'bg-green-500/20 text-green-500';
      case 'lost':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Novo';
      case 'active':
        return 'Ativo';
      case 'won':
        return 'Ganho';
      case 'lost':
        return 'Perdido';
      default:
        return status;
    }
  };

  const filteredStages = formData.funnel_id
    ? stages.filter((s) => s.funnel_id === formData.funnel_id)
    : [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} encontrado{filteredLeads.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-1" />
          Novo Lead
        </Button>
      </div>

      {/* Filters - Compact */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="new">Novos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="won">Ganhos</SelectItem>
            <SelectItem value="lost">Perdidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{lead.name}</h3>
                            <Badge
                              variant="secondary"
                              className={getStatusColor(lead.status)}
                            >
                              {getStatusLabel(lead.status)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </span>
                            )}
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </span>
                            )}
                            {lead.company && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {lead.company}
                              </span>
                            )}
                          </div>
                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              {lead.tags.map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  style={{
                                    borderColor: tag.color,
                                    color: tag.color,
                                  }}
                                  className="text-xs"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatCurrency(Number(lead.value) || 0)}
                        </p>
                        {lead.stage && (
                          <Badge
                            variant="secondary"
                            style={{ backgroundColor: `${lead.stage.color}20`, color: lead.stage.color }}
                            className="text-xs mt-1"
                          >
                            {lead.stage.name}
                          </Badge>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenModal(lead)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(lead)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLeads.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum lead encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando seu primeiro lead'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => handleOpenModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Lead
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLead ? 'Editar Lead' : 'Novo Lead'}
            </DialogTitle>
            <DialogDescription>
              {selectedLead
                ? 'Atualize as informações do lead'
                : 'Preencha os dados para cadastrar um novo lead'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do lead"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origem</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="Ex: Google, Indicação, etc"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funnel">Funil</Label>
                <Select
                  value={formData.funnel_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, funnel_id: value, stage_id: '' })
                  }
                >
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="stage">Etapa</Label>
                <Select
                  value={formData.stage_id}
                  onValueChange={(value) => setFormData({ ...formData, stage_id: value })}
                  disabled={!formData.funnel_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          {stage.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Select
                  value={formData.responsible_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, responsible_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={formData.selectedTags.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all"
                    style={{
                      backgroundColor: formData.selectedTags.includes(tag.id)
                        ? tag.color
                        : 'transparent',
                      borderColor: tag.color,
                      color: formData.selectedTags.includes(tag.id) ? '#fff' : tag.color,
                    }}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        selectedTags: formData.selectedTags.includes(tag.id)
                          ? formData.selectedTags.filter((t) => t !== tag.id)
                          : [...formData.selectedTags, tag.id],
                      });
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma tag disponível. Crie tags nas configurações.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações adicionais sobre o lead..."
                rows={3}
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
                {isSubmitting ? 'Salvando...' : selectedLead ? 'Salvar' : 'Criar Lead'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedLead.name}</h2>
                  <Badge className={getStatusColor(selectedLead.status)}>
                    {getStatusLabel(selectedLead.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedLead.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                )}
                {selectedLead.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedLead.phone}</p>
                  </div>
                )}
                {selectedLead.company && (
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium">{selectedLead.company}</p>
                  </div>
                )}
                {selectedLead.origin && (
                  <div>
                    <p className="text-sm text-muted-foreground">Origem</p>
                    <p className="font-medium">{selectedLead.origin}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium text-primary">
                    {formatCurrency(Number(selectedLead.value) || 0)}
                  </p>
                </div>
                {selectedLead.stage && (
                  <div>
                    <p className="text-sm text-muted-foreground">Etapa</p>
                    <Badge
                      style={{
                        backgroundColor: `${selectedLead.stage.color}20`,
                        color: selectedLead.stage.color,
                      }}
                    >
                      {selectedLead.stage.name}
                    </Badge>
                  </div>
                )}
                {selectedLead.responsible && (
                  <div>
                    <p className="text-sm text-muted-foreground">Responsável</p>
                    <p className="font-medium">{selectedLead.responsible.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">
                    {new Date(selectedLead.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        style={{ borderColor: tag.color, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLead.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Observações</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedLead.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenModal(selectedLead);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
