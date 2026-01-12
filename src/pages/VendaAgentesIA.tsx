import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, MessageSquare, Lightbulb, Target, Shield, Play, Pause, RotateCcw, CheckCheck, Cpu, Database, Workflow, ArrowRight, Bot } from 'lucide-react';
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

  // Scroll to top on mount
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

  const capabilities = [
    { icon: Brain, title: 'Raciocínio Contextual', description: 'Entende o contexto e adapta respostas de forma inteligente' },
    { icon: Target, title: 'Vendas Consultivas', description: 'Perguntas estratégicas para entender e recomendar' },
    { icon: Zap, title: 'Respostas Instantâneas', description: 'Responde em segundos, 24/7' },
    { icon: Shield, title: 'Escalonamento Inteligente', description: 'Identifica quando precisa de humano' },
  ];

  const features = [
    { icon: '🧠', title: 'Memória de Contexto', desc: 'Lembra conversas anteriores' },
    { icon: '🎯', title: 'Detecção de Intenção', desc: 'Entende o que cliente quer' },
    { icon: '📊', title: 'Consulta ao Estoque', desc: 'Verifica disponibilidade em tempo real' },
    { icon: '💰', title: 'Cupons Automáticos', desc: 'Aplica promoções relevantes' },
    { icon: '😊', title: 'Análise de Sentimento', desc: 'Detecta frustração ou satisfação' },
    { icon: '🔄', title: 'Aprendizado Contínuo', desc: 'Melhora com cada interação' },
  ];

  const techStack = [
    { icon: Cpu, title: 'Processamento de Linguagem Natural', desc: 'Entende linguagem humana com nuances e contexto' },
    { icon: Database, title: 'Base de Conhecimento', desc: 'Aprende sobre seu negócio e produtos' },
    { icon: Workflow, title: 'Fluxos Inteligentes', desc: 'Rotas automatizadas baseadas em regras' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VendaHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Inteligência Artificial Avançada</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Conheça a <span className="text-primary">Luna</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Nossa IA que entende, raciocina e vende como seu melhor vendedor - 24 horas por dia</p>
          </motion.div>

          {/* Capabilities */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {capabilities.map((cap, i) => (
              <Card key={i} className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-4">
                    <cap.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{cap.title}</h3>
                  <p className="text-sm text-muted-foreground">{cap.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Luna Demo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Veja a Luna em <span className="text-primary">Ação</span></h2>
            <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">Observe como a Luna raciocina antes de cada resposta</p>

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
          </motion.div>

          {/* Tech Stack */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Tecnologia por <span className="text-primary">Trás da Luna</span></h2>
            <div className="grid md:grid-cols-3 gap-6">
              {techStack.map((tech, i) => (
                <Card key={i} className="border-primary/10 bg-gradient-to-br from-primary/5 to-blue-600/5">
                  <CardContent className="pt-6 text-center">
                    <tech.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">{tech.title}</h3>
                    <p className="text-sm text-muted-foreground">{tech.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Superpoderes da <span className="text-primary">Luna</span></h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                  <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors h-full">
                    <CardContent className="pt-6">
                      <span className="text-3xl mb-3 block">{feature.icon}</span>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
              <CardContent className="py-12 md:py-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Pronto para ter a Luna no seu negócio?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Comece gratuitamente e veja como a IA pode transformar seu atendimento</p>
                <Button asChild size="lg" className="gap-2">
                  <a href="/venda-genesis#precos">
                    Ver Planos
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VendaAgentesIA;
