import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Clock, MessageCircle, ArrowRight, Sparkles, Instagram, Star } from 'lucide-react';

interface StarpetshopContactProps {
  onScheduleClick: () => void;
}

const StarpetshopContact = ({ onScheduleClick }: StarpetshopContactProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefone',
      value: '(034) 3662-3787',
      subtitle: 'Ligue agora',
      href: 'tel:03436623787',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: Instagram,
      title: 'Instagram',
      value: '@starpetshoparaxa',
      subtitle: 'Siga-nos',
      href: 'https://www.instagram.com/starpetshoparaxa/',
      color: 'from-pink-500 to-purple-500',
    },
    {
      icon: MapPin,
      title: 'Endereço',
      value: 'R. Calimério Guimarães, 811',
      subtitle: 'Centro - Araxá, MG',
      href: 'https://www.google.com/maps/search/?api=1&query=R.+Calimério+Guimarães,+811+-+Centro,+Araxá+-+MG',
      color: 'from-rose-500 to-red-600',
    },
    {
      icon: Clock,
      title: 'Horário',
      value: 'Seg-Sex: 8h às 18h',
      subtitle: 'Sáb: 8h às 13h',
      href: null,
      color: 'from-red-600 to-rose-500',
    },
  ];

  return (
    <section id="contato" className="py-12 sm:py-20 bg-gray-900 relative overflow-hidden" ref={ref}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Contato
            </motion.span>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
              Agende uma consulta na{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">
                Star Petshop
              </span>
            </h2>
            
            <p className="text-white/70 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">
              Estamos prontos para cuidar da saúde do seu pet. 
              Entre em contato ou faça uma visita! 🦷❤️
            </p>

            {/* Contact Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {info.href ? (
                    <a 
                      href={info.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all border border-white/10 hover:border-red-500/30 group"
                    >
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${info.color} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <info.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-xs sm:text-sm truncate">{info.value}</p>
                        <p className="text-white/50 text-[10px] sm:text-xs truncate">{info.subtitle}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${info.color} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <info.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-xs sm:text-sm">{info.value}</p>
                        <p className="text-white/50 text-[10px] sm:text-xs">{info.subtitle}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onScheduleClick}
                size="lg"
                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-rose-500 hover:to-red-500 text-white font-bold h-12 sm:h-14 text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl shadow-red-500/30 hover:shadow-2xl transition-all"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Agendar Consulta
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white/20 bg-white/5 text-white hover:bg-white hover:text-gray-900 h-12 sm:h-14 text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all"
              >
                <a
                  href="https://wa.me/553436623787"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.0!2d-46.94!3d-19.59!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDM1JzI0LjAiUyA0NsKwNTYnMjQuMCJX!5e0!3m2!1spt-BR!2sbr!4v1705000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="250"
                className="sm:h-[300px]"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Star Petshop Araxá"
              />
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">Star Petshop</h3>
                    <p className="text-gray-500 text-xs sm:text-sm">Centro - Araxá, MG</p>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=R.+Calimério+Guimarães,+811+-+Centro,+Araxá+-+MG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-red-600 font-semibold text-sm hover:underline group"
                >
                  Ver rotas no Google Maps
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Decorative elements */}
            <motion.div 
              className="absolute -top-4 -right-4 text-4xl sm:text-5xl opacity-20"
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🦷
            </motion.div>
            <motion.div 
              className="absolute -bottom-4 -left-4 text-4xl sm:text-5xl opacity-20"
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            >
              🐾
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StarpetshopContact;
