import { motion } from "framer-motion";
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
  ArrowRight,
  CheckCircle2,
  Instagram,
  Facebook
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import clinicaHero from "@/assets/clinica-hero.jpg";
import clinicaInterior from "@/assets/clinica-interior.jpg";
import clinicaCliente from "@/assets/clinica-cliente.jpg";
import clinicaProcedimento from "@/assets/clinica-procedimento.jpg";

const ClinicaEsteticaPage = () => {
  const navigate = useNavigate();

  const procedimentos = [
    {
      nome: "Harmonização Facial",
      descricao: "Realce sua beleza natural com técnicas avançadas e resultados sutis.",
      duracao: "60 min",
      icon: Sparkles
    },
    {
      nome: "Bioestimuladores",
      descricao: "Estimule a produção natural de colágeno para uma pele mais firme.",
      duracao: "45 min",
      icon: Heart
    },
    {
      nome: "Skincare Avançado",
      descricao: "Protocolos personalizados para renovação e vitalidade da pele.",
      duracao: "90 min",
      icon: Shield
    },
    {
      nome: "Tratamentos Corporais",
      descricao: "Tecnologias de ponta para modelagem e definição corporal.",
      duracao: "60 min",
      icon: Award
    }
  ];

  const diferenciais = [
    { icon: Award, titulo: "Profissionais Especializados", texto: "Equipe com formação internacional" },
    { icon: Shield, titulo: "Tecnologia de Ponta", texto: "Equipamentos de última geração" },
    { icon: Heart, titulo: "Atendimento Humanizado", texto: "Cuidado personalizado para você" },
    { icon: Users, titulo: "+5.000 Clientes", texto: "Satisfação comprovada" }
  ];

  const depoimentos = [
    {
      nome: "Carolina M.",
      texto: "Profissionalismo impecável. Os resultados superaram minhas expectativas.",
      nota: 5
    },
    {
      nome: "Fernanda S.",
      texto: "Ambiente acolhedor e equipe extremamente qualificada. Recomendo!",
      nota: 5
    },
    {
      nome: "Juliana R.",
      texto: "Tratamento personalizado que fez toda diferença. Estou muito satisfeita.",
      nota: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">Estética Avançada</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#procedimentos" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Procedimentos</a>
              <a href="#sobre" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Sobre</a>
              <a href="#depoimentos" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Depoimentos</a>
              <a href="#contato" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Contato</a>
            </nav>

            <Button 
              onClick={() => navigate('/clinica-estetica/agendar')}
              className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm px-4 sm:px-6 h-9 sm:h-10 rounded-full"
            >
              <span className="hidden sm:inline">Agendar Consulta</span>
              <span className="sm:hidden">Agendar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-5rem)]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="py-8 lg:py-0"
            >
              <span className="inline-flex items-center gap-2 text-sm text-neutral-500 mb-4 sm:mb-6">
                <span className="w-8 h-px bg-neutral-300"></span>
                Clínica de Estética Premium
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-neutral-900 leading-[1.1] mb-4 sm:mb-6">
                Beleza que
                <span className="block font-medium">revela você</span>
              </h1>
              
              <p className="text-base sm:text-lg text-neutral-500 leading-relaxed mb-6 sm:mb-8 max-w-lg">
                Tratamentos estéticos personalizados com tecnologia avançada 
                e profissionais especializados para realçar sua beleza natural.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <Button 
                  onClick={() => navigate('/clinica-estetica/agendar')}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white h-12 sm:h-14 px-6 sm:px-8 rounded-full text-sm sm:text-base"
                >
                  Agendar Avaliação Gratuita
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 h-12 sm:h-14 px-6 sm:px-8 rounded-full text-sm sm:text-base"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  (11) 99999-9999
                </Button>
              </div>

              <div className="flex items-center gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-neutral-100">
                <div>
                  <p className="text-2xl sm:text-3xl font-semibold text-neutral-900">+5.000</p>
                  <p className="text-xs sm:text-sm text-neutral-500">Clientes satisfeitos</p>
                </div>
                <div className="w-px h-10 sm:h-12 bg-neutral-200"></div>
                <div>
                  <p className="text-2xl sm:text-3xl font-semibold text-neutral-900">12 anos</p>
                  <p className="text-xs sm:text-sm text-neutral-500">De experiência</p>
                </div>
                <div className="w-px h-10 sm:h-12 bg-neutral-200"></div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-neutral-900 text-neutral-900" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500">Avaliação 5.0</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden">
                <img 
                  src={clinicaHero}
                  alt="Clínica de Estética"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -left-4 sm:-left-8 bottom-8 sm:bottom-16 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-neutral-100"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-neutral-500">Próximo horário</p>
                    <p className="text-sm sm:text-base font-medium text-neutral-900">Hoje, 14:30</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 sm:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {diferenciais.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-4 sm:p-6"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" />
                </div>
                <h3 className="text-sm sm:text-base font-medium text-neutral-900 mb-1">{item.titulo}</h3>
                <p className="text-xs sm:text-sm text-neutral-500">{item.texto}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Procedimentos */}
      <section id="procedimentos" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 text-sm text-neutral-500 mb-3 sm:mb-4">
              <span className="w-8 h-px bg-neutral-300"></span>
              Nossos Procedimentos
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-neutral-900 mb-3 sm:mb-4">
              Tratamentos <span className="font-medium">especializados</span>
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base">
              Protocolos desenvolvidos com as técnicas mais avançadas do mercado.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {procedimentos.map((proc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-neutral-900 transition-colors duration-300">
                  <proc.icon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-2">{proc.nome}</h3>
                <p className="text-xs sm:text-sm text-neutral-500 mb-4 leading-relaxed">{proc.descricao}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {proc.duracao}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12"
          >
            <Button 
              variant="outline"
              onClick={() => navigate('/clinica-estetica/agendar')}
              className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 h-11 sm:h-12 px-6 sm:px-8 rounded-full text-sm"
            >
              Ver todos os procedimentos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-16 sm:py-24 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <span className="inline-flex items-center gap-2 text-sm text-neutral-400 mb-4 sm:mb-6">
                <span className="w-8 h-px bg-neutral-600"></span>
                Sobre Nós
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-light text-white mb-4 sm:mb-6">
                Excelência em <span className="font-medium">estética</span>
              </h2>
              
              <p className="text-neutral-400 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                Há mais de 12 anos transformando vidas através de tratamentos estéticos 
                personalizados. Nossa clínica combina tecnologia de ponta com profissionais 
                altamente qualificados para entregar resultados naturais e duradouros.
              </p>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  "Equipe com certificação internacional",
                  "Protocolos exclusivos e personalizados",
                  "Ambiente moderno e acolhedor",
                  "Acompanhamento pós-procedimento"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                    <span className="text-neutral-300 text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => navigate('/clinica-estetica/agendar')}
                className="bg-white text-neutral-900 hover:bg-neutral-100 h-11 sm:h-12 px-6 sm:px-8 rounded-full text-sm"
              >
                Conhecer a clínica
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden">
                <img 
                  src={clinicaInterior}
                  alt="Interior da Clínica"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 text-sm text-neutral-500 mb-3 sm:mb-4 justify-center">
              <span className="w-8 h-px bg-neutral-300"></span>
              Nossa Estrutura
              <span className="w-8 h-px bg-neutral-300"></span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-neutral-900">
              Ambiente <span className="font-medium">exclusivo</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="col-span-2 lg:col-span-2 row-span-2"
            >
              <div className="aspect-[4/3] lg:aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden">
                <img src={clinicaInterior} alt="Clínica" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden">
                <img src={clinicaProcedimento} alt="Procedimento" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden">
                <img src={clinicaCliente} alt="Cliente" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-16 sm:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 text-sm text-neutral-500 mb-3 sm:mb-4 justify-center">
              <span className="w-8 h-px bg-neutral-300"></span>
              Depoimentos
              <span className="w-8 h-px bg-neutral-300"></span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-neutral-900">
              O que dizem <span className="font-medium">nossas clientes</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {depoimentos.map((dep, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 sm:p-8 border border-neutral-100"
              >
                <div className="flex items-center gap-1 mb-4 sm:mb-6">
                  {[...Array(dep.nota)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-neutral-900 text-neutral-900" />
                  ))}
                </div>
                
                <p className="text-neutral-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">"{dep.texto}"</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-medium text-neutral-600">{dep.nome.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900">{dep.nome}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 mb-4 sm:mb-6">
              Pronta para <span className="font-medium">transformar</span> sua beleza?
            </h2>
            <p className="text-neutral-500 mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
              Agende sua avaliação gratuita e descubra o tratamento ideal para você.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                onClick={() => navigate('/clinica-estetica/agendar')}
                className="bg-neutral-900 hover:bg-neutral-800 text-white h-12 sm:h-14 px-6 sm:px-10 rounded-full text-sm sm:text-base"
              >
                Agendar Avaliação Gratuita
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline"
                className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 h-12 sm:h-14 px-6 sm:px-10 rounded-full text-sm sm:text-base"
              >
                <Phone className="w-4 h-4 mr-2" />
                (11) 99999-9999
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16 sm:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-5 sm:p-8 border border-neutral-100 text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-2">Endereço</h3>
              <p className="text-neutral-500 text-xs sm:text-sm">Av. Paulista, 1000 - Sala 501<br />São Paulo - SP</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 sm:p-8 border border-neutral-100 text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-2">Horário</h3>
              <p className="text-neutral-500 text-xs sm:text-sm">Segunda a Sexta: 9h às 20h<br />Sábado: 9h às 16h</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 sm:p-8 border border-neutral-100 text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-2">Contato</h3>
              <p className="text-neutral-500 text-xs sm:text-sm">(11) 99999-9999<br />contato@esteticaavancada.com</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-semibold text-neutral-900">Estética Avançada</span>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
              </a>
            </div>

            <p className="text-xs sm:text-sm text-neutral-500">
              © 2024 Estética Avançada. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClinicaEsteticaPage;