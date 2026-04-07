import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Building2, 
  Phone, 
  MapPin, 
  Globe, 
  Star,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Search,
  Mail,
  TrendingUp,
  X,
  Cpu
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { EngineWorkspace, EngineIntroModal } from "./engine";
import type { ProposalForEngine } from "./engine";

interface AcceptedProposal {
  id: string;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  company_cnpj: string | null;
  contact_name: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  accepted_at: string | null;
  questionnaire_answers: Record<string, unknown> | null;
}

interface AcceptedProposalsTabProps {
  affiliateId: string | null;
}

export const AcceptedProposalsTab = ({ affiliateId }: AcceptedProposalsTabProps) => {
  const [proposals, setProposals] = useState<AcceptedProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [engineProposal, setEngineProposal] = useState<ProposalForEngine | null>(null);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [pendingEngineProposal, setPendingEngineProposal] = useState<AcceptedProposal | null>(null);

  const fetchProposals = async () => {
    if (!affiliateId) {
      setProposals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_proposals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data || []) as unknown as AcceptedProposal[]);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Erro ao carregar propostas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();

    if (!affiliateId) return;
    
    const channel = supabase
      .channel('accepted_proposals_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'affiliate_proposals',
          filter: `affiliate_id=eq.${affiliateId}`,
        },
        (payload) => {
          const newProposal = payload.new as AcceptedProposal;
          if (newProposal.status === 'accepted') {
            setProposals((prev) => [newProposal, ...prev]);
            toast.success(`Nova proposta aceita: ${newProposal.company_name}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [affiliateId]);

  const filteredProposals = proposals.filter(p => 
    p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.questionnaire_answers as Record<string, unknown>)?.niche?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openWhatsApp = (phone: string | null, companyName: string) => {
    if (!phone) {
      toast.error('Telefone não disponível');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Vi que a ${companyName} pode se beneficiar dos nossos serviços. Podemos conversar?`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const openGoogle = (companyName: string) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(companyName)}`, '_blank');
  };

  const handleOpenEngine = (proposal: AcceptedProposal) => {
    const dismissed = localStorage.getItem('genesis_engine_intro_dismissed');
    if (dismissed === 'true') {
      setEngineProposal(proposal as ProposalForEngine);
    } else {
      setPendingEngineProposal(proposal);
      setShowIntroModal(true);
    }
  };

  const handleIntroModalContinue = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('genesis_engine_intro_dismissed', 'true');
    }
    setShowIntroModal(false);
    if (pendingEngineProposal) {
      setEngineProposal(pendingEngineProposal as ProposalForEngine);
      setPendingEngineProposal(null);
    }
  };

  // If engine is open, render workspace
  if (engineProposal && affiliateId) {
    return (
      <EngineWorkspace
        affiliateId={affiliateId}
        proposal={engineProposal}
        onBack={() => setEngineProposal(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Intro Modal */}
      <EngineIntroModal
        isOpen={showIntroModal}
        onContinue={handleIntroModalContinue}
      />

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-white/50">Total Aceitas</p>
                <p className="text-xl font-bold text-white">{proposals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-white/50">Com Contato</p>
                <p className="text-xl font-bold text-white">{proposals.filter(p => p.company_phone).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-white/50">Com Email</p>
                <p className="text-xl font-bold text-white">{proposals.filter(p => p.company_email).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals List */}
      <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-primary" />
              Propostas Aceitas
              {proposals.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-white/10 text-white/70">
                  {filteredProposals.length !== proposals.length 
                    ? `${filteredProposals.length}/${proposals.length}`
                    : proposals.length
                  }
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                  placeholder="Pesquisar empresa, nicho..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-white/5 border-white/10"
                  style={{ borderRadius: '10px' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchProposals}
                className="border-white/10 text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Target className="w-8 h-8 text-primary/50" />
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-1">
                  {searchTerm ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta aceita ainda'}
                </p>
                <p className="text-sm text-white/50 max-w-sm">
                  {searchTerm 
                    ? 'Tente outro termo de busca' 
                    : 'Aceite oportunidades em Encontrar Cliente para vê-las aqui'}
                </p>
              </div>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="border-white/20 text-white/70 hover:text-white hover:bg-white/10">
                  Limpar pesquisa
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProposals.map((proposal, index) => {
                  const qa = (proposal.questionnaire_answers || {}) as Record<string, unknown>;
                  return (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-white/20 bg-white/5 border-white/10 flex flex-col" style={{ borderRadius: '14px', minHeight: '320px' }}>
                        {/* Accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

                        <CardContent className="p-5 pt-6 flex flex-col flex-1">
                          {/* Header Row */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white leading-tight line-clamp-1">
                                {proposal.company_name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                {qa.niche && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-cyan-500/50 text-cyan-500">
                                    {String(qa.niche)}
                                  </Badge>
                                )}
                                {proposal.contact_name && (
                                  <span className="text-xs text-white/50">{proposal.contact_name}</span>
                                )}
                              </div>
                            </div>
                            {qa.rating && (
                              <div className="flex items-center gap-1 text-sm text-amber-400">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {String(qa.rating)}
                              </div>
                            )}
                          </div>

                          {/* Info Section */}
                          <div className="space-y-2 mb-4 p-3 bg-white/5 rounded-lg border border-white/5 flex-1">
                            {qa.address && (
                              <div className="flex items-center gap-2 text-sm text-white/50">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="line-clamp-1">{String(qa.address)}</span>
                              </div>
                            )}
                            {proposal.company_phone && (
                              <div className="flex items-center gap-2 text-sm text-white/50">
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <span>{proposal.company_phone}</span>
                              </div>
                            )}
                            {proposal.company_email && (
                              <div className="flex items-center gap-2 text-sm text-white/50">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span className="line-clamp-1">{proposal.company_email}</span>
                              </div>
                            )}
                            {qa.website && String(qa.website) !== '' && (
                              <div className="flex items-center gap-2 text-sm text-white/50">
                                <Globe className="w-3.5 h-3.5 shrink-0" />
                                <a href={String(qa.website)} target="_blank" rel="noopener noreferrer" className="line-clamp-1 hover:text-primary transition-colors">
                                  {String(qa.website)}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Actions - pinned to bottom */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-white/10 text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
                              onClick={() => openWhatsApp(proposal.company_phone, proposal.company_name)}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </Button>
                            {/* Engine Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1"
                              onClick={() => handleOpenEngine(proposal)}
                              title="Abrir Genesis Engine"
                            >
                              <Cpu className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-xs">Engine</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                              onClick={() => openGoogle(proposal.company_name)}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
