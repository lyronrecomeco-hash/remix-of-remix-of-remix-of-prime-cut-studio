import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Bot, GitBranch, BarChart3, MessageSquare, 
  Webhook, Shield, Smartphone, Clock, Zap, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Bot,
    title: 'Luna IA Avançada',
    description: 'IA treinada para vendas. Entende contexto e fecha negócios.',
    highlight: true,
  },
  {
    icon: GitBranch,
    title: 'Flow Builder Visual',
    description: 'Crie fluxos arrastando blocos. Zero código.',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Instâncias',
    description: 'Gerencie vários WhatsApp em um único painel.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Completo',
    description: 'Métricas de conversão em tempo real.',
  },
  {
    icon: Webhook,
    title: 'Integrações',
    description: 'Conecte CRMs, ERPs, N8N e Zapier.',
  },
  {
    icon: Shield,
    title: 'Anti-ban Nativo',
    description: '99.9% uptime com proteção integrada.',
  },
  {
    icon: Smartphone,
    title: 'App Mobile',
    description: 'Monitore de qualquer lugar.',
  },
  {
    icon: Clock,
    title: 'Atendimento 24/7',
    description: 'Nunca perca um lead.',
  },
];

const SiteFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="recursos" ref={ref} className="py-20 bg-gray-50 relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Zap className="w-4 h-4" />
            Recursos Premium
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tudo para <span className="text-emerald-600">escalar vendas</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plataforma completa. Sem surpresas, sem limites.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -4 }}
              className={`p-5 rounded-2xl transition-all ${
                feature.highlight
                  ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200'
                  : 'bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                feature.highlight
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {[
                { value: '10M+', label: 'Mensagens/mês' },
                { value: '<3s', label: 'Tempo resposta' },
                { value: '340%', label: 'ROI médio' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-5 px-8 rounded-xl shadow-lg shadow-emerald-500/30">
              <Link to="/genesis" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Começar Grátis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteFeatures;
