import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Smartphone,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { ChatbotTemplates } from './ChatbotTemplates';
import { ChatbotSessionViewer } from './ChatbotSessionViewer';

type ResponseType = 'text' | 'buttons' | 'list';

type MenuOptionForm = {
  id: string;
  text: string;
  reply: string;
};

type FlowConfig = {
  version?: string;
  startStep: string;
  steps: Record<string, any>;
};

interface Chatbot {
  id: string;
  instance_id: string | null;
  name: string;
  trigger_type: string;
  trigger_keywords: string[];
  response_type: string;
  response_content: string | null;
  response_buttons: any[];
  response_list: any;
  delay_seconds: number;
  is_active: boolean;
  priority: number;
  match_count: number;
  created_at: string;
  // Fluxo (etapas)
  flow_config?: FlowConfig | null;
  max_attempts?: number | null;
  fallback_message?: string | null;
  company_name?: string | null;
}

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

function buildFlowFromMenu(params: {
  greetingMessage: string;
  menuMessage: string;
  options: MenuOptionForm[];
  fallbackMessage: string;
  maxAttempts: number;
}): FlowConfig {
  const greetingMessage = params.greetingMessage?.trim() || 'Olá! 👋\n\nComo posso ajudar você hoje?';
  const menuMessage = params.menuMessage?.trim() || '📋 *Menu Principal*\n\nEscolha uma opção:';

  const safeOptions = (params.options || [])
    .map((o, i) => ({
      id: o.id,
      text: o.text?.trim() || `Opção ${i + 1}`,
      reply: o.reply?.trim() || 'Perfeito! ✅\n\nEm que mais posso ajudar?'
    }))
    .filter((o) => o.text.length > 0);

  const steps: Record<string, any> = {
    greeting: {
      id: 'greeting',
      type: 'greeting',
      message: greetingMessage,
      next: 'main_menu',
    },
    main_menu: {
      id: 'main_menu',
      type: 'menu',
      message: menuMessage,
      options: safeOptions.map((opt, idx) => ({
        id: idx + 1,
        text: opt.text,
        next: `opt_${idx + 1}`,
      })),
    },
    goodbye: {
      id: 'goodbye',
      type: 'end',
      message: '✅ Atendimento finalizado!\n\nObrigado por falar com a {{empresa}}.\nVolte sempre! 👋',
    },
  };

  safeOptions.forEach((opt, idx) => {
    steps[`opt_${idx + 1}`] = {
      id: `opt_${idx + 1}`,
      type: 'menu',
      message: opt.reply,
      options: [
        { id: 1, text: '📋 Voltar ao menu principal', next: 'main_menu' },
        { id: 2, text: '👋 Encerrar atendimento', next: 'goodbye' },
      ],
    };
  });

  return {
    version: '1.0',
    startStep: 'greeting',
    steps,
  };
}

function deriveMenuOptionsFromFlow(flow: any): MenuOptionForm[] {
  try {
    const options = flow?.steps?.main_menu?.options || [];
    return (options as any[]).map((o, idx) => {
      const nextId = o?.next;
      const reply = flow?.steps?.[nextId]?.message || '';
      return {
        id: String(idx + 1),
        text: String(o?.text || ''),
        reply: String(reply || ''),
      };
    });
  } catch {
    return [];
  }
}

function safeParseJson<T = any>(value: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(value) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'JSON inválido' };
  }
}

