import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle, BarChart3, Calendar, Bot, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import starpetshopLogo from '@/assets/starpetshop/logo-transparent-2.png';

const StarpetshopDemoModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenDemo = localStorage.getItem('starpetshop_demo_seen');
    if (!hasSeenDemo) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('starpetshop_demo_seen', 'true');
  };

  const features = [
    { icon: Bot, text: 'Automação WhatsApp com IA', color: 'text-green-500' },
    { icon: Calendar, text: 'Agendamento Online Inteligente', color: 'text-blue-500' },
    { icon: BarChart3, text: 'Painel CRM Completo', color: 'text-purple-500' },
    { icon: MessageCircle, text: 'Confirmações Automáticas', color: 'text-red-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md m-0 sm:m-4 bg-gradient-to-br from-white via-white to-red-50 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overscroll-contain"
          >
            {/* Drag indicator for mobile */}
            <div className="sticky top-0 pt-3 pb-2 bg-gradient-to-br from-white via-white to-red-50 sm:hidden z-10">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Content */}
            <div className="relative px-5 pb-6 pt-2 sm:p-6">
              {/* Badge */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  DEMONSTRAÇÃO EXCLUSIVA
                </span>
              </div>

              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img 
                  src={starpetshopLogo} 
                  alt="Star Petshop" 
                  className="h-28 sm:h-36 w-auto object-contain" 
                />
              </div>

              {/* Title */}
              <div className="text-center mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">Star Petshop</span> Araxá
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed px-2">
                  Especialista em saúde e bem estar animal
                </p>
              </div>

              {/* Features - 2 columns on mobile */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2.5 sm:p-3 bg-white/80 rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-gray-50 ${feature.color} flex-shrink-0`}>
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] sm:text-sm font-medium text-gray-700 leading-tight">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Highlight box */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 border border-red-100">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      Sistema completo pronto para usar!
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">
                      Agende consultas veterinárias e odontológicas, receba confirmações no WhatsApp e gerencie tudo em um só lugar.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleClose}
                className="w-full py-5 sm:py-6 text-sm sm:text-base font-bold bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl sm:rounded-2xl shadow-xl shadow-red-500/25 transition-all duration-300 active:scale-[0.98]"
              >
                Explorar a Demo
              </Button>

              {/* Footer note */}
              <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-3">
                Desenvolvido por Genesis IA • Automação Inteligente
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StarpetshopDemoModal;
