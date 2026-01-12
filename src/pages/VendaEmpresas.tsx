import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, TrendingUp, MessageSquare, Clock, DollarSign, Users, Star, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  type: 'received' | 'sent';
  text: string;
  time: string;
}

const conversations = {
  ecommerce: {
    title: 'E-commerce',
    icon: '🛒',
    color: 'from-blue-500 to-cyan-500',
    messages: [
      { id: 1, type: 'received' as const, text: 'Olá! Vi o tênis Nike na promoção, ainda tem?', time: '10:30' },
      { id: 2, type: 'sent' as const, text: 'Olá! 😊 Sim, temos o Nike Air Max disponível! Qual seu tamanho?', time: '10:30' },
      { id: 3, type: 'received' as const, text: '42', time: '10:31' },
      { id: 4, type: 'sent' as const, text: 'Perfeito! Temos o 42 em estoque. De R$599 por R$399! Quer finalizar a compra?', time: '10:31' },
      { id: 5, type: 'received' as const, text: 'Quero sim! Como faço?', time: '10:32' },
      { id: 6, type: 'sent' as const, text: 'Ótimo! 🎉 Aqui está seu link de pagamento seguro: genesis-pay.me/nike42 - Frete grátis! Após o pagamento, te envio o código de rastreio.', time: '10:32' },
    ]
  },
  clinica: {
    title: 'Clínica Médica',
    icon: '🏥',
    color: 'from-green-500 to-emerald-500',
    messages: [
      { id: 1, type: 'received' as const, text: 'Boa tarde, gostaria de agendar uma consulta', time: '14:20' },
      { id: 2, type: 'sent' as const, text: 'Boa tarde! 👋 Com qual especialidade deseja agendar?\n\n1️⃣ Clínico Geral\n2️⃣ Cardiologia\n3️⃣ Dermatologia\n4️⃣ Ortopedia', time: '14:20' },
      { id: 3, type: 'received' as const, text: '2', time: '14:21' },
      { id: 4, type: 'sent' as const, text: 'Cardiologia! Dr. Roberto tem horários disponíveis:\n\n📅 Segunda 15/01 - 09:00\n📅 Quarta 17/01 - 14:00\n📅 Sexta 19/01 - 10:00\n\nQual prefere?', time: '14:21' },
      { id: 5, type: 'received' as const, text: 'Quarta às 14h', time: '14:22' },
      { id: 6, type: 'sent' as const, text: 'Consulta agendada! ✅\n\n👨‍⚕️ Dr. Roberto - Cardiologia\n📅 17/01/2024 às 14:00\n📍 Av. Paulista, 1000 - Sala 501\n\nVou te lembrar 1 dia antes! 😊', time: '14:22' },
    ]
  },
  restaurante: {
    title: 'Restaurante',
    icon: '🍕',
    color: 'from-orange-500 to-red-500',
    messages: [
      { id: 1, type: 'received' as const, text: 'Oi! Quero fazer um pedido', time: '19:45' },
      { id: 2, type: 'sent' as const, text: 'Olá! 🍕 Bem-vindo à Pizzaria Bella! Aqui está nosso cardápio:\n\n🍕 Pizzas a partir de R$39,90\n🍝 Massas a partir de R$32,90\n🥤 Bebidas a partir de R$6,90\n\nO que deseja pedir?', time: '19:45' },
      { id: 3, type: 'received' as const, text: 'Uma pizza de calabresa grande', time: '19:46' },
      { id: 4, type: 'sent' as const, text: 'Excelente escolha! 🤤\n\n🍕 Pizza Calabresa Grande - R$49,90\n\nDeseja adicionar algo?\n1️⃣ Borda recheada +R$8\n2️⃣ Refrigerante 2L +R$12\n3️⃣ Finalizar pedido', time: '19:46' },
      { id: 5, type: 'received' as const, text: '2', time: '19:47' },
      { id: 6, type: 'sent' as const, text: 'Pedido confirmado! 🎉\n\n🍕 Pizza Calabresa Grande\n🥤 Refrigerante 2L\n💰 Total: R$61,90\n⏱️ Entrega: 40-50 min\n\nPix, cartão ou dinheiro?', time: '19:47' },
    ]
  },
  imobiliaria: {
    title: 'Imobiliária',
    icon: '🏠',
    color: 'from-purple-500 to-pink-500',
    messages: [
      { id: 1, type: 'received' as const, text: 'Olá, vi um apartamento no site de vocês', time: '11:00' },
      { id: 2, type: 'sent' as const, text: 'Olá! 🏠 Que bom ter você aqui! Qual imóvel te interessou? Pode me enviar o código ou link do anúncio?', time: '11:00' },
      { id: 3, type: 'received' as const, text: 'O de 2 quartos no Jardins, código AP2045', time: '11:01' },
      { id: 4, type: 'sent' as const, text: 'Ótima escolha! 🌟\n\n📍 Apartamento Jardins - AP2045\n🛏️ 2 quartos (1 suíte)\n📐 75m² | 1 vaga\n💰 R$4.200/mês\n\nGostaria de agendar uma visita?', time: '11:01' },
      { id: 5, type: 'received' as const, text: 'Sim! Pode ser sábado?', time: '11:02' },
      { id: 6, type: 'sent' as const, text: 'Perfeito! 📅 Sábado temos:\n\n🕐 10:00\n🕐 14:00\n🕐 16:00\n\nQual melhor para você? Nosso corretor Paulo estará disponível!', time: '11:02' },
    ]
  }
};

