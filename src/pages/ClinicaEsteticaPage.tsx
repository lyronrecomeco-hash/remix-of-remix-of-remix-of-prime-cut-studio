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
  Zap
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
    primaryColor: '#B8860B',
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
    icon: Heart,
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

// Depoimentos
const DEPOIMENTOS = [
  {
    nome: 'Carolina M.',
    texto: 'Fiz o programa premium e os resultados foram incríveis! Minha pele nunca esteve tão bonita.',
    rating: 5,
    procedimento: 'Programa Premium',
  },
  {
    nome: 'Amanda S.',
    texto: 'Profissionais atenciosos e ambiente super aconchegante. Recomendo demais!',
    rating: 5,
    procedimento: 'Toxina Botulínica',
  },
  {
    nome: 'Juliana R.',
    texto: 'O preenchimento ficou natural e harmonioso. Exatamente o que eu queria!',
    rating: 5,
    procedimento: 'Preenchimento Facial',
  },
];

// Header Component
const ClinicaHeader = ({ config, code }: { config: typeof DEFAULT_CONFIG; code?: string }) => {
  const navigate = useNavigate();
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-md border-b border-stone-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-stone-900" />
            </div>
            <span className="font-semibold text-white text-lg">{config.business.name}</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#procedimentos" className="text-stone-300 hover:text-white transition-colors text-sm">
              Procedimentos
            </a>
            <a href="#programas" className="text-stone-300 hover:text-white transition-colors text-sm">
              Programas
            </a>
            <a href="#sobre" className="text-stone-300 hover:text-white transition-colors text-sm">
              Sobre Nós
            </a>
            <a href="#contato" className="text-stone-300 hover:text-white transition-colors text-sm">
              Contato
            </a>
          </div>

          <Button 
            onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white"
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
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Estética Avançada
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight">
                Realce sua
                <span className="block font-semibold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  beleza natural
                </span>
              </h1>
              
              <p className="text-lg text-stone-400 max-w-lg">
                {config.business.slogan}. Tratamentos personalizados com as mais avançadas tecnologias do mercado.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8"
              >
                Agendar Avaliação
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white"
                onClick={() => document.getElementById('procedimentos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Procedimentos
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-stone-400 text-sm">4.9/5 (200+ avaliações)</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-200/20 to-amber-500/20 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-amber-400" />
                  </div>
                  <p className="text-stone-400">Imagem de destaque</p>
                </div>
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-stone-900/90 backdrop-blur-xl rounded-xl p-4 border border-stone-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">+5 anos</p>
                  <p className="text-stone-400 text-sm">de experiência</p>
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
    <section className="py-20 bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {diferenciais.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-xl bg-stone-900/50 border border-stone-800/50"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-4">
                <item.icon className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-white font-medium mb-1">{item.title}</h3>
              <p className="text-stone-400 text-sm">{item.desc}</p>
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
    <section id="procedimentos" className="py-20 bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">
            Nossos Tratamentos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
            Procedimentos <span className="font-semibold text-amber-400">Estéticos</span>
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto">
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
              <Card className="bg-stone-900/80 border-stone-800 hover:border-amber-500/50 transition-all h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                      <proc.icon className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-amber-400 font-semibold">{proc.preco}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">{proc.name}</h3>
                    <p className="text-stone-400 text-sm">{proc.description}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-400">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>{proc.indicacao}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Duração: {proc.duracao}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-stone-800 hover:bg-stone-700 text-white border border-stone-700"
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
    <section id="programas" className="py-20 bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">
            Programas Especiais
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
            Pacotes <span className="font-semibold text-amber-400">Exclusivos</span>
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Combine tratamentos e economize com nossos programas personalizados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
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
                ? 'bg-gradient-to-b from-amber-500/20 to-stone-900 border-amber-500/50' 
                : 'bg-stone-900/80 border-stone-800'}`}
              >
                {prog.destaque && (
                  <div className="text-center py-2 bg-gradient-to-r from-amber-600 to-amber-700">
                    <span className="text-white text-sm font-medium">Mais Escolhido</span>
                  </div>
                )}
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-xl mb-1">{prog.name}</h3>
                    <p className="text-stone-400 text-sm">{prog.descricao}</p>
                    <Badge variant="outline" className="mt-3 border-amber-500/50 text-amber-400">
                      {prog.sessoes}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {prog.inclui.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-stone-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">{prog.preco}</span>
                  </div>

                  <Button 
                    className={`w-full ${prog.destaque 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600' 
                      : 'bg-stone-800 hover:bg-stone-700 border border-stone-700'} text-white`}
                    onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar?programa=${prog.id}` : `/clinica-estetica/agendar?programa=${prog.id}`)}
                  >
                    Selecionar Horário
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
    <section id="sobre" className="py-20 bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
              Sobre Nós
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-light text-white">
              Cuidado e <span className="font-semibold text-amber-400">excelência</span>
            </h2>
            <p className="text-stone-400">
              Nossa clínica nasceu do desejo de oferecer tratamentos estéticos de alta qualidade 
              com um atendimento verdadeiramente personalizado. Cada paciente é único, e por isso 
              desenvolvemos protocolos individualizados para alcançar os melhores resultados.
            </p>
            <p className="text-stone-400">
              Contamos com profissionais especializados e certificados, equipamentos de última 
              geração e um ambiente acolhedor pensado para proporcionar conforto e bem-estar 
              durante todo o tratamento.
            </p>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-amber-400">+5</span>
                <p className="text-stone-400 text-sm">Anos de experiência</p>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-amber-400">+2000</span>
                <p className="text-stone-400 text-sm">Clientes satisfeitas</p>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-amber-400">+15</span>
                <p className="text-stone-400 text-sm">Procedimentos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-4">
                <Users className="w-16 h-16 text-amber-400 mx-auto" />
                <p className="text-stone-400">Imagem da equipe</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Depoimentos Section
