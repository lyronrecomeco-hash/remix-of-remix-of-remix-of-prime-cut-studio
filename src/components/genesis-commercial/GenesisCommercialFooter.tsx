import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';

const GenesisCommercialFooter = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container px-4 py-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Left - Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-bold text-foreground">Genesis Hub</span>
          </Link>

          {/* Right - Copyright */}
          <p className="text-sm text-muted-foreground text-center sm:text-right">
            © 2025 GENESIS HUB. Transformando ideias em realidade.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GenesisCommercialFooter;