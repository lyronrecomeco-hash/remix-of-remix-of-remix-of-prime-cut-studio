import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  PawPrint,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Imagens do Instagram do Seu Xodó (placeholders que serão substituídos)
const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=400&fit=crop",
];

const SERVICES = [
  {
    id: "banho-tosa",
    name: "Banho e Tosa Completa",
    description: "Banho relaxante + tosa personalizada para deixar seu pet lindo",
    duration: "1h30",
    icon: Scissors,
    price: "A partir de R$ 60",
  },
  {
    id: "tosa-higienica",
    name: "Tosa Higiênica",
    description: "Limpeza das patinhas, barriga e região íntima",
    duration: "30min",
    icon: Sparkles,
    price: "A partir de R$ 35",
  },
  {
    id: "banho-medicinal",
    name: "Banho Medicinal",
    description: "Tratamento especial para peles sensíveis ou com dermatite",
    duration: "1h",
    icon: Heart,
    price: "A partir de R$ 80",
  },
  {
    id: "hidratacao",
    name: "Hidratação de Pelos",
    description: "Tratamento profundo para pelos sedosos e brilhantes",
    duration: "45min",
    icon: Droplets,
    price: "A partir de R$ 50",
  },
];

const TESTIMONIALS = [
  {
    name: "Maria Silva",
    pet: "Luna (Golden Retriever)",
    text: "Atendimento maravilhoso! A Luna sempre volta super feliz e cheirosa 💙",
    rating: 5,
  },
  {
    name: "Carlos Oliveira",
    pet: "Thor (Bulldog)",
    text: "Profissionais muito cuidadosos. Meu Thor tem pele sensível e eles cuidam super bem!",
    rating: 5,
  },
  {
    name: "Ana Paula",
    pet: "Mel (Poodle)",
    text: "Melhor pet shop da região! A Mel ama ir lá, sempre volta linda demais ✨",
    rating: 5,
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#7DD3C0]/20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7DD3C0] to-[#5BB5A5] flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg leading-tight">Seu Xodó</h1>
              <p className="text-xs text-[#7DD3C0]">Pet Shop</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/petshop-demo/agendar")}
            className="bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white rounded-full px-4 py-2 text-sm font-medium"
          >
            Agendar 🐾
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-[#F0FDF9] to-white">
        <div className="container mx-auto text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              Cuidado, carinho e amor para seu melhor amigo 🐾
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Seu pet merece o melhor! Agende agora um banho e tosa com a gente 💙
            </p>
            <Button
              onClick={() => navigate("/petshop-demo/agendar")}
              size="lg"
              className="bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Agendar Agora ✨
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 cursor-pointer"
            onClick={scrollToServices}
          >
            <p className="text-sm text-gray-500 mb-2">Conheça nossos serviços</p>
            <ChevronDown className="w-6 h-6 text-[#7DD3C0] mx-auto animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Nossos Serviços 💙
          </h3>
          <p className="text-center text-gray-500 mb-10">
            Tudo que seu pet precisa em um só lugar
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-[#7DD3C0]/20 hover:border-[#7DD3C0]/50 transition-all hover:shadow-md cursor-pointer group"
                  onClick={() => navigate("/petshop-demo/agendar", { state: { serviceId: service.id } })}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#F0FDF9] flex items-center justify-center group-hover:bg-[#7DD3C0]/20 transition-colors">
                        <service.icon className="w-6 h-6 text-[#7DD3C0]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{service.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">{service.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {service.duration}
                          </span>
                          <span className="text-[#7DD3C0] font-medium">{service.price}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={() => navigate("/petshop-demo/agendar")}
              className="bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white rounded-full px-6"
            >
              Ver Todos os Serviços
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-4 bg-[#F0FDF9]">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Nosso Espaço 📸
          </h3>
          <p className="text-center text-gray-500 mb-10">
            Um ambiente acolhedor e seguro para seu pet
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GALLERY_IMAGES.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="aspect-square rounded-2xl overflow-hidden"
              >
                <img
                  src={img}
                  alt={`Pet ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/seuxodo.petshop/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#7DD3C0] hover:text-[#5BB5A5] font-medium"
            >
              <Instagram className="w-5 h-5" />
              Siga-nos no Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-2xl">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">
            O que dizem sobre nós 💬
          </h3>

          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[#F0FDF9] rounded-2xl p-6 text-center"
          >
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(TESTIMONIALS[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 mb-4 text-lg italic">
              "{TESTIMONIALS[currentTestimonial].text}"
            </p>
            <p className="font-semibold text-gray-800">
              {TESTIMONIALS[currentTestimonial].name}
            </p>
            <p className="text-sm text-[#7DD3C0]">
              {TESTIMONIALS[currentTestimonial].pet}
            </p>
          </motion.div>

          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTestimonial ? "bg-[#7DD3C0]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-[#F0FDF9]">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Sobre o Seu Xodó 💙
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            Nascemos do amor pelos animais e da vontade de oferecer o melhor cuidado 
            para os nossos xodós de quatro patas. Nossa equipe é apaixonada pelo que faz 
            e trata cada pet como se fosse da família. Aqui, seu melhor amigo recebe 
            carinho, atenção e todo o cuidado que merece! 🐾
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#7DD3C0]" />
              <span>+5 anos de experiência</span>
            </div>
            <div className="flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-[#7DD3C0]" />
              <span>+2000 pets atendidos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-2xl">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">
            Fale Conosco 📞
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-[#7DD3C0]/20 text-center p-5">
              <Phone className="w-8 h-8 text-[#7DD3C0] mx-auto mb-3" />
              <p className="font-semibold text-gray-800">WhatsApp</p>
              <a 
                href="https://wa.me/5511999999999"
                className="text-sm text-[#7DD3C0] hover:underline"
              >
                (11) 99999-9999
              </a>
            </Card>

            <Card className="border-[#7DD3C0]/20 text-center p-5">
              <MapPin className="w-8 h-8 text-[#7DD3C0] mx-auto mb-3" />
              <p className="font-semibold text-gray-800">Endereço</p>
              <p className="text-sm text-gray-500">
                Rua dos Pets, 123 - SP
              </p>
            </Card>

            <Card className="border-[#7DD3C0]/20 text-center p-5">
              <Clock className="w-8 h-8 text-[#7DD3C0] mx-auto mb-3" />
              <p className="font-semibold text-gray-800">Horário</p>
              <p className="text-sm text-gray-500">
                Seg-Sáb: 8h às 18h
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#7DD3C0] to-[#5BB5A5]">
        <div className="container mx-auto max-w-2xl text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Pronto para agendar? 🐾
          </h3>
          <p className="mb-8 opacity-90">
            Agende agora mesmo e garanta o melhor cuidado para seu pet!
          </p>
          <Button
            onClick={() => navigate("/petshop-demo/agendar")}
            size="lg"
            variant="secondary"
            className="bg-white text-[#7DD3C0] hover:bg-gray-100 rounded-full px-8 font-semibold"
          >
            Agendar Agora ✨
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <PawPrint className="w-6 h-6 text-[#7DD3C0]" />
              <span className="font-semibold">Seu Xodó Pet Shop</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
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
                className="hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">
            © 2024 Seu Xodó Pet Shop. Feito com 💙 pela Genesis.
          </p>
        </div>
      </footer>

      {/* Floating CTA (Mobile) */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
        <Button
          onClick={() => navigate("/petshop-demo/agendar")}
          className="w-full bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white rounded-full py-6 text-lg font-semibold shadow-xl"
        >
          Agendar Agora 🐾
        </Button>
      </div>
    </div>
  );
};

export default PetshopHome;
