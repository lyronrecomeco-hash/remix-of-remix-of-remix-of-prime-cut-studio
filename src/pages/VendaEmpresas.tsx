import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, TrendingUp, MessageSquare, Clock, DollarSign, Users, Play, Pause, RotateCcw, CheckCheck, Zap, Target, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VendaHeader from '@/components/venda/VendaHeader';
import phoneMockup from '@/assets/phone-mockup.png';

interface Message {
  id: number;
  type: 'received' | 'sent';
  text: string;
  time: string;
}

const conversations = {
  ecommerce: { title: 'E-commerce', icon: '🛒', messages: [
    { id: 1, type: 'received' as const, text: 'Olá! Vi o tênis Nike na promoção, ainda tem?', time: '10:30' },
    { id: 2, type: 'sent' as const, text: 'Olá! 😊 Sim, temos o Nike Air Max! Qual seu tamanho?', time: '10:30' },
    { id: 3, type: 'received' as const, text: '42', time: '10:31' },
    { id: 4, type: 'sent' as const, text: 'Perfeito! Temos o 42 em estoque. De R$599 por R$399! Quer finalizar?', time: '10:31' },
    { id: 5, type: 'received' as const, text: 'Quero sim!', time: '10:32' },
    { id: 6, type: 'sent' as const, text: 'Ótimo! 🎉 Link de pagamento: genesis-pay.me/nike42 - Frete grátis!', time: '10:32' },
  ]},
  clinica: { title: 'Clínica', icon: '🏥', messages: [
    { id: 1, type: 'received' as const, text: 'Boa tarde, gostaria de agendar uma consulta', time: '14:20' },
    { id: 2, type: 'sent' as const, text: 'Boa tarde! 👋 Qual especialidade?\n\n1️⃣ Clínico Geral\n2️⃣ Cardiologia\n3️⃣ Dermatologia', time: '14:20' },
    { id: 3, type: 'received' as const, text: '2', time: '14:21' },
    { id: 4, type: 'sent' as const, text: 'Cardiologia! Dr. Roberto:\n📅 Segunda 15/01 - 09:00\n📅 Quarta 17/01 - 14:00\n\nQual prefere?', time: '14:21' },
    { id: 5, type: 'received' as const, text: 'Quarta às 14h', time: '14:22' },
    { id: 6, type: 'sent' as const, text: 'Consulta agendada! ✅\n👨‍⚕️ Dr. Roberto\n📅 17/01 às 14:00\nVou te lembrar 1 dia antes! 😊', time: '14:22' },
  ]},
  restaurante: { title: 'Restaurante', icon: '🍕', messages: [
    { id: 1, type: 'received' as const, text: 'Oi! Quero fazer um pedido', time: '19:45' },
    { id: 2, type: 'sent' as const, text: 'Olá! 🍕 Cardápio:\n🍕 Pizzas R$39,90\n🍝 Massas R$32,90\n\nO que deseja?', time: '19:45' },
    { id: 3, type: 'received' as const, text: 'Uma pizza calabresa grande', time: '19:46' },
    { id: 4, type: 'sent' as const, text: '🍕 Pizza Calabresa Grande - R$49,90\n\nAdicionar algo?\n1️⃣ Borda +R$8\n2️⃣ Refri 2L +R$12\n3️⃣ Finalizar', time: '19:46' },
    { id: 5, type: 'received' as const, text: '2', time: '19:47' },
    { id: 6, type: 'sent' as const, text: 'Pedido confirmado! 🎉\n🍕 Calabresa + 🥤 Refri\n💰 R$61,90\n⏱️ 40-50 min', time: '19:47' },
  ]},
  imobiliaria: { title: 'Imobiliária', icon: '🏠', messages: [
    { id: 1, type: 'received' as const, text: 'Olá, vi um apartamento no site', time: '11:00' },
    { id: 2, type: 'sent' as const, text: 'Olá! 🏠 Qual imóvel te interessou? Me envia o código!', time: '11:00' },
    { id: 3, type: 'received' as const, text: 'O de 2 quartos no Jardins, AP2045', time: '11:01' },
    { id: 4, type: 'sent' as const, text: '📍 Jardins - AP2045\n🛏️ 2 quartos | 75m²\n💰 R$4.200/mês\n\nQuer agendar visita?', time: '11:01' },
    { id: 5, type: 'received' as const, text: 'Sim! Pode ser sábado?', time: '11:02' },
    { id: 6, type: 'sent' as const, text: '📅 Sábado:\n🕐 10:00 | 14:00 | 16:00\n\nQual melhor? Corretor Paulo disponível!', time: '11:02' },
  ]}
};

