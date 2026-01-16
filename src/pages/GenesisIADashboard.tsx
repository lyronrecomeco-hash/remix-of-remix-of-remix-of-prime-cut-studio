import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Brain, 
  Search,
  RefreshCw,
  Users,
  MessageSquare,
  Sparkles,
  BarChart3,
  Zap,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Target,
  Bot,
  FileText,
  Rocket,
  Crown,
  Home,
  Grid3X3,
  LayoutDashboard,
  Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GenesisIADashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/genesis-ia");
      return;
    }
    setUserName(user.email?.split("@")[0] || "Usuário");
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate("/genesis-ia");
  };

  const mainCards = [
    {
      id: "prospects",
      icon: Search,
      title: "Encontrar Clientes",
      description: "Descubra clientes com maior potencial de compra",
      badge: <Users className="w-4 h-4" />,
      gradient: "from-blue-500/20 to-blue-600/10",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400"
    },
    {
      id: "improve",
      icon: RefreshCw,
      title: "Aprimorar projeto",
      description: "Adicione funcionalidades ou refine o design",
      badge: <span className="text-xs font-mono">&lt;/&gt;</span>,
      gradient: "from-cyan-500/20 to-cyan-600/10",
      iconBg: "bg-cyan-500/20",
      iconColor: "text-cyan-400"
    }
  ];

  const quickAccessCards = [
    { icon: MessageSquare, title: "Chatbots", description: "Gerencie suas automações", color: "blue" },
    { icon: BarChart3, title: "Analytics", description: "Métricas e relatórios", color: "cyan" },
    { icon: Bot, title: "IA Avançada", description: "Modelos personalizados", color: "blue" },
    { icon: FileText, title: "Redator IA", description: "Crie copy de vendas com IA", color: "cyan" },
    { icon: Rocket, title: "Landing Pages", description: "Crie páginas de alta conversão", color: "blue" }
  ];

  const dockItems = [
    { icon: Home, label: "Início", active: true },
    { icon: Grid3X3, label: "Apps" },
    { icon: LayoutDashboard, label: "Projetos" },
    { icon: RefreshCw, label: "Sincronizar" },
    { icon: Settings, label: "Config" },
    { icon: LogOut, label: "Sair", onClick: handleLogout }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-12 h-12 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Genesis<span className="text-blue-400"> IA</span>
              </h1>
            </div>
          </div>

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-[#111827]/60 border border-blue-500/10"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👋</span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Bem vindo de volta, <span className="text-blue-400 capitalize">{userName}</span>
                </p>
                <p className="text-xs text-blue-300/50">
                  Transforme sua ideia em SaaS em minutos
                </p>
              </div>
            </div>
            <button className="p-2 rounded-lg hover:bg-blue-500/10 transition-colors">
              <Bell className="w-5 h-5 text-blue-400/60" />
            </button>
          </motion.div>
        </header>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          Criar meu SaaS agora
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {mainCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="group relative"
            >
              <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${card.gradient} border border-blue-500/10 hover:border-blue-500/20 transition-all cursor-pointer backdrop-blur-sm`}>
                {/* Badge */}
                <div className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#0a0f1a]/50 flex items-center justify-center text-blue-400/60">
                  {card.badge}
                </div>
                
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-5`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-blue-300/50">{card.description}</p>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-sm font-medium text-blue-300/40 mb-5">Acesse também</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickAccessCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="group"
              >
                <div className="p-5 rounded-2xl bg-[#111827]/40 border border-blue-500/10 hover:border-blue-500/20 hover:bg-[#111827]/60 transition-all cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${card.color === 'blue' ? 'bg-blue-500/20' : 'bg-cyan-500/20'} flex items-center justify-center mb-4`}>
                    <card.icon className={`w-5 h-5 ${card.color === 'blue' ? 'text-blue-400' : 'text-cyan-400'}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{card.title}</h4>
                  <p className="text-xs text-blue-300/40">{card.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: TrendingUp, label: "Crescimento", value: "+127%", color: "blue" },
            { icon: Target, label: "Conversões", value: "892", color: "cyan" },
            { icon: Users, label: "Leads", value: "2.4k", color: "blue" },
            { icon: Crown, label: "Plano", value: "Pro", color: "cyan" }
          ].map((stat, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-[#111827]/30 border border-blue-500/5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${stat.color === 'blue' ? 'bg-blue-500/15' : 'bg-cyan-500/15'} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color === 'blue' ? 'text-blue-400' : 'text-cyan-400'}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-blue-300/40">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mac-style Dock */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#111827]/90 backdrop-blur-xl border border-blue-500/20 shadow-2xl shadow-black/40">
          {dockItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={item.onClick}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                item.active 
                  ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border border-blue-500/30' 
                  : 'hover:bg-blue-500/10 border border-transparent'
              }`}
              whileHover={{ 
                scale: 1.2, 
                y: -8,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-400' : 'text-blue-300/60'}`} />
              
              {/* Active Indicator */}
              {item.active && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-400" />
              )}
              
              {/* Tooltip */}
              <motion.div
                className="absolute -top-10 px-2 py-1 rounded-lg bg-[#1e293b] text-xs text-white opacity-0 pointer-events-none whitespace-nowrap"
                whileHover={{ opacity: 1 }}
              >
                {item.label}
              </motion.div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 transition-shadow z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
};

export default GenesisIADashboard;
