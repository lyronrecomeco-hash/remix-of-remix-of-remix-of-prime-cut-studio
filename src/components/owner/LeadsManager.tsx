import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, Mail, Phone, MessageSquare, Calendar, Clock, 
  CheckCircle, XCircle, Eye, Trash2, Search, Filter,
  Crown, Lock, Loader2, RefreshCw, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string;
  message: string | null;
  plan_interest: string;
  status: string;
  notes: string | null;
  created_at: string;
  contacted_at: string | null;
  converted_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: 'Novo', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Eye },
  contacted: { label: 'Contatado', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: MessageSquare },
  converted: { label: 'Convertido', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  lost: { label: 'Perdido', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle }
};

const planConfig: Record<string, { label: string; icon: any; color: string }> = {
  premium: { label: 'Premium', icon: Crown, color: 'text-primary' },
  vitalicio: { label: 'Vitalício', icon: Lock, color: 'text-amber-500' }
};

const LeadsManager = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');

  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ['contact-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === 'contacted') updates.contacted_at = new Date().toISOString();
      if (status === 'converted') updates.converted_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('contact_leads')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-leads'] });
      toast.success('Status atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar status')
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('contact_leads')
        .update({ notes })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-leads'] });
      toast.success('Notas salvas!');
      setSelectedLead(null);
    },
    onError: () => toast.error('Erro ao salvar notas')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-leads'] });
      toast.success('Lead removido!');
    },
    onError: () => toast.error('Erro ao remover lead')
  });

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = 
      lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.whatsapp.includes(searchTerm);
    
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads?.length || 0,
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0
  };

  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setNotes(lead.notes || '');
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-400">Novos</p>
                <p className="text-2xl font-bold text-blue-500">{stats.new}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-400">Contatados</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.contacted}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-400">Convertidos</p>
                <p className="text-2xl font-bold text-green-500">{stats.converted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(null)}
              >
                Todos
              </Button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={statusFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(key)}
                >
                  {config.label}
                </Button>
              ))}
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredLeads?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">Nenhum lead encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Os leads aparecerão aqui quando alguém preencher o formulário na página de vendas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads?.map(lead => {
            const status = statusConfig[lead.status] || statusConfig.new;
            const plan = planConfig[lead.plan_interest] || planConfig.premium;
            const StatusIcon = status.icon;
            const PlanIcon = plan.icon;

            return (
              <Card key={lead.id} className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {lead.first_name[0]}{lead.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{lead.first_name} {lead.last_name}</h4>
                        <Badge variant="outline" className={`text-xs ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openLeadDetails(lead)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateStatusMutation.mutate({ id: lead.id, status: 'contacted' })}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Marcar como Contatado
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateStatusMutation.mutate({ id: lead.id, status: 'converted' })}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como Convertido
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateStatusMutation.mutate({ id: lead.id, status: 'lost' })}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Marcar como Perdido
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este lead?')) {
                              deleteMutation.mutate(lead.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{lead.whatsapp}</span>
                    </div>
                  </div>

                  {/* Plan & Date */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <PlanIcon className={`w-4 h-4 ${plan.color}`} />
                      <span className={`text-sm font-medium ${plan.color}`}>{plan.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(lead.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </div>
                  </div>

                  {/* Message Preview */}
                  {lead.message && (
                    <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground line-clamp-2">{lead.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lead Details Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {selectedLead.first_name[0]}{selectedLead.last_name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedLead.first_name} {selectedLead.last_name}
                  </h3>
                  <Badge variant="outline" className={statusConfig[selectedLead.status]?.color}>
                    {statusConfig[selectedLead.status]?.label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{selectedLead.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-medium">{selectedLead.whatsapp}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Plano de Interesse</p>
                  <p className="text-sm font-medium capitalize">{selectedLead.plan_interest}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedLead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {selectedLead.message && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Mensagem</p>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedLead.message}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Notas internas</p>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Adicione notas sobre este lead..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => updateNotesMutation.mutate({ id: selectedLead.id, notes })}
                  disabled={updateNotesMutation.isPending}
                >
                  {updateNotesMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Salvar Notas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, '')}`, '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedLead.email}`, '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsManager;