const VendaEmpresas = () => {
  const [activeConversation, setActiveConversation] = useState<keyof typeof conversations>('ecommerce');
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  const stats = [
    { icon: TrendingUp, value: '+340%', label: 'Aumento Vendas', color: 'text-primary' },
    { icon: Clock, value: '< 5s', label: 'Tempo Resposta', color: 'text-primary' },
    { icon: Users, value: '+15k', label: 'Clientes/mês', color: 'text-primary' },
    { icon: DollarSign, value: 'R$89k', label: 'Economia Mensal', color: 'text-primary' },
  ];

  const benefits = [
    { icon: Zap, title: 'Atendimento 24/7', desc: 'Nunca perca uma venda por falta de atendimento' },
    { icon: Target, title: 'Conversão Otimizada', desc: 'IA treinada para fechar vendas com eficiência' },
    { icon: Shield, title: 'Suporte Integrado', desc: 'Escalonamento automático para humanos' },
    { icon: BarChart3, title: 'Analytics Completo', desc: 'Dashboards e métricas em tempo real' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VendaHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">+500 Empresas Confiam</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Genesis para <span className="text-primary">Empresas</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Veja como empresas de diferentes segmentos estão automatizando o atendimento</p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, i) => (
              <Card key={i} className="text-center border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Conversations Demo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Conversas <span className="text-primary">Reais</span> em Ação</h2>
            
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
              {Object.entries(conversations).map(([key, conv]) => (
                <Button key={key} variant={activeConversation === key ? 'default' : 'outline'} onClick={() => setActiveConversation(key as keyof typeof conversations)} size="sm">
                  <span className="mr-2">{conv.icon}</span><span className="hidden sm:inline">{conv.title}</span>
                </Button>
              ))}
            </div>

            <div className="flex justify-center">
              <div className="relative w-full max-w-[320px]">
                <div className="relative">
                  <img src={phoneMockup} alt="Phone" className="w-full h-auto relative z-10 pointer-events-none" />
                  <div className="absolute inset-[4%] top-[3%] bottom-[3%] rounded-[32px] overflow-hidden bg-[#0b141a]">
                    <div className="bg-[#1f2c33] px-4 py-2 flex items-center justify-between">
                      <span className="text-white text-xs font-medium">9:41</span>
                      <div className="w-4 h-2 border border-white/60 rounded-sm"><div className="w-2/3 h-full bg-white/60 rounded-sm" /></div>
                    </div>
                    <div className="bg-gradient-to-r from-primary to-blue-600 px-3 py-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">{conversations[activeConversation].icon}</div>
                      <div className="flex-1"><p className="text-white font-semibold text-xs">{conversations[activeConversation].title}</p><p className="text-white/70 text-[10px]">online</p></div>
                      <Badge className="bg-white/20 text-white border-0 text-[8px]">IA</Badge>
                    </div>
                    <div ref={messagesContainerRef} className="h-[340px] overflow-y-auto p-2 space-y-1.5 bg-[#0B141A]">
                      <AnimatePresence>
                        {displayedMessages.map((msg) => (
                          <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg px-2 py-1.5 ${msg.type === 'sent' ? 'bg-[#005C4B] rounded-tr-none' : 'bg-[#1F2C34] rounded-tl-none'} text-white`}>
                              <p className="text-[11px] whitespace-pre-line">{msg.text}</p>
                              <p className="text-[8px] mt-0.5 text-right text-gray-400">{msg.time} {msg.type === 'sent' && <CheckCheck className="w-2.5 h-2.5 inline" />}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="bg-[#1F2C34] px-2 py-1.5 flex items-center gap-1.5">
                      <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5"><span className="text-gray-400 text-[10px]">Mensagem</span></div>
                      <div className="w-7 h-7 rounded-full bg-[#00A884] flex items-center justify-center"><MessageSquare className="w-3.5 h-3.5 text-white" /></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
                  <Button variant="outline" size="sm" onClick={() => { setDisplayedMessages([]); setCurrentIndex(0); setIsPlaying(true); }}><RotateCcw className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Por que <span className="text-primary">Empresas Escolhem</span> a Genesis</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((b, i) => (
                <Card key={i} className="border-border/50 bg-card/50">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-4"><b.icon className="w-6 h-6 text-white" /></div>
                    <h3 className="font-semibold mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-600/5">
              <CardContent className="py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-bold mb-4">Pronto para transformar seu atendimento?</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Comece gratuitamente e veja os resultados em dias</p>
                <Button asChild size="lg"><a href="/venda-genesis#precos">Começar Agora</a></Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VendaEmpresas;
