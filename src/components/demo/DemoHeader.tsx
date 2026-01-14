import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Menu, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TemplateConfig } from '@/components/affiliate/templates/types';

interface DemoHeaderProps {
  config: TemplateConfig;
}

const navLinks = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#contato', label: 'Contato' },
];

export default function DemoHeader({ config }: DemoHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const phone = config.business.whatsapp?.replace(/\D/g, '') || '';
    const message = `Olá! Gostaria de agendar um horário na ${config.business.name}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto max-w-6xl flex items-center justify-between h-16 md:h-20 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${config.branding.primaryColor}20` }}
            >
              <Scissors className="w-4 h-4" style={{ color: config.branding.primaryColor }} />
            </div>
            <span 
              className="text-lg font-bold"
              style={{ fontFamily: config.typography.headingFont }}
            >
              {config.business.name || 'Meu Negócio'}
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleWhatsAppClick}
              className="hidden sm:flex"
              style={{ 
                backgroundColor: config.branding.primaryColor,
                color: '#fff'
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-secondary"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-background/98 backdrop-blur-lg border-b border-border md:hidden"
          >
            <nav className="container py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {link.label}
                </a>
              ))}
              <Button 
                onClick={handleWhatsAppClick}
                className="mt-2"
                style={{ 
                  backgroundColor: config.branding.primaryColor,
                  color: '#fff'
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Agora
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
