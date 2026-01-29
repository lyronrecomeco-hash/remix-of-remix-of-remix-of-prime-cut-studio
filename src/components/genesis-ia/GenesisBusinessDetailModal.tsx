import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Globe, Building2, 
  ExternalLink, MessageSquare, Mail,
  DollarSign, TrendingUp, Sparkles, Tag,
  Loader2, BarChart3, Star, Instagram, Facebook
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLeadEnrichment } from '@/hooks/useLeadEnrichment';
import { LeadEnrichmentPanel } from './LeadEnrichmentPanel';

interface SearchResult {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
  niche?: string;
  localTime?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  opportunityLevel?: 'basic' | 'intermediate' | 'advanced';
  estimatedValueMin?: number;
  estimatedValueMax?: number;
  monthlyRecurrence?: number;
  needsWebsite?: boolean;
  needsScheduling?: boolean;
  needsCRM?: boolean;
  needsMarketing?: boolean;
  needsEcommerce?: boolean;
  needsChatbot?: boolean;
  aiDescription?: string;
  generatedMessage?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface GenesisBusinessDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: SearchResult | null;
  onAcceptProject: () => void;
}

const LEVEL_CONFIG = {
  basic: { label: 'Básico', color: 'bg-white/10 text-white/60 border-white/20' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  advanced: { label: 'Avançado', color: 'bg-primary/20 text-primary border-primary/30' },
};

export const GenesisBusinessDetailModal = ({
  open,
  onOpenChange,
  business,
  onAcceptProject
}: GenesisBusinessDetailModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { enrichedData, isLoading, error, enrichLead, clearData } = useLeadEnrichment();

  // Limpar dados ao fechar modal
  useEffect(() => {
    if (!open) {
      clearData();
    }
  }, [open, clearData]);

  // Auto-enriquecer ao abrir
  useEffect(() => {
    if (open && business && !enrichedData && !isLoading) {
      handleEnrichLead();
    }
  }, [open, business]);

  const handleEnrichLead = async () => {
    if (!business) return;
    
    await enrichLead({
      name: business.name,
      address: business.address,
      phone: business.phone,
      email: business.email,
      website: business.website,
      rating: business.rating,
      reviewsCount: business.reviews_count,
      niche: business.niche || business.category,
      city: business.city,
      state: business.state,
      country: business.country,
      placeId: business.place_id,
    }, undefined, 'encontrar_cliente');
  };

  if (!business) return null;

  const googlePlaceUrl = business.place_id 
    ? `https://www.google.com/maps/place/?q=place_id:${business.place_id}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ' ' + business.address)}`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copiado!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const cleanPhone = business.phone?.replace(/\D/g, '') || '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`}` : '';
  const emailUrl = business.email ? `mailto:${business.email}` : '';

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
    if (business.website) {
      const lowerUrl = business.website.toLowerCase();
      if (lowerUrl.includes('instagram.com')) {
        urls.instagram = business.website.startsWith('http') ? business.website : `https://${business.website}`;
      }
      if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('fb.me')) {
        urls.facebook = business.website.startsWith('http') ? business.website : `https://${business.website}`;
      }
    }
    return urls;
  };

  const socialUrls = getSocialUrls();

  // Usar dados enriquecidos se disponíveis
  const displayScore = enrichedData?.scoring?.opportunityScore || (business.rating ? Math.round(business.rating * 10) : null);
  const displayLevel = enrichedData?.scoring?.opportunityLevel || business.opportunityLevel;
  const displayValueMin = enrichedData?.scoring?.estimatedValueMin || business.estimatedValueMin;
  const displayValueMax = enrichedData?.scoring?.estimatedValueMax || business.estimatedValueMax;
  const displayRecurrence = enrichedData?.scoring?.monthlyRecurrence || business.monthlyRecurrence;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[1100px] max-h-[90dvh] p-0 gap-0 overflow-hidden bg-[hsl(222,20%,8%)] border-white/10 flex flex-col">
        {/* Header Compacto */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-white/10 shrink-0">
          <DialogTitle className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-1 text-foreground">{business.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs sm:text-sm text-muted-foreground">{business.category || business.niche || 'Empresa'}</span>
                {business.rating && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs py-0 px-1.5 gap-0.5 bg-amber-500/10 text-amber-400 border-amber-500/30">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {business.rating.toFixed(1)}
                  </Badge>
                )}
                {isLoading && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs py-0 px-1.5 sm:px-2 bg-blue-500/10 text-blue-400 border-blue-500/30">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Analisando...
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Body - Side by Side Layout */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Side - Business Info */}
          <div className="lg:w-[340px] lg:min-w-[340px] lg:max-w-[340px] lg:border-r border-white/10 flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto flex-1">
              {/* Value Box - Compact */}
              {displayValueMin && displayValueMax && (
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
                      +R$ {displayRecurrence?.toLocaleString()}/mês
                    </p>
                  </div>
                </div>
              )}

              {/* AI Description */}
              {(enrichedData?.scoring?.digitalPresenceStatus || business.aiDescription) && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-xs flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-primary">{enrichedData?.scoring?.digitalPresenceStatus || business.aiDescription}</span>
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-foreground">Informações de Contato</h4>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{business.address}</span>
                </div>
                
                {business.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{business.phone}</span>
                    {enrichedData?.validation?.phone?.hasWhatsapp && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        WhatsApp ✓
                      </Badge>
                    )}
                  </div>
                )}
                
                {business.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{business.email}</span>
                    {enrichedData?.validation?.email?.isValid && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Válido ✓
                      </Badge>
                    )}
                  </div>
                )}

                {business.website && !isSocialMediaUrl(business.website) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                    <a 
                      href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {business.website}
                    </a>
                    {enrichedData?.websiteHealth?.isAccessible && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Online ✓
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  Serviços Recomendados
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {enrichedData?.scoring?.recommendedServices ? (
                    enrichedData.scoring.recommendedServices.slice(0, 6).map((service, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] bg-white/10 text-foreground border-white/20">
                        {service}
                      </Badge>
                    ))
                  ) : (
                    <>
                      {business.needsWebsite && (
                        <Badge variant="secondary" className="text-[10px] bg-white/10 text-foreground border-white/20">
                          website
                        </Badge>
                      )}
                      {business.needsChatbot && (
                        <Badge variant="secondary" className="text-[10px] bg-white/10 text-foreground border-white/20">
                          automation
                        </Badge>
                      )}
                      {business.needsScheduling && (
                        <Badge variant="secondary" className="text-[10px] bg-white/10 text-foreground border-white/20">
                          WhatsApp
                        </Badge>
                      )}
                      {business.needsCRM && (
                        <Badge variant="secondary" className="text-[10px] bg-white/10 text-foreground border-white/20">
                          CRM
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Google Place Link */}
              <Button
                variant="outline"
                className="w-full gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-xs h-9"
                onClick={() => window.open(googlePlaceUrl, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Pesquisar no Google
              </Button>
            </div>

            {/* Footer - Left Side Actions (Mobile Only) */}
            <div className="px-4 sm:px-6 py-3 border-t border-white/10 space-y-2 lg:hidden shrink-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!business.phone}
                  onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank')}
                  className={cn(
                    "flex-1 gap-1.5 h-9 text-xs px-2",
                    business.phone 
                      ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" 
                      : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  disabled={!business.email}
                  onClick={() => emailUrl && window.open(emailUrl, '_blank')}
                  className={cn(
                    "flex-1 gap-1.5 h-9 text-xs px-2",
                    business.email 
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
            <div className="px-4 sm:px-6 py-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Análise Avançada</h4>
                {displayScore && (
                  <Badge className={cn(
                    "ml-auto text-xs",
                    displayLevel === 'hot' && "bg-red-500/20 text-red-400 border-red-500/30",
                    displayLevel === 'warm' && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                    displayLevel === 'cool' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    displayLevel === 'cold' && "bg-gray-500/20 text-gray-400 border-gray-500/30",
                    displayLevel === 'basic' && "bg-slate-500/20 text-slate-400",
                    displayLevel === 'intermediate' && "bg-amber-500/20 text-amber-400",
                    displayLevel === 'advanced' && "bg-emerald-500/20 text-emerald-400",
                  )}>
                    Score: {displayScore}%
                  </Badge>
                )}
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

        {/* Footer - Action Buttons (Desktop) */}
        <div className="hidden lg:flex px-6 py-4 border-t border-white/10 shrink-0 gap-3">
          <div className="flex gap-2 flex-1">
            <Button
              variant="outline"
              disabled={!business.phone}
              onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank')}
              className={cn(
                "gap-1.5 h-10 text-sm px-3",
                business.phone 
                  ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" 
                  : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
              )}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              disabled={!business.email}
              onClick={() => emailUrl && window.open(emailUrl, '_blank')}
              className={cn(
                "gap-1.5 h-10 text-sm px-3",
                business.email 
                  ? "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" 
                  : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
              )}
            >
              <Mail className="w-4 h-4" />
            </Button>
            {socialUrls.instagram && (
              <Button
                variant="outline"
                onClick={() => window.open(socialUrls.instagram, '_blank')}
                className="gap-1.5 h-10 text-sm px-3 text-pink-500 border-pink-500/30 hover:bg-pink-500/10"
              >
                <Instagram className="w-4 h-4" />
              </Button>
            )}
            {socialUrls.facebook && (
              <Button
                variant="outline"
                onClick={() => window.open(socialUrls.facebook, '_blank')}
                className="gap-1.5 h-10 text-sm px-3 text-blue-600 border-blue-600/30 hover:bg-blue-600/10"
              >
                <Facebook className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 h-10 text-sm"
              onClick={() => onOpenChange(false)}
            >
              Rejeitar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 gap-2 h-10 text-sm"
              onClick={() => {
                onAcceptProject();
                toast.success('Projeto aceito! Adicionado aos seus prospects.');
              }}
            >
              <Sparkles className="w-4 h-4" />
              Aceitar Projeto
            </Button>
          </div>
        </div>

        {/* Footer - Mobile */}
        <div className="lg:hidden px-4 py-3 border-t border-white/10 shrink-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 h-9 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Rejeitar
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 gap-1.5 h-9 text-xs"
            onClick={() => {
              onAcceptProject();
              toast.success('Projeto aceito!');
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Aceitar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenesisBusinessDetailModal;
