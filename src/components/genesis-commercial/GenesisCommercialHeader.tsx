import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Menu, X, Sparkles, ArrowRight, Bot, 
  Zap, Shield, Users, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Parcerias', href: '#parcerias' },
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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled 
            ? "bg-slate-950/90 backdrop-blur-2xl border-b border-cyan-500/10 shadow-2xl shadow-cyan-500/5" 
            : "bg-transparent"
        )}
      >
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-18 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              <div>
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                  Genesis
                </span>
                <span className="text-xs font-medium text-cyan-400/80 block -mt-0.5 tracking-widest uppercase">
                  Inteligência Artificial
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-all rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex text-slate-300 hover:text-white hover:bg-white/5"
                asChild
              >
                <Link to="/genesis/login">Entrar</Link>
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="sm" 
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 border-0 px-6 font-semibold"
                  asChild
                >
                  <Link to="/genesis">
                    <span className="hidden sm:inline">Começar Agora</span>
                    <span className="sm:hidden">Começar</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
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
            className="fixed inset-x-0 top-18 z-40 bg-slate-950/98 backdrop-blur-2xl border-b border-cyan-500/10 lg:hidden"
          >
            <nav className="container px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="flex items-center gap-3 px-5 py-4 text-base font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left border border-transparent hover:border-white/10"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t border-white/10 mt-2">
                <Button asChild className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-6 text-base font-semibold">
                  <Link to="/genesis">
                    Começar Agora
                    <ArrowRight className="w-5 h-5" />
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
