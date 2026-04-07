import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { useSiteTexts } from '@/pages/GenesisCommercial';

const GenesisCommercialFooter = () => {
  const texts = useSiteTexts();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container px-4 py-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-bold text-foreground">{texts.footer.brandName}</span>
          </Link>

          {/* Right side: socials + copyright */}
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a
              href="https://instagram.com/genesishub_saas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary hover:scale-105"
              aria-label="Siga no Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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

            {/* Copyright */}
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              {texts.footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GenesisCommercialFooter;
