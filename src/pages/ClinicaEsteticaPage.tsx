import { useState } from 'react';
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
  Play,
  Quote,
  Mail,
  Crown,
  Flower2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Configuração padrão
const DEFAULT_CONFIG = {
  business: {
    name: 'Essence Estética',
    phone: '(11) 99999-9999',
    whatsapp: '5511999999999',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    slogan: 'Estética avançada com atendimento personalizado',
  },
  branding: {
    primaryColor: '#D4A574',
    secondaryColor: '#1A1A1A',
    accentColor: '#FFFFFF',
  },
};

// Procedimentos
const PROCEDIMENTOS = [
  {
    id: 'limpeza',
    name: 'Limpeza de Pele Profunda',
    description: 'Remoção de impurezas, cravos e células mortas com técnicas avançadas.',
    indicacao: 'Todos os tipos de pele',
    duracao: '1h30',
    preco: 'R$ 180',
    icon: Sparkles,
  },
  {
    id: 'botox',
    name: 'Toxina Botulínica',
    description: 'Tratamento para suavização de rugas e linhas de expressão.',
    indicacao: 'Rugas dinâmicas, linhas de expressão',
    duracao: '30min',
    preco: 'A partir de R$ 800',
    icon: Gem,
  },
  {
    id: 'preenchimento',
    name: 'Preenchimento Facial',
    description: 'Ácido hialurônico para restaurar volume e contornos do rosto.',
    indicacao: 'Lábios, bigode chinês, olheiras',
    duracao: '45min',
    preco: 'A partir de R$ 1.200',
    icon: Heart,
  },
  {
    id: 'peeling',
    name: 'Peeling Químico',
    description: 'Renovação celular para tratamento de manchas e textura da pele.',
    indicacao: 'Manchas, melasma, acne',
    duracao: '45min',
    preco: 'R$ 250',
    icon: Leaf,
  },
  {
    id: 'microagulhamento',
    name: 'Microagulhamento',
    description: 'Estímulo de colágeno para rejuvenescimento e tratamento de cicatrizes.',
    indicacao: 'Flacidez, cicatrizes, estrias',
    duracao: '1h',
    preco: 'R$ 350',
    icon: Zap,
  },
  {
    id: 'drenagem',
    name: 'Drenagem Linfática',
    description: 'Massagem especializada para redução de inchaço e eliminação de toxinas.',
    indicacao: 'Retenção de líquidos, pós-operatório',
    duracao: '1h',
    preco: 'R$ 150',
    icon: Flower2,
  },
];

// Planos/Programas
const PROGRAMAS = [
  {
    id: 'essencial',
    name: 'Programa Essencial',
    sessoes: '4 sessões',
    descricao: 'Ideal para manutenção da saúde da pele',
    inclui: ['2x Limpeza de Pele', '2x Hidratação Intensiva'],
    preco: 'R$ 580',
    destaque: false,
  },
  {
    id: 'premium',
    name: 'Programa Premium',
    sessoes: '8 sessões',
    descricao: 'Tratamento completo de rejuvenescimento',
    inclui: ['3x Limpeza de Pele', '3x Peeling', '2x Microagulhamento'],
    preco: 'R$ 1.890',
    destaque: true,
  },
  {
    id: 'noiva',
    name: 'Programa Noiva',
    sessoes: '12 sessões',
    descricao: 'Preparação completa para o grande dia',
    inclui: ['4x Limpeza', '4x Peeling', '2x Microagulhamento', '2x Drenagem'],
    preco: 'R$ 2.980',
    destaque: false,
  },
];

// Profissionais
const PROFISSIONAIS = [
  {
    nome: 'Dra. Isabella Martins',
    especialidade: 'Harmonização Facial',
    descricao: 'Especialista em procedimentos minimamente invasivos com mais de 8 anos de experiência.',
    formacao: 'CRM 123456',
  },
  {
    nome: 'Dra. Beatriz Costa',
    especialidade: 'Dermatologia Estética',
    descricao: 'Referência em tratamentos de pele e protocolos personalizados.',
    formacao: 'CRM 789012',
  },
  {
    nome: 'Ana Paula Silva',
    especialidade: 'Esteticista Senior',
    descricao: 'Especializada em massagens e tratamentos corporais relaxantes.',
    formacao: 'CREFITO 345678',
  },
];

