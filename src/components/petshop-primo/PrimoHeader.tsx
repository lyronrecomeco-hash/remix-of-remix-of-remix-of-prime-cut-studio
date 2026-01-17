import { useState, useEffect } from 'react';
import { Menu, X, Phone, MapPin, Clock, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { getPrimoAppointments } from '@/components/petshop-primo/PrimoMyAppointments';

interface PrimoHeaderProps {
  onScheduleClick: () => void;
  onMyAppointmentsClick?: () => void;
}

const PrimoHeader = ({ onScheduleClick, onMyAppointmentsClick }: PrimoHeaderProps) => {
  const [hasAppointments, setHasAppointments] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAppointments = () => {
      const appointments = getPrimoAppointments();
      setHasAppointments(appointments.length > 0);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    checkAppointments();
    window.addEventListener('scroll', handleScroll);
    
    const handleStorage = () => checkAppointments();
    window.addEventListener('storage', handleStorage);
    
    const interval = setInterval(checkAppointments, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { href: '#inicio', label: 'Início' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#servicos', label: 'Serviços' },
    { href: '#galeria', label: 'Galeria' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white py-2 text-xs sm:text-sm">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center">
            <a href="https://wa.me/558130907777" className="flex items-center gap-1.5 sm:gap-2 hover:underline font-medium">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">(81) 3090-7777</span>
              <span className="xs:hidden">WhatsApp</span>
            </a>
            <div className="hidden sm:flex items-center gap-2 text-white/90">
              <Clock className="w-4 h-4" />
              <span>Seg-Sáb: 7:30h às 19h</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/90 sm:hidden">
              <Clock className="w-3.5 h-3.5" />
              <span>7:30h-19h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <motion.header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-black/5' 
            : 'bg-white'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-2 sm:gap-3 group">
              <motion.div 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xl sm:text-2xl">🐾</span>
              </motion.div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight tracking-tight">
                  PrimoPet
                </h1>
                <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold -mt-0.5 tracking-wide">
                  RECIFE
                </p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-gray-900 font-medium hover:text-emerald-600 transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-emerald-500 rounded-full group-hover:w-1/2 transition-all duration-300" />
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {hasAppointments && (
                <Button
                  variant="outline"
                  onClick={onMyAppointmentsClick}
                  size="sm"
                  className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white font-semibold rounded-xl transition-all duration-300"
                >
                  <Calendar className="w-4 h-4 mr-1.5" />
                  Agendamentos
                </Button>
              )}
              <Button
                onClick={onScheduleClick}
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Agendar
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-900 hover:bg-emerald-500/10 rounded-xl transition-colors"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 text-gray-900 font-medium py-3 px-4 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                  >
                    <span className="w-2 h-2 bg-emerald-500/30 rounded-full" />
                    {link.label}
                  </motion.a>
                ))}
                
                <div className="h-px bg-gray-100 my-3" />
                
                <div className="flex flex-col gap-2">
                  {hasAppointments && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onMyAppointmentsClick?.();
                      }}
                      className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white w-full h-12 font-semibold rounded-xl"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Meus Agendamentos
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onScheduleClick();
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold w-full h-14 text-base rounded-xl shadow-lg shadow-emerald-500/30"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Agendar Agora
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default PrimoHeader;
