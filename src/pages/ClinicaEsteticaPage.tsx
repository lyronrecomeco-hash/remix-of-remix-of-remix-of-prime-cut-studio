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
  X
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
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-800 text-lg">{config.business.name}</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#procedimentos" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium">
              Procedimentos
            </a>
            <a href="#programas" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium">
              Programas
            </a>
            <a href="#sobre" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium">
              Sobre
            </a>
            <a href="#contato" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium">
              Contato
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
              className="hidden sm:flex bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
            
            <button 
              className="md:hidden p-2 text-gray-600"
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
            className="md:hidden py-4 border-t border-gray-100"
          >
            <div className="flex flex-col gap-3">
              <a href="#procedimentos" className="text-gray-600 hover:text-sky-600 py-2">Procedimentos</a>
              <a href="#programas" className="text-gray-600 hover:text-sky-600 py-2">Programas</a>
              <a href="#sobre" className="text-gray-600 hover:text-sky-600 py-2">Sobre</a>
              <a href="#contato" className="text-gray-600 hover:text-sky-600 py-2">Contato</a>
              <Button 
                onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                className="bg-sky-500 hover:bg-sky-600 text-white mt-2"
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
    <section className="relative min-h-screen flex items-center pt-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 order-2 lg:order-1"
          >
            <div className="space-y-4">
              <Badge className="bg-sky-50 text-sky-600 border-sky-200 px-4 py-1.5 font-medium">
                ✨ Estética Avançada
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-800 leading-tight">
                Cuide da sua
                <span className="block font-semibold text-sky-600">
                  beleza natural
                </span>
              </h1>
              
              <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
                {config.business.slogan}. Tratamentos personalizados com tecnologia avançada e resultados comprovados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                className="bg-sky-500 hover:bg-sky-600 text-white px-8 shadow-lg shadow-sky-500/20"
              >
                Agendar Avaliação
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => document.getElementById('procedimentos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Procedimentos
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">4.9/5 (200+ avaliações)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Shield className="w-4 h-4 text-sky-500" />
                <span>+5 anos de experiência</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
              <img 
                src={heroImage} 
                alt="Tratamento estético profissional"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold">+2.000</p>
                  <p className="text-gray-500 text-sm">Clientes satisfeitas</p>
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
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {diferenciais.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
                <item.icon className="w-7 h-7 text-sky-500" />
              </div>
              <h3 className="text-gray-800 font-medium mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
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
    <section id="procedimentos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-sky-50 text-sky-600 border-sky-200 mb-4">
            Nossos Tratamentos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-light text-gray-800 mb-4">
            Procedimentos <span className="font-semibold text-sky-600">Estéticos</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Oferecemos uma variedade de tratamentos para cuidar da sua beleza e bem-estar
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
              <Card className="bg-white border-gray-100 hover:border-sky-200 hover:shadow-lg transition-all h-full group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                      <proc.icon className="w-6 h-6 text-sky-500" />
                    </div>
                    <Badge variant="outline" className="border-gray-200 text-gray-500 text-xs">
                      {proc.duracao}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-800 font-semibold text-lg mb-2">{proc.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{proc.description}</p>
                  </div>

                  <Button 
                    variant="ghost"
                    className="w-full text-sky-600 hover:text-sky-700 hover:bg-sky-50 group/btn"
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
    <section id="programas" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-sky-50 text-sky-600 border-sky-200 mb-4">
            Programas Especiais
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-light text-gray-800 mb-4">
            Pacotes <span className="font-semibold text-sky-600">Exclusivos</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Combine tratamentos e obtenha resultados ainda melhores
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PROGRAMAS.map((prog, index) => (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={prog.destaque ? 'md:-mt-4 md:mb-4' : ''}
            >
              <Card className={`h-full ${prog.destaque 
                ? 'bg-white border-sky-200 shadow-lg shadow-sky-100' 
                : 'bg-white border-gray-100'}`}
              >
                {prog.destaque && (
                  <div className="text-center py-2 bg-sky-500 rounded-t-lg">
                    <span className="text-white text-sm font-medium">Mais Escolhido</span>
                  </div>
                )}
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <h3 className="text-gray-800 font-semibold text-xl mb-1">{prog.name}</h3>
                    <p className="text-gray-500 text-sm">{prog.descricao}</p>
                    <Badge variant="outline" className="mt-3 border-sky-200 text-sky-600">
                      {prog.sessoes}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {prog.inclui.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full ${prog.destaque 
                      ? 'bg-sky-500 hover:bg-sky-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
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
    <section id="sobre" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <img 
                src={interiorImage} 
                alt="Interior da clínica"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 order-1 lg:order-2"
          >
            <Badge className="bg-sky-50 text-sky-600 border-sky-200">
              Sobre Nós
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-light text-gray-800">
              Cuidado e <span className="font-semibold text-sky-600">excelência</span>
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Nossa clínica nasceu do desejo de oferecer tratamentos estéticos de alta qualidade 
              com um atendimento verdadeiramente personalizado. Cada paciente é única, e por isso 
              desenvolvemos protocolos individualizados para alcançar os melhores resultados.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Contamos com profissionais especializados e certificados, equipamentos de última 
              geração e um ambiente acolhedor pensado para proporcionar conforto e bem-estar.
            </p>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 rounded-2xl bg-slate-50">
                <span className="text-3xl font-semibold text-sky-600">+5</span>
                <p className="text-gray-500 text-sm">Anos</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-slate-50">
                <span className="text-3xl font-semibold text-sky-600">+2k</span>
                <p className="text-gray-500 text-sm">Clientes</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-slate-50">
                <span className="text-3xl font-semibold text-sky-600">+15</span>
                <p className="text-gray-500 text-sm">Tratamentos</p>
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
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-sky-50 text-sky-600 border-sky-200 mb-4">
            Nossa Estrutura
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-light text-gray-800 mb-4">
            Conheça nosso <span className="font-semibold text-sky-600">espaço</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALERIA.map((foto, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl overflow-hidden shadow-md ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
            >
              <img 
                src={foto.src} 
                alt={foto.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-sky-50 text-sky-600 border-sky-200 mb-4">
            Depoimentos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-light text-gray-800 mb-4">
            O que nossas <span className="font-semibold text-sky-600">clientes</span> dizem
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {DEPOIMENTOS.map((dep, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white border-gray-100 h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic leading-relaxed">"{dep.texto}"</p>
                  <div className="pt-2">
                    <p className="text-gray-800 font-medium">{dep.nome}</p>
                    <p className="text-sky-600 text-sm">{dep.procedimento}</p>
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
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100"
        >
          <div className="relative mb-8">
            <img 
              src={clienteImage} 
              alt="Cliente satisfeita"
              className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg border-4 border-white"
            />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-light text-gray-800 mb-4">
            Pronta para <span className="font-semibold text-sky-600">cuidar de você?</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
            Agende sua avaliação gratuita e descubra o tratamento ideal para você. 
            Nossa equipe está pronta para te receber.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 shadow-lg shadow-sky-500/20"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Avaliação
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
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
    <section id="contato" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-sky-50 text-sky-600 border-sky-200 mb-4">
            Contato
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-light text-gray-800 mb-4">
            Entre em <span className="font-semibold text-sky-600">contato</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-6 rounded-2xl bg-slate-50 border border-gray-100"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <Phone className="w-7 h-7 text-sky-500" />
            </div>
            <h3 className="text-gray-800 font-medium mb-2">Telefone</h3>
            <p className="text-gray-500">{config.business.phone}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center p-6 rounded-2xl bg-slate-50 border border-gray-100"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-sky-500" />
            </div>
            <h3 className="text-gray-800 font-medium mb-2">Endereço</h3>
            <p className="text-gray-500 text-sm">{config.business.address}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center p-6 rounded-2xl bg-slate-50 border border-gray-100"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-sky-500" />
            </div>
            <h3 className="text-gray-800 font-medium mb-2">Horários</h3>
            <p className="text-gray-500 text-sm">Seg-Sáb: 9h às 19h</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer
const FooterSection = ({ config }: { config: typeof DEFAULT_CONFIG }) => {
  return (
    <footer className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-800 text-lg">{config.business.name}</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {config.business.slogan}
            </p>
          </div>

          <div>
            <h4 className="text-gray-800 font-medium mb-4">Links Rápidos</h4>
            <div className="space-y-2">
              <a href="#procedimentos" className="block text-gray-500 hover:text-sky-600 text-sm transition-colors">
                Procedimentos
              </a>
              <a href="#programas" className="block text-gray-500 hover:text-sky-600 text-sm transition-colors">
                Programas
              </a>
              <a href="#sobre" className="block text-gray-500 hover:text-sky-600 text-sm transition-colors">
                Sobre Nós
              </a>
              <a href="#contato" className="block text-gray-500 hover:text-sky-600 text-sm transition-colors">
                Contato
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-gray-800 font-medium mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-all border border-gray-100"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={`https://wa.me/${config.business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition-all border border-gray-100"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-100 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {config.business.name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="/termos" className="hover:text-sky-600 transition-colors">Termos de Uso</a>
            <a href="/privacidade" className="hover:text-sky-600 transition-colors">Privacidade</a>
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
    <div className="min-h-screen bg-white text-gray-800">
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
