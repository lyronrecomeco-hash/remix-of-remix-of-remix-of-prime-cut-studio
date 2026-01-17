import { useState, useEffect } from 'react';
import { Menu, X, Phone, MapPin, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { getAppointments } from './PetshopMyAppointments';

interface PetshopHeaderProps {
  onScheduleClick: () => void;
  onMyAppointmentsClick?: () => void;
}

const PetshopHeader = ({ onScheduleClick, onMyAppointmentsClick }: PetshopHeaderProps) => {
  const [hasAppointments, setHasAppointments] = useState(false);

  useEffect(() => {
    const checkAppointments = () => {
      const appointments = getAppointments();
      setHasAppointments(appointments.length > 0);
    };

    checkAppointments();
    
    // Listen for storage changes (when appointments are added/removed)
    const handleStorage = () => checkAppointments();
    window.addEventListener('storage', handleStorage);
    
    // Also check periodically in case localStorage changes in same tab
    const interval = setInterval(checkAppointments, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="bg-petshop-orange text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="https://wa.me/5581998409073" className="flex items-center gap-2 hover:underline">
              <Phone className="w-4 h-4" />
              (81) 99840-9073
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Estr. de Belém, 1273 - Campo Grande, Recife
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Seg a Sáb: 8h às 19h
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-2">
              <div className="w-12 h-12 bg-petshop-orange rounded-full flex items-center justify-center">
                <span className="text-2xl">🐾</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-petshop-dark leading-tight">
                  Seu Xodó
                </h1>
                <p className="text-xs text-petshop-orange font-medium -mt-1">
                  Petshop & Veterinária
                </p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-petshop-dark font-medium hover:text-petshop-orange transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {hasAppointments && (
                <Button
                  variant="outline"
                  onClick={onMyAppointmentsClick}
                  className="border-petshop-orange text-petshop-orange hover:bg-petshop-orange hover:text-white"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Meus Agendamentos
                </Button>
              )}
              <Button
                onClick={onScheduleClick}
                className="bg-petshop-orange hover:bg-petshop-orange/90 text-white font-semibold px-6"
              >
                Agendar Agora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-petshop-dark"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="lg:hidden bg-white border-t"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-petshop-dark font-medium py-2 hover:text-petshop-orange transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                {hasAppointments && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onMyAppointmentsClick?.();
                    }}
                    className="border-petshop-orange text-petshop-orange hover:bg-petshop-orange hover:text-white w-full"
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
                  className="bg-petshop-orange hover:bg-petshop-orange/90 text-white font-semibold w-full"
                >
                  Agendar Agora
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default PetshopHeader;
