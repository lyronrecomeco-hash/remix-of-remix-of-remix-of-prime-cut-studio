import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  TrendingUp, MessageSquare, Clock, Users, 
  DollarSign, CheckCircle2, ArrowRight, Star,
  Building2, Sparkles, BarChart3, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const metrics = [
  { 
    icon: MessageSquare, 
    value: '12.847', 
    label: 'Mensagens/mês', 
    change: '+340%',
    color: 'from-blue-500 to-cyan-500' 
  },
  { 
    icon: Clock, 
    value: '2.3s', 
    label: 'Tempo médio resposta', 
    change: '-85%',
    color: 'from-green-500 to-emerald-500' 
  },
  { 
    icon: Users, 
    value: '847', 
    label: 'Leads captados', 
    change: '+127%',
    color: 'from-violet-500 to-purple-500' 
  },
  { 
    icon: DollarSign, 
    value: 'R$ 94.500', 
    label: 'Faturamento gerado', 
    change: '+215%',
    color: 'from-amber-500 to-orange-500' 
  },
];

const testimonialConversations = [
  {
    business: 'Clínica Odontológica',
    avatar: '🦷',
    messages: [
      { role: 'user', text: 'Quanto custa um implante?' },
      { role: 'bot', text: 'O implante dentário a partir de R$ 2.500. Temos parcelamento em até 12x! Posso agendar uma avaliação gratuita?' },
      { role: 'user', text: 'Sim, pode ser amanhã às 14h?' },
      { role: 'bot', text: '✅ Agendado! Amanhã 14h com Dr. Carlos. Endereço: Rua das Flores, 123. Até lá!' },
    ],
    result: 'Agendamento automático em 45 segundos',
    tag: 'SAÚDE'
  },
  {
    business: 'Loja de Roupas',
    avatar: '👗',
    messages: [
      { role: 'user', text: 'Vocês têm vestido para formatura?' },
      { role: 'bot', text: 'Temos vários! 👗 Posso te mostrar alguns modelos. Qual seu tamanho e cor de preferência?' },
      { role: 'user', text: 'M, cor escura' },
      { role: 'bot', text: 'Achei 8 opções perfeitas! Vou enviar as fotos. Os preços vão de R$ 189 a R$ 459. Quer reservar algum?' },
    ],
    result: 'Venda de R$ 389 em 3 minutos',
    tag: 'E-COMMERCE'
  },
  {
    business: 'Academia Fitness',
    avatar: '💪',
    messages: [
      { role: 'user', text: 'Qual o valor da mensalidade?' },
      { role: 'bot', text: 'Temos planos a partir de R$ 89/mês! 🏋️ Quer conhecer nossa estrutura? Posso agendar uma aula experimental GRÁTIS!' },
      { role: 'user', text: 'Sim, quero experimentar' },
      { role: 'bot', text: 'Show! 🎉 Aula marcada para amanhã às 18h. Traga documento e água. Te espero!' },
    ],
    result: 'Lead qualificado em 1 minuto',
    tag: 'FITNESS'
  },
];

const VendaBusinessShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-muted/20 via-background to-muted/10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-3xl" />

      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Building2 className="w-4 h-4" />
            Resultados Reais
            <Badge variant="secondary" className="ml-1 text-[10px]">CASES</Badge>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Empresas com Genesis
            <br />
            <span className="text-primary">mais praticidade</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Veja como diferentes <span className="text-foreground font-semibold">segmentos</span> estão usando
            a Genesis para <span className="text-primary font-semibold">automatizar vendas</span> e atendimento.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 max-w-5xl mx-auto"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="p-4 md:p-6 text-center bg-card/50 backdrop-blur border-border/50 hover:border-primary/40 transition-all group">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-xs text-muted-foreground mb-2">{metric.label}</div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                  {metric.change}
                </Badge>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Conversation Examples */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {testimonialConversations.map((convo, index) => (
            <motion.div
              key={convo.business}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="p-4 md:p-6 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/40 transition-all group">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                  <div className="text-3xl">{convo.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{convo.business}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] mt-1">{convo.tag}</Badge>
                  </div>
                </div>

                {/* Mini Chat */}
                <div className="space-y-2 mb-4">
                  {convo.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-lg text-xs ${
                          msg.role === 'user'
                            ? 'bg-primary/20 text-foreground rounded-tr-none'
                            : 'bg-muted text-muted-foreground rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Result */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-xs font-medium text-green-600">{convo.result}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Invoice/Stats Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-6 md:p-8 bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left - Stats */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Dashboard de Resultados</h3>
                    <p className="text-sm text-muted-foreground">Janeiro 2024</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Mensagens processadas</span>
                    <span className="font-bold">45.293</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Leads gerados</span>
                    <span className="font-bold text-green-500">+1.847</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Agendamentos</span>
                    <span className="font-bold text-primary">+623</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="text-sm font-medium">Faturamento via IA</span>
                    <span className="font-bold text-green-500 text-lg">R$ 127.450</span>
                  </div>
                </div>
              </div>

              {/* Right - CTA */}
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">4.9/5</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Sua empresa pode ter
                  <br />
                  <span className="text-primary">esses resultados</span>
                </h3>
                
                <p className="text-muted-foreground mb-6">
                  Junte-se a +2.800 empresas que já automatizaram 
                  seu atendimento com a Genesis.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/30">
                    <Link to="/genesis">
                      <Zap className="w-4 h-4" />
                      Começar Agora
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Ver Mais Cases
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaBusinessShowcase;
