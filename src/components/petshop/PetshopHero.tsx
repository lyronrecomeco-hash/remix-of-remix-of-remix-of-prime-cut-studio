import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Star, Shield, ArrowRight, Sparkles, Play } from 'lucide-react';
import heroBg from '@/assets/petshop/hero-dog-bath.jpg';

interface PetshopHeroProps {
  onScheduleClick: () => void;
}

const PetshopHero = ({ onScheduleClick }: PetshopHeroProps) => {
  const features = [
    { icon: Heart, text: 'Amor pelos pets', color: 'from-pink-500 to-rose-500' },
    { icon: Star, text: 'Profissionais top', color: 'from-amber-500 to-orange-500' },
    { icon: Shield, text: 'Segurança total', color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <section id="inicio" className="relative min-h-[100svh] sm:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <motion.img
          src={heroBg}
          alt="Pet Shop Seu Xodó"
          className="w-full h-full object-cover object-center"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        {/* Gradient overlay for mobile readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-petshop-dark/80 via-petshop-dark/60 to-petshop-dark/90 sm:bg-gradient-to-r sm:from-petshop-dark/95 sm:via-petshop-dark/70 sm:to-transparent" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-petshop-orange/30 rounded-full"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-8 sm:py-0">
        <div className="max-w-2xl mx-auto sm:mx-0 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <motion.span 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.span 
                className="text-base sm:text-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🐾
              </motion.span>
              <span className="hidden sm:inline">Bem-vindo ao</span> Seu Xodó Petshop
            </motion.span>

            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-4 sm:mb-6">
              Cuidado e carinho
              <br />
              que seu{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-petshop-orange via-orange-400 to-amber-400">
                  xodó
                </span>
                <motion.svg 
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" 
                  height="8" 
                  viewBox="0 0 100 8" 
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <motion.path 
                    d="M2 6C25 2 75 2 98 6" 
                    stroke="url(#gradient)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#FCD34D" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
              {' '}merece
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto sm:mx-0">
              Banho, tosa, veterinária e hospedagem com <span className="text-petshop-orange font-semibold">amor e profissionalismo</span>. 
              Seu pet é da família!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10">
              <Button
                onClick={onScheduleClick}
                size="lg"
                className="bg-gradient-to-r from-petshop-orange via-orange-500 to-amber-500 hover:from-amber-500 hover:via-orange-500 hover:to-petshop-orange text-white font-bold text-base sm:text-lg px-6 sm:px-8 h-14 sm:h-16 rounded-2xl shadow-2xl shadow-petshop-orange/40 group transition-all duration-500 hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Agendar Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-petshop-dark font-semibold text-base sm:text-lg px-6 sm:px-8 h-14 sm:h-16 rounded-2xl transition-all duration-300"
                asChild
              >
                <a href="#servicos" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Ver Serviços
                </a>
              </Button>
            </div>

            {/* Features - Mobile optimized grid */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-full px-2 sm:px-4 py-3 sm:py-2 border border-white/10"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${feature.color} rounded-lg sm:rounded-full flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="font-medium text-white/90 text-[10px] sm:text-sm text-center sm:text-left leading-tight">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-16 sm:h-auto" preserveAspectRatio="none">
          <path
            fill="white"
            d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-white/60 text-xs font-medium">Role para baixo</span>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <motion.div 
            className="w-1.5 h-1.5 bg-petshop-orange rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default PetshopHero;
