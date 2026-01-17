import { 
  X, 
  Globe, 
  Phone, 
  MapPin, 
  Star, 
  Clock,
  Moon,
  TrendingUp,
  Calendar,
  Users,
  MessageSquare,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  ExternalLink,
  DollarSign,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BusinessMarker } from './types';
import { cn } from '@/lib/utils';

interface MarkerDetailPanelProps {
  marker: BusinessMarker | null;
  onClose: () => void;
  onAddProspect?: (marker: BusinessMarker) => void;
}

export const MarkerDetailPanel = ({ marker, onClose, onAddProspect }: MarkerDetailPanelProps) => {
  if (!marker) return null;

  const getStatusInfo = () => {
    switch (marker.status) {
      case 'critical':
        return { label: 'Alta Oportunidade', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'warning':
        return { label: 'Média Oportunidade', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      case 'good':
        return { label: 'Baixa Oportunidade', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    }
  };

  const statusInfo = getStatusInfo();

  const features = [
    { key: 'website', label: 'Website', has: marker.hasWebsite, icon: Globe },
    { key: 'scheduling', label: 'Agendamento', has: marker.hasScheduling, icon: Calendar },
    { key: 'crm', label: 'CRM/Gestão', has: marker.hasCRM, icon: Users },
    { key: 'online', label: 'Presença Online', has: marker.hasOnlinePresence, icon: TrendingUp },
  ];

  return (
    <div className="absolute top-4 right-4 z-10 bg-background/95 backdrop-blur-md border border-border rounded-xl p-5 shadow-2xl w-80 animate-in slide-in-from-right-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-2">
          <h3 className="font-bold text-lg leading-tight">{marker.name}</h3>
          <p className="text-sm text-muted-foreground">{marker.category}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mr-2 -mt-1">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Status Badge */}
      <div className={cn("rounded-lg p-3 mb-4", statusInfo.bg, statusInfo.border, "border")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={cn("w-5 h-5", statusInfo.color)} />
            <span className={cn("font-semibold", statusInfo.color)}>{statusInfo.label}</span>
          </div>
          <Badge variant="outline" className={cn("font-bold", statusInfo.color)}>
            {marker.opportunityScore}%
          </Badge>
        </div>
        <Progress 
          value={marker.opportunityScore} 
          className="h-2 mt-2" 
        />
      </div>

      {/* Night Business / Open Status */}
      <div className="flex gap-2 mb-4">
        {marker.isNightBusiness && (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30">
            <Moon className="w-3 h-3 mr-1" /> Negócio Noturno
          </Badge>
        )}
        <Badge className={cn(
          marker.isOpenNow 
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
        )}>
          <Clock className="w-3 h-3 mr-1" />
          {marker.isOpenNow ? 'Aberto' : 'Fechado'}
        </Badge>
      </div>

      {/* Estimated Value */}
      {marker.estimatedValue && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor Estimado</span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="font-bold text-lg text-primary">
                R$ {marker.estimatedValue.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {marker.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">{marker.address}</span>
          </div>
        )}
        {marker.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{marker.phone}</span>
          </div>
        )}
        {marker.rating && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{marker.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Features Check */}
      <div className="space-y-2 mb-4 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
          Análise Digital
        </p>
        <div className="grid grid-cols-2 gap-2">
          {features.map(({ key, label, has, icon: Icon }) => (
            <div 
              key={key}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-xs",
                has ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}
            >
              {has ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border/50">
        <Button 
          className="flex-1 gap-2"
          onClick={() => onAddProspect?.(marker)}
        >
          <TrendingUp className="w-4 h-4" />
          Adicionar Prospect
        </Button>
        <Button variant="outline" size="icon">
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
