import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Shield, Home, Grid3X3, FileText, Gift,
  Loader2, Save, Radar, Search, HelpCircle, Settings,
  Wifi, WifiOff, Monitor, Clock, Timer, MapPin,
  MonitorSmartphone, Activity
} from 'lucide-react';
import { useManageMenuPermissions } from '@/hooks/useMenuPermissions';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface UserPresenceData {
  is_online: boolean;
  last_seen_at: string | null;
  last_login_at: string | null;
  current_page: string | null;
  device_info: string | null;
  session_started_at: string | null;
}

const PAGE_LABELS: Record<string, string> = {
  'dashboard': 'Painel Principal',
  'prospects': 'Scanner IA',
  'radar': 'Radar Global',
  'criar-projetos': 'Biblioteca',
  'contracts': 'Contratos',
  'promocional': 'Promocional',
  'help': 'Central de Ajuda',
  'settings': 'Configurações',
  'payments': 'Pagamentos',
  'users': 'Usuários',
};

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
  const [presence, setPresence] = useState<UserPresenceData | null>(null);
  const [presenceLoading, setPresenceLoading] = useState(true);
  const { getUserPermissions, setMultiplePermissions, saving } = useManageMenuPermissions();

  useEffect(() => {
    if (open && user) {
      loadPermissions();
      loadPresence();

      // Realtime presence subscription
      const channel = supabase
        .channel(`user-presence-${user.user_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_presence',
            filter: `user_id=eq.${user.user_id}`
          },
          (payload) => {
            const newData = payload.new as Record<string, unknown>;
            if (newData) {
              setPresence({
                is_online: newData.is_online as boolean,
                last_seen_at: newData.last_seen_at as string | null,
                last_login_at: newData.last_login_at as string | null,
                current_page: newData.current_page as string | null,
                device_info: newData.device_info as string | null,
                session_started_at: newData.session_started_at as string | null,
              });
            }
          }
        )
        .subscribe();

      // Poll every 10s for accuracy
      const interval = setInterval(loadPresence, 10000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, [open, user]);

  const loadPresence = async () => {
    if (!user) return;
    setPresenceLoading(true);
    try {
      const { data } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', user.user_id)
        .maybeSingle();

      setPresence(data ? {
        is_online: data.is_online,
        last_seen_at: data.last_seen_at,
        last_login_at: data.last_login_at,
        current_page: data.current_page,
        device_info: data.device_info,
        session_started_at: data.session_started_at,
      } : null);
    } catch (err) {
      console.error('Error loading presence:', err);
    } finally {
      setPresenceLoading(false);
    }
  };

  const loadPermissions = async () => {
    if (!user) return;
    setIsLoading(true);
    const perms = await getUserPermissions(user.user_id);
    const initialPerms: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => {
      initialPerms[item.id] = perms[item.id] !== undefined ? perms[item.id] : true;
    });
    setPermissions(initialPerms);
    setIsLoading(false);
  };

  const handleToggle = (menuId: string) => {
    setPermissions(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleSelectAll = () => {
    const allAllowed: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => { allAllowed[item.id] = true; });
    setPermissions(allAllowed);
  };

  const handleDeselectAll = () => {
    const allDenied: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => { allDenied[item.id] = false; });
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

  const isReallyOnline = (): boolean => {
    if (!presence?.is_online || !presence.last_seen_at) return false;
    return new Date(presence.last_seen_at).getTime() > Date.now() - 2 * 60 * 1000;
  };

  const formatTime = (time: string | null): string => {
    if (!time) return 'Nunca';
    try {
      return formatDistanceToNow(new Date(time), { addSuffix: true, locale: ptBR });
    } catch { return 'Inválido'; }
  };

  const getPageLabel = (page: string | null): string => {
    if (!page) return 'Desconhecida';
    return PAGE_LABELS[page] || page;
  };

  const allowedCount = Object.values(permissions).filter(Boolean).length;
  const deniedCount = MENU_ITEMS.length - allowedCount;
  const online = isReallyOnline();

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-[hsl(222,20%,8%)] border-white/10">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              {online && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[hsl(222,20%,8%)] animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{user.name}</span>
                {online ? (
                  <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Wifi className="w-2.5 h-2.5 mr-1" /> Online
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] bg-white/5 text-white/40">
                    <WifiOff className="w-2.5 h-2.5 mr-1" /> Offline
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal mt-0.5">{user.email}</p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visualize atividade e configure permissões do usuário
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="activity" className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-3 bg-white/5 border border-white/10">
            <TabsTrigger value="activity" className="gap-1.5 text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Activity className="w-3.5 h-3.5" /> Atividade
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-1.5 text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Shield className="w-3.5 h-3.5" /> Permissões
            </TabsTrigger>
          </TabsList>

          {/* ─── ACTIVITY TAB ─── */}
          <TabsContent value="activity" className="flex-1 mt-0">
            <ScrollArea className="max-h-[400px]">
              <div className="px-6 py-4 space-y-4">
                {presenceLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : !presence ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    Nenhum dado de atividade registrado
                  </div>
                ) : (
                  <>
                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl border ${online ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${online ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                          {online ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-white/40" />}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${online ? 'text-emerald-400' : 'text-white/60'}`}>
                            {online ? 'Ativo agora' : 'Offline'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {online && presence.current_page
                              ? `Navegando: ${getPageLabel(presence.current_page)}`
                              : `Último acesso: ${formatTime(presence.last_seen_at)}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <ActivityCard
                        icon={MapPin}
                        label="Página Atual"
                        value={online ? getPageLabel(presence.current_page) : 'Nenhuma'}
                        active={online}
                      />
                      <ActivityCard
                        icon={MonitorSmartphone}
                        label="Dispositivo"
                        value={presence.device_info || 'Desconhecido'}
                        active={false}
                      />
                      <ActivityCard
                        icon={Timer}
                        label="Último Acesso"
                        value={formatTime(presence.last_seen_at)}
                        active={false}
                      />
                      <ActivityCard
                        icon={Clock}
                        label="Último Login"
                        value={formatTime(presence.last_login_at)}
                        active={false}
                      />
                    </div>

                    {/* Session Info */}
                    {online && presence.session_started_at && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 text-xs text-primary">
                          <Activity className="w-3.5 h-3.5" />
                          <span>Sessão iniciada {formatTime(presence.session_started_at)}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ─── PERMISSIONS TAB ─── */}
          <TabsContent value="permissions" className="flex-1 mt-0">
            {/* Stats Bar */}
            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  {allowedCount} permitido{allowedCount !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                  {deniedCount} bloqueado{deniedCount !== 1 ? 's' : ''}
                </Badge>
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

            <ScrollArea className="max-h-[350px]">
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
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                          isAllowed
                            ? 'bg-white/5 border border-emerald-500/20 hover:border-emerald-500/40'
                            : 'bg-red-500/5 border border-red-500/20 hover:border-red-500/40'
                        }`}
                      >
                        <Checkbox
                          checked={isAllowed}
                          onCheckedChange={() => handleToggle(item.id)}
                          className={isAllowed ? 'border-emerald-500 data-[state=checked]:bg-emerald-500' : 'border-red-500'}
                        />
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isAllowed ? 'bg-primary/20' : 'bg-red-500/20'}`}>
                          <Icon className={`w-4 h-4 ${isAllowed ? 'text-primary' : 'text-red-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isAllowed ? 'text-foreground' : 'text-red-400'}`}>{item.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
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
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t border-white/10 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Permissões
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function ActivityCard({ icon: Icon, label, value, active }: { icon: React.ElementType; label: string; value: string; active: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-muted-foreground'}`} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={`text-sm font-medium truncate ${active ? 'text-emerald-400' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
