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
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AcceptedProposal {
  id: string;
  company_name: string;
  company_phone: string | null;
  company_website: string | null;
  company_address: string | null;
  company_city: string | null;
  niche: string | null;
  analysis_score: number | null;
  analysis_data: Record<string, unknown> | null;
  status: string;
  source: string | null;
  created_at: string;
}

interface AcceptedProposalsTabProps {
  affiliateId: string | null;
}

export const AcceptedProposalsTab = ({ affiliateId }: AcceptedProposalsTabProps) => {
  const [proposals, setProposals] = useState<AcceptedProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProposals = async () => {
    if (!affiliateId) {
      setProposals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_prospects')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .eq('source', 'radar_global')
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

    // Real-time subscription - só se tiver affiliateId
    if (!affiliateId) return;
    
    const channel = supabase
      .channel('accepted_proposals_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'affiliate_prospects',
          filter: `affiliate_id=eq.${affiliateId}`,
        },
        (payload) => {
          const newProposal = payload.new as AcceptedProposal;
          if (newProposal.source === 'radar_global') {
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
    p.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-white/50';
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-cyan-400';
    return 'text-muted-foreground';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const openWhatsApp = (phone: string | null, companyName: string) => {
    if (!phone) {
      toast.error('Telefone não disponível');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Vi que a ${companyName} pode se beneficiar dos nossos serviços. Podemos conversar?`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const openGoogle = (companyName: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(companyName)}`, '_blank');
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Propostas Aceitas
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {proposals.length} proposta{proposals.length !== 1 ? 's' : ''} aceita{proposals.length !== 1 ? 's' : ''} do Radar Global
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Buscar proposta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchProposals}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Proposals Grid */}
      {filteredProposals.length === 0 ? (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white/70 mb-2">
              {searchTerm ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta aceita ainda'}
            </h3>
            <p className="text-sm text-white/40">
              {searchTerm 
                ? 'Tente outro termo de busca' 
                : 'Aceite oportunidades no Radar Global para vê-las aqui'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="border-white/10 hover:border-primary/30 bg-white/5 transition-all duration-200"
                >
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm line-clamp-1">
                            {proposal.company_name}
                          </h3>
                          {proposal.niche && (
                            <Badge 
                              variant="outline" 
                              className="mt-1 text-xs border-primary/30 text-primary/80"
                            >
                              {proposal.niche}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {proposal.analysis_score && (
                        <div className={`text-lg font-bold ${getScoreColor(proposal.analysis_score)}`}>
                          {proposal.analysis_score}
                          <span className="text-xs font-normal text-white/40">/100</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2 mb-4">
                      {proposal.company_city && (
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{proposal.company_city}</span>
                        </div>
                      )}
                      {proposal.company_phone && (
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{proposal.company_phone}</span>
                        </div>
                      )}
                      {(proposal.analysis_data as Record<string, unknown>)?.estimated_value_min && (
                        <div className="flex items-center gap-2 text-sm text-primary/80">
                          <Star className="w-3.5 h-3.5" />
                          <span>
                            {formatCurrency((proposal.analysis_data as Record<string, unknown>).estimated_value_min as number)} - {formatCurrency(((proposal.analysis_data as Record<string, unknown>).estimated_value_max || (proposal.analysis_data as Record<string, unknown>).estimated_value_min) as number)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
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
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
