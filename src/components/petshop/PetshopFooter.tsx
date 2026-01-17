import { Instagram, Phone, MapPin, Mail } from 'lucide-react';

const PetshopFooter = () => {
  const services = [
    { name: 'Banho & Tosa', href: '#servicos' },
    { name: 'Consulta Veterinária', href: '#servicos' },
    { name: 'Hotel & Creche', href: '#servicos' },
    { name: 'Pet Shop', href: '#servicos' },
  ];

  return (
    <footer className="bg-petshop-dark pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-petshop-orange rounded-full flex items-center justify-center">
                <span className="text-2xl">🐾</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Seu Xodó</h3>
                <p className="text-xs text-petshop-orange font-medium">Petshop & Veterinária</p>
              </div>
            </div>
            <p className="text-white/60 mb-6 max-w-sm leading-relaxed">
              Cuidando do seu melhor amigo com amor e carinho. 
              Há 8 anos oferecendo os melhores serviços para pets em Recife.
            </p>
            <a
              href="https://www.instagram.com/seuxodo.petshop/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-petshop-orange text-white px-4 py-2 rounded-full transition-colors"
            >
              <Instagram className="w-5 h-5" />
              @seuxodo.petshop
            </a>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Serviços</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a href={service.href} className="text-white/60 hover:text-petshop-orange transition-colors">
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://wa.me/5581998409073" className="flex items-center gap-2 text-white/60 hover:text-petshop-orange transition-colors">
                  <Phone className="w-4 h-4" />
                  (81) 99840-9073
                </a>
              </li>
              <li>
                <a href="mailto:contato@seuxodo.com.br" className="flex items-center gap-2 text-white/60 hover:text-petshop-orange transition-colors">
                  <Mail className="w-4 h-4" />
                  contato@seuxodo.com.br
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-white/60">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Estr. de Belém, 1273<br />Campo Grande, Recife - PE</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Seu Xodó Petshop. Todos os direitos reservados.</p>
          <p className="text-sm text-white/40">Feito com ❤️ em Recife</p>
        </div>
      </div>
    </footer>
  );
};

export default PetshopFooter;
