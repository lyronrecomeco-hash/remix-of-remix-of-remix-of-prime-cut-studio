import { Star, Heart, Phone, MapPin, Instagram, Clock } from 'lucide-react';

const StarpetshopFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Star className="w-7 h-7 text-white" fill="white" />
              </div>
              <div>
                <span className="text-2xl font-bold">Star Petshop</span>
                <p className="text-gray-400 text-sm">Especialista em saúde e bem-estar animal</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Há mais de 14 anos cuidando da saúde do seu pet em Araxá. 
              Atendimento veterinário completo com especialidade em odontologia animal.
            </p>
            <a 
              href="https://www.instagram.com/starpetshoparaxa/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Instagram className="w-5 h-5" />
              @starpetshoparaxa
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {['Início', 'Sobre', 'Serviços', 'Galeria', 'Contato'].map((link) => (
                <li key={link}>
                  <a 
                    href={`#${link.toLowerCase()}`}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <a href="tel:03436623787" className="text-gray-400 hover:text-white transition-colors">
                  (034) 3662-3787
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  R. Calimério Guimarães, 811<br />
                  Centro, Araxá - MG
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Seg-Sex: 8h às 18h<br />
                  Sáb: 8h às 13h
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} Star Petshop. Todos os direitos reservados.
          </p>
          <p className="text-gray-600 text-xs mt-2 flex items-center justify-center gap-1">
            Feito com <Heart className="w-3 h-3 text-red-500" fill="currentColor" /> para os pets de Araxá
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StarpetshopFooter;
