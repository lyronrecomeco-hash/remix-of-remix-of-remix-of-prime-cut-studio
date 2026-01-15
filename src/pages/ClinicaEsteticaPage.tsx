import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

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
    slogan: 'Cuidados especializados para realçar sua beleza natural',
  },
};

// Procedimentos
const PROCEDIMENTOS = [
  {
    id: 'limpeza',
    name: 'Limpeza de Pele',
    description: 'Remoção profunda de impurezas para uma pele renovada e saudável.',
    duracao: '1h30',
    icon: Sparkles,
  },
  {
    id: 'botox',
    name: 'Toxina Botulínica',
    description: 'Suavização de linhas de expressão com resultados naturais.',
    duracao: '30min',
    icon: Gem,
  },
  {
    id: 'preenchimento',
    name: 'Preenchimento Facial',
    description: 'Restauração de volume e contornos com ácido hialurônico.',
    duracao: '45min',
    icon: Heart,
  },
  {
    id: 'peeling',
    name: 'Peeling Químico',
    description: 'Renovação celular para tratamento de manchas e textura.',
    duracao: '45min',
    icon: Leaf,
  },
  {
    id: 'microagulhamento',
    name: 'Microagulhamento',
    description: 'Estímulo de colágeno para rejuvenescimento da pele.',
    duracao: '1h',
    icon: Zap,
  },
  {
    id: 'drenagem',
    name: 'Drenagem Linfática',
    description: 'Massagem especializada para redução de inchaço e bem-estar.',
    duracao: '1h',
    icon: Heart,
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
  },
  {
    id: 'premium',
    name: 'Programa Premium',
    sessoes: '8 sessões',
    descricao: 'Tratamento completo de rejuvenescimento',
    inclui: ['3x Limpeza de Pele', '3x Peeling', '2x Microagulhamento'],
    destaque: true,
  },
  {
    id: 'noiva',
    name: 'Programa Noiva',
    sessoes: '12 sessões',
    descricao: 'Preparação completa para o grande dia',
    inclui: ['4x Limpeza', '4x Peeling', '2x Microagulhamento', '2x Drenagem'],
    destaque: false,
  },
];

// Depoimentos
const DEPOIMENTOS = [
  {
    nome: 'Carolina M.',
    texto: 'Fiz o programa premium e os resultados foram incríveis! Minha pele nunca esteve tão bonita e saudável.',
    procedimento: 'Programa Premium',
  },
  {
    nome: 'Amanda S.',
    texto: 'Profissionais muito atenciosos e ambiente super aconchegante. Recomendo demais!',
    procedimento: 'Toxina Botulínica',
  },
  {
    nome: 'Juliana R.',
    texto: 'O preenchimento ficou natural e harmonioso. Exatamente o que eu queria!',
    procedimento: 'Preenchimento Facial',
  },
];

// Galeria de fotos
const GALERIA = [
  { src: heroImage, alt: 'Atendimento especializado' },
  { src: interiorImage, alt: 'Recepção da clínica' },
  { src: procedimentoImage, alt: 'Procedimento estético' },
  { src: clienteImage, alt: 'Resultado natural' },
];

