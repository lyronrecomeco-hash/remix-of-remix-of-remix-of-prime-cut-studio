import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, 
  Droplets, 
  Heart, 
  Sparkles, 
  MapPin, 
  Clock, 
  Phone,
  Instagram,
  ChevronDown,
  Star,
  ArrowRight,
  Shield,
  Award,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Paleta inspirada no Instagram do Seu Xodó - tons pastéis acolhedores
const SERVICES = [
  {
    id: "banho-tosa",
    name: "Banho e Tosa Completa",
    description: "Banho relaxante com produtos premium + tosa personalizada",
    duration: "1h30",
    icon: Scissors,
    price: "A partir de R$ 60",
    color: "from-rose-400 to-pink-500",
  },
  {
    id: "tosa-higienica",
    name: "Tosa Higiênica",
    description: "Limpeza delicada das patinhas, barriga e região íntima",
    duration: "30min",
    icon: Sparkles,
    price: "A partir de R$ 35",
    color: "from-violet-400 to-purple-500",
  },
  {
    id: "banho-medicinal",
    name: "Banho Medicinal",
    description: "Tratamento especial para peles sensíveis com produtos dermatológicos",
    duration: "1h",
    icon: Heart,
    price: "A partir de R$ 80",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "hidratacao",
    name: "Spa & Hidratação",
    description: "Tratamento profundo para pelos sedosos, macios e brilhantes",
    duration: "45min",
    icon: Droplets,
    price: "A partir de R$ 50",
    color: "from-cyan-400 to-teal-500",
  },
];