const DepoimentosSection = () => {
  return (
    <section className="py-20 bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">
            Depoimentos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
            O que nossas <span className="font-semibold text-amber-400">clientes</span> dizem
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {DEPOIMENTOS.map((dep, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-stone-900/80 border-stone-800 h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(dep.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-300 italic">"{dep.texto}"</p>
                  <div>
                    <p className="text-white font-medium">{dep.nome}</p>
                    <p className="text-amber-400 text-sm">{dep.procedimento}</p>
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
    <section className="py-20 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white">
            Pronta para <span className="font-semibold text-amber-400">transformar</span> sua pele?
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            Agende sua avaliação gratuita e descubra o tratamento ideal para você. 
            Nossa equipe está pronta para te receber.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg"
              onClick={() => navigate(code ? `/clinica-estetica/${code}/agendar` : '/clinica-estetica/agendar')}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Avaliação
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-stone-700 text-stone-300 hover:bg-stone-800"
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
    <section id="contato" className="py-20 bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">
            Contato
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
            Entre em <span className="font-semibold text-amber-400">contato</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-6 rounded-xl bg-stone-900/80 border border-stone-800"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-4">
              <Phone className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-white font-medium mb-2">Telefone</h3>
            <p className="text-stone-400">{config.business.phone}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center p-6 rounded-xl bg-stone-900/80 border border-stone-800"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-white font-medium mb-2">Endereço</h3>
            <p className="text-stone-400 text-sm">{config.business.address}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center p-6 rounded-xl bg-stone-900/80 border border-stone-800"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-white font-medium mb-2">Horários</h3>
            <p className="text-stone-400 text-sm">Seg-Sáb: 9h às 19h</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer
const FooterSection = ({ config }: { config: typeof DEFAULT_CONFIG }) => {
  return (
    <footer className="py-12 bg-stone-950 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-stone-900" />
              </div>
              <span className="font-semibold text-white text-lg">{config.business.name}</span>
            </div>
            <p className="text-stone-400 text-sm">
              {config.business.slogan}
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Links Rápidos</h4>
            <div className="space-y-2">
              <a href="#procedimentos" className="block text-stone-400 hover:text-amber-400 text-sm transition-colors">
                Procedimentos
              </a>
              <a href="#programas" className="block text-stone-400 hover:text-amber-400 text-sm transition-colors">
                Programas
              </a>
              <a href="#sobre" className="block text-stone-400 hover:text-amber-400 text-sm transition-colors">
                Sobre Nós
              </a>
              <a href="#contato" className="block text-stone-400 hover:text-amber-400 text-sm transition-colors">
                Contato
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-amber-500/20 hover:text-amber-400 transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={`https://wa.me/${config.business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-amber-500/20 hover:text-amber-400 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-stone-800 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>© {new Date().getFullYear()} {config.business.name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="/termos" className="hover:text-amber-400 transition-colors">Termos de Uso</a>
            <a href="/privacidade" className="hover:text-amber-400 transition-colors">Privacidade</a>
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
    <div className="min-h-screen bg-stone-950 text-white">
      <ClinicaHeader config={config} code={code} />
      <HeroSection config={config} code={code} />
      <DiferenciaisSection />
      <ProcedimentosSection code={code} />
      <ProgramasSection code={code} />
      <SobreSection />
      <DepoimentosSection />
      <CTASection config={config} code={code} />
      <ContatoSection config={config} />
      <FooterSection config={config} />
    </div>
  );
}
