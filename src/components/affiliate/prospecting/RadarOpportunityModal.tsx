import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Globe, Building2, 
  MessageSquare, Mail, DollarSign, TrendingUp, 
  Sparkles, Tag, Loader2, BarChart3, CheckCircle2, X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLeadEnrichment } from '@/hooks/useLeadEnrichment';
import { LeadEnrichmentPanel } from '@/components/genesis-ia/LeadEnrichmentPanel';

interface RadarOpportunity {
  id: string;
  company_name: string;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  company_address: string | null;
  company_city: string | null;
  company_country: string | null;
  niche: string | null;
  opportunity_score: number;
  opportunity_level: string;
  estimated_value_min: number;
  estimated_value_max: number;
  monthly_recurrence: number;
  digital_presence_status: string | null;
  service_tags: string[];
  ai_description: string | null;
  status: string;
  is_read: boolean;
  found_at: string;
  search_region: string | null;
}

interface RadarOpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: RadarOpportunity | null;
  onAccept: () => void;
  onReject: () => void;
  accepting: boolean;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  basic: { label: 'Básico', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  advanced: { label: 'Avançado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
};

export const RadarOpportunityModal = ({
  open,
  onOpenChange,
  opportunity,
  onAccept,
  onReject,
  accepting
}: RadarOpportunityModalProps) => {
  const { enrichedData, isLoading, error, enrichLead, clearData } = useLeadEnrichment();

  // Limpar dados ao fechar
  useEffect(() => {
    if (!open) {
      clearData();
    }
  }, [open, clearData]);

  // Auto-enriquecer ao abrir
  useEffect(() => {
    if (open && opportunity && !enrichedData && !isLoading) {
      handleEnrichLead();
    }
  }, [open, opportunity]);

  const handleEnrichLead = async () => {
    if (!opportunity) return;
    
    await enrichLead({
      name: opportunity.company_name,
      address: opportunity.company_address || undefined,
      phone: opportunity.company_phone || undefined,
      email: opportunity.company_email || undefined,
      website: opportunity.company_website || undefined,
      niche: opportunity.niche || undefined,
      city: opportunity.company_city || undefined,
      country: opportunity.company_country || undefined,
    }, undefined, 'radar');
  };

  if (!opportunity) return null;

  const cleanPhone = opportunity.company_phone?.replace(/\D/g, '') || '';
  const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : '';
  const emailUrl = opportunity.company_email ? `mailto:${opportunity.company_email}` : '';
  const levelConfig = LEVEL_CONFIG[opportunity.opportunity_level] || LEVEL_CONFIG.basic;

  // Usar dados enriquecidos se disponíveis
  const displayScore = enrichedData?.scoring?.opportunityScore || opportunity.opportunity_score;
  const displayValueMin = enrichedData?.scoring?.estimatedValueMin || opportunity.estimated_value_min;
  const displayValueMax = enrichedData?.scoring?.estimatedValueMax || opportunity.estimated_value_max;
  const displayRecurrence = enrichedData?.scoring?.monthlyRecurrence || opportunity.monthly_recurrence;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[1100px] max-h-[90dvh] p-0 gap-0 overflow-hidden bg-[hsl(222,20%,8%)] border-white/10 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-white/10 shrink-0">
          <DialogTitle className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-1 text-foreground">{opportunity.company_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs sm:text-sm text-muted-foreground">{opportunity.niche || 'Empresa'}</span>
                <Badge variant="outline" className={cn("text-[10px] sm:text-xs py-0 px-1.5", levelConfig.color)}>
                  {levelConfig.label}
                </Badge>
                {isLoading && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs py-0 px-1.5 sm:px-2 bg-blue-500/10 text-blue-400 border-blue-500/30">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Analisando...
                  </Badge>
                )}
              </div>
            </div>
            {/* Score Badge - Header */}
            <Badge className={cn(
              "text-sm px-3 py-1 shrink-0",
              displayScore >= 80 && "bg-emerald-500",
              displayScore >= 60 && displayScore < 80 && "bg-amber-500",
              displayScore < 60 && "bg-slate-400",
            )}>
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {displayScore}%
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Body - Side by Side */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Side - Info */}
          <div className="lg:w-[400px] lg:border-r border-white/10 flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto flex-1">
              {/* Value Box */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-primary" /> VALOR
                  </p>
                  <p className="text-xs text-muted-foreground">Min: R$ {displayValueMin.toLocaleString()}</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {displayValueMax.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-primary" /> RECORRÊNCIA
                  </p>
                  <p className="text-lg font-bold text-primary mt-3">
                    +R$ {displayRecurrence.toLocaleString()}/mês
                  </p>
                </div>
              </div>

              {/* AI Description */}
              {(enrichedData?.scoring?.digitalPresenceStatus || opportunity.ai_description) && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-purple-300">{enrichedData?.scoring?.digitalPresenceStatus || opportunity.ai_description}</span>
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-foreground">Informações</h4>
                
                {opportunity.company_city && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{opportunity.company_city}, {opportunity.search_region || opportunity.company_country}</span>
                  </div>
                )}
                
                {opportunity.company_address && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{opportunity.company_address}</span>
                  </div>
                )}
                
                {opportunity.company_phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{opportunity.company_phone}</span>
                    {enrichedData?.validation?.phone?.hasWhatsapp && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        WhatsApp ✓
                      </Badge>
                    )}
                  </div>
                )}
                
                {opportunity.company_email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{opportunity.company_email}</span>
                    {enrichedData?.validation?.email?.isValid && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Válido ✓
                      </Badge>
                    )}
                  </div>
                )}

                {opportunity.company_website && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                    <a 
                      href={opportunity.company_website.startsWith('http') ? opportunity.company_website : `https://${opportunity.company_website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {opportunity.company_website}
                    </a>
                    {enrichedData?.websiteHealth?.isAccessible && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Online ✓
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Service Tags */}
              {(enrichedData?.scoring?.recommendedServices || opportunity.service_tags)?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-foreground flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    Serviços Recomendados
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(enrichedData?.scoring?.recommendedServices || opportunity.service_tags).slice(0, 6).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] bg-white/10 text-foreground border-white/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Contact Buttons */}
            <div className="px-4 sm:px-6 py-3 border-t border-white/10 space-y-2 lg:hidden shrink-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!opportunity.company_phone}
                  onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank')}
                  className={cn(
                    "flex-1 gap-1.5 h-9 text-xs",
                    opportunity.company_phone 
                      ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" 
                      : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  disabled={!opportunity.company_email}
                  onClick={() => emailUrl && window.open(emailUrl, '_blank')}
                  className={cn(
                    "flex-1 gap-1.5 h-9 text-xs",
                    opportunity.company_email 
                      ? "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" 
                      : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
                  )}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Análise Avançada */}
          <div className="flex-1 flex flex-col overflow-hidden border-t lg:border-t-0 border-white/10">
            <div className="px-4 sm:px-6 py-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-semibold text-foreground">Análise Avançada</h4>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
              <LeadEnrichmentPanel
                data={enrichedData}
                isLoading={isLoading}
                error={error}
                onRefresh={handleEnrichLead}
              />
            </div>
          </div>
        </div>

        {/* Footer - Desktop */}
        <div className="hidden lg:flex px-6 py-4 border-t border-white/10 shrink-0 gap-3">
          <div className="flex gap-2 flex-1">
            <Button
              variant="outline"
              disabled={!opportunity.company_phone}
              onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank')}
              className={cn(
                "gap-1.5 h-10 text-sm",
                opportunity.company_phone 
                  ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" 
                  : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              disabled={!opportunity.company_email}
              onClick={() => emailUrl && window.open(emailUrl, '_blank')}
              className={cn(
                "gap-1.5 h-10 text-sm",
                opportunity.company_email 
                  ? "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" 
                  : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
              )}
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 h-10 text-sm"
              onClick={() => {
                onReject();
                onOpenChange(false);
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Rejeitar
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 gap-2 h-10 text-sm"
              onClick={() => {
                onAccept();
                toast.success('Oportunidade aceita!');
              }}
              disabled={accepting}
            >
              {accepting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Aceitar
            </Button>
          </div>
        </div>

        {/* Footer - Mobile */}
        <div className="lg:hidden px-4 py-3 border-t border-white/10 shrink-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 h-9 text-xs"
            onClick={() => {
              onReject();
              onOpenChange(false);
            }}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Rejeitar
          </Button>
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700 gap-1.5 h-9 text-xs"
            onClick={() => {
              onAccept();
              toast.success('Aceita!');
            }}
            disabled={accepting}
          >
            {accepting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            Aceitar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
