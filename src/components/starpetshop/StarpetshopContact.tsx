import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Phone, MapPin, Clock, Instagram, MessageCircle, Calendar, Star, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StarpetshopContactProps {
  onScheduleClick: () => void;
}

const StarpetshopContact = ({ onScheduleClick }: StarpetshopContactProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefone',
      content: '(034) 3662-3787',
      link: 'tel:03436623787',
      color: 'bg-red-500',
    },
    {
      icon: MapPin,
      title: 'Endereço',
      content: 'R. Calimério Guimarães, 811 - Centro, Araxá - MG, 38183-184',
      link: 'https://maps.google.com/?q=R.+Calimério+Guimarães,+811+-+Centro,+Araxá+-+MG',
      color: 'bg-red-600',
    },
    {
      icon: Clock,
      title: 'Horário',
      content: 'Seg-Sex: 8h-18h | Sáb: 8h-13h',
      color: 'bg-red-700',
    },
    {
      icon: Instagram,
      title: 'Instagram',
      content: '@starpetshoparaxa',
      link: 'https://www.instagram.com/starpetshoparaxa/',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    },
  ];

  return (
    <section id="contato" className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-red-600 font-semibold mb-4">
            <MessageCircle className="w-5 h-5" />
            CONTATO
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fale Conosco
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estamos prontos para atender você e seu pet. Entre em contato ou visite nossa clínica.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{info.title}</h4>
                  {info.link ? (
                    <a
                      href={info.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-red-600 transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-gray-600">{info.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                onClick={onScheduleClick}
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Consulta
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => window.open('https://wa.me/553436623787', '_blank')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.2547!2d-46.9408!3d-19.5897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDM1JzIzLjAiUyA0NsKwNTYnMjcuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Star Petshop"
              />
            </div>
            
            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" fill="white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Star Petshop</h4>
                  <p className="text-sm text-gray-600">Centro, Araxá - MG</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StarpetshopContact;