// Header Component
const ClinicaHeader = ({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg border-b border-rose-100/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200/50">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 text-base md:text-lg tracking-tight">{config.business.name}</span>
              <span className="hidden sm:block text-xs text-rose-400 font-medium">Estética Avançada</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#procedimentos" className="text-slate-600 hover:text-rose-500 transition-colors text-sm font-medium">
              Procedimentos
            </a>
            <a href="#programas" className="text-slate-600 hover:text-rose-500 transition-colors text-sm font-medium">
              Programas
            </a>
            <a href="#sobre" className="text-slate-600 hover:text-rose-500 transition-colors text-sm font-medium">
              Sobre
            </a>
            <a href="#contato" className="text-slate-600 hover:text-rose-500 transition-colors text-sm font-medium">
              Contato
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
              className="hidden sm:flex bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-300/40 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
            
            <button 
              className="md:hidden p-2 text-slate-600 hover:text-rose-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden py-4 border-t border-rose-100"
          >
            <div className="flex flex-col gap-3">
              <a href="#procedimentos" className="text-slate-600 hover:text-rose-500 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Procedimentos</a>
              <a href="#programas" className="text-slate-600 hover:text-rose-500 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Programas</a>
              <a href="#sobre" className="text-slate-600 hover:text-rose-500 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Sobre</a>
              <a href="#contato" className="text-slate-600 hover:text-rose-500 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Contato</a>
              <Button 
                onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white mt-2"
              >
                Agendar Avaliação
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

// Hero Section
const HeroSection = ({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-rose-50 via-white to-pink-50/30">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 md:space-y-8 order-2 lg:order-1 text-center lg:text-left"
          >
            <div className="space-y-4">
              <Badge className="bg-white text-rose-600 border-rose-200 px-4 py-1.5 font-medium shadow-sm">
                ✨ Estética Avançada
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 leading-tight tracking-tight">
                Cuide da sua
                <span className="block font-semibold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                  beleza natural
                </span>
              </h1>
              
              <p className="text-base md:text-lg text-slate-500 max-w-lg leading-relaxed mx-auto lg:mx-0">
                {config.business.slogan}. Tratamentos personalizados com tecnologia avançada e resultados comprovados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg"
                onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 shadow-xl shadow-rose-300/40 text-base font-medium"
              >
                Agendar Avaliação
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-rose-200 text-slate-600 hover:bg-rose-50 hover:border-rose-300 font-medium"
                onClick={() => document.getElementById('procedimentos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Procedimentos
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 pt-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-rose-100">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-600 text-sm font-medium">4.9 (200+)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-rose-100">
                <Shield className="w-4 h-4 text-rose-500" />
                <span className="font-medium">+5 anos</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-rose-200/50">
              <img 
                src={heroImage} 
                alt="Tratamento estético profissional"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/10 to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-white rounded-2xl p-4 shadow-xl border border-rose-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-slate-800 font-bold text-lg">+2.000</p>
                  <p className="text-slate-500 text-sm">Clientes satisfeitas</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Diferenciais Section
const DiferenciaisSection = () => {
  const diferenciais = [
    { icon: Award, title: 'Profissionais Qualificados', desc: 'Equipe especializada e certificada' },
    { icon: Shield, title: 'Segurança Garantida', desc: 'Produtos e equipamentos de ponta' },
    { icon: Heart, title: 'Atendimento Humanizado', desc: 'Cuidado personalizado para você' },
    { icon: Sparkles, title: 'Tecnologia Avançada', desc: 'Tratamentos de última geração' },
  ];

  return (
    <section className="py-16 md:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {diferenciais.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-5 md:p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-100 hover:shadow-lg hover:shadow-rose-100/50 transition-all group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 md:w-7 md:h-7 text-rose-500" />
              </div>
              <h3 className="text-slate-800 font-semibold text-sm md:text-base mb-1">{item.title}</h3>
              <p className="text-slate-500 text-xs md:text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Procedimentos Section
const ProcedimentosSection = ({ code }: { code?: string }) => {
  const navigate = useNavigate();

  return (
    <section id="procedimentos" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4 font-medium">
            Nossos Tratamentos
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-tight">
            Procedimentos <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Estéticos</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
            Oferecemos uma variedade de tratamentos para cuidar da sua beleza e bem-estar
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {PROCEDIMENTOS.map((proc, index) => (
            <motion.div
              key={proc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white border-slate-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100/50 transition-all h-full group cursor-pointer overflow-hidden">
                <CardContent className="p-5 md:p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <proc.icon className="w-6 h-6 md:w-7 md:h-7 text-rose-500" />
                    </div>
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium">
                      {proc.duracao}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-slate-800 font-semibold text-base md:text-lg mb-2">{proc.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{proc.description}</p>
                  </div>

                  <Button 
                    variant="ghost"
                    className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 group/btn font-medium"
                    onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar?procedimento=${proc.id}` : `/clinica-estetica/agendar?procedimento=${proc.id}`)}
                  >
                    Agendar horário
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
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

// Programas Section
const ProgramasSection = ({ code }: { code?: string }) => {
  const navigate = useNavigate();

  return (
    <section id="programas" className="py-16 md:py-24 bg-gradient-to-br from-rose-50 via-pink-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <Badge className="bg-white text-rose-600 border-rose-200 mb-4 font-medium shadow-sm">
            Programas Especiais
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-tight">
            Pacotes <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Exclusivos</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
            Combine tratamentos e obtenha resultados ainda melhores
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {PROGRAMAS.map((prog, index) => (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={prog.destaque ? 'md:-mt-4 md:mb-4' : ''}
            >
              <Card className={`h-full transition-all ${prog.destaque 
                ? 'bg-gradient-to-br from-rose-500 to-pink-500 border-none shadow-2xl shadow-rose-300/50 text-white' 
                : 'bg-white border-slate-200 hover:shadow-xl hover:shadow-rose-100/50 hover:border-rose-200'}`}>
                <CardContent className="p-5 md:p-6 space-y-4">
                  {prog.destaque && (
                    <Badge className="bg-white/20 text-white border-white/30 text-xs font-medium">
                      Mais Popular
                    </Badge>
                  )}
                  
                  <div>
                    <h3 className={`font-bold text-lg md:text-xl mb-1 ${prog.destaque ? 'text-white' : 'text-slate-800'}`}>
                      {prog.name}
                    </h3>
                    <p className={`text-sm font-medium ${prog.destaque ? 'text-white/80' : 'text-rose-500'}`}>
                      {prog.sessoes}
                    </p>
                  </div>

                  <p className={`text-sm ${prog.destaque ? 'text-white/90' : 'text-slate-500'}`}>
                    {prog.descricao}
                  </p>

                  <ul className="space-y-2">
                    {prog.inclui.map((item, i) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${prog.destaque ? 'text-white/90' : 'text-slate-600'}`}>
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${prog.destaque ? 'text-white' : 'text-rose-500'}`} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full mt-4 font-medium ${prog.destaque 
                      ? 'bg-white text-rose-600 hover:bg-white/90 shadow-lg' 
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md'}`}
                    onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar?programa=${prog.id}` : `/clinica-estetica/agendar?programa=${prog.id}`)}
                  >
                    Selecionar
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

// Sobre Section
const SobreSection = () => {
  return (
    <section id="sobre" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
              <img 
                src={interiorImage}
                alt="Interior da clínica"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-white rounded-2xl p-4 md:p-5 shadow-xl border border-rose-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-slate-800 font-bold">+5 Anos</p>
                  <p className="text-slate-500 text-sm">de experiência</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 order-1 lg:order-2"
          >
            <Badge className="bg-rose-100 text-rose-600 border-rose-200 font-medium">
              Sobre Nós
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-800 leading-tight tracking-tight">
              Sua beleza em
              <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent"> boas mãos</span>
            </h2>
            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
              Nossa clínica foi fundada com o propósito de oferecer tratamentos estéticos de alta qualidade, 
              combinando tecnologia de ponta com um atendimento humanizado e personalizado.
            </p>
            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
              Contamos com profissionais altamente qualificados e constantemente atualizados 
              para proporcionar os melhores resultados de forma segura e eficaz.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">+2k</p>
                <p className="text-slate-500 text-xs md:text-sm">Clientes</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">4.9</p>
                <p className="text-slate-500 text-xs md:text-sm">Avaliação</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">5+</p>
                <p className="text-slate-500 text-xs md:text-sm">Anos</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Galeria Section
const GaleriaSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4 font-medium">
            Nossa Estrutura
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-tight">
            Conheça nosso <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Espaço</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {GALERIA.map((foto, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
            >
              <img 
                src={foto.src}
                alt={foto.alt}
                className={`w-full object-cover hover:scale-105 transition-transform duration-500 ${index === 0 ? 'aspect-square' : 'aspect-[4/3]'}`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Depoimentos Section
const DepoimentosSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-rose-50 via-pink-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <Badge className="bg-white text-rose-600 border-rose-200 mb-4 font-medium shadow-sm">
            Depoimentos
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-tight">
            O que nossas <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">clientes dizem</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {DEPOIMENTOS.map((dep, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white border-slate-200 h-full hover:shadow-xl hover:shadow-rose-100/50 transition-all">
                <CardContent className="p-5 md:p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base italic">
                    "{dep.texto}"
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center">
                      <span className="text-rose-600 font-semibold text-sm">{dep.nome.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-slate-800 font-semibold text-sm">{dep.nome}</p>
                      <p className="text-slate-400 text-xs">{dep.procedimento}</p>
                    </div>
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
    <section className="py-16 md:py-24 bg-gradient-to-r from-rose-500 to-pink-500 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white leading-tight tracking-tight">
            Pronta para realçar sua
            <span className="font-semibold block mt-2">beleza natural?</span>
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto text-sm md:text-base">
            Agende sua avaliação gratuita e descubra o tratamento ideal para você
          </p>
          <Button 
            size="lg"
            onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
            className="bg-white text-rose-600 hover:bg-white/90 shadow-xl px-8 font-semibold text-base"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Agora
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// Contato Section
const ContatoSection = ({ config }: { config: typeof DEFAULT_CONFIG }) => {
  return (
    <section id="contato" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4 font-medium">
            Contato
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-tight">
            Fale <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Conosco</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          <motion.a
            href={`https://wa.me/${config.business.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-xl hover:shadow-green-100/50 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-green-200/50 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <p className="text-slate-800 font-semibold text-base">WhatsApp</p>
            <p className="text-slate-500 text-sm">{config.business.phone}</p>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-200/50">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <p className="text-slate-800 font-semibold text-base">Endereço</p>
            <p className="text-slate-500 text-sm text-center">{config.business.address}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center mb-4 shadow-lg shadow-slate-200/50">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <p className="text-slate-800 font-semibold text-base">Horário</p>
            <p className="text-slate-500 text-sm text-center">Seg - Sáb: 9h às 19h</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = ({ config }: { config: typeof DEFAULT_CONFIG }) => {
  return (
    <footer className="bg-slate-900 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">{config.business.name}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Cuidando da sua beleza com excelência e dedicação.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#procedimentos" className="hover:text-white transition-colors">Procedimentos</a></li>
              <li><a href="#programas" className="hover:text-white transition-colors">Programas</a></li>
              <li><a href="#sobre" className="hover:text-white transition-colors">Sobre</a></li>
              <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Siga-nos</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-rose-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={`https://wa.me/${config.business.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} {config.business.name}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <span>Powered by</span>
            <span className="text-rose-400 font-medium">Genesis</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Page
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
      <GaleriaSection />
      <DepoimentosSection />
      <CTASection code={code} />
      <ContatoSection config={config} />
      <Footer config={config} />
    </div>
  );
}
