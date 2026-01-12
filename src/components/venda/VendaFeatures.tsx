import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Brain, Workflow, Bell, 
  BarChart3, Shield, Zap, Globe, ArrowRight,
  Bot, Users, Clock, Sparkles, Lock, Webhook
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Brain,
    title: 'Luna IA Conversacional',
    description: 'IA treinada que entende contexto, responde naturalmente e fecha vendas sozinha.',
    gradient: 'from-violet-500 to-purple-600',
    metrics: '97% satisfação',
    badge: 'IA Avançada',
    details: ['Memória de contexto', 'Personalização automática', 'Aprende com cada conversa'],
  },
  {
    icon: Workflow,
    title: 'Flow Builder Visual',
    description: 'Crie automações complexas arrastando e soltando. 15+ componentes profissionais.',
    gradient: 'from-blue-500 to-cyan-600',
    metrics: '+15 componentes',
    badge: 'Drag & Drop',
    details: ['Condições avançadas', 'Integrações HTTP', 'Templates prontos'],
  },
  {
    icon: MessageSquare,
    title: 'Multi-Instâncias',
    description: 'Gerencie múltiplos números de WhatsApp em um único painel centralizado.',
    gradient: 'from-green-500 to-emerald-600',
    metrics: 'Ilimitado',
    badge: 'Escalável',
    details: ['Painel unificado', 'Métricas por número', 'Backup automático'],
  },
  {
    icon: Bell,
    title: 'Notificações Smart',
    description: 'Alertas em tempo real para leads quentes e oportunidades de alta conversão.',
    gradient: 'from-orange-500 to-amber-600',
    metrics: 'Real-time',
    badge: 'Prioritário',
    details: ['Push notifications', 'Alertas de urgência', 'Webhooks externos'],
  },
  {
    icon: BarChart3,
    title: 'Analytics Avançado',
    description: 'Dashboard completo com métricas de conversão, tempo de resposta e ROI.',
    gradient: 'from-pink-500 to-rose-600',
    metrics: '+25 métricas',
    badge: 'Data-driven',
    details: ['Funil de vendas', 'Relatórios PDF', 'Comparativos'],
  },
  {
    icon: Shield,
    title: 'Segurança Enterprise',
    description: 'Criptografia ponta-a-ponta, conformidade LGPD e backup automático diário.',
    gradient: 'from-slate-500 to-zinc-600',
    metrics: '99.9% uptime',
    badge: 'LGPD',
    details: ['Criptografia E2E', 'Backup diário', 'Logs de auditoria'],
  },
  {
    icon: Zap,
    title: 'Resposta Instantânea',
    description: 'Tempo médio de resposta abaixo de 3 segundos, 24 horas por dia.',
    gradient: 'from-yellow-500 to-orange-600',
    metrics: '<3 segundos',
    badge: '24/7',
    details: ['Zero downtime', 'Auto-scaling', 'CDN global'],
  },
  {
    icon: Webhook,
    title: 'Integrações Nativas',
    description: 'Conecte com CRMs, ERPs, e-commerce e mais de 100 ferramentas.',
    gradient: 'from-teal-500 to-cyan-600',
    metrics: '+100 apps',
    badge: 'API REST',
    details: ['Webhooks', 'Zapier/N8N', 'API completa'],
  },
];

const VendaFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Funcionalidades Premium
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Tudo que você precisa
            <br />
            <span className="text-muted-foreground">em uma <span className="text-primary">única</span> plataforma</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Recursos de <span className="text-foreground font-semibold">nível enterprise</span> que transformam
            seu atendimento em uma <span className="text-primary font-semibold">máquina de vendas automática</span>.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <Card className="p-5 md:p-6 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/40 transition-all group cursor-pointer relative overflow-hidden hover:bg-card/80">
                
                <div className="relative">
                  {/* Badge */}
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 text-[10px] bg-primary/10 text-primary border-primary/20"
                  >
                    {feature.badge}
                  </Badge>
                  
                  {/* Icon */}
                  <motion.div 
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    animate={hoveredFeature === index ? { rotate: [0, -5, 5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Metric Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                      {feature.metrics}
                    </span>
                  </div>
                  
                  {/* Details (on hover) */}
                  <AnimatePresence>
                    {hoveredFeature === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1 pt-3 border-t border-border/50"
                      >
                        {feature.details.map((detail, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {detail}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap justify-center items-center gap-6 md:gap-10 px-6 py-4 rounded-2xl bg-card/50 border border-border/50">
            {[
              { icon: Lock, label: 'Dados seguros' },
              { icon: Clock, label: 'Suporte 24/7' },
              { icon: Users, label: '+2.800 clientes' },
              { icon: Zap, label: 'Setup 5min' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaFeatures;
