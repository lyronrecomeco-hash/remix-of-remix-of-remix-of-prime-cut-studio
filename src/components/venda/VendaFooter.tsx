import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Instagram, Linkedin, Youtube } from 'lucide-react';

const VendaFooter = () => {
  return (
    <footer className="py-16 bg-muted/30 border-t border-border/50">
      <div className="container px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Genesis Hub</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              A plataforma definitiva para automatizar seu WhatsApp com inteligência artificial. 
              Venda mais, trabalhe menos.
            </p>
            <div className="flex gap-4">
              {[Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link to="/genesis" className="hover:text-primary transition-colors">Funcionalidades</Link></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Preços</a></li>
              <li><Link to="/docs" className="hover:text-primary transition-colors">Documentação</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Atualizações</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><Link to="/termos-de-uso" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><Link to="/politica-de-privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
              <li>
                <a href="mailto:suporte@genesishub.cloud" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Feito com 💙 no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
};

export default VendaFooter;
