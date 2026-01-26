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
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  X,
  AlertCircle
} from 'lucide-react';

// Instagram Post Card Component (4:5 aspect ratio = 1080x1350)
const InstagramPost = ({ 
  children, 
  index = 0
}: { 
  children: React.ReactNode; 
  index?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="relative bg-[#050810] overflow-hidden"
    style={{ 
      aspectRatio: '4/5',
      width: '100%',
      maxWidth: '400px'
    }}
  >
    {children}
  </motion.div>
);

// Genesis Logo "G"
const GenesisG = ({ size = 60 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="42" stroke="url(#gGrad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="190 70" />
    <path d="M50 50 H72" stroke="url(#gGrad)" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const DivulgacaoPage = () => {
  return (
    <div className="min-h-screen bg-[#030508] py-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <GenesisG size={40} />
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Posts para Instagram <span className="text-primary">1080×1350px</span>
          </h1>
        </motion.div>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          Formato 4:5 otimizado para feed. Print ou salve cada imagem individualmente.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
        
        {/* POST 1 - GANCHO/CURIOSIDADE */}
        <InstagramPost index={0}>
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-cyan-500/10" />
          
          <div className="relative h-full flex flex-col p-10">
            {/* Logo top */}
            <div className="flex items-center gap-2 mb-auto">
              <GenesisG size={32} />
              <span className="text-white/60 text-sm font-medium tracking-wider">GENESIS HUB</span>
            </div>

            {/* Main content centered */}
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <span className="text-primary text-sm font-semibold tracking-widest mb-6">VOCÊ AINDA...</span>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
                Prospecta<br />
                <span className="text-white/40">manualmente?</span>
              </h2>

              <div className="w-20 h-1 bg-gradient-to-r from-primary to-cyan-500 rounded-full mb-8" />

              <p className="text-white/70 text-lg max-w-[280px]">
                Enquanto você busca 1 cliente, a IA encontra 100.
              </p>
            </div>

            {/* Footer CTA */}
            <div className="flex items-center justify-center gap-2 text-primary">
              <span className="text-sm font-medium">Arraste para ver →</span>
            </div>
          </div>
        </InstagramPost>

        {/* POST 2 - DOR/PROBLEMA */}
        <InstagramPost index={1}>
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />
          
          <div className="relative h-full flex flex-col p-10">
            <div className="flex items-center gap-2 mb-8">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm font-semibold tracking-wider">O PROBLEMA</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-10">
                Horas perdidas<br />
                <span className="text-white/40">todo dia fazendo:</span>
              </h2>

              <div className="space-y-5">
                {[
                  "Buscando leads no Google",
                  "Copiando dados manualmente",
                  "Escrevendo propostas do zero",
                  "Enviando mensagens uma a uma",
                  "Sem saber quem priorizar"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <X className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-white/80 text-lg">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-white/40 text-sm text-center mt-8">
              Isso acaba hoje. →
            </p>
          </div>
        </InstagramPost>

        {/* POST 3 - APRESENTAÇÃO DA SOLUÇÃO */}
        <InstagramPost index={2}>
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/30 rounded-full blur-[100px]" />
          </div>
          
          <div className="relative h-full flex flex-col items-center justify-center p-10 text-center">
            <span className="text-cyan-400 text-sm font-semibold tracking-widest mb-8">APRESENTAMOS</span>
            
            <GenesisG size={120} />
            
            <h2 className="text-5xl font-bold text-white mt-8 mb-4">
              Genesis<br />Hub
            </h2>
            
            <p className="text-xl text-white/60 mb-10">
              Sua central de vendas<br />com Inteligência Artificial
            </p>

            <div className="flex items-center gap-6 text-white/50 text-sm">
              <span>Automatize</span>
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span>Prospecte</span>
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span>Converta</span>
            </div>
          </div>
        </InstagramPost>

        {/* POST 4 - RADAR DE LEADS */}
        <InstagramPost index={3}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          
          <div className="relative h-full flex flex-col p-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-primary text-sm font-semibold tracking-wider">RECURSO 01</span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              Radar de<br />Oportunidades
            </h2>
            
            <p className="text-white/60 text-lg mb-8">
              IA encontra empresas que precisam do seu serviço. Automaticamente.
            </p>

            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-2 border-primary/30 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-2 border-primary/50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </div>
                {/* Pings */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <div className="absolute bottom-8 left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                <div className="absolute top-1/2 right-0 w-3 h-3 bg-primary rounded-full animate-pulse" />
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Leads encontrados</span>
                <span className="text-3xl font-bold text-green-400">+500/mês</span>
              </div>
            </div>
          </div>
        </InstagramPost>

        {/* POST 5 - PROPOSTAS AUTOMÁTICAS */}
        <InstagramPost index={4}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent" />
          
          <div className="relative h-full flex flex-col p-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-cyan-400 text-sm font-semibold tracking-wider">RECURSO 02</span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              Propostas que<br />
              <span className="text-cyan-400">Vendem Sozinhas</span>
            </h2>
            
            <p className="text-white/60 text-lg mb-8">
              IA analisa o cliente e cria propostas personalizadas em segundos.
            </p>

            <div className="flex-1 flex flex-col justify-center space-y-4">
              {[
                { icon: Target, text: "Analisa o perfil do lead", done: true },
                { icon: Sparkles, text: "Gera texto persuasivo", done: true },
                { icon: Zap, text: "Envia automaticamente", done: true }
              ].map(({ icon: Icon, text, done }, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-white flex-1">{text}</span>
                  {done && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                </div>
              ))}
            </div>

            <p className="text-white/40 text-sm text-center mt-6">
              De 2 horas → para 10 segundos
            </p>
          </div>
        </InstagramPost>

        {/* POST 6 - WHATSAPP IA */}
        <InstagramPost index={5}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent" />
          
          <div className="relative h-full flex flex-col p-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-green-400 text-sm font-semibold tracking-wider">RECURSO 03</span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              WhatsApp com<br />
              <span className="text-green-400">Inteligência Artificial</span>
            </h2>

            <div className="flex-1 flex flex-col justify-center">
              {/* Chat mockup */}
              <div className="bg-[#0B141A] rounded-2xl p-5 space-y-4 border border-white/10">
                <div className="flex gap-3">
                  <div className="bg-[#1F2C34] rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                    <p className="text-white/90 text-sm">Olá! Quero saber mais sobre o serviço de vocês 🙂</p>
                    <span className="text-white/40 text-xs">10:32</span>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <div className="bg-[#005C4B] rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                    <p className="text-white/90 text-sm">Olá, João! 👋 Vi que sua empresa está crescendo...</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <span className="text-white/40 text-xs">10:32</span>
                      <Bot className="w-3 h-3 text-cyan-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Bot className="w-4 h-4 text-primary" />
                  <span>Respondido pela Genesis IA</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-white/70">Atendimento 24/7 automático</span>
            </div>
          </div>
        </InstagramPost>

        {/* POST 7 - RESULTADOS/PROVA SOCIAL */}
        <InstagramPost index={6}>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
          
          <div className="relative h-full flex flex-col p-10">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-primary text-sm font-semibold tracking-wider">RESULTADOS</span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-8">
              Números que<br />
              <span className="text-gradient bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">impressionam</span>
            </h2>

            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { value: "3x", label: "Mais conversões", color: "from-green-400 to-emerald-500" },
                { value: "80%", label: "Tempo economizado", color: "from-cyan-400 to-blue-500" },
                { value: "500+", label: "Leads por mês", color: "from-primary to-violet-500" },
                { value: "24/7", label: "Prospecção ativa", color: "from-purple-400 to-pink-500" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-5 flex flex-col items-center justify-center border border-white/10">
                  <span className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </span>
                  <span className="text-white/50 text-sm text-center mt-2">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1 mt-8">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-white/60 text-sm ml-2">4.9/5 de satisfação</span>
            </div>
          </div>
        </InstagramPost>

        {/* POST 8 - OFERTA/CTA */}
        <InstagramPost index={7}>
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          </div>
          
          <div className="relative h-full flex flex-col items-center justify-center p-10 text-center">
            <div className="bg-gradient-to-r from-primary to-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-8">
              OFERTA ESPECIAL
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Comece sua transformação
            </h2>
            <p className="text-white/60 mb-8">
              7 dias grátis para testar tudo
            </p>

            <div className="mb-8">
              <span className="text-white/40 text-xl line-through">R$ 497</span>
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                R$ 197
              </div>
              <span className="text-white/50">/mês</span>
            </div>

            <div className="space-y-3 w-full max-w-[280px] mb-8">
              {[
                "Radar de Leads ilimitado",
                "Propostas automáticas",
                "WhatsApp com IA",
                "Suporte prioritário"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-primary to-cyan-500 rounded-full px-10 py-4 flex items-center gap-2">
              <span className="text-white font-bold text-lg">COMEÇAR AGORA</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </div>

            <p className="text-white/40 text-sm mt-6">
              genesishub.cloud
            </p>
          </div>
        </InstagramPost>

        {/* POST 9 - DEPOIMENTO */}
        <InstagramPost index={8}>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-10 text-center">
            <div className="flex gap-1 mb-8">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-7 h-7 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            <p className="text-2xl text-white/90 italic leading-relaxed mb-10 max-w-[300px]">
              "Em 1 mês com a Genesis, fechei mais contratos do que nos últimos 6 meses."
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                JP
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-lg">João Pedro</div>
                <div className="text-white/50">CEO, Agência Digital</div>
              </div>
            </div>

            <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-cyan-500 mb-8" />

            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">Resultado real verificado</span>
            </div>
          </div>
        </InstagramPost>

      </div>

      {/* Download Instructions */}
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <Rocket className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-4">Como usar esses posts</h3>
          <div className="space-y-3 text-left text-white/70">
            <p>1. <strong className="text-white">Print da tela</strong> - Use Cmd/Ctrl + Shift + 4 (Mac) ou ferramenta de recorte (Windows)</p>
            <p>2. <strong className="text-white">Recorte o post</strong> - Mantenha o formato 4:5 (1080×1350px)</p>
            <p>3. <strong className="text-white">Poste no Instagram</strong> - Feed, carrossel ou stories</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center">
        <p className="text-white/40 text-sm">
          © 2026 Genesis Hub. Material de divulgação oficial.
        </p>
      </div>
    </div>
  );
};

export default DivulgacaoPage;