// Depoimentos
const DEPOIMENTOS = [
  {
    nome: 'Carolina M.',
    texto: 'Fiz o programa premium e os resultados foram incríveis! Minha pele nunca esteve tão bonita e radiante.',
    rating: 5,
    procedimento: 'Programa Premium',
    foto: null,
  },
  {
    nome: 'Amanda S.',
    texto: 'Profissionais atenciosos e ambiente super aconchegante. Me sinto acolhida toda vez que venho.',
    rating: 5,
    procedimento: 'Toxina Botulínica',
    foto: null,
  },
  {
    nome: 'Juliana R.',
    texto: 'O preenchimento ficou natural e harmonioso. Exatamente o que eu queria! Super recomendo.',
    rating: 5,
    procedimento: 'Preenchimento Facial',
    foto: null,
  },
  {
    nome: 'Fernanda L.',
    texto: 'A limpeza de pele mais completa que já fiz! Saí de lá com a pele renovada.',
    rating: 5,
    procedimento: 'Limpeza de Pele',
    foto: null,
  },
];

// Galeria
const GALERIA = [
  { id: 1, categoria: 'Ambiente' },
  { id: 2, categoria: 'Tratamentos' },
  { id: 3, categoria: 'Resultados' },
  { id: 4, categoria: 'Equipe' },
  { id: 5, categoria: 'Ambiente' },
  { id: 6, categoria: 'Tratamentos' },
];

