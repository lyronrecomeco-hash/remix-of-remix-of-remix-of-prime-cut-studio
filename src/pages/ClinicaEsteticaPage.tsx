import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Star, 
  ChevronRight, 
  Sparkles,
  Heart,
  Shield,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  Instagram,
  MessageCircle,
  ArrowRight,
  Leaf,
  Gem,
  Zap,
  Menu,
  X,
  Play,
  ArrowUpRight,
  Quote,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useRef } from 'react';

// Images
import heroImage from '@/assets/clinica-hero.jpg';
import interiorImage from '@/assets/clinica-interior.jpg';
import clienteImage from '@/assets/clinica-cliente.jpg';
import procedimentoImage from '@/assets/clinica-procedimento.jpg';

// Configuração padrão
const DEFAULT_CONFIG = {
  business: {
    name: 'Essence Estética',
    phone: '(11) 99999-9999',
    whatsapp: '5511999999999',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    slogan: 'Realce sua beleza natural com tratamentos exclusivos',
  },
};

// Procedimentos
const PROCEDIMENTOS = [
  {
    id: 'limpeza',
    name: 'Limpeza de Pele',
    description: 'Remoção profunda de impurezas para uma pele renovada e radiante.',
    duracao: '1h30',
    icon: Sparkles,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'botox',
    name: 'Toxina Botulínica',
    description: 'Suavização de linhas de expressão com resultados naturais.',
    duracao: '30min',
    icon: Gem,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: 'preenchimento',
    name: 'Preenchimento Facial',
    description: 'Restauração de volume e contornos com ácido hialurônico.',
    duracao: '45min',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
  {
    id: 'peeling',
    name: 'Peeling Químico',
    description: 'Renovação celular para tratamento de manchas e textura.',
    duracao: '45min',
    icon: Leaf,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'microagulhamento',
    name: 'Microagulhamento',
    description: 'Estímulo de colágeno para rejuvenescimento intenso.',
    duracao: '1h',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'drenagem',
    name: 'Drenagem Linfática',
    description: 'Massagem especializada para redução de inchaço e bem-estar.',
    duracao: '1h',
    icon: Heart,
    color: 'from-cyan-500 to-sky-600',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
];

// Programas
const PROGRAMAS = [
  {
    id: 'essencial',
    name: 'Programa Essencial',
    sessoes: '4 sessões',
    descricao: 'Ideal para manutenção da saúde da pele',
    inclui: ['2x Limpeza de Pele', '2x Hidratação Intensiva'],
    destaque: false,
    price: 'R$ 480',
  },
  {
    id: 'premium',
    name: 'Programa Premium',
    sessoes: '8 sessões',
    descricao: 'Tratamento completo de rejuvenescimento',
    inclui: ['3x Limpeza de Pele', '3x Peeling', '2x Microagulhamento'],
    destaque: true,
    price: 'R$ 1.200',
  },
  {
    id: 'noiva',
    name: 'Programa Noiva',
    sessoes: '12 sessões',
    descricao: 'Preparação completa para o grande dia',
    inclui: ['4x Limpeza', '4x Peeling', '2x Microagulhamento', '2x Drenagem'],
    destaque: false,
    price: 'R$ 2.400',
  },
];

// Depoimentos
const DEPOIMENTOS = [
  {
    nome: 'Carolina Mendes',
    texto: 'Fiz o programa premium e os resultados foram incríveis! Minha pele nunca esteve tão bonita e saudável. A equipe é maravilhosa!',
    procedimento: 'Programa Premium',
    rating: 5,
    avatar: 'CM',
  },
  {
    nome: 'Amanda Silva',
    texto: 'Profissionais muito atenciosos e ambiente super aconchegante. O botox ficou natural, exatamente como eu queria!',
    procedimento: 'Toxina Botulínica',
    rating: 5,
    avatar: 'AS',
  },
  {
    nome: 'Juliana Rocha',
    texto: 'O preenchimento ficou harmonioso e natural. Recomendo demais para quem busca qualidade e segurança!',
    procedimento: 'Preenchimento Facial',
    rating: 5,
    avatar: 'JR',
  },
];

// Header Component
const ClinicaHeader = ({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 50);
    });
  }
  
  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-900/5' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 rotate-3 hover:rotate-0 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                  {config.business.name}
                </span>
                <p className={`text-xs font-medium transition-colors ${scrolled ? 'text-pink-600' : 'text-pink-200'}`}>
                  Estética Avançada
                </p>
              </div>
            </motion.div>
            
            <nav className="hidden lg:flex items-center gap-1">
              {['Procedimentos', 'Programas', 'Sobre', 'Depoimentos', 'Contato'].map((item, i) => (
                <motion.a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10 ${
                    scrolled ? 'text-slate-600 hover:text-pink-600 hover:bg-pink-50' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                  className="hidden sm:flex bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/30 font-semibold px-6 h-11 rounded-xl"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar
                </Button>
              </motion.div>
              
              <button 
                className={`lg:hidden p-2.5 rounded-xl transition-all ${
                  scrolled ? 'text-slate-600 hover:bg-pink-50' : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-xl text-slate-900">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
              <nav className="space-y-2">
                {['Procedimentos', 'Programas', 'Sobre', 'Depoimentos', 'Contato'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-slate-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl font-medium transition-all"
                  >
                    {item}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-8 border-t border-slate-100">
                <Button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar');
                  }}
                  className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white h-12 rounded-xl font-semibold shadow-lg shadow-pink-500/30"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Avaliação
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

// Hero Section - Completely redesigned
const HeroSection = ({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Clínica de estética"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

      <motion.div style={{ opacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 font-medium text-sm">
                <Sparkles className="w-4 h-4 mr-2 text-pink-400" />
                Referência em estética avançada
              </Badge>
            </motion.div>
            
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Realce sua
              <span className="block mt-2 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                beleza natural
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-white/70 max-w-xl leading-relaxed">
              {config.business.slogan}. Tratamentos personalizados com tecnologia de ponta e profissionais especializados.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg"
                onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 text-white px-8 h-14 text-base font-bold shadow-2xl shadow-pink-500/40 rounded-2xl group"
              >
                Agendar Avaliação Gratuita
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40 h-14 rounded-2xl font-semibold"
                onClick={() => document.getElementById('procedimentos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-5 h-5 mr-2" />
                Conhecer Tratamentos
              </Button>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-8 pt-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-white">
                  <span className="font-bold">4.9</span>
                  <span className="text-white/60 text-sm ml-1">(200+ avaliações)</span>
                </div>
              </div>
              <div className="h-6 w-px bg-white/20 hidden sm:block" />
              <div className="flex items-center gap-2 text-white/80">
                <Users className="w-5 h-5 text-pink-400" />
                <span className="font-medium">+2.000 clientes satisfeitas</span>
              </div>
              <div className="h-6 w-px bg-white/20 hidden sm:block" />
              <div className="flex items-center gap-2 text-white/80">
                <Shield className="w-5 h-5 text-pink-400" />
                <span className="font-medium">5+ anos de experiência</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Card */}
        <motion.div
          initial={{ opacity: 0, x: 100, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="hidden xl:block absolute right-8 bottom-20"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div className="text-white">
                <p className="font-bold text-2xl">Top 10</p>
                <p className="text-white/60 text-sm">Clínicas SP</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['Excelência', 'Qualidade', 'Segurança'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-white/50 text-sm font-medium">Role para explorar</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// Diferenciais Section - Redesigned with colorful cards
const DiferenciaisSection = () => {
  const diferenciais = [
    { 
      icon: Award, 
      title: 'Profissionais Elite', 
      desc: 'Equipe com especializações internacionais e certificações avançadas',
      color: 'from-rose-500 to-pink-600',
      bgGlow: 'bg-rose-500/20'
    },
    { 
      icon: Shield, 
      title: 'Segurança Total', 
      desc: 'Produtos importados e equipamentos com certificação ANVISA',
      color: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/20'
    },
    { 
      icon: Heart, 
      title: 'Cuidado Exclusivo', 
      desc: 'Atendimento individualizado com protocolos personalizados',
      color: 'from-pink-500 to-rose-600',
      bgGlow: 'bg-pink-500/20'
    },
    { 
      icon: Sparkles, 
      title: 'Tecnologia Premium', 
      desc: 'Equipamentos de última geração para resultados excepcionais',
      color: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/20'
    },
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
      <div className="absolute -top-40 left-1/4 w-80 h-80 bg-pink-200/30 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-[100px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-pink-100 text-pink-700 border-pink-200 mb-4 px-4 py-1.5 font-semibold">
            Nossos Diferenciais
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Por que somos a <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">escolha certa</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Excelência em cada detalhe para entregar resultados que superam suas expectativas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {diferenciais.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 h-full overflow-hidden">
                {/* Glow effect */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 ${item.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Procedimentos Section - Complete redesign with interactive cards
const ProcedimentosSection = ({ code }: { code?: string }) => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="procedimentos" className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full blur-[100px] opacity-60" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full blur-[100px] opacity-60" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-gradient-to-r from-rose-100 to-purple-100 text-purple-700 border-purple-200 mb-4 px-4 py-1.5 font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            Tratamentos Exclusivos
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Nossos <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">Procedimentos</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Tratamentos avançados realizados por profissionais especializados
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROCEDIMENTOS.map((proc, index) => (
            <motion.div
              key={proc.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              onMouseEnter={() => setHoveredId(proc.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full ${
                hoveredId === proc.id ? 'scale-[1.02]' : ''
              }`}>
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${proc.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <CardContent className="relative p-6 h-full flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl ${proc.bgColor} group-hover:bg-white/20 flex items-center justify-center mb-5 transition-all duration-300`}>
                    <proc.icon className={`w-7 h-7 ${proc.iconColor} group-hover:text-white transition-colors`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-white mb-2 transition-colors">
                      {proc.name}
                    </h3>
                    <p className="text-slate-500 group-hover:text-white/80 text-sm leading-relaxed mb-4 transition-colors">
                      {proc.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 group-hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-2 text-slate-500 group-hover:text-white/80 transition-colors">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{proc.duracao}</span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar?procedimento=${proc.id}` : `/clinica-estetica/agendar?procedimento=${proc.id}`)}
                      className="bg-slate-900 hover:bg-slate-800 group-hover:bg-white group-hover:text-slate-900 text-white font-semibold rounded-xl shadow-none"
                    >
                      Agendar
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Programas Section - Premium cards with better design
const ProgramasSection = ({ code }: { code?: string }) => {
  const navigate = useNavigate();

  return (
    <section id="programas" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-white/10 text-white border-white/20 mb-4 px-4 py-1.5 font-semibold backdrop-blur-sm">
            <Gem className="w-4 h-4 mr-2 text-pink-400" />
            Programas Exclusivos
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Pacotes <span className="bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">Especiais</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Programas completos desenvolvidos para resultados extraordinários
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PROGRAMAS.map((programa, index) => (
            <motion.div
              key={programa.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative ${programa.destaque ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {programa.destaque && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-rose-500 to-purple-600 text-white border-0 px-4 py-1.5 font-bold shadow-lg shadow-pink-500/30">
                    ⭐ Mais Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`relative overflow-hidden h-full group hover:scale-[1.02] transition-all duration-500 ${
                programa.destaque 
                  ? 'bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 border-0 shadow-2xl shadow-pink-500/30' 
                  : 'bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${programa.destaque ? 'text-white' : 'text-white'}`}>
                      {programa.name}
                    </h3>
                    <p className={`text-sm ${programa.destaque ? 'text-white/80' : 'text-slate-400'}`}>
                      {programa.descricao}
                    </p>
                  </div>

                  <div className={`text-4xl font-bold mb-1 ${programa.destaque ? 'text-white' : 'text-white'}`}>
                    {programa.price}
                  </div>
                  <p className={`text-sm mb-6 ${programa.destaque ? 'text-white/60' : 'text-slate-500'}`}>
                    {programa.sessoes}
                  </p>

                  <div className="space-y-3 mb-8">
                    {programa.inclui.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          programa.destaque ? 'bg-white/20' : 'bg-pink-500/20'
                        }`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${programa.destaque ? 'text-white' : 'text-pink-400'}`} />
                        </div>
                        <span className={`text-sm ${programa.destaque ? 'text-white/90' : 'text-slate-300'}`}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar?programa=${programa.id}` : `/clinica-estetica/agendar?programa=${programa.id}`)}
                    className={`w-full h-12 font-bold rounded-xl ${
                      programa.destaque 
                        ? 'bg-white text-pink-600 hover:bg-white/90 shadow-lg' 
                        : 'bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:from-rose-600 hover:to-purple-700 shadow-lg shadow-pink-500/20'
                    }`}
                  >
                    Quero Este Programa
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Sobre Section - Modern layout
const SobreSection = () => {
  return (
    <section id="sobre" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
                <img 
                  src={interiorImage} 
                  alt="Interior da clínica"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">+5</p>
                    <p className="text-slate-500 text-sm font-medium">Anos de experiência</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative element */}
            <div className="absolute -z-10 -top-8 -left-8 w-full h-full rounded-3xl bg-gradient-to-br from-rose-100 to-purple-100" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <Badge className="bg-pink-100 text-pink-700 border-pink-200 mb-4 px-4 py-1.5 font-semibold">
                Sobre Nós
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                Dedicados à sua <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">beleza</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                A Essence Estética nasceu do sonho de criar um espaço onde a beleza natural é celebrada 
                e realçada com tratamentos de excelência. Nossa missão é proporcionar experiências 
                transformadoras que vão além da estética.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Com uma equipe altamente qualificada e equipamentos de última geração, oferecemos 
                tratamentos personalizados que respeitam a individualidade de cada cliente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { number: '2.000+', label: 'Clientes satisfeitas' },
                { number: '15+', label: 'Procedimentos' },
                { number: '4.9', label: 'Avaliação média' },
                { number: '98%', label: 'Satisfação' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-slate-50 rounded-2xl p-5"
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </p>
                  <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Depoimentos Section - Modern testimonials
const DepoimentosSection = () => {
  return (
    <section id="depoimentos" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-pink-100 text-pink-700 border-pink-200 mb-4 px-4 py-1.5 font-semibold">
            <Star className="w-4 h-4 mr-2 fill-pink-500" />
            Depoimentos
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            O que nossas <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">clientes dizem</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Histórias reais de transformação e satisfação
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEPOIMENTOS.map((dep, index) => (
            <motion.div
              key={dep.nome}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="bg-white border-0 shadow-xl shadow-slate-200/50 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <CardContent className="p-8">
                  {/* Quote icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center mb-6">
                    <Quote className="w-6 h-6 text-pink-600" />
                  </div>
                  
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(dep.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  {/* Text */}
                  <p className="text-slate-600 leading-relaxed mb-6 text-lg italic">
                    "{dep.texto}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
                      {dep.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{dep.nome}</p>
                      <p className="text-sm text-slate-500">{dep.procedimento}</p>
                    </div>
                    <BadgeCheck className="w-5 h-5 text-pink-500 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = ({ code }: { code?: string }) => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Pronta para transformar sua <span className="underline decoration-white/30 decoration-4 underline-offset-8">autoestima</span>?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Agende sua avaliação gratuita e descubra os tratamentos ideais para você
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg"
              onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
              className="bg-white text-pink-600 hover:bg-white/90 px-10 h-14 text-lg font-bold shadow-2xl shadow-pink-900/30 rounded-2xl"
            >
              Agendar Avaliação Gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="font-medium">Sem compromisso</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="font-medium">Atendimento VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="font-medium">Resultados garantidos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Contato Section
const ContatoSection = ({ config }: { config: typeof DEFAULT_CONFIG }) => {
  return (
    <section id="contato" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <Badge className="bg-pink-100 text-pink-700 border-pink-200 mb-4 px-4 py-1.5 font-semibold">
                Contato
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                Fale <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">conosco</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Estamos à disposição para atender você. Entre em contato e agende sua visita!
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg mb-1">Telefone / WhatsApp</p>
                  <p className="text-slate-600">{config.business.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg mb-1">Endereço</p>
                  <p className="text-slate-600">{config.business.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg mb-1">Horário de Atendimento</p>
                  <p className="text-slate-600">Segunda a Sexta: 9h às 19h</p>
                  <p className="text-slate-600">Sábado: 9h às 14h</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 pt-4">
              <a 
                href="#" 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-pink-500/30"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={`https://wa.me/${config.business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Image/Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
              <img 
                src={clienteImage} 
                alt="Atendimento"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
            </div>
            
            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${config.business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl p-5 shadow-xl flex items-center justify-between group hover:bg-pink-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Fale no WhatsApp</p>
                  <p className="text-slate-500 text-sm">Resposta rápida</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer
const FooterSection = ({ config }: { config: typeof DEFAULT_CONFIG }) => {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">{config.business.name}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Estética avançada com atendimento personalizado e resultados excepcionais.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Navegação</h4>
            <ul className="space-y-3">
              {['Procedimentos', 'Programas', 'Sobre', 'Contato'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-slate-400 hover:text-pink-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-3 text-slate-400">
              <li>{config.business.phone}</li>
              <li className="text-sm">{config.business.address}</li>
            </ul>
          </div>

          {/* Horário */}
          <div>
            <h4 className="font-bold text-lg mb-4">Horário</h4>
            <ul className="space-y-3 text-slate-400">
              <li>Segunda a Sexta: 9h às 19h</li>
              <li>Sábado: 9h às 14h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {config.business.name}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Desenvolvido por</span>
            <span className="font-semibold text-pink-400">Genesis</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Page Component
export default function ClinicaEsteticaPage() {
  const { code } = useParams<{ code: string }>();
  const config = DEFAULT_CONFIG;

  return (
    <div className="min-h-screen bg-white">
      <ClinicaHeader config={config} code={code} />
      <HeroSection config={config} code={code} />
      <DiferenciaisSection />
      <ProcedimentosSection code={code} />
      <ProgramasSection code={code} />
      <SobreSection />
      <DepoimentosSection />
      <CTASection code={code} />
      <ContatoSection config={config} />
      <FooterSection config={config} />
    </div>
  );
}
