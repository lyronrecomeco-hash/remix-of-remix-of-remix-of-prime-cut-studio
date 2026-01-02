import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertCircle, 
  MessageCircle,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Bot,
  X,
  Send,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Components
import { LunaAvatar } from '@/components/proposal/LunaAvatar';
import { CinematicBackground } from '@/components/proposal/CinematicBackground';
import { SeductiveText, DramaticReveal, ImpactNumber, GlitchText } from '@/components/proposal/CinematicText';
import { CinematicEnter, FloatingElement, PulseGlow } from '@/components/proposal/PhaseTransition';
import { WhatsAppSimulation, WhatsAppMultipleChats } from '@/components/proposal/WhatsAppSimulation';
import { GenesisRealPanel } from '@/components/proposal/GenesisRealPanel';
import { LunaWhyChoose } from '@/components/proposal/LunaWhyChoose';
import { ChaosMetrics } from '@/components/proposal/ChaosMetrics';
import { IPhoneFrame, MacBookFrame } from '@/components/proposal/IPhoneFrame';
import { InteractiveFlowDemo } from '@/components/proposal/InteractiveFlowDemo';
import { LiveTestSection } from '@/components/proposal/LiveTestSection';
import { useSoundEffects } from '@/hooks/useSoundEffects';

// Types
interface GeneratedProposal {
  painPoints: string[];
  benefits: string[];
  roiAnalysis: {
    estimatedSavings: number;
    timeRecovery: number;
    revenueIncrease: number;
    paybackPeriod: number;
  };
  pricing: string | { plan: string; justification: string };
  personalizedPitch: string;
  nextSteps: string[];
}

interface ProposalData {
  id: string;
  company_name: string;
  contact_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  generated_proposal: GeneratedProposal | null;
  proposal_value: number | null;
  created_at: string;
  niche_id: string | null;
  affiliate: {
    name: string;
    whatsapp: string;
    email: string;
  } | null;
  business_niche?: {
    name: string;
    slug: string;
  } | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 8 Phases for immersive experience
type Phase = 'entry' | 'reality' | 'pain' | 'rupture' | 'solution' | 'flow' | 'test' | 'action';

// Helper to get niche slug
const getNicheSlug = (niche?: { slug: string; name: string } | null): string => {
  if (!niche) return 'barbearia';
  const slug = niche.slug.toLowerCase();
  if (slug.includes('barb')) return 'barbearia';
  if (slug.includes('clin') || slug.includes('medic') || slug.includes('saude') || slug.includes('estet')) return 'clinica';
  if (slug.includes('rest') || slug.includes('delivery') || slug.includes('food')) return 'restaurante';
  return 'servicos';
};

// Luna Chat Component
const LunaChat = ({ proposalContext, whatsappLink, currentPhase }: { 
  proposalContext: { companyName: string; contactName?: string } & GeneratedProposal;
  whatsappLink: string;
  currentPhase: Phase;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const phaseMessages: Record<Phase, string> = {
      entry: `Olá! Vou te mostrar algo importante sobre ${proposalContext.companyName}...`,
      reality: 'Percebeu o que está acontecendo? Quer entender melhor?',
      pain: 'Esses números podem parecer assustadores, mas a solução existe.',
      rupture: 'Agora você entende o custo de não agir. Quer ver a alternativa?',
      solution: 'Isso é só o começo. O Genesis faz muito mais.',
      flow: 'Esse é o fluxo completo automatizado. Alguma dúvida?',
      test: 'Testou no seu WhatsApp? O que achou?',
      action: 'Pronto para dar o próximo passo? Estou aqui para ajudar.'
    };
    setMessages([{ role: 'assistant', content: phaseMessages[currentPhase] }]);
  }, [currentPhase, proposalContext.companyName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proposal-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, { role: 'user', content: userMessage }],
            proposalContext
          }),
        }
      );

      if (!response.ok || !response.body) throw new Error('Failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMessage };
                  return newMessages;
                });
              }
            } catch { /* Skip */ }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Prefere conversar pelo WhatsApp? Às vezes é mais fácil...' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-full blur-lg opacity-60"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse border-2 border-slate-900" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-8 md:right-8 z-50 md:w-[380px] h-[70vh] md:h-[500px] max-h-[600px] bg-slate-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-primary/20 border border-white/10 flex flex-col overflow-hidden"
          >
            <div className="relative bg-gradient-to-r from-primary via-primary/80 to-primary p-4 md:p-5">
              <div className="relative flex items-center gap-3 md:gap-4">
                <LunaAvatar state="idle" size="sm" />
                <div className="flex-1">
                  <h3 className="font-bold text-white text-base md:text-lg tracking-wide">Luna</h3>
                  <p className="text-xs text-white/70">Sua consultora digital</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 md:space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-white' 
                      : 'bg-white/5 text-white/90 border border-white/10'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.span 
                          key={i} 
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ y: [-3, 3, -3] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 md:p-5 border-t border-white/10 bg-slate-900/50">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 md:gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escreva aqui..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-sm"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-gradient-to-br from-primary to-primary/80 hover:opacity-90 rounded-xl shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Prefiro WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Phase Progress Indicator
const PhaseProgress = ({ currentPhase, phases }: { currentPhase: Phase; phases: Phase[] }) => {
  const currentIndex = phases.indexOf(currentPhase);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-2 bg-black/50 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10"
    >
      {phases.map((phase, index) => (
        <div key={phase} className="flex items-center">
          <motion.div
            animate={{
              scale: index === currentIndex ? 1.2 : 1,
              backgroundColor: index <= currentIndex ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.2)'
            }}
            className="w-2 h-2 rounded-full"
          />
          {index < phases.length - 1 && (
            <div className={`w-6 h-0.5 mx-1 ${index < currentIndex ? 'bg-primary' : 'bg-white/20'}`} />
          )}
        </div>
      ))}
    </motion.div>
  );
};

