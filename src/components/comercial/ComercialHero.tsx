import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MessageCircle, Zap, Bot, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';

const stats = [
  { value: '10x', label: 'Mais Vendas', color: 'from-emerald-500 to-green-600' },
  { value: '24/7', label: 'Atendimento', color: 'from-blue-500 to-cyan-500' },
  { value: '< 3s', label: 'Tempo Resposta', color: 'from-purple-500 to-pink-500' },
];

const floatingIcons = [
  { Icon: MessageCircle, delay: 0, x: '10%', y: '20%' },
  { Icon: Zap, delay: 0.5, x: '85%', y: '15%' },
  { Icon: Bot, delay: 1, x: '5%', y: '70%' },
  { Icon: CheckCircle2, delay: 1.5, x: '90%', y: '75%' },
];

const ComercialHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-white" />
        <motion.div
          style={{ y }}
          className="absolute inset-0"
        >
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-emerald-200/40 to-green-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
        </motion.div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ delay, duration: 0.5 }}
          style={{ left: x, top: y }}
          className="absolute hidden lg:block"
        >
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, delay }}
          >
            <Icon className="w-12 h-12 text-emerald-500" />
          </motion.div>
        </motion.div>
      ))}

      <motion.div style={{ opacity }} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200/50 mb-8"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-500"
                />
                <span className="text-sm font-semibold text-emerald-700">
                  IA que vende enquanto você dorme
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight"
              >
                Transforme seu
                <span className="block mt-2">
                  <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 bg-clip-text text-transparent">
                    WhatsApp
                  </span>
                  {' '}em uma
                </span>
                <span className="block mt-2">máquina de vendas</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                A <strong className="text-gray-900">Luna IA</strong> atende, qualifica e fecha vendas automaticamente. 
                Nunca mais perca um cliente por demora no atendimento.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mt-10 justify-center lg:justify-start"
              >
                <Link to="/genesis/login">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg px-8 py-6 rounded-2xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/40 transition-all duration-300 group"
                  >
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsVideoPlaying(true)}
                  className="w-full sm:w-auto border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 font-semibold text-lg px-8 py-6 rounded-2xl transition-all duration-300 group"
                >
                  <Play className="mr-2 w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  Ver Demo
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-6 mt-12 justify-center lg:justify-start"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100"
                  >
                    <span className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right - Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Phone Frame */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative z-10"
                >
                  <div className="w-[300px] sm:w-[340px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-black/30">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden">
                      {/* WhatsApp Header */}
                      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Luna IA</p>
                          <p className="text-emerald-200 text-xs">online agora</p>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="bg-[#ECE5DD] p-4 space-y-3 min-h-[400px]">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                          className="flex justify-end"
                        >
                          <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] shadow">
                            <p className="text-sm text-gray-800">Olá, quero saber sobre os planos</p>
                            <p className="text-[10px] text-gray-500 text-right mt-1">14:32</p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 }}
                          className="flex justify-start"
                        >
                          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%] shadow">
                            <p className="text-sm text-gray-800">
                              Olá! 😊 Sou a Luna, sua assistente virtual!
                            </p>
                            <p className="text-sm text-gray-800 mt-2">
                              Temos 3 planos incríveis. Qual o tamanho do seu negócio?
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                Iniciante
                              </span>
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                Crescimento
                              </span>
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                Empresa
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">14:32</p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.6 }}
                          className="flex justify-center"
                        >
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full shadow-sm">
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-2 h-2 bg-emerald-500 rounded-full"
                            />
                            <span className="text-xs text-gray-500">Luna está digitando...</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute -z-10 top-10 -right-10 w-40 h-40 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-2xl opacity-30" />
                <div className="absolute -z-10 bottom-20 -left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-2xl opacity-30" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-gray-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ComercialHero;
