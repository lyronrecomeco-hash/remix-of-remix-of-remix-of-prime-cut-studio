import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  MessageSquare, Brain, Workflow, Bell, 
  BarChart3, Shield, Zap, Globe 
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: Brain,
    title: 'IA Conversacional',
    description: 'Luna entende contexto, responde naturalmente e aprende com cada interação.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Workflow,
    title: 'Flow Builder Visual',
    description: 'Crie automações complexas arrastando e soltando. Zero código necessário.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Instâncias',
    description: 'Gerencie múltiplos números de WhatsApp em um único painel centralizado.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Bell,
    title: 'Notificações Inteligentes',
    description: 'Alertas em tempo real para leads quentes e oportunidades de venda.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Avançado',
    description: 'Métricas detalhadas de conversão, tempo de resposta e satisfação.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Criptografia ponta-a-ponta e conformidade com LGPD garantidas.',
    gradient: 'from-slate-500 to-zinc-500',
  },
  {
    icon: Zap,
    title: 'Respostas Instantâneas',
    description: 'Tempo médio de resposta abaixo de 3 segundos, 24 horas por dia.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Integrações',
    description: 'Conecte com CRMs, ERPs, e-commerce e mais de 100 ferramentas.',
    gradient: 'from-teal-500 to-cyan-500',
  },
];

const VendaFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Zap className="w-4 h-4" />
            Funcionalidades
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Tudo que você precisa
            <br />
            <span className="text-muted-foreground">em uma única plataforma</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recursos poderosos que transformam seu atendimento em uma máquina de vendas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VendaFeatures;
