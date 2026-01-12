import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { 
  Bot, Zap, Brain, MessageSquare, Clock, Shield, 
  BarChart3, Workflow, Globe, Headphones, Sparkles, Check
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Luna IA Avançada',
    description: 'Inteligência artificial que entende contexto, humor e urgência. Responde como um humano experiente.',
    color: 'from-violet-500 to-purple-600',
    highlights: ['Entende áudios', 'Processa imagens', 'Aprende com feedbacks'],
  },
  {
    icon: Zap,
    title: 'Respostas Instantâneas',
    description: 'Tempo de resposta menor que 3 segundos. Seus clientes nunca mais esperam.',
    color: 'from-amber-500 to-orange-600',
    highlights: ['< 3 segundos', '24/7 disponível', 'Multi-idiomas'],
  },
  {
    icon: Brain,
    title: 'Aprendizado Contínuo',
    description: 'A cada conversa, Luna fica mais inteligente e assertiva nas respostas.',
    color: 'from-pink-500 to-rose-600',
    highlights: ['Auto-melhoria', 'Análise de padrões', 'Otimização constante'],
  },
  {
    icon: Workflow,
    title: 'Fluxos Personalizados',
    description: 'Crie jornadas de atendimento únicas com nosso Flow Builder visual.',
    color: 'from-cyan-500 to-blue-600',
    highlights: ['Drag & Drop', 'Templates prontos', 'Condições avançadas'],
  },
  {
    icon: BarChart3,
    title: 'Analytics em Tempo Real',
    description: 'Dashboard completo com métricas de conversão, tempo de resposta e satisfação.',
    color: 'from-emerald-500 to-green-600',
    highlights: ['Conversões', 'Tempo médio', 'Satisfação'],
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Dados criptografados, LGPD compliant e backups automáticos.',
    color: 'from-slate-500 to-gray-700',
    highlights: ['Criptografia', 'LGPD', 'Backup diário'],
  },
];

const ComercialFeatures = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="recursos" ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600">Recursos Premium</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Tudo que você precisa para
            <span className="block mt-2 bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
              dominar o mercado
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Ferramentas poderosas que trabalham 24 horas por dia para multiplicar suas vendas.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-8 h-full shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-gray-200 transition-all duration-500 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
                />

                {/* Icon */}
                <motion.div
                  animate={hoveredIndex === index ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="relative z-10 text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="relative z-10 flex flex-wrap gap-2">
                  {feature.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700"
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Decorative Corner */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { value: '99.9%', label: 'Uptime Garantido' },
            { value: '< 3s', label: 'Tempo de Resposta' },
            { value: '500+', label: 'Empresas Ativas' },
            { value: '2M+', label: 'Mensagens/Mês' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100"
            >
              <p className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-2 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComercialFeatures;
