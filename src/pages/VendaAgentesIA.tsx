import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Brain, Sparkles, Zap, MessageSquare, Lightbulb, Target, Shield, Play, Pause, RotateCcw, CheckCheck, ArrowRight, Bot, Clock, AlertTriangle, UserX, RefreshCw, Users, ChevronRight, ShoppingCart, Headphones, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VendaHeader from '@/components/venda/VendaHeader';
import RealisticPhoneMockup from '@/components/venda/RealisticPhoneMockup';
import WhatsAppScreen from '@/components/venda/WhatsAppScreen';
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

// Animated Counter
const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, isInView]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const VendaAgentesIA = () => {
  const navigate = useNavigate();
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeUseCase, setActiveUseCase] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  // Interactive data
  const problems = [
    { icon: Clock, text: 'Clientes esperam mais de 5 min e desistem', stat: '60%', statLabel: 'abandonam' },
    { icon: UserX, text: 'Leads esfriam sem follow-up oportuno', stat: '78%', statLabel: 'perdem interesse' },
    { icon: RefreshCw, text: 'Vendas perdidas fora do horário comercial', stat: '40%', statLabel: 'à noite/fim de semana' },
  ];

  const useCases = [
    { icon: ShoppingCart, title: 'Vendas', desc: 'Entende necessidades, recomenda produtos, fecha pedidos', result: '+45% conversão' },
    { icon: Headphones, title: 'Suporte', desc: 'Resolve dúvidas frequentes, escala só o complexo', result: '-70% chamados' },
    { icon: RefreshCw, title: 'Recuperação', desc: 'Reengaja carrinhos abandonados com persuasão', result: '+32% recuperados' },
    { icon: Users, title: 'Qualificação', desc: 'Identifica leads quentes e agenda automaticamente', result: '3x mais reuniões' },
  ];

  const vsComparison = [
    { feature: 'Responde em segundos 24/7', luna: true, human: false },
    { feature: 'Nunca esquece follow-up', luna: true, human: false },
    { feature: 'Atende 1000 simultâneos', luna: true, human: false },
    { feature: 'Mantém histórico completo', luna: true, human: false },
    { feature: 'Negociações complexas', luna: false, human: true },
    { feature: 'Empatia em crises', luna: false, human: true },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <VendaHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero - Impactful Text */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-24">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Brain className="w-4 h-4 mr-2 inline" />
              Inteligência Artificial Avançada
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Luna: sua vendedora que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                nunca dorme
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              IA que entende contexto, raciocina como humano e converte leads em clientes — 
              enquanto você foca no estratégico.
            </p>

            <div className="flex flex-wrap justify-center gap-8 mb-10">
              {[
                { value: 340, suffix: '%', label: 'mais conversões' },
                { value: 5, suffix: 's', label: 'tempo resposta' },
                { value: 24, suffix: '/7', label: 'disponibilidade' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {i === 1 ? '<' : '+'}<AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 h-14 bg-gradient-to-r from-primary to-blue-600" onClick={() => navigate('/genesis/login')}>
                Criar Minha Luna
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Section 1 - Problems (Interactive) */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-amber-500 border-amber-500/30">
                <AlertTriangle className="w-4 h-4 mr-2 inline" />
                O Custo de Não Ter IA
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Cada minuto <span className="text-amber-500">custa vendas</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {problems.map((problem, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent cursor-default"
                >
                  <problem.icon className="w-10 h-10 text-amber-500 mb-4" />
                  <p className="text-lg font-medium mb-4">{problem.text}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-amber-500">{problem.stat}</span>
                    <span className="text-muted-foreground">{problem.statLabel}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Section 2 - How Luna Works (Flow) */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">A Solução</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Como a Luna <span className="text-primary">pensa</span>
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                Não é um bot burro. É inteligência real que raciocina antes de responder.
              </p>
            </div>

            {/* Animated Flow */}
            <div className="relative py-12">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-muted via-primary to-muted transform -translate-y-1/2 hidden md:block" />
              
              <div className="grid md:grid-cols-5 gap-6">
                {[
                  { icon: Users, title: 'Cliente', desc: 'Envia mensagem' },
                  { icon: MessageSquare, title: 'Recebe', desc: 'WhatsApp capta' },
                  { icon: Brain, title: 'Analisa', desc: 'Contexto + Intenção', highlight: true },
                  { icon: Target, title: 'Decide', desc: 'Melhor estratégia' },
                  { icon: Zap, title: 'Executa', desc: 'Resposta/Ação' },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex flex-col items-center text-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 z-10 ${
                        step.highlight 
                          ? 'bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/30' 
                          : 'bg-card border border-border'
                      }`}
                    >
                      <step.icon className={`w-10 h-10 ${step.highlight ? 'text-white' : 'text-primary'}`} />
                    </motion.div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Section 3 - Live Demo */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                <Play className="w-4 h-4 mr-2 inline" />
                Demonstração ao Vivo
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Veja a Luna em <span className="text-primary">ação</span>
              </h2>
              <p className="text-muted-foreground mt-4">
                Observe o raciocínio antes de cada resposta
              </p>
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
                  <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={replay}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Reasoning Panel */}
              <div className="flex-1 max-w-md">
                <div className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Raciocínio da Luna</h3>
                      <p className="text-sm text-muted-foreground">O que ela "pensa" antes de responder</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {displayedMessages.filter(m => m.type === 'thinking').map((msg) => (
                        <motion.div 
                          key={msg.id} 
                          initial={{ opacity: 0, x: -20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: 20 }} 
                          className="p-4 bg-primary/10 rounded-xl border border-primary/20"
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
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 4 - Use Cases (Interactive Tabs) */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">Aplicações</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Luna se adapta ao seu <span className="text-primary">negócio</span>
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {useCases.map((uc, i) => (
                <Button
                  key={i}
                  variant={activeUseCase === i ? 'default' : 'outline'}
                  onClick={() => setActiveUseCase(i)}
                  className="gap-2"
                >
                  <uc.icon className="w-4 h-4" />
                  {uc.title}
                </Button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeUseCase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
                    {(() => { const Icon = useCases[activeUseCase].icon; return <Icon className="w-10 h-10 text-white" />; })()}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">{useCases[activeUseCase].title}</h3>
                    <p className="text-lg text-muted-foreground mb-4">{useCases[activeUseCase].desc}</p>
                  </div>
                  <div className="text-center">
                    <Badge className="text-lg px-4 py-2 bg-green-500/10 text-green-500 border-green-500/30">
                      {useCases[activeUseCase].result}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.section>

          {/* Section 5 - Luna vs Human (Comparison) */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">Comparativo</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Luna + Humano = <span className="text-primary">Combo perfeito</span>
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                Luna não substitui, potencializa. Cada um faz o que faz melhor.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-t-2xl font-semibold text-center">
                <div>Capacidade</div>
                <div className="text-primary">Luna IA</div>
                <div>Humano</div>
              </div>
              
              {vsComparison.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`grid grid-cols-3 gap-4 p-4 items-center text-center ${i % 2 === 0 ? 'bg-card/30' : ''}`}
                >
                  <div className="text-left text-sm">{row.feature}</div>
                  <div>{row.luna ? <Check className="w-5 h-5 mx-auto text-green-500" /> : <X className="w-5 h-5 mx-auto text-muted-foreground" />}</div>
                  <div>{row.human ? <Check className="w-5 h-5 mx-auto text-green-500" /> : <X className="w-5 h-5 mx-auto text-muted-foreground" />}</div>
                </motion.div>
              ))}
              
              <div className="p-4 bg-primary/10 rounded-b-2xl text-center">
                <p className="text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
                  Luna cuida do volume. Humanos fecham os grandes negócios.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 6 - Tech Stack */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="p-8 md:p-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge variant="outline" className="mb-4 text-primary border-primary/30">Tecnologia</Badge>
                  <h2 className="text-3xl font-bold mb-6">
                    Arquitetura de <span className="text-primary">ponta</span>
                  </h2>
                  <div className="space-y-4">
                    {[
                      { title: 'Respostas Dinâmicas', desc: 'Adapta tom conforme cliente' },
                      { title: 'Integração Genesis', desc: 'Funciona com toda plataforma' },
                      { title: 'Escalável', desc: 'De 10 a 10.000 conversas' },
                      { title: 'Anti-ban Inteligente', desc: 'Padrões que protegem seu número' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <Bot className="w-32 h-32 mx-auto text-primary mb-6" />
                  <p className="text-2xl font-bold mb-2">Pronto para ter a Luna?</p>
                  <p className="text-muted-foreground mb-6">Comece gratuitamente hoje</p>
                  <Button size="lg" className="gap-2" onClick={() => navigate('/genesis/login')}>
                    Criar Minha Luna
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default VendaAgentesIA;
