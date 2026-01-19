import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, Stethoscope, Heart, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    { icon: Stethoscope, text: 'Atendimento Veterinário', color: 'text-red-500' },
    { icon: Heart, text: 'Odontologia Especializada', color: 'text-rose-500' },
    { icon: Calendar, text: 'Agendamento Online', color: 'text-red-600' },
    { icon: Star, text: '+14 Anos de Experiência', color: 'text-amber-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md m-0 sm:m-4 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button onClick={handleClose} className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="px-5 pb-6 pt-4 sm:p-6">
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-semibold rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  DEMONSTRAÇÃO
                </span>
              </div>

              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">Star Petshop</span> Araxá
                </h2>
                <p className="text-gray-600 text-xs">Demo interativa do sistema de agendamento</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                    <div className={`p-1.5 rounded-lg bg-white ${feature.color}`}>
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Especialista em saúde animal! 🦷</p>
                    <p className="text-gray-600 text-xs mt-0.5">Atendimento veterinário completo e odontologia.</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full py-5 font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl">
                Explorar a Demo
              </Button>

              <p className="text-center text-xs text-gray-400 mt-3">Desenvolvido por Genesis IA</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StarpetshopDemoModal;
