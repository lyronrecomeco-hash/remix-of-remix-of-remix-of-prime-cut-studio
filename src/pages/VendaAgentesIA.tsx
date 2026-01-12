import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, MessageSquare, Bot, Lightbulb, Target, Shield, Play, Pause, RotateCcw, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VendaHeader from '@/components/venda/VendaHeader';
import phoneMockup from '@/assets/phone-mockup.png';

interface Message {
  id: number;
  type: 'received' | 'sent' | 'thinking';
  text: string;
  time: string;
  reasoning?: string;
}

const lunaConversation: Message[] = [
  { id: 1, type: 'received', text: 'Oi, preciso de um tênis pra corrida, mas não sei qual escolher', time: '14:30' },
  { id: 2, type: 'thinking', text: '🧠 Analisando perfil do cliente...', time: '14:30', reasoning: 'Cliente indeciso → Fazer perguntas consultivas para entender necessidade' },
  { id: 3, type: 'sent', text: 'Olá! 👋 Posso te ajudar a encontrar o tênis perfeito! Me conta: você corre em qual tipo de terreno? Asfalto, esteira ou trilha?', time: '14:30' },
  { id: 4, type: 'received', text: 'Geralmente corro na rua mesmo, asfalto', time: '14:31' },
  { id: 5, type: 'thinking', text: '🧠 Processando informação...', time: '14:31', reasoning: 'Asfalto → Priorizar amortecimento | Próxima pergunta: frequência e distância' },
  { id: 6, type: 'sent', text: 'Ótimo! E quantas vezes por semana você corre? E geralmente qual distância?', time: '14:31' },
  { id: 7, type: 'received', text: '3x por semana, uns 5-8km por treino', time: '14:32' },
  { id: 8, type: 'thinking', text: '🧠 Calculando recomendação...', time: '14:32', reasoning: 'Frequência média + distância moderada = Categoria intermediária | Sugerir 2-3 opções com faixas de preço' },
  { id: 9, type: 'sent', text: 'Perfeito! Para seu perfil, tenho 3 opções ideais:\n\n🏃 Nike Pegasus 40 - R$699\nMelhor custo-benefício\n\n🏃 Asics Gel-Nimbus 25 - R$999\nMáximo conforto\n\n🏃 Adidas Ultraboost 23 - R$899\nRetorno de energia\n\nQual faixa de preço funciona?', time: '14:32' },
  { id: 10, type: 'received', text: 'O Nike parece bom, tem meu número 42?', time: '14:33' },
  { id: 11, type: 'thinking', text: '🧠 Verificando estoque...', time: '14:33', reasoning: 'Consulta ao banco de dados → Estoque disponível | Cliente decidido → Facilitar fechamento' },
  { id: 12, type: 'sent', text: 'Sim! 🎉 Nike Pegasus 40, tamanho 42, em estoque!\n\nCupom CORREDOR10 = 10% OFF!\n\nDe R$699 por R$629,10 💚\n\nQuer que eu gere seu link de pagamento?', time: '14:33' },
];

