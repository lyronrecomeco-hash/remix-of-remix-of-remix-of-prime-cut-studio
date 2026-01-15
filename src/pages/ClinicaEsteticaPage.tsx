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
import { Separator } from '@/components/ui/separator';
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
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-sky-100/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-lg tracking-tight">{config.business.name}</span>
              <p className="text-xs text-sky-600 font-medium">Estética Avançada</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#procedimentos" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium relative group">
              Procedimentos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all" />
            </a>
            <a href="#programas" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium relative group">
              Programas
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all" />
            </a>
            <a href="#sobre" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium relative group">
              Sobre
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all" />
            </a>
            <a href="#contato" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium relative group">
              Contato
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
              className="hidden sm:flex bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/25 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
            
            <button 
              className="md:hidden p-2.5 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
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
            className="md:hidden py-4 border-t border-sky-100/50"
          >
            <div className="flex flex-col gap-1">
              <a href="#procedimentos" className="text-gray-700 hover:text-sky-600 hover:bg-sky-50 py-3 px-4 rounded-xl font-medium transition-all">Procedimentos</a>
              <a href="#programas" className="text-gray-700 hover:text-sky-600 hover:bg-sky-50 py-3 px-4 rounded-xl font-medium transition-all">Programas</a>
              <a href="#sobre" className="text-gray-700 hover:text-sky-600 hover:bg-sky-50 py-3 px-4 rounded-xl font-medium transition-all">Sobre</a>
              <a href="#contato" className="text-gray-700 hover:text-sky-600 hover:bg-sky-50 py-3 px-4 rounded-xl font-medium transition-all">Contato</a>
              <Button 
                onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white mt-3 shadow-lg shadow-sky-500/25"
              >
                <Calendar className="w-4 h-4 mr-2" />
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
    <section className="relative min-h-screen flex items-center pt-20 bg-gradient-to-br from-white via-sky-50/30 to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-400 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8 order-2 lg:order-1"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 border-sky-200 px-4 py-2 font-semibold shadow-sm">
                  ✨ Estética Avançada
                </Badge>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 leading-[1.1] tracking-tight">
                Cuide da sua
                <span className="block font-bold bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent mt-2">
                  beleza natural
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                {config.business.slogan}. Tratamentos personalizados com tecnologia avançada e resultados comprovados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-8 h-14 text-base font-semibold shadow-xl shadow-sky-500/30 rounded-xl"
              >
                Agendar Avaliação
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-gray-200 text-gray-700 hover:bg-white hover:border-sky-300 hover:text-sky-600 h-14 rounded-xl font-medium"
                onClick={() => document.getElementById('procedimentos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-4 h-4 mr-2" />
                Ver Procedimentos
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div>
                  <span className="text-gray-900 font-bold">4.9</span>
                  <span className="text-gray-500 text-sm ml-1">(200+ avaliações)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-sky-600" />
                </div>
                <span className="font-medium">+5 anos de experiência</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/20">
              <img 
                src={heroImage} 
                alt="Tratamento estético profissional"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-900/20 via-transparent to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, x: -30 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="absolute -bottom-6 -left-6 sm:-left-12 bg-white rounded-2xl p-5 shadow-2xl shadow-gray-900/10 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center">
                  <Users className="w-7 h-7 text-sky-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-2xl">+2.000</p>
                  <p className="text-gray-500 text-sm font-medium">Clientes satisfeitas</p>
                </div>
              </div>
            </motion.div>

            {/* Second Floating Element */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="absolute -top-4 -right-4 sm:-right-8 w-20 h-20 bg-gradient-to-br from-sky-400 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/40"
            >
              <Sparkles className="w-8 h-8 text-white" />
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
    <section className="py-20 bg-gradient-to-b from-sky-50/80 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Por que escolher a <span className="text-sky-600">Essence</span>?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Excelência em cada detalhe para entregar os melhores resultados
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {diferenciais.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-sky-600" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
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
    <section id="procedimentos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <Badge className="bg-sky-100 text-sky-700 border-sky-200 mb-4 font-semibold px-4 py-1.5">
            Nossos Tratamentos
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            Procedimentos <span className="font-bold text-sky-600">Estéticos</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Oferecemos uma variedade de tratamentos para cuidar da sua beleza e bem-estar
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {PROCEDIMENTOS.map((proc, index) => (
            <motion.div
              key={proc.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="bg-white border-gray-200 hover:border-sky-300 shadow-md hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 h-full group overflow-hidden">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center group-hover:scale-110 group-hover:from-sky-200 group-hover:to-sky-100 transition-all duration-300">
                      <proc.icon className="w-7 h-7 text-sky-600" />
                    </div>
                    <Badge className="bg-gray-100 text-gray-600 border-0 text-xs font-semibold">
                      {proc.duracao}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-900 font-bold text-xl mb-2 group-hover:text-sky-600 transition-colors">{proc.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{proc.description}</p>
                  </div>

                  <Button 
                    variant="ghost"
                    className="w-full text-sky-600 hover:text-sky-700 hover:bg-sky-50 group/btn font-semibold"
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
    <section id="programas" className="py-24 bg-gradient-to-b from-gray-50 via-sky-50/50 to-gray-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-400 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <Badge className="bg-sky-100 text-sky-700 border-sky-200 mb-4 font-semibold px-4 py-1.5">
            Programas Especiais
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            Pacotes <span className="font-bold text-sky-600">Exclusivos</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Combine tratamentos e obtenha resultados ainda melhores
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {PROGRAMAS.map((prog, index) => (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={prog.destaque ? 'md:-mt-6 md:mb-6' : ''}
            >
              <Card className={`h-full overflow-hidden ${prog.destaque 
                ? 'bg-white border-2 border-sky-400 shadow-2xl shadow-sky-200/50' 
                : 'bg-white border-gray-200 shadow-lg shadow-gray-100/50'}`}
              >
                {prog.destaque && (
                  <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-center py-3">
                    <span className="text-white text-sm font-bold tracking-wide">⭐ MAIS ESCOLHIDO</span>
                  </div>
                )}
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <h3 className="text-gray-900 font-bold text-2xl mb-2">{prog.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{prog.descricao}</p>
                    <Badge className={`${prog.destaque 
                      ? 'bg-sky-100 text-sky-700 border-sky-200' 
                      : 'bg-gray-100 text-gray-600 border-0'} font-semibold px-4 py-1.5`}>
                      {prog.sessoes}
                    </Badge>
                  </div>

                  <div className="space-y-3 py-4 border-t border-gray-100">
                    {prog.inclui.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-gray-600">
                        <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-sky-600" />
                        </div>
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full h-12 font-semibold ${prog.destaque 
                      ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/30' 
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-sky-300'}`}
                    onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar?programa=${prog.id}` : `/clinica-estetica/agendar?programa=${prog.id}`)}
                  >
                    Selecionar
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
    <section id="sobre" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/10">
              <img 
                src={interiorImage} 
                alt="Interior da clínica"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-sky-100 to-sky-50 rounded-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 order-1 lg:order-2"
          >
            <Badge className="bg-sky-100 text-sky-700 border-sky-200 font-semibold px-4 py-1.5">
              Sobre Nós
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 tracking-tight">
              Cuidado e <span className="font-bold text-sky-600">excelência</span>
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Nossa clínica nasceu do desejo de oferecer tratamentos estéticos de alta qualidade 
              com um atendimento verdadeiramente personalizado. Cada paciente é única, e por isso 
              desenvolvemos protocolos individualizados para alcançar os melhores resultados.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Contamos com profissionais especializados e certificados, equipamentos de última 
              geração e um ambiente acolhedor pensado para proporcionar conforto e bem-estar.
            </p>
            
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-100">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">+5</span>
                <p className="text-gray-600 text-sm font-medium mt-1">Anos</p>
              </div>
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-100">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">+2k</span>
                <p className="text-gray-600 text-sm font-medium mt-1">Clientes</p>
              </div>
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-100">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">+15</span>
                <p className="text-gray-600 text-sm font-medium mt-1">Tratamentos</p>
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
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <Badge className="bg-sky-100 text-sky-700 border-sky-200 mb-4 font-semibold px-4 py-1.5">
            Nossa Estrutura
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            Conheça nosso <span className="font-bold text-sky-600">espaço</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {GALERIA.map((foto, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 group ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
            >
              <div className="relative w-full h-full overflow-hidden">
                <img 
                  src={foto.src} 
                  alt={foto.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
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
    <section className="py-24 bg-gradient-to-b from-sky-50/80 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <Badge className="bg-sky-100 text-sky-700 border-sky-200 mb-4 font-semibold px-4 py-1.5">
            Depoimentos
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            O que nossas <span className="font-bold text-sky-600">clientes</span> dizem
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {DEPOIMENTOS.map((dep, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white border-gray-200 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:border-sky-200 transition-all duration-300 h-full">
                <CardContent className="p-8 space-y-5">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic leading-relaxed text-base">"{dep.texto}"</p>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-900 font-bold">{dep.nome}</p>
                    <p className="text-sky-600 text-sm font-medium">{dep.procedimento}</p>
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
const CTASection = ({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-sky-600 via-sky-500 to-sky-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-400/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-2xl shadow-sky-900/50 ring-4 ring-white/30">
              <img 
                src={clienteImage} 
                alt="Cliente satisfeita"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-6 tracking-tight">
            Pronta para <span className="font-bold">cuidar de você?</span>
          </h2>
          <p className="text-sky-100 max-w-xl mx-auto mb-10 leading-relaxed text-lg">
            Agende sua avaliação gratuita e descubra o tratamento ideal para você. 
            Nossa equipe está pronta para te receber.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
              className="bg-white text-sky-600 hover:bg-sky-50 px-10 h-14 font-bold shadow-2xl shadow-sky-900/30 rounded-xl"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Avaliação
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white/40 text-white hover:bg-white/10 h-14 rounded-xl font-semibold backdrop-blur-sm"
              onClick={() => window.open(`https://wa.me/${config.business.whatsapp}`, '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <Badge className="bg-sky-100 text-sky-700 border-sky-200 mb-4 font-semibold px-4 py-1.5">
            Contato
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            Entre em <span className="font-bold text-sky-600">contato</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 shadow-lg shadow-sky-100/30 hover:shadow-xl hover:border-sky-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">Telefone</h3>
              <p className="text-gray-600 font-medium">{config.business.phone}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group"
          >
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 shadow-lg shadow-sky-100/30 hover:shadow-xl hover:border-sky-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">Endereço</h3>
              <p className="text-gray-600 text-sm font-medium leading-relaxed">{config.business.address}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 shadow-lg shadow-sky-100/30 hover:shadow-xl hover:border-sky-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">Horários</h3>
              <p className="text-gray-600 font-medium">Seg-Sáb: 9h às 19h</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer
const FooterSection = ({ config }: { config: typeof DEFAULT_CONFIG }) => {
  return (
    <footer className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">{config.business.name}</span>
                <p className="text-xs text-sky-600 font-medium">Estética Avançada</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {config.business.slogan}
            </p>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-5">Links Rápidos</h4>
            <div className="space-y-3">
              <a href="#procedimentos" className="block text-gray-600 hover:text-sky-600 text-sm font-medium transition-colors">
                Procedimentos
              </a>
              <a href="#programas" className="block text-gray-600 hover:text-sky-600 text-sm font-medium transition-colors">
                Programas
              </a>
              <a href="#sobre" className="block text-gray-600 hover:text-sky-600 text-sm font-medium transition-colors">
                Sobre Nós
              </a>
              <a href="#contato" className="block text-gray-600 hover:text-sky-600 text-sm font-medium transition-colors">
                Contato
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-5">Redes Sociais</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-all border border-gray-200 shadow-sm hover:shadow-md"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={`https://wa.me/${config.business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-all border border-gray-200 shadow-sm hover:shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-200 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p className="font-medium">© {new Date().getFullYear()} {config.business.name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="/termos" className="hover:text-sky-600 transition-colors font-medium">Termos de Uso</a>
            <a href="/privacidade" className="hover:text-sky-600 transition-colors font-medium">Privacidade</a>
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
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <ClinicaHeader config={config} code={code} />
      <HeroSection config={config} code={code} />
      <DiferenciaisSection />
      <ProcedimentosSection code={code} />
      <ProgramasSection code={code} />
      <SobreSection />
      <GaleriaSection />
      <DepoimentosSection />
      <CTASection config={config} code={code} />
      <ContatoSection config={config} />
      <FooterSection config={config} />
    </div>
  );
}
