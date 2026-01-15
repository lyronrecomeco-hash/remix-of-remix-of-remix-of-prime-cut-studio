import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  Shield,
  Sparkles,
  TrendingUp,
  Timer,
  BadgeCheck,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ========== DATA ==========
const MODALIDADES = [
  { id: 'musculacao', name: 'Musculação', description: 'Treinamento de força com equipamentos modernos e acompanhamento profissional', icon: Dumbbell, popular: true, color: 'from-zinc-700 to-zinc-800' },
  { id: 'crossfit', name: 'CrossFit', description: 'Treinos funcionais de alta intensidade para resultados rápidos', icon: Flame, color: 'from-red-600 to-red-700' },
  { id: 'spinning', name: 'Spinning', description: 'Aulas de bike indoor com música e instrutores motivadores', icon: Zap, color: 'from-zinc-600 to-zinc-700' },
  { id: 'yoga', name: 'Yoga', description: 'Equilíbrio entre corpo e mente com técnicas milenares', icon: Heart, color: 'from-zinc-700 to-zinc-800' },
  { id: 'luta', name: 'Artes Marciais', description: 'Boxe, Muay Thai e Jiu-Jitsu com mestres experientes', icon: Target, color: 'from-red-700 to-red-800' },
  { id: 'funcional', name: 'Funcional', description: 'Treinos dinâmicos para melhorar seu dia a dia', icon: Trophy, color: 'from-zinc-600 to-zinc-700' },
];

const PLANOS = [
  { 
    id: 'mensal', 
    name: 'Mensal', 
    price: 129.90, 
    period: '/mês',
    description: 'Flexibilidade total',
    benefits: ['Acesso a todas modalidades', 'Avaliação física inclusa', 'App de treinos exclusivo', 'Suporte via WhatsApp'],
    popular: false,
    savings: null
  },
  { 
    id: 'trimestral', 
    name: 'Trimestral', 
    price: 99.90, 
    period: '/mês',
    description: 'Mais economia',
    originalPrice: 129.90,
    benefits: ['Tudo do plano mensal', 'Acompanhamento nutricional', '3 sessões com personal', 'Acesso à área VIP'],
    popular: true,
    savings: '23%'
  },
  { 
    id: 'semestral', 
    name: 'Semestral', 
    price: 79.90, 
    period: '/mês',
    description: 'Compromisso com resultados',
    originalPrice: 129.90,
    benefits: ['Tudo do trimestral', 'Armário exclusivo', 'Acesso VIP à sauna', 'Brindes exclusivos'],
    popular: false,
    savings: '38%'
  },
  { 
    id: 'anual', 
    name: 'Anual', 
    price: 59.90, 
    period: '/mês',
    description: 'Melhor custo-benefício',
    originalPrice: 129.90,
    benefits: ['Tudo do semestral', 'Personal trainer mensal', 'Nutricionista incluso', 'Prioridade em aulas'],
    popular: false,
    savings: '54%'
  },
];

