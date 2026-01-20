import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, Bot, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como Funciona', href: '#parcerias' },
  { label: 'Planos', href: '#planos' },
];

const GenesisCommercialHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500",
          "w-auto max-w-3xl"
        )}
      >
        {/* Mac-style floating menu */}
        <div className={cn(
          "flex items-center justify-center gap-1 px-2 py-2 rounded-full transition-all duration-300",
          "bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/20"
        )}>
          {/* Logo - compact */}
          <Link to="/" className="flex items-center gap-2 px-3 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            </div>
            <span className="text-sm font-bold text-foreground hidden sm:block">
              Genesis
            </span>
          </Link>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1 hidden md:block" />

          {/* Nav Links - Mac style */}
          <nav className="hidden md:flex items-center">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1 hidden md:block" />

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 pl-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground text-sm px-3"
              asChild
            >
              <Link to="/genesis/login">Entrar</Link>
            </Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 px-4 text-sm font-semibold rounded-full"
              asChild
            >
              <Link to="/genesis" className="flex items-center gap-1.5">
                <span>Assinar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground w-8 h-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-20 z-40 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl md:hidden"
          >
            <nav className="p-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors text-left"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-border mt-2">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  <Link to="/genesis" className="flex items-center justify-center gap-2">
                    Assinar Agora
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GenesisCommercialHeader;
