import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Menu, 
  X, 
  Calendar, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle,
  Instagram,
  Facebook,
  Users,
  Star,
  Award,
  Flame,
  Target,
  Heart,
  Zap,
  Trophy,
  CheckCircle2,
  Play,
  ChevronDown,
  Mail,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ========== DATA ==========
const MODALIDADES = [
  { id: 'musculacao', name: 'Musculação', description: 'Treinamento de força com equipamentos modernos', icon: Dumbbell, popular: true },
  { id: 'crossfit', name: 'CrossFit', description: 'Treinos funcionais de alta intensidade', icon: Flame },
  { id: 'spinning', name: 'Spinning', description: 'Aulas de bike indoor com música', icon: Zap },
  { id: 'yoga', name: 'Yoga', description: 'Equilíbrio entre corpo e mente', icon: Heart },
  { id: 'luta', name: 'Artes Marciais', description: 'Boxe, Muay Thai e Jiu-Jitsu', icon: Target },
  { id: 'funcional', name: 'Funcional', description: 'Treinos dinâmicos para o dia a dia', icon: Trophy },
];

const PLANOS = [
  { 
    id: 'mensal', 
    name: 'Mensal', 
    price: 129.90, 
    period: '/mês',
    benefits: ['Acesso livre a todas modalidades', 'Avaliação física inclusa', 'App de treinos'],
    popular: false 
  },
  { 
    id: 'trimestral', 
    name: 'Trimestral', 
    price: 99.90, 
    period: '/mês',
    originalPrice: 129.90,
    benefits: ['Tudo do plano mensal', '+ Acompanhamento nutricional', '+ 3 sessões com personal'],
    popular: true 
  },
  { 
    id: 'semestral', 
    name: 'Semestral', 
    price: 79.90, 
    period: '/mês',
    originalPrice: 129.90,
    benefits: ['Tudo do trimestral', '+ Armário exclusivo', '+ Acesso VIP à sauna'],
    popular: false 
  },
  { 
    id: 'anual', 
    name: 'Anual', 
    price: 59.90, 
    period: '/mês',
    originalPrice: 129.90,
    benefits: ['Tudo do semestral', '+ Personal trainer mensal', '+ Brindes exclusivos'],
    popular: false 
  },
];

