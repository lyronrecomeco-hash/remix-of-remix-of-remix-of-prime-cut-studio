import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

interface PetshopContactProps {
  onScheduleClick: () => void;
}

const PetshopContact = ({ onScheduleClick }: PetshopContactProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefone',
      value: '(11) 99999-9999',
      subtitle: 'WhatsApp disponível',
    },
    {
      icon: Mail,
      title: 'E-mail',
      value: 'contato@seuxodo.com.br',
      subtitle: 'Resposta em até 24h',
    },
    {
      icon: MapPin,
      title: 'Endereço',
      value: 'Rua das Patinhas, 123',
      subtitle: 'Vila Nova - São Paulo/SP',
    },
    {
      icon: Clock,
      title: 'Horário',
      value: 'Seg a Sáb: 8h às 19h',
      subtitle: 'Domingo: 9h às 14h',
    },
  ];

  return (
    <section id="contato" className="py-20 bg-petshop-dark" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-petshop-orange/20 text-petshop-orange px-4 py-2 rounded-full text-sm font-medium mb-4">
              Contato
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Venha conhecer o{' '}
              <span className="text-petshop-orange">Seu Xodó</span> Petshop
            </h2>
            
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Estamos prontos para cuidar do seu melhor amigo com todo carinho e 
              profissionalismo. Entre em contato ou faça uma visita!
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 bg-petshop-orange/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-5 h-5 text-petshop-orange" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{info.value}</p>
                    <p className="text-white/50 text-sm">{info.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onScheduleClick}
                size="lg"
                className="bg-petshop-orange hover:bg-petshop-orange/90 text-white font-bold"
              >
                Agendar Agora
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-petshop-dark"
              >
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975941847897!2d-46.65512892467371!3d-23.561684578799747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1705000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Seu Xodó Petshop"
              />
              <div className="p-6">
                <h3 className="font-bold text-petshop-dark text-lg mb-2">
                  Seu Xodó Petshop
                </h3>
                <p className="text-petshop-gray text-sm mb-4">
                  Rua das Patinhas, 123 - Vila Nova<br />
                  São Paulo - SP, 01310-100
                </p>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=-23.5616849,-46.6551289"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-petshop-orange font-medium text-sm hover:underline"
                >
                  Ver rotas no Google Maps →
                </a>
              </div>
            </div>

            {/* Decorative paw prints */}
            <div className="absolute -top-4 -right-4 text-4xl opacity-20">🐾</div>
            <div className="absolute -bottom-4 -left-4 text-4xl opacity-20">🐾</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PetshopContact;
