import { motion } from 'framer-motion';
import { Calendar, Heart, Shield, Star, ChevronDown, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StarpetshopHeroProps {
  onScheduleClick: () => void;
}

const StarpetshopHero = ({ onScheduleClick }: StarpetshopHeroProps) => {
  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800" />
      
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Animated circles */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5 }}
        className="absolute -right-40 -top-40 w-[600px] h-[600px] rounded-full bg-white"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.05 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute -left-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-white"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Star className="w-5 h-5 text-yellow-300" fill="currentColor" />
              <span className="text-sm font-medium">Referência em Araxá desde 2010</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Especialista em{' '}
              <span className="text-yellow-300">Saúde</span> e{' '}
              <span className="text-yellow-300">Bem-Estar</span>{' '}
              Animal
            </h1>

            <p className="text-xl text-red-100 mb-8 max-w-xl">
              Atendimento veterinário completo com especialidade em odontologia. 
              Cuide do sorriso e da saúde do seu pet com quem entende do assunto.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                onClick={onScheduleClick}
                size="lg"
                className="bg-white text-red-700 hover:bg-red-50 font-semibold text-lg px-8 py-6 shadow-xl"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Consulta
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-8 py-6"
                onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                Nossos Serviços
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Stethoscope, label: 'Veterinário', sublabel: 'Clínica Geral' },
                { icon: Heart, label: 'Odontologia', sublabel: 'Especializada' },
                { icon: Shield, label: 'Confiança', sublabel: '+14 anos' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                >
                  <item.icon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-red-200">{item.sublabel}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[500px]">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 bg-gradient-to-tl from-yellow-400/20 to-transparent rounded-3xl transform -rotate-3" />
              
              {/* Main card */}
              <div className="absolute inset-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                    <Star className="w-16 h-16 text-red-600" fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">OdontoVet</h3>
                  <p className="text-red-200 mb-4">Clínica Veterinária Odontológica</p>
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-white/80 mt-2">+500 sorrisos cuidados</p>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -right-4 top-20 bg-white rounded-xl p-4 shadow-xl"
              >
                <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -left-4 bottom-20 bg-white rounded-xl p-4 shadow-xl"
              >
                <Stethoscope className="w-8 h-8 text-red-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-white/60" />
        </motion.div>
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default StarpetshopHero;