const VendaEmpresas = () => {
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState<keyof typeof conversations>('ecommerce');
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
    setDisplayedMessages([]);
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [activeConversation]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const messages = conversations[activeConversation].messages;
    if (currentIndex >= messages.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedMessages(prev => [...prev, messages[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
    }, currentIndex === 0 ? 500 : 1500);

    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, activeConversation]);

  const replay = () => {
    setDisplayedMessages([]);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const stats = [
    { icon: TrendingUp, value: '+340%', label: 'Aumento em Vendas', color: 'text-green-500' },
    { icon: Clock, value: '< 5s', label: 'Tempo de Resposta', color: 'text-blue-500' },
    { icon: Users, value: '+15k', label: 'Clientes Atendidos/mês', color: 'text-purple-500' },
    { icon: DollarSign, value: 'R$89k', label: 'Economia Mensal', color: 'text-orange-500' },
  ];

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'CEO, TechStore',
      avatar: '👨‍💼',
      text: 'A Genesis revolucionou nosso atendimento. Aumentamos as vendas em 340% e reduzimos o tempo de resposta para segundos.',
      stars: 5
    },
    {
      name: 'Ana Beatriz',
      role: 'Diretora, Clínica Vida',
      avatar: '👩‍⚕️',
      text: 'Agendamentos automáticos 24/7. Nossos pacientes adoram a praticidade e nós economizamos com equipe de atendimento.',
      stars: 5
    },
    {
      name: 'Roberto Mendes',
      role: 'Proprietário, Pizzaria Bella',
      avatar: '👨‍🍳',
      text: 'Pedidos via WhatsApp nunca foram tão fáceis. A Genesis entende o cardápio e fecha pedidos sozinha!',
      stars: 5
    }
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg">Para Empresas</span>
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
              +500 Empresas Confiam
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Genesis para <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Empresas</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja como empresas de diferentes segmentos estão automatizando o atendimento e aumentando vendas
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
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

          {/* Live Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Conversas <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">Reais</span> em Ação
            </h2>

            {/* Segment Selector */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
              {Object.entries(conversations).map(([key, conv]) => (
                <Button
                  key={key}
                  variant={activeConversation === key ? 'default' : 'outline'}
                  onClick={() => setActiveConversation(key as keyof typeof conversations)}
                  className={activeConversation === key 
                    ? `bg-gradient-to-r ${conv.color} border-0` 
                    : ''
                  }
                  size="sm"
                >
                  <span className="mr-2">{conv.icon}</span>
                  <span className="hidden sm:inline">{conv.title}</span>
                </Button>
              ))}
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[340px]">
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
                    <div className={`bg-gradient-to-r ${conversations[activeConversation].color} px-4 py-3 flex items-center gap-3`}>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                        {conversations[activeConversation].icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{conversations[activeConversation].title}</p>
                        <p className="text-white/70 text-xs">online • Genesis IA</p>
                      </div>
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        IA Ativa
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
                        {displayedMessages.map((msg) => (
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
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              O Que Dizem <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Nossos Clientes</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <Card className="h-full border-border/50 bg-card/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{testimonial.avatar}</span>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-3">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <p className="text-muted-foreground">&quot;{testimonial.text}&quot;</p>
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
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  Pronto para Transformar seu Negócio?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Junte-se a mais de 500 empresas que já automatizaram seu atendimento com a Genesis
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/venda-genesis#precos')}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    Começar Teste Grátis
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

export default VendaEmpresas;
