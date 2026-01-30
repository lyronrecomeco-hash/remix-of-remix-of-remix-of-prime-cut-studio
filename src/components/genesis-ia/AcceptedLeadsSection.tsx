import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  MapPin,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Target,
  Mail
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AcceptedLead {
  id: string;
  company_name: string;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  company_city: string | null;
  niche: string | null;
  analysis_score: number | null;
  analysis_data: any;
  status: string;
  created_at: string;
  source?: string;
}

interface AcceptedLeadsSectionProps {
  affiliateId: string;
  onViewAll?: () => void;
}

export const AcceptedLeadsSection = ({ affiliateId, onViewAll }: AcceptedLeadsSectionProps) => {
  const [leads, setLeads] = useState<AcceptedLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcceptedLeads = async () => {
      if (!affiliateId) return;
      
      try {
        const { data, error } = await supabase
          .from('affiliate_prospects')
          .select('*')
          .eq('affiliate_id', affiliateId)
          .eq('source', 'radar_global')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching accepted leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedLeads();

    // Subscribe to new accepted leads
    const channel = supabase
      .channel('accepted-leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'affiliate_prospects',
          filter: `affiliate_id=eq.${affiliateId}`,
        },
        (payload) => {
          const newLead = payload.new as AcceptedLead;
          if (newLead.source === 'radar_global') {
            setLeads(prev => [newLead, ...prev.slice(0, 5)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [affiliateId]);

  if (loading || leads.length === 0) {
    return null;
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-cyan-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 sm:mt-8 px-1 sm:px-0">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Leads Aceitos</h2>
          <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">{leads.length}</Badge>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1 text-muted-foreground h-8 text-xs sm:text-sm">
            Ver todos
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
        <AnimatePresence mode="popLayout">
          {leads.map((lead, index) => {
            const analysisData = lead.analysis_data as AcceptedLead['analysis_data'];
            
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30",
                  "bg-card border-border/50"
                )}>
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

                  <CardContent className="p-3 sm:p-4 pt-4 sm:pt-5">
                    {/* Header */}
                    <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground leading-tight line-clamp-1 text-xs sm:text-sm">
                          {lead.company_name}
                        </h4>
                        <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{lead.niche || 'Negócio local'}</span>
                          {lead.analysis_score && (
                            <Badge variant="outline" className={cn(
                              "text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4 sm:h-5",
                              getScoreColor(lead.analysis_score)
                            )}>
                              {lead.analysis_score}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Value */}
                    {analysisData?.estimated_value_max && (
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span className="text-xs sm:text-sm font-semibold text-primary">
                          R$ {analysisData.estimated_value_max.toLocaleString()}
                        </span>
                        {analysisData?.monthly_recurrence && (
                          <span className="text-[9px] sm:text-xs text-muted-foreground ml-auto">
                            +R${analysisData.monthly_recurrence}/mês
                          </span>
                        )}
                      </div>
                    )}

                    {/* Info */}
                    <div className="space-y-1 mb-2 sm:mb-3">
                      {lead.company_city && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 sm:gap-1.5">
                          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="truncate">{lead.company_city}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions - Icon Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-border/50">
                      {/* WhatsApp Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (lead.company_phone) {
                            window.open(`https://wa.me/${lead.company_phone.replace(/\D/g, '')}`, '_blank');
                          }
                        }}
                        disabled={!lead.company_phone}
                        className={cn(
                          "h-8 w-8 sm:h-9 sm:w-9 p-0",
                          lead.company_phone 
                            ? "text-primary hover:text-primary/80 hover:bg-primary/10 border-primary/30" 
                            : "text-muted-foreground/30 cursor-not-allowed"
                        )}
                        title={lead.company_phone ? `WhatsApp: ${lead.company_phone}` : 'Telefone não disponível'}
                      >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      
                      {/* Email Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (lead.company_email) {
                            window.open(`mailto:${lead.company_email}`, '_blank');
                          }
                        }}
                        disabled={!lead.company_email}
                        className={cn(
                          "h-8 w-8 sm:h-9 sm:w-9 p-0",
                          lead.company_email 
                            ? "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 border-blue-500/30" 
                            : "text-muted-foreground/30 cursor-not-allowed"
                        )}
                        title={lead.company_email ? `Email: ${lead.company_email}` : 'Email não disponível'}
                      >
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      
                      {/* Search Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(lead.company_name)}`, '_blank')}
                        className="flex-1 h-8 sm:h-9 gap-1 sm:gap-1.5 text-[10px] sm:text-xs"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Pesquisar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
