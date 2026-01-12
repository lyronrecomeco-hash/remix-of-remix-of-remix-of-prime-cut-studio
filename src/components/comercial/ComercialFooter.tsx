import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin, Instagram, Youtube, Linkedin, Sparkles } from 'lucide-react';

const footerLinks = {
  produto: [
    { label: 'Recursos', href: '#recursos' },
    { label: 'Ferramentas', href: '#ferramentas' },
    { label: 'Preços', href: '#precos' },
    { label: 'Integrações', href: '#' },
  ],
  empresa: [
    { label: 'Sobre Nós', href: '/sobre' },
    { label: 'Blog', href: '#' },
    { label: 'Carreiras', href: '#' },
    { label: 'Contato', href: '#' },
  ],
  suporte: [
    { label: 'Documentação', href: '/genesis/docs' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Status', href: '/status' },
    { label: 'Comunidade', href: '#' },
  ],
  legal: [
    { label: 'Termos de Uso', href: '/termos' },
    { label: 'Privacidade', href: '/privacidade' },
    { label: 'LGPD', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
};

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

const ComercialFooter = () => {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="relative bg-gray-900 pt-20 pb-10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid lg:grid-cols-2 gap-12 pb-12 border-b border-white/10">
          {/* Brand */}
          <div>
            <Link to="/comercial" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <span className="text-white font-black text-xl">G</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white">Genesis</span>
                <span className="text-[10px] font-medium text-emerald-400 tracking-widest uppercase">
                  Automação Inteligente
                </span>
              </div>
            </Link>
            <p className="text-gray-400 max-w-md leading-relaxed mb-6">
              Transformamos o WhatsApp da sua empresa em uma máquina de vendas automatizada com inteligência artificial.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:contato@genesis.ai" className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors">
                <Mail className="w-5 h-5" />
                <span>contato@genesis.ai</span>
              </a>
              <a href="https://wa.me/5511999999999" className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>(11) 99999-9999</span>
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>São Paulo, Brasil</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-bold mb-4">Produto</h4>
              <ul className="space-y-3">
                {footerLinks.produto.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link to={link.href} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Empresa</h4>
              <ul className="space-y-3">
                {footerLinks.empresa.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Suporte</h4>
              <ul className="space-y-3">
                {footerLinks.suporte.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link to={link.href} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Genesis. Todos os direitos reservados.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5 text-gray-400 hover:text-emerald-400" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Made with */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span>Feito com</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>no Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ComercialFooter;
