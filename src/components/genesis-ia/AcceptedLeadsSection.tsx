import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  MapPin,
  Phone,
  Globe2,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AcceptedLead {
  id: string;
  company_name: string;
  company_phone: string | null;
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
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Leads Aceitos</h2>
          <Badge variant="secondary" className="ml-2">{leads.length}</Badge>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1 text-muted-foreground">
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

                  <CardContent className="p-4 pt-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground leading-tight line-clamp-1">
                          {lead.company_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{lead.niche || 'Negócio local'}</span>
                          {lead.analysis_score && (
                            <Badge variant="outline" className={cn(
                              "text-[10px] px-1.5 py-0 h-5",
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
                      <div className="flex items-center gap-2 mb-3 p-2 bg-muted/30 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-500">
                          R$ {analysisData.estimated_value_max.toLocaleString()}
                        </span>
                        {analysisData?.monthly_recurrence && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            +R${analysisData.monthly_recurrence}/mês
                          </span>
                        )}
                      </div>
                    )}

                    {/* Info */}
                    <div className="space-y-1.5 mb-3">
                      {lead.company_city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{lead.company_city}</span>
                        </p>
                      )}
                      {lead.company_phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{lead.company_phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                      {lead.company_phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://wa.me/${lead.company_phone?.replace(/\D/g, '')}`, '_blank')}
                          className="flex-1 h-9 gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          WhatsApp
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(lead.company_name)}`, '_blank')}
                        className="flex-1 h-9 gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
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
