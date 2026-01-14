import { Scissors, Instagram, Facebook, MessageCircle, MapPin, Phone } from 'lucide-react';
import type { TemplateConfig } from '@/components/affiliate/templates/types';

interface DemoFooterProps {
  config: TemplateConfig;
}

export default function DemoFooter({ config }: DemoFooterProps) {
  const currentYear = new Date().getFullYear();

  const handleWhatsAppClick = () => {
    const phone = config.business.whatsapp?.replace(/\D/g, '') || '';
    const message = `Olá! Gostaria de saber mais sobre a ${config.business.name}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto max-w-6xl py-12 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config.branding.primaryColor}15` }}
              >
                <Scissors className="w-5 h-5" style={{ color: config.branding.primaryColor }} />
              </div>
              <span 
                className="text-xl font-bold"
                style={{ fontFamily: config.typography.headingFont }}
              >
                {config.business.name || 'Meu Negócio'}
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              {config.business.slogan || 'Atendimento premium com agendamento online para sua comodidade.'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="text-sm text-muted-foreground space-y-3">
              {config.business.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" style={{ color: config.branding.primaryColor }} />
                  {config.business.phone}
                </p>
              )}
              {config.business.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: config.branding.primaryColor }} />
                  {config.business.address}
                </p>
              )}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <button 
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Instagram className="w-4 h-4" />
              </button>
              <button 
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button 
                onClick={handleWhatsAppClick}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: config.branding.primaryColor }}
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} {config.business.name || 'Meu Negócio'}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
