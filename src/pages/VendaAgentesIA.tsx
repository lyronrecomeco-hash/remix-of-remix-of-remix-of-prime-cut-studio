import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, MessageSquare, Lightbulb, Target, Shield, Play, Pause, RotateCcw, CheckCheck, Cpu, Database, Workflow, ArrowRight, Bot, Clock, AlertTriangle, UserX, Calendar, HelpCircle, ShoppingCart, Headphones, RefreshCw, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VendaHeader from '@/components/venda/VendaHeader';
import RealisticPhoneMockup from '@/components/venda/RealisticPhoneMockup';
import WhatsAppScreen from '@/components/venda/WhatsAppScreen';

interface Message {
  id: number;
  type: 'received' | 'sent' | 'thinking';
  text: string;
  time: string;
  reasoning?: string;
}

const lunaConversation: Message[] = [
  { id: 1, type: 'received', text: 'Oi, preciso de um tênis pra corrida, mas não sei qual escolher', time: '14:30' },
  { id: 2, type: 'thinking', text: '🧠 Analisando perfil...', time: '14:30', reasoning: 'Cliente indeciso → Fazer perguntas consultivas para entender necessidade' },
  { id: 3, type: 'sent', text: 'Olá! 👋 Posso te ajudar a encontrar o tênis perfeito! Me conta: você corre em qual tipo de terreno?', time: '14:30' },
  { id: 4, type: 'received', text: 'Geralmente corro na rua mesmo, asfalto', time: '14:31' },
  { id: 5, type: 'thinking', text: '🧠 Processando...', time: '14:31', reasoning: 'Asfalto → Priorizar amortecimento | Próxima: frequência e distância' },
  { id: 6, type: 'sent', text: 'Ótimo! E quantas vezes por semana você corre? Qual distância?', time: '14:31' },
  { id: 7, type: 'received', text: '3x por semana, uns 5-8km', time: '14:32' },
  { id: 8, type: 'thinking', text: '🧠 Calculando...', time: '14:32', reasoning: 'Frequência média + distância moderada = Sugerir opções intermediárias' },
  { id: 9, type: 'sent', text: 'Perfeito! Para seu perfil:\n\n🏃 Nike Pegasus - R$699\n🏃 Asics Nimbus - R$999\n🏃 Adidas Ultraboost - R$899\n\nQual faixa de preço?', time: '14:32' },
  { id: 10, type: 'received', text: 'O Nike, tem 42?', time: '14:33' },
  { id: 11, type: 'thinking', text: '🧠 Verificando...', time: '14:33', reasoning: 'Consulta estoque → Disponível | Cliente decidido → Facilitar fechamento' },
  { id: 12, type: 'sent', text: 'Sim! 🎉 Nike Pegasus, 42 em estoque!\n\nCupom CORREDOR10 = 10% OFF!\nDe R$699 por R$629,10 💚\n\nGero seu link de pagamento?', time: '14:33' },
];

