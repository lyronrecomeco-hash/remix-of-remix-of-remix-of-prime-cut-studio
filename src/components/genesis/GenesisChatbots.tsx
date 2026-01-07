import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Plus,
  Trash2,
  Loader2,
  Zap,
  MessageSquare,
  Hash,
  Users,
  LayoutGrid,
  List,
  Moon,
  Timer,
  Settings2,
  FileText,
  Activity,
  Eye,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { ChatbotTemplates } from './ChatbotTemplates';
import { ChatbotSessionViewer } from './ChatbotSessionViewer';
import {
  ChatbotFormState,
  DEFAULT_FORM_STATE,
  Chatbot,
  FlowConfig,
  buildFlowConfigFromForm,
  extractFormFromFlow,
  GreetingSection,
  MenuSection,
  ErrorControlSection,
  AISection,
  AdvancedSection,
  PreviewSection,
} from './chatbot-config';

type ResponseType = 'text' | 'buttons' | 'list';

interface GenesisChatbotsProps {
  instances: Array<{ id: string; name: string; status: string }>;
}

const TRIGGER_TYPES = [
  { value: 'keyword', label: 'Palavra-chave', icon: Hash, description: 'Responde quando mensagem contém palavra' },
  { value: 'all', label: 'Todas as mensagens', icon: MessageSquare, description: 'Responde a qualquer mensagem' },
  { value: 'first_contact', label: 'Primeiro contato', icon: Users, description: 'Apenas na primeira mensagem' },
  { value: 'business_hours', label: 'Fora do expediente', icon: Moon, description: 'Responde fora do horário' },
  { value: 'inactivity', label: 'Inatividade', icon: Timer, description: 'Após X minutos sem resposta' },
];

const RESPONSE_TYPES: Array<{ value: ResponseType; label: string; icon: any }> = [
  { value: 'text', label: 'Texto simples', icon: MessageSquare },
  { value: 'list', label: 'Menu de lista', icon: List },
  { value: 'buttons', label: 'Com botões', icon: LayoutGrid },
];

