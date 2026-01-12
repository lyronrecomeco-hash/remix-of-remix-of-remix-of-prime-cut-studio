import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Bot, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'luna';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  niche: string;
  business: string;
  messages: ChatMessage[];
  result: string;
}

const conversations: Conversation[] = [
  {
    id: '1',
    niche: 'Clínica Estética',
    business: 'Clínica Bella Vita',
    messages: [
      { id: '1', type: 'user', text: 'Oi, quero saber sobre botox', time: '14:23' },
      { id: '2', type: 'luna', text: 'Olá! 😊 Que bom que você se interessou!\n\nNosso Botox é aplicado por dermatologistas especializados.\n\n💰 Valor: R$ 800\n⏱️ Duração: 15-20 min\n\nQuer agendar uma avaliação gratuita?', time: '14:23' },
      { id: '3', type: 'user', text: 'Quero sim! Tem horário amanhã?', time: '14:24' },
      { id: '4', type: 'luna', text: 'Perfeito! ✅ Horários disponíveis:\n\n🕐 09:00 | 🕐 15:00 | 🕐 17:00\n\nQual prefere?', time: '14:24' },
      { id: '5', type: 'user', text: '15:00', time: '14:25' },
      { id: '6', type: 'luna', text: '🎉 Confirmado!\n\n📅 Amanhã às 15:00\n📍 Av. Paulista, 1000\n\nVou te enviar um lembrete! 💚', time: '14:25' },
    ],
    result: 'Agendado em 2 min',
  },
  {
    id: '2',
    niche: 'Restaurante',
    business: 'Burguer House',
    messages: [
      { id: '1', type: 'user', text: 'Vocês entregam?', time: '20:15' },
      { id: '2', type: 'luna', text: 'Boa noite! 🍔 Sim!\n\n🚗 Taxa: R$ 5 (até 3km)\n⏱️ Tempo: 30-40 min\n\nO que você deseja pedir?', time: '20:15' },
      { id: '3', type: 'user', text: 'Smash duplo e batata', time: '20:16' },
      { id: '4', type: 'luna', text: 'Ótima escolha! 🤤\n\n🍔 Smash Duplo - R$ 32\n🍟 Batata - R$ 15\n💰 Total: R$ 52\n\nAdicionar Coca por +R$ 6?', time: '20:16' },
      { id: '5', type: 'user', text: 'Pode ser!', time: '20:17' },
      { id: '6', type: 'luna', text: '✅ Pedido confirmado!\n\n💰 Total: R$ 58\n\nEnvie seu endereço e forma de pagamento 📦', time: '20:17' },
    ],
    result: 'Venda em 2 min',
  },
  {
    id: '3',
    niche: 'Barbearia',
    business: 'Barbearia Classic',
    messages: [
      { id: '1', type: 'user', text: 'Tem horário hj?', time: '09:30' },
      { id: '2', type: 'luna', text: 'E aí! 💈 Horários de hoje:\n\n🕐 10:30 | 🕐 14:00 | 🕐 16:30\n\n✂️ Corte R$ 45\n🪒 Barba R$ 30\n💇 Combo R$ 65', time: '09:30' },
      { id: '3', type: 'user', text: 'Combo 14:00', time: '09:31' },
      { id: '4', type: 'luna', text: 'Show! ✅\n\n📅 Hoje às 14:00\n💇 Combo com Pedro\n💰 R$ 65\n\nTe espero lá! 🤙', time: '09:31' },
    ],
    result: 'Agendado em 1 min',
  },
  {
    id: '4',
    niche: 'E-commerce',
    business: 'TechStore',
    messages: [
      { id: '1', type: 'user', text: 'Tem iPhone 15?', time: '16:45' },
      { id: '2', type: 'luna', text: 'Oi! 📱 Temos!\n\niPhone 15 128GB:\n🎯 À vista: R$ 5.499\n💳 12x: R$ 499,90\n\nTodas as cores! Qual te interessa?', time: '16:45' },
      { id: '3', type: 'user', text: 'Preto. Qual garantia?', time: '16:46' },
      { id: '4', type: 'luna', text: '✅ iPhone 15 128GB Preto\n\n🛡️ 2 anos garantia\n📦 Frete grátis\n🚀 Entrega 2-3 dias\n\nFechamos? 😊', time: '16:46' },
      { id: '5', type: 'user', text: 'Fecha! Pix tem desconto?', time: '16:47' },
      { id: '6', type: 'luna', text: '🤑 PIX = 5% OFF!\n\n💰 R$ 5.224,05\n\nVou gerar o PIX. Nome e CPF?', time: '16:47' },
    ],
    result: 'Venda R$ 5.224',
  },
];

const SiteConversations = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % conversations.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex(prev => (prev - 1 + conversations.length) % conversations.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex(prev => (prev + 1) % conversations.length);
  };

  const activeConversation = conversations[activeIndex];

  return (
    <section id="demo" ref={ref} className="py-20 bg-white relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Luna IA em ação
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Veja a Luna <span className="text-emerald-600">vendendo</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Conversas reais. Resultados em minutos.
          </p>
        </motion.div>

        {/* Niche Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {conversations.map((conv, index) => (
            <button
              key={conv.id}
              onClick={() => { setActiveIndex(index); setIsAutoPlaying(false); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeIndex === index
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {conv.niche}
            </button>
          ))}
        </motion.div>

        {/* Chat Window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <button onClick={handlePrev} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{activeConversation.business}</p>
                <p className="text-green-200 text-xs">Luna IA • Online</p>
              </div>
              <button onClick={handleNext} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="bg-[#ECE5DD] h-[320px] p-3 space-y-2 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeConversation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {activeConversation.messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
                          msg.type === 'user'
                            ? 'bg-[#DCF8C6] rounded-br-none'
                            : 'bg-white rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-500">{msg.time}</span>
                          {msg.type === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Result Footer */}
            <div className="bg-white px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 text-lg">✓</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Resultado:</p>
                    <p className="text-sm font-bold text-emerald-600">{activeConversation.result}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {conversations.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => { setActiveIndex(index); setIsAutoPlaying(false); }}
                      className={`h-2 rounded-full transition-all ${
                        activeIndex === index ? 'bg-emerald-600 w-6' : 'bg-gray-300 w-2'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteConversations;
