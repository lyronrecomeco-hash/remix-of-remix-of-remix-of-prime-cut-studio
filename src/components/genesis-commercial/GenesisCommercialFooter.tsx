import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, Mail, Instagram, Linkedin, Youtube, 
  MapPin, Phone, Shield, Lock, Heart
} from 'lucide-react';

const footerLinks = {
  produto: [
    { label: 'Recursos', href: '#recursos' },
    { label: 'Planos', href: '#planos' },
    { label: 'Documentação', href: '/docs' },
    { label: 'API', href: '/docs' },
  ],
  empresa: [
    { label: 'Sobre Nós', href: '/sobre' },
    { label: 'Parcerias', href: '#parcerias' },
    { label: 'Blog', href: '#' },
    { label: 'Carreiras', href: '#' },
  ],
  suporte: [
    { label: 'Central de Ajuda', href: '/docs' },
    { label: 'Contato', href: 'mailto:suporte@genesishub.cloud' },
    { label: 'Status', href: '/status' },
    { label: 'Comunidade', href: '#' },
  ],
  legal: [
    { label: 'Termos de Uso', href: '/termos-de-uso' },
    { label: 'Privacidade', href: '/politica-de-privacidade' },
    { label: 'Cookies', href: '/politica-de-privacidade' },
    { label: 'LGPD', href: '/politica-de-privacidade' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

const GenesisCommercialFooter = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/5">
      {/* Main Footer */}
      <div className="container px-4 py-16 md:py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 md:gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-lg opacity-60" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Genesis
                </span>
                <span className="text-xs text-cyan-400 block -mt-0.5 tracking-widest uppercase">
                  Inteligência Artificial
                </span>
              </div>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              A plataforma definitiva para automatizar seu WhatsApp com inteligência artificial. 
              Venda mais, trabalhe menos.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Suporte</h4>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('mailto:') ? (
                    <a 
                      href={link.href} 
                      className="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      to={link.href} 
                      className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container px-4 py-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>SSL Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>LGPD Compliant</span>
              </div>
            </div>

            {/* Made with love */}
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              Feito com <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GenesisCommercialFooter;
