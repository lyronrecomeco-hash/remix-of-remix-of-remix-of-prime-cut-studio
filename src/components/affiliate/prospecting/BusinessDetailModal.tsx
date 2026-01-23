import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Globe, Star, Clock, Building2, 
  ExternalLink, Copy, Check, Navigation, Users,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface BusinessResult {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
  opening_hours?: string;
  place_id?: string;
  latitude?: number;
  longitude?: number;
}

interface BusinessDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: BusinessResult | null;
  onAddProspect: () => void;
  isAdding: boolean;
}

export const BusinessDetailModal = ({
  open,
  onOpenChange,
  business,
  onAddProspect,
  isAdding
}: BusinessDetailModalProps) => {
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
  const hasOnlinePresence = hasWebsite || (business.rating && business.rating > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 bg-[hsl(220,20%,8%)] border-white/10">
        {/* Header - Genesis Style */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/10 bg-white/5">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-semibold">{business.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Status Badges - Genesis Style */}
          <div className="flex flex-wrap gap-2">
            {hasWebsite ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                <Globe className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                <Globe className="w-3 h-3 mr-1" />
                Sem Site
              </Badge>
            )}
            {business.rating && (
              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                <Star className="w-3 h-3 mr-1" />
                {business.rating.toFixed(1)}
              </Badge>
            )}
            {business.reviews_count && (
              <Badge variant="secondary" className="bg-white/5 border-white/10">
                <Users className="w-3 h-3 mr-1" />
                {business.reviews_count} avaliações
              </Badge>
            )}
            {business.category && (
              <Badge variant="outline" className="border-white/10">{business.category}</Badge>
            )}
          </div>

          {/* Informações Detalhadas - Genesis Style */}
          <div className="space-y-2">
            {/* Endereço */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="text-sm truncate">{business.address}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-white/10"
                onClick={() => copyToClipboard(business.address, 'address')}
              >
                {copiedField === 'address' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Telefone */}
            {business.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm">{business.phone}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 hover:bg-white/10"
                    onClick={() => copyToClipboard(business.phone!, 'phone')}
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    onClick={openWhatsApp}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Website */}
            {business.website && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Website</p>
                  <a 
                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate block"
                  >
                    {business.website}
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 hover:bg-white/10"
                  onClick={() => copyToClipboard(business.website!, 'website')}
                >
                  {copiedField === 'website' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Coordenadas */}
            {business.latitude && business.longitude && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <Navigation className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Coordenadas</p>
                  <p className="text-sm text-muted-foreground">
                    {business.latitude.toFixed(6)}, {business.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Link do Google Place - Genesis Style */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <img 
              src="https://www.google.com/images/branding/product/1x/maps_32dp.png" 
              alt="Google Maps" 
              className="w-5 h-5 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Google Maps</p>
              <p className="text-xs text-muted-foreground truncate">{business.name}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(googlePlaceUrl, 'googlePlace')}
                className="h-7 px-2 hover:bg-blue-500/20"
              >
                {copiedField === 'googlePlace' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(googlePlaceUrl, '_blank')}
                className="h-7 px-2 hover:bg-blue-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
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
            onClick={onAddProspect}
            disabled={isAdding}
          >
            {isAdding ? 'Adicionando...' : '+ Adicionar aos Prospectos'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
