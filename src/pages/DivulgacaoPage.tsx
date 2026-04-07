import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import genesisLogo from '@/assets/genesis-logo.png';

// Post Container - 1080x1350 (4:5)
const InstagramPost = ({ 
  children, 
  index = 0,
  bg = "bg-[#030508]",
  postName = "post"
}: { 
  children: React.ReactNode; 
  index?: number;
  bg?: string;
  postName?: string;
}) => {
  const postRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!postRef.current) return;
    
    try {
      const canvas = await html2canvas(postRef.current, {
        scale: 3, // High quality
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        width: 1080,
        height: 1350,
      });
      
      const link = document.createElement('a');
      link.download = `genesis-${postName}-${index + 1}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="relative group"
    >
      {/* Post content */}
      <div
        ref={postRef}
        className={`relative overflow-hidden shadow-2xl shadow-black/50 ${bg}`}
        style={{ 
          width: '360px',
          height: '450px',
        }}
      >
        {children}
      </div>
      
      {/* Download button overlay */}
      <button
        onClick={handleDownload}
        className="absolute bottom-4 right-4 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Download</span>
      </button>
    </motion.div>
  );
};

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
          Passe o mouse sobre o post e clique em "Download" para baixar em alta qualidade.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 justify-items-center">
        
        {/* ============================================== */}
        {/* POST 1 - INTRODUÇÃO / BRAND AWARENESS */}
        {/* ============================================== */}
        <InstagramPost index={0} postName="intro" bg="bg-gradient-to-br from-[#0A1628] via-[#050D1A] to-[#030810]">
          {/* Glow effect */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px]" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            {/* Logo grande */}
            <img 
              src={genesisLogo} 
              alt="Genesis Hub" 
              className="w-28 h-28 object-contain mb-6"
            />
            
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Genesis Hub
            </h1>
            
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mb-4" />
            
            <p className="text-lg text-white/70 font-light">
              Sua central de vendas<br />
              <span className="text-blue-400 font-medium">com Inteligência Artificial</span>
            </p>
            
            <div className="absolute bottom-8 flex items-center gap-4 text-white/40 text-xs font-medium">
              <span>Automatize</span>
              <span className="w-1 h-1 rounded-full bg-blue-500" />
              <span>Prospecte</span>
              <span className="w-1 h-1 rounded-full bg-blue-500" />
              <span>Converta</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 2 - HOOK / PERGUNTA */}
        {/* ============================================== */}
        <InstagramPost index={1} postName="hook" bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-8">
            {/* Top bar */}
            <div className="flex items-center gap-2 mb-auto">
              <img src={genesisLogo} alt="Genesis Hub" className="w-6 h-6 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Genesis Hub</span>
            </div>
            
            {/* Center content */}
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-blue-400 text-sm font-semibold mb-4">Você ainda...</span>
              
              <h2 className="text-4xl font-bold text-white leading-[1.1] mb-6">
                Prospecta<br />
                <span className="text-white/30">manualmente?</span>
              </h2>
              
              <div className="w-14 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mb-6" />
              
              <p className="text-base text-white/60 leading-relaxed">
                Enquanto você busca 1 cliente,<br />
                a <span className="text-blue-400">IA encontra 100.</span>
              </p>
            </div>
            
            {/* Bottom */}
            <div className="flex items-center gap-2 text-white/30">
              <span className="text-xs">Arraste para ver como →</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 3 - O PROBLEMA */}
        {/* ============================================== */}
        <InstagramPost index={2} postName="problema" bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-red-400 text-xs font-semibold tracking-widest uppercase">O Problema</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-8">
              Horas perdidas<br />
              <span className="text-white/30">todo santo dia:</span>
            </h2>
            
            <div className="space-y-4 flex-1">
              {[
                "Buscando leads no Google",
                "Copiando dados manualmente",
                "Escrevendo propostas do zero",
                "Enviando mensagens uma a uma",
                "Sem saber quem priorizar"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xl text-red-400/60">✗</span>
                  <span className="text-base text-white/70">{text}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-white/10">
              <p className="text-white/40 text-center text-sm">
                Isso muda <span className="text-blue-400">agora.</span>
              </p>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 4 - SOLUÇÃO / BENEFÍCIOS */}
        {/* ============================================== */}
        <InstagramPost index={3} postName="solucao" bg="bg-gradient-to-b from-[#0A1628] to-[#030810]">
          <div className="relative h-full flex flex-col p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-green-400 text-xs font-semibold tracking-widest uppercase">A Solução</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-3">
              Com a Genesis<br />
              <span className="text-blue-400">você tem:</span>
            </h2>
            
            <div className="flex-1 flex flex-col justify-center space-y-3">
              {[
                { emoji: "🎯", text: "Leads qualificados automaticamente" },
                { emoji: "📄", text: "Propostas criadas em segundos" },
                { emoji: "💬", text: "WhatsApp que responde 24/7" },
                { emoji: "📊", text: "Dashboard com métricas reais" },
                { emoji: "🚀", text: "Prospecção no piloto automático" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-sm text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
            
            <img src={genesisLogo} alt="" className="w-8 h-8 object-contain mx-auto mt-4 opacity-50" />
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 5 - RECURSO: RADAR */}
        {/* ============================================== */}
        <InstagramPost index={4} postName="radar" bg="bg-[#030810]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
          
          <div className="relative h-full flex flex-col p-8">
            <div className="flex items-center gap-2 mb-4">
              <img src={genesisLogo} alt="" className="w-6 h-6 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Recurso</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              Radar de
            </h2>
            <h2 className="text-3xl font-bold text-blue-400 mb-4">
              Oportunidades
            </h2>
            
            <p className="text-sm text-white/60 mb-6">
              A IA encontra empresas que <span className="text-white">precisam do seu serviço</span>.
            </p>
            
            {/* Visual representation */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-2 border-blue-500/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <img src={genesisLogo} alt="" className="w-10 h-10 object-contain" />
                    </div>
                  </div>
                </div>
                {/* Ping dots */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
                <div className="absolute bottom-8 -left-1 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                <div className="absolute top-1/2 -right-2 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <span className="text-3xl font-bold text-green-400">+500</span>
              <span className="text-white/60 ml-2 text-sm">leads/mês</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 6 - RECURSO: PROPOSTAS */}
        {/* ============================================== */}
        <InstagramPost index={5} postName="propostas" bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-8">
            <div className="flex items-center gap-2 mb-4">
              <img src={genesisLogo} alt="" className="w-6 h-6 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Recurso</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              Propostas que
            </h2>
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              Vendem Sozinhas
            </h2>
            
            <p className="text-sm text-white/60 mb-6">
              A IA analisa o cliente e cria propostas <span className="text-white">personalizadas</span>.
            </p>
            
            <div className="flex-1 flex flex-col justify-center space-y-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">🔍</span>
                  <span className="text-white text-sm font-medium">Analisa o perfil</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">✨</span>
                  <span className="text-white text-sm font-medium">Gera texto persuasivo</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">🚀</span>
                  <span className="text-white text-sm font-medium">Envia automaticamente</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
                </div>
              </div>
            </div>
            
            <p className="text-center text-white/40 mt-4 text-sm">
              De <span className="text-red-400 line-through">2h</span> para <span className="text-green-400">10 seg</span>
            </p>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 7 - RECURSO: WHATSAPP */}
        {/* ============================================== */}
        <InstagramPost index={6} postName="whatsapp" bg="bg-gradient-to-b from-[#0A1A14] to-[#030810]">
          <div className="relative h-full flex flex-col p-8">
            <div className="flex items-center gap-2 mb-4">
              <img src={genesisLogo} alt="" className="w-6 h-6 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Recurso</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              WhatsApp com
            </h2>
            <h2 className="text-3xl font-bold text-green-400 mb-6">
              IA Integrada
            </h2>
            
            {/* Chat mockup */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-[#0B141A] rounded-2xl p-4 space-y-3 border border-white/10">
                {/* Message in */}
                <div className="flex">
                  <div className="bg-[#1F2C34] rounded-xl rounded-tl-none p-3 max-w-[85%]">
                    <p className="text-white/90 text-xs">Oi! Quero saber mais sobre vocês 🙂</p>
                    <span className="text-white/30 text-[10px]">10:32</span>
                  </div>
                </div>
                
                {/* Message out */}
                <div className="flex justify-end">
                  <div className="bg-[#005C4B] rounded-xl rounded-tr-none p-3 max-w-[85%]">
                    <p className="text-white/90 text-xs">Olá, João! 👋 Vi que sua empresa está crescendo...</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <span className="text-white/30 text-[10px]">10:32</span>
                      <span className="text-[10px] text-cyan-400">✓✓</span>
                    </div>
                  </div>
                </div>
                
                {/* AI indicator */}
                <div className="flex items-center gap-2 text-white/40 text-[10px] pt-1">
                  <img src={genesisLogo} alt="" className="w-3 h-3 object-contain" />
                  <span>Respondido pela Genesis IA</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-6 text-white/60">
              <span className="text-xl">⏰</span>
              <span className="text-sm">Atendimento 24/7 automático</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 8 - RESULTADOS */}
        {/* ============================================== */}
        <InstagramPost index={7} postName="resultados" bg="bg-[#030810]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
          
          <div className="relative h-full flex flex-col p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">📊</span>
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Resultados</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-8">
              Números que<br />
              <span className="text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text">impressionam</span>
            </h2>
            
            <div className="flex-1 grid grid-cols-2 gap-3">
              {[
                { value: "3x", label: "Mais conversões", gradient: "from-green-400 to-emerald-500" },
                { value: "80%", label: "Tempo economizado", gradient: "from-cyan-400 to-blue-500" },
                { value: "500+", label: "Leads por mês", gradient: "from-blue-500 to-violet-500" },
                { value: "24/7", label: "Prospecção ativa", gradient: "from-pink-400 to-rose-500" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/10">
                  <span className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </span>
                  <span className="text-white/50 text-xs text-center mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-yellow-400 text-base">★</span>
                ))}
              </div>
              <span className="text-white/50 text-xs">4.9/5 de satisfação</span>
            </div>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* POST 9 - CTA / OFERTA */}
        {/* ============================================== */}
        <InstagramPost index={8} postName="oferta" bg="bg-gradient-to-br from-[#0A1628] via-[#050D1A] to-[#030810]">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/30 rounded-full blur-[120px]" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              🔥 OFERTA ESPECIAL
            </div>
            
            <img src={genesisLogo} alt="Genesis Hub" className="w-16 h-16 object-contain mb-4" />
            
            <h2 className="text-2xl font-bold text-white mb-1">
              Comece sua transformação
            </h2>
            <p className="text-white/60 text-sm mb-6">
              7 dias grátis para testar tudo
            </p>
            
            <div className="mb-6">
              <span className="text-white/40 text-base line-through">R$ 497</span>
              <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text">
                R$ 197
              </div>
              <span className="text-white/50 text-sm">/mês</span>
            </div>
            
            <div className="w-full max-w-[240px] space-y-2 mb-6">
              {[
                "Radar de Leads ilimitado",
                "Propostas automáticas",
                "WhatsApp com IA",
                "Suporte prioritário"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-green-400 text-sm">✓</span>
                  <span className="text-white/70 text-xs">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full px-8 py-3">
              <span className="text-white font-bold text-sm">COMEÇAR AGORA →</span>
            </div>
          </div>
        </InstagramPost>

      </div>
      
      {/* Separator */}
      <div className="max-w-7xl mx-auto my-16 border-t border-white/10" />
      
      {/* Section: Dicas e Conteúdo */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Posts de <span className="text-blue-400">Conteúdo e Dicas</span>
        </h2>
        <p className="text-white/60 text-sm">
          Engajamento através de valor real
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 justify-items-center">
        
        {/* ============================================== */}
        {/* DICA 1 - Prospecção */}
        {/* ============================================== */}
        <InstagramPost index={9} postName="dica1" bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-8">
            <div className="flex items-center gap-2 mb-4">
              <img src={genesisLogo} alt="" className="w-6 h-6 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Dica #1</span>
            </div>
            
            <span className="text-5xl mb-4">💡</span>
            
            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
              O erro que <span className="text-red-400">90%</span> dos vendedores cometem
            </h2>
            
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Prospectar sem qualificar é jogar tempo no lixo.
              </p>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/80 text-sm">
                  A Genesis qualifica leads automaticamente, mostrando apenas quem tem <span className="text-green-400">real potencial</span> de compra.
                </p>
              </div>
            </div>
            
            <p className="text-center text-white/40 text-xs mt-6">
              Salve para não esquecer 📌
            </p>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* DICA 2 - Follow-up */}
        {/* ============================================== */}
        <InstagramPost index={10} postName="dica2" bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-8">
            <div className="flex items-center gap-2 mb-4">
              <img src={genesisLogo} alt="" className="w-6 h-6 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Dica #2</span>
            </div>
            
            <span className="text-5xl mb-4">🔄</span>
            
            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
              <span className="text-blue-400">80%</span> das vendas acontecem no follow-up
            </h2>
            
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl">✗</span>
                <p className="text-white/60 text-sm">Enviar uma mensagem e esperar resposta</p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <p className="text-white/90 text-sm">Follow-up automático personalizado com IA</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                <p className="text-white text-sm">
                  A Genesis faz o follow-up por você, no momento certo, com a mensagem certa.
                </p>
              </div>
            </div>
            
            <p className="text-center text-white/40 text-xs mt-6">
              Compartilhe com seu time 👥
            </p>
          </div>
        </InstagramPost>

        {/* ============================================== */}
        {/* DICA 3 - Tempo */}
        {/* ============================================== */}
        <InstagramPost index={11} postName="dica3" bg="bg-[#030810]">
          <div className="relative h-full flex flex-col p-8">
            <div className="flex items-center gap-2 mb-4">
              <img src={genesisLogo} alt="" className="w-6 h-6 object-contain" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Dica #3</span>
            </div>
            
            <span className="text-5xl mb-4">⏰</span>
            
            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
              Seu tempo vale <span className="text-blue-400">ouro</span>
            </h2>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/60 text-sm">Manual</span>
                  <span className="text-red-400 font-bold text-sm">4 horas/dia</span>
                </div>
                <div className="h-2 bg-red-500/20 rounded-full">
                  <div className="h-full w-full bg-red-500 rounded-full" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/60 text-sm">Com Genesis</span>
                  <span className="text-green-400 font-bold text-sm">15 min/dia</span>
                </div>
                <div className="h-2 bg-green-500/20 rounded-full">
                  <div className="h-full w-[10%] bg-green-500 rounded-full" />
                </div>
              </div>
              
              <p className="text-center text-white/60 text-base mt-6">
                = <span className="text-green-400 font-bold">+3 horas</span> para fechar vendas
              </p>
            </div>
            
            <p className="text-center text-white/40 text-xs mt-6">
              Comente ⏰ se você quer isso
            </p>
          </div>
        </InstagramPost>

      </div>
      
      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-16 text-center">
        <img src={genesisLogo} alt="Genesis Hub" className="w-12 h-12 object-contain mx-auto mb-3 opacity-50" />
        <p className="text-white/30 text-xs">
          © 2026 Genesis Hub - Transformando vendas com IA
        </p>
      </div>
    </div>
  );
};

export default DivulgacaoPage;