const VendaAgentesIA = () => {
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [displayedMessages, scrollToBottom]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentIndex >= lunaConversation.length) { setIsPlaying(false); return; }

    const delay = lunaConversation[currentIndex].type === 'thinking' ? 800 : 1800;
    const timer = setTimeout(() => {
      setDisplayedMessages(prev => [...prev, lunaConversation[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
    }, currentIndex === 0 ? 500 : delay);

    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying]);

  const replay = () => { setDisplayedMessages([]); setCurrentIndex(0); setIsPlaying(true); };

  // Seção 1 - Problemas reais
  const problems = [
    { icon: Clock, title: 'Atendimento Lento', description: 'Clientes desistem quando esperam mais de 5 minutos' },
    { icon: UserX, title: 'Leads Frios', description: 'Leads esfriam sem follow-up automático e oportuno' },
    { icon: RefreshCw, title: 'Falta de Follow-up', description: 'Oportunidades perdidas por falta de acompanhamento' },
    { icon: Calendar, title: 'Fora do Horário', description: 'Vendas perdidas à noite, finais de semana e feriados' },
    { icon: HelpCircle, title: 'Falta de Contexto', description: 'Repetir informações frustra clientes e equipe' },
  ];

  // Seção 2 - Como funciona
  const howItWorks = [
    { icon: Brain, title: 'Entendimento de Contexto', description: 'Luna analisa cada mensagem entendendo intenção, emoção e histórico' },
    { icon: Database, title: 'Memória de Conversa', description: 'Lembra de interações anteriores e preferências do cliente' },
    { icon: Target, title: 'Decisão Inteligente', description: 'Escolhe a melhor resposta baseada em eventos e campanhas ativas' },
    { icon: Workflow, title: 'Integração Nativa', description: 'Conecta-se às suas automações e sistemas existentes' },
  ];

  // Seção 4 - Casos de uso
  const useCases = [
    { icon: ShoppingCart, title: 'Vendas Consultivas', description: 'Entende necessidades e recomenda produtos ideais, aumentando ticket médio', color: 'from-green-500 to-emerald-600' },
    { icon: Headphones, title: 'Suporte Inteligente', description: 'Resolve dúvidas frequentes e escala apenas casos complexos', color: 'from-blue-500 to-cyan-600' },
    { icon: RefreshCw, title: 'Recuperação de Carrinho', description: 'Reengaja clientes que abandonaram compras com mensagens personalizadas', color: 'from-orange-500 to-amber-600' },
    { icon: Users, title: 'Qualificação de Leads', description: 'Identifica leads quentes e agenda automaticamente com o time comercial', color: 'from-purple-500 to-violet-600' },
  ];

  // Seção 5 - Diferenciais técnicos
  const technicalDiffs = [
    { icon: Zap, title: 'Respostas Dinâmicas', description: 'Adapta tom e conteúdo conforme o perfil e momento do cliente' },
    { icon: Cpu, title: 'Integração Genesis', description: 'Funciona nativamente com toda a plataforma Genesis' },
    { icon: Sparkles, title: 'Escalável', description: 'De 10 a 10.000 conversas simultâneas sem perder qualidade' },
    { icon: Shield, title: 'Anti-ban Inteligente', description: 'Padrões de envio que protegem seu número e garantem entregas' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VendaHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Inteligência Artificial Avançada</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Conheça a <span className="text-primary">Luna</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Nossa IA que entende, raciocina e vende como seu melhor vendedor — 24 horas por dia, 7 dias por semana</p>
          </motion.div>

          {/* Seção 1 - Problemas Reais */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-amber-500 border-amber-500/30">O Problema</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Problemas que a Luna <span className="text-primary">Resolve</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Desafios reais que custam vendas e frustram clientes todos os dias</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {problems.map((problem, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <Card className="h-full border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                    <CardContent className="pt-6 text-center">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                        <problem.icon className="w-6 h-6 text-amber-500" />
                      </div>
                      <h3 className="font-semibold mb-2 text-sm">{problem.title}</h3>
                      <p className="text-xs text-muted-foreground">{problem.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Seção 2 - Como Funciona */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">A Solução</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Como a Luna <span className="text-primary">Funciona</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Inteligência real que entende, aprende e decide como um humano</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
                  <Card className="h-full border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
                    <CardContent className="pt-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-4">
                        <item.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Seção 3 - Fluxo Visual */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">O Fluxo</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Jornada <span className="text-primary">Inteligente</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Do primeiro contato à conversão, Luna cuida de tudo</p>
            </div>
            
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
                {[
                  { icon: Users, label: 'Cliente', sublabel: 'Envia mensagem' },
                  { icon: MessageSquare, label: 'WhatsApp', sublabel: 'Recebe' },
                  { icon: Brain, label: 'Luna Analisa', sublabel: 'Contexto + Intenção' },
                  { icon: Target, label: 'Decide', sublabel: 'Melhor ação' },
                  { icon: Zap, label: 'Executa', sublabel: 'Resposta/Campanha/Humano' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${i === 2 ? 'bg-gradient-to-br from-primary to-blue-600' : 'bg-card border border-border/50'}`}>
                        <step.icon className={`w-8 h-8 ${i === 2 ? 'text-white' : 'text-primary'}`} />
                      </div>
                      <p className="font-semibold text-sm mt-3">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.sublabel}</p>
                    </div>
                    {i < 4 && <ChevronRight className="w-6 h-6 text-muted-foreground mx-2 hidden md:block" />}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Luna Demo */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">Demonstração</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Veja a Luna em <span className="text-primary">Ação</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Observe como a Luna raciocina antes de cada resposta</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
              {/* Phone */}
              <div>
                <RealisticPhoneMockup>
                  <WhatsAppScreen title="Luna • Assistente IA" subtitle="online • pensando..." icon={<Brain className="w-5 h-5 text-white" />}>
                    <div ref={messagesContainerRef} className="h-full overflow-y-auto p-3 space-y-2 bg-[#0B141A]">
                      <AnimatePresence>
                        {displayedMessages.filter(m => m.type !== 'thinking').map((msg) => (
                          <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg px-3 py-2 ${msg.type === 'sent' ? 'bg-[#005C4B] text-white rounded-tr-none' : 'bg-[#1F2C34] text-white rounded-tl-none'}`}>
                              <p className="text-sm whitespace-pre-line">{msg.text}</p>
                              <p className="text-[10px] mt-1 text-right text-gray-400">{msg.time} {msg.type === 'sent' && <CheckCheck className="w-3 h-3 inline ml-1" />}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </WhatsAppScreen>
                </RealisticPhoneMockup>

                <div className="flex justify-center gap-4 mt-6">
                  <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
                  <Button variant="outline" size="sm" onClick={replay}><RotateCcw className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Reasoning Panel */}
              <div className="flex-1 max-w-md">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Lightbulb className="w-5 h-5 text-primary" />Raciocínio da Luna</CardTitle>
                    <CardDescription>Veja o que a Luna "pensa" antes de responder</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {displayedMessages.filter(m => m.type === 'thinking').map((msg) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">{msg.text}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{msg.reasoning}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {displayedMessages.filter(m => m.type === 'thinking').length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aguardando raciocínio...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.section>

          {/* Seção 4 - Casos de Uso */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">Aplicações</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Casos de <span className="text-primary">Uso Práticos</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Luna se adapta ao seu modelo de negócio</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {useCases.map((useCase, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.05 }}>
                  <Card className="h-full border-border/50 bg-card/50 hover:bg-card/80 transition-colors overflow-hidden">
                    <CardContent className="pt-6 flex gap-4">
                      <div className={`w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br ${useCase.color} flex items-center justify-center`}>
                        <useCase.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{useCase.title}</h3>
                        <p className="text-sm text-muted-foreground">{useCase.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Seção 5 - Diferenciais Técnicos */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">Tecnologia</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Diferenciais <span className="text-primary">Técnicos</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Arquitetura robusta para operação em escala</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {technicalDiffs.map((diff, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.05 }}>
                  <Card className="h-full border-primary/10 bg-gradient-to-br from-primary/5 to-blue-600/5">
                    <CardContent className="pt-6 text-center">
                      <diff.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                      <h3 className="font-semibold mb-2">{diff.title}</h3>
                      <p className="text-sm text-muted-foreground">{diff.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Seção 6 - CTA */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-center">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-blue-600/10">
              <CardContent className="py-12 md:py-16">
                <Bot className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Pronto para ter a Luna no seu negócio?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Comece gratuitamente e veja como a IA pode transformar seu atendimento</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="gap-2">
                    <a href="/venda-genesis#precos">
                      Ver Planos
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="gap-2">
                    <a href="/venda-genesis">
                      Conhecer a Genesis
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default VendaAgentesIA;
