import { Instagram, Phone, MapPin, Mail, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CasapetFooter = () => {
  const services = [
    { name: 'Veterinário', href: '#servicos' },
    { name: 'Pet Shop', href: '#servicos' },
    { name: 'Rações', href: '#servicos' },
    { name: 'Acessórios', href: '#servicos' },
  ];

  const links = [
    { name: 'Início', href: '#inicio' },
    { name: 'Sobre', href: '#sobre' },
    { name: 'Serviços', href: '#servicos' },
    { name: 'Contato', href: '#contato' },
  ];

  return (
    <footer className="bg-gray-900 pt-12 sm:pt-16 pb-6 sm:pb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <motion.div 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <span className="text-xl sm:text-2xl">🏠</span>
              </motion.div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Casa Pet Gri</h3>
                <p className="text-[10px] sm:text-xs text-emerald-400 font-semibold">GUARAPARI</p>
              </div>
            </div>
            <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed max-w-xs">
              Tudo o que seu pet precisa nós temos aqui! Veterinário, rações e produtos de qualidade. 🐕❤️
            </p>
            <a
              href="https://www.instagram.com/casapetgri/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <Instagram className="w-4 h-4" />
              @casapetgri
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base mb-3 sm:mb-4">Serviços</h4>
            <ul className="space-y-2 sm:space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a 
                    href={service.href} 
                    className="text-white/60 hover:text-emerald-400 transition-colors text-xs sm:text-sm flex items-center gap-1 group"
                  >
                    <span className="w-1 h-1 bg-emerald-500/50 rounded-full group-hover:bg-emerald-400 transition-colors" />
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base mb-3 sm:mb-4">Navegação</h4>
            <ul className="space-y-2 sm:space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-white/60 hover:text-emerald-400 transition-colors text-xs sm:text-sm flex items-center gap-1 group"
                  >
                    <span className="w-1 h-1 bg-emerald-500/50 rounded-full group-hover:bg-emerald-400 transition-colors" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base mb-3 sm:mb-4">Contato</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a 
                  href="https://wa.me/5528999999999" 
                  className="flex items-center gap-2 text-white/60 hover:text-emerald-400 transition-colors text-xs sm:text-sm"
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>(28) 99999-9999</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/casapetgri/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-emerald-400 transition-colors text-xs sm:text-sm"
                >
                  <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">@casapetgri</span>
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-white/60 text-xs sm:text-sm">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                  <span>Av. Padre José Anchieta, 1030<br />Guarapari - ES</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-[10px] sm:text-sm text-white/40 text-center sm:text-left">
              © {new Date().getFullYear()} Casa Pet Gri. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-1 text-[10px] sm:text-sm text-white/40">
              <span>Feito com</span>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500 fill-rose-500" />
              <span>em Guarapari</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CasapetFooter;
