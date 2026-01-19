import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Heart, Star, Shield, ArrowRight, Sparkles, Play, 
  Phone, MapPin, Clock, Instagram, MessageCircle,
  Scissors, Bath, Stethoscope, Home
} from 'lucide-react';
import heroBg from '@/assets/petshop/hero-dog-bath.jpg';

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

interface DynamicPetshopProps {
  config: TemplateConfig;
}

export default function DynamicPetshop({ config }: DynamicPetshopProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  
  const { business, branding, features, social, hours } = config;
  const primaryColor = branding.primaryColor || '#F97316';
  
  const services = [
    { icon: Bath, title: 'Banho & Tosa', description: 'Cuidado completo para seu pet', price: 'A partir de R$ 50' },
    { icon: Scissors, title: 'Tosa Higiênica', description: 'Higiene e conforto', price: 'A partir de R$ 30' },
    { icon: Stethoscope, title: 'Veterinária', description: 'Consultas e vacinas', price: 'Consulte' },
    { icon: Home, title: 'Hospedagem', description: 'Seu pet em boas mãos', price: 'A partir de R$ 80/dia' },
  ];

  const handleWhatsApp = () => {
    const phone = business.whatsapp?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(`Olá! Vim pelo site e gostaria de agendar um serviço.`);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                🐾
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{business.name || 'Pet Shop'}</h1>
                <p className="text-xs text-gray-500">{business.slogan || 'Cuidando com amor'}</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#inicio" className="text-sm text-gray-600 hover:text-gray-900">Início</a>
              <a href="#servicos" className="text-sm text-gray-600 hover:text-gray-900">Serviços</a>
              <a href="#contato" className="text-sm text-gray-600 hover:text-gray-900">Contato</a>
            </nav>
            
            <Button 
              onClick={handleWhatsApp}
              className="text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="inicio" className="relative min-h-[100svh] flex items-center pt-16">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.4), transparent)` 
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 text-white"
                style={{ backgroundColor: `${primaryColor}33`, border: `1px solid ${primaryColor}66` }}
              >
                🐾 {business.slogan || 'Cuidando com amor'}
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Cuidado e carinho<br />
                que seu <span style={{ color: primaryColor }}>pet</span> merece
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
                Banho, tosa, veterinária e hospedagem com{' '}
                <span style={{ color: primaryColor }} className="font-semibold">
                  amor e profissionalismo
                </span>. Seu pet é da família!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  onClick={handleWhatsApp}
                  size="lg"
                  className="text-white font-bold text-lg px-8 h-14 rounded-2xl shadow-2xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                    boxShadow: `0 10px 40px ${primaryColor}50`
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Agendar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-gray-900 font-semibold text-lg px-8 h-14 rounded-2xl"
                  asChild
                >
                  <a href="#servicos">
                    <Play className="w-4 h-4 mr-2" />
                    Ver Serviços
                  </a>
                </Button>
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Heart, text: 'Amor pelos pets', color: 'from-pink-500 to-rose-500' },
                  { icon: Star, text: 'Profissionais top', color: 'from-amber-500 to-orange-500' },
                  { icon: Shield, text: 'Segurança total', color: 'from-emerald-500 to-green-500' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center`}>
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-white/90 text-sm">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossos <span style={{ color: primaryColor }}>Serviços</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Oferecemos os melhores cuidados para o seu pet, com profissionais qualificados e muito amor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <service.icon className="w-7 h-7" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <p className="font-semibold" style={{ color: primaryColor }}>{service.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contato" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Entre em <span style={{ color: primaryColor }}>Contato</span>
              </h2>
              <p className="text-gray-600">
                Estamos prontos para cuidar do seu melhor amigo!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Phone className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Telefone</h3>
                <p className="text-gray-600">{business.phone || '(00) 0000-0000'}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Endereço</h3>
                <p className="text-gray-600 text-sm">{business.address || 'Endereço não informado'}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Clock className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Horário</h3>
                <p className="text-gray-600 text-sm">
                  {hours?.weekdays || 'Seg-Sex: 8h às 18h'}<br />
                  {hours?.saturday || 'Sáb: 8h às 14h'}
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={handleWhatsApp}
                size="lg"
                className="text-white font-bold text-lg px-10 h-14 rounded-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                  boxShadow: `0 10px 40px ${primaryColor}40`
                }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Fale Conosco no WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                🐾
              </div>
              <div>
                <h3 className="font-bold">{business.name || 'Pet Shop'}</h3>
                <p className="text-sm text-gray-400">{business.slogan || 'Cuidando com amor'}</p>
              </div>
            </div>

            {social?.instagram && (
              <a 
                href={`https://instagram.com/${social.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
                {social.instagram}
              </a>
            )}

            <p className="text-sm text-gray-500">
              Desenvolvido por <span style={{ color: primaryColor }}>Genesis IA</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
