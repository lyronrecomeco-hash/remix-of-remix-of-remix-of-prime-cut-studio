import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Shield, Home, Grid3X3, FileText, Gift,
  Loader2, Save, Radar, Search, HelpCircle, Settings
} from 'lucide-react';
import { useManageMenuPermissions } from '@/hooks/useMenuPermissions';

// Menu items definition matching GenesisIADashboard
// Menu items available for permission control (excludes admin-only items)
const MENU_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: Home, description: 'Painel principal do Genesis' },
  { id: 'prospects', label: 'Scanner IA', icon: Search, description: 'Encontrar clientes com IA' },
  { id: 'radar', label: 'Radar Global', icon: Radar, description: 'Radar de oportunidades' },
  { id: 'criar-projetos', label: 'Biblioteca', icon: Grid3X3, description: 'Biblioteca de projetos' },
  { id: 'contracts', label: 'Contratos', icon: FileText, description: 'Gestão de contratos' },
  { id: 'promocional', label: 'Promocional', icon: Gift, description: 'Materiais promocionais' },
  { id: 'help', label: 'Central de Ajuda', icon: HelpCircle, description: 'Suporte e tutoriais' },
  { id: 'settings', label: 'Configurações', icon: Settings, description: 'Configurações do sistema' },
];

interface UserPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    user_id: string;
    name: string;
    email: string;
  } | null;
}

export const UserPermissionsModal = ({ open, onOpenChange, user }: UserPermissionsModalProps) => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { getUserPermissions, setMultiplePermissions, saving } = useManageMenuPermissions();

  useEffect(() => {
    if (open && user) {
      loadPermissions();
    }
  }, [open, user]);

  const loadPermissions = async () => {
    if (!user) return;
    setIsLoading(true);
    const perms = await getUserPermissions(user.user_id);
    
    // Initialize all menus as allowed by default
    const initialPerms: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => {
      initialPerms[item.id] = perms[item.id] !== undefined ? perms[item.id] : true;
    });
    
    setPermissions(initialPerms);
    setIsLoading(false);
  };

  const handleToggle = (menuId: string) => {
    setPermissions(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleSelectAll = () => {
    const allAllowed: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => {
      allAllowed[item.id] = true;
    });
    setPermissions(allAllowed);
  };

  const handleDeselectAll = () => {
    const allDenied: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => {
      allDenied[item.id] = false;
    });
    setPermissions(allDenied);
  };

  const handleSave = async () => {
    if (!user) return;
    
    const success = await setMultiplePermissions(user.user_id, permissions);
    if (success) {
      toast.success('Permissões salvas com sucesso!');
      onOpenChange(false);
    } else {
      toast.error('Erro ao salvar permissões');
    }
  };

  const allowedCount = Object.values(permissions).filter(Boolean).length;
  const deniedCount = MENU_ITEMS.length - allowedCount;

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-[hsl(222,20%,8%)] border-white/10">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-lg">Permissões de Acesso</span>
              <p className="text-sm text-muted-foreground font-normal mt-0.5">
                {user.name}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configure quais módulos o usuário pode acessar
          </DialogDescription>
        </DialogHeader>

        {/* Stats Bar */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                {allowedCount} permitido{allowedCount !== 1 ? 's' : ''}
              </Badge>
            </span>
            <span className="text-muted-foreground">
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                {deniedCount} bloqueado{deniedCount !== 1 ? 's' : ''}
              </Badge>
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs h-7">
              Permitir Todos
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeselectAll} className="text-xs h-7 text-red-400 hover:text-red-300">
              Bloquear Todos
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <ScrollArea className="flex-1 max-h-[400px]">
          <div className="px-6 py-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isAllowed = permissions[item.id] ?? true;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`
                      flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all
                      ${isAllowed 
                        ? 'bg-white/5 border border-emerald-500/20 hover:border-emerald-500/40' 
                        : 'bg-red-500/5 border border-red-500/20 hover:border-red-500/40'
                      }
                    `}
                  >
                    <Checkbox
                      checked={isAllowed}
                      onCheckedChange={() => handleToggle(item.id)}
                      className={isAllowed ? 'border-emerald-500 data-[state=checked]:bg-emerald-500' : 'border-red-500'}
                    />
                    <div className={`
                      w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                      ${isAllowed ? 'bg-primary/20' : 'bg-red-500/20'}
                    `}>
                      <Icon className={`w-4 h-4 ${isAllowed ? 'text-primary' : 'text-red-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isAllowed ? 'text-foreground' : 'text-red-400'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`shrink-0 text-[10px] ${
                        isAllowed 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {isAllowed ? 'Permitido' : 'Bloqueado'}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-white/10 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Permissões
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
