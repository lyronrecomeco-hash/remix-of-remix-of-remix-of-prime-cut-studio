import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Instagram, Facebook, Star, Scissors, Calendar } from 'lucide-react';
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

interface DynamicBarbeariaProps {
  config: TemplateConfig;
}

export default function DynamicBarbearia({ config }: DynamicBarbeariaProps) {
  const { business, branding, features, social, hours } = config;

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Olá! Gostaria de agendar um horário na ${business.name}`);
    window.open(`https://wa.me/${business.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        '--primary-color': branding.primaryColor,
        '--secondary-color': branding.secondaryColor,
        backgroundColor: '#0a0a0a',
        color: '#ffffff'
      } as React.CSSProperties}
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${branding.primaryColor}, transparent 70%)`
          }}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 max-w-4xl mx-auto"
        >
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <Scissors className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {business.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            {business.slogan || 'Estilo e elegância em cada corte'}
          </p>

          {features.showScheduling && (
            <Button 
              onClick={openWhatsApp}
              size="lg"
              className="text-lg px-8 py-6"
              style={{ 
                backgroundColor: branding.primaryColor,
                color: '#ffffff'
              }}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Horário
            </Button>
          )}
        </motion.div>
      </section>

      {/* Services Section */}
      {features.showPricing && (
        <section className="py-20 px-4" style={{ backgroundColor: '#111' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Nossos Serviços</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Corte Masculino', price: 'R$ 45', desc: 'Corte tradicional ou moderno' },
                { name: 'Barba', price: 'R$ 30', desc: 'Modelagem e acabamento' },
                { name: 'Corte + Barba', price: 'R$ 65', desc: 'Combo completo' },
              ].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{service.desc}</p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: branding.primaryColor }}
                  >
                    {service.price}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {features.showTeam && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Nossa Equipe</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Carlos', role: 'Barbeiro Senior', rating: 4.9 },
                { name: 'André', role: 'Barbeiro', rating: 4.8 },
                { name: 'Lucas', role: 'Barbeiro', rating: 4.7 },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div 
                    className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl font-bold"
                    style={{ backgroundColor: branding.primaryColor + '20', color: branding.primaryColor }}
                  >
                    {member.name[0]}
                  </div>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{member.role}</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm">{member.rating}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 px-4" style={{ backgroundColor: '#111' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Contato</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: branding.primaryColor + '20' }}
              >
                <Phone className="w-6 h-6" style={{ color: branding.primaryColor }} />
              </div>
              <p className="text-gray-300">{business.phone}</p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: branding.primaryColor + '20' }}
              >
                <MapPin className="w-6 h-6" style={{ color: branding.primaryColor }} />
              </div>
              <p className="text-gray-300 text-sm">{business.address}</p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: branding.primaryColor + '20' }}
              >
                <Clock className="w-6 h-6" style={{ color: branding.primaryColor }} />
              </div>
              <div className="text-gray-300 text-sm">
                <p>Seg-Sex: {hours?.weekdays || '09:00 - 19:00'}</p>
                <p>Sáb: {hours?.saturday || '09:00 - 17:00'}</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {(social?.instagram || social?.facebook) && (
            <div className="flex justify-center gap-4">
              {social?.instagram && (
                <a 
                  href={`https://instagram.com/${social.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-700 hover:border-gray-500 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {social?.facebook && (
                <a 
                  href={social.facebook.startsWith('http') ? social.facebook : `https://facebook.com/${social.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-700 hover:border-gray-500 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
