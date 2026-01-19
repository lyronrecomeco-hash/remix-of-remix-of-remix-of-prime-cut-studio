import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Instagram, Facebook, Dumbbell, Users, Calendar, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplateConfig {
  business: {
    name: string;
    phone: string;
    whatsapp: string;
    address: string;
    slogan: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
  };
  features: {
    showPricing: boolean;
    showTeam: boolean;
    showGallery: boolean;
    showScheduling?: boolean;
    showTestimonials?: boolean;
    showContact?: boolean;
  };
  social?: {
    instagram?: string;
    facebook?: string;
  };
  hours?: {
    weekdays: string;
    saturday: string;
    sunday?: string;
  };
}

interface DynamicAcademiaProps {
  config: TemplateConfig;
}

export default function DynamicAcademia({ config }: DynamicAcademiaProps) {
  const { business, branding, features, social, hours } = config;

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Olá! Gostaria de conhecer a ${business.name}`);
    window.open(`https://wa.me/${business.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: '#09090b',
        color: '#ffffff'
      }}
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(135deg, ${branding.primaryColor}20, transparent 50%, ${branding.accentColor}10)`
          }}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 max-w-4xl mx-auto"
        >
          <div 
            className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <Dumbbell className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            {business.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            {business.slogan || 'Transforme seu corpo, transforme sua vida'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={openWhatsApp}
              size="lg"
              className="text-lg px-10 py-7"
              style={{ backgroundColor: branding.primaryColor }}
            >
              Agende uma Visita
            </Button>
            {features.showPricing && (
              <Button 
                variant="outline"
                size="lg"
                className="text-lg px-10 py-7 border-zinc-700 hover:bg-zinc-800"
              >
                Ver Planos
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10+', label: 'Anos' },
              { value: '2000+', label: 'Alunos' },
              { value: '4.9', label: 'Avaliação' },
              { value: '20+', label: 'Professores' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <p 
                  className="text-4xl font-black"
                  style={{ color: branding.primaryColor }}
                >
                  {stat.value}
                </p>
                <p className="text-zinc-500 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Plans Section */}
      {features.showPricing && (
        <section className="py-24 px-4 bg-zinc-900/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
              Nossos Planos
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Básico', price: 'R$ 89', features: ['Musculação', 'Cardio', 'Vestiários'] },
                { name: 'Completo', price: 'R$ 149', features: ['Tudo do Básico', 'Aulas em Grupo', 'Avaliação Física'], popular: true },
                { name: 'Premium', price: 'R$ 249', features: ['Tudo do Completo', 'Personal Trainer', 'Nutricionista'] },
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-8 rounded-3xl border ${
                    plan.popular 
                      ? 'border-2 bg-zinc-900' 
                      : 'border-zinc-800 bg-zinc-900/50'
                  }`}
                  style={plan.popular ? { borderColor: branding.primaryColor } : {}}
                >
                  {plan.popular && (
                    <div 
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Mais Popular
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p 
                    className="text-4xl font-black mb-6"
                    style={{ color: plan.popular ? branding.primaryColor : 'white' }}
                  >
                    {plan.price}<span className="text-lg text-zinc-500">/mês</span>
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-300">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: branding.primaryColor + '30' }}
                        >
                          <Star className="w-3 h-3" style={{ color: branding.primaryColor }} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    style={plan.popular ? { backgroundColor: branding.primaryColor } : {}}
                    onClick={openWhatsApp}
                  >
                    Começar Agora
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            Nossa Estrutura
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Dumbbell, name: 'Musculação', desc: 'Equipamentos modernos' },
              { icon: Users, name: 'Aulas em Grupo', desc: 'Spinning, Funcional, Yoga' },
              { icon: Trophy, name: 'Personal Trainer', desc: 'Acompanhamento exclusivo' },
              { icon: Calendar, name: 'Flexibilidade', desc: 'Funcionamos 7 dias' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: branding.primaryColor + '20' }}
                  >
                    <Icon className="w-7 h-7" style={{ color: branding.primaryColor }} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{feature.name}</h3>
                  <p className="text-zinc-500 text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-12">Visite-nos</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: branding.primaryColor + '20' }}
              >
                <Phone className="w-7 h-7" style={{ color: branding.primaryColor }} />
              </div>
              <p className="text-zinc-300">{business.phone}</p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: branding.primaryColor + '20' }}
              >
                <MapPin className="w-7 h-7" style={{ color: branding.primaryColor }} />
              </div>
              <p className="text-zinc-300 text-sm">{business.address}</p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: branding.primaryColor + '20' }}
              >
                <Clock className="w-7 h-7" style={{ color: branding.primaryColor }} />
              </div>
              <div className="text-zinc-300 text-sm">
                <p>Seg-Sex: {hours?.weekdays || '05:00 - 23:00'}</p>
                <p>Sáb: {hours?.saturday || '07:00 - 18:00'}</p>
                <p>Dom: {hours?.sunday || '08:00 - 14:00'}</p>
              </div>
            </div>
          </div>

          <Button 
            size="lg"
            className="text-lg px-10 py-7"
            style={{ backgroundColor: branding.primaryColor }}
            onClick={openWhatsApp}
          >
            Fale Conosco
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800 text-center">
        <p className="text-zinc-500 text-sm">
          © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
