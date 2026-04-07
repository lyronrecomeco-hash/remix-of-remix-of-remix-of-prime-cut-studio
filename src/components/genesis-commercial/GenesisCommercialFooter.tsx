import { Link } from 'react-router-dom';
import { Bot, ExternalLink } from 'lucide-react';
import { useSiteTexts } from '@/pages/GenesisCommercial';

const GenesisCommercialFooter = () => {
  const texts = useSiteTexts();

  return (
    <footer className="bg-card/80 backdrop-blur-sm border-t border-border/50">
      <div className="container px-4 py-10 max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-colors">
              <Bot className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground tracking-tight">{texts.footer.brandName}</span>
              <span className="text-[10px] text-muted-foreground/50 leading-none">Automação Inteligente</span>
            </div>
          </Link>

          {/* Social + Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/genesishub_saas"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/10 text-muted-foreground transition-all hover:border-pink-500/30 hover:text-pink-400 hover:scale-[1.02]"
              aria-label="Siga no Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors group-hover:text-pink-400"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span className="text-xs font-medium">Instagram</span>
              <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent mb-5" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground/40">
            {texts.footer.copyright}
          </p>
          <div className="flex items-center gap-4">
            <a href="#planos" className="text-[11px] text-muted-foreground/30 hover:text-primary/60 transition-colors">
              Planos
            </a>
            <a href="#recursos" className="text-[11px] text-muted-foreground/30 hover:text-primary/60 transition-colors">
              Recursos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GenesisCommercialFooter;
