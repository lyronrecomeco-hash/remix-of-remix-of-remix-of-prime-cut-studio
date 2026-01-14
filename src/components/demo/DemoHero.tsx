import { motion } from 'framer-motion';
import { Calendar, ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-barber.jpg';
import type { TemplateConfig } from '@/components/affiliate/templates/types';

interface DemoHeroProps {
  config: TemplateConfig;
}

export default function DemoHero({ config }: DemoHeroProps) {
  const handleWhatsAppClick = () => {
    const phone = config.business.whatsapp?.replace(/\D/g, '') || '';
    const message = `Olá! Gostaria de agendar um horário na ${config.business.name}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${config.business.phone}`;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      
      {/* Glow effect with custom color */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ backgroundColor: `${config.branding.primaryColor}15` }}
      />

      <div className="relative z-10 container mx-auto max-w-4xl text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span 
            className="inline-block px-4 py-2 mb-6 text-sm font-medium rounded-full border"
            style={{ 
              color: config.branding.primaryColor,
              backgroundColor: `${config.branding.primaryColor}15`,
              borderColor: `${config.branding.primaryColor}30`
            }}
          >
            ✂️ {config.business.slogan || 'Experiência Premium'}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white"
          style={{ fontFamily: config.typography.headingFont }}
        >
          {config.business.name || 'Seu Negócio'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
        >
          {config.business.slogan || 'Técnica refinada, ambiente sofisticado e atendimento personalizado.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            size="lg"
            onClick={handleWhatsAppClick}
            className="text-white"
            style={{ backgroundColor: config.branding.primaryColor }}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Horário
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={handlePhoneClick}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Ligar Agora
          </Button>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-400"
        >
          {config.business.phone && (
            <span>📞 {config.business.phone}</span>
          )}
          {config.business.address && (
            <span>📍 {config.business.address}</span>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: config.branding.primaryColor }}
          />
        </div>
      </motion.div>
    </section>
  );
}
