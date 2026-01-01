import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AffiliateProfileMenuProps {
  affiliateName: string;
  affiliateCode: string;
  onNavigate: (tab: string) => void;
}

export function AffiliateProfileMenu({ 
  affiliateName, 
  affiliateCode,
  onNavigate 
}: AffiliateProfileMenuProps) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const handleLogout = async () => {
    const isAffiliateSubdomain = window.location.hostname === 'parceiros.genesishub.cloud';
    const loginPath = isAffiliateSubdomain ? '/login' : '/afiliado/login';
    
    await supabase.auth.signOut();
    navigate(loginPath);
    toast.success('Logout realizado com sucesso');
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const initials = affiliateName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2 hover:bg-secondary">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start text-sm">
            <span className="font-medium text-foreground">{affiliateName.split(' ')[0]}</span>
            <span className="text-xs text-muted-foreground">{affiliateCode}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {affiliateName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Código: {affiliateCode}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Meu Perfil
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onNavigate('settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Tema Escuro
            </span>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
