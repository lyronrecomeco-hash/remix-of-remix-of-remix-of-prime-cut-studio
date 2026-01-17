import { Heart, Instagram, Facebook, Youtube } from 'lucide-react';

const PetshopFooter = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    services: [
      { label: 'Banho & Tosa', href: '#servicos' },
      { label: 'Veterinária', href: '#servicos' },
      { label: 'Hotel & Creche', href: '#servicos' },
      { label: 'Pet Shop', href: '#servicos' },
    ],
    company: [
      { label: 'Sobre nós', href: '#sobre' },
      { label: 'Galeria', href: '#galeria' },
      { label: 'Contato', href: '#contato' },
      { label: 'Trabalhe conosco', href: '#' },
    ],
    social: [
      { icon: Instagram, href: 'https://instagram.com/seuxodo', label: 'Instagram' },
      { icon: Facebook, href: 'https://facebook.com/seuxodo', label: 'Facebook' },
      { icon: Youtube, href: 'https://youtube.com/seuxodo', label: 'YouTube' },
    ],
  };

  return (
    <footer className="bg-petshop-dark border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#inicio" className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-petshop-orange rounded-full flex items-center justify-center">
                <span className="text-2xl">🐾</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">Seu Xodó</h3>
                <p className="text-xs text-petshop-orange font-medium -mt-1">Petshop & Veterinária</p>
              </div>
            </a>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Cuidando do seu melhor amigo com amor, carinho e profissionalismo desde 2014.
            </p>
            <div className="flex gap-3">
              {links.social.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-petshop-orange transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">Serviços</h4>
            <ul className="space-y-2">
              {links.services.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-petshop-orange transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2">
              {links.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-petshop-orange transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>(11) 99999-9999</li>
              <li>contato@seuxodo.com.br</li>
              <li>Rua das Patinhas, 123</li>
              <li>Vila Nova - São Paulo/SP</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {currentYear} Seu Xodó Petshop. Todos os direitos reservados.
          </p>
          <p className="text-white/50 text-sm flex items-center gap-1">
            Feito com <Heart className="w-4 h-4 text-petshop-orange" /> para os pets
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PetshopFooter;