// Header Component
const ClinicaHeader = ({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Detectar scroll
  useState(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-200 via-rose-300 to-rose-400 flex items-center justify-center shadow-lg">
              <Flower2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className={`font-serif font-semibold text-xl ${isScrolled ? 'text-stone-800' : 'text-white'}`}>
                {config.business.name}
              </span>
              <p className={`text-xs ${isScrolled ? 'text-rose-400' : 'text-rose-200'}`}>Estética Avançada</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {['Procedimentos', 'Programas', 'Equipe', 'Galeria', 'Contato'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className={`text-sm font-medium transition-colors hover:text-rose-400 ${
                  isScrolled ? 'text-stone-600' : 'text-white/90'
                }`}
              >
                {item}
              </a>
            ))}
          </div>

          <Button 
            onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
            className="bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-500/25 border-0"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

// Hero Section
const HeroSection = ({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background com gradiente elegante */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-rose-900/30" />
      
      {/* Imagem de fundo simulada com overlay */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500/20 via-transparent to-transparent" />
      </div>
      
      {/* Elementos decorativos */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-rose-300/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-200/5 rounded-full blur-3xl" />
      
      {/* Padrão decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-white/10 backdrop-blur-sm text-rose-200 border-rose-300/30 px-4 py-2 text-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Clínica de Estética Premium
                </Badge>
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-light text-white leading-[1.1]">
                Descubra sua
                <span className="block font-medium bg-gradient-to-r from-rose-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                  beleza natural
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-stone-300 max-w-lg leading-relaxed">
                Tratamentos estéticos personalizados com tecnologia de ponta e profissionais 
                especializados para realçar o melhor de você.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                className="bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-8 h-14 text-base shadow-xl shadow-rose-500/30 border-0"
              >
                Agendar Avaliação Gratuita
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-14 backdrop-blur-sm"
                onClick={() => document.getElementById('procedimentos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-5 h-5 mr-2" />
                Conhecer Tratamentos
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-6">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-rose-300 text-rose-300" />
                  ))}
                </div>
                <span className="text-stone-300 text-sm">4.9/5 • 200+ avaliações</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300 text-sm">
                <Shield className="w-4 h-4 text-rose-300" />
                <span>Profissionais Certificados</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image/Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main visual container */}
              <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-rose-100/20 to-rose-200/10 backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-rose-300/30 to-rose-400/20 flex items-center justify-center backdrop-blur-sm">
                      <Flower2 className="w-16 h-16 text-rose-200" />
                    </div>
                    <p className="text-rose-200/60 text-sm">Imagem de destaque premium</p>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -left-8 top-1/4 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-stone-800 font-semibold text-lg">+5 Anos</p>
                    <p className="text-stone-500 text-sm">de Experiência</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-6 bottom-1/4 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-stone-800 font-semibold text-lg">+2.000</p>
                    <p className="text-stone-500 text-sm">Clientes Satisfeitas</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// Diferenciais Section
const DiferenciaisSection = () => {
  const diferenciais = [
    { icon: Crown, title: 'Atendimento VIP', desc: 'Experiência exclusiva e personalizada' },
    { icon: Shield, title: 'Segurança Total', desc: 'Produtos e equipamentos certificados' },
    { icon: Award, title: 'Profissionais Expert', desc: 'Equipe altamente qualificada' },
    { icon: Sparkles, title: 'Tecnologia Avançada', desc: 'Tratamentos de última geração' },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-rose-50/50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4">
            Por que nos escolher
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-800 mb-4">
            Excelência em cada <span className="text-rose-500">detalhe</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {diferenciais.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group text-center p-8 rounded-2xl bg-white shadow-lg shadow-stone-100 hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300 border border-stone-100"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-stone-800 font-semibold mb-2">{item.title}</h3>
              <p className="text-stone-500 text-sm">{item.desc}</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4">
            Nossos Tratamentos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-800 mb-4">
            Procedimentos <span className="text-rose-500">Estéticos</span>
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Tratamentos personalizados para realçar sua beleza natural com resultados comprovados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROCEDIMENTOS.map((proc, index) => (
            <motion.div
              key={proc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white border-stone-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300 h-full group">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <proc.icon className="w-7 h-7 text-rose-500" />
                    </div>
                    <span className="text-rose-500 font-semibold text-lg">{proc.preco}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-stone-800 font-semibold text-lg mb-2">{proc.name}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{proc.description}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-500">
                      <CheckCircle2 className="w-4 h-4 text-rose-400" />
                      <span>{proc.indicacao}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500">
                      <Clock className="w-4 h-4 text-rose-400" />
                      <span>Duração: {proc.duracao}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-stone-100 hover:bg-gradient-to-r hover:from-rose-400 hover:to-rose-500 text-stone-700 hover:text-white transition-all duration-300"
                    onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar?procedimento=${proc.id}` : `/clinica-estetica/agendar?procedimento=${proc.id}`)}
                  >
                    Agendar Horário
                    <ChevronRight className="w-4 h-4 ml-2" />
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
    <section id="programas" className="py-24 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4">
            Programas Especiais
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-800 mb-4">
            Pacotes <span className="text-rose-500">Exclusivos</span>
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Combine tratamentos e potencialize seus resultados com nossos programas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {PROGRAMAS.map((prog, index) => (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={prog.destaque ? 'md:-mt-4 md:mb-4' : ''}
            >
              <Card className={`h-full transition-all duration-300 ${prog.destaque 
                ? 'bg-gradient-to-b from-rose-500 to-rose-600 border-0 shadow-2xl shadow-rose-500/30' 
                : 'bg-white border-stone-200 hover:border-rose-300 hover:shadow-lg'}`}
              >
                {prog.destaque && (
                  <div className="text-center py-2 bg-rose-400/30">
                    <span className="text-white text-sm font-medium flex items-center justify-center gap-2">
                      <Crown className="w-4 h-4" />
                      Mais Escolhido
                    </span>
                  </div>
                )}
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <h3 className={`font-serif text-2xl mb-2 ${prog.destaque ? 'text-white' : 'text-stone-800'}`}>
                      {prog.name}
                    </h3>
                    <p className={`text-sm ${prog.destaque ? 'text-rose-100' : 'text-stone-500'}`}>
                      {prog.descricao}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`mt-4 ${prog.destaque 
                        ? 'border-white/30 text-white' 
                        : 'border-rose-200 text-rose-500'}`}
                    >
                      {prog.sessoes}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {prog.inclui.map((item, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-3 text-sm ${
                          prog.destaque ? 'text-white' : 'text-stone-600'
                        }`}
                      >
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${
                          prog.destaque ? 'text-rose-200' : 'text-rose-400'
                        }`} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <span className={`text-4xl font-bold ${prog.destaque ? 'text-white' : 'text-stone-800'}`}>
                      {prog.preco}
                    </span>
                  </div>

                  <Button 
                    className={`w-full h-12 ${prog.destaque 
                      ? 'bg-white text-rose-600 hover:bg-rose-50' 
                      : 'bg-gradient-to-r from-rose-400 to-rose-500 text-white hover:from-rose-500 hover:to-rose-600'}`}
                    onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar?programa=${prog.id}` : `/clinica-estetica/agendar?programa=${prog.id}`)}
                  >
                    Selecionar Programa
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

// Profissionais Section
const ProfissionaisSection = () => {
  return (
    <section id="equipe" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4">
            Nossa Equipe
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-800 mb-4">
            Profissionais <span className="text-rose-500">Especialistas</span>
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Uma equipe dedicada a proporcionar os melhores resultados para você
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {PROFISSIONAIS.map((prof, index) => (
            <motion.div
              key={prof.nome}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative bg-gradient-to-b from-stone-50 to-white rounded-3xl p-8 text-center border border-stone-100 hover:border-rose-200 hover:shadow-xl transition-all duration-300">
                {/* Avatar placeholder */}
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-rose-200 to-rose-300 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-rose-100">
                  <Users className="w-12 h-12 text-white" />
                </div>
                
                <h3 className="text-stone-800 font-semibold text-xl mb-1">{prof.nome}</h3>
                <p className="text-rose-500 font-medium text-sm mb-3">{prof.especialidade}</p>
                <p className="text-stone-500 text-sm mb-4 leading-relaxed">{prof.descricao}</p>
                <Badge variant="outline" className="border-stone-200 text-stone-400 text-xs">
                  {prof.formacao}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Galeria Section
const GaleriaSection = () => {
  return (
    <section id="galeria" className="py-24 bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4">
            Nossa Clínica
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-800 mb-4">
            Galeria de <span className="text-rose-500">Imagens</span>
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Conheça nosso espaço projetado para seu conforto e bem-estar
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALERIA.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <div className={`bg-gradient-to-br from-rose-100 to-stone-100 flex items-center justify-center ${
                index === 0 ? 'aspect-square md:aspect-auto md:h-full' : 'aspect-square'
              }`}>
                <div className="text-center p-6">
                  <Flower2 className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">{item.categoria}</p>
                </div>
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-rose-600/80 via-rose-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                <span className="text-white font-medium">{item.categoria}</span>
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
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4">
            Depoimentos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-800 mb-4">
            O que nossas <span className="text-rose-500">clientes</span> dizem
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEPOIMENTOS.map((dep, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-b from-stone-50 to-white border-stone-100 h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <Quote className="w-8 h-8 text-rose-200" />
                  <div className="flex gap-0.5">
                    {[...Array(dep.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">"{dep.texto}"</p>
                  <div className="pt-2 border-t border-stone-100">
                    <p className="text-stone-800 font-medium">{dep.nome}</p>
                    <p className="text-rose-500 text-xs">{dep.procedimento}</p>
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
    <section className="py-24 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">
            Pronta para sua transformação?
          </h2>
          <p className="text-rose-100 max-w-xl mx-auto text-lg">
            Agende sua avaliação gratuita e descubra o tratamento ideal para realçar sua beleza natural.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg"
              onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
              className="bg-white text-rose-600 hover:bg-rose-50 px-8 h-14 text-base shadow-xl"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Avaliação Gratuita
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 h-14"
              onClick={() => window.open(`https://wa.me/${config.business.whatsapp}`, '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar no WhatsApp
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
    <section id="contato" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 mb-4">
            Contato
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-800 mb-4">
            Entre em <span className="text-rose-500">contato</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Phone, title: 'Telefone', value: config.business.phone },
            { icon: MessageCircle, title: 'WhatsApp', value: config.business.phone },
            { icon: Mail, title: 'E-mail', value: 'contato@essence.com.br' },
            { icon: Clock, title: 'Horário', value: 'Seg-Sáb: 9h às 19h' },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white border border-stone-100 hover:shadow-lg hover:border-rose-200 transition-all duration-300"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-stone-800 font-medium mb-2">{item.title}</h3>
              <p className="text-stone-500 text-sm">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Endereço */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 max-w-2xl mx-auto"
        >
          <div className="text-center p-8 rounded-2xl bg-white border border-stone-100">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-stone-800 font-medium mb-2">Endereço</h3>
            <p className="text-stone-500">{config.business.address}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const FooterSection = ({ config }: { config: typeof DEFAULT_CONFIG }) => {
  return (
    <footer className="py-16 bg-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-300 to-rose-400 flex items-center justify-center">
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-serif font-semibold text-white text-xl block">
                  {config.business.name}
                </span>
                <span className="text-rose-300 text-xs">Estética Avançada</span>
              </div>
            </div>
            <p className="text-stone-400 text-sm max-w-md leading-relaxed mb-6">
              {config.business.slogan}. Tratamentos personalizados com tecnologia de ponta 
              para realçar sua beleza natural.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-rose-500 hover:text-white transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={`https://wa.me/${config.business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-rose-500 hover:text-white transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Links Rápidos</h4>
            <div className="space-y-3">
              {['Procedimentos', 'Programas', 'Equipe', 'Galeria', 'Contato'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="block text-stone-400 hover:text-rose-400 text-sm transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Horário</h4>
            <div className="space-y-2 text-stone-400 text-sm">
              <p>Segunda a Sexta</p>
              <p className="text-rose-400">9h às 19h</p>
              <p className="mt-4">Sábado</p>
              <p className="text-rose-400">9h às 15h</p>
            </div>
          </div>
        </div>

        <Separator className="bg-stone-800 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>© {new Date().getFullYear()} {config.business.name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="/termos" className="hover:text-rose-400 transition-colors">Termos de Uso</a>
            <a href="/privacidade" className="hover:text-rose-400 transition-colors">Privacidade</a>
            <a href="/lgpd" className="hover:text-rose-400 transition-colors">LGPD</a>
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
      <ProfissionaisSection />
      <GaleriaSection />
      <DepoimentosSection />
      <CTASection config={config} code={code} />
      <ContatoSection config={config} />
      <FooterSection config={config} />
    </div>
  );
}
