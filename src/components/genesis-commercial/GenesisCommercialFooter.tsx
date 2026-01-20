import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, Mail, Instagram, Linkedin, Youtube, 
  Shield, Lock, Heart
} from 'lucide-react';

const footerLinks = {
  produto: [
    { label: 'Recursos', href: '#recursos' },
    { label: 'Planos', href: '#planos' },
    { label: 'FAQ', href: '#faq' },
  ],
  empresa: [
    { label: 'Sobre Nós', href: '/sobre' },
    { label: 'Parcerias', href: '#parcerias' },
  ],
  suporte: [
    { label: 'Central de Ajuda', href: '/docs' },
    { label: 'Contato', href: 'mailto:suporte@genesishub.cloud' },
  ],
  legal: [
    { label: 'Termos de Uso', href: '/termos-de-uso' },
    { label: 'Privacidade', href: '/politica-de-privacidade' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

const GenesisCommercialFooter = () => {
  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container px-4 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 md:gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">Genesis</span>
                <span className="text-[10px] text-primary block -mt-0.5 tracking-widest uppercase">
                  Inteligência Artificial
                </span>
              </div>
            </Link>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-xs">
              Seu hub completo para criar, vender e escalar negócios com inteligência artificial.
            </p>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Produto</h4>
            <ul className="space-y-2.5">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-2.5">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-2.5">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container px-4 py-5 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Genesis-IA. Todos os direitos reservados.
            </p>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>SSL Seguro</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>LGPD</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              Feito com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GenesisCommercialFooter;
