import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, TrendingUp, MessageSquare, Clock, DollarSign, Users, Play, Pause, RotateCcw, CheckCheck, Zap, Target, Shield, BarChart3, Headphones, Globe, LineChart, Award, ArrowRight, Server, RefreshCw, FileText, Layers, Activity, Check, X, ShoppingCart, Stethoscope, GraduationCap, Briefcase, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VendaHeader from '@/components/venda/VendaHeader';
import RealisticPhoneMockup from '@/components/venda/RealisticPhoneMockup';
import WhatsAppScreen from '@/components/venda/WhatsAppScreen';

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

const VendaEmpresas = () => {
  const [activeConversation, setActiveConversation] = useState<keyof typeof conversations>('ecommerce');
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
    { icon: TrendingUp, value: '+340%', label: 'Aumento em Vendas' },
    { icon: Clock, value: '< 5s', label: 'Tempo de Resposta' },
    { icon: Users, value: '+15k', label: 'Atendimentos/mês' },
    { icon: DollarSign, value: 'R$89k', label: 'Economia Mensal' },
  ];

  // Seção 1 - Infraestrutura
  const infrastructure = [
    { icon: Layers, title: 'Multi-instâncias', description: 'Gerencie múltiplos números de forma centralizada' },
    { icon: Shield, title: 'Anti-ban Avançado', description: 'Proteção inteligente contra bloqueios' },
    { icon: RefreshCw, title: 'Rotação de Números', description: 'Distribua carga entre instâncias automaticamente' },
    { icon: FileText, title: 'Logs e Auditoria', description: 'Rastreabilidade completa de todas as operações' },
  ];

  // Seção 2 - Escala
  const scaleMetrics = [
    { value: '50k+', label: 'Mensagens/hora', desc: 'Capacidade de envio' },
    { value: '99.9%', label: 'Uptime', desc: 'Disponibilidade garantida' },
    { value: '< 200ms', label: 'Latência', desc: 'Tempo de processamento' },
    { value: '∞', label: 'Instâncias', desc: 'Sem limite de números' },
  ];

  // Seção 3 - Segmentos
  const segments = [
    { icon: ShoppingCart, name: 'E-commerce', desc: 'Vendas, carrinho abandonado, pós-venda' },
    { icon: GraduationCap, name: 'Infoprodutos', desc: 'Lançamentos, suporte, comunidade' },
    { icon: Headphones, name: 'Suporte', desc: 'Tickets, FAQ, escalonamento' },
    { icon: Briefcase, name: 'SDR / Vendas', desc: 'Qualificação, follow-up, agendamento' },
  ];

  // Seção 4 - Comparativo
  const comparison = [
    { feature: 'Multi-instâncias ilimitadas', genesis: true, others: false },
    { feature: 'IA nativa com raciocínio', genesis: true, others: false },
    { feature: 'Anti-ban inteligente', genesis: true, others: false },
    { feature: 'Logs completos de auditoria', genesis: true, others: false },
    { feature: 'Rotação automática de números', genesis: true, others: false },
    { feature: 'Suporte técnico especializado', genesis: true, others: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VendaHeader />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">+500 Empresas Confiam</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Genesis para <span className="text-primary">Empresas</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Infraestrutura profissional para operações em escala — controle, segurança e ROI garantido</p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
            {stats.map((stat, i) => (
              <Card key={i} className="text-center border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Seção 1 - Infraestrutura Profissional */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">Infraestrutura</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Arquitetura <span className="text-primary">Profissional</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Projetada para operações enterprise com alta disponibilidade</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {infrastructure.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
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

          {/* Seção 2 - Escala Comprovada */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">Performance</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Escala <span className="text-primary">Comprovada</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Métricas reais de infraestrutura Genesis</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {scaleMetrics.map((metric, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <Card className="text-center border-primary/10 bg-gradient-to-br from-primary/5 to-blue-600/5">
                    <CardContent className="py-8">
                      <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{metric.value}</p>
                      <p className="font-semibold text-sm">{metric.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{metric.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Seção 3 - Segmentos */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">Segmentos</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Soluções por <span className="text-primary">Área</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Configurações otimizadas para cada modelo de negócio</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {segments.map((seg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                  <Card className="h-full border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
                    <CardContent className="pt-6 text-center">
                      <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-4">
                        <seg.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">{seg.name}</h3>
                      <p className="text-sm text-muted-foreground">{seg.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Demo de Conversas */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">Demonstração</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Conversas <span className="text-primary">Reais</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Veja como a Genesis atende diferentes tipos de negócios</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
              {Object.entries(conversations).map(([key, conv]) => (
                <Button key={key} variant={activeConversation === key ? 'default' : 'outline'} onClick={() => setActiveConversation(key as keyof typeof conversations)} size="sm">
                  <span className="mr-2">{conv.icon}</span><span className="hidden sm:inline">{conv.title}</span>
                </Button>
              ))}
            </div>

            <div className="flex justify-center">
              <RealisticPhoneMockup>
                <WhatsAppScreen title={conversations[activeConversation].title} subtitle={conversations[activeConversation].subtitle} icon={<span className="text-xl">{conversations[activeConversation].icon}</span>}>
                  <div ref={messagesContainerRef} className="h-full overflow-y-auto p-3 space-y-2 bg-[#0B141A]">
                    <AnimatePresence>
                      {displayedMessages.map((msg) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
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
              <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
              <Button variant="outline" size="sm" onClick={() => { setDisplayedMessages([]); setCurrentIndex(0); setIsPlaying(true); }}><RotateCcw className="w-4 h-4" /></Button>
            </div>
          </motion.section>

          {/* Seção 4 - Comparativo */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">Comparativo</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Genesis vs <span className="text-primary">Soluções Comuns</span></h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Veja o que nos diferencia no mercado</p>
            </div>
            
            <Card className="border-border/50 bg-card/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 font-semibold">Funcionalidade</th>
                        <th className="p-4 font-semibold text-center text-primary">Genesis</th>
                        <th className="p-4 font-semibold text-center text-muted-foreground">Outros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((row, i) => (
                        <tr key={i} className="border-b border-border/30 last:border-0">
                          <td className="p-4 text-sm">{row.feature}</td>
                          <td className="p-4 text-center">
                            {row.genesis ? (
                              <Check className="w-5 h-5 mx-auto text-green-500" />
                            ) : (
                              <X className="w-5 h-5 mx-auto text-red-500" />
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {row.others ? (
                              <Check className="w-5 h-5 mx-auto text-green-500" />
                            ) : (
                              <X className="w-5 h-5 mx-auto text-red-500" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* CTA Enterprise */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-center">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-blue-600/10">
              <CardContent className="py-12 md:py-16">
                <Building2 className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Pronto para escalar seu atendimento?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Fale com nossos especialistas e descubra como a Genesis pode transformar sua operação</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="gap-2">
                    <a href="/venda-genesis#precos">
                      Ver Planos
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="gap-2">
                    <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                      <Phone className="w-4 h-4" />
                      Falar com Especialista
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

export default VendaEmpresas;
