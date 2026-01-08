import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  MessageCircle,
  FileText,
  Zap,
  Bot,
  CreditCard,
  Settings,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  BookOpen,
  PlayCircle,
  Lightbulb,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface GenesisHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WHATSAPP_SUPPORT = '+5527920005215';

const faqItems = [
  {
    question: 'Como conectar minha instância WhatsApp?',
    answer: 'Vá em "Instâncias" → "Nova Instância" → Escaneie o QR Code com seu WhatsApp Business. A conexão é instantânea.',
    icon: MessageCircle,
  },
  {
    question: 'Como funcionam os créditos?',
    answer: 'Cada mensagem enviada/recebida consome 1 crédito. Uso de IA consome créditos extras dependendo do modelo. Você pode comprar mais ou fazer upgrade do plano.',
    icon: CreditCard,
  },
  {
    question: 'Como criar um chatbot automático?',
    answer: 'Acesse "Chatbots" → "Novo Chatbot". Configure gatilho, mensagem inicial, menu de opções e respostas. Ou use um template pronto.',
    icon: Bot,
  },
  {
    question: 'O que é o Flow Builder?',
    answer: 'É uma ferramenta visual para criar fluxos de automação complexos. Conecte nós, defina condições e crie jornadas personalizadas.',
    icon: Zap,
  },
  {
    question: 'Como configurar a Luna IA?',
    answer: 'No chatbot, ative a Luna IA para respostas inteligentes. Ela interpreta mensagens de texto livre e direciona para as opções do menu.',
    icon: Sparkles,
  },
  {
    question: 'Por que minha instância está "Verificando"?',
    answer: 'Isso indica que a conexão está sendo validada. Aguarde 30 segundos. Se persistir, desconecte e reconecte o WhatsApp.',
    icon: Clock,
  },
];

const quickGuides = [
  {
    title: 'Primeiros Passos',
    description: 'Configure sua primeira instância e chatbot',
    duration: '5 min',
    icon: PlayCircle,
    steps: ['Conecte o WhatsApp', 'Crie um chatbot', 'Ative o atendimento'],
  },
  {
    title: 'Chatbot Avançado',
    description: 'Crie fluxos com menu e respostas automáticas',
    duration: '10 min',
    icon: Bot,
    steps: ['Use templates prontos', 'Configure menu de opções', 'Defina respostas por opção'],
  },
  {
    title: 'Flow Builder',
    description: 'Automações visuais poderosas',
    duration: '15 min',
    icon: Zap,
    steps: ['Crie um novo fluxo', 'Conecte nós de ação', 'Ative gatilhos'],
  },
  {
    title: 'Luna IA',
    description: 'Inteligência artificial no atendimento',
    duration: '8 min',
    icon: Sparkles,
    steps: ['Ative a Luna no chatbot', 'Configure prompt', 'Teste respostas'],
  },
];

const features = [
  { name: 'Instâncias WhatsApp', description: 'Conecte múltiplos números', icon: MessageCircle },
  { name: 'Chatbots Inteligentes', description: 'Respostas automáticas com IA', icon: Bot },
  { name: 'Flow Builder', description: 'Automações visuais drag & drop', icon: Zap },
  { name: 'Métricas em Tempo Real', description: 'Acompanhe performance', icon: FileText },
  { name: 'Webhooks', description: 'Integração com sistemas externos', icon: Settings },
  { name: 'Luna IA', description: 'IA conversacional avançada', icon: Sparkles },
];

export function GenesisHelpModal({ open, onOpenChange }: GenesisHelpModalProps) {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Olá! Preciso de ajuda com o Genesis Hub.');
    window.open(`https://wa.me/${WHATSAPP_SUPPORT.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <HelpCircle className="w-7 h-7 text-primary-foreground" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl font-bold">Central de Ajuda</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Tudo que você precisa saber sobre o Genesis Hub</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 border-b bg-card">
            <TabsList className="w-full grid grid-cols-4 h-11">
              <TabsTrigger value="faq" className="gap-2 text-sm">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">FAQ</span>
              </TabsTrigger>
              <TabsTrigger value="guides" className="gap-2 text-sm">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Guias</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="gap-2 text-sm">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Recursos</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-2 text-sm">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Contato</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            {/* FAQ Tab */}
            <TabsContent value="faq" className="m-0 p-6">
              <div className="space-y-3">
                {faqItems.map((item, index) => {
                  const Icon = item.icon;
                  const isExpanded = expandedFaq === index;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          isExpanded && "ring-2 ring-primary/20"
                        )}
                        onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                              isExpanded ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold text-sm">{item.question}</h4>
                                <ChevronRight className={cn(
                                  "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0",
                                  isExpanded && "rotate-90"
                                )} />
                              </div>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.p
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="text-sm text-muted-foreground mt-2"
                                  >
                                    {item.answer}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent value="guides" className="m-0 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {quickGuides.map((guide, index) => {
                  const Icon = guide.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary group-hover:to-primary/70 transition-colors">
                              <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{guide.title}</h4>
                                <Badge variant="secondary" className="text-xs">{guide.duration}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
                              <div className="space-y-1.5">
                                {guide.steps.map((step, stepIndex) => (
                                  <div key={stepIndex} className="flex items-center gap-2 text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    <span className="text-muted-foreground">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="m-0 p-6">
              <div className="grid gap-3 md:grid-cols-2">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{feature.name}</h4>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="m-0 p-6">
              <div className="space-y-6">
                {/* WhatsApp Support Card */}
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                        whileHover={{ scale: 1.05 }}
                      >
                        <MessageCircle className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Suporte via WhatsApp</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Fale diretamente com nossa equipe de suporte
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="gap-1.5 border-green-500/30 text-green-600">
                            <Phone className="w-3 h-3" />
                            {WHATSAPP_SUPPORT}
                          </Badge>
                          <Badge variant="outline" className="gap-1.5">
                            <Clock className="w-3 h-3" />
                            Seg-Sex, 9h às 18h
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={handleWhatsAppContact}
                        className="gap-2 bg-green-500 hover:bg-green-600 text-white shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Iniciar Conversa
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Contact Options */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Mail className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">E-mail</h4>
                          <p className="text-sm text-muted-foreground">suporte@genesis.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Documentação</h4>
                          <p className="text-sm text-muted-foreground">docs.genesis.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Response Time */}
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Tempo médio de resposta</p>
                      <p className="text-xs text-muted-foreground">WhatsApp: até 30 minutos • E-mail: até 24 horas</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Versão 2.0.0 • Genesis Hub
          </p>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleWhatsAppContact}
            className="gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            <MessageCircle className="w-4 h-4" />
            Falar com Suporte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
