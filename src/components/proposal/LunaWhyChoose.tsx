import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Clock, 
  TrendingUp, 
  Heart, 
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { LunaAvatar } from './LunaAvatar';

interface LunaWhyChooseProps {
  niche?: string;
  companyName?: string;
  onComplete?: () => void;
}

interface Reason {
  icon: any;
  title: string;
  description: string;
  color: string;
}

// Razões adaptadas por nicho
const nicheReasons: Record<string, Reason[]> = {
  barbearia: [
    {
      icon: Clock,
      title: 'Você nunca mais perde cliente por demora',
      description: 'Resposta instantânea 24 horas. Enquanto você corta, o sistema agenda.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Agendamento vira automático',
      description: 'Cliente escolhe horário, barbeiro e serviço. Sem você precisar olhar o celular.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Sua agenda fica sempre cheia',
      description: 'Lembretes automáticos reduzem faltas em 70%. Encaixes inteligentes preenchem buracos.',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: Heart,
      title: 'Clientes viram fãs',
      description: 'Programa de fidelidade automático. Cupons no aniversário. Eles voltam sempre.',
      color: 'from-pink-500 to-rose-500'
    }
  ],
  clinica: [
    {
      icon: Shield,
      title: 'Recepção 24h sem custo extra',
      description: 'Pacientes agendam a qualquer hora. Confirmação automática reduz faltas.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Fim das ligações perdidas',
      description: 'WhatsApp responde em segundos. Sua recepcionista foca no presencial.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Mais pacientes, menos ociosidade',
      description: 'Encaixes automáticos preenchem horários vagos. ROI garantido.',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: Users,
      title: 'Relacionamento profissional',
      description: 'Lembretes de retorno, pós-consulta humanizado, satisfação aumenta 40%.',
      color: 'from-pink-500 to-rose-500'
    }
  ],
  restaurante: [
    {
      icon: Zap,
      title: 'Pedidos nunca mais se perdem',
      description: 'Cardápio digital no WhatsApp. Cliente pede, sistema anota perfeito.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Clock,
      title: 'Atendimento instantâneo no rush',
      description: 'Enquanto você cozinha, o sistema atende 50 pessoas ao mesmo tempo.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Delivery organizado',
      description: 'Rastreamento em tempo real. Cliente sabe onde está o pedido.',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: Heart,
      title: 'Clientes fiéis',
      description: 'Promoções automáticas para quem não pede há 15 dias. Eles voltam.',
      color: 'from-pink-500 to-rose-500'
    }
  ],
  servicos: [
    {
      icon: Zap,
      title: 'Lead quente nunca esfria',
      description: 'Resposta em segundos, não em horas. Você pega o cliente antes do concorrente.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Clock,
      title: 'Follow-up que funciona',
      description: 'Sistema lembra de quem pediu orçamento. Ninguém fica esquecido.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Conversão aumenta 40%',
      description: 'Orçamentos enviados na hora. Cliente decide enquanto está interessado.',
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: Shield,
      title: 'Profissionalismo automático',
      description: 'Confirmações, lembretes, pós-serviço. Você parece uma empresa grande.',
      color: 'from-violet-500 to-purple-500'
    }
  ]
};

// Falas da Luna por nicho
const lunaSpeeches: Record<string, string[]> = {
  barbearia: [
    "Eu analisei barbearias que cresceram 300% no último ano.",
    "Todas tinham algo em comum:",
    "Não dependiam de memória. Dependiam de estrutura.",
    "Deixa eu te mostrar por que a Genesis é diferente..."
  ],
  clinica: [
    "Clínicas que mais crescem não são as com mais médicos.",
    "São as que não perdem pacientes por falha de comunicação.",
    "O Genesis foi feito para isso.",
    "Veja por que funciona..."
  ],
  restaurante: [
    "Restaurantes lucrativos têm algo em comum:",
    "Eles não perdem pedido. Nunca.",
    "Enquanto você cozinha, o sistema vende.",
    "Deixa eu mostrar como..."
  ],
  servicos: [
    "Empresas de serviço que dominam o mercado",
    "respondem em segundos, não em horas.",
    "Velocidade fecha negócio.",
    "Veja como o Genesis faz isso..."
  ]
};

export const LunaWhyChoose = ({ niche = 'barbearia', companyName, onComplete }: LunaWhyChooseProps) => {
  const [currentSpeech, setCurrentSpeech] = useState(0);
  const [showReasons, setShowReasons] = useState(false);
  const [visibleReasons, setVisibleReasons] = useState(0);
  const [lunaState, setLunaState] = useState<'talking' | 'revealing' | 'confident'>('talking');
  
  const speeches = lunaSpeeches[niche] || lunaSpeeches.barbearia;
  const reasons = nicheReasons[niche] || nicheReasons.barbearia;

  // Avançar falas da Luna
  useEffect(() => {
    if (currentSpeech < speeches.length) {
      const timer = setTimeout(() => {
        setCurrentSpeech(prev => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setLunaState('revealing');
      setTimeout(() => setShowReasons(true), 500);
    }
  }, [currentSpeech, speeches.length]);

  // Revelar razões uma a uma
  useEffect(() => {
    if (showReasons && visibleReasons < reasons.length) {
      const timer = setTimeout(() => {
        setVisibleReasons(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (visibleReasons === reasons.length) {
      setLunaState('confident');
      setTimeout(() => onComplete?.(), 1500);
    }
  }, [showReasons, visibleReasons, reasons.length, onComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Luna Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block mb-6"
        >
          <LunaAvatar state={lunaState} size="lg" />
        </motion.div>

        {/* Luna Speech */}
        <div className="min-h-[120px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentSpeech < speeches.length && (
              <motion.p
                key={currentSpeech}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-xl md:text-2xl text-white/80 font-light max-w-2xl"
              >
                {speeches[currentSpeech]}
              </motion.p>
            )}
            {currentSpeech >= speeches.length && !showReasons && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
                <span className="text-white/60">Preparando insights...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reasons Grid */}
      <AnimatePresence>
        {showReasons && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, scale: 0.95 }}
                animate={visibleReasons > index ? { opacity: 1, x: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, type: 'spring' }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                  style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                />
                <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${reason.color} flex items-center justify-center shrink-0 shadow-lg`}>
                      <reason.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">{reason.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{reason.description}</p>
                    </div>
                  </div>
                  
                  {/* Checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={visibleReasons > index ? { scale: 1 } : {}}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="absolute top-4 right-4"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Message */}
      <AnimatePresence>
        {visibleReasons === reasons.length && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-2xl px-6 py-4">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span className="text-white font-medium">
                {companyName ? `${companyName} merece essa estrutura` : 'Seu negócio merece essa estrutura'}
              </span>
              <ArrowRight className="w-5 h-5 text-violet-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LunaWhyChoose;
