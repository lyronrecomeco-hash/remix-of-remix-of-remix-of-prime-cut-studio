import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Menu, X, Zap, ArrowRight, Bot, 
  BarChart3, GitBranch, Building2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Recursos', href: '#recursos', icon: Zap },
  { label: 'Flow Builder', href: '#flow', icon: GitBranch },
  { label: 'Agentes IA', href: '#agentes-ia', icon: Bot },
  { label: 'Empresas', href: '#empresas', icon: Building2 },
  { label: 'Preços', href: '#precos', icon: BarChart3 },
];

const VendaHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg" 
            : "bg-transparent"
        )}
      >
        <div className="container px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  Genesis
                </span>
                <span className="text-xs text-muted-foreground block -mt-1">by Luna IA</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
                asChild
              >
                <Link to="/login">Entrar</Link>
              </Button>
              <Button 
                size="sm" 
                className="gap-2 shadow-lg shadow-primary/30"
                asChild
              >
                <Link to="/genesis">
                  Começar Grátis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            className="fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 lg:hidden"
          >
            <nav className="container px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t border-border/50">
                <Button asChild className="w-full gap-2">
                  <Link to="/genesis">
                    Começar Grátis
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

export default VendaHeader;