const EQUIPE = [
  { name: 'Carlos Silva', role: 'Personal Trainer', specialty: 'Musculação e Hipertrofia', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face' },
  { name: 'Ana Santos', role: 'Instrutora', specialty: 'Yoga e Pilates', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face' },
  { name: 'Ricardo Melo', role: 'Coach', specialty: 'CrossFit e Funcional', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
  { name: 'Juliana Costa', role: 'Nutricionista', specialty: 'Nutrição Esportiva', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face' },
];

const DEPOIMENTOS = [
  { name: 'Pedro Alves', text: 'Perdi 15kg em 4 meses! A equipe é incrível e os equipamentos são top.', rating: 5, result: '-15kg' },
  { name: 'Maria Clara', text: 'Melhor academia da cidade. Ambiente motivador e profissionais qualificados.', rating: 5, result: 'Vida saudável' },
  { name: 'Lucas Ferreira', text: 'As aulas de CrossFit mudaram minha vida. Recomendo demais!', rating: 5, result: '+Disposição' },
];

const FAQ = [
  { q: 'A pré-matrícula é paga?', a: 'Não! A pré-matrícula é totalmente gratuita. Você só paga quando vier finalizar presencialmente.' },
  { q: 'Como funciona o agendamento?', a: 'Você escolhe o tipo (avaliação, visita ou aula experimental), data e horário. Confirmamos automaticamente no seu WhatsApp.' },
  { q: 'Quando posso começar a treinar?', a: 'Após finalizar a matrícula presencialmente, você já pode começar no mesmo dia!' },
  { q: 'Preciso ir presencialmente para a pré-matrícula?', a: 'Não! Faça sua pré-matrícula online 24h. Só precisa vir presencialmente para finalizar e começar a treinar.' },
];

const GALERIA = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=600&h=400&fit=crop',
];

// Config padrão
const DEFAULT_CONFIG = {
  business: {
    name: 'FitPower Academia',
    slogan: 'Transforme seu corpo, transforme sua vida',
    phone: '(11) 99999-9999',
    whatsapp: '5511999999999',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    instagram: '@fitpoweracademia',
    email: 'contato@fitpower.com.br',
    cnpj: '00.000.000/0001-00',
  },
  hours: {
    weekdays: '05:00 - 23:00',
    saturday: '07:00 - 18:00',
    sunday: '08:00 - 14:00',
  },
  stats: {
    years: '12',
    students: '3.000+',
    rating: '4.9',
    trainers: '25+',
  }
};

export default function AcademiaPage() {
  const { code } = useParams<{ code: string }>();
  const config = DEFAULT_CONFIG;
  
  return (
    <div className="min-h-screen bg-background">
      <AcademiaHeader config={config} code={code} />
      <AcademiaHero config={config} code={code} />
      <ProvaAutoridade config={config} />
      <Modalidades code={code} />
      <Planos code={code} />
      <Estrutura />
      <Equipe />
      <Depoimentos />
      <FAQSection />
      <Localizacao config={config} />
      <CTAFinal code={code} />
      <Footer config={config} />
    </div>
  );
}

// ========== HEADER ==========
function AcademiaHeader({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#inicio', label: 'Início' },
    { href: '#modalidades', label: 'Modalidades' },
    { href: '#planos', label: 'Planos' },
    { href: '#estrutura', label: 'Estrutura' },
    { href: '#agendamento', label: 'Agendamento' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}>
        <div className="container flex items-center justify-between h-16 md:h-20 px-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:inline">{config.business.name}</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild className="hidden sm:flex bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90">
              <Link to={code ? `/academia/${code}/matricula` : '/academia/matricula'}>
                Pré-matrícula Online
              </Link>
            </Button>
            
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-secondary">
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
            className="fixed inset-x-0 top-16 z-40 bg-background/98 backdrop-blur-lg border-b border-border lg:hidden"
          >
            <nav className="container py-6 flex flex-col gap-4 px-4">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium py-2">
                  {link.label}
                </a>
              ))}
              <Button asChild className="mt-2 bg-gradient-to-r from-primary to-orange-500">
                <Link to={code ? `/academia/${code}/matricula` : '/academia/matricula'} onClick={() => setIsMobileMenuOpen(false)}>
                  Pré-matrícula Online
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ========== HERO ==========
function AcademiaHero({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
      
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[150px]" />

      <div className="relative z-10 container text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full border border-primary/20">
            💪 {config.business.slogan}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          Faça sua pré-matrícula online
          <br />
          <span className="bg-gradient-to-r from-primary via-orange-400 to-orange-500 bg-clip-text text-transparent">
            e comece a treinar
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Sem burocracia • Atendimento imediato • 100% Online
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90">
            <Link to={code ? `/academia/${code}/matricula` : '/academia/matricula'}>
              <Calendar className="w-5 h-5 mr-2" />
              Pré-matrícula
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-white/20 hover:bg-white/10">
            <a href="#planos">
              Ver planos
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#autoridade" className="block">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-8 h-8 text-muted-foreground" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}

// ========== PROVA DE AUTORIDADE ==========
function ProvaAutoridade({ config }: { config: typeof DEFAULT_CONFIG }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { icon: Award, value: config.stats.years, label: 'Anos de Mercado' },
    { icon: Users, value: config.stats.students, label: 'Alunos Ativos' },
    { icon: Star, value: config.stats.rating, label: 'Avaliação Google' },
    { icon: Trophy, value: config.stats.trainers, label: 'Profissionais' },
  ];

  return (
    <section id="autoridade" className="py-16 md:py-24 bg-secondary/30" ref={ref}>
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-background border border-border"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          {['Equipamentos Technogym', 'Ar Condicionado Central', 'Estacionamento Grátis', 'Wi-Fi Liberado'].map((selo) => (
            <Badge key={selo} variant="secondary" className="px-4 py-2 text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
              {selo}
            </Badge>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ========== MODALIDADES ==========
function Modalidades({ code }: { code?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="modalidades" className="py-16 md:py-24" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Modalidades</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            Escolha sua <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">modalidade</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Diversas opções para você alcançar seus objetivos
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODALIDADES.map((mod, index) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-300"
            >
              {mod.popular && (
                <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-primary to-orange-500">
                  Mais Popular
                </Badge>
              )}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <mod.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{mod.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{mod.description}</p>
              <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                <Link to={code ? `/academia/${code}/matricula?modalidade=${mod.id}` : `/academia/matricula?modalidade=${mod.id}`}>
                  Selecionar modalidade
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== PLANOS ==========
function Planos({ code }: { code?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="planos" className="py-16 md:py-24 bg-secondary/30" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Planos e Valores</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            Escolha o plano <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">ideal</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANOS.map((plano, index) => (
            <motion.div
              key={plano.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                plano.popular 
                  ? 'bg-gradient-to-b from-primary/10 to-orange-500/10 border-primary shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              {plano.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-orange-500">
                  Mais Escolhido
                </Badge>
              )}
              <h3 className="text-xl font-bold mb-2">{plano.name}</h3>
              {plano.originalPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  De R$ {plano.originalPrice.toFixed(2).replace('.', ',')}
                </div>
              )}
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  R$ {plano.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-muted-foreground">{plano.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plano.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button 
                asChild 
                className={`w-full ${plano.popular ? 'bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90' : ''}`}
                variant={plano.popular ? 'default' : 'outline'}
              >
                <Link to={code ? `/academia/${code}/matricula?plano=${plano.id}` : `/academia/matricula?plano=${plano.id}`}>
                  Pré-matrícula
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== ESTRUTURA (GALERIA) ==========
function Estrutura() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="estrutura" className="py-16 md:py-24" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Estrutura</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            Conheça nosso <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">espaço</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALERIA.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative aspect-[4/3] rounded-xl overflow-hidden group"
            >
              <img src={img} alt={`Estrutura ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== EQUIPE ==========
function Equipe() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-16 md:py-24 bg-secondary/30" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Equipe</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            Profissionais <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">qualificados</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EQUIPE.map((pessoa, index) => (
            <motion.div
              key={pessoa.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-background border border-border"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/20">
                <img src={pessoa.image} alt={pessoa.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-lg">{pessoa.name}</h3>
              <p className="text-primary text-sm">{pessoa.role}</p>
              <p className="text-muted-foreground text-xs mt-1">{pessoa.specialty}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== DEPOIMENTOS ==========
function Depoimentos() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-16 md:py-24" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Depoimentos</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            O que nossos alunos <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">dizem</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {DEPOIMENTOS.map((dep, index) => (
            <motion.div
              key={dep.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-secondary/50 border border-border"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: dep.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"{dep.text}"</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{dep.name}</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">{dep.result}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== FAQ ==========
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-secondary/30" ref={ref}>
      <div className="container px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Dúvidas Frequentes</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">FAQ</h2>
        </motion.div>

        <div className="space-y-4">
          {FAQ.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-xl border border-border bg-background overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 flex items-center justify-between text-left font-medium hover:bg-secondary/50 transition-colors"
              >
                {item.q}
                <ChevronDown className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 text-muted-foreground text-sm"
                  >
                    {item.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== LOCALIZAÇÃO ==========
function Localizacao({ config }: { config: typeof DEFAULT_CONFIG }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="localizacao" className="py-16 md:py-24" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Localização</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4">
            Venha nos <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">visitar</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              { icon: MapPin, title: 'Endereço', value: config.business.address },
              { icon: Phone, title: 'Telefone', value: config.business.phone },
              { icon: Clock, title: 'Seg - Sex', value: config.hours.weekdays },
              { icon: Clock, title: 'Sábado', value: config.hours.saturday },
              { icon: Clock, title: 'Domingo', value: config.hours.sunday },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl overflow-hidden h-[400px] bg-secondary"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975577035454!2d-46.65390508502207!3d-23.561414884682697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1640000000000!5m2!1spt-BR!2sbr"
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

// ========== CTA FINAL ==========
function CTAFinal({ code }: { code?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary to-orange-500" ref={ref}>
      <div className="container px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Comece sua transformação hoje!
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Faça sua pré-matrícula online agora e ganhe uma aula experimental grátis!
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
            <Link to={code ? `/academia/${code}/matricula` : '/academia/matricula'}>
              <Calendar className="w-5 h-5 mr-2" />
              Pré-matrícula Online
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// ========== FOOTER ==========
function Footer({ config }: { config: typeof DEFAULT_CONFIG }) {
  return (
    <footer className="py-12 bg-secondary/50 border-t border-border">
      <div className="container px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">{config.business.name}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              A melhor academia da região. Equipamentos modernos e profissionais qualificados.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <nav className="space-y-2 text-sm">
              <a href="#inicio" className="block text-muted-foreground hover:text-foreground">Início</a>
              <a href="#modalidades" className="block text-muted-foreground hover:text-foreground">Modalidades</a>
              <a href="#planos" className="block text-muted-foreground hover:text-foreground">Planos</a>
              <a href="#estrutura" className="block text-muted-foreground hover:text-foreground">Estrutura</a>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {config.business.phone}</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {config.business.email}</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {config.business.address}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Instagram className="w-5 h-5 text-primary" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Facebook className="w-5 h-5 text-primary" />
              </a>
              <a href={`https://wa.me/${config.business.whatsapp}`} className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 {config.business.name}. Todos os direitos reservados.</p>
          <p>CNPJ: {config.business.cnpj}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Política de Privacidade</a>
            <a href="#" className="hover:text-foreground">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
