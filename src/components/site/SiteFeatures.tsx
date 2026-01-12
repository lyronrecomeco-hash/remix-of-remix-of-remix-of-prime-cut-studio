import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Bot, GitBranch, BarChart3, MessageSquare, Users, Zap,
  Webhook, Shield, Smartphone, Clock, Sparkles, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Bot,
    title: 'Luna IA Avançada',
    description: 'IA treinada para vendas, não apenas FAQ. Entende contexto e fecha negócios.',
    highlight: true,
  },
  {
    icon: GitBranch,
    title: 'Flow Builder Visual',
    description: 'Crie fluxos complexos arrastando blocos. Zero código necessário.',
    highlight: false,
  },
  {
    icon: MessageSquare,
    title: 'Multi-Instâncias',
    description: 'Gerencie vários números WhatsApp em um único painel centralizado.',
    highlight: false,
  },
  {
    icon: BarChart3,
    title: 'Analytics Completo',
    description: 'Métricas de conversão, tempo de resposta e satisfação em tempo real.',
    highlight: false,
  },
  {
    icon: Webhook,
    title: 'Integrações',
    description: 'Conecte CRMs, ERPs, e-commerce, webhooks, N8N e Zapier.',
    highlight: false,
  },
  {
    icon: Shield,
    title: 'Anti-ban Nativo',
    description: '99.9% de uptime com proteção integrada contra bloqueios.',
    highlight: false,
  },
  {
    icon: Smartphone,
    title: 'App Mobile',
    description: 'Monitore e gerencie seu atendimento de qualquer lugar.',
    highlight: false,
  },
  {
    icon: Clock,
    title: 'Atendimento 24/7',
    description: 'Nunca perca um lead. A Luna trabalha enquanto você dorme.',
    highlight: false,
  },
];

const SiteFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-blue-50 border border-blue-200 text-blue-700">
            <Sparkles className="w-4 h-4" />
            Recursos Premium
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Tudo que você precisa para{' '}
            <span className="text-green-600">escalar vendas</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma plataforma completa com as ferramentas mais poderosas do mercado.
            <strong className="text-gray-900"> Sem surpresas, sem limites.</strong>
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl transition-all ${
                feature.highlight
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
                  : 'bg-gray-50 border border-gray-100 hover:border-green-200 hover:bg-green-50/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                feature.highlight
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Resultados que falam por si
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '10M+', label: 'Mensagens/mês' },
                { value: '<3s', label: 'Tempo resposta' },
                { value: '340%', label: 'ROI médio' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold text-green-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="mt-8 bg-green-600 hover:bg-green-700 text-white py-6 px-8 rounded-2xl shadow-lg shadow-green-600/30">
              <Link to="/genesis" className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteFeatures;