export function GenesisChatbots({ instances }: GenesisChatbotsProps) {
  const { genesisUser } = useGenesisAuth();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chatbots' | 'sessions'>('chatbots');
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<'config' | 'preview'>('config');

  const [form, setForm] = useState<ChatbotFormState>(DEFAULT_FORM_STATE);

  const generatedFlow = useMemo(() => {
    if (form.response_type === 'text') return null;
    return buildFlowConfigFromForm(form);
  }, [form]);

  const fetchChatbots = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_automations')
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      setChatbots((data || []) as unknown as Chatbot[]);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchChatbots(); }, [fetchChatbots]);

  const resetForm = () => {
    setForm(DEFAULT_FORM_STATE);
    setPreviewTab('config');
  };

  const openCreateDialog = () => {
    setEditingChatbot(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (chatbot: Chatbot) => {
    setEditingChatbot(chatbot);
    const flowExtracted = extractFormFromFlow(chatbot.flow_config || null, chatbot);
    setForm({
      ...DEFAULT_FORM_STATE,
      name: chatbot.name,
      trigger_type: chatbot.trigger_type,
      keywords: chatbot.trigger_keywords?.join(', ') || '',
      response_type: (chatbot.response_type === 'menu' ? 'list' : (chatbot.response_type as ResponseType)) || 'list',
      delay: chatbot.delay_seconds,
      instance_id: chatbot.instance_id || '',
      company_name: chatbot.company_name || '',
      max_attempts: chatbot.max_attempts || 3,
      fallback_message: chatbot.fallback_message || DEFAULT_FORM_STATE.fallback_message,
      ...flowExtracted,
      menu_options: flowExtracted.menu_options || DEFAULT_FORM_STATE.menu_options,
    });
    setPreviewTab('config');
    setIsDialogOpen(true);
  };

  const saveChatbot = async () => {
    if (!form.name.trim()) {
      toast.error('Digite um nome para o chatbot');
      return;
    }
    if ((form.response_type === 'list' || form.response_type === 'buttons') && 
        form.menu_options.filter(o => o.text.trim()).length === 0) {
      toast.error('Adicione pelo menos 1 opção de menu');
      return;
    }

    setIsSaving(true);
    try {
      const wantsFlow = form.response_type !== 'text';
      let flowConfig: FlowConfig | null = null;
      
      if (wantsFlow) {
        if (form.use_flow_json && form.flow_config_json) {
          try {
            flowConfig = JSON.parse(form.flow_config_json);
          } catch {
            toast.error('Flow JSON inválido');
            setIsSaving(false);
            return;
          }
        } else {
          flowConfig = buildFlowConfigFromForm(form);
        }
      }

      const data: Record<string, unknown> = {
        name: form.name,
        trigger_type: form.trigger_type,
        trigger_keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        response_type: wantsFlow ? 'menu' : 'text',
        response_content: form.greeting_message || null,
        response_buttons: form.response_type === 'buttons' ? form.menu_options.filter(o => o.text.trim()).map((o, idx) => ({ id: String(idx + 1), text: o.text })) : null,
        response_list: wantsFlow ? { message: `${form.menu_title}\n\n${form.menu_description}`, options: form.menu_options.filter(o => o.text.trim()).map((o, idx) => ({ id: String(idx + 1), text: o.text })) } : null,
        delay_seconds: form.delay,
        instance_id: form.instance_id || null,
        ai_enabled: form.ai_mode !== 'disabled',
        ai_model: form.ai_mode !== 'disabled' ? 'Luna IA' : null,
        ai_temperature: form.ai_mode !== 'disabled' ? form.ai_temperature : null,
        ai_system_prompt: form.ai_mode !== 'disabled' ? form.ai_system_prompt : null,
        flow_config: flowConfig || {},
        max_attempts: form.max_attempts,
        fallback_message: form.fallback_message,
        company_name: form.company_name || null,
      };

      if (editingChatbot) {
        const { error } = await supabase.from('whatsapp_automations').update(data).eq('id', editingChatbot.id);
        if (error) throw error;
        toast.success('Chatbot atualizado!');
      } else {
        const { error } = await supabase.from('whatsapp_automations').insert({ ...data, priority: chatbots.length + 1 } as any);
        if (error) throw error;
        toast.success('Chatbot criado!');
      }
      setIsDialogOpen(false);
      fetchChatbots();
    } catch (error) {
      console.error('Error saving chatbot:', error);
      toast.error('Erro ao salvar chatbot');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleChatbot = async (chatbot: Chatbot) => {
    try {
      const { error } = await supabase.from('whatsapp_automations').update({ is_active: !chatbot.is_active }).eq('id', chatbot.id);
      if (error) throw error;
      toast.success(chatbot.is_active ? 'Chatbot pausado' : 'Chatbot ativado');
      fetchChatbots();
    } catch { toast.error('Erro ao alterar status'); }
  };

  const deleteChatbot = async (id: string) => {
    try {
      const { error } = await supabase.from('whatsapp_automations').delete().eq('id', id);
      if (error) throw error;
      toast.success('Chatbot removido');
      fetchChatbots();
    } catch { toast.error('Erro ao remover chatbot'); }
  };

  const activeChatbots = chatbots.filter(c => c.is_active).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }} className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg flex-shrink-0">
                <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
              </motion.div>
              <div>
                <CardTitle className="text-lg sm:text-2xl flex items-center gap-2 flex-wrap">Chatbots</CardTitle>
                <CardDescription className="text-sm sm:text-base">Configure respostas automáticas com fluxo de etapas</CardDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setIsTemplatesOpen(true)} className="gap-2" size="sm">
                <FileText className="w-4 h-4" /><span className="hidden sm:inline">Templates</span>
              </Button>
              <Button onClick={openCreateDialog} size="sm" className="gap-2 shadow-lg">
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Novo Chatbot</span><span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="p-3 sm:p-4 bg-muted/50 rounded-xl"><p className="text-xl sm:text-2xl font-bold">{chatbots.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
            <div className="p-3 sm:p-4 bg-green-500/10 rounded-xl"><p className="text-xl sm:text-2xl font-bold text-green-600">{activeChatbots}</p><p className="text-xs text-muted-foreground">Ativos</p></div>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
            <TabsList>
              <TabsTrigger value="chatbots" className="gap-2"><Bot className="w-4 h-4" />Chatbots</TabsTrigger>
              <TabsTrigger value="sessions" className="gap-2"><Activity className="w-4 h-4" />Sessões</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
      </Card>

      {activeTab === 'sessions' && <ChatbotSessionViewer />}

      {activeTab === 'chatbots' && chatbots.length === 0 && (
        <Card>
          <CardContent className="py-10 sm:py-16 text-center px-4">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </motion.div>
            <h3 className="font-semibold text-lg sm:text-xl mb-2">Crie seu primeiro chatbot</h3>
            <p className="text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">Configure um fluxo de etapas (mensagem inicial + menu + respostas)</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => setIsTemplatesOpen(true)} variant="outline" className="gap-2"><FileText className="w-5 h-5" />Usar Template</Button>
              <Button onClick={openCreateDialog} className="gap-2"><Plus className="w-5 h-5" />Criar Chatbot</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'chatbots' && chatbots.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {chatbots.map((chatbot, index) => {
              const triggerInfo = TRIGGER_TYPES.find(t => t.value === chatbot.trigger_type);
              const TriggerIcon = triggerInfo?.icon || Zap;
              return (
                <motion.div key={chatbot.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }}>
                  <Card className={`transition-all hover:shadow-lg ${chatbot.is_active ? 'border-primary/30' : 'opacity-70'}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${chatbot.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <TriggerIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{chatbot.name}</h4>
                            <Badge variant="outline" className="text-xs mt-1">{triggerInfo?.label}</Badge>
                          </div>
                        </div>
                        <Switch checked={chatbot.is_active} onCheckedChange={() => toggleChatbot(chatbot)} />
                      </div>
                      {chatbot.trigger_keywords && chatbot.trigger_keywords.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1.5">Palavras-chave:</p>
                          <div className="flex flex-wrap gap-1">
                            {chatbot.trigger_keywords.slice(0, 3).map((kw: string, i: number) => (<Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>))}
                            {chatbot.trigger_keywords.length > 3 && (<Badge variant="secondary" className="text-xs">+{chatbot.trigger_keywords.length - 3}</Badge>)}
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{chatbot.response_content || 'Sem mensagem configurada'}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(chatbot)}><Settings2 className="w-4 h-4 mr-1" />Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteChatbot(chatbot.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Dialog - Enterprise Config */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" />{editingChatbot ? 'Editar Chatbot' : 'Novo Chatbot'}</DialogTitle>
            <DialogDescription>Configure todas as etapas do seu fluxo de atendimento</DialogDescription>
          </DialogHeader>

          <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="config" className="gap-2"><Settings2 className="w-4 h-4" />Configuração</TabsTrigger>
              <TabsTrigger value="preview" className="gap-2"><Eye className="w-4 h-4" />Preview WhatsApp</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="flex-1 overflow-y-auto pr-2 -mr-2 mt-4">
              <div className="space-y-6 py-2">
                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Nome do Chatbot *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Atendimento 24h" /></div>
                  {instances.length > 0 && (
                    <div className="space-y-2">
                      <Label>Instância</Label>
                      <Select value={form.instance_id || "__all__"} onValueChange={(v) => setForm({ ...form, instance_id: v === "__all__" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent><SelectItem value="__all__">Todas</SelectItem>{instances.map((inst) => (<SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Trigger */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Gatilho</Label>
                    <Select value={form.trigger_type} onValueChange={(v) => setForm({ ...form, trigger_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TRIGGER_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}><div className="flex items-center gap-2"><t.icon className="w-4 h-4" />{t.label}</div></SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  {form.trigger_type === 'keyword' && (
                    <div className="space-y-2"><Label>Palavras-chave *</Label><Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="oi, olá, bom dia, *" /></div>
                  )}
                </div>

                {/* Response Type */}
                <div className="space-y-2">
                  <Label>Tipo de Resposta</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {RESPONSE_TYPES.map((rt) => (
                      <Button key={rt.value} type="button" variant={form.response_type === rt.value ? 'default' : 'outline'} className="justify-start gap-2 h-auto py-3" onClick={() => setForm({ ...form, response_type: rt.value })}>
                        <rt.icon className="w-4 h-4" /><span>{rt.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Flow Sections */}
                {(form.response_type === 'list' || form.response_type === 'buttons') && (
                  <>
                    <GreetingSection form={form} setForm={setForm} />
                    <MenuSection form={form} setForm={setForm} />
                    <ErrorControlSection form={form} setForm={setForm} />
                    <AISection form={form} setForm={setForm} />
                    <AdvancedSection form={form} setForm={setForm} generatedFlow={generatedFlow} />
                  </>
                )}

                {/* Delay */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between"><span>Delay</span><span className="text-sm font-medium">{form.delay}s</span></Label>
                  <Slider value={[form.delay]} onValueChange={([v]) => setForm({ ...form, delay: v })} min={0} max={10} step={1} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-y-auto mt-4">
              <PreviewSection form={form} />
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveChatbot} disabled={isSaving} className="gap-2">{isSaving && <Loader2 className="w-4 h-4 animate-spin" />}{editingChatbot ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChatbotTemplates isOpen={isTemplatesOpen} onOpenChange={setIsTemplatesOpen} onTemplateApply={() => fetchChatbots()} />
    </div>
  );
}
