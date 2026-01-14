import { useEffect, useState, useRef } from 'react';
import { useParams, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  Scissors, 
  Menu, 
  X, 
  Calendar, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle,
  Instagram,
  Facebook
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { TemplateConfig } from '@/components/affiliate/templates/types';
import heroImage from '@/assets/hero-barber.jpg';
import About from '@/components/landing/About';
import Services from '@/components/landing/Services';
import Gallery from '@/components/landing/Gallery';
import Testimonials from '@/components/landing/Testimonials';

interface TemplateConfigData {
  id: string;
  template_slug: string;
  template_name: string;
  config: TemplateConfig;
  views_count: number;
}

export default function DemoPage() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [configData, setConfigData] = useState<TemplateConfigData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!code) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('affiliate_template_configs')
          .select('id, template_slug, template_name, config, views_count')
          .eq('unique_code', code)
          .eq('is_active', true)
          .single();

        if (fetchError || !data) {
          console.error('Erro ao buscar configuração:', fetchError);
          setError(true);
          setLoading(false);
          return;
        }

        // Incrementar contador de visualizações
        supabase
          .from('affiliate_template_configs')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', data.id)
          .then(() => {});

        setConfigData({
          ...data,
          config: data.config as unknown as TemplateConfig
        });
      } catch (err) {
        console.error('Erro:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [code]);

  // Aplicar estilos customizados via CSS variables
  useEffect(() => {
    if (!configData?.config) return;

    const config = configData.config;
    const root = document.documentElement;
    
    // Converter hex para HSL
    const hexToHSL = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return '';
      
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Aplicar cores
    if (config.branding.primaryColor) {
      root.style.setProperty('--primary', hexToHSL(config.branding.primaryColor));
    }
    if (config.branding.secondaryColor) {
      root.style.setProperty('--secondary', hexToHSL(config.branding.secondaryColor));
    }
    if (config.branding.accentColor) {
      root.style.setProperty('--accent', hexToHSL(config.branding.accentColor));
    }

    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
    };
  }, [configData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !configData) {
    return <Navigate to="/404" replace />;
  }

  const config = configData.config;

  // Renderizar o template completo com dados personalizados
  return (
    <div className="min-h-screen bg-background">
      <DemoHeader config={config} />
      <DemoHero config={config} />
      <About />
      {config.features.showPricing && <Services />}
      {config.features.showGallery && <Gallery />}
      <Testimonials />
      <DemoLocation config={config} />
      <DemoCTA config={config} />
      <DemoFooter config={config} />
    </div>
  );
}

// ========== Componentes Demo Customizados ==========

function DemoHeader({ config }: { config: TemplateConfig }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#sobre', label: 'Sobre' },
    { href: '#servicos', label: 'Serviços' },
    { href: '#galeria', label: 'Galeria' },
    { href: '#localizacao', label: 'Localização' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="container-narrow flex items-center justify-between h-16 md:h-20 px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold hidden sm:inline">
              {config.business.name || 'Meu Negócio'}
            </span>
          </div>

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

          <div className="flex items-center gap-2">
            <Button asChild variant="hero" size="sm" className="hidden sm:flex">
              <Link to="/agendar">
                <Calendar className="w-4 h-4" />
                Agendar
              </Link>
            </Button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-secondary"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

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
              <Button asChild variant="hero" size="lg" className="mt-2">
                <Link to="/agendar" onClick={() => setIsMobileMenuOpen(false)}>
                  <Calendar className="w-4 h-4" />
                  Agendar Agora
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DemoHero({ config }: { config: TemplateConfig }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-dark" />
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />

      <div className="relative z-10 container-narrow text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full border border-primary/20">
            ✂️ {config.business.slogan || 'Experiência Premium em Barbearia'}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          {config.business.name || 'Seu visual merece'}
          <br />
          <span className="text-gradient">atenção aos detalhes</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Técnica refinada, ambiente sofisticado e atendimento personalizado. 
          Aqui, cada corte é uma experiência única feita para você.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild variant="hero" size="xl">
            <Link to="/agendar">
              <Calendar className="w-5 h-5" />
              Agendar Horário
            </Link>
          </Button>
          <Button asChild variant="hero-outline" size="xl">
            <a href="#servicos">
              Conhecer Serviços
              <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: '10+', label: 'Anos de Tradição' },
            { value: '5.000+', label: 'Clientes Satisfeitos' },
            { value: '4.9', label: 'Avaliação Média' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}

function DemoLocation({ config }: { config: TemplateConfig }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="localizacao" className="section-padding" ref={ref}>
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">
            Localização
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">
            Venha nos
            <br />
            <span className="text-gradient">visitar</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Endereço</h3>
                  <p className="text-muted-foreground text-sm">
                    {config.business.address || 'Rua das Flores, 123 - Centro'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Telefone</h3>
                  <p className="text-muted-foreground text-sm">
                    {config.business.phone || '(11) 99999-9999'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Horários</h3>
                  <div className="text-muted-foreground text-sm space-y-1">
                    <p>Seg - Sex: 09:00 - 20:00</p>
                    <p>Sábado: 09:00 - 18:00</p>
                    <p>Domingo: Fechado</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card rounded-2xl overflow-hidden h-[400px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976!2d-46.6388!3d-23.5505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzAxLjgiUyA0NsKwMzgnMTkuNyJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DemoCTA({ config }: { config: TemplateConfig }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const whatsappNumber = config.business.whatsapp?.replace(/\D/g, '') || '5511999999999';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre os serviços da ${config.business.name || 'barbearia'}.`)}`;

  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden" ref={ref}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
      
      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para elevar
            <br />
            <span className="text-gradient">seu estilo?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            Reserve seu horário em poucos cliques e tenha a certeza de um atendimento 
            pontual e personalizado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="xl">
              <Link to="/agendar">
                <Calendar className="w-5 h-5" />
                Agendar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="hero-outline" size="xl">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5" />
                Falar no WhatsApp
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DemoFooter({ config }: { config: TemplateConfig }) {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = config.business.whatsapp?.replace(/\D/g, '') || '5511999999999';

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-narrow section-padding py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold">{config.business.name || 'Meu Negócio'}</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              {config.business.slogan || 'Tradição e Estilo'}. Atendimento premium com agendamento online 
              para sua comodidade.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Horários</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Seg - Sex: 09:00 - 20:00</p>
              <p>Sábado: 09:00 - 18:00</p>
              <p>Domingo: Fechado</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{config.business.phone || '(11) 99999-9999'}</p>
              <p className="text-xs">{config.business.address || 'Rua das Flores, 123 - Centro'}</p>
            </div>
            
            <div className="flex gap-3 mt-4">
              <a 
                href="#"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} {config.business.name || 'Meu Negócio'}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
