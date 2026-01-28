import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Globe, Star, Building2, 
  ExternalLink, Copy, Check, Navigation, Users,
  MessageCircle, Zap, Calendar, FileText, ShoppingBag,
  DollarSign, TrendingUp, Sparkles, Tag, MessageSquare, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90dvh] p-0 gap-0 overflow-hidden bg-[hsl(222,20%,8%)] border-white/10 flex flex-col">
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
                {levelConfig && (
                  <Badge variant="outline" className={cn("text-[10px] sm:text-xs py-0 px-1.5 sm:px-2", levelConfig.color)}>
                    {levelConfig.label}
                  </Badge>
                )}
                {business.rating && (
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] sm:text-xs py-0 px-1.5 sm:px-2">
                    Score: {Math.round(business.rating * 10)}%
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Body - Mobile Responsive */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0">
          {/* Value Box */}
          {business.estimatedValueMin && business.estimatedValueMax && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                  <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" /> VALOR
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">Min: R$ {business.estimatedValueMin.toLocaleString()}</p>
                <p className="text-lg sm:text-xl font-bold text-primary mt-0.5 sm:mt-1">
                  R$ {business.estimatedValueMax.toLocaleString()}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" /> RECORRÊNCIA
                </p>
                <p className="text-lg sm:text-xl font-bold text-primary mt-2 sm:mt-3">
                  +R$ {business.monthlyRecurrence?.toLocaleString()}/mês
                </p>
              </div>
            </div>
          )}

          {/* AI Description */}
          {business.aiDescription && (
            <div className="p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs sm:text-sm flex items-start gap-2 sm:gap-2.5">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-primary">{business.aiDescription}</span>
              </p>
            </div>
          )}

          {/* AI Analysis */}
          <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs sm:text-sm flex items-start gap-2 sm:gap-2.5">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                {business.name?.toLowerCase().includes('sem') ? 'sem presença digital' : 'análise disponível'} — oportunidade máxima
              </span>
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-medium text-foreground">Informações de Contato</h4>
            
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span className="truncate">{business.address}</span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              Serviços Recomendados
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
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