export function GenesisChatbots({ instances }: GenesisChatbotsProps) {
  const { genesisUser } = useGenesisAuth();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chatbots' | 'sessions'>('chatbots');
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    trigger_type: 'keyword',
    keywords: '',
    response_type: 'list' as ResponseType,
    response: '',
    menu_message: '📋 *Menu Principal*\n\nEscolha uma opção:',
    delay: 2,
    instance_id: '',
    company_name: '',
    max_attempts: 3,
    fallback_message: 'Não entendi sua resposta 😅\nPor favor, digite apenas o *número* da opção desejada.',
    menu_options: [{ id: '1', text: '', reply: '' }] as MenuOptionForm[],
    use_flow_json: false,
    flow_config_json: '',
  });
  
  // Preview tab
  const [previewTab, setPreviewTab] = useState<'config' | 'preview'>('config');

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

  useEffect(() => {
    fetchChatbots();
  }, [fetchChatbots]);

  const resetForm = () => {
    setForm({
      name: '',
      trigger_type: 'keyword',
      keywords: '',
      response_type: 'list',
      response: '',
      menu_message: '📋 *Menu Principal*\n\nEscolha uma opção:',
      delay: 2,
      instance_id: '',
      company_name: '',
      max_attempts: 3,
      fallback_message: 'Não entendi sua resposta 😅\nPor favor, digite apenas o *número* da opção desejada.',
      menu_options: [{ id: '1', text: '', reply: '' }],
      use_flow_json: false,
      flow_config_json: '',
    });
    setPreviewTab('config');
  };

  const openCreateDialog = () => {
    setEditingChatbot(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const saveChatbot = async () => {
    if (!form.name.trim()) {
      toast.error('Digite um nome para o chatbot');
      return;
    }

    // Validação mínima do fluxo (sem IA)
    if ((form.response_type === 'list' || form.response_type === 'buttons') && !form.response.trim()) {
      toast.error('Digite a mensagem inicial');
      return;
    }

    if ((form.response_type === 'list' || form.response_type === 'buttons') && form.menu_options.filter(o => o.text.trim()).length === 0) {
      toast.error('Adicione pelo menos 1 opção de menu');
      return;
    }

    setIsSaving(true);
    try {
      const wantsFlow = form.response_type === 'list' || form.response_type === 'buttons';

      let flowConfig: FlowConfig | null = null;
      if (wantsFlow) {
        if (form.use_flow_json) {
          const parsed = safeParseJson<FlowConfig>(form.flow_config_json || '');
          if (!parsed.ok) {
            toast.error(`Flow JSON inválido: ${parsed.error}`);
            setIsSaving(false);
            return;
          }
          flowConfig = parsed.data;
        } else {
          flowConfig = buildFlowFromMenu({
            greetingMessage: form.response,
            menuMessage: form.menu_message,
            options: form.menu_options,
            fallbackMessage: form.fallback_message,
            maxAttempts: form.max_attempts,
          });
        }
      }

      const data: Record<string, unknown> = {
        name: form.name,
        trigger_type: form.trigger_type,
        trigger_keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        response_type: wantsFlow ? 'menu' : 'text',
        response_content: form.response || null,
        response_buttons: form.response_type === 'buttons' ? form.menu_options.filter(o => o.text.trim()).map((o, idx) => ({ id: String(idx + 1), text: o.text })) : null,
        response_list: wantsFlow
          ? {
              message: form.menu_message,
              options: form.menu_options.filter(o => o.text.trim()).map((o, idx) => ({ id: String(idx + 1), text: o.text })),
            }
          : null,
        delay_seconds: form.delay,
        instance_id: form.instance_id || null,
        trigger_conditions: null,

        // Sem IA
        ai_enabled: false,
        ai_model: null,
        ai_temperature: null,
        ai_system_prompt: null,

        // Fluxo configurável
        flow_config: flowConfig || {},
        max_attempts: form.max_attempts,
        fallback_message: form.fallback_message,
        company_name: form.company_name || null,
      };

      if (editingChatbot) {
        const { error } = await supabase
          .from('whatsapp_automations')
          .update(data)
          .eq('id', editingChatbot.id);
        if (error) throw error;
        toast.success('Chatbot atualizado!');
      } else {
        const insertData = { ...data, priority: chatbots.length + 1 } as any;
        const { error } = await supabase
          .from('whatsapp_automations')
          .insert(insertData);
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
      const { error } = await supabase
        .from('whatsapp_automations')
        .update({ is_active: !chatbot.is_active })
        .eq('id', chatbot.id);
      if (error) throw error;
      toast.success(chatbot.is_active ? 'Chatbot pausado' : 'Chatbot ativado');
      fetchChatbots();
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const openEditDialog = (chatbot: Chatbot) => {
    const flow = chatbot.flow_config || null;
    const derivedOptions = flow ? deriveMenuOptionsFromFlow(flow) : [];

    setEditingChatbot(chatbot);
    setForm({
      name: chatbot.name,
      trigger_type: chatbot.trigger_type,
      keywords: chatbot.trigger_keywords?.join(', ') || '',
      response_type: (chatbot.response_type === 'menu' ? 'list' : (chatbot.response_type as ResponseType)) || 'list',
      response: (flow?.steps?.greeting?.message as string) || chatbot.response_content || '',
      menu_message: (flow?.steps?.main_menu?.message as string) || '📋 *Menu Principal*\n\nEscolha uma opção:',
      delay: chatbot.delay_seconds,
      instance_id: chatbot.instance_id || '',
      company_name: chatbot.company_name || '',
      max_attempts: chatbot.max_attempts || 3,
      fallback_message: chatbot.fallback_message || 'Não entendi sua resposta 😅\nPor favor, digite apenas o *número* da opção desejada.',
      menu_options: derivedOptions.length ? derivedOptions : [{ id: '1', text: '', reply: '' }],
      use_flow_json: Boolean(flow && Object.keys(flow).length > 0),
      flow_config_json: flow && Object.keys(flow).length > 0 ? JSON.stringify(flow, null, 2) : '',
    });
    setPreviewTab('config');
    setIsDialogOpen(true);
  };

  const deleteChatbot = async (id: string) => {
    try {
      const { error } = await supabase.from('whatsapp_automations').delete().eq('id', id);
      if (error) throw error;
      toast.success('Chatbot removido');
      fetchChatbots();
    } catch (error) {
      toast.error('Erro ao remover chatbot');
    }
  };


  // Stats
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
              </motion.div>
              <div>
                <CardTitle className="text-lg sm:text-2xl flex items-center gap-2 flex-wrap">
                  Chatbots
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Configure respostas automáticas com fluxo de etapas
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => setIsTemplatesOpen(true)} 
                className="gap-2"
                size="sm"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Templates</span>
              </Button>
              <Button onClick={openCreateDialog} size="sm" className="gap-2 shadow-lg">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Chatbot</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="p-3 sm:p-4 bg-muted/50 rounded-xl">
              <p className="text-xl sm:text-2xl font-bold">{chatbots.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 sm:p-4 bg-green-500/10 rounded-xl">
              <p className="text-xl sm:text-2xl font-bold text-green-600">{activeChatbots}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </div>

          {/* Tabs for Chatbots and Sessions */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
            <TabsList>
              <TabsTrigger value="chatbots" className="gap-2">
                <Bot className="w-4 h-4" />
                Chatbots
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-2">
                <Activity className="w-4 h-4" />
                Sessões
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <ChatbotSessionViewer />
      )}

      {/* Chatbots List */}
      {activeTab === 'chatbots' && chatbots.length === 0 && (
        <Card>
          <CardContent className="py-10 sm:py-16 text-center px-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </motion.div>
            <h3 className="font-semibold text-lg sm:text-xl mb-2">Crie seu primeiro chatbot</h3>
             <p className="text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
               Configure um fluxo de etapas (mensagem inicial + menu + respostas)
             </p>
             <div className="flex flex-col sm:flex-row gap-2 justify-center">
               <Button onClick={() => setIsTemplatesOpen(true)} variant="outline" className="gap-2">
                 <FileText className="w-5 h-5" />
                 Usar Template
               </Button>
               <Button onClick={openCreateDialog} className="gap-2">
                 <Plus className="w-5 h-5" />
                 Criar Chatbot
               </Button>
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
                <motion.div
                  key={chatbot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`transition-all hover:shadow-lg ${
                    chatbot.is_active ? 'border-primary/30' : 'opacity-70'
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          chatbot.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <TriggerIcon className="w-5 h-5" />
                        </div>
                          <div>
                            <h4 className="font-semibold">{chatbot.name}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {triggerInfo?.label}
                            </Badge>
                          </div>
                        </div>
                        <Switch
                          checked={chatbot.is_active}
                          onCheckedChange={() => toggleChatbot(chatbot)}
                        />
                      </div>

                      {chatbot.trigger_keywords && chatbot.trigger_keywords.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1.5">Palavras-chave:</p>
                          <div className="flex flex-wrap gap-1">
                            {chatbot.trigger_keywords.slice(0, 3).map((kw: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {kw}
                              </Badge>
                            ))}
                            {chatbot.trigger_keywords.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{chatbot.trigger_keywords.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}


                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {chatbot.response_content || 'Sem mensagem configurada'}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditDialog(chatbot)}
                        >
                          <Settings2 className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteChatbot(chatbot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              {editingChatbot ? 'Editar Chatbot' : 'Novo Chatbot'}
            </DialogTitle>
            <DialogDescription>
              Configure as respostas automáticas do seu bot
            </DialogDescription>
          </DialogHeader>

          {/* Tabs: Config | Preview */}
          <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="config" className="gap-2">
                <Settings2 className="w-4 h-4" />
                Configuração
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview WhatsApp
              </TabsTrigger>
            </TabsList>

            {/* Config Tab */}
            <TabsContent value="config" className="flex-1 overflow-y-auto pr-2 -mr-2 mt-4">
              <div className="space-y-6 py-2">
                {/* Name */}
                <div className="space-y-2">
                  <Label>Nome do Chatbot *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Atendimento 24h"
                  />
                </div>

                {/* Instance */}
                {instances.length > 0 && (
                  <div className="space-y-2">
                    <Label>Instância (opcional)</Label>
                    <Select
                      value={form.instance_id || "__all__"}
                      onValueChange={(v) => setForm({ ...form, instance_id: v === "__all__" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as instâncias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todas as instâncias</SelectItem>
                        {instances.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Trigger Type */}
                <div className="space-y-2">
                  <Label>Gatilho</Label>
                  <Select
                    value={form.trigger_type}
                    onValueChange={(v) => setForm({ ...form, trigger_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <t.icon className="w-4 h-4" />
                            <span>{t.label}</span>
                            <span className="text-xs text-muted-foreground">- {t.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Keywords */}
                {form.trigger_type === 'keyword' && (
                  <div className="space-y-2">
                    <Label>Palavras-chave (separadas por vírgula) *</Label>
                    <Input
                      value={form.keywords}
                      onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                      placeholder="oi, olá, bom dia, preço, *"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use * para responder a qualquer mensagem
                    </p>
                  </div>
                )}

                {/* Response Type */}
                <div className="space-y-2">
                  <Label>Tipo de Resposta</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {RESPONSE_TYPES.map((rt) => (
                      <Button
                        key={rt.value}
                        type="button"
                        variant={form.response_type === rt.value ? 'default' : 'outline'}
                        className="justify-start gap-2 relative h-auto py-3"
                        onClick={() => !rt.disabled && setForm({ ...form, response_type: rt.value, ai_enabled: rt.value === 'ai' })}
                        disabled={rt.disabled}
                      >
                        <rt.icon className="w-4 h-4" />
                        <span>{rt.label}</span>
                        {rt.disabled && (
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Response Content - Text */}
                {form.response_type === 'text' && (
                  <div className="space-y-4 p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Mensagem de Resposta</span>
                    </div>
                    <Textarea
                      value={form.response}
                      onChange={(e) => setForm({ ...form, response: e.target.value })}
                      placeholder={`Olá! 👋 Bem-vindo ao nosso atendimento!\n\nComo posso ajudar você hoje?\n\n1️⃣ Ver produtos\n2️⃣ Consultar preços\n3️⃣ Falar com atendente\n\nDigite o número da opção desejada:`}
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setForm({ ...form, response: form.response + ' {{nome}}' })}>
                        + Nome
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setForm({ ...form, response: form.response + ' {{telefone}}' })}>
                        + Telefone
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setForm({ ...form, response: form.response + '\n\n1️⃣ Opção 1\n2️⃣ Opção 2\n3️⃣ Opção 3' })}>
                        + Menu numérico
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use emojis e formatação para tornar a mensagem mais atrativa. Variáveis disponíveis: {'{{nome}}'}, {'{{telefone}}'}
                    </p>
                  </div>
                )}

                {/* AI Config */}
                {form.response_type === 'ai' && (
                  <div className="space-y-4 p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Configuração Luna IA</span>
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                        Gemini 2.5
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label>Mensagem inicial (opcional)</Label>
                      <Textarea
                        value={form.response}
                        onChange={(e) => setForm({ ...form, response: e.target.value })}
                        placeholder="Olá! Sou a Luna, sua assistente virtual. Como posso ajudar?"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Mensagem enviada antes da IA processar (opcional)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Personalidade / System Prompt *</Label>
                      <Textarea
                        value={form.ai_system_prompt}
                        onChange={(e) => setForm({ ...form, ai_system_prompt: e.target.value })}
                        placeholder={`Você é Luna, atendente virtual da empresa [NOME DA EMPRESA].\n\nSeu papel:\n- Responder dúvidas sobre produtos e serviços\n- Agendar atendimentos\n- Coletar informações de contato\n\nRegras:\n- Seja sempre educado e objetivo\n- Não invente informações\n- Encaminhe para humano quando necessário`}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Temperatura: {form.ai_temperature}</span>
                        <span className="text-xs text-muted-foreground">
                          {form.ai_temperature <= 0.3 ? '🎯 Preciso' : form.ai_temperature >= 0.7 ? '✨ Criativo' : '⚖️ Balanceado'}
                        </span>
                      </Label>
                      <Slider
                        value={[form.ai_temperature]}
                        onValueChange={([v]) => setForm({ ...form, ai_temperature: v })}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                    </div>
                  </div>
                )}

                {/* Delay */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>Delay antes de responder</span>
                    <span className="text-sm font-medium">{form.delay}s</span>
                  </Label>
                  <Slider
                    value={[form.delay]}
                    onValueChange={([v]) => setForm({ ...form, delay: v })}
                    min={0}
                    max={10}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Simula tempo de digitação humana (0 = instantâneo)
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="flex-1 overflow-y-auto mt-4">
              <div className="flex flex-col items-center p-4">
                {/* WhatsApp Phone Mockup */}
                <div className="w-full max-w-sm">
                  <div className="bg-[#075e54] text-white p-3 rounded-t-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{form.name || 'Seu Chatbot'}</p>
                      <p className="text-xs opacity-80">online</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#ece5dd] dark:bg-zinc-800 p-4 min-h-[400px] space-y-3">
                    {/* User message simulation */}
                    <div className="flex justify-end">
                      <div className="bg-[#dcf8c6] dark:bg-green-800 text-black dark:text-white px-3 py-2 rounded-lg max-w-[80%] shadow-sm">
                        <p className="text-sm">{form.keywords.split(',')[0]?.trim() || 'Olá'}</p>
                        <p className="text-[10px] text-right opacity-60 mt-1">12:00</p>
                      </div>
                    </div>

                    {/* Bot response */}
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-zinc-700 text-black dark:text-white px-3 py-2 rounded-lg max-w-[80%] shadow-sm">
                        <p className="text-sm whitespace-pre-wrap">
                          {form.response_type === 'ai' 
                            ? (form.response || 'Olá! Sou a Luna, sua assistente virtual. Como posso ajudar?') 
                            : (form.response || 'Configure sua mensagem de resposta...')
                          }
                        </p>
                        <p className="text-[10px] text-right opacity-60 mt-1 flex items-center justify-end gap-1">
                          12:00
                          <span className="text-blue-500">✓✓</span>
                        </p>
                      </div>
                    </div>

                    {form.response_type === 'ai' && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center mt-4">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span>Luna IA responderá de forma inteligente</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#f0f0f0] dark:bg-zinc-900 p-2 rounded-b-2xl flex items-center gap-2">
                    <div className="flex-1 bg-white dark:bg-zinc-800 rounded-full px-4 py-2 text-sm text-muted-foreground">
                      Digite uma mensagem...
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#075e54] flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4 max-w-sm">
                  Este é um preview de como seu chatbot aparecerá no WhatsApp. 
                  A aparência real pode variar ligeiramente.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveChatbot} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingChatbot ? 'Salvar Alterações' : 'Criar Chatbot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Chatbot Templates Modal */}
      <ChatbotTemplates
        isOpen={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onTemplateApply={() => {
          fetchChatbots();
        }}
      />
    </div>
  );
}
