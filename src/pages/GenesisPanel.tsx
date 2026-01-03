import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  LayoutDashboard, 
  MessageSquare, 
  GitBranch, 
  Settings, 
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bot,
  Smartphone,
  Plus,
  Crown,
  ChevronRight,
  Bell,
  Search,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { WAFlowBuilder } from '@/components/owner/whatsapp/flow-builder';

// Dashboard component
const GenesisDashboard = () => {
  const { genesisUser, credits, subscription, isSuperAdmin } = useGenesisAuth();

  const stats = [
    { label: 'Instâncias Ativas', value: '3', max: subscription?.max_instances || 1, icon: Smartphone, color: 'text-green-500' },
    { label: 'Fluxos Criados', value: '12', max: subscription?.max_flows || 5, icon: GitBranch, color: 'text-blue-500' },
    { label: 'Mensagens Hoje', value: '1,234', icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Créditos', value: credits?.available_credits?.toString() || '0', icon: CreditCard, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Olá, {genesisUser?.name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de automação.
          </p>
        </div>
        {isSuperAdmin && (
          <Badge variant="secondary" className="gap-1">
            <Crown className="w-3 h-3" />
            Super Admin
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={cn("w-8 h-8", stat.color)} />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.max && (
                  <Progress value={(parseInt(stat.value) / stat.max) * 100} className="mt-2 h-1" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-primary" />
              Nova Instância
            </CardTitle>
            <CardDescription>Conecte uma nova conta WhatsApp</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitBranch className="w-5 h-5 text-primary" />
              Criar Fluxo
            </CardTitle>
            <CardDescription>Monte um novo fluxo de automação</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5 text-primary" />
              Chatbot IA
            </CardTitle>
            <CardDescription>Configure respostas inteligentes</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Plan Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Seu Plano: <span className="text-primary capitalize">{subscription?.plan || 'Free'}</span>
              </CardTitle>
              <CardDescription>
                {subscription?.plan === 'free' 
                  ? 'Faça upgrade para desbloquear mais recursos'
                  : 'Aproveite todos os recursos do seu plano'}
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Crown className="w-4 h-4" />
              Fazer Upgrade
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Instâncias</p>
              <p className="font-semibold">3 / {subscription?.max_instances || 1}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fluxos</p>
              <p className="font-semibold">12 / {subscription?.max_flows || 5}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Créditos</p>
              <p className="font-semibold">{credits?.available_credits || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="secondary" className="text-green-600">Ativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Instances component
const GenesisInstances = () => {
  const instances = [
    { id: '1', name: 'Atendimento Principal', phone: '+55 11 99999-9999', status: 'connected', lastActivity: '2 min atrás' },
    { id: '2', name: 'Vendas', phone: '+55 11 88888-8888', status: 'disconnected', lastActivity: '1 hora atrás' },
    { id: '3', name: 'Suporte', phone: '+55 11 77777-7777', status: 'paused', lastActivity: '30 min atrás' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'paused': return 'Pausado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instâncias WhatsApp</h1>
          <p className="text-muted-foreground">Gerencie suas conexões</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Instância
        </Button>
      </div>

      <div className="grid gap-4">
        {instances.map((instance) => (
          <Card key={instance.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{instance.name}</h3>
                  <p className="text-sm text-muted-foreground">{instance.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(instance.status))} />
                    <span className="text-sm">{getStatusLabel(instance.status)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{instance.lastActivity}</p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ações
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {instance.status === 'connected' && (
                      <DropdownMenuItem>Pausar</DropdownMenuItem>
                    )}
                    {instance.status === 'paused' && (
                      <DropdownMenuItem>Retomar</DropdownMenuItem>
                    )}
                    {instance.status === 'disconnected' && (
                      <DropdownMenuItem>Reconectar</DropdownMenuItem>
                    )}
                    <DropdownMenuItem>Reiniciar</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Desconectar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main Panel
export default function GenesisPanel() {
  const navigate = useNavigate();
  const { user, genesisUser, loading, isSuperAdmin, signOut } = useGenesisAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !genesisUser)) {
      navigate('/genesis/login');
    }
  }, [loading, user, genesisUser, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/genesis/login');
    toast.success('Até logo!');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'instances', label: 'Instâncias', icon: Smartphone },
    { id: 'flows', label: 'Flow Builder', icon: GitBranch },
    { id: 'chatbots', label: 'Chatbots', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  if (isSuperAdmin) {
    navItems.push({ id: 'users', label: 'Usuários', icon: Users });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <GenesisDashboard />;
      case 'instances':
        return <GenesisInstances />;
      case 'flows':
        return <WAFlowBuilder onBack={() => setActiveTab('dashboard')} />;
      case 'chatbots':
        return <div className="text-center py-20 text-muted-foreground">Em desenvolvimento...</div>;
      case 'analytics':
        return <div className="text-center py-20 text-muted-foreground">Em desenvolvimento...</div>;
      case 'settings':
        return <div className="text-center py-20 text-muted-foreground">Em desenvolvimento...</div>;
      case 'users':
        return <div className="text-center py-20 text-muted-foreground">Em desenvolvimento...</div>;
      default:
        return <GenesisDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Zap className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r bg-card/50 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold">Genesis Hub</h1>
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 p-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* User */}
        <div className="p-3 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={genesisUser?.avatar_url} />
                  <AvatarFallback>{genesisUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{genesisUser?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{genesisUser?.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                Ajuda
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold">Genesis Hub</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-3">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        activeTab === item.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="font-semibold capitalize">
              {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
