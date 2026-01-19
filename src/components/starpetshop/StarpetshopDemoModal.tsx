import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Stethoscope, Heart, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StarpetshopDemoModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenDemo = localStorage.getItem('starpetshop_demo_seen');
    if (!hasSeenDemo) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('starpetshop_demo_seen', 'true');
    setIsOpen(false);
  };

  const features = [
    { icon: Stethoscope, text: 'Atendimento veterinário completo' },
    { icon: Heart, text: 'Odontologia veterinária especializada' },
    { icon: Calendar, text: 'Agendamento online simplificado' },
    { icon: Shield, text: 'Mais de 14 anos de experiência' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 relative text-center">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Star className="w-10 h-10 text-red-600" fill="currentColor" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Bem-vindo à Star Petshop!
              </h2>
              <p className="text-red-100">
                Especialista em saúde e bem-estar animal
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 text-center mb-6">
                Este é um site demonstrativo do sistema de agendamento automatizado 
                para clínicas veterinárias. Explore todas as funcionalidades!
              </p>

              <div className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-red-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">100% Funcional</p>
                    <p className="text-sm text-green-600">
                      Teste o agendamento completo. Os dados ficam salvos no seu navegador.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                Explorar o Site
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StarpetshopDemoModal;