const EQUIPE = [
  { name: 'Carlos Silva', role: 'Personal Trainer', specialty: 'Musculação e Hipertrofia', certifications: ['CREF 12345', 'CrossFit L2'], image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face' },
  { name: 'Ana Santos', role: 'Instrutora', specialty: 'Yoga e Pilates', certifications: ['Yoga Alliance', 'Pilates Mat'], image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face' },
  { name: 'Ricardo Melo', role: 'Coach', specialty: 'CrossFit e Funcional', certifications: ['CrossFit L3', 'Kettlebell'], image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
  { name: 'Juliana Costa', role: 'Nutricionista', specialty: 'Nutrição Esportiva', certifications: ['CRN 54321', 'Sports Nutrition'], image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face' },
];

const DEPOIMENTOS = [
  { name: 'Pedro Alves', text: 'Perdi 15kg em 4 meses! A equipe é incrível e os equipamentos são de primeira qualidade. Recomendo demais!', rating: 5, result: '-15kg', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { name: 'Maria Clara', text: 'Melhor academia da cidade. O ambiente é super motivador e os profissionais são extremamente qualificados.', rating: 5, result: 'Vida saudável', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
  { name: 'Lucas Ferreira', text: 'As aulas de CrossFit mudaram completamente minha vida. Ganhei condicionamento e disposição como nunca!', rating: 5, result: '+Disposição', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
];

const FAQ = [
  { q: 'A pré-matrícula é paga?', a: 'Não! A pré-matrícula é totalmente gratuita e sem compromisso. Você só paga quando vier finalizar presencialmente e começar a treinar.' },
  { q: 'Como funciona o agendamento?', a: 'Você escolhe o tipo de atendimento (avaliação física, visita guiada ou aula experimental), seleciona a data e horário de sua preferência, e confirmamos automaticamente no seu WhatsApp.' },
  { q: 'Quando posso começar a treinar?', a: 'Após finalizar a matrícula presencialmente, você já pode começar a treinar no mesmo dia! Nossa equipe estará pronta para recebê-lo.' },
  { q: 'Preciso ir presencialmente para fazer a pré-matrícula?', a: 'Não! Faça sua pré-matrícula 100% online, 24 horas por dia. Você só precisa comparecer presencialmente para finalizar a documentação e começar a treinar.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Oferecemos flexibilidade nos nossos planos. Consulte as condições de cancelamento de acordo com o plano escolhido.' },
];

const GALERIA = [
  { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop', label: 'Área de Musculação' },
  { src: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop', label: 'Sala de Spinning' },
  { src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=400&fit=crop', label: 'Box de CrossFit' },
  { src: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&h=400&fit=crop', label: 'Estúdio de Yoga' },
  { src: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop', label: 'Área Funcional' },
  { src: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=600&h=400&fit=crop', label: 'Recepção Premium' },
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
    <div className="min-h-screen bg-zinc-950 text-white">
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
    { href: '#depoimentos', label: 'Depoimentos' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="container flex items-center justify-between h-16 md:h-20 px-4">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
              <Dumbbell className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-white">{config.business.name}</span>
              <div className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">Academia Premium</div>
            </div>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a 
                key={link.href} 
                href={link.href} 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative text-sm font-medium text-zinc-400 hover:text-white transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button asChild className="hidden sm:flex bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-600/20 border-0">
                <Link to={code ? `/academia/${code}/matricula` : '/academia/matricula'}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Pré-matrícula
                </Link>
              </Button>
            </motion.div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
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
            className="fixed inset-x-0 top-16 z-40 bg-zinc-950/98 backdrop-blur-xl border-b border-zinc-800 lg:hidden"
          >
            <nav className="container py-6 flex flex-col gap-2 px-4">
              {navLinks.map((link, index) => (
                <motion.a 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-lg font-medium py-3 px-4 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <Button asChild className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold">
                <Link to={code ? `/academia/${code}/matricula` : '/academia/matricula'} onClick={() => setIsMobileMenuOpen(false)}>
                  <Sparkles className="w-4 h-4 mr-2" />
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
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com parallax */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="absolute inset-0 bg-zinc-950" />
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/50 to-zinc-950" />
      </motion.div>
      
      {/* Elementos decorativos sutis */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-zinc-500/10 rounded-full blur-[150px]" />

      <motion.div 
        className="relative z-10 container text-center px-4 pt-20"
        style={{ opacity }}
      >
        {/* Badge de destaque */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-red-400">Vagas Limitadas</span>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]"
        >
          Faça sua pré-matrícula
          <br />
          <span className="text-red-500">
            100% online
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
        >
          Sem burocracia, sem filas, atendimento imediato.
          <br className="hidden sm:block" />
          Comece a transformar sua vida hoje mesmo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xl shadow-red-600/20 border-0">
            <Link to={code ? `/academia/${code}/matricula` : '/academia/matricula'}>
              <Calendar className="w-5 h-5 mr-2" />
              Pré-matrícula Grátis
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-white">
            <a href="#planos">
              Ver todos os planos
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500"
        >
          {[
            { icon: Shield, text: 'Sem cartão de crédito' },
            { icon: Timer, text: 'Cadastro em 2 minutos' },
            { icon: BadgeCheck, text: 'Garantia de satisfação' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-red-500" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#autoridade" className="block">
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5 text-zinc-400" />
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
    { icon: Award, value: config.stats.years, label: 'Anos de experiência', suffix: '' },
    { icon: Users, value: config.stats.students, label: 'Alunos satisfeitos', suffix: '' },
    { icon: Star, value: config.stats.rating, label: 'Avaliação no Google', suffix: '★' },
    { icon: Trophy, value: config.stats.trainers, label: 'Profissionais', suffix: '' },
  ];

  return (
    <section id="autoridade" className="py-20 md:py-28 bg-zinc-900/50 relative overflow-hidden" ref={ref}>
      <div className="container px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 md:p-8 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:border-red-600/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <stat.icon className="w-7 h-7 text-red-500" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {['Equipamentos Technogym', 'Ar Condicionado Central', 'Estacionamento Grátis', 'Wi-Fi Liberado', 'Vestiários Premium'].map((selo) => (
            <div 
              key={selo} 
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-300"
            >
              <CheckCircle2 className="w-4 h-4 text-red-500" />
              {selo}
            </div>
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="modalidades" className="py-20 md:py-28 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-500 text-sm font-medium mb-4">MODALIDADES</span>
          <h2 className="text-3xl md:text-5xl font-bold">
            Escolha sua <span className="text-red-500">modalidade</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
            Diversas opções para você alcançar seus objetivos de forma eficiente e prazerosa
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODALIDADES.map((mod, index) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredId(mod.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 hover:border-red-600/30 transition-all duration-500 overflow-hidden"
            >
              {mod.popular && (
                <Badge className="absolute top-4 right-4 bg-red-600 text-white font-semibold border-0">
                  Popular
                </Badge>
              )}
              
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <mod.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-white">{mod.name}</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{mod.description}</p>
              
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-zinc-700 bg-zinc-800/50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
              >
                <Link to={code ? `/academia/${code}/matricula?modalidade=${mod.id}` : `/academia/matricula?modalidade=${mod.id}`}>
                  Selecionar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
    <section id="planos" className="py-20 md:py-28 bg-zinc-900/50 relative overflow-hidden" ref={ref}>
      <div className="container px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-500 text-sm font-medium mb-4">PLANOS E VALORES</span>
          <h2 className="text-3xl md:text-5xl font-bold">
            Escolha o plano <span className="text-red-500">ideal</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
            Investimento que cabe no seu bolso com resultados que transformam sua vida
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANOS.map((plano, index) => (
            <motion.div
              key={plano.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl border transition-all duration-500 ${
                plano.popular 
                  ? 'bg-zinc-800 border-red-600/50 shadow-xl shadow-red-600/10 scale-105 z-10' 
                  : 'bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600'
              }`}
            >
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-red-600 text-white font-semibold border-0 shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Mais Escolhido
                  </Badge>
                </div>
              )}

              {plano.savings && (
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="border-green-600/30 text-green-500 bg-green-600/10">
                    -{plano.savings}
                  </Badge>
                </div>
              )}
              
              <div className="pt-4">
                <h3 className="text-xl font-bold mb-1">{plano.name}</h3>
                <p className="text-sm text-zinc-500 mb-4">{plano.description}</p>
              </div>
              
              {plano.originalPrice && (
                <div className="text-sm text-zinc-500 line-through">
                  R$ {plano.originalPrice.toFixed(2).replace('.', ',')}
                </div>
              )}
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">
                  R$ {plano.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-zinc-500">{plano.period}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plano.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-300">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                asChild 
                className={`w-full ${plano.popular 
                  ? 'bg-red-600 hover:bg-red-700 text-white font-semibold' 
                  : 'bg-zinc-700 border border-zinc-600 hover:bg-zinc-600 text-white'}`}
              >
                <Link to={code ? `/academia/${code}/matricula?plano=${plano.id}` : `/academia/matricula?plano=${plano.id}`}>
                  Escolher plano
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Garantia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-800/50 border border-zinc-700/50">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="text-sm text-zinc-300">
              <span className="font-semibold text-white">Garantia de satisfação:</span> 7 dias para experimentar ou seu dinheiro de volta
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ========== ESTRUTURA (GALERIA) ==========
function Estrutura() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section id="estrutura" className="py-20 md:py-28 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-500 text-sm font-medium mb-4">ESTRUTURA</span>
          <h2 className="text-3xl md:text-5xl font-bold">
            Conheça nosso <span className="text-red-500">espaço</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
            Ambiente moderno, equipamentos de última geração e infraestrutura completa
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALERIA.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedImage(index)}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img 
                src={img.src} 
                alt={img.label} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-sm font-medium text-white">{img.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={GALERIA[selectedImage].src}
              alt={GALERIA[selectedImage].label}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ========== EQUIPE ==========
function Equipe() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-20 md:py-28 bg-zinc-900/50 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-500 text-sm font-medium mb-4">NOSSA EQUIPE</span>
          <h2 className="text-3xl md:text-5xl font-bold">
            Profissionais <span className="text-red-500">qualificados</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
            Time de especialistas dedicados ao seu sucesso e transformação
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EQUIPE.map((pessoa, index) => (
            <motion.div
              key={pessoa.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group text-center p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 hover:border-red-600/30 transition-all duration-300"
            >
              <div className="relative w-28 h-28 mx-auto mb-5">
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-zinc-700 group-hover:border-red-600/50 transition-colors">
                  <img src={pessoa.image} alt={pessoa.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <h3 className="font-bold text-lg text-white">{pessoa.name}</h3>
              <p className="text-red-500 text-sm font-medium">{pessoa.role}</p>
              <p className="text-zinc-500 text-xs mt-1">{pessoa.specialty}</p>
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {pessoa.certifications.map((cert) => (
                  <span key={cert} className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-[10px] text-zinc-400">
                    {cert}
                  </span>
                ))}
              </div>
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
    <section id="depoimentos" className="py-20 md:py-28 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-500 text-sm font-medium mb-4">DEPOIMENTOS</span>
          <h2 className="text-3xl md:text-5xl font-bold">
            O que nossos alunos <span className="text-red-500">dizem</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {DEPOIMENTOS.map((dep, index) => (
            <motion.div
              key={dep.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 hover:border-red-600/30 transition-all duration-300"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-red-500/20" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: dep.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-red-500 text-red-500" />
                ))}
              </div>
              
              <p className="text-zinc-300 mb-6 leading-relaxed">"{dep.text}"</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <img src={dep.avatar} alt={dep.name} className="w-10 h-10 rounded-full object-cover" />
                  <span className="font-semibold text-white">{dep.name}</span>
                </div>
                <Badge className="bg-green-600/10 text-green-500 border-green-600/20">
                  {dep.result}
                </Badge>
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
    <section className="py-20 md:py-28 bg-zinc-900/50 relative" ref={ref}>
      <div className="container px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-500 text-sm font-medium mb-4">DÚVIDAS FREQUENTES</span>
          <h2 className="text-3xl md:text-5xl font-bold">Perguntas frequentes</h2>
        </motion.div>

        <div className="space-y-3">
          {FAQ.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl border border-zinc-700/50 bg-zinc-800/30 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-5 flex items-center justify-between text-left font-medium hover:bg-zinc-800/50 transition-colors"
              >
                <span className="text-white">{item.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-8 h-8 rounded-full bg-zinc-700/50 flex items-center justify-center shrink-0 ml-4"
                >
                  <ChevronDown className="w-4 h-4 text-red-500" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">
                      {item.a}
                    </div>
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
    <section id="localizacao" className="py-20 md:py-28 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-500 text-sm font-medium mb-4">LOCALIZAÇÃO</span>
          <h2 className="text-3xl md:text-5xl font-bold">
            Venha nos <span className="text-red-500">visitar</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              { icon: MapPin, title: 'Endereço', value: config.business.address },
              { icon: Phone, title: 'Telefone', value: config.business.phone },
              { icon: Clock, title: 'Segunda a Sexta', value: config.hours.weekdays },
              { icon: Clock, title: 'Sábado', value: config.hours.saturday },
              { icon: Clock, title: 'Domingo', value: config.hours.sunday },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 hover:border-red-600/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{item.title}</p>
                  <p className="font-medium text-white">{item.value}</p>
                </div>
              </div>
            ))}

            <a 
              href={`https://wa.me/${config.business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-green-600/10 border border-green-600/20 hover:bg-green-600/20 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-green-500">WhatsApp</p>
                <p className="font-medium text-white group-hover:text-green-500 transition-colors">Fale conosco agora</p>
              </div>
              <ArrowRight className="w-5 h-5 text-green-500 ml-auto group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl overflow-hidden h-full min-h-[400px] border border-zinc-700/50"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975577035454!2d-46.65390508502207!3d-23.561414884682697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1640000000000!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
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
    <section className="py-20 md:py-28 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-500 to-amber-600" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-amber-800/30 rounded-full blur-[100px]" />

      <div className="container px-4 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-950 mb-6">
            Comece sua transformação hoje!
          </h2>
          <p className="text-slate-800 text-lg mb-10 max-w-2xl mx-auto">
            Faça sua pré-matrícula online agora e garanta sua vaga.
            <br />
            <span className="font-semibold">Primeira semana por nossa conta!</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-slate-950 text-white hover:bg-slate-800 shadow-xl">
              <Link to={code ? `/academia/${code}/matricula` : '/academia/matricula'}>
                <Calendar className="w-5 h-5 mr-2" />
                Pré-matrícula Online
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-slate-950/30 bg-transparent text-slate-950 hover:bg-slate-950/10">
              <a href={`https://wa.me/${DEFAULT_CONFIG.business.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar no WhatsApp
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ========== FOOTER ==========
function Footer({ config }: { config: typeof DEFAULT_CONFIG }) {
  return (
    <footer className="py-16 bg-slate-950 border-t border-white/5">
      <div className="container px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Logo e descrição */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white">{config.business.name}</span>
                <div className="text-[10px] text-amber-500 font-medium">Academia Premium</div>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              A melhor academia da região com equipamentos de última geração e profissionais altamente qualificados.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
            <nav className="space-y-3 text-sm">
              {['Início', 'Modalidades', 'Planos', 'Estrutura', 'Depoimentos'].map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="block text-slate-500 hover:text-amber-500 transition-colors">
                  {link}
                </a>
              ))}
            </nav>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contato</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-slate-500">
                <Phone className="w-4 h-4 text-amber-500" /> 
                {config.business.phone}
              </p>
              <p className="flex items-center gap-2 text-slate-500">
                <Mail className="w-4 h-4 text-amber-500" /> 
                {config.business.email}
              </p>
              <p className="flex items-start gap-2 text-slate-500">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> 
                {config.business.address}
              </p>
            </div>
          </div>

          {/* Redes sociais */}
          <div>
            <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center hover:bg-amber-500/20 hover:border-amber-500/30 transition-all">
                <Instagram className="w-5 h-5 text-slate-400 hover:text-amber-500" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center hover:bg-amber-500/20 hover:border-amber-500/30 transition-all">
                <Facebook className="w-5 h-5 text-slate-400 hover:text-amber-500" />
              </a>
              <a href={`https://wa.me/${config.business.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all">
                <MessageCircle className="w-5 h-5 text-slate-400 hover:text-emerald-500" />
              </a>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-white/5">
              <p className="text-xs text-slate-500">
                CNPJ: {config.business.cnpj}
              </p>
            </div>
          </div>
        </div>

        {/* Linha divisória e copyright */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
              © {new Date().getFullYear()} {config.business.name}. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-600 hover:text-amber-500 transition-colors">Política de Privacidade</a>
              <a href="#" className="text-slate-600 hover:text-amber-500 transition-colors">Termos de Uso</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
