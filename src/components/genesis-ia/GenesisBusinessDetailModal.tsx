import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Globe, Star, Building2, 
  ExternalLink, Copy, Check, Navigation, Users,
  MessageCircle, Zap, Calendar, FileText, ShoppingBag,
  DollarSign, TrendingUp, Sparkles, Tag, MessageSquare, Mail,
  BarChart3, RefreshCw, Loader2
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
  const [showEnrichment, setShowEnrichment] = useState(false);
  const { enrichedData, isLoading, error, enrichLead, clearData } = useLeadEnrichment();

  // Limpar dados ao fechar modal
  useEffect(() => {
    if (!open) {
      setShowEnrichment(false);
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
    
    setShowEnrichment(true);
    
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

  const openWhatsApp = () => {
    if (business.phone) {
      const cleanPhone = business.phone.replace(/\D/g, '');
      const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  const hasWebsite = !!business.website;
  const levelConfig = business.opportunityLevel ? LEVEL_CONFIG[business.opportunityLevel] : null;

  const cleanPhone = business.phone?.replace(/\D/g, '') || '';
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`}` : '';
  const emailUrl = business.email ? `mailto:${business.email}` : '';

  // Usar dados enriquecidos se disponíveis
  const displayScore = enrichedData?.scoring?.opportunityScore || (business.rating ? Math.round(business.rating * 10) : null);
  const displayLevel = enrichedData?.scoring?.opportunityLevel || business.opportunityLevel;
  const displayValueMin = enrichedData?.scoring?.estimatedValueMin || business.estimatedValueMin;
  const displayValueMax = enrichedData?.scoring?.estimatedValueMax || business.estimatedValueMax;
  const displayRecurrence = enrichedData?.scoring?.monthlyRecurrence || business.monthlyRecurrence;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90dvh] p-0 gap-0 overflow-hidden bg-[hsl(222,20%,8%)] border-white/10 flex flex-col">
        {/* Header - Mobile Responsive */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5 border-b border-white/10">
          <DialogTitle className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2 text-foreground">{business.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{business.category || business.niche || 'Empresa'}</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                {displayLevel && (
                  <Badge variant="outline" className={cn(
                    "text-[10px] sm:text-xs py-0 px-1.5 sm:px-2",
                    displayLevel === 'hot' && "bg-red-500/20 text-red-400 border-red-500/30",
                    displayLevel === 'warm' && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                    displayLevel === 'cool' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    displayLevel === 'cold' && "bg-gray-500/20 text-gray-400 border-gray-500/30",
                    displayLevel === 'basic' && LEVEL_CONFIG.basic.color,
                    displayLevel === 'intermediate' && LEVEL_CONFIG.intermediate.color,
                    displayLevel === 'advanced' && LEVEL_CONFIG.advanced.color,
                  )}>
                    {displayLevel === 'hot' ? '🔥 Hot' : 
                     displayLevel === 'warm' ? '🌡️ Warm' :
                     displayLevel === 'cool' ? '❄️ Cool' :
                     displayLevel === 'cold' ? '🧊 Cold' :
                     LEVEL_CONFIG[displayLevel as keyof typeof LEVEL_CONFIG]?.label || displayLevel}
                  </Badge>
                )}
                {displayScore && (
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] sm:text-xs py-0 px-1.5 sm:px-2">
                    Score: {displayScore}%
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

        {/* Body - Mobile Responsive */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0">
          {/* Value Box - Usar dados enriquecidos */}
          {displayValueMin && displayValueMax && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                  <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" /> VALOR
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">Min: R$ {displayValueMin.toLocaleString()}</p>
                <p className="text-lg sm:text-xl font-bold text-primary mt-0.5 sm:mt-1">
                  R$ {displayValueMax.toLocaleString()}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" /> RECORRÊNCIA
                </p>
                <p className="text-lg sm:text-xl font-bold text-primary mt-2 sm:mt-3">
                  +R$ {displayRecurrence?.toLocaleString()}/mês
                </p>
              </div>
            </div>
          )}

          {/* Painel de Enriquecimento */}
          {showEnrichment && (
            <LeadEnrichmentPanel
              data={enrichedData}
              isLoading={isLoading}
              error={error}
              onRefresh={handleEnrichLead}
            />
          )}

          {/* AI Description - Fallback se não tiver dados enriquecidos */}
          {!showEnrichment && business.aiDescription && (
            <div className="p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs sm:text-sm flex items-start gap-2 sm:gap-2.5">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-primary">{business.aiDescription}</span>
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-medium text-foreground">Informações de Contato</h4>
            
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span className="truncate">{business.address}</span>
            </div>
            
            {business.phone && (
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span>{business.phone}</span>
                {enrichedData?.validation?.phone?.hasWhatsapp && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    WhatsApp ✓
                  </Badge>
                )}
              </div>
            )}
            
            {business.email && (
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span className="truncate">{business.email}</span>
                {enrichedData?.validation?.email?.isValid && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    Válido ✓
                  </Badge>
                )}
              </div>
            )}

            {business.website && (
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
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

          {/* Services - Usar dados enriquecidos se disponíveis */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              Serviços Recomendados
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {enrichedData?.scoring?.recommendedServices ? (
                enrichedData.scoring.recommendedServices.slice(0, 6).map((service, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs bg-white/10 text-foreground border-white/20">
                    {service}
                  </Badge>
                ))
              ) : (
                <>
                  {business.needsWebsite && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-white/10 text-foreground border-white/20">
                      website
                    </Badge>
                  )}
                  {business.needsChatbot && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-white/10 text-foreground border-white/20">
                      automation
                    </Badge>
                  )}
                  {business.needsScheduling && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-white/10 text-foreground border-white/20">
                      WhatsApp
                    </Badge>
                  )}
                  {business.needsCRM && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-white/10 text-foreground border-white/20">
                      CRM
                    </Badge>
                  )}
                  {business.needsMarketing && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-white/10 text-foreground border-white/20">
                      marketing
                    </Badge>
                  )}
                  {business.needsEcommerce && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-white/10 text-foreground border-white/20">
                      e-commerce
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Region & Date */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1 sm:gap-1.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {business.address?.split(',').pop()?.trim() || 'N/A'}
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              📅 {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Google Place Link */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-xs sm:text-sm h-9 sm:h-10"
              onClick={() => window.open(googlePlaceUrl, '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Pesquisar no Google
            </Button>
          </div>
        </div>

        {/* Footer - Action Buttons with WhatsApp/Email */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-white/10 space-y-3">
          {/* Contact Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!business.phone}
              onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank')}
              className={cn(
                "flex-1 gap-1.5 h-9 sm:h-10 text-xs sm:text-sm",
                business.phone 
                  ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" 
                  : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              disabled={!business.email}
              onClick={() => emailUrl && window.open(emailUrl, '_blank')}
              className={cn(
                "flex-1 gap-1.5 h-9 sm:h-10 text-xs sm:text-sm",
                business.email 
                  ? "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" 
                  : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
              )}
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Email
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 h-9 sm:h-10 text-xs sm:text-sm"
              onClick={() => onOpenChange(false)}
            >
              Rejeitar
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 h-9 sm:h-10 text-xs sm:text-sm"
              onClick={() => onOpenChange(false)}
            >
              Salvar
            </Button>
            <Button
              className="flex-1 gap-2 h-9 sm:h-10 text-xs sm:text-sm"
              onClick={() => {
                onAcceptProject();
                onOpenChange(false);
              }}
            >
              Aceitar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
