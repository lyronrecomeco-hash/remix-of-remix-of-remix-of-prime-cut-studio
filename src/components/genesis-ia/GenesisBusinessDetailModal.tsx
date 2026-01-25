import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Globe, Star, Building2, 
  ExternalLink, Copy, Check, Navigation, Users,
  MessageCircle, Zap, Calendar, FileText, ShoppingBag,
  DollarSign, TrendingUp, Sparkles, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SearchResult {
  name: string;
  address: string;
  phone?: string;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] w-[95vw] p-0 gap-0 overflow-hidden bg-[hsl(222,20%,8%)] border-white/10">
        {/* Header - Standardized Genesis Style */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/10">
          <DialogTitle className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground">{business.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{business.category || business.niche || 'Empresa'}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {levelConfig && (
                  <Badge variant="outline" className={cn("text-xs py-0.5 px-2", levelConfig.color)}>
                    {levelConfig.label}
                  </Badge>
                )}
                {business.rating && (
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-xs py-0.5 px-2">
                    Score: {Math.round(business.rating * 10)}%
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Value Box - Standardized */}
          {business.estimatedValueMin && business.estimatedValueMax && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-primary" /> VALOR ESTIMADO
                </p>
                <p className="text-sm text-muted-foreground">Min: R$ {business.estimatedValueMin.toLocaleString()}</p>
                <p className="text-xl font-bold text-primary mt-1">
                  R$ {business.estimatedValueMax.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" /> RECORRÊNCIA MENSAL
                </p>
                <p className="text-xl font-bold text-primary mt-3">
                  +R$ {business.monthlyRecurrence?.toLocaleString()}/mês
                </p>
              </div>
            </div>
          )}

          {/* AI Description - Highlighted */}
          {business.aiDescription && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-primary">{business.aiDescription}</span>
              </p>
            </div>
          )}

          {/* AI Analysis */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                {business.name?.toLowerCase().includes('sem') ? 'sem presença digital' : 'análise disponível'} — oportunidade máxima
              </span>
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Informações de Contato</h4>
            
            {/* Address */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <span>{business.address}</span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Serviços Recomendados
            </h4>
            <div className="flex flex-wrap gap-2">
              {business.needsWebsite && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-foreground border-white/20">
                  website
                </Badge>
              )}
              {business.needsChatbot && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-foreground border-white/20">
                  automation
                </Badge>
              )}
              {business.needsScheduling && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-foreground border-white/20">
                  WhatsApp
                </Badge>
              )}
              {business.needsCRM && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-foreground border-white/20">
                  CRM
                </Badge>
              )}
              {business.needsMarketing && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-foreground border-white/20">
                  marketing
                </Badge>
              )}
              {business.needsEcommerce && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-foreground border-white/20">
                  e-commerce
                </Badge>
              )}
            </div>
          </div>

          {/* Region & Date */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Região: {business.address?.split(',').pop()?.trim() || 'N/A'}
            </span>
            <span className="flex items-center gap-1.5">
              📅 Encontrado: {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Google Place Link */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-sm"
              onClick={() => window.open(googlePlaceUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Pesquisar no Google
            </Button>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="px-6 py-5 border-t border-white/10 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            Rejeitar
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            Salvar
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => {
              onAcceptProject();
              onOpenChange(false);
            }}
          >
            Aceitar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};