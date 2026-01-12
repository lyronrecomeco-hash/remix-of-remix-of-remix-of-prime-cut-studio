import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Bot, User, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

const conversations = [
  {
    scenario: 'Atendimento Inicial',
    messages: [
      { from: 'user', text: 'Oi, vi o anúncio de vocês no Instagram', time: '09:15' },
      { from: 'bot', text: 'Olá! 🎉 Que bom ter você aqui! Sou a Luna, assistente virtual da empresa. Vi que veio do Instagram, qual produto te chamou atenção?', time: '09:15' },
      { from: 'user', text: 'O tênis branco da nova coleção', time: '09:16' },
      { from: 'bot', text: 'Excelente escolha! 👟 O Modelo Sport White está com 20% OFF hoje! Qual seu número?', time: '09:16' },
    ],
  },
  {
    scenario: 'Qualificação de Lead',
    messages: [
      { from: 'user', text: 'Quero saber o preço do curso', time: '14:30' },
      { from: 'bot', text: 'Claro! Para te indicar o melhor plano, me conta: você já trabalha na área ou está começando do zero?', time: '14:30' },
      { from: 'user', text: 'Estou começando agora', time: '14:31' },
      { from: 'bot', text: 'Perfeito! Para iniciantes, o Plano Starter é ideal: R$ 297 com suporte por 6 meses. Quer que eu envie o link de matrícula? 🚀', time: '14:31' },
    ],
  },
  {
    scenario: 'Recuperação de Carrinho',
    messages: [
      { from: 'bot', text: 'Oi Ana! Vi que você deixou itens no carrinho 🛒 Posso ajudar com alguma dúvida?', time: '18:45' },
      { from: 'user', text: 'Achei o frete caro', time: '18:47' },
      { from: 'bot', text: 'Entendo! Tenho um cupom especial: FRETEGRATIS nas compras acima de R$ 150. Seu carrinho está em R$ 189 - frete grátis pra você! 🎁', time: '18:47' },
      { from: 'user', text: 'Opa! Vou finalizar então', time: '18:48' },
    ],
  },
];

const ComercialDemo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeScenario, setActiveScenario] = useState(0);

  return (
    <section id="demo" ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600">A Solução</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Veja a <span className="text-emerald-500">Luna IA</span> em ação
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Conversas reais que geram vendas. Clique nos cenários para ver como a Luna transforma leads em clientes.
          </p>
        </motion.div>

        {/* Scenario Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {conversations.map((conv, index) => (
            <button
              key={conv.scenario}
              onClick={() => setActiveScenario(index)}
              className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                activeScenario === index
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300'
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
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden">
            {/* WhatsApp Header */}
            <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center ring-2 ring-white/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">Luna IA</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-emerald-100 text-sm">Respondendo instantaneamente</span>
                </div>
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-full">
                <span className="text-white text-xs font-medium">{conversations[activeScenario].scenario}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-[#ECE5DD] p-6 min-h-[350px] space-y-4">
              {conversations[activeScenario].messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
                      msg.from === 'user'
                        ? 'bg-[#DCF8C6] rounded-tr-sm'
                        : 'bg-white rounded-tl-sm'
                    }`}
                  >
                    {msg.from === 'bot' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600">Luna</span>
                      </div>
                    )}
                    <p className="text-gray-800 leading-relaxed">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                      {msg.from === 'user' && (
                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Typing Indicator */}
            <div className="bg-[#ECE5DD] px-6 pb-6">
              <div className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm">
                <div className="flex gap-1">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-500">Luna está digitando...</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Result Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center mt-10"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-xl shadow-green-500/30">
            <CheckCircle2 className="w-8 h-8 text-white" />
            <div>
              <p className="text-white font-bold text-lg">Resultado: Venda Fechada!</p>
              <p className="text-emerald-100 text-sm">Tempo médio de conversão: 4 minutos</p>
            </div>
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComercialDemo;
