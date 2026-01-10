/**
 * GENESIS CAMPAIGNS - Edit Campaign Modal
 * Modal completo para editar campanha: contatos, mensagem, variações Luna e horários
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  X,
  Users,
  Trash2,
  RotateCcw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  TrendingUp,
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  Settings2,
  RefreshCw,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Campaign, CampaignContact, LunaSimilarityLevel } from './types';

interface EditCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
  contacts: CampaignContact[];
  onRemoveContacts: (contactIds: string[]) => Promise<void>;
  onMarkForResend: (contactIds: string[]) => Promise<void>;
  onUpdateCampaign: (updates: Record<string, unknown>) => Promise<boolean>;
  onRefresh: () => void;
  loading?: boolean;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'sent', label: 'Enviados' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'read', label: 'Lidos' },
  { value: 'replied', label: 'Respondidos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'queued', label: 'Na fila' },
  { value: 'failed', label: 'Falhou' },
  { value: 'undelivered', label: 'Não entregue' },
];

const SIMILARITY_LEVELS: { value: LunaSimilarityLevel; label: string; desc: string }[] = [
  { value: 'low', label: 'Baixa', desc: 'Mais variação, texto bem diferente' },
  { value: 'medium', label: 'Média', desc: 'Equilíbrio entre variação e fidelidade' },
  { value: 'high', label: 'Alta', desc: 'Menor variação, mais fiel ao original' },
];

export function EditCampaignModal({
  open,
  onOpenChange,
  campaign,
  contacts,
  onRemoveContacts,
  onMarkForResend,
  onUpdateCampaign,
  onRefresh,
  loading,
}: EditCampaignModalProps) {
  // Contacts state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Message state
  const [messageTemplate, setMessageTemplate] = useState(campaign.message_template);
  const [lunaEnabled, setLunaEnabled] = useState(campaign.luna_enabled);
  const [variationsCount, setVariationsCount] = useState(campaign.luna_variations_count);
  const [similarityLevel, setSimilarityLevel] = useState<LunaSimilarityLevel>(campaign.luna_similarity_level);
  const [variations, setVariations] = useState<string[]>((campaign.luna_generated_variations as string[]) || []);
  const [generatingVariations, setGeneratingVariations] = useState(false);

  // Schedule state
  const [windowStart, setWindowStart] = useState(campaign.send_window_start?.substring(0, 5) || '08:00');
  const [windowEnd, setWindowEnd] = useState(campaign.send_window_end?.substring(0, 5) || '22:00');
  const [sendOnWeekends, setSendOnWeekends] = useState(campaign.send_on_weekends);
  const [delayMin, setDelayMin] = useState(campaign.delay_min_seconds);
  const [delayMax, setDelayMax] = useState(campaign.delay_max_seconds);

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  // Reset state when modal opens with new campaign
  useEffect(() => {
    if (open) {
      setMessageTemplate(campaign.message_template);
      setLunaEnabled(campaign.luna_enabled);
      setVariationsCount(campaign.luna_variations_count);
      setSimilarityLevel(campaign.luna_similarity_level);
      setVariations((campaign.luna_generated_variations as string[]) || []);
      setWindowStart(campaign.send_window_start?.substring(0, 5) || '08:00');
      setWindowEnd(campaign.send_window_end?.substring(0, 5) || '22:00');
      setSendOnWeekends(campaign.send_on_weekends);
      setDelayMin(campaign.delay_min_seconds);
      setDelayMax(campaign.delay_max_seconds);
      setHasChanges(false);
      setSelectedIds(new Set());
    }
  }, [open, campaign]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = !search || 
        contact.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        contact.contact_phone.includes(search);
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [contacts, search, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: contacts.length,
    sent: contacts.filter(c => c.status === 'sent').length,
    delivered: contacts.filter(c => c.status === 'delivered').length,
    pending: contacts.filter(c => ['pending', 'queued'].includes(c.status)).length,
    failed: contacts.filter(c => ['failed', 'undelivered'].includes(c.status)).length,
  }), [contacts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'read':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'replied':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'failed':
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'undelivered':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'read':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'replied':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'failed':
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'undelivered':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const selectSent = () => {
    const sentIds = contacts.filter(c => c.status === 'sent').map(c => c.id);
    setSelectedIds(new Set(sentIds));
  };

  const selectPending = () => {
    const pendingIds = contacts.filter(c => 
      ['pending', 'queued', 'failed', 'undelivered'].includes(c.status)
    ).map(c => c.id);
    setSelectedIds(new Set(pendingIds));
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onRemoveContacts(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkForResend = async () => {
    if (selectedIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onMarkForResend(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  const getFirstName = (fullName?: string) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  // Generate Luna variations
  const generateVariations = async () => {
    if (!messageTemplate.trim() || generatingVariations) return;
    
    setGeneratingVariations(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('luna-variations', {
        body: {
          message: messageTemplate,
          count: variationsCount,
          similarity: similarityLevel,
        },
      });

      if (error) throw error;

      if (data?.variations && Array.isArray(data.variations)) {
        setVariations(data.variations);
        setHasChanges(true);
        toast.success(`${data.variations.length} variações geradas!`);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('[LunaPreview] Error:', err);
      toast.error('Erro ao gerar variações. Tente novamente.');
    } finally {
      setGeneratingVariations(false);
    }
  };

  // Save all changes
  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const updates: Record<string, unknown> = {
        message_template: messageTemplate,
        luna_enabled: lunaEnabled,
        luna_variations_count: variationsCount,
        luna_similarity_level: similarityLevel,
        luna_generated_variations: variations,
        send_window_start: windowStart + ':00',
        send_window_end: windowEnd + ':00',
        send_on_weekends: sendOnWeekends,
        delay_min_seconds: delayMin,
        delay_max_seconds: delayMax,
      };

      const success = await onUpdateCampaign(updates);
      if (success) {
        setHasChanges(false);
        onRefresh();
        toast.success('Campanha atualizada!');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Editar Campanha: {campaign.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="contacts" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 shrink-0">
            <TabsTrigger value="contacts" className="gap-2">
              <Users className="w-4 h-4" />
              Contatos ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="message" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Mensagem & Luna
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Clock className="w-4 h-4" />
              Horários
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="flex-1 flex flex-col px-6 pb-4 mt-4 overflow-hidden data-[state=inactive]:hidden">
            {/* Stats Bar */}
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm shrink-0">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{stats.total}</span>
                <span className="text-muted-foreground">total</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">{stats.sent}</span>
                <span className="text-muted-foreground">enviados</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{stats.pending}</span>
                <span className="text-muted-foreground">pendentes</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="font-medium">{stats.failed}</span>
                <span className="text-muted-foreground">falhas</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mt-3 shrink-0">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-background">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-[100]">
                  {STATUS_FILTERS.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex items-center gap-2 flex-wrap mt-3 shrink-0">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedIds.size === filteredContacts.length && filteredContacts.length > 0 ? 'Desmarcar todos' : 'Selecionar todos'}
              </Button>
              <Button variant="outline" size="sm" onClick={selectSent}>
                Selecionar enviados ({stats.sent})
              </Button>
              <Button variant="outline" size="sm" onClick={selectPending}>
                Selecionar pendentes ({stats.pending + stats.failed})
              </Button>
              {selectedIds.size > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {selectedIds.size} selecionado(s)
                </Badge>
              )}
            </div>

            {/* Contacts List */}
            <div className="flex-1 mt-3 border rounded-lg overflow-hidden min-h-0">
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {filteredContacts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Nenhum contato encontrado
                    </div>
                  ) : (
                    filteredContacts.map(contact => (
                      <motion.div
                        key={contact.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer",
                          selectedIds.has(contact.id) && "bg-primary/5"
                        )}
                        onClick={() => toggleSelect(contact.id)}
                      >
                        <Checkbox
                          checked={selectedIds.has(contact.id)}
                          onCheckedChange={() => toggleSelect(contact.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="flex items-center gap-2 flex-1">
                          {getStatusIcon(contact.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {getFirstName(contact.contact_name) || contact.contact_phone}
                            </p>
                            <p className="text-xs text-muted-foreground">{contact.contact_phone}</p>
                          </div>
                        </div>

                        <Badge variant="outline" className={cn("text-xs", getStatusColor(contact.status))}>
                          {contact.status}
                        </Badge>

                        {contact.sent_at && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(contact.sent_at), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 mt-3 shrink-0">
              <Button
                variant="outline"
                onClick={handleMarkForResend}
                disabled={selectedIds.size === 0 || isProcessing || loading}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Marcar p/ Reenvio ({selectedIds.size})
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveSelected}
                disabled={selectedIds.size === 0 || isProcessing || loading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remover ({selectedIds.size})
              </Button>
            </div>
          </TabsContent>

          {/* Message & Luna Tab */}
          <TabsContent value="message" className="flex-1 px-6 pb-4 mt-4 overflow-y-auto data-[state=inactive]:hidden">
            <div className="space-y-6">
              {/* Message Template */}
              <div className="space-y-2">
                <Label>Mensagem Template</Label>
                <Textarea
                  value={messageTemplate}
                  onChange={(e) => {
                    setMessageTemplate(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Digite sua mensagem... Use {{nome}} para o primeiro nome do contato"
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis disponíveis: <code className="bg-muted px-1 rounded">{'{{nome}}'}</code> (primeiro nome), 
                  <code className="bg-muted px-1 rounded ml-1">{'{{telefone}}'}</code>
                </p>
              </div>

              {/* Luna AI Toggle */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Luna AI - Variações Humanizadas
                    </CardTitle>
                    <Switch
                      checked={lunaEnabled}
                      onCheckedChange={(checked) => {
                        setLunaEnabled(checked);
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </CardHeader>
                
                {lunaEnabled && (
                  <CardContent className="space-y-4">
                    {/* Variations Count */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Quantidade de Variações</Label>
                        <Badge variant="secondary">{variationsCount}</Badge>
                      </div>
                      <Slider
                        value={[variationsCount]}
                        onValueChange={([val]) => {
                          setVariationsCount(val);
                          setHasChanges(true);
                        }}
                        min={3}
                        max={15}
                        step={1}
                      />
                    </div>

                    {/* Similarity Level */}
                    <div className="space-y-2">
                      <Label>Nível de Similaridade</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {SIMILARITY_LEVELS.map(level => (
                          <Button
                            key={level.value}
                            variant={similarityLevel === level.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setSimilarityLevel(level.value);
                              setHasChanges(true);
                            }}
                            className="flex-col h-auto py-2"
                          >
                            <span>{level.label}</span>
                            <span className="text-xs opacity-70 font-normal">{level.desc}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={generateVariations}
                      disabled={generatingVariations || !messageTemplate.trim()}
                      className="w-full gap-2"
                    >
                      {generatingVariations ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {generatingVariations ? 'Gerando variações...' : 'Gerar Variações'}
                    </Button>

                    {/* Variations Preview */}
                    {variations.length > 0 && (
                      <div className="space-y-2">
                        <Label>Variações Geradas ({variations.length})</Label>
                        <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                          <div className="p-3 space-y-3">
                            {variations.map((variation, i) => (
                              <div key={i} className="bg-purple-500/5 rounded-lg p-3 text-sm">
                                <Badge variant="secondary" className="mb-2">Variação {i + 1}</Badge>
                                <p className="whitespace-pre-wrap">{variation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="flex-1 px-6 pb-4 mt-4 overflow-y-auto data-[state=inactive]:hidden">
            <div className="space-y-6 max-w-lg">
              {/* Send Window */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Janela de Envio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Início</Label>
                      <Input
                        type="time"
                        value={windowStart}
                        onChange={(e) => {
                          setWindowStart(e.target.value);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fim</Label>
                      <Input
                        type="time"
                        value={windowEnd}
                        onChange={(e) => {
                          setWindowEnd(e.target.value);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enviar nos finais de semana</Label>
                    <Switch
                      checked={sendOnWeekends}
                      onCheckedChange={(checked) => {
                        setSendOnWeekends(checked);
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delay Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Intervalo entre Mensagens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Delay Mínimo</Label>
                      <Badge variant="secondary">{delayMin}s</Badge>
                    </div>
                    <Slider
                      value={[delayMin]}
                      onValueChange={([val]) => {
                        setDelayMin(val);
                        if (val > delayMax) setDelayMax(val);
                        setHasChanges(true);
                      }}
                      min={5}
                      max={60}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Delay Máximo</Label>
                      <Badge variant="secondary">{delayMax}s</Badge>
                    </div>
                    <Slider
                      value={[delayMax]}
                      onValueChange={([val]) => {
                        setDelayMax(val);
                        if (val < delayMin) setDelayMin(val);
                        setHasChanges(true);
                      }}
                      min={10}
                      max={120}
                      step={1}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    O sistema aguardará entre {delayMin} e {delayMax} segundos entre cada mensagem para simular comportamento humano.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0 bg-background">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          
          {hasChanges && (
            <Button onClick={handleSave} disabled={isProcessing} className="gap-2">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
