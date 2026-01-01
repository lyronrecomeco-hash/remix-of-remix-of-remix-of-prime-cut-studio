import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  ChevronRight,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/contexts/CRMContext';
import CRMProfileMenu from './CRMProfileMenu';

interface CRMTopbarProps {
  activeLabel: string;
  onSearchOpen: () => void;
  onProfileNavigate: (tab: string) => void;
  onLogout: () => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function CRMTopbar({
  activeLabel,
  onSearchOpen,
  onProfileNavigate,
  onLogout,
  onMobileMenuToggle,
  isMobileMenuOpen,
}: CRMTopbarProps) {
  const { crmTenant } = useCRM();

  return (
    <>
      {/* Desktop Topbar */}
      <header className="hidden lg:flex h-12 border-b border-border bg-card/80 backdrop-blur-md items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-[11px] text-muted-foreground shrink-0 uppercase tracking-wider">CRM</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
          <h1 className="text-sm font-semibold text-foreground truncate">{activeLabel}</h1>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 gap-2 text-muted-foreground hover:text-foreground"
            onClick={onSearchOpen}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs hidden sm:inline">Buscar</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="w-3.5 h-3.5" />
            <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[9px] flex items-center justify-center">
              3
            </Badge>
          </Button>
          
          <CRMProfileMenu onNavigate={onProfileNavigate} onLogout={onLogout} />
        </div>
      </header>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-card/95 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-3">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onMobileMenuToggle}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          <div className="min-w-0">
            <p className="text-[9px] text-muted-foreground truncate uppercase tracking-wider">
              {crmTenant?.name || 'CRM'}
            </p>
            <p className="font-semibold text-sm truncate">{activeLabel}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onSearchOpen}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 p-0 text-[8px] flex items-center justify-center">
              3
            </Badge>
          </Button>
          <CRMProfileMenu onNavigate={onProfileNavigate} onLogout={onLogout} />
        </div>
      </div>
    </>
  );
}