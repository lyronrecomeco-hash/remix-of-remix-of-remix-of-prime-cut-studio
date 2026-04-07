import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import genesisLogo from '@/assets/genesis-logo.png';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <img src={genesisLogo} alt="Genesis Hub" className="w-7 h-7 object-contain" />
            <span className="text-sm font-semibold hidden sm:inline">Genesis Hub</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-10">Última atualização: {lastUpdated}</p>

        <div className="prose-legal space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
          {children}
        </div>
      </main>

      {/* Footer simples */}
      <footer className="border-t border-border/30 py-6 mt-16">
        <div className="container max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/40">© Genesis Hub 2026. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link to="/termos-de-uso" className="text-xs text-muted-foreground/40 hover:text-foreground transition-colors">Termos</Link>
            <Link to="/politica-de-privacidade" className="text-xs text-muted-foreground/40 hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/politica-de-cookies" className="text-xs text-muted-foreground/40 hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
