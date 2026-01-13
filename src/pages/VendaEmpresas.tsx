import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Building2, TrendingUp, MessageSquare, Clock, DollarSign, Users, Play, Pause, RotateCcw, CheckCheck, Zap, Target, Shield, BarChart3, ArrowRight, Server, RefreshCw, FileText, Layers, Check, X, ShoppingCart, GraduationCap, Headphones, Briefcase, Phone, ChevronRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VendaHeader from '@/components/venda/VendaHeader';
import RealisticPhoneMockup from '@/components/venda/RealisticPhoneMockup';
import WhatsAppScreen from '@/components/venda/WhatsAppScreen';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  type: 'received' | 'sent';
  text: string;
  time: string;
}

const conversations = {
  ecommerce: { title: 'E-commerce', subtitle: 'Loja Virtual', icon: '🛒', messages: [
    { id: 1, type: 'received' as const, text: 'Olá! Vi o tênis Nike na promoção, ainda tem?', time: '10:30' },
    { id: 2, type: 'sent' as const, text: 'Olá! 😊 Sim, temos o Nike Air Max! Qual seu tamanho?', time: '10:30' },
    { id: 3, type: 'received' as const, text: '42', time: '10:31' },
    { id: 4, type: 'sent' as const, text: 'Perfeito! Temos o 42 em estoque. De R$599 por R$399! Quer finalizar?', time: '10:31' },
    { id: 5, type: 'received' as const, text: 'Quero sim!', time: '10:32' },
    { id: 6, type: 'sent' as const, text: 'Ótimo! 🎉 Link de pagamento: genesis-pay.me/nike42 - Frete grátis!', time: '10:32' },
  ]},
  clinica: { title: 'Clínica', subtitle: 'Saúde & Bem-estar', icon: '🏥', messages: [
    { id: 1, type: 'received' as const, text: 'Boa tarde, gostaria de agendar uma consulta', time: '14:20' },
    { id: 2, type: 'sent' as const, text: 'Boa tarde! 👋 Qual especialidade?\n\n1️⃣ Clínico Geral\n2️⃣ Cardiologia\n3️⃣ Dermatologia', time: '14:20' },
    { id: 3, type: 'received' as const, text: '2', time: '14:21' },
    { id: 4, type: 'sent' as const, text: 'Cardiologia! Dr. Roberto:\n📅 Segunda 15/01 - 09:00\n📅 Quarta 17/01 - 14:00\n\nQual prefere?', time: '14:21' },
    { id: 5, type: 'received' as const, text: 'Quarta às 14h', time: '14:22' },
    { id: 6, type: 'sent' as const, text: 'Consulta agendada! ✅\n👨‍⚕️ Dr. Roberto\n📅 17/01 às 14:00\nVou te lembrar 1 dia antes! 😊', time: '14:22' },
  ]},
  restaurante: { title: 'Restaurante', subtitle: 'Delivery', icon: '🍕', messages: [
    { id: 1, type: 'received' as const, text: 'Oi! Quero fazer um pedido', time: '19:45' },
    { id: 2, type: 'sent' as const, text: 'Olá! 🍕 Cardápio:\n🍕 Pizzas R$39,90\n🍝 Massas R$32,90\n\nO que deseja?', time: '19:45' },
    { id: 3, type: 'received' as const, text: 'Uma pizza calabresa grande', time: '19:46' },
    { id: 4, type: 'sent' as const, text: '🍕 Pizza Calabresa Grande - R$49,90\n\nAdicionar algo?\n1️⃣ Borda +R$8\n2️⃣ Refri 2L +R$12\n3️⃣ Finalizar', time: '19:46' },
    { id: 5, type: 'received' as const, text: '2', time: '19:47' },
    { id: 6, type: 'sent' as const, text: 'Pedido confirmado! 🎉\n🍕 Calabresa + 🥤 Refri\n💰 R$61,90\n⏱️ 40-50 min', time: '19:47' },
  ]},
  imobiliaria: { title: 'Imobiliária', subtitle: 'Imóveis', icon: '🏠', messages: [
    { id: 1, type: 'received' as const, text: 'Olá, vi um apartamento no site', time: '11:00' },
    { id: 2, type: 'sent' as const, text: 'Olá! 🏠 Qual imóvel te interessou? Me envia o código!', time: '11:00' },
    { id: 3, type: 'received' as const, text: 'O de 2 quartos no Jardins, AP2045', time: '11:01' },
    { id: 4, type: 'sent' as const, text: '📍 Jardins - AP2045\n🛏️ 2 quartos | 75m²\n💰 R$4.200/mês\n\nQuer agendar visita?', time: '11:01' },
    { id: 5, type: 'received' as const, text: 'Sim! Pode ser sábado?', time: '11:02' },
    { id: 6, type: 'sent' as const, text: '📅 Sábado:\n🕐 10:00 | 14:00 | 16:00\n\nQual melhor? Corretor Paulo disponível!', time: '11:02' },
  ]}
};

