import { Link } from 'react-router-dom';
import { useSiteTexts } from '@/pages/GenesisCommercial';
import genesisLogo from '@/assets/genesis-logo.png';

const GenesisCommercialFooter = () => {
  const texts = useSiteTexts();

  return (
    <footer className="bg-card border-t border-border/40">
      <div className="container px-6 py-12 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img src={genesisLogo} alt="Genesis Hub" className="w-10 h-10 object-contain" />
            <span className="text-lg font-bold text-foreground">{texts.footer.brandName}</span>
          </Link>

          {/* Redes Sociais */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Redes Sociais</span>
            <a
              href="https://instagram.com/genesishub_saas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>

          {/* Links rápidos */}
          <div className="flex items-center gap-6">
            <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="h-px w-full bg-border/30 mt-8 mb-5" />
        <p className="text-sm text-muted-foreground/50 text-center">
          {texts.footer.copyright}
        </p>
      </div>
    </footer>
  );
};

export default GenesisCommercialFooter;
