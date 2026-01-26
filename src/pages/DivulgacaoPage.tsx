import { motion } from 'framer-motion';
import genesisLogo from '@/assets/genesis-logo.png';

// Post Container - 1080x1350 (4:5)
const InstagramPost = ({ 
  children, 
  index = 0,
  bg = "bg-[#030508]"
}: { 
  children: React.ReactNode; 
  index?: number;
  bg?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`relative overflow-hidden shadow-2xl shadow-black/50 ${bg}`}
    style={{ 
      aspectRatio: '1080/1350',
      width: '100%',
      maxWidth: '400px'
    }}
  >
    {children}
  </motion.div>
);

const DivulgacaoPage = () => {
  return (
    <div className="min-h-screen bg-[#030508] py-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 mb-4"
        >
          <img src={genesisLogo} alt="Genesis Hub" className="w-12 h-12 object-contain" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Posts Instagram <span className="text-primary">1080×1350px</span>
          </h1>
        </motion.div>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          Clique com botão direito e "Salvar imagem como" para baixar cada post.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 justify-items-center">
        
        {/* ============================================== */}
        {/* POST 1 - INTRODUÇÃO / BRAND AWARENESS */}
        {/* ============================================== */}
        <InstagramPost index={0} bg="bg-gradient-to-br from-[#0A1628] via-[#050D1A] to-[#030810]">
          {/* Glow effect */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
            {/* Logo grande */}
            <img 
              src={genesisLogo} 
              alt="Genesis Hub" 
              className="w-40 h-40 object-contain mb-10"
            />
            
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Genesis Hub
            </h1>
            
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-cyan-400 rounded-full mb-6" />
            
            <p className="text-2xl text-white/70 font-light">
              Sua central de vendas<br />
              <span className="text-primary font-medium">com Inteligência Artificial</span>
            </p>
            
            <div className="absolute bottom-12 flex items-center gap-6 text-white/40 text-sm font-medium">
              <span>Automatize</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Prospecte</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Converta</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 2 - HOOK / PERGUNTA */}
        {/* ============================================== */}
        <InstagramPost index={1} bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-12">
            {/* Top bar */}
            <div className="flex items-center gap-3 mb-auto">
              <img src={genesisLogo} alt="Genesis Hub" className="w-8 h-8 object-contain" />
              <span className="text-white/50 text-sm font-medium tracking-widest uppercase">Genesis Hub</span>
            </div>
            
            {/* Center content */}
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-primary text-lg font-semibold mb-6">Você ainda...</span>
              
              <h2 className="text-6xl font-bold text-white leading-[1.1] mb-8">
                Prospecta<br />
                <span className="text-white/30">manualmente?</span>
              </h2>
              
              <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-cyan-400 rounded-full mb-8" />
              
              <p className="text-xl text-white/60 leading-relaxed">
                Enquanto você busca 1 cliente,<br />
                a <span className="text-primary">IA encontra 100.</span>
              </p>
            </div>
            
            {/* Bottom */}
            <div className="flex items-center gap-2 text-white/30">
              <span className="text-sm">Arraste para ver como →</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 3 - O PROBLEMA */}
        {/* ============================================== */}
        <InstagramPost index={2} bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-12">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-red-400 text-sm font-semibold tracking-widest uppercase">O Problema</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-12">
              Horas perdidas<br />
              <span className="text-white/30">todo santo dia:</span>
            </h2>
            
            <div className="space-y-6 flex-1">
              {[
                "Buscando leads no Google",
                "Copiando dados manualmente",
                "Escrevendo propostas do zero",
                "Enviando mensagens uma a uma",
                "Sem saber quem priorizar"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-5">
                  <span className="text-3xl text-red-400/60">✗</span>
                  <span className="text-xl text-white/70">{text}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-8 border-t border-white/10">
              <p className="text-white/40 text-center">
                Isso muda <span className="text-primary">agora.</span>
              </p>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 4 - SOLUÇÃO / BENEFÍCIOS */}
        {/* ============================================== */}
        <InstagramPost index={3} bg="bg-gradient-to-b from-[#0A1628] to-[#030810]">
          <div className="relative h-full flex flex-col p-12">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-green-400 text-sm font-semibold tracking-widest uppercase">A Solução</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">
              Com a Genesis<br />
              <span className="text-primary">você tem:</span>
            </h2>
            
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {[
                { emoji: "🎯", text: "Leads qualificados automaticamente" },
                { emoji: "📄", text: "Propostas criadas em segundos" },
                { emoji: "💬", text: "WhatsApp que responde 24/7" },
                { emoji: "📊", text: "Dashboard com métricas reais" },
                { emoji: "🚀", text: "Prospecção no piloto automático" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 bg-white/5 rounded-2xl p-5 border border-white/10">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-lg text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
            
            <img src={genesisLogo} alt="" className="w-10 h-10 object-contain mx-auto mt-8 opacity-50" />
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 5 - RECURSO: RADAR */}
        {/* ============================================== */}
        <InstagramPost index={4} bg="bg-[#030810]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
          
          <div className="relative h-full flex flex-col p-12">
            <div className="flex items-center gap-3 mb-6">
              <img src={genesisLogo} alt="" className="w-8 h-8 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Recurso</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-3">
              Radar de
            </h2>
            <h2 className="text-4xl font-bold text-primary mb-6">
              Oportunidades
            </h2>
            
            <p className="text-lg text-white/60 mb-10">
              A IA encontra empresas que <span className="text-white">precisam do seu serviço</span>. Automaticamente.
            </p>
            
            {/* Visual representation */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <div className="w-56 h-56 rounded-full border-2 border-primary/20 flex items-center justify-center animate-pulse">
                  <div className="w-40 h-40 rounded-full border-2 border-primary/40 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                      <img src={genesisLogo} alt="" className="w-14 h-14 object-contain" />
                    </div>
                  </div>
                </div>
                {/* Ping dots */}
                <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
                <div className="absolute bottom-12 left-0 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                <div className="absolute top-1/2 right-0 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
              <span className="text-4xl font-bold text-green-400">+500</span>
              <span className="text-white/60 ml-2">leads/mês</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 6 - RECURSO: PROPOSTAS */}
        {/* ============================================== */}
        <InstagramPost index={5} bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-12">
            <div className="flex items-center gap-3 mb-6">
              <img src={genesisLogo} alt="" className="w-8 h-8 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Recurso</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-3">
              Propostas que
            </h2>
            <h2 className="text-4xl font-bold text-cyan-400 mb-6">
              Vendem Sozinhas
            </h2>
            
            <p className="text-lg text-white/60 mb-8">
              A IA analisa o cliente e cria propostas <span className="text-white">personalizadas em segundos</span>.
            </p>
            
            <div className="flex-1 flex flex-col justify-center space-y-5">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-2xl">🔍</span>
                  <span className="text-white font-medium">Analisa o perfil</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-primary to-cyan-400 rounded-full" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-2xl">✨</span>
                  <span className="text-white font-medium">Gera texto persuasivo</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-primary to-cyan-400 rounded-full" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-2xl">🚀</span>
                  <span className="text-white font-medium">Envia automaticamente</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-primary to-cyan-400 rounded-full" />
                </div>
              </div>
            </div>
            
            <p className="text-center text-white/40 mt-6">
              De <span className="text-red-400 line-through">2 horas</span> para <span className="text-green-400">10 segundos</span>
            </p>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 7 - RECURSO: WHATSAPP */}
        {/* ============================================== */}
        <InstagramPost index={6} bg="bg-gradient-to-b from-[#0A1A14] to-[#030810]">
          <div className="relative h-full flex flex-col p-12">
            <div className="flex items-center gap-3 mb-6">
              <img src={genesisLogo} alt="" className="w-8 h-8 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Recurso</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-3">
              WhatsApp com
            </h2>
            <h2 className="text-4xl font-bold text-green-400 mb-10">
              Inteligência Artificial
            </h2>
            
            {/* Chat mockup */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-[#0B141A] rounded-3xl p-6 space-y-4 border border-white/10">
                {/* Message in */}
                <div className="flex">
                  <div className="bg-[#1F2C34] rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                    <p className="text-white/90 text-sm">Oi! Quero saber mais sobre o serviço de vocês 🙂</p>
                    <span className="text-white/30 text-xs">10:32</span>
                  </div>
                </div>
                
                {/* Message out */}
                <div className="flex justify-end">
                  <div className="bg-[#005C4B] rounded-2xl rounded-tr-none p-4 max-w-[85%]">
                    <p className="text-white/90 text-sm">Olá, João! 👋 Que bom te ver por aqui! Vi que sua empresa está em crescimento...</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-white/30 text-xs">10:32</span>
                      <span className="text-xs text-cyan-400">✓✓</span>
                    </div>
                  </div>
                </div>
                
                {/* AI indicator */}
                <div className="flex items-center gap-2 text-white/40 text-xs pt-2">
                  <img src={genesisLogo} alt="" className="w-4 h-4 object-contain" />
                  <span>Respondido pela Genesis IA</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-8 text-white/60">
              <span className="text-2xl">⏰</span>
              <span className="text-lg">Atendimento 24/7 automático</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 8 - RESULTADOS */}
        {/* ============================================== */}
        <InstagramPost index={7} bg="bg-[#030810]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
          
          <div className="relative h-full flex flex-col p-12">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-2xl">📊</span>
              <span className="text-primary text-sm font-semibold tracking-widest uppercase">Resultados</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-12">
              Números que<br />
              <span className="text-transparent bg-gradient-to-r from-primary to-cyan-400 bg-clip-text">impressionam</span>
            </h2>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { value: "3x", label: "Mais conversões", gradient: "from-green-400 to-emerald-500" },
                { value: "80%", label: "Tempo economizado", gradient: "from-cyan-400 to-blue-500" },
                { value: "500+", label: "Leads por mês", gradient: "from-primary to-violet-500" },
                { value: "24/7", label: "Prospecção ativa", gradient: "from-pink-400 to-rose-500" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center border border-white/10">
                  <span className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </span>
                  <span className="text-white/50 text-sm text-center mt-2">{stat.label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <span className="text-white/50 text-sm">4.9/5 de satisfação</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 9 - CTA / OFERTA */}
        {/* ============================================== */}
        <InstagramPost index={8} bg="bg-gradient-to-br from-[#0A1628] via-[#050D1A] to-[#030810]">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[150px]" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-gradient-to-r from-primary to-cyan-500 text-white text-sm font-bold px-5 py-2 rounded-full mb-10">
              🔥 OFERTA ESPECIAL
            </div>
            
            <img src={genesisLogo} alt="Genesis Hub" className="w-24 h-24 object-contain mb-8" />
            
            <h2 className="text-3xl font-bold text-white mb-2">
              Comece sua transformação
            </h2>
            <p className="text-white/60 mb-10">
              7 dias grátis para testar tudo
            </p>
            
            <div className="mb-10">
              <span className="text-white/40 text-xl line-through">R$ 497</span>
              <div className="text-7xl font-bold text-transparent bg-gradient-to-r from-primary to-cyan-400 bg-clip-text">
                R$ 197
              </div>
              <span className="text-white/50">/mês</span>
            </div>
            
            <div className="w-full max-w-[280px] space-y-3 mb-10">
              {[
                "Radar de Leads ilimitado",
                "Propostas automáticas",
                "WhatsApp com IA",
                "Suporte prioritário"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-primary to-cyan-500 rounded-full px-10 py-4">
              <span className="text-white font-bold text-lg">COMEÇAR AGORA →</span>
            </div>
          </div>
        </InstagramPost>

      </div>
      
      {/* Separator */}
      <div className="max-w-7xl mx-auto my-20 border-t border-white/10" />
      
      {/* Section: Dicas e Conteúdo */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Posts de <span className="text-primary">Conteúdo e Dicas</span>
        </h2>
        <p className="text-white/60 text-sm">
          Engajamento através de valor real
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 justify-items-center">
        
        {/* ============================================== */}
        {/* DICA 1 - Prospecção */}
        {/* ============================================== */}
        <InstagramPost index={9} bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-12">
            <div className="flex items-center gap-3 mb-6">
              <img src={genesisLogo} alt="" className="w-8 h-8 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Dica #1</span>
            </div>
            
            <span className="text-6xl mb-6">💡</span>
            
            <h2 className="text-4xl font-bold text-white mb-8 leading-tight">
              O erro que <span className="text-red-400">90%</span> dos vendedores cometem
            </h2>
            
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-xl text-white/70 leading-relaxed mb-8">
                Prospectar sem qualificar é jogar tempo no lixo.
              </p>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="text-white/80 text-lg">
                  A Genesis qualifica leads automaticamente, mostrando apenas quem tem <span className="text-green-400">real potencial</span> de compra.
                </p>
              </div>
            </div>
            
            <p className="text-center text-white/40 text-sm mt-8">
              Salve para não esquecer 📌
            </p>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* DICA 2 - Follow-up */}
        {/* ============================================== */}
        <InstagramPost index={10} bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-12">
            <div className="flex items-center gap-3 mb-6">
              <img src={genesisLogo} alt="" className="w-8 h-8 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Dica #2</span>
            </div>
            
            <span className="text-6xl mb-6">🔄</span>
            
            <h2 className="text-4xl font-bold text-white mb-8 leading-tight">
              <span className="text-primary">80%</span> das vendas acontecem no follow-up
            </h2>
            
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-red-400 text-2xl">✗</span>
                <p className="text-white/60">Enviar uma mensagem e esperar resposta</p>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-green-400 text-2xl">✓</span>
                <p className="text-white/90">Follow-up automático personalizado com IA</p>
              </div>
              
              <div className="bg-gradient-to-r from-primary/20 to-cyan-500/20 rounded-2xl p-6 border border-primary/30">
                <p className="text-white text-lg">
                  A Genesis faz o follow-up por você, no momento certo, com a mensagem certa.
                </p>
              </div>
            </div>
            
            <p className="text-center text-white/40 text-sm mt-8">
              Compartilhe com seu time 👥
            </p>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* DICA 3 - Tempo */}
        {/* ============================================== */}
        <InstagramPost index={11} bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-12">
            <div className="flex items-center gap-3 mb-6">
              <img src={genesisLogo} alt="" className="w-8 h-8 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Dica #3</span>
            </div>
            
            <span className="text-6xl mb-6">⏰</span>
            
            <h2 className="text-4xl font-bold text-white mb-8 leading-tight">
              Seu tempo vale <span className="text-primary">ouro</span>
            </h2>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">Manual</span>
                  <span className="text-red-400 font-bold">4 horas/dia</span>
                </div>
                <div className="h-3 bg-red-500/20 rounded-full">
                  <div className="h-full w-full bg-red-500 rounded-full" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">Com Genesis</span>
                  <span className="text-green-400 font-bold">15 min/dia</span>
                </div>
                <div className="h-3 bg-green-500/20 rounded-full">
                  <div className="h-full w-[10%] bg-green-500 rounded-full" />
                </div>
              </div>
              
              <p className="text-center text-white/60 text-lg mt-8">
                = <span className="text-green-400 font-bold">+3 horas</span> para fechar vendas
              </p>
            </div>
            
            <p className="text-center text-white/40 text-sm mt-8">
              Comente ⏰ se você quer isso
            </p>
          </div>
        </InstagramPost>

      </div>
      
      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-20 text-center">
        <img src={genesisLogo} alt="Genesis Hub" className="w-16 h-16 object-contain mx-auto mb-4 opacity-50" />
        <p className="text-white/30 text-sm">
          © 2026 Genesis Hub - Transformando vendas com IA
        </p>
      </div>
    </div>
  );
};

export default DivulgacaoPage;
