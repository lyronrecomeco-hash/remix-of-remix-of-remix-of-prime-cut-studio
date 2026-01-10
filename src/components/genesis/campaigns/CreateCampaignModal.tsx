/**
 * GENESIS CAMPAIGNS - Create Campaign Modal (Step-by-Step Wizard)
 * Com suporte para campanhas acionadas por integração
 * Atualizado com extração automática de contatos PIX não pago + preview Luna
 * FILTRO POR PRODUTO para precisão máxima
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Smartphone,
  Users,
  MessageSquare,
  Settings2,
  CreditCard,
  Sparkles,
  AlertTriangle,
  Upload,
  Clock,
  Trash2,
  Info,
  Link2,
  Zap,
  Loader2,
  Phone,
  Eye,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
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
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { toast } from 'sonner';
import type { CampaignType, CampaignFormData, LunaSimilarityLevel } from './types';
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_TYPE_DESCRIPTIONS } from './types';
import { IntegrationSelector } from './IntegrationSelector';
import { ScheduleByPeriodControl, DEFAULT_SCHEDULE, type ScheduleByPeriod } from './ScheduleByPeriodControl';
import { LunaVariationsPreview } from './LunaVariationsPreview';
import { ContactsPreviewCard } from './ContactsPreviewCard';
import { ProductMultiSelect } from './ProductMultiSelect';
import { useCaktoContacts, type CaktoContact, type CaktoProduct, type DateRange, getDefaultDateRange } from './hooks/useCaktoContacts';
import { DateRangeSelector } from './DateRangeSelector';

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (campaignData: CampaignFormData) => void;
}

interface Instance {
  id: string;
  name: string;
  status: string;
  orchestrated_status: string;
  phone_number?: string;
}

// Steps dinâmicos baseados no tipo de campanha
const getSteps = (campaignType: CampaignType) => {
  if (campaignType === 'integracao') {
    return [
      { id: 1, label: 'Tipo', icon: Settings2 },
      { id: 2, label: 'Integração', icon: Link2 },
      { id: 3, label: 'Evento', icon: Zap },
      { id: 4, label: 'Mensagem', icon: MessageSquare },
      { id: 5, label: 'Controle', icon: Settings2 },
      { id: 6, label: 'Confirmar', icon: CreditCard },
    ];
  }
  return [
    { id: 1, label: 'Configuração', icon: Settings2 },
    { id: 2, label: 'Público', icon: Users },
    { id: 3, label: 'Mensagem', icon: MessageSquare },
    { id: 4, label: 'Controle', icon: Settings2 },
    { id: 5, label: 'Confirmar', icon: CreditCard },
  ];
};

const DEFAULT_FORM_DATA: CampaignFormData = {
  name: '',
  description: '',
  campaign_type: 'marketing',
  instance_id: '',
  contacts: [],
  message_template: '',
  luna_enabled: false,
  luna_variations_count: 5,
  luna_similarity_level: 'medium',
  delay_min_seconds: 10,
  delay_max_seconds: 30,
  batch_size: 50,
  pause_after_batch: 100,
  pause_duration_seconds: 300,
  send_window_start: '08:00',
  send_window_end: '22:00',
  send_on_weekends: true,
};

// Eventos por tipo de integração - ATUALIZADO com PIX não pago
const INTEGRATION_EVENTS: Record<string, { value: string; label: string; description: string }[]> = {
  cakto: [
    { value: 'purchase_approved', label: 'Compra Aprovada', description: 'Pagamento confirmado' },
    { value: 'pix_unpaid', label: '🔥 PIX Não Pago', description: 'Cliente gerou PIX mas não pagou (recuperação)' },
    { value: 'pix_generated', label: 'PIX Gerado', description: 'Cliente gerou um PIX para pagamento' },
    { value: 'initiate_checkout', label: 'Checkout Iniciado', description: 'Cliente inicia o checkout' },
    { value: 'checkout_abandonment', label: 'Carrinho Abandonado', description: 'Cliente abandonou o checkout' },
    { value: 'purchase_refused', label: 'Compra Recusada', description: 'Pagamento recusado' },
    { value: 'purchase_refunded', label: 'Reembolso', description: 'Cliente solicita reembolso' },
  ],
  shopify: [
    { value: 'order_created', label: 'Pedido Criado', description: 'Novo pedido recebido' },
    { value: 'order_paid', label: 'Pedido Pago', description: 'Pagamento confirmado' },
    { value: 'order_cancelled', label: 'Pedido Cancelado', description: 'Pedido foi cancelado' },
    { value: 'cart_abandoned', label: 'Carrinho Abandonado', description: 'Cliente abandonou carrinho' },
  ],
  default: [
    { value: 'new_lead', label: 'Novo Lead', description: 'Novo lead capturado' },
    { value: 'status_changed', label: 'Status Alterado', description: 'Status do lead alterado' },
  ],
};

export function CreateCampaignModal({ open, onOpenChange, onCreated }: CreateCampaignModalProps) {
  const { genesisUser, credits } = useGenesisAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>(DEFAULT_FORM_DATA);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [contactsText, setContactsText] = useState('');
  
  // Estados para campanhas de integração
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [selectedIntegrationProvider, setSelectedIntegrationProvider] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [scheduleByPeriod, setScheduleByPeriod] = useState<ScheduleByPeriod>(DEFAULT_SCHEDULE);
  const [useAdvancedSchedule, setUseAdvancedSchedule] = useState(false);
  
  // Estados para extração de contatos e Luna preview
  const [extractedContacts, setExtractedContacts] = useState<CaktoContact[]>([]);
  const [availableProducts, setAvailableProducts] = useState<CaktoProduct[]>([]);
  const [triggerLunaPreview, setTriggerLunaPreview] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const { contacts: caktoContacts, loading: loadingContacts, fetchContacts, fetchProducts } = useCaktoContacts();
  
  // Steps dinâmicos
  const STEPS = getSteps(formData.campaign_type);

  // Fetch user instances
  useEffect(() => {
    const fetchInstancesData = async () => {
      if (!genesisUser) return;
      
      setLoadingInstances(true);
      try {
        const { data, error } = await supabase
          .from('genesis_instances')
          .select('id, name, status, orchestrated_status, phone_number')
          .eq('user_id', genesisUser.id);
        
        if (error) throw error;
        setInstances(data || []);
      } catch (error) {
        console.error('Error fetching instances:', error);
      } finally {
        setLoadingInstances(false);
      }
    };

    if (open) {
      fetchInstancesData();
      setStep(1);
      setFormData(DEFAULT_FORM_DATA);
      setContactsText('');
      setSelectedIntegrationId(null);
      setSelectedIntegrationProvider('');
      setSelectedEvent('');
      setSelectedProductIds([]);
      setScheduleByPeriod(DEFAULT_SCHEDULE);
      setUseAdvancedSchedule(false);
      setExtractedContacts([]);
      setAvailableProducts([]);
      setTriggerLunaPreview(false);
      setGeneratedVariations([]);
      setDateRange(getDefaultDateRange());
    }
  }, [open, genesisUser]);

  // Buscar produtos quando integração é selecionada
  useEffect(() => {
    if (selectedIntegrationId && selectedIntegrationProvider === 'cakto') {
      console.log('[Campaign] Fetching products for integration:', selectedIntegrationId);
      fetchProducts(selectedIntegrationId).then(products => {
        setAvailableProducts(products);
        console.log('[Campaign] Loaded', products.length, 'active products');
      });
    }
  }, [selectedIntegrationId, selectedIntegrationProvider, fetchProducts]);

  // Extrair contatos quando evento, produtos OU DATA é selecionado
  useEffect(() => {
    if (
      formData.campaign_type === 'integracao' && 
      selectedIntegrationId && 
      selectedEvent && 
      formData.instance_id
    ) {
      console.log('[Campaign] Extracting contacts for event:', selectedEvent, 'products:', selectedProductIds, 'dateRange:', dateRange);
      fetchContacts({
        instanceId: formData.instance_id,
        integrationId: selectedIntegrationId,
        eventType: selectedEvent,
        productIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
        dateRange: dateRange,
      }).then(contacts => {
        setExtractedContacts(contacts);
        // Converter para formato de contatos da campanha
        const campaignContacts = contacts.map(c => ({
          phone: c.phone.replace(/\D/g, ''),
          name: c.name || undefined,
        }));
        setFormData(prev => ({ ...prev, contacts: campaignContacts }));
        if (contacts.length > 0) {
          toast.success(`${contacts.length} contatos extraídos automaticamente!`);
        }
      });
    }
  }, [selectedEvent, selectedIntegrationId, selectedProductIds, formData.instance_id, formData.campaign_type, fetchContacts, dateRange]);

  // Parse contacts from text
  const parseContacts = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    const contacts: Array<{ phone: string; name?: string }> = [];
    
    for (const line of lines) {
      const parts = line.split(/[,;|\t]/).map(p => p.trim());
      const phone = parts[0]?.replace(/\D/g, '');
      if (phone && phone.length >= 10) {
        contacts.push({
          phone,
          name: parts[1] || undefined,
        });
      }
    }
    
    return contacts;
  };

  const handleContactsChange = (text: string) => {
    setContactsText(text);
    const parsed = parseContacts(text);
    setFormData(prev => ({ ...prev, contacts: parsed }));
  };

  // Handlers para integração
  const handleIntegrationSelect = (integrationId: string, provider: string) => {
    setSelectedIntegrationId(integrationId);
    setSelectedIntegrationProvider(provider);
    setSelectedEvent(''); // Reset evento ao trocar integração
    setSelectedProductIds([]); // Reset produtos
  };

  // Handler para variações Luna geradas
  const handleVariationsGenerated = (variations: string[]) => {
    setGeneratedVariations(variations);
    console.log('[Campaign] Luna generated', variations.length, 'variations');
  };

  const selectedInstance = instances.find(i => i.id === formData.instance_id);
  const isInstanceValid = selectedInstance?.orchestrated_status === 'connected';
  const creditsNeeded = formData.campaign_type === 'integracao' ? 0 : formData.contacts.length;
  const hasEnoughCredits = formData.campaign_type === 'integracao' || (credits?.available_credits || 0) >= creditsNeeded;

  // Eventos disponíveis para a integração selecionada
  const availableEvents = INTEGRATION_EVENTS[selectedIntegrationProvider] || INTEGRATION_EVENTS.default;

  // Validação por step - adaptada para tipo de campanha
  const canProceed = () => {
    if (formData.campaign_type === 'integracao') {
      switch (step) {
        case 1: // Tipo + instância
          return formData.name.trim() && formData.instance_id && isInstanceValid;
        case 2: // Integração
          return !!selectedIntegrationId;
        case 3: // Evento
          return !!selectedEvent;
        case 4: // Mensagem
          return formData.message_template.trim().length > 0;
        case 5: // Controle
          return true;
        case 6: // Confirmar
          return true;
        default:
          return false;
      }
    }
    
    // Fluxo normal (marketing/notificação)
    switch (step) {
      case 1:
        return formData.name.trim() && formData.instance_id && isInstanceValid;
      case 2:
        return formData.contacts.length > 0;
      case 3:
        return formData.message_template.trim().length > 0;
      case 4:
        return true;
      case 5:
        return hasEnoughCredits;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const maxStep = STEPS.length;
    if (step < maxStep) {
      setStep(step + 1);
    } else {
      // Submit
      if (!hasEnoughCredits) {
        toast.error('Créditos insuficientes');
        return;
      }
      
      // Dados extras para campanhas de integração
      const extraData = formData.campaign_type === 'integracao' ? {
        integration_id: selectedIntegrationId,
        integration_provider: selectedIntegrationProvider,
        trigger_event: selectedEvent,
        product_filter_ids: selectedProductIds.length > 0 ? selectedProductIds : null,
        schedule_by_period: useAdvancedSchedule ? scheduleByPeriod : null,
        luna_variations: generatedVariations.length > 0 ? generatedVariations : null,
      } : {};
      
      onCreated({ ...formData, ...extraData } as CampaignFormData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Reset step quando muda tipo de campanha
  const handleCampaignTypeChange = (type: CampaignType) => {
    setFormData(prev => ({ ...prev, campaign_type: type }));
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Nova Campanha WhatsApp
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      step === s.id
                        ? "bg-primary text-primary-foreground"
                        : step > s.id
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                    animate={{ scale: step === s.id ? 1.1 : 1 }}
                  >
                    {step > s.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-xs mt-1 hidden sm:block",
                    step === s.id ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2",
                    step > s.id ? "bg-green-500" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Basic Configuration */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Campanha *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Black Friday 2024"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o objetivo da campanha..."
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Tipo de Campanha</Label>
                    <div className="grid gap-3">
                      {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                        <Card
                          key={value}
                          className={cn(
                            "cursor-pointer transition-all",
                            formData.campaign_type === value
                              ? "border-primary ring-2 ring-primary/20"
                              : "hover:border-primary/50"
                          )}
                          onClick={() => handleCampaignTypeChange(value as CampaignType)}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              formData.campaign_type === value ? "bg-primary/10" : "bg-muted"
                            )}>
                              {value === 'integracao' ? (
                                <Link2 className={cn("w-5 h-5", formData.campaign_type === value ? "text-primary" : "text-muted-foreground")} />
                              ) : value === 'notificacao' ? (
                                <MessageSquare className={cn("w-5 h-5", formData.campaign_type === value ? "text-primary" : "text-muted-foreground")} />
                              ) : (
                                <Sparkles className={cn("w-5 h-5", formData.campaign_type === value ? "text-primary" : "text-muted-foreground")} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">
                                {CAMPAIGN_TYPE_DESCRIPTIONS[value as CampaignType]}
                              </p>
                            </div>
                            {formData.campaign_type === value && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Instância WhatsApp *</Label>
                    {loadingInstances ? (
                      <div className="text-sm text-muted-foreground">Carregando...</div>
                    ) : instances.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="p-4 text-center">
                          <Smartphone className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Nenhuma instância disponível. Conecte uma primeiro.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-2">
                        {instances.map(instance => (
                          <Card
                            key={instance.id}
                            className={cn(
                              "cursor-pointer transition-all",
                              formData.instance_id === instance.id
                                ? "border-primary ring-2 ring-primary/20"
                                : "hover:border-primary/50"
                            )}
                            onClick={() => setFormData(prev => ({ ...prev, instance_id: instance.id }))}
                          >
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center",
                                  instance.orchestrated_status === 'connected'
                                    ? "bg-green-500/10"
                                    : "bg-yellow-500/10"
                                )}>
                                  <Smartphone className={cn(
                                    "w-5 h-5",
                                    instance.orchestrated_status === 'connected'
                                      ? "text-green-500"
                                      : "text-yellow-500"
                                  )} />
                                </div>
                                <div>
                                  <p className="font-medium">{instance.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {instance.phone_number || 'Sem número'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={instance.orchestrated_status === 'connected' ? 'default' : 'secondary'}>
                                {instance.orchestrated_status === 'connected' ? 'Conectada' : instance.orchestrated_status}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    {formData.instance_id && !isInstanceValid && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-500/10 p-2 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                        Instância não está conectada. Conecte antes de continuar.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 para integração: Seletor de Integração */}
              {step === 2 && formData.campaign_type === 'integracao' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Selecione a Integração</Label>
                    <p className="text-sm text-muted-foreground">
                      Escolha a integração que irá acionar esta campanha automaticamente.
                    </p>
                  </div>

                  <IntegrationSelector
                    instanceId={formData.instance_id}
                    selectedIntegration={selectedIntegrationId}
                    onSelect={handleIntegrationSelect}
                  />
                </div>
              )}

              {/* Step 3 para integração: Seleção de Evento + Produto */}
              {step === 3 && formData.campaign_type === 'integracao' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Evento Gatilho</Label>
                    <p className="text-sm text-muted-foreground">
                      Selecione o evento que irá disparar o envio da mensagem.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {availableEvents.map((event) => (
                      <Card
                        key={event.value}
                        className={cn(
                          "cursor-pointer transition-all",
                          selectedEvent === event.value
                            ? "border-primary ring-2 ring-primary/20"
                            : "hover:border-primary/50"
                        )}
                        onClick={() => setSelectedEvent(event.value)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              selectedEvent === event.value ? "bg-primary/10" : "bg-muted"
                            )}>
                              <Zap className={cn(
                                "w-5 h-5",
                                selectedEvent === event.value ? "text-primary" : "text-muted-foreground"
                              )} />
                            </div>
                            <div>
                              <p className="font-medium">{event.label}</p>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                          {selectedEvent === event.value && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Multi-select de produtos (apenas para Cakto) */}
                  {selectedEvent && selectedIntegrationProvider === 'cakto' && availableProducts.length > 0 && (
                    <ProductMultiSelect
                      products={availableProducts}
                      selectedProductIds={selectedProductIds}
                      onChange={setSelectedProductIds}
                    />
                  )}

                  {/* Seletor de Período (DATA) */}
                  {selectedEvent && selectedIntegrationProvider === 'cakto' && (
                    <Card className="border-amber-500/20 bg-amber-500/5">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-amber-500" />
                          <Label className="font-medium">Período de Extração</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Defina o período para extrair os contatos. Padrão: últimos 2 dias.
                        </p>
                        <DateRangeSelector
                          value={dateRange}
                          onChange={setDateRange}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Preview de contatos extraídos */}
                  {selectedEvent && (
                    <ContactsPreviewCard
                      contacts={extractedContacts}
                      loading={loadingContacts}
                      eventType={selectedEvent}
                    />
                  )}

                  {/* Variáveis disponíveis para o evento */}
                  <Card className="border-purple-500/20 bg-purple-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Variáveis Disponíveis</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Na mensagem você poderá usar: {'{{nome}}'}, {'{{email}}'}, {'{{telefone}}'}, {'{{produto}}'}, {'{{valor}}'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4 para integração OU Step 3 para campanhas normais: Message */}
              {((step === 4 && formData.campaign_type === 'integracao') || (step === 3 && formData.campaign_type !== 'integracao')) && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Mensagem *</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.campaign_type === 'integracao' 
                        ? 'Use as variáveis como {{nome}}, {{produto}}, {{valor}} para personalizar'
                        : 'Use {{nome}} para personalizar com o nome do contato'}
                    </p>
                    <Textarea
                      placeholder={formData.campaign_type === 'integracao'
                        ? `Olá {{nome}}! 🎉\n\nSeu pedido do {{produto}} foi confirmado!\nValor: R$ {{valor}}`
                        : `Olá {{nome}}! 👋\n\nTemos uma oferta especial para você...`}
                      value={formData.message_template}
                      onChange={e => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.message_template.length} caracteres
                    </p>
                  </div>

                  {/* Luna AI Section */}
                  <Card className="border-purple-500/20 bg-purple-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          <span className="font-medium">Luna AI Anti-Ban</span>
                          <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                        </div>
                        <Switch
                          checked={formData.luna_enabled}
                          onCheckedChange={v => setFormData(prev => ({ ...prev, luna_enabled: v }))}
                        />
                      </div>

                      {formData.luna_enabled && (
                        <div className="space-y-4 pt-2 border-t border-purple-500/20">
                          <p className="text-sm text-muted-foreground">
                            Luna gera variações semânticas da sua mensagem para evitar bloqueios por spam.
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Quantidade de variações</Label>
                              <span className="text-sm font-medium">{formData.luna_variations_count}</span>
                            </div>
                            <Slider
                              value={[formData.luna_variations_count]}
                              onValueChange={([v]) => setFormData(prev => ({ ...prev, luna_variations_count: v }))}
                              min={3}
                              max={10}
                              step={1}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Nível de similaridade</Label>
                            <Select
                              value={formData.luna_similarity_level}
                              onValueChange={v => setFormData(prev => ({ ...prev, luna_similarity_level: v as LunaSimilarityLevel }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">Alto (mensagens bem similares)</SelectItem>
                                <SelectItem value="medium">Médio (recomendado)</SelectItem>
                                <SelectItem value="low">Baixo (mais variação)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Luna Preview integrado */}
                          {formData.message_template.trim() && (
                            <div className="pt-4 border-t border-purple-500/20">
                              <LunaVariationsPreview
                                messageTemplate={formData.message_template}
                                variationsCount={formData.luna_variations_count}
                                similarityLevel={formData.luna_similarity_level}
                                onVariationsGenerated={handleVariationsGenerated}
                                triggerPreview={triggerLunaPreview}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 2 para campanhas normais: Audience */}
              {step === 2 && formData.campaign_type !== 'integracao' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Contatos</Label>
                    <p className="text-sm text-muted-foreground">
                      Cole os números de telefone (um por linha). Formato: número, nome (opcional)
                    </p>
                    <Textarea
                      placeholder={`5511999999999, João Silva\n5511888888888, Maria Santos\n5511777777777`}
                      value={contactsText}
                      onChange={e => handleContactsChange(e.target.value)}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-medium">Contatos válidos:</span>
                    </div>
                    <Badge variant={formData.contacts.length > 0 ? 'default' : 'secondary'}>
                      {formData.contacts.length}
                    </Badge>
                  </div>

                  {formData.contacts.length === 0 && contactsText.trim() && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-500/10 p-3 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      Nenhum número válido encontrado. Verifique o formato.
                    </div>
                  )}
                </div>
              )}

              {/* Step 5 para integração OU Step 4 para campanhas normais: Send Control */}
              {((step === 5 && formData.campaign_type === 'integracao') || (step === 4 && formData.campaign_type !== 'integracao')) && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg text-sm text-blue-600">
                    <Info className="w-4 h-4" />
                    Configure os controles anti-ban para envio seguro
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Delay Mínimo (segundos)</Label>
                      <Input
                        type="number"
                        min={5}
                        value={formData.delay_min_seconds}
                        onChange={e => setFormData(prev => ({ ...prev, delay_min_seconds: parseInt(e.target.value) || 10 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Delay Máximo (segundos)</Label>
                      <Input
                        type="number"
                        min={10}
                        value={formData.delay_max_seconds}
                        onChange={e => setFormData(prev => ({ ...prev, delay_max_seconds: parseInt(e.target.value) || 30 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mensagens por Lote</Label>
                      <Input
                        type="number"
                        min={10}
                        max={100}
                        value={formData.batch_size}
                        onChange={e => setFormData(prev => ({ ...prev, batch_size: parseInt(e.target.value) || 50 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pausa após (mensagens)</Label>
                      <Input
                        type="number"
                        min={50}
                        value={formData.pause_after_batch}
                        onChange={e => setFormData(prev => ({ ...prev, pause_after_batch: parseInt(e.target.value) || 100 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Duração da Pausa (segundos)</Label>
                    <Input
                      type="number"
                      min={60}
                      value={formData.pause_duration_seconds}
                      onChange={e => setFormData(prev => ({ ...prev, pause_duration_seconds: parseInt(e.target.value) || 300 }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Pausa automática de {Math.floor(formData.pause_duration_seconds / 60)} minutos a cada {formData.pause_after_batch} mensagens
                    </p>
                  </div>

                  {/* Toggle para horário avançado por período */}
                  <Card className={cn(
                    "border-2 transition-all",
                    useAdvancedSchedule ? "border-primary/30 bg-primary/5" : "border-dashed"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="font-medium">Horário Avançado por Período</span>
                          <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                        </div>
                        <Switch
                          checked={useAdvancedSchedule}
                          onCheckedChange={setUseAdvancedSchedule}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Configure horários específicos para manhã, tarde e noite
                      </p>
                    </CardContent>
                  </Card>

                  {useAdvancedSchedule ? (
                    <ScheduleByPeriodControl
                      value={scheduleByPeriod}
                      onChange={setScheduleByPeriod}
                    />
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Horário Início</Label>
                          <Input
                            type="time"
                            value={formData.send_window_start}
                            onChange={e => setFormData(prev => ({ ...prev, send_window_start: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Horário Fim</Label>
                          <Input
                            type="time"
                            value={formData.send_window_end}
                            onChange={e => setFormData(prev => ({ ...prev, send_window_end: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <Label htmlFor="weekends" className="cursor-pointer">Enviar aos finais de semana</Label>
                        <Switch
                          id="weekends"
                          checked={formData.send_on_weekends}
                          onCheckedChange={v => setFormData(prev => ({ ...prev, send_on_weekends: v }))}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 6 para integração OU Step 5 para campanhas normais: Confirmation */}
              {((step === 6 && formData.campaign_type === 'integracao') || (step === 5 && formData.campaign_type !== 'integracao')) && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-semibold">Resumo da Campanha</h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nome:</span>
                          <p className="font-medium">{formData.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <p className="font-medium">{CAMPAIGN_TYPE_LABELS[formData.campaign_type]}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Instância:</span>
                          <p className="font-medium">{selectedInstance?.name}</p>
                        </div>
                        {formData.campaign_type === 'integracao' ? (
                          <>
                            <div>
                              <span className="text-muted-foreground">Integração:</span>
                              <p className="font-medium capitalize">{selectedIntegrationProvider}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Evento Gatilho:</span>
                              <p className="font-medium">
                                {availableEvents.find(e => e.value === selectedEvent)?.label || selectedEvent}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Contatos Extraídos:</span>
                              <p className="font-medium">{extractedContacts.length}</p>
                            </div>
                          </>
                        ) : (
                          <div>
                            <span className="text-muted-foreground">Contatos:</span>
                            <p className="font-medium">{formData.contacts.length}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Luna AI:</span>
                          <p className="font-medium">
                            {formData.luna_enabled 
                              ? `Ativado (${generatedVariations.length || formData.luna_variations_count} variações)` 
                              : 'Desativado'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Janela de envio:</span>
                          <p className="font-medium">
                            {useAdvancedSchedule ? 'Por período' : `${formData.send_window_start} - ${formData.send_window_end}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Credits Check - apenas para campanhas que não são de integração */}
                  {formData.campaign_type !== 'integracao' ? (
                    <Card className={cn(
                      "border-2",
                      hasEnoughCredits ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              <CreditCard className="w-5 h-5" />
                              Custo Estimado
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              1 crédito por mensagem enviada
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{creditsNeeded}</p>
                            <p className="text-sm text-muted-foreground">
                              créditos necessários
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <span className="text-sm">Seu saldo:</span>
                          <Badge variant={hasEnoughCredits ? 'default' : 'destructive'}>
                            {credits?.available_credits || 0} créditos
                          </Badge>
                        </div>

                        {!hasEnoughCredits && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            Saldo insuficiente. Compre mais créditos para continuar.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-2 border-green-500/20 bg-green-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-600">Campanha Automática</h3>
                            <p className="text-sm text-muted-foreground">
                              Créditos serão consumidos conforme os eventos forem disparados
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-1"
            >
              {step === STEPS.length ? (
                <>
                  <Check className="w-4 h-4" />
                  Criar Campanha
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
