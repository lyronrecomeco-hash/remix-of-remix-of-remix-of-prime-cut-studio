import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, Sparkles, Zap, MessageSquare, Bot, Lightbulb, Target, Shield, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

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
  { id: 9, type: 'sent', text: 'Perfeito! Para seu perfil, tenho 3 opções ideais:\n\n🏃 Nike Pegasus 40 - R$699\nMelhor custo-benefício, muito amortecimento\n\n🏃 Asics Gel-Nimbus 25 - R$999\nMáximo conforto, ideal p/ asfalto\n\n🏃 Adidas Ultraboost 23 - R$899\nRetorno de energia, ótimo p/ ritmo\n\nQual faixa de preço funciona melhor pra você?', time: '14:32' },
  { id: 10, type: 'received', text: 'O Nike parece bom, tem meu número 42?', time: '14:33' },
  { id: 11, type: 'thinking', text: '🧠 Verificando estoque...', time: '14:33', reasoning: 'Consulta ao banco de dados → Estoque disponível | Cliente decidido → Facilitar fechamento' },
  { id: 12, type: 'sent', text: 'Sim! 🎉 Nike Pegasus 40, tamanho 42, em estoque!\n\nE tenho uma surpresa: usando o cupom CORREDOR10 você ganha 10% OFF!\n\nDe R$699 por R$629,10 💚\n\nQuer que eu gere seu link de pagamento?', time: '14:33' },
];

const VendaAgentesIA = () => {
  const navigate = useNavigate();
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

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
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Vendas Consultivas',
      description: 'Faz perguntas estratégicas para entender necessidades e recomendar produtos',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Respostas Instantâneas',
      description: 'Responde em segundos, 24/7, sem deixar clientes esperando',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Escalonamento Inteligente',
      description: 'Identifica quando precisa de humano e transfere automaticamente',
      color: 'from-green-500 to-emerald-500'
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/venda-genesis')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Agentes IA</span>
            </div>

            <Button 
              onClick={() => navigate('/venda-genesis#precos')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              size="sm"
            >
              <span className="hidden sm:inline">Começar Grátis</span>
              <span className="sm:hidden">Começar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-purple-500/10 text-purple-500 border-purple-500/20">
              Inteligência Artificial Avançada
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Conheça a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Luna</span>
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
              Veja a Luna em <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Ação</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
              Observe como a Luna raciocina antes de cada resposta, entendendo o contexto para vender de forma consultiva
            </p>

            <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
              {/* Phone Mockup */}
              <div className="relative w-full max-w-[340px] mx-auto lg:mx-0">
                {/* iPhone Frame */}
                <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  {/* Dynamic Island */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20" />
                  
                  {/* Screen */}
                  <div className="relative bg-[#0B141A] rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-8 pt-4 pb-2">
                      <span className="text-white text-sm font-medium">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          <div className="w-1 h-2 bg-white rounded-sm" />
                          <div className="w-1 h-3 bg-white rounded-sm" />
                          <div className="w-1 h-4 bg-white rounded-sm" />
                          <div className="w-1 h-3 bg-white/50 rounded-sm" />
                        </div>
                        <div className="w-6 h-3 border border-white rounded-sm ml-1">
                          <div className="w-4 h-full bg-white rounded-sm" />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">Luna • Assistente IA</p>
                        <p className="text-white/70 text-xs">online • pensando...</p>
                      </div>
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        IA
                      </Badge>
                    </div>

                    {/* Messages */}
                    <div 
                      className="h-[400px] overflow-y-auto p-4 space-y-3 bg-[#0B141A]"
                      style={{ 
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                      }}
                    >
                      <AnimatePresence>
                        {displayedMessages.filter(m => m.type !== 'thinking').map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                              msg.type === 'sent' 
                                ? 'bg-[#005C4B] text-white rounded-br-md' 
                                : 'bg-[#1F2C34] text-white rounded-bl-md'
                            }`}>
                              <p className="text-sm whitespace-pre-line">{msg.text}</p>
                              <p className={`text-[10px] mt-1 text-right ${
                                msg.type === 'sent' ? 'text-green-200' : 'text-gray-400'
                              }`}>
                                {msg.time} {msg.type === 'sent' && '✓✓'}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-[#1F2C34] px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 bg-[#2A3942] rounded-full px-4 py-2">
                        <span className="text-gray-400 text-sm">Mensagem</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="flex justify-center py-2 bg-[#1F2C34]">
                      <div className="w-32 h-1 bg-white/30 rounded-full" />
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
                <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-purple-500" />
                      Raciocínio da Luna
                    </CardTitle>
                    <CardDescription>
                      Veja o que a Luna "pensa" antes de responder
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {displayedMessages.filter(m => m.type === 'thinking').map((msg, i) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-purple-500">{msg.text}</span>
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
              Superpoderes da <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Luna</span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <Card className="h-full border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
                    <CardContent className="pt-6 flex items-start gap-4">
                      <span className="text-3xl">{feature.icon}</span>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
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
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <CardContent className="py-8 md:py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  Pronto para ter a Luna no seu negócio?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Comece gratuitamente e veja como a IA pode transformar seu atendimento
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/venda-genesis#precos')}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ativar Luna Grátis
                  </Button>
                  <Button 
                    onClick={() => navigate('/venda-genesis')}
                    size="lg"
                    variant="outline"
                  >
                    Ver Todos os Recursos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VendaAgentesIA;
