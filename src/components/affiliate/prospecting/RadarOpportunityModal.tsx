import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Globe, Building2, 
  MessageSquare, Mail, DollarSign, TrendingUp, 
  Sparkles, Tag, Loader2, BarChart3, CheckCircle2,
  Instagram, Facebook
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

  // Helper para detectar URLs de redes sociais
  const isSocialMediaUrl = (url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('facebook.com') || 
           lowerUrl.includes('instagram.com') || 
           lowerUrl.includes('fb.com') ||
           lowerUrl.includes('fb.me');
  };

  // Extrair URLs de redes sociais
  const getSocialUrls = () => {
    const urls: { instagram?: string; facebook?: string } = {};
    if (opportunity.company_website) {
      const lowerUrl = opportunity.company_website.toLowerCase();
      if (lowerUrl.includes('instagram.com')) {
        urls.instagram = opportunity.company_website.startsWith('http') ? opportunity.company_website : `https://${opportunity.company_website}`;
      }
      if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('fb.me')) {
        urls.facebook = opportunity.company_website.startsWith('http') ? opportunity.company_website : `https://${opportunity.company_website}`;
      }
    }
    return urls;
  };

  const socialUrls = getSocialUrls();

  // Usar dados enriquecidos se disponíveis
  const displayScore = enrichedData?.scoring?.opportunityScore || opportunity.opportunity_score;
  const displayValueMin = enrichedData?.scoring?.estimatedValueMin || opportunity.estimated_value_min;
  const displayValueMax = enrichedData?.scoring?.estimatedValueMax || opportunity.estimated_value_max;
  const displayRecurrence = enrichedData?.scoring?.monthlyRecurrence || opportunity.monthly_recurrence;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg lg:max-w-4xl max-h-[90dvh] overflow-hidden p-0 bg-[hsl(220,20%,8%)] border-white/10 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/10 bg-white/5 shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-lg font-semibold line-clamp-1">{opportunity.company_name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{opportunity.niche || 'Empresa'}</span>
                <Badge variant="outline" className={cn("text-[10px] py-0 px-1.5", levelConfig.color)}>
                  {levelConfig.label}
                </Badge>
              </div>
            </div>
            {/* Score Badge */}
            <Badge className={cn(
              "text-sm px-3 py-1 shrink-0",
              displayScore >= 80 && "bg-emerald-500",
              displayScore >= 60 && displayScore < 80 && "bg-amber-500",
              displayScore < 60 && "bg-slate-400",
            )}>
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {displayScore}%
            </Badge>
            {isLoading && (
              <Badge variant="outline" className="text-xs py-1 px-2 bg-blue-500/10 text-blue-400 border-blue-500/30 shrink-0">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Analisando...
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Body - Side by Side */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Side - Info */}
          <div className="lg:w-[280px] lg:min-w-[280px] lg:max-w-[280px] lg:border-r border-white/10 flex flex-col overflow-hidden">
            <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
              {/* Value Box */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-0.5">
                    <DollarSign className="w-2.5 h-2.5 text-primary" /> VALOR
                  </p>
                  <p className="text-[10px] text-muted-foreground">Min: R$ {displayValueMin.toLocaleString()}</p>
                  <p className="text-sm font-bold text-primary">
                    R$ {displayValueMax.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-0.5">
                    <TrendingUp className="w-2.5 h-2.5 text-primary" /> RECORRÊNCIA
                  </p>
                  <p className="text-sm font-bold text-primary mt-2">
                    +R$ {displayRecurrence.toLocaleString()}/mês
                  </p>
                </div>
              </div>

              {/* AI Description */}
              {(enrichedData?.scoring?.digitalPresenceStatus || opportunity.ai_description) && (
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-[11px] flex items-start gap-2">
                    <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    <span className="text-primary leading-tight">{enrichedData?.scoring?.digitalPresenceStatus || opportunity.ai_description}</span>
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-medium text-foreground">Informações</h4>
                
                {opportunity.company_city && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[11px] text-muted-foreground">{opportunity.company_city}, {opportunity.search_region || opportunity.company_country}</span>
                  </div>
                )}
                
                {opportunity.company_address && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[11px] text-muted-foreground truncate">{opportunity.company_address}</span>
                  </div>
                )}
                
                {opportunity.company_phone && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[11px] text-muted-foreground flex-1">{opportunity.company_phone}</span>
                    {enrichedData?.validation?.phone?.hasWhatsapp && (
                      <Badge variant="outline" className="text-[9px] py-0 px-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        WhatsApp ✓
                      </Badge>
                    )}
                  </div>
                )}
                
                {opportunity.company_email && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[11px] text-muted-foreground truncate flex-1">{opportunity.company_email}</span>
                    {enrichedData?.validation?.email?.isValid && (
                      <Badge variant="outline" className="text-[9px] py-0 px-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Válido ✓
                      </Badge>
                    )}
                  </div>
                )}

                {opportunity.company_website && !isSocialMediaUrl(opportunity.company_website) && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                    <a 
                      href={opportunity.company_website.startsWith('http') ? opportunity.company_website : `https://${opportunity.company_website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary hover:underline truncate flex-1"
                    >
                      {opportunity.company_website}
                    </a>
                    {enrichedData?.websiteHealth?.isAccessible && (
                      <Badge variant="outline" className="text-[9px] py-0 px-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Online ✓
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Service Tags */}
              {(enrichedData?.scoring?.recommendedServices || opportunity.service_tags)?.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-medium text-foreground flex items-center gap-2">
                    <Tag className="w-3 h-3 text-primary" />
                    Serviços Recomendados
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {(enrichedData?.scoring?.recommendedServices || opportunity.service_tags).slice(0, 5).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[9px] py-0 px-1.5 bg-white/10 text-foreground border-white/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Contact Buttons */}
            <div className="px-5 py-3 border-t border-white/10 space-y-2 lg:hidden shrink-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!opportunity.company_phone}
                  onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank')}
                  className={cn(
                    "flex-1 gap-1.5 h-9 text-xs px-2",
                    opportunity.company_phone 
                      ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" 
                      : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  disabled={!opportunity.company_email}
                  onClick={() => emailUrl && window.open(emailUrl, '_blank')}
                  className={cn(
                    "flex-1 gap-1.5 h-9 text-xs px-2",
                    opportunity.company_email 
                      ? "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" 
                      : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
                  )}
                >
                  <Mail className="w-3.5 h-3.5" />
                </Button>
                {socialUrls.instagram && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(socialUrls.instagram, '_blank')}
                    className="flex-1 gap-1.5 h-9 text-xs px-2 text-pink-500 border-pink-500/30 hover:bg-pink-500/10"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </Button>
                )}
                {socialUrls.facebook && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(socialUrls.facebook, '_blank')}
                    className="flex-1 gap-1.5 h-9 text-xs px-2 text-blue-600 border-blue-600/30 hover:bg-blue-600/10"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Análise Avançada */}
          <div className="flex-1 flex flex-col overflow-hidden border-t lg:border-t-0 border-white/10">
            <div className="px-5 py-3 border-b border-white/10 bg-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Análise Avançada</h4>
              </div>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1">
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
        <div className="hidden lg:flex px-5 py-4 border-t border-white/10 bg-white/5 shrink-0 gap-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!opportunity.company_phone}
              onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank')}
              className={cn(
                "gap-1.5 h-9 px-3",
                opportunity.company_phone 
                  ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" 
                  : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
              )}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!opportunity.company_email}
              onClick={() => emailUrl && window.open(emailUrl, '_blank')}
              className={cn(
                "gap-1.5 h-9 px-3",
                opportunity.company_email 
                  ? "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" 
                  : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
              )}
            >
              <Mail className="w-4 h-4" />
            </Button>
            {socialUrls.instagram && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(socialUrls.instagram, '_blank')}
                className="gap-1.5 h-9 px-3 text-pink-500 border-pink-500/30 hover:bg-pink-500/10"
              >
                <Instagram className="w-4 h-4" />
              </Button>
            )}
            {socialUrls.facebook && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(socialUrls.facebook, '_blank')}
                className="gap-1.5 h-9 px-3 text-blue-600 border-blue-600/30 hover:bg-blue-600/10"
              >
                <Facebook className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-3 ml-auto">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => {
                onReject();
                onOpenChange(false);
              }}
            >
              Rejeitar
            </Button>
            <Button
              className="gap-2"
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
        <div className="lg:hidden px-5 py-3 border-t border-white/10 bg-white/5 shrink-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 h-9 text-xs"
            onClick={() => {
              onReject();
              onOpenChange(false);
            }}
          >
            Rejeitar
          </Button>
          <Button
            className="flex-1 gap-1.5 h-9 text-xs"
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
