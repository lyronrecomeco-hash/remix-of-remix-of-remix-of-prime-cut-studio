import { useState } from 'react';
import { 
  Building2, 
  Globe, 
  Phone, 
  MapPin, 
  Star, 
  TrendingUp, 
  Zap,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  DollarSign,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface EnrichedBusiness {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  niche?: string;
  city?: string;
  state?: string;
  // Dados enriquecidos
  opportunityScore?: number;
  opportunityLevel?: 'basic' | 'intermediate' | 'advanced';
  estimatedValueMin?: number;
  estimatedValueMax?: number;
  monthlyRecurrence?: number;
  digitalPresenceStatus?: string;
  serviceTags?: string[];
  aiDescription?: string;
  painPoints?: string[];
  missingFeatures?: string[];
  // Estado
  isEnriching?: boolean;
  isEnriched?: boolean;
}

interface PremiumProspectCardProps {
  business: EnrichedBusiness;
  onAcceptProject: (business: EnrichedBusiness) => Promise<void>;
  onEnrich?: (business: EnrichedBusiness) => Promise<EnrichedBusiness>;
  isAdding?: boolean;
  isAdded?: boolean;
}

const LEVEL_CONFIG = {
  basic: {
    label: 'Básico',
    color: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
    icon: '🔵',
  },
  intermediate: {
    label: 'Intermediário',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    icon: '🟡',
  },
  advanced: {
    label: 'Avançado',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    icon: '🟢',
  },
};

const NICHE_ICONS: Record<string, string> = {
  'barbearia': '💈',
  'salao': '💇',
  'salão': '💇',
  'clinica': '🏥',
  'clínica': '🏥',
  'dentista': '🦷',
  'restaurante': '🍽️',
  'pizzaria': '🍕',
  'academia': '🏋️',
  'petshop': '🐕',
  'hotel': '🏨',
  'pousada': '🛏️',
  'imobiliária': '🏠',
  'advocacia': '⚖️',
  'contabilidade': '📊',
  'oficina': '🔧',
  'loja': '🛍️',
  'escola': '📚',
  'default': '🏢',
};

function getNicheIcon(niche?: string): string {
  if (!niche) return NICHE_ICONS['default'];
  const key = niche.toLowerCase();
  for (const [k, v] of Object.entries(NICHE_ICONS)) {
    if (key.includes(k)) return v;
  }
  return NICHE_ICONS['default'];
}

export const PremiumProspectCard = ({
  business,
  onAcceptProject,
  onEnrich,
  isAdding,
  isAdded,
}: PremiumProspectCardProps) => {
  const [enriching, setEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState<EnrichedBusiness | null>(
    business.isEnriched ? business : null
  );

  const handleEnrich = async () => {
    if (!onEnrich || enrichedData) return;
    
    setEnriching(true);
    try {
      const result = await onEnrich(business);
      setEnrichedData(result);
    } finally {
      setEnriching(false);
    }
  };

  const displayData = enrichedData || business;
  const levelConfig = displayData.opportunityLevel 
    ? LEVEL_CONFIG[displayData.opportunityLevel] 
    : null;

  const hasWebsite = !!business.website;
  const nicheIcon = getNicheIcon(business.niche);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      "border-2 hover:shadow-xl",
      displayData.opportunityLevel === 'advanced' && "border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent",
      displayData.opportunityLevel === 'intermediate' && "border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-transparent",
      displayData.opportunityLevel === 'basic' && "border-slate-300",
      !displayData.opportunityLevel && "border-border hover:border-primary/50",
      isAdded && "opacity-50 pointer-events-none"
    )}>
      {/* Score Badge */}
      {displayData.opportunityScore && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className={cn(
            "px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1",
            displayData.opportunityScore >= 80 && "bg-emerald-500 text-white",
            displayData.opportunityScore >= 60 && displayData.opportunityScore < 80 && "bg-amber-500 text-white",
            displayData.opportunityScore < 60 && "bg-slate-400 text-white",
          )}>
            <TrendingUp className="w-3 h-3" />
            {displayData.opportunityScore}%
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
            {nicheIcon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate pr-16">
              {business.name}
            </h3>
            {business.address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                {business.address}
              </p>
            )}
          </div>
        </div>

        {/* Level & Value */}
        {levelConfig && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className={levelConfig.color}>
              {levelConfig.icon} {levelConfig.label}
            </Badge>
            
            {displayData.estimatedValueMin && displayData.estimatedValueMax && (
              <Badge variant="secondary" className="gap-1">
                <DollarSign className="w-3 h-3" />
                R$ {displayData.estimatedValueMin}~{displayData.estimatedValueMax}
              </Badge>
            )}
            
            {displayData.monthlyRecurrence && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 gap-1">
                <TrendingUp className="w-3 h-3" />
                +R$ {displayData.monthlyRecurrence}/mês
              </Badge>
            )}
          </div>
        )}

        {/* AI Description */}
        {displayData.aiDescription && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {displayData.aiDescription}
          </p>
        )}

        {/* Service Tags */}
        {displayData.serviceTags && displayData.serviceTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {displayData.serviceTags.map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs bg-background/50"
              >
                <Tag className="w-2.5 h-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Digital Presence Status */}
        {displayData.digitalPresenceStatus && (
          <div className={cn(
            "text-xs px-2.5 py-1.5 rounded-lg mb-3",
            displayData.digitalPresenceStatus.includes('máxima') && "bg-red-500/10 text-red-600",
            displayData.digitalPresenceStatus.includes('básica') && "bg-amber-500/10 text-amber-600",
            !displayData.digitalPresenceStatus.includes('máxima') && !displayData.digitalPresenceStatus.includes('básica') && "bg-slate-500/10 text-slate-600"
          )}>
            {!hasWebsite && <Globe className="w-3 h-3 inline mr-1" />}
            {displayData.digitalPresenceStatus}
          </div>
        )}

        {/* Contact Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          {business.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {business.phone}
            </span>
          )}
          {business.website && (
            <a 
              href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Site
            </a>
          )}
          {business.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" />
              {business.rating}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Botão Analisar (manual) - só aparece se não está enriquecido */}
          {onEnrich && !enrichedData && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnrich}
              disabled={enriching}
              className="gap-1.5"
            >
              {enriching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analisar
                </>
              )}
            </Button>
          )}
          
          {/* Botão Aceitar Projeto */}
          <Button
            size="sm"
            onClick={() => onAcceptProject(displayData)}
            disabled={isAdding || isAdded}
            className={cn(
              "gap-1.5 flex-1",
              displayData.opportunityLevel === 'advanced' && "bg-emerald-600 hover:bg-emerald-700",
              displayData.opportunityLevel === 'intermediate' && "bg-amber-600 hover:bg-amber-700",
            )}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Adicionando...
              </>
            ) : isAdded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Adicionado
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Aceitar Projeto
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
