import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain,
  Home,
  Grid3X3,
  FileText,
  RefreshCw,
  Settings,
  LogOut,
  Users,
  Target,
  TrendingUp,
  Globe,
  Sparkles,
  Zap,
  BarChart3,
  Bot,
  Rocket,
  Search,
  Bell,
  ChevronRight,
  ArrowUpRight,
  MessageSquare,
  Briefcase,
  Building2,
  MapPin,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SUPER_ADMIN_EMAIL = "lyronrp@gmail.com";

interface DockItem {
  icon: React.ElementType;
  label: string;
  action: string;
  isActive?: boolean;
}

const GenesisIADashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuário");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [notifications, setNotifications] = useState(5);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/genesis-ia");
      return;
    }
    setUserName(user.email?.split("@")[0] || "Usuário");
    setIsSuperAdmin(user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate("/genesis-ia");
  };

  const dockItems: DockItem[] = [
    { icon: Home, label: "Início", action: "home", isActive: activeTab === "home" },
    { icon: Grid3X3, label: "Projetos", action: "projects" },
    { icon: FileText, label: "Propostas", action: "proposals" },
    { icon: RefreshCw, label: "Prospecção", action: "prospecting" },
    { icon: Settings, label: "Config", action: "settings" },
    { icon: LogOut, label: "Sair", action: "logout" },
  ];

  const handleDockClick = (action: string) => {
    if (action === "logout") {
      handleLogout();
    } else {
      setActiveTab(action);
    }
  };

  const stats = [
    { label: "Oportunidades", value: "247", change: "+18%", icon: Target, color: "from-blue-500 to-cyan-400" },
    { label: "Propostas Enviadas", value: "89", change: "+12%", icon: FileText, color: "from-violet-500 to-purple-400" },
    { label: "Taxa de Conversão", value: "34%", change: "+5%", icon: TrendingUp, color: "from-emerald-500 to-green-400" },
    { label: "Receita Gerada", value: "R$ 127k", change: "+23%", icon: BarChart3, color: "from-orange-500 to-amber-400" },
  ];

  const mainCards = [
    {
      title: "Encontrar Clientes",
      description: "Descubra clientes com maior potencial de compra",
      icon: Users,
      action: "prospects",
      badge: "IA",
    },
    {
      title: "Aprimorar Projeto",
      description: "Adicione funcionalidades ou refine o design",
      icon: Sparkles,
      action: "enhance",
      badge: "</>" ,
    },
  ];

  const quickAccess = [
    { title: "Academia Genesis", description: "Aprimore suas habilidades", icon: Brain, color: "bg-blue-500/20 border-blue-500/30" },
    { title: "Apps Virais", description: "Exemplos de aplicativos de sucesso", icon: Rocket, color: "bg-cyan-500/20 border-cyan-500/30" },
    { title: "Redator IA", description: "Crie copy de vendas personalizada", icon: MessageSquare, color: "bg-violet-500/20 border-violet-500/30" },
    { title: "Construtor de Páginas", description: "Crie landing pages profissionais", icon: Building2, color: "bg-emerald-500/20 border-emerald-500/30" },
  ];

  const recentOpportunities = [
    { company: "TechStart Solutions", location: "São Paulo, BR", score: 92, niche: "SaaS", hasWebsite: false },
    { company: "Digital Commerce Pro", location: "Miami, USA", score: 88, niche: "E-commerce", hasWebsite: true },
    { company: "InnovateLab Berlin", location: "Berlin, DE", score: 85, niche: "Fintech", hasWebsite: false },
  ];

  return (
    <div className="min-h-screen bg-[#050a12] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-blue-500/10 bg-[#050a12]/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                GENESIS<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> IA</span>
              </h1>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="ml-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <span className="text-xs font-medium text-amber-400">Super Admin</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Search className="w-4 h-4 text-blue-400/50" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-blue-400/30 w-40"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
            <Bell className="w-5 h-5 text-blue-400" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-xs font-bold flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6 pb-32">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👋</span>
                <h2 className="text-2xl font-bold text-white">
                  Bem vindo de volta, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{userName.toUpperCase()}</span>
                </h2>
              </div>
              <p className="text-blue-200/50">
                A forma mais simples de transformar sua ideia em SaaS. Crie em minutos, gere páginas e textos de vendas e conquiste seus primeiros clientes com IA.
              </p>
            </div>

            <Button className="hidden md:flex bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30">
              Criar meu SaaS agora →
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="p-4 rounded-2xl bg-[#0a1628]/50 border border-blue-500/10 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-blue-200/50">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          {mainCards.map((card, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-6 rounded-2xl bg-[#0a1628]/50 border border-blue-500/20 hover:border-blue-500/40 text-left transition-all group overflow-hidden"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <card.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs font-mono text-blue-400/60 bg-blue-500/10 px-2 py-1 rounded-lg">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-blue-200/50">{card.description}</p>
              </div>

              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/30 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Acesse também</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccess.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl ${item.color} backdrop-blur-sm text-left transition-all group`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-sm text-white/60">{item.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Oportunidades Recentes
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-xs text-blue-400">Radar Global</span>
            </h3>
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
              Ver todas <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentOpportunities.map((opp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#0a1628]/50 border border-blue-500/10 hover:border-blue-500/30 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {opp.company}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-blue-200/50">
                      <MapPin className="w-3 h-3" />
                      {opp.location}
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-xs text-blue-400">
                        {opp.niche}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {!opp.hasWebsite && (
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-xs text-emerald-400">
                      Sem site
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-white">{opp.score}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400/30 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Mac-style Dock */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0a1628]/90 backdrop-blur-xl border border-blue-500/20 shadow-2xl shadow-black/50">
          {dockItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => handleDockClick(item.action)}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                ${item.isActive 
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/40' 
                  : 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20'
                }`}
              whileHover={{ 
                scale: 1.3, 
                y: -12,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className={`w-6 h-6 ${item.isActive ? 'text-white' : 'text-blue-400'}`} />
              
              {/* Tooltip */}
              <motion.span
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[#0a1628] border border-blue-500/30 text-xs font-medium text-white whitespace-nowrap opacity-0 pointer-events-none"
                initial={false}
                whileHover={{ opacity: 1 }}
              >
                {item.label}
              </motion.span>

              {/* Active Indicator */}
              {item.isActive && (
                <motion.div
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white"
                  layoutId="dockIndicator"
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/40 z-40"
      >
        <Bot className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
};

export default GenesisIADashboard;
