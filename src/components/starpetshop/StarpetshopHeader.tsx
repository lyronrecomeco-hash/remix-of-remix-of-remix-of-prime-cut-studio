import { useState, useEffect } from 'react';
import { Menu, X, Phone, Clock, Calendar, Star, Instagram, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface StarpetshopHeaderProps {
  onScheduleClick: () => void;
  onMyAppointmentsClick?: () => void;
}

const StarpetshopHeader = ({ onScheduleClick, onMyAppointmentsClick }: StarpetshopHeaderProps) => {
  const [hasAppointments, setHasAppointments] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAppointments = () => {
      const stored = localStorage.getItem('starpetshop_appointments');
      if (stored) {
        const appointments = JSON.parse(stored);
        setHasAppointments(appointments.length > 0);
      }
    };

    checkAppointments();
    const interval = setInterval(checkAppointments, 1000);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Início', href: '#inicio' },
    { name: 'Sobre', href: '#sobre' },
    { name: 'Serviços', href: '#servicos' },
    { name: 'Galeria', href: '#galeria' },
    { name: 'Contato', href: '#contato' },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="bg-red-700 text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:03436623787" className="flex items-center gap-2 hover:text-red-200 transition-colors">
              <Phone className="w-4 h-4" />
              <span>(034) 3662-3787</span>
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>R. Calimério Guimarães, 811 - Centro, Araxá - MG</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Seg-Sex: 8h às 18h | Sáb: 8h às 13h</span>
            </div>
            <a 
              href="https://www.instagram.com/starpetshoparaxa/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-red-200 transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-md'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white" fill="white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-red-600">Star</span>
                <span className="text-2xl font-bold text-gray-800"> Petshop</span>
                <p className="text-xs text-gray-500 -mt-1">Especialista em saúde animal</p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-red-600 transition-colors font-medium relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {hasAppointments && onMyAppointmentsClick && (
                <Button
                  variant="outline"
                  onClick={onMyAppointmentsClick}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Meus Agendamentos
                </Button>
              )}
              <Button
                onClick={onScheduleClick}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t"
            >
              <div className="container mx-auto px-4 py-4">
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-gray-700 hover:text-red-600 transition-colors font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  ))}
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    {hasAppointments && onMyAppointmentsClick && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          onMyAppointmentsClick();
                          setIsMenuOpen(false);
                        }}
                        className="border-red-600 text-red-600 w-full"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Meus Agendamentos
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        onScheduleClick();
                        setIsMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white w-full"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Consulta
                    </Button>
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default StarpetshopHeader;
