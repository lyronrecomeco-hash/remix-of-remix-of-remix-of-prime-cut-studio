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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            {business.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {hasWebsite ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                <Globe className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                <Globe className="w-3 h-3 mr-1" />
                Sem Site
              </Badge>
            )}
            {business.rating && (
              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                <Star className="w-3 h-3 mr-1" />
                {business.rating.toFixed(1)}
              </Badge>
            )}
            {business.reviews_count && (
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {business.reviews_count} avaliações
              </Badge>
            )}
            {business.category && (
              <Badge variant="outline">{business.category}</Badge>
            )}
          </div>

          {/* Informações Detalhadas */}
          <div className="space-y-3 bg-muted/30 rounded-lg p-4">
            {/* Endereço */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                <p className="text-sm">{business.address}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => copyToClipboard(business.address, 'address')}
              >
                {copiedField === 'address' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Telefone */}
            {business.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-sm">{business.phone}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(business.phone!, 'phone')}
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-green-500 hover:text-green-600"
                    onClick={openWhatsApp}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Website */}
            {business.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <a 
                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {business.website}
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copyToClipboard(business.website!, 'website')}
                >
                  {copiedField === 'website' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Coordenadas */}
            {business.latitude && business.longitude && (
              <div className="flex items-start gap-3">
                <Navigation className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Coordenadas</p>
                  <p className="text-sm text-muted-foreground">
                    {business.latitude.toFixed(6)}, {business.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Link do Google Place */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium flex items-center gap-2">
                  <img 
                    src="https://www.google.com/images/branding/product/1x/maps_32dp.png" 
                    alt="Google Maps" 
                    className="w-4 h-4"
                  />
                  Google Maps / Place
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {googlePlaceUrl}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(googlePlaceUrl, 'googlePlace')}
                  className="gap-1.5"
                >
                  {copiedField === 'googlePlace' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(googlePlaceUrl, '_blank')}
                  className="gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir
                </Button>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={onAddProspect}
              disabled={isAdding}
            >
              {isAdding ? (
                'Adicionando...'
              ) : (
                '+ Adicionar aos Prospectos'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