const TESTIMONIALS = [
  {
    name: "Maria Silva",
    pet: "Luna - Golden Retriever",
    text: "Atendimento impecável! A Luna sempre volta feliz, cheirosa e linda. Recomendo demais!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Carlos Oliveira", 
    pet: "Thor - Bulldog Francês",
    text: "Profissionais extremamente cuidadosos. O Thor tem pele sensível e eles tratam com muito carinho!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Ana Paula Costa",
    pet: "Mel - Poodle",
    text: "Melhor pet shop! A Mel fica ansiosa quando sabe que vai lá. Ambiente limpo e acolhedor.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

const GALLERY = [
  {
    url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop",
    alt: "Pet após banho e tosa",
  },
  {
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop",
    alt: "Golden Retriever feliz",
  },
  {
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop",
    alt: "Cachorros brincando",
  },
  {
    url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=600&fit=crop",
    alt: "Bulldog adorável",
  },
  {
    url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=600&fit=crop",
    alt: "Cachorro fofo",
  },
  {
    url: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&h=600&fit=crop",
    alt: "Pet feliz",
  },
];

const PetshopHome = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToServices = () => {
    document.getElementById("servicos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50/30">
      {/* Header Premium */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-rose-100/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
                <span className="text-2xl">🐾</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center">
                <Heart className="w-3 h-3 text-white fill-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800 tracking-tight">Seu Xodó</h1>
              <p className="text-xs font-medium bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                Pet Shop & Estética
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/seuxodo.petshop/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <Button 
              onClick={() => navigate("/petshop-demo/agendar")}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-6 shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transition-all"
            >
              Agendar
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section Premium */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-t from-white to-transparent" />

        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm border border-rose-100"
            >
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium">4.9</span>
              </span>
              <span className="w-px h-4 bg-gray-200" />
              <span className="text-sm text-gray-500">+2.000 pets atendidos</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Cuidado, carinho e amor
              <br />
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                para seu melhor amigo
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Seu pet merece o melhor! Banho, tosa e spa com produtos premium 
              em um ambiente acolhedor e seguro. ✨
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate("/petshop-demo/agendar")}
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-10 py-7 text-lg font-semibold shadow-2xl shadow-rose-300 hover:shadow-rose-400 hover:scale-105 transition-all"
              >
                Agendar Agora
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={scrollToServices}
                variant="ghost"
                size="lg"
                className="text-gray-600 hover:text-rose-600 rounded-full px-8"
              >
                Ver Serviços
                <ChevronDown className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {[
              { icon: Shield, text: "Ambiente Seguro" },
              { icon: Award, text: "Produtos Premium" },
              { icon: Users, text: "Equipe Especializada" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500">
                <item.icon className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-rose-500 uppercase tracking-wider mb-3">
              Nossos Serviços
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Experiências únicas para seu pet
            </h3>
            <p className="text-gray-500 max-w-xl mx-auto">
              Cada serviço é pensado com carinho para proporcionar conforto, 
              bem-estar e muito amor ao seu companheiro.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  className="group cursor-pointer border-0 shadow-lg shadow-gray-100 hover:shadow-xl hover:shadow-rose-100 transition-all duration-300 overflow-hidden"
                  onClick={() => navigate("/petshop-demo/agendar", { state: { serviceId: service.id } })}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className={`w-2 bg-gradient-to-b ${service.color}`} />
                      <div className="flex-1 p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <service.icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-rose-600 transition-colors">
                              {service.name}
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">{service.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> {service.duration}
                                </span>
                              </div>
                              <span className="text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                                {service.price}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => navigate("/petshop-demo/agendar")}
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-8 shadow-lg shadow-rose-200"
            >
              Agendar Serviço
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-rose-50/50 to-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block text-sm font-semibold text-rose-500 uppercase tracking-wider mb-3">
              Galeria
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Nosso espaço e nossos xodós 💕
            </h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-3xl overflow-hidden shadow-lg group ${
                  index === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.instagram.com/seuxodo.petshop/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
              <Instagram className="w-5 h-5" />
              Siga @seuxodo.petshop
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block text-sm font-semibold text-rose-500 uppercase tracking-wider mb-3">
              Depoimentos
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
              O que dizem sobre nós
            </h3>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-3xl p-8 md:p-12 shadow-lg"
              >
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(TESTIMONIALS[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xl md:text-2xl text-gray-700 text-center mb-8 leading-relaxed italic">
                  "{TESTIMONIALS[currentTestimonial].text}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={TESTIMONIALS[currentTestimonial].avatar}
                    alt={TESTIMONIALS[currentTestimonial].name}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                  <div className="text-left">
                    <p className="font-bold text-gray-800">{TESTIMONIALS[currentTestimonial].name}</p>
                    <p className="text-sm text-rose-500">{TESTIMONIALS[currentTestimonial].pet}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial 
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 w-8" 
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAgMGMwLTItMi00LTItNHMtMiAyLTIgNCAyIDQgMiA0IDItMiAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-5xl mb-6 block">🐾</span>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Sobre o Seu Xodó
            </h3>
            <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-2xl mx-auto mb-10">
              Nascemos do amor pelos animais e da vontade de oferecer o melhor cuidado 
              para os nossos xodós de quatro patas. Nossa equipe é apaixonada pelo que faz 
              e trata cada pet como se fosse da família.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/90">
              <div className="text-center">
                <p className="text-4xl font-bold">+5</p>
                <p className="text-sm opacity-80">Anos de experiência</p>
              </div>
              <div className="w-px h-16 bg-white/20" />
              <div className="text-center">
                <p className="text-4xl font-bold">+2.000</p>
                <p className="text-sm opacity-80">Pets atendidos</p>
              </div>
              <div className="w-px h-16 bg-white/20" />
              <div className="text-center">
                <p className="text-4xl font-bold">4.9</p>
                <p className="text-sm opacity-80">Avaliação média</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block text-sm font-semibold text-rose-500 uppercase tracking-wider mb-3">
              Contato
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
              Venha nos visitar
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: "WhatsApp", value: "(11) 99999-9999", href: "https://wa.me/5511999999999" },
              { icon: MapPin, title: "Endereço", value: "Rua dos Pets, 123 - SP", href: null },
              { icon: Clock, title: "Horário", value: "Seg-Sáb: 8h às 18h", href: null },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-8 border-0 shadow-lg shadow-gray-100 hover:shadow-xl hover:shadow-rose-100 transition-shadow">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-bold text-gray-800 mb-1">{item.title}</p>
                  {item.href ? (
                    <a href={item.href} className="text-rose-500 hover:text-rose-600 font-medium">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-gray-500">{item.value}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-rose-50">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-5xl mb-6 block">✨</span>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Pronto para agendar?
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Agende agora e dê ao seu pet o cuidado que ele merece!
            </p>
            <Button
              onClick={() => navigate("/petshop-demo/agendar")}
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-12 py-7 text-lg font-semibold shadow-2xl shadow-rose-300 hover:shadow-rose-400 hover:scale-105 transition-all"
            >
              Agendar Agora
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <span className="text-lg">🐾</span>
              </div>
              <div>
                <span className="font-bold">Seu Xodó</span>
                <span className="text-gray-400 text-sm ml-1">Pet Shop</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <button 
                onClick={() => navigate("/petshop-demo/meus-agendamentos")}
                className="hover:text-white transition-colors"
              >
                Meus Agendamentos
              </button>
              <a 
                href="https://www.instagram.com/seuxodo.petshop/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Seu Xodó Pet Shop. Feito com 💕 pela 
              <span className="text-rose-400 ml-1">Genesis</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating CTA (Mobile) */}
      <div className="fixed bottom-6 left-4 right-4 md:hidden z-50">
        <Button
          onClick={() => navigate("/petshop-demo/agendar")}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full py-6 text-lg font-semibold shadow-2xl shadow-rose-400"
        >
          Agendar Agora 🐾
        </Button>
      </div>
    </div>
  );
};

export default PetshopHome;
