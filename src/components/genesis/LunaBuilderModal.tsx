import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, MessageSquare, Brain, Loader2, Zap, Save, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import lunaAvatar from '@/assets/luna-avatar.png';

interface ChatbotConfig {
  name: string;
  trigger_type: string;
  keywords: string;
  trigger_keywords?: string[];
  response_type: string;
  response: string;
  response_content?: string | null;
  delay: number;
  delay_seconds?: number;
  instance_id: string;
  ai_enabled: boolean;
  ai_model: string;
  ai_temperature: number;
  ai_system_prompt: string;
  personality_summary?: string;
  suggested_responses?: string[];
  welcome_message?: string;
}

interface LunaBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (config: ChatbotConfig) => void;
  instances: Array<{ id: string; name: string }>;
}

interface BuildStep {
  id: string;
  label: string;
  icon: string;
  content?: string;
  completed: boolean;
  active: boolean;
}

export function LunaBuilderModal({ open, onOpenChange, onComplete, instances }: LunaBuilderModalProps) {
  const [lunaPrompt, setLunaPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [generatedConfig, setGeneratedConfig] = useState<ChatbotConfig | null>(null);
  const [currentTyping, setCurrentTyping] = useState('');
  const [previewMessages, setPreviewMessages] = useState<Array<{ type: 'user' | 'bot'; text: string }>>([]);

  const updateStep = (stepId: string, updates: Partial<BuildStep>) => {
    setBuildSteps(prev => 
      prev.map(s => s.id === stepId ? { ...s, ...updates } : s)
    );
  };

  const addStep = (step: Omit<BuildStep, 'completed' | 'active'>) => {
    setBuildSteps(prev => [
      ...prev.map(s => ({ ...s, active: false })),
      { ...step, completed: false, active: true }
    ]);
  };

  const typeContent = async (content: string) => {
    setCurrentTyping('');
    for (let j = 0; j <= content.length; j++) {
      await new Promise(r => setTimeout(r, 15));
      setCurrentTyping(content.slice(0, j));
    }
  };

  const startBuild = async () => {
    if (!lunaPrompt.trim()) {
      toast.error('Digite uma descrição para a Luna');
      return;
    }

    setIsBuilding(true);
    setBuildSteps([]);
    setCurrentTyping('');
    setPreviewMessages([]);
    setShowPreview(false);
    setGeneratedConfig(null);

    try {
      // Step 1: Analyzing
      addStep({ id: 'analyze', label: 'Analisando sua descrição...', icon: '🔍' });
      await typeContent(`Entendi! Você precisa de um chatbot para: "${lunaPrompt.slice(0, 80)}..."`);
      await new Promise(r => setTimeout(r, 300));
      updateStep('analyze', { completed: true, active: false });

      // Step 2: Connecting to AI
      addStep({ id: 'ai', label: 'Conectando à Luna IA...', icon: '🧠' });
      await typeContent('Ativando inteligência artificial para criar seu chatbot profissional...');
      
      // Real API call
      const { data, error } = await supabase.functions.invoke('chatbot-luna-builder', {
        body: {
          description: lunaPrompt,
          instanceId: instances[0]?.id || null,
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Erro ao gerar chatbot');

      updateStep('ai', { completed: true, active: false });

      // Step 3: Configuring triggers
      addStep({ id: 'triggers', label: 'Configurando gatilhos inteligentes...', icon: '🎯' });
      const keywords = data.config.keywords || data.config.trigger_keywords || [];
      await typeContent(`Palavras-chave definidas: ${keywords.slice(0, 8).join(', ')}`);
      await new Promise(r => setTimeout(r, 300));
      updateStep('triggers', { completed: true, active: false });

      // Step 4: Personality
      addStep({ id: 'personality', label: 'Definindo personalidade IA...', icon: '✨' });
      await typeContent(data.config.personality_summary || 'Personalidade configurada: Profissional, amigável e prestativo');
      await new Promise(r => setTimeout(r, 300));
      updateStep('personality', { completed: true, active: false });

      // Step 5: Training
      addStep({ id: 'training', label: 'Treinando modelo com suas instruções...', icon: '📚' });
      await typeContent('System prompt otimizado com contexto específico do seu negócio');
      await new Promise(r => setTimeout(r, 300));
      updateStep('training', { completed: true, active: false });

      // Step 6: Preview
      addStep({ id: 'preview', label: 'Gerando preview do chatbot...', icon: '📱' });
      await typeContent('Preview pronto! Veja como seu chatbot vai responder...');
      updateStep('preview', { completed: true, active: false });

      // Store generated config
      const config: ChatbotConfig = {
        name: data.config.name,
        trigger_type: data.config.trigger_type || 'keyword',
        keywords: keywords.join(', '),
        trigger_keywords: keywords,
        response_type: 'ai',
        response: '',
        response_content: null,
        delay: data.config.delay_seconds || 2,
        delay_seconds: data.config.delay_seconds || 2,
        instance_id: instances[0]?.id || '',
        ai_enabled: true,
        ai_model: 'Luna IA',
        ai_temperature: data.config.ai_temperature || 0.7,
        ai_system_prompt: data.config.ai_system_prompt,
        personality_summary: data.config.personality_summary,
        suggested_responses: data.config.suggested_responses,
        welcome_message: data.config.welcome_message,
      };

      setGeneratedConfig(config);
      setShowPreview(true);

      // Simulate preview conversation
      await new Promise(r => setTimeout(r, 500));
      
      const welcomeMsg = config.welcome_message || config.suggested_responses?.[0] || 'Olá! Como posso ajudar você hoje? 😊';
      const demoConversation = [
        { type: 'user' as const, text: 'Olá, bom dia!' },
        { type: 'bot' as const, text: welcomeMsg },
        { type: 'user' as const, text: 'Quero saber mais informações' },
        { type: 'bot' as const, text: config.suggested_responses?.[1] || 'Claro! Estou aqui para ajudar. O que você gostaria de saber?' },
      ];

      for (const msg of demoConversation) {
        setPreviewMessages(prev => [...prev, msg]);
        await new Promise(r => setTimeout(r, 600));
      }

      toast.success('Chatbot criado pela Luna!');
    } catch (error) {
      console.error('Luna build error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar chatbot');
      resetState();
    } finally {
      setIsBuilding(false);
    }
  };

  const saveDirectly = async () => {
    if (!generatedConfig) return;

    setIsSaving(true);
    try {
      // Parse keywords properly - can be array or comma-separated string
      let keywords: string[] = [];
      if (Array.isArray(generatedConfig.trigger_keywords)) {
        keywords = generatedConfig.trigger_keywords;
      } else if (Array.isArray(generatedConfig.keywords)) {
        keywords = generatedConfig.keywords;
      } else if (typeof generatedConfig.keywords === 'string') {
        keywords = generatedConfig.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      }

      const insertData = {
        name: generatedConfig.name || 'Chatbot Luna',
        trigger_type: generatedConfig.trigger_type || 'keyword',
        trigger_keywords: keywords,
        response_type: 'text',
        response_content: null,
        delay_seconds: Number(generatedConfig.delay_seconds) || Number(generatedConfig.delay) || 2,
        instance_id: null, // NEVER use instance_id from AI
        ai_enabled: true,
        ai_model: 'gpt-4o-mini',
        ai_temperature: Number(generatedConfig.ai_temperature) || 0.7,
        ai_system_prompt: generatedConfig.ai_system_prompt || '',
        is_active: true,
        priority: 1,
      };

      console.log('Saving chatbot:', insertData);

      const { error } = await supabase
        .from('whatsapp_automations')
        .insert(insertData as any);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      toast.success('🎉 Chatbot salvo e ativado com sucesso!');
      onOpenChange(false);
      resetState();
      
      // Trigger refresh
      window.dispatchEvent(new CustomEvent('chatbot-created'));
    } catch (error) {
      console.error('Error saving chatbot:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar chatbot');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = () => {
    if (generatedConfig) {
      onComplete(generatedConfig);
      onOpenChange(false);
      resetState();
      toast.success('Configuração aplicada! Revise e salve.');
    }
  };

  const resetState = () => {
    setLunaPrompt('');
    setIsBuilding(false);
    setShowPreview(false);
    setBuildSteps([]);
    setGeneratedConfig(null);
    setCurrentTyping('');
    setPreviewMessages([]);
  };

  const handleClose = () => {
    if (!isBuilding && !isSaving) {
      onOpenChange(false);
      resetState();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-b from-background to-background/95">
        <DialogHeader className="border-b border-border pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 -mx-6 -mt-6 px-6 pt-6 rounded-t-lg flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-2 ring-primary/30 overflow-hidden shadow-xl shadow-primary/20">
              <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="flex items-center gap-2">
                Luna IA Builder
                <Badge className="bg-gradient-to-r from-primary to-primary/60 text-primary-foreground border-0 text-[10px]">
                  GENESIS PRO
                </Badge>
              </span>
              <p className="text-sm font-normal text-muted-foreground">
                Construção inteligente de chatbots com IA real
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          {!isBuilding && !showPreview ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Brain className="w-5 h-5 text-primary" />
                <p className="text-sm">
                  Descreva seu negócio e como quer que o chatbot atenda. A Luna vai criar tudo automaticamente!
                </p>
              </div>
              
              <Textarea
                value={lunaPrompt}
                onChange={(e) => setLunaPrompt(e.target.value)}
                placeholder="Ex: Tenho uma pizzaria chamada 'Pizza do João'. Preciso de um chatbot para responder sobre cardápio (temos pizzas tradicionais, premium e doces), preços (a partir de R$35), horário de funcionamento (18h às 23h de ter a dom), tempo de entrega (40-60 min) e formas de pagamento (pix, cartão, dinheiro). O atendimento deve ser descontraído mas profissional..."
                rows={8}
                className="resize-none text-base"
              />
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <Zap className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs font-medium">IA Real</p>
                  <p className="text-[10px] text-muted-foreground">ChatGPT integrado</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <MessageSquare className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs font-medium">Respostas Dinâmicas</p>
                  <p className="text-[10px] text-muted-foreground">Contextuais</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs font-medium">100% Automático</p>
                  <p className="text-[10px] text-muted-foreground">Pronto pra usar</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex gap-4 h-full">
              {/* Build Progress */}
              <div className="flex-1 space-y-4 overflow-auto">
                <div className="space-y-3">
                  {buildSteps.map((step, idx) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-lg border transition-all ${
                        step.active 
                          ? 'border-primary bg-primary/5' 
                          : step.completed 
                            ? 'border-green-500/30 bg-green-500/5' 
                            : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{step.icon}</span>
                        <span className={`text-sm font-medium ${
                          step.completed ? 'text-green-600' : step.active ? 'text-primary' : ''
                        }`}>
                          {step.label}
                        </span>
                        {step.completed && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                        {step.active && (
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="ml-auto w-2 h-2 rounded-full bg-primary"
                          />
                        )}
                      </div>
                      {step.active && currentTyping && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 text-xs text-muted-foreground pl-8"
                        >
                          {currentTyping}
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            |
                          </motion.span>
                        </motion.p>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Generated Config Summary */}
                {generatedConfig && !isBuilding && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{generatedConfig.name}</span>
                      <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-600">
                        Pronto
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-card rounded-lg">
                        <p className="text-muted-foreground">Gatilho</p>
                        <p className="font-medium capitalize">{generatedConfig.trigger_type === 'keyword' ? 'Palavras-chave' : generatedConfig.trigger_type}</p>
                      </div>
                      <div className="p-2 bg-card rounded-lg">
                        <p className="text-muted-foreground">Tipo</p>
                        <p className="font-medium">Resposta IA</p>
                      </div>
                      <div className="p-2 bg-card rounded-lg">
                        <p className="text-muted-foreground">Modelo</p>
                        <p className="font-medium">Luna IA (ChatGPT)</p>
                      </div>
                      <div className="p-2 bg-card rounded-lg">
                        <p className="text-muted-foreground">Temperatura</p>
                        <p className="font-medium">{generatedConfig.ai_temperature}</p>
                      </div>
                    </div>

                    <div className="p-2 bg-card rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {(generatedConfig.trigger_keywords || generatedConfig.keywords.split(',')).slice(0, 8).map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {typeof kw === 'string' ? kw.trim() : kw}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {generatedConfig.personality_summary && (
                      <div className="p-2 bg-card rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Personalidade</p>
                        <p className="text-sm">{generatedConfig.personality_summary}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* iPhone Preview */}
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-72 flex-shrink-0"
                >
                  <div className="relative mx-auto w-[260px]">
                    <div className="relative bg-gray-900 rounded-[40px] p-2 shadow-2xl">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-20" />
                      
                      <div className="bg-card rounded-[32px] overflow-hidden">
                        <div className="h-10 bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">WhatsApp Preview</span>
                        </div>
                        
                        <div className="h-14 bg-card border-b flex items-center gap-3 px-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden">
                            <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm truncate max-w-[140px]">
                              {generatedConfig?.name || 'Luna Bot'}
                            </p>
                            <p className="text-[10px] text-green-500">online • IA ativa</p>
                          </div>
                        </div>
                        
                        <div className="h-72 bg-[#0a1014] p-3 space-y-2 overflow-y-auto">
                          <AnimatePresence>
                            {previewMessages.map((msg, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[85%] p-2.5 rounded-lg text-xs ${
                                  msg.type === 'user' 
                                    ? 'bg-primary/20 text-foreground rounded-br-none' 
                                    : 'bg-card text-foreground rounded-bl-none border'
                                }`}>
                                  {msg.text}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          {isBuilding && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-start"
                            >
                              <div className="bg-card border rounded-lg p-2.5 rounded-bl-none">
                                <motion.div
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="flex gap-1"
                                >
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                        
                        <div className="h-12 bg-card border-t flex items-center gap-2 px-3">
                          <div className="flex-1 h-8 bg-muted rounded-full px-3 flex items-center">
                            <span className="text-[10px] text-muted-foreground">Mensagem...</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          {!isBuilding && !showPreview ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={startBuild} 
                className="gap-2 bg-gradient-to-r from-primary to-primary/80" 
                disabled={!lunaPrompt.trim()}
              >
                <Sparkles className="w-4 h-4" />
                Criar com Luna IA
              </Button>
            </>
          ) : isBuilding ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Luna está construindo seu chatbot...
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full justify-between">
              <Button variant="ghost" onClick={resetState} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refazer
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleApply} className="gap-2">
                  <Eye className="w-4 h-4" />
                  Revisar Antes
                </Button>
                <Button onClick={saveDirectly} disabled={isSaving} className="gap-2 bg-gradient-to-r from-green-600 to-green-500">
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar e Ativar
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
