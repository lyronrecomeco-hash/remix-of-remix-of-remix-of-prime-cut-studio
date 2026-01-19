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
      <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Building2 className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate">{business.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Top Section: Badges + Value in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-1.5 items-start">
              {levelConfig && (
                <Badge variant="outline" className={cn("text-xs", levelConfig.color)}>
                  {levelConfig.label}
                </Badge>
              )}
              {hasWebsite ? (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Sem Site
                </Badge>
              )}
              {business.rating && (
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  {business.rating.toFixed(1)}
                </Badge>
              )}
              {business.reviews_count && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {business.reviews_count}
                </Badge>
              )}
            </div>

            {/* Valor Estimado */}
            {business.estimatedValueMin && business.estimatedValueMax && (
              <div className="flex gap-4 p-2.5 rounded-lg bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-border/50">
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                    <DollarSign className="w-3 h-3" /> VALOR
                  </div>
                  <div className="text-sm font-bold text-primary">
                    R$ {business.estimatedValueMin} - {business.estimatedValueMax}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                    <TrendingUp className="w-3 h-3" /> RECORRÊNCIA
                  </div>
                  <div className="text-sm font-bold text-emerald-500">
                    +R$ {business.monthlyRecurrence}/mês
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Services + AI Description in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* O que você pode oferecer */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">O que você pode oferecer:</p>
              <div className="flex flex-wrap gap-1">
                {business.needsWebsite && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5 bg-orange-500/10 text-orange-500 border-orange-500/20 py-0.5 px-1.5">
                    <Globe className="w-2.5 h-2.5" /> Site
                  </Badge>
                )}
                {business.needsScheduling && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5 bg-blue-500/10 text-blue-500 border-blue-500/20 py-0.5 px-1.5">
                    <Calendar className="w-2.5 h-2.5" /> Agendamentos
                  </Badge>
                )}
                {business.needsCRM && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5 bg-purple-500/10 text-purple-500 border-purple-500/20 py-0.5 px-1.5">
                    <Users className="w-2.5 h-2.5" /> CRM
                  </Badge>
                )}
                {business.needsMarketing && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5 bg-pink-500/10 text-pink-500 border-pink-500/20 py-0.5 px-1.5">
                    <FileText className="w-2.5 h-2.5" /> Marketing
                  </Badge>
                )}
                {business.needsEcommerce && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5 bg-green-500/10 text-green-500 border-green-500/20 py-0.5 px-1.5">
                    <ShoppingBag className="w-2.5 h-2.5" /> E-commerce
                  </Badge>
                )}
                {business.needsChatbot && (
                  <Badge variant="secondary" className="text-[10px] gap-0.5 bg-cyan-500/10 text-cyan-500 border-cyan-500/20 py-0.5 px-1.5">
                    <MessageCircle className="w-2.5 h-2.5" /> Chatbot
                  </Badge>
                )}
              </div>
            </div>

            {/* AI Description */}
            {business.aiDescription && (
              <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-3">{business.aiDescription}</span>
                </p>
              </div>
            )}
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/30 rounded-lg p-3">
            {/* Endereço */}
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-xs flex-1 truncate">{business.address}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => copyToClipboard(business.address, 'address')}
              >
                {copiedField === 'address' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>

            {/* Telefone */}
            {business.phone && (
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-xs flex-1">{business.phone}</p>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(business.phone!, 'phone')}>
                    {copiedField === 'phone' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500" onClick={openWhatsApp}>
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Website */}
            {business.website && (
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                <a 
                  href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex-1 truncate"
                >
                  {business.website}
                </a>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(business.website!, 'website')}>
                  {copiedField === 'website' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            )}

            {/* Coordenadas */}
            {business.latitude && business.longitude && (
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                <Navigation className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground flex-1">
                  {business.latitude.toFixed(4)}, {business.longitude.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          {/* Google Maps Link + Actions Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Google Place Link */}
            <div className="flex-1 flex items-center gap-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <img 
                src="https://www.google.com/images/branding/product/1x/maps_32dp.png" 
                alt="Google Maps" 
                className="w-4 h-4 shrink-0"
              />
              <span className="text-xs flex-1 truncate">{business.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(googlePlaceUrl, 'googlePlace')}>
                {copiedField === 'googlePlace' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(googlePlaceUrl, '_blank')}>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Mensagem Gerada */}
          {business.generatedMessage && (
            <div className="bg-muted/50 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                  Mensagem Gerada
                </p>
                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => copyToClipboard(business.generatedMessage!, 'message')}>
                  {copiedField === 'message' ? <><Check className="w-3 h-3 text-green-500" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground whitespace-pre-wrap max-h-20 overflow-y-auto">
                {business.generatedMessage}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => {
                onAcceptProject();
                onOpenChange(false);
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              Aceitar Projeto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
