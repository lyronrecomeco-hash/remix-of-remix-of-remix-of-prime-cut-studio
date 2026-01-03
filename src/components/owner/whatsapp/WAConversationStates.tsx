import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  Eye, 
  RefreshCw,
  Trash2,
  Clock,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATE_COLORS: Record<string, string> = {
  initial: 'bg-gray-500',
  browsing: 'bg-blue-500',
  checkout: 'bg-amber-500',
  awaiting_payment: 'bg-orange-500',
  payment_confirmed: 'bg-green-500',
  followup: 'bg-purple-500',
  human_support: 'bg-red-500',
  completed: 'bg-emerald-500',
};

export function WAConversationStates() {
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_conversation_states')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setStates(data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.error('Erro ao carregar estados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este estado de conversa?')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_conversation_states')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Estado excluído');
      fetchStates();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir');
    }
  };

  const handleResetState = async (state: any) => {
    try {
      const { error } = await supabase
        .from('whatsapp_conversation_states')
        .update({
          current_state: 'initial',
          context_data: {},
          last_template_id: null,
          last_button_clicked: null,
        })
        .eq('id', state.id);
      if (error) throw error;
      toast.success('Estado resetado');
      fetchStates();
    } catch (error: any) {
      toast.error('Erro ao resetar estado');
    }
  };

  const viewDetails = (state: any) => {
    setSelectedState(state);
    setDetailsOpen(true);
  };

  const filteredStates = states.filter(state => 
    state.phone.includes(searchTerm) || 
    state.current_state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStateColor = (state: string) => {
    return STATE_COLORS[state] || 'bg-gray-500';
  };

  const stateCounts = states.reduce((acc, state) => {
    acc[state.current_state] = (acc[state.current_state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Estados de Conversa</h2>
          <p className="text-sm text-muted-foreground">
            Controle o contexto de cada usuário em tempo real
          </p>
        </div>
        <Button variant="outline" onClick={fetchStates}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.entries(stateCounts).map(([state, count]) => (
          <Card key={state} className="p-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStateColor(state)}`} />
              <span className="text-sm font-medium capitalize">{state.replace('_', ' ')}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{String(count)}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por telefone ou estado..."
          className="pl-10"
        />
      </div>

      {/* States List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filteredStates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum estado de conversa encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {filteredStates.map(state => (
              <Card key={state.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full ${getStateColor(state.current_state)} flex items-center justify-center text-white`}>
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{state.phone}</span>
                          <Badge className={`${getStateColor(state.current_state)} text-white capitalize`}>
                            {state.current_state.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {state.last_button_clicked && (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {state.last_button_clicked}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(state.updated_at), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => viewDetails(state)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleResetState(state)}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(state.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Conversa</DialogTitle>
          </DialogHeader>
          {selectedState && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-mono font-medium">{selectedState.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado Atual</p>
                  <Badge className={`${getStateColor(selectedState.current_state)} text-white capitalize`}>
                    {selectedState.current_state.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Último Botão</p>
                  <p className="font-medium">{selectedState.last_button_clicked || 'Nenhum'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Atualizado em</p>
                  <p className="font-medium">
                    {format(new Date(selectedState.updated_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Contexto</p>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-60">
                  {JSON.stringify(selectedState.context_data || {}, null, 2)}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    handleResetState(selectedState);
                    setDetailsOpen(false);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resetar Estado
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => {
                    handleDelete(selectedState.id);
                    setDetailsOpen(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
