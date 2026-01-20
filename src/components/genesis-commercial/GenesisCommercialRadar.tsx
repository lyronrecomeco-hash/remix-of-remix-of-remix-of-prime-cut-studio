import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Phone, ArrowRight, Lock, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RealLead {
  id: string;
  company_name: string;
  niche: string | null;
  company_city: string | null;
  company_state: string | null;
  company_phone: string | null;
  analysis_score: number | null;
  source: string | null;
}

const maskLocation = (city: string | null, state: string | null) => {
  if (!city) return '••••••, ••';
  const masked = city.length > 4 ? `${city.substring(0, 4)}•••••` : `${city}•••`;
  return `${masked}, ${state || '••'}`;
};

const maskPhone = (phone: string | null) => {
  if (!phone) return '(••) •••••-••••';
  return '(••) •••••-••••';
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Avançado';
  if (score >= 60) return 'Intermediário';
  return 'Básico';
};

const getNicheIcon = (niche: string | null) => {
  const nicheIcons: Record<string, string> = {
    'Barbearia': '💈',
    'Restaurante': '🍽️',
    'Loja': '🛍️',
    'Academia': '🏋️',
    'Clínica': '🏥',
    'Salão': '💇',
    'Pet Shop': '🐾',
    'Oficina': '🔧',
  };
  return nicheIcons[niche || ''] || '🏢';
};

const getEstimatedValue = (niche: string | null): { min: number; max: number; recurrence: number } => {
  const values: Record<string, { min: number; max: number; recurrence: number }> = {
    'Barbearia': { min: 300, max: 600, recurrence: 50 },
    'Restaurante': { min: 500, max: 1200, recurrence: 80 },
    'Loja': { min: 400, max: 800, recurrence: 60 },
    'Academia': { min: 600, max: 1500, recurrence: 100 },
    'Clínica': { min: 800, max: 2000, recurrence: 150 },
    'Salão': { min: 350, max: 700, recurrence: 55 },
    'Pet Shop': { min: 400, max: 900, recurrence: 70 },
    'Oficina': { min: 350, max: 750, recurrence: 45 },
  };
  return values[niche || ''] || { min: 300, max: 800, recurrence: 50 };
};

const GenesisCommercialRadar = () => {
  const [leads, setLeads] = useState<RealLead[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch real leads from database - from lyronrp@gmail.com account
  useEffect(() => {
    const fetchLeads = async () => {
      // Fetch leads from the affiliate with email lyronrp@gmail.com
      const { data: affiliateData } = await supabase
        .from('affiliates')
        .select('id')
        .eq('email', 'lyronrp@gmail.com')
        .single();
      
      if (affiliateData) {
        const { data, error } = await supabase
          .from('affiliate_prospects')
          .select('id, company_name, niche, company_city, company_state, company_phone, analysis_score, source')
          .eq('affiliate_id', affiliateData.id)
          .limit(35);
        
        if (!error && data) {
          const enrichedData = data.map(lead => ({
            ...lead,
            analysis_score: lead.analysis_score || Math.floor(Math.random() * 40) + 50,
          }));
          setLeads(enrichedData);
        }
      } else {
        // Fallback to global prospects
        const { data, error } = await supabase
          .from('affiliate_prospects')
          .select('id, company_name, niche, company_city, company_state, company_phone, analysis_score, source')
          .limit(35);
        
        if (!error && data) {
          const enrichedData = data.map(lead => ({
            ...lead,
            analysis_score: lead.analysis_score || Math.floor(Math.random() * 40) + 50,
          }));
          setLeads(enrichedData);
        }
      }
      setLoading(false);
    };
    fetchLeads();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || leads.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const animate = () => {
      scrollPosition += speed;
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => { animationId = requestAnimationFrame(animate); };
    
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [leads]);

  // Duplicate leads for infinite scroll effect
  const displayLeads = [...leads, ...leads];

  return (
    <section id="oportunidades" className="relative py-20 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(150,80%,40%,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.15)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.15)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container relative z-10 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/30 text-primary bg-primary/5">
            <Sparkles className="w-4 h-4 mr-2" />
            Clientes Prontos para Fechar Negócio
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Veja oportunidades <span className="text-primary">reais</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Empresas esperando por você. Assine e tenha acesso completo aos contatos.
          </p>
        </motion.div>

        {/* Auto-scrolling Cards Carousel */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden pb-4"
            style={{ scrollBehavior: 'auto' }}
          >
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[300px] h-[220px] bg-card border border-border rounded-xl animate-pulse" />
              ))
            ) : (
              displayLeads.map((lead, index) => {
                const estimated = getEstimatedValue(lead.niche);
                const score = lead.analysis_score || 70;
                
                return (
                  <motion.div
                    key={`${lead.id}-${index}`}
                    className="flex-shrink-0 w-[300px] bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                          {getNicheIcon(lead.niche)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate max-w-[160px]">
                            {lead.company_name}
                          </h3>
                          <span className="text-xs text-muted-foreground">{lead.niche || 'Negócio'}</span>
                        </div>
                      </div>
                      <Badge className={`text-xs shrink-0 ${getScoreColor(score)}`}>
                        {getScoreLabel(score)}
                      </Badge>
                    </div>

                    {/* Estimated Values */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <DollarSign className="w-3 h-3" />
                        R$ {estimated.min}~{estimated.max}
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                        <TrendingUp className="w-3 h-3" />
                        +R$ {estimated.recurrence}/mês
                      </Badge>
                    </div>

                    {/* AI Description */}
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {lead.niche ? `${lead.niche} precisa de sistema de agendamento e presença digital.` : 'Negócio com potencial para digitalização completa.'}
                    </p>

                    {/* Info with masks */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{maskLocation(lead.company_city, lead.company_state)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span>{maskPhone(lead.company_phone)}</span>
                      </div>
                    </div>

                    {/* Digital presence indicator */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Globe className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground">Sem presença digital — oportunidade máxima</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Lock className="w-4 h-4" />
            <span>Assine para desbloquear todos os contatos e começar a fechar negócios</span>
          </div>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Link to="/genesis" className="flex items-center gap-2">
              Desbloquear Acesso
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialRadar;