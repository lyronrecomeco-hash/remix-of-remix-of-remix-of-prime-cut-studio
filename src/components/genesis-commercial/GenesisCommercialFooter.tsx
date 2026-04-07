import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { useSiteTexts } from '@/pages/GenesisCommercial';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const GenesisCommercialFooter = () => {
  const texts = useSiteTexts();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container px-4 py-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-bold text-foreground">{texts.footer.brandName}</span>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/genesishub_saas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary/60 transition-all hover:bg-primary/20 hover:text-primary hover:scale-105"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>

            <p className="text-sm text-muted-foreground text-center sm:text-right">
              {texts.footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GenesisCommercialFooter;
