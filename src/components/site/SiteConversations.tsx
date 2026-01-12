import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Bot, Check, CheckCheck, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'luna';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  niche: string;
  title: string;
  business: string;
  messages: ChatMessage[];
  result: string;
}

const conversations: Conversation[] = [
  {
    id: '1',
    niche: 'Clínica Estética',
    title: 'Agendamento Automático',
    business: 'Clínica Bella Vita',
    messages: [
      { id: '1', type: 'user', text: 'Oi, quero saber sobre botox', time: '14:23' },
      { id: '2', type: 'luna', text: 'Olá! 😊 Que bom que você se interessou!\n\nNosso Botox é aplicado por dermatologistas especializados, com resultado natural.\n\n💰 Valor: R$ 800 a sessão\n⏱️ Duração: 15-20 min\n📅 Resultado: 3-5 dias\n\nQuer agendar uma avaliação gratuita?', time: '14:23' },
      { id: '3', type: 'user', text: 'Quero sim! Tem horário amanhã?', time: '14:24' },
      { id: '4', type: 'luna', text: 'Perfeito! ✅ Temos os seguintes horários disponíveis amanhã:\n\n🕐 09:00\n🕐 11:00\n🕐 15:00\n🕐 17:00\n\nQual prefere?', time: '14:24' },
      { id: '5', type: 'user', text: '15:00', time: '14:25' },
      { id: '6', type: 'luna', text: '🎉 Pronto! Sua avaliação está confirmada:\n\n📅 Amanhã às 15:00\n📍 Av. Paulista, 1000\n👩‍⚕️ Dra. Marina\n\nVou te enviar um lembrete!\nQualquer dúvida, é só chamar 💚', time: '14:25' },
    ],
    result: 'Consulta agendada em 2 minutos',
  },
  {
    id: '2',
    niche: 'Restaurante',
    title: 'Pedido Delivery',
    business: 'Burguer House',
    messages: [
      { id: '1', type: 'user', text: 'Boa noite! Vocês entregam?', time: '20:15' },
      { id: '2', type: 'luna', text: 'Boa noite! 🍔 Sim, entregamos!\n\nTaxa: R$ 5 (até 3km) / R$ 8 (até 5km)\n⏱️ Tempo médio: 30-40 min\n\nVou te mandar nosso cardápio. O que você está com vontade hoje?', time: '20:15' },
      { id: '3', type: 'user', text: 'Quero um smash duplo e batata', time: '20:16' },
      { id: '4', type: 'luna', text: 'Ótima escolha! 🤤\n\n🍔 Smash Duplo - R$ 32\n🍟 Batata Média - R$ 15\n\n📦 Subtotal: R$ 47\n🚗 Entrega: R$ 5\n💰 Total: R$ 52\n\nDeseja adicionar bebida? Coca-Cola por mais R$ 6!', time: '20:16' },
      { id: '5', type: 'user', text: 'Pode ser! Com coca', time: '20:17' },
      { id: '6', type: 'luna', text: '✅ Pedido confirmado!\n\n🍔 Smash Duplo\n🍟 Batata Média\n🥤 Coca-Cola\n💰 Total: R$ 58\n\nPode enviar seu endereço e forma de pagamento? (PIX, cartão ou dinheiro)', time: '20:17' },
    ],
    result: 'Pedido fechado em 2 minutos',
  },
  {
    id: '3',
    niche: 'Barbearia',
    title: 'Agendamento Express',
    business: 'Barbearia Classic',
    messages: [
      { id: '1', type: 'user', text: 'Eai, tem horário hj?', time: '09:30' },
      { id: '2', type: 'luna', text: 'E aí, parceiro! 💈\n\nHoje temos:\n\n🕐 10:30 - Ricardo\n🕐 14:00 - Pedro\n🕐 16:30 - Ricardo\n\nQual serviço você quer?\n\n✂️ Corte - R$ 45\n🪒 Barba - R$ 30\n💇‍♂️ Combo - R$ 65', time: '09:30' },
      { id: '3', type: 'user', text: 'Combo 14:00', time: '09:31' },
      { id: '4', type: 'luna', text: 'Show! ✅ Agendado:\n\n📅 Hoje às 14:00\n💇‍♂️ Combo (Corte + Barba)\n✂️ Com Pedro\n💰 R$ 65\n\nTe espero lá, chega uns 5min antes! 🤙', time: '09:31' },
    ],
    result: 'Agendado em 1 minuto',
  },
  {
    id: '4',
    niche: 'E-commerce',
    title: 'Venda + Suporte',
    business: 'TechStore Brasil',
    messages: [
      { id: '1', type: 'user', text: 'Vocês tem iPhone 15?', time: '16:45' },
      { id: '2', type: 'luna', text: 'Oi! 📱 Temos sim!\n\niPhone 15 128GB:\n🎯 À vista: R$ 5.499\n💳 12x: R$ 499,90\n\niPhone 15 256GB:\n🎯 À vista: R$ 6.199\n💳 12x: R$ 564,45\n\nTodas as cores disponíveis! Qual te interessa?', time: '16:45' },
      { id: '3', type: 'user', text: 'O de 128 preto. Qual garantia?', time: '16:46' },
      { id: '4', type: 'luna', text: '✅ iPhone 15 128GB Preto\n\n🛡️ Garantia:\n• 1 ano Apple oficial\n• +1 ano nossa loja (2 anos total)\n• Troca em até 7 dias\n\n📦 Frete grátis!\n🚀 Entrega em 2-3 dias úteis\n\nFechamos? 😊', time: '16:46' },
      { id: '5', type: 'user', text: 'Fecha sim! Pix tem desconto?', time: '16:47' },
      { id: '6', type: 'luna', text: '🤑 No PIX você ganha 5% OFF!\n\n💰 De R$ 5.499 por R$ 5.224,05\n\nVou gerar o PIX e te envio aqui. Pode confirmar seu nome completo e CPF?', time: '16:47' },
    ],
    result: 'Venda de R$ 5.224 em 2 minutos',
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
    }, 6000);
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
    <section id="demo" ref={ref} className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-green-50 border border-green-200 text-green-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Conversas reais da Luna
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Veja a Luna em{' '}
            <span className="text-green-600">ação</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conversas reais de clientes usando a Luna em diferentes segmentos.
            <strong className="text-gray-900"> Resultados em minutos.</strong>
          </p>
        </motion.div>

        {/* Niche Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {conversations.map((conv, index) => (
            <button
              key={conv.id}
              onClick={() => { setActiveIndex(index); setIsAutoPlaying(false); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeIndex === index
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
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
          className="max-w-lg mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <button onClick={handlePrev} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{activeConversation.business}</p>
                <p className="text-green-200 text-xs">Luna IA • Online</p>
              </div>
              <button onClick={handleNext} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="bg-[#ECE5DD] min-h-[400px] p-4 space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeConversation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {activeConversation.messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
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
                          {msg.type === 'user' && <CheckCheck className="w-4 h-4 text-blue-500" />}
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
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Resultado:</p>
                    <p className="text-sm font-semibold text-green-600">{activeConversation.result}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {conversations.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => { setActiveIndex(index); setIsAutoPlaying(false); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeIndex === index ? 'bg-green-600 w-4' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-full shadow-lg border border-gray-100">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white" />
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-gray-500">+2.800 empresas satisfeitas</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteConversations;
