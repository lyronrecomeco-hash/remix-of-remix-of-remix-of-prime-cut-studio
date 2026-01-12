import { Link } from 'react-router-dom';
import { Bot, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const SiteFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="container px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Genesis Hub</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              A plataforma líder em automação de WhatsApp com IA para empresas brasileiras.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Produto</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/genesis" className="hover:text-green-400 transition-colors">Flow Builder</Link></li>
              <li><Link to="/genesis" className="hover:text-green-400 transition-colors">Luna IA</Link></li>
              <li><Link to="/genesis" className="hover:text-green-400 transition-colors">Analytics</Link></li>
              <li><Link to="/genesis" className="hover:text-green-400 transition-colors">Integrações</Link></li>
              <li><Link to="/genesis" className="hover:text-green-400 transition-colors">Preços</Link></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Recursos</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Tutoriais</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">API</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Status</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-500" />
                <a href="mailto:contato@genesishub.com.br" className="hover:text-green-400 transition-colors">
                  contato@genesishub.com.br
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500" />
                <a href="tel:+5511999999999" className="hover:text-green-400 transition-colors">
                  +55 (11) 99999-9999
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-green-400 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-green-400 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-green-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