// Animated Counter
const AnimatedCounter = ({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) => {
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

  return <span ref={ref}>{prefix}{count.toLocaleString('pt-BR')}{suffix}</span>;
};

const VendaEmpresas = () => {
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState<keyof typeof conversations>('ecommerce');
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSegment, setActiveSegment] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [displayedMessages, scrollToBottom]);
  useEffect(() => { setDisplayedMessages([]); setCurrentIndex(0); setIsPlaying(true); }, [activeConversation]);

  useEffect(() => {
    if (!isPlaying) return;
    const messages = conversations[activeConversation].messages;
    if (currentIndex >= messages.length) { setIsPlaying(false); return; }
    const timer = setTimeout(() => {
      setDisplayedMessages(prev => [...prev, messages[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
    }, currentIndex === 0 ? 500 : 1500);
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, activeConversation]);

  // Data
  const metrics = [
    { icon: TrendingUp, value: 340, suffix: '%', prefix: '+', label: 'Aumento em Vendas' },
    { icon: Clock, value: 5, suffix: 's', prefix: '<', label: 'Tempo de Resposta' },
    { icon: Users, value: 15, suffix: 'k+', prefix: '', label: 'Atendimentos/mês' },
    { icon: DollarSign, value: 89, suffix: 'k', prefix: 'R$', label: 'Economia Mensal' },
  ];

  const infrastructure = [
    { icon: Layers, title: 'Multi-instâncias', desc: 'Gerencie múltiplos números centralizadamente', detail: 'Sem limite de chips' },
    { icon: Shield, title: 'Anti-ban', desc: 'Proteção inteligente contra bloqueios', detail: 'Padrões naturais' },
    { icon: RefreshCw, title: 'Rotação', desc: 'Distribua carga automaticamente', detail: 'Load balancing' },
    { icon: FileText, title: 'Auditoria', desc: 'Logs completos de todas operações', detail: 'Compliance ready' },
  ];

  const segments = [
    { icon: ShoppingCart, name: 'E-commerce', desc: 'Vendas, carrinho abandonado, pós-venda', results: ['Recuperação 32%', 'Conversão +45%', 'NPS +20 pts'] },
    { icon: GraduationCap, name: 'Infoprodutos', desc: 'Lançamentos, suporte, comunidade', results: ['CPL -40%', 'Engajamento +60%', 'LTV +35%'] },
    { icon: Headphones, name: 'Suporte', desc: 'Tickets, FAQ, escalonamento', results: ['Resolução -70%', 'CSAT 4.8★', 'Custo -50%'] },
    { icon: Briefcase, name: 'SDR / Vendas', desc: 'Qualificação, follow-up, agendamento', results: ['Reuniões 3x', 'No-show -60%', 'Pipeline +80%'] },
  ];

  const comparison = [
    { feature: 'Multi-instâncias ilimitadas', genesis: true, others: false },
    { feature: 'IA nativa com raciocínio', genesis: true, others: false },
    { feature: 'Anti-ban inteligente', genesis: true, others: false },
    { feature: 'Logs de auditoria completos', genesis: true, others: false },
    { feature: 'Rotação automática de números', genesis: true, others: false },
    { feature: 'Suporte técnico especializado', genesis: true, others: false },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <VendaHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero - Enterprise Focus */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-24">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Building2 className="w-4 h-4 mr-2 inline" />
              +500 Empresas Confiam
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Infraestrutura de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                verdade
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Operações em escala exigem mais que um chatbot. Exigem arquitetura profissional, 
              controle total e ROI comprovado.
            </p>

            {/* Animated Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {metrics.map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="p-6 rounded-2xl border border-border/50 bg-card/30"
                >
                  <metric.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <p className="text-3xl font-bold text-primary">
                    <AnimatedCounter target={metric.value} suffix={metric.suffix} prefix={metric.prefix} />
                  </p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 h-14 bg-gradient-to-r from-primary to-blue-600" onClick={() => navigate('/genesis/login')}>
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14" asChild>
                <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                  <Phone className="w-5 h-5 mr-2" />
                  Falar com Especialista
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Section 1 - Infrastructure (Interactive) */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                <Server className="w-4 h-4 mr-2 inline" />
                Infraestrutura
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Arquitetura para <span className="text-primary">escala real</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {infrastructure.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/30 transition-all cursor-default"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <Badge variant="outline" className="text-xs">{item.detail}</Badge>
                      </div>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Section 2 - Scale Proof */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="p-8 md:p-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
              <div className="text-center mb-10">
                <Badge variant="outline" className="mb-4 text-primary border-primary/30">Performance</Badge>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Números que <span className="text-primary">comprovam</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: '50k+', label: 'Mensagens/hora', desc: 'Capacidade de envio' },
                  { value: '99.9%', label: 'Uptime', desc: 'Disponibilidade' },
                  { value: '<200ms', label: 'Latência', desc: 'Processamento' },
                  { value: '∞', label: 'Instâncias', desc: 'Sem limite' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-4xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="font-semibold">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">{stat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Section 3 - Segments (Interactive Tabs) */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">Segmentos</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Configurações por <span className="text-primary">área</span>
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {segments.map((seg, i) => (
                <Button
                  key={i}
                  variant={activeSegment === i ? 'default' : 'outline'}
                  onClick={() => setActiveSegment(i)}
                  className="gap-2"
                >
                  <seg.icon className="w-4 h-4" />
                  {seg.name}
                </Button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSegment}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
                    {(() => { const Icon = segments[activeSegment].icon; return <Icon className="w-10 h-10 text-white" />; })()}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">{segments[activeSegment].name}</h3>
                    <p className="text-lg text-muted-foreground">{segments[activeSegment].desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {segments[activeSegment].results.map((result, i) => (
                      <Badge key={i} className="bg-green-500/10 text-green-500 border-green-500/30">
                        {result}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.section>

          {/* Section 4 - Live Demo */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                <Play className="w-4 h-4 mr-2 inline" />
                Demonstração
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Atendimento em <span className="text-primary">diferentes nichos</span>
              </h2>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {Object.entries(conversations).map(([key, conv]) => (
                <Button 
                  key={key} 
                  variant={activeConversation === key ? 'default' : 'outline'} 
                  onClick={() => setActiveConversation(key as keyof typeof conversations)}
                >
                  <span className="mr-2">{conv.icon}</span>
                  {conv.title}
                </Button>
              ))}
            </div>

            <div className="flex justify-center">
              <RealisticPhoneMockup>
                <WhatsAppScreen 
                  title={conversations[activeConversation].title} 
                  subtitle={conversations[activeConversation].subtitle} 
                  icon={<span className="text-xl">{conversations[activeConversation].icon}</span>}
                >
                  <div ref={messagesContainerRef} className="h-full overflow-y-auto p-3 space-y-2 bg-[#0B141A]">
                    <AnimatePresence>
                      {displayedMessages.map((msg) => (
                        <motion.div 
                          key={msg.id} 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                          animate={{ opacity: 1, y: 0, scale: 1 }} 
                          className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] rounded-lg px-3 py-2 ${msg.type === 'sent' ? 'bg-[#005C4B] rounded-tr-none' : 'bg-[#1F2C34] rounded-tl-none'} text-white`}>
                            <p className="text-sm whitespace-pre-line">{msg.text}</p>
                            <p className="text-[10px] mt-1 text-right text-gray-400">{msg.time} {msg.type === 'sent' && <CheckCheck className="w-3 h-3 inline" />}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </WhatsAppScreen>
              </RealisticPhoneMockup>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setDisplayedMessages([]); setCurrentIndex(0); setIsPlaying(true); }}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </motion.section>

          {/* Section 5 - Comparison */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                <Award className="w-4 h-4 mr-2 inline" />
                Comparativo
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Genesis vs <span className="text-primary">soluções comuns</span>
              </h2>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-t-2xl font-semibold text-center">
                <div>Funcionalidade</div>
                <div className="text-primary">Genesis</div>
                <div className="text-muted-foreground">Outros</div>
              </div>
              
              {comparison.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`grid grid-cols-3 gap-4 p-4 items-center text-center ${i % 2 === 0 ? 'bg-card/30' : ''}`}
                >
                  <div className="text-left text-sm">{row.feature}</div>
                  <div><Check className="w-5 h-5 mx-auto text-green-500" /></div>
                  <div><X className="w-5 h-5 mx-auto text-red-500/50" /></div>
                </motion.div>
              ))}
              
              <div className="p-4 bg-primary/10 rounded-b-2xl text-center">
                <p className="text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 inline mr-1 text-primary" />
                  Arquitetura enterprise, preço acessível
                </p>
              </div>
            </div>
          </motion.section>

          {/* Final CTA */}
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="p-8 md:p-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-blue-600/10 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para <span className="text-primary">escalar</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                Fale com nossos especialistas e descubra como a Genesis pode transformar sua operação
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 h-14" onClick={() => navigate('/genesis/login')}>
                  Começar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 h-14" asChild>
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                    <Phone className="w-5 h-5 mr-2" />
                    Falar com Especialista
                  </a>
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default VendaEmpresas;
