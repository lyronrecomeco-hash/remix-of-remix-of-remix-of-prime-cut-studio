import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Bot, CheckCircle2, Sparkles, MessageCircle } from 'lucide-react';

const conversations = [
  {
    scenario: 'Atendimento',
    messages: [
      { from: 'user', text: 'Oi, vi o anúncio de vocês no Instagram', time: '09:15' },
      { from: 'bot', text: 'Olá! 🎉 Que bom ter você aqui! Sou a Luna, assistente virtual. Vi que veio do Instagram, qual produto te chamou atenção?', time: '09:15' },
      { from: 'user', text: 'O tênis branco da nova coleção', time: '09:16' },
      { from: 'bot', text: 'Excelente escolha! 👟 O Modelo Sport White está com 20% OFF hoje! Qual seu número?', time: '09:16' },
    ],
  },
  {
    scenario: 'Qualificação',
    messages: [
      { from: 'user', text: 'Quero saber o preço do curso', time: '14:30' },
      { from: 'bot', text: 'Claro! Para te indicar o melhor plano, me conta: você já trabalha na área ou está começando?', time: '14:30' },
      { from: 'user', text: 'Estou começando agora', time: '14:31' },
      { from: 'bot', text: 'Perfeito! Para iniciantes, o Plano Starter é ideal: R$ 297 com suporte por 6 meses. Quer o link de matrícula? 🚀', time: '14:31' },
    ],
  },
  {
    scenario: 'Recuperação',
    messages: [
      { from: 'bot', text: 'Oi Ana! Vi que você deixou itens no carrinho 🛒 Posso ajudar com alguma dúvida?', time: '18:45' },
      { from: 'user', text: 'Achei o frete caro', time: '18:47' },
      { from: 'bot', text: 'Tenho um cupom especial: FRETEGRATIS nas compras acima de R$ 150. Seu carrinho está em R$ 189 - frete grátis! 🎁', time: '18:47' },
      { from: 'user', text: 'Opa! Vou finalizar então', time: '18:48' },
    ],
  },
];

const ComercialDemo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeScenario, setActiveScenario] = useState(0);

  return (
    <section id="demo" ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Luna IA em Ação</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
            Conversas reais que <span className="text-gold-shine">vendem</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como a Luna transforma leads em clientes. Clique nos cenários.
          </p>
        </motion.div>

        {/* Scenario Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {conversations.map((conv, index) => (
            <button
              key={conv.scenario}
              onClick={() => setActiveScenario(index)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeScenario === index
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-card/50 text-muted-foreground hover:bg-card border border-border/50 hover:border-primary/30'
              }`}
            >
              {conv.scenario}
            </button>
          ))}
        </motion.div>

        {/* Chat Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl shadow-black/20">
            {/* Header */}
            <div className="bg-primary px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">Luna IA</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/70 text-sm">Respondendo instantaneamente</span>
                </div>
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-full">
                <span className="text-white text-xs font-medium">{conversations[activeScenario].scenario}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-secondary/30 p-6 min-h-[320px] space-y-4">
              {conversations[activeScenario].messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.from === 'user'
                        ? 'bg-primary/20 rounded-tr-sm border border-primary/30'
                        : 'bg-card rounded-tl-sm border border-border/50'
                    }`}
                  >
                    {msg.from === 'bot' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">Luna</span>
                      </div>
                    )}
                    <p className="text-foreground leading-relaxed text-sm">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      {msg.from === 'user' && (
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Typing Indicator */}
            <div className="bg-secondary/30 px-6 pb-6">
              <div className="inline-flex items-center gap-3 bg-card px-5 py-3 rounded-2xl border border-border/50">
                <div className="flex gap-1">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-primary/50 rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-primary/50 rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-primary/50 rounded-full"
                  />
                </div>
                <span className="text-sm text-muted-foreground">Luna está digitando...</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-primary/10 border border-primary/30 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            <div>
              <p className="text-foreground font-bold">Resultado: Venda Fechada!</p>
              <p className="text-muted-foreground text-sm">Tempo médio: 4 minutos</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComercialDemo;
