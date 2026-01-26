import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Target, 
  Bot, 
  BarChart3, 
  FileText, 
  Rocket, 
  MessageCircle,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  Brain
} from 'lucide-react';

// Instagram Post Card Component (1:1 aspect ratio)
const InstagramPost = ({ 
  children, 
  className = "",
  gradient = "from-background via-background to-primary/5"
}: { 
  children: React.ReactNode; 
  className?: string;
  gradient?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`relative aspect-square w-full max-w-[400px] bg-gradient-to-br ${gradient} rounded-2xl border border-white/10 overflow-hidden shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

// Reusable Genesis Logo SVG
const GenesisG = ({ size = 80, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    className={className}
  >
    <defs>
      <linearGradient id="gGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" stroke="url(#gGradient)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="200 60" />
    <path d="M50 50 H75" stroke="url(#gGradient)" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const DivulgacaoPage = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <GenesisG size={48} />
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-gradient">Genesis Hub</span> - Posts para Instagram
          </h1>
        </motion.div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Designs prontos para divulgação. Clique com botão direito → Salvar imagem, ou tire print da tela.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Post 1 - Apresentação Principal */}
        <InstagramPost gradient="from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-cyan-500/10" />
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            <GenesisG size={100} className="mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">Genesis Hub</h2>
            <p className="text-cyan-400 text-lg font-medium mb-6">Sua Central de Vendas com IA</p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-cyan-500 mb-6" />
            <p className="text-white/70 text-sm">
              Automatize • Prospecte • Converta
            </p>
          </div>
          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/50" />
        </InstagramPost>

        {/* Post 2 - Problema/Dor */}
        <InstagramPost gradient="from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C]">
          <div className="relative h-full flex flex-col p-8">
            <div className="text-red-400/80 text-sm font-medium mb-4">VOCÊ AINDA...</div>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {[
                "Perde horas procurando clientes?",
                "Manda propostas que nunca fecham?",
                "Não sabe quem abordar primeiro?",
                "Gasta fortunas com leads frios?"
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-white/90 text-lg">{text}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-auto pt-6 text-center">
              <p className="text-white/50 text-sm">A Genesis resolve isso 👇</p>
            </div>
          </div>
        </InstagramPost>

        {/* Post 3 - Radar de Oportunidades */}
        <InstagramPost gradient="from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C]">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
              <Target className="w-20 h-20 text-primary" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Radar de Oportunidades</h2>
            <p className="text-white/70 mb-6">
              IA encontra empresas que <span className="text-cyan-400">PRECISAM</span> do seu serviço
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/60">Leads encontrados hoje:</span>
                <span className="text-green-400 font-bold">+127</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Score médio:</span>
                <span className="text-primary font-bold">8.4/10</span>
              </div>
            </div>
          </div>
        </InstagramPost>

        {/* Post 4 - Propostas Automáticas */}
        <InstagramPost gradient="from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C]">
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            <FileText className="w-16 h-16 text-cyan-400 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Propostas que Vendem</h2>
            <p className="text-white/70 mb-6">
              IA cria propostas personalizadas em <span className="text-primary">segundos</span>
            </p>
            <div className="space-y-3 w-full">
              {[
                { icon: Brain, text: "Análise do cliente" },
                { icon: Sparkles, text: "Texto persuasivo" },
                { icon: Zap, text: "Envio automático" }
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-white/90">{text}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </InstagramPost>

        {/* Post 5 - Resultados/Números */}
        <InstagramPost gradient="from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C]">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
          <div className="relative h-full flex flex-col p-8">
            <div className="text-primary text-sm font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              RESULTADOS REAIS
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { value: "3x", label: "Mais conversões", color: "text-green-400" },
                { value: "80%", label: "Tempo economizado", color: "text-cyan-400" },
                { value: "500+", label: "Leads/mês", color: "text-primary" },
                { value: "24/7", label: "Prospecção ativa", color: "text-purple-400" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                  <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-white/60 text-xs text-center mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-white/50 text-xs mt-4">
              Dados de clientes Genesis Hub
            </p>
          </div>
        </InstagramPost>

        {/* Post 6 - WhatsApp Integration */}
        <InstagramPost gradient="from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C]">
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
              <MessageCircle className="w-20 h-20 text-green-500" />
              <Bot className="w-10 h-10 text-primary absolute -bottom-2 -right-2 bg-background rounded-full p-1" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">WhatsApp + IA</h2>
            <p className="text-white/70 mb-6">
              Atendimento automático 24h
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full space-y-3">
              <div className="flex gap-2">
                <div className="bg-white/10 rounded-xl rounded-bl-none p-3 text-left text-sm text-white/90 max-w-[80%]">
                  Olá, quero saber mais sobre seus serviços
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="bg-primary/20 border border-primary/30 rounded-xl rounded-br-none p-3 text-left text-sm text-white/90 max-w-[80%]">
                  Olá! 👋 Temos a solução perfeita para você...
                </div>
              </div>
            </div>
          </div>
        </InstagramPost>

        {/* Post 7 - Features List */}
        <InstagramPost gradient="from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C]">
          <div className="relative h-full flex flex-col p-8">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              Tudo que você precisa
            </h2>
            <div className="flex-1 space-y-3">
              {[
                { icon: Target, text: "Radar de Leads com IA" },
                { icon: FileText, text: "Propostas Automáticas" },
                { icon: Bot, text: "Chatbot Inteligente" },
                { icon: BarChart3, text: "Dashboard Completo" },
                { icon: Users, text: "CRM Integrado" },
                { icon: Clock, text: "Prospecção 24/7" }
              ].map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-white/90 text-sm">{text}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                </motion.div>
              ))}
            </div>
          </div>
        </InstagramPost>

        {/* Post 8 - Preço/CTA */}
        <InstagramPost gradient="from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="text-primary text-sm font-medium mb-2">OFERTA ESPECIAL</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Comece agora por
            </h2>
            <div className="mb-6">
              <span className="text-white/50 text-lg line-through">R$ 497</span>
              <div className="text-5xl font-bold text-gradient">R$ 197</div>
              <span className="text-white/60 text-sm">/mês</span>
            </div>
            <div className="bg-white/5 border border-primary/30 rounded-xl p-4 w-full mb-6">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                <span className="font-medium">7 dias de teste grátis</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <span>Acesse genesishub.cloud</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </InstagramPost>

        {/* Post 9 - Depoimento/Social Proof */}
        <InstagramPost gradient="from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C]">
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="flex gap-1 mb-6">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-white/90 text-lg italic mb-6 leading-relaxed">
              "Em 1 mês, fechei mais contratos do que nos últimos 6 meses combinados. A Genesis mudou meu negócio."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold">
                JP
              </div>
              <div className="text-left">
                <div className="text-white font-medium">João Pedro</div>
                <div className="text-white/50 text-sm">Agência Digital</div>
              </div>
            </div>
          </div>
        </InstagramPost>

      </div>

      {/* Stories Section */}
      <div className="max-w-7xl mx-auto mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="text-gradient">Stories</span> (9:16)
        </h2>
        
        <div className="flex flex-wrap justify-center gap-6">
          
          {/* Story 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="w-[250px] aspect-[9/16] bg-gradient-to-br from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C] rounded-3xl border border-white/10 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-cyan-500/20" />
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
              <GenesisG size={80} className="mb-8" />
              <h3 className="text-2xl font-bold text-white mb-4">Genesis Hub</h3>
              <p className="text-white/70 mb-8">Sua central de vendas com Inteligência Artificial</p>
              <div className="mt-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                  <span className="text-white text-sm">Arraste para cima ↑</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Story 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-[250px] aspect-[9/16] bg-gradient-to-br from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C] rounded-3xl border border-white/10 overflow-hidden relative"
          >
            <div className="relative h-full flex flex-col p-6">
              <div className="text-primary text-sm font-medium mb-4">IMAGINE...</div>
              <div className="flex-1 flex flex-col justify-center space-y-4">
                {[
                  "Leads chegando sozinhos",
                  "Propostas que convertem",
                  "WhatsApp automatizado",
                  "Dashboard em tempo real"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span className="text-white text-lg">{text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto text-center">
                <p className="text-primary font-medium">Isso é Genesis Hub</p>
              </div>
            </div>
          </motion.div>

          {/* Story 3 - CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-[250px] aspect-[9/16] bg-gradient-to-br from-[#0A0F1C] via-[#0D1424] to-[#0A0F1C] rounded-3xl border border-white/10 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
              <Rocket className="w-16 h-16 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Comece Agora</h3>
              <p className="text-white/70 mb-6">7 dias grátis para testar</p>
              <div className="text-4xl font-bold text-gradient mb-2">R$ 197</div>
              <span className="text-white/50 text-sm mb-8">/mês</span>
              <div className="bg-gradient-to-r from-primary to-cyan-500 rounded-full px-8 py-4">
                <span className="text-white font-bold">ACESSAR AGORA</span>
              </div>
              <p className="text-white/50 text-xs mt-4">genesishub.cloud</p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-20 text-center">
        <p className="text-muted-foreground">
          © 2026 Genesis Hub. Todos os designs são livres para uso em divulgação da marca.
        </p>
      </div>
    </div>
  );
};

export default DivulgacaoPage;
