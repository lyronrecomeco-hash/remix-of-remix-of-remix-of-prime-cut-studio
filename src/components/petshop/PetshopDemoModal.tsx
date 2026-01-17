import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle, BarChart3, Calendar, Bot, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PetshopDemoModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenDemo = localStorage.getItem('petshop_demo_seen');
    if (!hasSeenDemo) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('petshop_demo_seen', 'true');
  };

  const features = [
    { icon: Bot, text: 'Automação WhatsApp com IA', color: 'text-green-500' },
    { icon: Calendar, text: 'Agendamento Online Inteligente', color: 'text-blue-500' },
    { icon: BarChart3, text: 'Painel CRM Completo', color: 'text-purple-500' },
    { icon: MessageCircle, text: 'Confirmações Automáticas', color: 'text-orange-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-orange-50 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Content */}
            <div className="relative p-6 sm:p-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  DEMONSTRAÇÃO EXCLUSIVA
                </span>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Petshop <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Seu Xodó</span>
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Esta é uma demo interativa do sistema completo de gestão para petshops
                </p>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gray-50 ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Highlight box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-4 mb-6 border border-orange-100"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      Sistema completo pronto para usar!
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      Agende serviços, receba confirmações no WhatsApp e gerencie tudo em um só lugar.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  onClick={handleClose}
                  className="w-full py-6 text-base font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl shadow-xl shadow-orange-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
                >
                  Explorar a Demo
                </Button>
              </motion.div>

              {/* Footer note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-xs text-gray-400 mt-4"
              >
                Desenvolvido por Genesis IA • Automação Inteligente
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PetshopDemoModal;