const VendaAgentesIA = () => {
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages, scrollToBottom]);

  useEffect(() => {
    if (!isPlaying) return;
    
    if (currentIndex >= lunaConversation.length) {
      setIsPlaying(false);
      return;
    }

    const delay = lunaConversation[currentIndex].type === 'thinking' ? 800 : 1800;

    const timer = setTimeout(() => {
      setDisplayedMessages(prev => [...prev, lunaConversation[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
    }, currentIndex === 0 ? 500 : delay);

    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying]);

  const replay = () => {
    setDisplayedMessages([]);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const capabilities = [
    {
      icon: Brain,
      title: 'Raciocínio Contextual',
      description: 'Entende o contexto da conversa e adapta respostas de forma inteligente',
      color: 'from-primary to-blue-600'
    },
    {
      icon: Target,
      title: 'Vendas Consultivas',
      description: 'Faz perguntas estratégicas para entender necessidades e recomendar produtos',
      color: 'from-primary to-blue-600'
    },
    {
      icon: Zap,
      title: 'Respostas Instantâneas',
      description: 'Responde em segundos, 24/7, sem deixar clientes esperando',
      color: 'from-primary to-blue-600'
    },
    {
      icon: Shield,
      title: 'Escalonamento Inteligente',
      description: 'Identifica quando precisa de humano e transfere automaticamente',
      color: 'from-primary to-blue-600'
    },
  ];

  const features = [
    { icon: '🧠', title: 'Memória de Contexto', desc: 'Lembra conversas anteriores' },
    { icon: '🎯', title: 'Detecção de Intenção', desc: 'Entende o que cliente quer' },
    { icon: '📊', title: 'Consulta ao Estoque', desc: 'Verifica disponibilidade em tempo real' },
    { icon: '💰', title: 'Cupons Automáticos', desc: 'Aplica promoções relevantes' },
    { icon: '😊', title: 'Análise de Sentimento', desc: 'Detecta frustração ou satisfação' },
    { icon: '🔄', title: 'Aprendizado Contínuo', desc: 'Melhora com cada interação' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VendaHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Inteligência Artificial Avançada
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Conheça a <span className="text-primary">Luna</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nossa IA que entende, raciocina e vende como seu melhor vendedor - mas 24 horas por dia
            </p>
          </motion.div>

          {/* Capabilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {capabilities.map((cap, i) => (
              <Card key={i} className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center mb-4`}>
                    <cap.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{cap.title}</h3>
                  <p className="text-sm text-muted-foreground">{cap.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Luna Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Veja a Luna em <span className="text-primary">Ação</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
              Observe como a Luna raciocina antes de cada resposta, entendendo o contexto para vender de forma consultiva
            </p>

            <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
              {/* Phone Mockup */}
              <div className="relative w-full max-w-[320px] mx-auto lg:mx-0">
                {/* Phone Image Container */}
                <div className="relative">
                  <img 
                    src={phoneMockup} 
                    alt="Phone" 
                    className="w-full h-auto relative z-10 pointer-events-none"
                  />
                  
                  {/* Screen Content */}
                  <div className="absolute inset-[4%] top-[3%] bottom-[3%] rounded-[32px] overflow-hidden bg-[#0b141a]">
                    {/* Status Bar */}
                    <div className="bg-[#1f2c33] px-4 py-2 flex items-center justify-between">
                      <span className="text-white text-xs font-medium">14:30</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-white/60 rounded-sm">
                          <div className="w-2/3 h-full bg-white/60 rounded-sm" />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Header */}
                    <div className="bg-gradient-to-r from-primary to-blue-600 px-3 py-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-xs">Luna • Assistente IA</p>
                        <p className="text-white/70 text-[10px]">online • pensando...</p>
                      </div>
                      <Badge className="bg-white/20 text-white border-0 text-[8px] px-1.5">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                        IA
                      </Badge>
                    </div>

                    {/* Messages */}
                    <div 
                      ref={messagesContainerRef}
                      className="h-[340px] overflow-y-auto overflow-x-hidden p-2 space-y-1.5 bg-[#0B141A]"
                      style={{ 
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                      }}
                    >
                      <AnimatePresence>
                        {displayedMessages.filter(m => m.type !== 'thinking').map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-lg px-2 py-1.5 ${
                              msg.type === 'sent' 
                                ? 'bg-[#005C4B] text-white rounded-tr-none' 
                                : 'bg-[#1F2C34] text-white rounded-tl-none'
                            }`}>
                              <p className="text-[11px] whitespace-pre-line">{msg.text}</p>
                              <p className={`text-[8px] mt-0.5 text-right ${
                                msg.type === 'sent' ? 'text-green-200' : 'text-gray-400'
                              }`}>
                                {msg.time} {msg.type === 'sent' && <CheckCheck className="w-2.5 h-2.5 inline ml-0.5" />}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Input Area */}
                    <div className="bg-[#1F2C34] px-2 py-1.5 flex items-center gap-1.5">
                      <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5">
                        <span className="text-gray-400 text-[10px]">Mensagem</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#00A884] flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-4">
                  <Button variant="outline" size="sm" onClick={togglePlay}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={replay}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Luna's Reasoning Panel */}
              <div className="flex-1 max-w-md">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      Raciocínio da Luna
                    </CardTitle>
                    <CardDescription>
                      Veja o que a Luna "pensa" antes de responder
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {displayedMessages.filter(m => m.type === 'thinking').map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="p-3 bg-primary/10 rounded-lg border border-primary/20"
                        >
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

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Superpoderes da <span className="text-primary">Luna</span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
              <CardContent className="py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  Pronto para ter a Luna no seu negócio?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Comece gratuitamente e veja como a inteligência artificial pode transformar seu atendimento
                </p>
                <Button asChild size="lg">
                  <a href="/venda-genesis#precos">Começar Agora</a>
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
