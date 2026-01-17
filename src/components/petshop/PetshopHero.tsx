import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Star, Shield, ArrowRight } from 'lucide-react';
import heroBg from '@/assets/petshop/hero-dog-bath.jpg';

interface PetshopHeroProps {
  onScheduleClick: () => void;
}

const PetshopHero = ({ onScheduleClick }: PetshopHeroProps) => {
  const features = [
    { icon: Heart, text: 'Amor pelos pets' },
    { icon: Star, text: 'Profissionais qualificados' },
    { icon: Shield, text: 'Segurança garantida' },
  ];

  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Pet Shop Seu Xodó"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-petshop-dark/90 via-petshop-dark/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-petshop-orange/20 text-petshop-orange px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="text-lg">🐾</span>
              Bem-vindo ao Seu Xodó Petshop
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Cuidado e carinho que seu{' '}
              <span className="text-petshop-orange">xodó</span> merece
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              Oferecemos os melhores serviços de banho, tosa, veterinária e hospedagem 
              para o seu melhor amigo. Porque seu pet é da família!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                onClick={onScheduleClick}
                size="lg"
                className="bg-petshop-orange hover:bg-petshop-orange/90 text-white font-bold text-lg px-8 py-6 group"
              >
                Agendar Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-petshop-dark font-semibold text-lg px-8 py-6"
                asChild
              >
                <a href="#servicos">Ver Serviços</a>
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 text-white/90"
                >
                  <div className="w-10 h-10 bg-petshop-orange/20 rounded-full flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-petshop-orange" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="white"
            d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default PetshopHero;
