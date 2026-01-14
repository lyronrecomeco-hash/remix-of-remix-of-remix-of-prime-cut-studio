import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Scissors, Sparkles, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TemplateConfig } from '@/components/affiliate/templates/types';

interface DemoServicesProps {
  config: TemplateConfig;
}

// Serviços de demonstração
const demoServices = [
  { id: '1', name: 'Corte Degradê', description: 'Corte moderno com degradê perfeito', price: 45, duration: 40, icon: 'scissors' },
  { id: '2', name: 'Barba Completa', description: 'Barba modelada com toalha quente', price: 35, duration: 30, icon: 'sparkle' },
  { id: '3', name: 'Corte + Barba', description: 'Combo completo para seu visual', price: 70, duration: 60, icon: 'droplet' },
  { id: '4', name: 'Hidratação', description: 'Tratamento capilar profundo', price: 50, duration: 45, icon: 'droplet' },
  { id: '5', name: 'Pigmentação', description: 'Pigmentação para barba e cabelo', price: 80, duration: 50, icon: 'sparkle' },
  { id: '6', name: 'Corte Infantil', description: 'Corte especial para crianças', price: 35, duration: 30, icon: 'scissors' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  scissors: Scissors,
  sparkle: Sparkles,
  droplet: Droplet,
};

export default function DemoServices({ config }: DemoServicesProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleWhatsAppClick = (serviceName: string) => {
    const phone = config.business.whatsapp?.replace(/\D/g, '') || '';
    const message = `Olá! Gostaria de agendar o serviço "${serviceName}" na ${config.business.name}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="servicos" className="py-20 bg-secondary/30" ref={ref}>
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span 
            className="text-sm font-medium tracking-wider uppercase"
            style={{ color: config.branding.primaryColor }}
          >
            Nossos Serviços
          </span>
          <h2 
            className="text-3xl md:text-5xl font-bold mt-4 mb-6"
            style={{ fontFamily: config.typography.headingFont }}
          >
            Cuidados que fazem{' '}
            <span style={{ color: config.branding.primaryColor }}>a diferença</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cada serviço é executado com técnica apurada e atenção aos detalhes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoServices.map((service, index) => {
            const Icon = iconMap[service.icon] || Scissors;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                    style={{ backgroundColor: `${config.branding.primaryColor}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.branding.primaryColor }} />
                  </div>
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: config.branding.primaryColor }}
                  >
                    R$ {service.price}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    ⏱ {service.duration} min
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleWhatsAppClick(service.name)}
                    style={{ color: config.branding.primaryColor }}
                  >
                    Agendar
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