// Main Component
const ProposalPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase>('entry');
  const [phaseComplete, setPhaseComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [simulationKey, setSimulationKey] = useState(0);
  
  const sounds = useSoundEffects();
  const phases: Phase[] = ['entry', 'reality', 'pain', 'rupture', 'solution', 'flow', 'test', 'action'];

  useEffect(() => {
    fetchProposal();
  }, [slug]);

  useEffect(() => {
    if (!soundEnabled) return;
    
    switch (currentPhase) {
      case 'entry':
        sounds.play('transition', { volume: 0.2 });
        break;
      case 'reality':
      case 'pain':
        sounds.play('alert', { volume: 0.15 });
        break;
      case 'rupture':
        sounds.play('reveal', { volume: 0.2 });
        break;
      case 'solution':
      case 'flow':
        sounds.play('success', { volume: 0.2 });
        break;
      case 'test':
        sounds.play('notification', { volume: 0.2 });
        break;
      case 'action':
        sounds.play('reveal', { volume: 0.25 });
        break;
    }
  }, [currentPhase, soundEnabled, sounds]);

  const fetchProposal = async () => {
    if (!slug) {
      setError('Proposta não encontrada');
      setLoading(false);
      return;
    }

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      let matchedProposal: ProposalData | null = null;
      
      if (isUUID) {
        const { data } = await supabase
          .from('affiliate_proposals')
          .select(`*, affiliate:affiliates(name, whatsapp, email), business_niche:business_niches(name, slug)`)
          .eq('id', slug)
          .single();

        if (data) matchedProposal = data as unknown as ProposalData;
      }
      
      if (!matchedProposal) {
        const { data } = await supabase
          .from('affiliate_proposals')
          .select(`*, affiliate:affiliates(name, whatsapp, email), business_niche:business_niches(name, slug)`)
          .eq('questionnaire_completed', true);

        const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ');
        matchedProposal = data?.find(p => 
          p.company_name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedSlug ||
          p.company_name.toLowerCase().replace(/\s+/g, '-').trim() === slug.toLowerCase()
        ) as unknown as ProposalData | undefined || null;
      }

      if (!matchedProposal) {
        setError('Proposta não encontrada');
        setLoading(false);
        return;
      }

      setProposal(matchedProposal);
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError('Erro ao carregar proposta');
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppLink = () => {
    if (!proposal?.affiliate?.whatsapp) return '#';
    const phone = proposal.affiliate.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(`Quero ativar o Genesis para ${proposal.company_name}!`);
    return `https://wa.me/${phone}?text=${message}`;
  };

  const advancePhase = () => {
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
      setPhaseComplete(false);
      setSimulationKey(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CinematicBackground />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 relative z-10">
          <FloatingElement amplitude={15}>
            <LunaAvatar state="thinking" size="xl" />
          </FloatingElement>
          <motion.p 
            className="text-muted-foreground text-xl font-light tracking-widest"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Preparando algo especial...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <CinematicBackground />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <Card className="max-w-md w-full bg-card/80 backdrop-blur-xl border-border">
            <CardContent className="pt-8 text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold text-foreground">Proposta não encontrada</h1>
              <p className="text-muted-foreground">O link pode ter expirado ou estar incorreto.</p>
              <Button onClick={() => navigate('/')} variant="outline" className="border-border text-foreground hover:bg-muted">
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const gen = proposal.generated_proposal;
  const firstName = proposal.contact_name?.split(' ')[0] || '';
  const companyName = proposal.company_name;
  const nicheSlug = getNicheSlug(proposal.business_niche);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <CinematicBackground />
      
      {/* Phase Progress */}
      <PhaseProgress currentPhase={currentPhase} phases={phases} />
      
      {/* Sound Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => {
          setSoundEnabled(!soundEnabled);
          if (soundEnabled) sounds.stopAll();
        }}
        className="fixed top-6 right-6 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5 text-muted-foreground" />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground/50" />
        )}
      </motion.button>
      
      <AnimatePresence mode="wait">
        {/* PHASE 1: ENTRY */}
        {currentPhase === 'entry' && (
          <motion.section
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-16 relative z-10"
          >
            <CinematicEnter delay={0.5}>
              <FloatingElement amplitude={8} duration={6}>
                <LunaAvatar state="analyzing" size="xl" />
              </FloatingElement>
            </CinematicEnter>

            <div className="text-center max-w-3xl mt-8 md:mt-12">
              <CinematicEnter delay={1.5}>
                <motion.p 
                  className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6"
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Diagnóstico exclusivo para
                </motion.p>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                  <span className="text-gradient">{companyName}</span>
                </h1>
                {firstName && (
                  <p className="text-foreground/60 text-lg md:text-xl">
                    Preparado especialmente para você, {firstName}
                  </p>
                )}
              </CinematicEnter>

              <CinematicEnter delay={3}>
                <DramaticReveal
                  lines={[
                    "Eu analisei sua operação.",
                    "E antes de falar sobre crescimento...",
                    "Preciso falar sobre o que você está perdendo.",
                    "Todos os dias."
                  ]}
                  className="text-xl md:text-2xl font-light text-foreground/80 mt-12"
                  lineDelay={2500}
                  onComplete={() => setPhaseComplete(true)}
                />
              </CinematicEnter>
            </div>

            <AnimatePresence>
              {phaseComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12"
                >
                  <PulseGlow color="blue" intensity="strong">
                    <Button
                      size="lg"
                      onClick={advancePhase}
                      className="bg-gradient-to-r from-primary via-primary/80 to-primary hover:opacity-90 text-lg px-8 md:px-10 py-6 rounded-2xl gap-3 shadow-2xl shadow-primary/30"
                    >
                      <Play className="w-5 h-5" />
                      Mostrar a verdade
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </PulseGlow>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* PHASE 2: REALITY - O Caos do WhatsApp */}
        {currentPhase === 'reality' && (
          <motion.section
            key="reality"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-16 relative z-10"
          >
            <CinematicEnter delay={0.3}>
              <div className="text-center mb-8 md:mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.5 }}
                  className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-6"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-sm font-medium">Realidade atual</span>
                </motion.div>
                
                <DramaticReveal
                  lines={[
                    `Você ${nicheSlug === 'barbearia' ? 'corta cabelo' : nicheSlug === 'clinica' ? 'atende pacientes' : 'trabalha'}.`,
                    "Atende bem. Se esforça.",
                    `Mas enquanto você está ocupado...`,
                    "O dinheiro está esperando no celular."
                  ]}
                  className="text-xl md:text-2xl font-light text-foreground/80"
                  lineDelay={2000}
                  onComplete={() => {}}
                />
              </div>
            </CinematicEnter>

            {/* iPhone with WhatsApp Chaos */}
            <CinematicEnter delay={1}>
              <div className="w-full max-w-md mx-auto">
                <IPhoneFrame variant="titanium">
                  <WhatsAppMultipleChats key={`inbox-${simulationKey}`} niche={nicheSlug} />
                </IPhoneFrame>
              </div>
            </CinematicEnter>

            {/* Stats */}
            <CinematicEnter delay={3}>
              <div className="mt-8 md:mt-12 grid grid-cols-3 gap-3 md:gap-6 max-w-lg mx-auto">
                {[
                  { value: '23', label: 'Mensagens ignoradas' },
                  { value: '4h', label: 'Tempo de resposta' },
                  { value: '67%', label: 'Perda de clientes' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 3.5 + i * 0.2, type: 'spring' }}
                    className="text-center p-3 md:p-4 bg-red-500/10 rounded-xl border border-red-500/20"
                  >
                    <p className="text-2xl md:text-3xl font-bold text-red-400">{stat.value}</p>
                    <p className="text-foreground/50 text-xs mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </CinematicEnter>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5 }}
              className="mt-8 md:mt-12"
            >
              <Button
                size="lg"
                onClick={advancePhase}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-lg px-8 md:px-10 py-6 rounded-2xl gap-3"
              >
                Ver o prejuízo real
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.section>
        )}

        {/* PHASE 3: PAIN - Métricas de Prejuízo */}
        {currentPhase === 'pain' && (
          <motion.section
            key="pain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-16 relative z-10"
          >
            <CinematicEnter delay={0.3}>
              <div className="text-center mb-8 md:mb-12 max-w-2xl">
                <LunaAvatar state="revealing" size="md" className="mx-auto mb-6" />
                
                <DramaticReveal
                  lines={[
                    "Não são clientes perdidos.",
                    "São decisões não tomadas a tempo.",
                    "Não é falta de demanda.",
                    "É falta de estrutura para absorver."
                  ]}
                  className="text-xl md:text-2xl font-light text-foreground/80"
                  lineDelay={2000}
                  onComplete={() => {}}
                />
              </div>
            </CinematicEnter>

            <CinematicEnter delay={2}>
              <ChaosMetrics onComplete={() => setPhaseComplete(true)} />
            </CinematicEnter>

            <CinematicEnter delay={4}>
              <div className="mt-8 md:mt-12 p-6 bg-destructive/10 rounded-2xl border border-destructive/20 max-w-md text-center">
                <p className="text-foreground/70 text-lg">
                  E isso custa mais...
                </p>
                <p className="text-foreground text-xl font-bold mt-2">
                  Do que qualquer sistema.
                </p>
              </div>
            </CinematicEnter>

            <AnimatePresence>
              {phaseComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 md:mt-12"
                >
                  <Button
                    size="lg"
                    onClick={advancePhase}
                    className="bg-gradient-to-r from-amber-500 to-red-500 hover:opacity-90 text-lg px-8 md:px-10 py-6 rounded-2xl gap-3"
                  >
                    O ponto de ruptura
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* PHASE 4: RUPTURE - Urgência Real */}
        {currentPhase === 'rupture' && (
          <motion.section
            key="rupture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-16 relative z-10"
          >
            <CinematicEnter delay={0.3}>
              <FloatingElement amplitude={5} duration={4}>
                <LunaAvatar state="confident" size="xl" />
              </FloatingElement>
            </CinematicEnter>

            <div className="text-center max-w-2xl mt-8 md:mt-12">
              <CinematicEnter delay={1}>
                <DramaticReveal
                  lines={[
                    "Se você não mudar o fluxo...",
                    "Você não vai ganhar menos."
                  ]}
                  className="text-2xl md:text-4xl font-light text-foreground/80"
                  lineDelay={3000}
                  onComplete={() => {}}
                />
              </CinematicEnter>

              <CinematicEnter delay={7}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-12 p-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl border border-red-500/30"
                >
                  <GlitchText
                    text="Você vai continuar perdendo."
                    className="text-2xl md:text-4xl font-bold text-red-400"
                  />
                </motion.div>
              </CinematicEnter>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 10 }}
                className="mt-12"
              >
                <PulseGlow color="emerald" intensity="strong">
                  <Button
                    size="lg"
                    onClick={advancePhase}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-lg px-8 md:px-10 py-6 rounded-2xl gap-3 shadow-2xl shadow-emerald-500/30"
                  >
                    <Sparkles className="w-5 h-5" />
                    Ver a solução
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </PulseGlow>
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* PHASE 5: SOLUTION - A Virada */}
        {currentPhase === 'solution' && (
          <motion.section
            key="solution"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-16 relative z-10"
          >
            <CinematicEnter delay={0.3}>
              <div className="text-center mb-8 md:mb-12">
                <LunaAvatar state="confident" size="md" className="mx-auto mb-6" />
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.5 }}
                  className="inline-flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl px-6 py-3 mb-8"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Mesmo WhatsApp, nova realidade</span>
                </motion.div>
                
                <DramaticReveal
                  lines={[
                    "Isso não é mágica.",
                    "É organização.",
                    "Quando o sistema responde...",
                    "Você trabalha em paz."
                  ]}
                  className="text-xl md:text-2xl font-light text-foreground/80"
                  lineDelay={2000}
                  onComplete={() => setPhaseComplete(true)}
                />
              </div>
            </CinematicEnter>

            {/* iPhone with Automated WhatsApp */}
            <CinematicEnter delay={1.5}>
              <div className="w-full max-w-md mx-auto">
                <IPhoneFrame variant="titanium">
                  <WhatsAppSimulation 
                    key={`auto-${simulationKey}`}
                    mode="automated" 
                    niche={nicheSlug}
                    onComplete={() => setPhaseComplete(true)} 
                  />
                </IPhoneFrame>
              </div>
            </CinematicEnter>

            {/* Comparison Stats */}
            <AnimatePresence>
              {phaseComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 md:mt-12 grid grid-cols-3 gap-3 md:gap-6 max-w-lg mx-auto"
                >
                  {[
                    { value: '3s', label: 'Tempo de resposta' },
                    { value: '24/7', label: 'Disponibilidade' },
                    { value: '100%', label: 'Clientes atendidos' }
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                      className="text-center p-3 md:p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                    >
                      <p className="text-2xl md:text-3xl font-bold text-emerald-400">{stat.value}</p>
                      <p className="text-foreground/50 text-xs mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phaseComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="mt-8 md:mt-12"
                >
                  <Button
                    size="lg"
                    onClick={advancePhase}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-lg px-8 md:px-10 py-6 rounded-2xl gap-3"
                  >
                    Ver fluxo completo
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* PHASE 6: FLOW - Fluxo Interativo + Painel Real */}
        {currentPhase === 'flow' && (
          <motion.section
            key="flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col items-center px-4 md:px-6 py-16 relative z-10"
          >
            {/* Interactive Flow Demo */}
            <CinematicEnter delay={0.3}>
              <InteractiveFlowDemo niche={nicheSlug} onComplete={() => setPhaseComplete(true)} />
            </CinematicEnter>

            {/* MacBook with Real Panel */}
            <AnimatePresence>
              {phaseComplete && (
                <CinematicEnter delay={0.5}>
                  <div className="w-full max-w-5xl mx-auto mt-12">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center mb-8"
                    >
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                        Tudo isso controlado de um único lugar
                      </h3>
                      <p className="text-muted-foreground">
                        O painel Genesis que você vai usar
                      </p>
                    </motion.div>
                    
                    <MacBookFrame>
                      <GenesisRealPanel niche={nicheSlug} companyName={companyName} />
                    </MacBookFrame>
                  </div>
                </CinematicEnter>
              )}
            </AnimatePresence>

            {/* Luna Why Choose */}
            {phaseComplete && (
              <CinematicEnter delay={2}>
                <LunaWhyChoose 
                  niche={nicheSlug} 
                  companyName={companyName}
                  onComplete={() => {}} 
                />
              </CinematicEnter>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: phaseComplete ? 1 : 0, y: phaseComplete ? 0 : 30 }}
              transition={{ delay: 4 }}
              className="mt-12"
            >
              <PulseGlow color="emerald" intensity="strong">
                <Button
                  size="lg"
                  onClick={advancePhase}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-lg px-8 md:px-10 py-6 rounded-2xl gap-3 shadow-2xl shadow-emerald-500/30"
                >
                  <Zap className="w-5 h-5" />
                  Testar na prática
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </PulseGlow>
            </motion.div>
          </motion.section>
        )}

        {/* PHASE 7: TEST - Teste Ao Vivo */}
        {currentPhase === 'test' && (
          <motion.section
            key="test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 relative z-10"
          >
            <LiveTestSection 
              proposalId={proposal.id}
              companyName={companyName}
              niche={nicheSlug}
              affiliateName={proposal.affiliate?.name}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5 }}
              className="mt-8"
            >
              <Button
                size="lg"
                onClick={advancePhase}
                className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-lg px-8 md:px-10 py-6 rounded-2xl gap-3"
              >
                Quero ativar isso
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.section>
        )}

        {/* PHASE 8: ACTION - Decisão Final */}
        {currentPhase === 'action' && (
          <motion.section
            key="action"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-16 relative z-10"
          >
            <CinematicEnter delay={0.3}>
              <FloatingElement amplitude={5} duration={8}>
                <LunaAvatar state="confident" size="xl" />
              </FloatingElement>
            </CinematicEnter>

            <div className="text-center max-w-3xl mt-8 md:mt-12">
              <CinematicEnter delay={0.8}>
                <DramaticReveal
                  lines={[
                    "Você pode continuar compensando falhas com esforço.",
                    "Ou pode corrigir o fluxo."
                  ]}
                  className="text-xl md:text-2xl font-light text-foreground/80"
                  lineDelay={2500}
                  onComplete={() => {}}
                />
              </CinematicEnter>

              <CinematicEnter delay={6}>
                <div className="mt-12 p-6 md:p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                  <p className="text-lg text-foreground/70 mb-2">
                    A Genesis não promete mais clientes.
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    Ela garante que você não perca os que já tem.
                  </p>
                </div>
              </CinematicEnter>

              {/* ROI Summary */}
              {gen && (
                <CinematicEnter delay={8}>
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="text-center p-4 md:p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <ImpactNumber value={gen.roiAnalysis.estimatedSavings} prefix="R$ " className="text-xl md:text-3xl font-bold text-emerald-400" />
                      <p className="text-foreground/50 text-xs mt-2">Economia/mês</p>
                    </div>
                    <div className="text-center p-4 md:p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <ImpactNumber value={gen.roiAnalysis.timeRecovery} suffix="h" className="text-xl md:text-3xl font-bold text-blue-400" />
                      <p className="text-foreground/50 text-xs mt-2">Horas livres</p>
                    </div>
                    <div className="text-center p-4 md:p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <ImpactNumber value={gen.roiAnalysis.revenueIncrease} suffix="%" className="text-xl md:text-3xl font-bold text-purple-400" />
                      <p className="text-foreground/50 text-xs mt-2">+ Receita</p>
                    </div>
                    <div className="text-center p-4 md:p-6 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <ImpactNumber value={gen.roiAnalysis.paybackPeriod} suffix="d" className="text-xl md:text-3xl font-bold text-amber-400" />
                      <p className="text-foreground/50 text-xs mt-2">Retorno</p>
                    </div>
                  </div>
                </CinematicEnter>
              )}

              <CinematicEnter delay={10}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                  <PulseGlow color="emerald" intensity="strong">
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-lg px-8 md:px-10 py-6 rounded-2xl gap-3 shadow-2xl shadow-emerald-500/30 w-full sm:w-auto"
                      >
                        <Zap className="w-5 h-5" />
                        Ativar estrutura
                      </Button>
                    </a>
                  </PulseGlow>

                  {proposal.affiliate?.whatsapp && (
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-border text-foreground hover:bg-muted text-lg px-8 md:px-10 py-6 rounded-2xl gap-3 w-full sm:w-auto"
                      >
                        <Phone className="w-5 h-5" />
                        Falar com especialista
                      </Button>
                    </a>
                  )}
                </div>
              </CinematicEnter>

              {/* Consultor info */}
              {proposal.affiliate && (
                <CinematicEnter delay={12}>
                  <div className="mt-12 md:mt-16 p-6 bg-muted/50 rounded-2xl border border-border max-w-md mx-auto">
                    <p className="text-muted-foreground text-sm mb-4">Seu consultor</p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xl font-bold">
                        {proposal.affiliate.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-foreground font-semibold text-lg">{proposal.affiliate.name}</p>
                        <p className="text-muted-foreground text-sm">Especialista Genesis Hub</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
                      <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-2">
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </Button>
                      </a>
                      {proposal.affiliate.email && (
                        <a href={`mailto:${proposal.affiliate.email}?subject=Interesse%20Genesis%20-%20${companyName}`} className="flex-1">
                          <Button variant="outline" className="w-full border-border text-muted-foreground hover:bg-muted gap-2">
                            <Mail className="w-4 h-4" />
                            E-mail
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CinematicEnter>
              )}

              {/* Badges */}
              <CinematicEnter delay={13}>
                <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-6">
                  {[
                    { icon: Shield, text: 'Dados protegidos' },
                    { icon: Zap, text: 'Ativação em 24h' },
                    { icon: TrendingUp, text: 'ROI garantido' }
                  ].map((badge) => (
                    <div key={badge.text} className="flex items-center gap-2 text-muted-foreground">
                      <badge.icon className="w-4 h-4" />
                      <span className="text-sm">{badge.text}</span>
                    </div>
                  ))}
                </div>
              </CinematicEnter>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Luna Chat */}
      {gen && (
        <LunaChat 
          proposalContext={{
            companyName,
            contactName: firstName,
            ...gen
          }}
          whatsappLink={getWhatsAppLink()}
          currentPhase={currentPhase}
        />
      )}
    </div>
  );
};

export default ProposalPage;
