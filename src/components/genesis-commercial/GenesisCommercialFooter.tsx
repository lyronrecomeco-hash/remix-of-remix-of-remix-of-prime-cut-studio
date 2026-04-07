import { Link } from 'react-router-dom';
import { useSiteTexts } from '@/pages/GenesisCommercial';
import genesisLogo from '@/assets/genesis-logo.png';

const GenesisCommercialFooter = () => {
  const texts = useSiteTexts();

  return (
    <footer className="bg-card border-t border-border/40">
      <div className="container px-4 py-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
          
          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={genesisLogo} alt="Genesis Hub" className="w-8 h-8 object-contain" />
              <span className="text-sm font-bold text-foreground tracking-tight">{texts.footer.brandName}</span>
            </Link>
            <p className="text-[11px] text-muted-foreground/40 leading-relaxed mt-1">
              Automação inteligente para escalar seu negócio.
            </p>
          </div>

          {/* Col 2 — Navegação */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">Navegação</span>
            <a href="#recursos" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">Recursos</a>
            <a href="#planos" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">Planos</a>
          </div>

          {/* Col 3 — Redes Sociais */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">Redes Sociais</span>
            <a
              href="https://instagram.com/genesishub_saas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors w-fit"
              aria-label="Instagram"
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
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span className="text-xs">@genesishub_saas</span>
            </a>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="h-px w-full bg-border/30 mt-8 mb-4" />
        <p className="text-[11px] text-muted-foreground/30 text-center">
          {texts.footer.copyright}
        </p>
      </div>
    </footer>
  );
};

export default GenesisCommercialFooter;
