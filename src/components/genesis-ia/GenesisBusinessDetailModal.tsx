import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Globe, Star, Building2, 
  ExternalLink, Copy, Check, Navigation, Users,
  MessageCircle, Zap, Calendar, FileText, ShoppingBag,
  DollarSign, TrendingUp, Sparkles
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
  basic: { label: 'Básico', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  advanced: { label: 'Avançado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
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
      <DialogContent className="max-w-[560px] w-[95vw] p-0 gap-0 overflow-hidden bg-[hsl(220,20%,8%)] border-white/10">
        {/* Header - Genesis Style */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/10 bg-white/5">
          <DialogTitle className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">{business.name}</h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {levelConfig && (
                  <Badge variant="outline" className={cn("text-[11px] py-0", levelConfig.color)}>
                    {levelConfig.label}
                  </Badge>
                )}
                {hasWebsite ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] py-0">
                    <Globe className="w-3 h-3 mr-1" /> Com Site
                  </Badge>
                ) : (
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-[11px] py-0">
                    <Globe className="w-3 h-3 mr-1" /> Sem Site
                  </Badge>
                )}
                {business.rating && (
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[11px] py-0">
                    <Star className="w-3 h-3 mr-1" /> {business.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Value Box - Genesis Style */}
          {business.estimatedValueMin && business.estimatedValueMax && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3" /> Valor Estimado
                </p>
                <p className="text-lg font-bold text-primary">
                  R$ {business.estimatedValueMin.toLocaleString()} - {business.estimatedValueMax.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3" /> Recorrência
                </p>
                <p className="text-lg font-bold text-emerald-400">
                  +R$ {business.monthlyRecurrence?.toLocaleString()}/mês
                </p>
              </div>
            </div>
          )}

          {/* Services */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">O que você pode oferecer:</p>
            <div className="flex flex-wrap gap-1.5">
              {business.needsWebsite && (
                <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                  <Globe className="w-3 h-3 mr-1" /> Site
                </Badge>
              )}
              {business.needsScheduling && (
                <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                  <Calendar className="w-3 h-3 mr-1" /> Agendamentos
                </Badge>
              )}
              {business.needsCRM && (
                <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                  <Users className="w-3 h-3 mr-1" /> CRM
                </Badge>
              )}
              {business.needsMarketing && (
                <Badge variant="secondary" className="text-xs bg-pink-500/10 text-pink-500 border-pink-500/20">
                  <FileText className="w-3 h-3 mr-1" /> Marketing
                </Badge>
              )}
              {business.needsEcommerce && (
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                  <ShoppingBag className="w-3 h-3 mr-1" /> E-commerce
                </Badge>
              )}
              {business.needsChatbot && (
                <Badge variant="secondary" className="text-xs bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                  <MessageCircle className="w-3 h-3 mr-1" /> Chatbot
                </Badge>
              )}
            </div>
          </div>

          {/* AI Description - Genesis Style */}
          {business.aiDescription && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{business.aiDescription}</span>
              </p>
            </div>
          )}

          {/* Contact Info - Genesis Style */}
          <div className="space-y-2">
            {/* Address */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm flex-1">{business.address}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 hover:bg-white/10"
                onClick={() => copyToClipboard(business.address, 'address')}
              >
                {copiedField === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {/* Phone */}
            {business.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm flex-1">{business.phone}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-white/10"
                  onClick={() => copyToClipboard(business.phone!, 'phone')}
                >
                  {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  onClick={openWhatsApp}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {/* Coordinates */}
            {business.latitude && business.longitude && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                <Navigation className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground flex-1">
                  {business.latitude.toFixed(4)}, {business.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Google Place - Genesis Style */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <img 
              src="https://www.google.com/images/branding/product/1x/maps_32dp.png" 
              alt="Google Maps" 
              className="w-5 h-5 shrink-0"
            />
            <span className="text-sm flex-1 truncate">{business.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-blue-500/20"
              onClick={() => copyToClipboard(googlePlaceUrl, 'googlePlace')}
            >
              {copiedField === 'googlePlace' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-blue-500/20"
              onClick={() => window.open(googlePlaceUrl, '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Generated Message - Genesis Style */}
          {business.generatedMessage && (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                  Mensagem Gerada
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1 hover:bg-white/10"
                  onClick={() => copyToClipboard(business.generatedMessage!, 'message')}
                >
                  {copiedField === 'message' ? (
                    <><Check className="w-3 h-3 text-emerald-400" /> Copiado</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copiar</>
                  )}
                </Button>
              </div>
              <div className="p-3 max-h-24 overflow-y-auto bg-white/[0.02]">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {business.generatedMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Genesis Style */}
        <div className="px-5 py-4 border-t border-white/10 bg-white/5 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => {
              onAcceptProject();
              onOpenChange(false);
            }}
          >
            <Zap className="w-4 h-4" />
            Aceitar Projeto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
