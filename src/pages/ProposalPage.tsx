import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertCircle, 
  MessageCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Bot,
  X,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Luna Decision Experience Components
import { LunaAvatar } from '@/components/proposal/LunaAvatar';
import { TypewriterText, CinematicText } from '@/components/proposal/TypewriterText';
import { InteractiveBackground } from '@/components/proposal/InteractiveBackground';
import { NicheFlowSimulation, getNicheSlug } from '@/components/proposal/NicheFlowSimulation';
import { ROICounter } from '@/components/proposal/ROICounter';
import { GuidedChoices, Choice } from '@/components/proposal/GuidedChoices';

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

type Phase = 'entry' | 'mirror' | 'choice' | 'simulation' | 'roi' | 'reveal' | 'close';

// Luna Chat Component (Minimal version)
const LunaChat = ({ proposalContext, whatsappLink }: { 
  proposalContext: { companyName: string; contactName?: string } & GeneratedProposal;
  whatsappLink: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: `Ficou com alguma dúvida sobre a proposta para ${proposalContext.companyName}? Estou aqui para ajudar!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      if (!response.ok || !response.body) throw new Error('Failed to get response');

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
            } catch { /* Skip invalid JSON */ }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, tive um problema. Que tal falar diretamente pelo WhatsApp? 💬' 
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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-2xl shadow-violet-500/30 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Bot className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-48px)] h-[450px] max-h-[calc(100vh-100px)] bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center gap-3">
              <LunaAvatar state="idle" size="sm" />
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">Luna</h3>
                <p className="text-xs text-white/70">Assistente Genesis</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-br-md' 
                      : 'bg-white/10 text-white/90 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-violet-600 hover:bg-violet-700">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-2 py-2 text-xs text-emerald-400 hover:text-emerald-300">
                <MessageCircle className="w-4 h-4" />
                Falar com humano
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [lunaState, setLunaState] = useState<'idle' | 'talking' | 'thinking' | 'excited'>('idle');
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProposal();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => setShowScrollIndicator(false);
    window.addEventListener('scroll', handleScroll, { once: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    const message = encodeURIComponent(`Olá! Vi a proposta do Genesis Hub para ${proposal.company_name} e quero ativar minha estrutura!`);
    return `https://wa.me/${phone}?text=${message}`;
  };

  const advancePhase = () => {
    const phases: Phase[] = ['entry', 'mirror', 'choice', 'simulation', 'roi', 'reveal', 'close'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChoiceSelect = (choice: Choice) => {
    setSelectedChoice(choice);
    setLunaState('excited');
    setTimeout(() => {
      setLunaState('talking');
      setTimeout(() => advancePhase(), 1500);
    }, 800);
  };

  const getNiche = () => {
    if (proposal?.business_niche?.slug) return proposal.business_niche.slug;
    if (proposal?.business_niche?.name) return getNicheSlug(proposal.business_niche.name);
    return 'default';
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <InteractiveBackground intensity="low" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 relative z-10">
          <LunaAvatar state="thinking" size="lg" />
          <p className="text-white/70 text-lg">Preparando sua experiência...</p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-md w-full bg-white/5 border-white/10">
            <CardContent className="pt-8 text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold text-white">Proposta não encontrada</h1>
              <p className="text-white/60">A proposta que você está procurando não existe ou foi removida.</p>
              <Button onClick={() => navigate('/')} variant="outline">Voltar ao início</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const gen = proposal.generated_proposal;
  const contactName = proposal.contact_name?.split(' ')[0] || '';
  const companyName = proposal.company_name;

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <InteractiveBackground intensity="medium" />
      
      <AnimatePresence mode="wait">
        {/* PHASE 1: ENTRY - Immersive Introduction */}
        {currentPhase === 'entry' && (
          <motion.section
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <LunaAvatar state={lunaState} size="lg" />
            </motion.div>

            <div className="text-center max-w-2xl">
              <CinematicText
                lines={[
                  `Olá${contactName ? `, ${contactName}` : ''}. Eu sou a Luna.`,
                  `Preparei algo especial para a ${companyName}.`,
                  `Isso não é uma proposta. É uma simulação do seu futuro.`
                ]}
                className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed"
                lineDelay={1500}
                onComplete={() => {
                  setLunaState('idle');
                  setTimeout(() => setShowScrollIndicator(true), 500);
                }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showScrollIndicator ? 1 : 0 }}
              transition={{ delay: 5 }}
              className="absolute bottom-12 flex flex-col items-center gap-2 cursor-pointer"
              onClick={advancePhase}
            >
              <span className="text-white/50 text-sm">Toque para continuar</span>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ChevronDown className="w-6 h-6 text-white/50" />
              </motion.div>
            </motion.div>
          </motion.section>
        )}

        {/* PHASE 2: MIRROR - Niche Identification */}
        {currentPhase === 'mirror' && (
          <motion.section
            key="mirror"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative z-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <LunaAvatar state="talking" size="md" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-md px-6 py-4 max-w-md"
              >
                <TypewriterText 
                  text="Empresas como a sua geralmente operam assim. Funciona. Mas você sabe que pode ser mais."
                  speed={35}
                  className="text-lg text-white/90"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="w-full max-w-4xl"
            >
              <NicheFlowSimulation 
                niche={getNiche()} 
                showAfter={false}
                onTransitionComplete={() => {}}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="mt-12"
            >
              <Button 
                size="lg" 
                onClick={advancePhase}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.section>
        )}

        {/* PHASE 3: CHOICE - Guided Decision */}
        {currentPhase === 'choice' && (
          <motion.section
            key="choice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative z-10"
          >
            <div className="flex items-center gap-4 mb-12">
              <LunaAvatar state="idle" size="md" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-md px-6 py-4 max-w-md"
              >
                <TypewriterText 
                  text="Qual é o seu principal objetivo agora?"
                  speed={40}
                  className="text-xl text-white/90"
                />
              </motion.div>
            </div>

            <GuidedChoices 
              onSelect={handleChoiceSelect}
              selectedId={selectedChoice?.id}
            />
          </motion.section>
        )}

        {/* PHASE 4: SIMULATION - Visual Transformation */}
        {currentPhase === 'simulation' && (
          <motion.section
            key="simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative z-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <LunaAvatar state="excited" size="md" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-md px-6 py-4 max-w-lg"
              >
                <TypewriterText 
                  text={`Entendi. Você quer ${selectedChoice?.title.toLowerCase()}. Veja como isso acontece.`}
                  speed={35}
                  className="text-lg text-white/90"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
              className="w-full max-w-4xl"
            >
              <NicheFlowSimulation 
                niche={getNiche()} 
                showAfter={true}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="text-center text-white/60 mt-8 max-w-xl"
            >
              Isso não é teoria. É o que acontece quando processos viram estrutura.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4 }}
              className="mt-8"
            >
              <Button 
                size="lg" 
                onClick={advancePhase}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 gap-2"
              >
                Ver Resultados <Sparkles className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.section>
        )}

        {/* PHASE 5: ROI - Visual Impact */}
        {currentPhase === 'roi' && gen?.roiAnalysis && (
          <motion.section
            key="roi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative z-10"
          >
            <div className="flex items-center gap-4 mb-12">
              <LunaAvatar state="talking" size="md" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-md px-6 py-4 max-w-lg"
              >
                <TypewriterText 
                  text={`Para a ${companyName}, isso representa potencial real.`}
                  speed={40}
                  className="text-xl text-white/90"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="w-full"
            >
              <ROICounter
                estimatedSavings={gen.roiAnalysis.estimatedSavings}
                timeRecovery={gen.roiAnalysis.timeRecovery}
                revenueIncrease={gen.roiAnalysis.revenueIncrease}
                paybackPeriod={gen.roiAnalysis.paybackPeriod}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4 }}
              className="text-center text-xl text-white/70 mt-12 max-w-xl"
            >
              Não é sobre gastar. É sobre parar de perder.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5 }}
              className="mt-8"
            >
              <Button 
                size="lg" 
                onClick={advancePhase}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
              >
                Como isso é possível? <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.section>
        )}

        {/* PHASE 6: REVEAL - Authority */}
        {currentPhase === 'reveal' && (
          <motion.section
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="mb-8"
            >
              <LunaAvatar state="excited" size="lg" />
            </motion.div>

            <div className="text-center max-w-2xl space-y-8">
              <CinematicText
                lines={[
                  `Tudo que você viu foi criado especificamente para a ${companyName}.`,
                  `Eu analisei seu segmento, suas necessidades, seu potencial.`,
                  `Isso é o que a Genesis faz: transforma dados em clareza.`
                ]}
                className="text-xl md:text-2xl font-light leading-relaxed"
                lineDelay={1800}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 6 }}
                className="grid grid-cols-3 gap-6 mt-12"
              >
                {[
                  { label: 'Adaptação', value: 'Inteligente' },
                  { label: 'Organização', value: 'Automática' },
                  { label: 'Escala', value: 'Ilimitada' }
                ].map((item, i) => (
                  <div key={item.label} className="text-center">
                    <div className="text-2xl font-bold text-violet-400">{item.value}</div>
                    <div className="text-sm text-white/60">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7 }}
              className="mt-12"
            >
              <Button 
                size="lg" 
                onClick={advancePhase}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2"
              >
                Ver Próximos Passos <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.section>
        )}

        {/* PHASE 7: CLOSE - Strong CTA */}
        {currentPhase === 'close' && (
          <motion.section
            key="close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8"
            >
              <LunaAvatar state="idle" size="lg" />
            </motion.div>

            <div className="text-center max-w-2xl space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold"
              >
                A decisão é sua.
              </motion.h2>

              <CinematicText
                lines={[
                  `Você pode continuar como está.`,
                  `Ou pode ativar uma estrutura que trabalha para você.`,
                  `Eu já mostrei o caminho.`
                ]}
                className="text-xl text-white/70"
                lineDelay={1200}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4 }}
              className="flex flex-col sm:flex-row gap-4 mt-12"
            >
              <motion.a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Ativar minha estrutura
              </motion.a>

              {proposal.affiliate?.email && (
                <motion.a
                  href={`mailto:${proposal.affiliate.email}?subject=Proposta Genesis - ${companyName}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Enviar e-mail
                </motion.a>
              )}
            </motion.div>

            {proposal.affiliate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5 }}
                className="mt-12 text-center text-white/40 text-sm"
              >
                <p>Proposta apresentada por <span className="text-white/60">{proposal.affiliate.name}</span></p>
                <p className="flex items-center justify-center gap-2 mt-1">
                  <Phone className="w-3 h-3" />
                  {proposal.affiliate.whatsapp}
                </p>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Luna Chat Widget - Available after entry */}
      {currentPhase !== 'entry' && gen && (
        <LunaChat
          proposalContext={{
            companyName: proposal.company_name,
            contactName: proposal.contact_name || undefined,
            ...gen
          }}
          whatsappLink={getWhatsAppLink()}
        />
      )}

      {/* Phase Navigation Dots */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
        {(['entry', 'mirror', 'choice', 'simulation', 'roi', 'reveal', 'close'] as Phase[]).map((phase, i) => (
          <motion.button
            key={phase}
            onClick={() => setCurrentPhase(phase)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentPhase === phase 
                ? 'bg-violet-500 scale-125' 
                : 'bg-white/20 hover:bg-white/40'
            }`}
            whileHover={{ scale: 1.3 }}
            title={phase}
          />
        ))}
      </div>
    </div>
  );
};

export default ProposalPage;
