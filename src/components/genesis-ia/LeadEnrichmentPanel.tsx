import { useState } from 'react';
import { 
  Mail, Phone, Globe, Shield, AlertTriangle, CheckCircle2, XCircle,
  Megaphone, Target, TrendingUp, Zap, Lightbulb, DollarSign,
  ChevronDown, ChevronUp, Loader2, BarChart3, Users, Clock,
  MessageCircle, RefreshCw, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EnrichedLeadData } from '@/hooks/useLeadEnrichment';

interface LeadEnrichmentPanelProps {
  data: EnrichedLeadData | null;
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

// Seção colapsável
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  badge,
  badgeVariant = 'default'
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive';
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const badgeClasses = {
    default: 'bg-white/10 text-white/70 border-white/20',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
          {badge && (
            <Badge variant="outline" className={cn("text-xs", badgeClasses[badgeVariant])}>
              {badge}
            </Badge>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pt-0 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}

// Indicador de status
function StatusIndicator({ 
  status, 
  label, 
  sublabel 
}: { 
  status: 'success' | 'warning' | 'error' | 'neutral'; 
  label: string;
  sublabel?: string;
}) {
  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
    neutral: Info,
  };
  const colors = {
    success: 'text-emerald-400',
    warning: 'text-orange-400',
    error: 'text-red-400',
    neutral: 'text-muted-foreground',
  };
  const Icon = icons[status];

  return (
    <div className="flex items-center gap-2 py-1">
      <Icon className={cn("w-4 h-4", colors[status])} />
      <div>
        <span className="text-sm">{label}</span>
        {sublabel && <span className="text-xs text-muted-foreground ml-1">({sublabel})</span>}
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Analisando lead...</span>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-20 w-full bg-white/10" />
        <Skeleton className="h-16 w-full bg-white/10" />
        <Skeleton className="h-16 w-full bg-white/10" />
      </div>
    </div>
  );
}

export function LeadEnrichmentPanel({ data, isLoading, error, onRefresh }: LeadEnrichmentPanelProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Erro na análise</span>
        </div>
        <p className="text-xs text-red-300/70 mt-1">{error}</p>
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            className="mt-2 text-red-400 hover:text-red-300"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
        <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Clique em "Analisar" para obter dados enriquecidos</p>
      </div>
    );
  }

  const { validation, websiteHealth, adsAnalysis, scoring } = data;

  return (
    <div className="space-y-3">
      {/* Score Header */}
      {scoring && (
        <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/20 to-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold",
                  scoring.opportunityLevel === 'hot' && "bg-red-500/30 text-red-400 ring-2 ring-red-500/50",
                  scoring.opportunityLevel === 'warm' && "bg-orange-500/30 text-orange-400 ring-2 ring-orange-500/50",
                  scoring.opportunityLevel === 'cool' && "bg-blue-500/30 text-blue-400 ring-2 ring-blue-500/50",
                  scoring.opportunityLevel === 'cold' && "bg-gray-500/30 text-gray-400 ring-2 ring-gray-500/50",
                )}>
                  {scoring.opportunityScore}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Score de Oportunidade</span>
                  <Badge className={cn(
                    "uppercase text-[10px]",
                    scoring.opportunityLevel === 'hot' && "bg-red-500/20 text-red-400 border-red-500/30",
                    scoring.opportunityLevel === 'warm' && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                    scoring.opportunityLevel === 'cool' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    scoring.opportunityLevel === 'cold' && "bg-gray-500/20 text-gray-400 border-gray-500/30",
                  )}>
                    {scoring.opportunityLevel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{scoring.digitalPresenceStatus}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Valor estimado</p>
              <p className="text-sm font-semibold text-emerald-400">
                R$ {scoring.estimatedValueMin?.toLocaleString()} - R$ {scoring.estimatedValueMax?.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                + R$ {scoring.monthlyRecurrence?.toLocaleString()}/mês
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validação de Contatos */}
      <CollapsibleSection
        title="Contatos Validados"
        icon={Phone}
        badge={validation?.phone?.hasWhatsapp ? 'WhatsApp ✓' : undefined}
        badgeVariant={validation?.phone?.hasWhatsapp ? 'success' : 'default'}
      >
        <div className="pt-2 space-y-1">
          {validation?.email && (
            <StatusIndicator
              status={validation.email.isValid ? 'success' : 'error'}
              label={validation.email.isValid ? 'Email válido' : 'Email inválido'}
              sublabel={validation.email.provider || validation.email.domain}
            />
          )}
          {validation?.phone && (
            <>
              <StatusIndicator
                status={validation.phone.isValid ? 'success' : 'error'}
                label={validation.phone.isValid ? 'Telefone válido' : 'Telefone inválido'}
                sublabel={validation.phone.formatted}
              />
              <StatusIndicator
                status={validation.phone.isMobile ? 'success' : 'neutral'}
                label={validation.phone.isMobile ? 'Celular' : 'Fixo'}
                sublabel={validation.phone.carrier || undefined}
              />
              <StatusIndicator
                status={validation.phone.hasWhatsapp ? 'success' : 'warning'}
                label={validation.phone.hasWhatsapp ? 'WhatsApp disponível' : 'WhatsApp não confirmado'}
              />
            </>
          )}
          {!validation?.email && !validation?.phone && (
            <p className="text-xs text-muted-foreground">Nenhum contato para validar</p>
          )}
        </div>
      </CollapsibleSection>

      {/* Saúde do Website */}
      {websiteHealth && (
        <CollapsibleSection
          title="Saúde do Website"
          icon={Globe}
          badge={websiteHealth.healthStatus}
          badgeVariant={
            websiteHealth.healthStatus === 'healthy' ? 'success' :
            websiteHealth.healthStatus === 'issues' ? 'warning' :
            websiteHealth.healthStatus === 'offline' ? 'destructive' : 'warning'
          }
        >
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Health Score</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      websiteHealth.healthScore >= 70 ? "bg-emerald-500" :
                      websiteHealth.healthScore >= 40 ? "bg-orange-500" : "bg-red-500"
                    )}
                    style={{ width: `${websiteHealth.healthScore}%` }}
                  />
                </div>
                <span className="font-medium">{websiteHealth.healthScore}%</span>
              </div>
            </div>
            
            <StatusIndicator
              status={websiteHealth.isAccessible ? 'success' : 'error'}
              label={websiteHealth.isAccessible ? 'Online' : 'Offline'}
              sublabel={websiteHealth.responseTimeMs ? `${websiteHealth.responseTimeMs}ms` : undefined}
            />
            
            <StatusIndicator
              status={websiteHealth.hasSsl && websiteHealth.sslValid ? 'success' : websiteHealth.hasSsl ? 'warning' : 'error'}
              label={websiteHealth.hasSsl ? (websiteHealth.sslValid ? 'SSL válido' : 'SSL com problemas') : 'Sem SSL'}
            />
            
            {websiteHealth.cmsDetected && (
              <StatusIndicator
                status="neutral"
                label={`CMS: ${websiteHealth.cmsDetected}`}
              />
            )}
            
            {websiteHealth.technologies && websiteHealth.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {websiteHealth.technologies.slice(0, 5).map((tech, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] bg-white/5">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Análise de Anúncios */}
      {adsAnalysis && (
        <CollapsibleSection
          title="Anúncios Ativos"
          icon={Megaphone}
          badge={adsAnalysis.overallAdStatus === 'active' ? 'Investindo' : 
                 adsAnalysis.overallAdStatus === 'paused_recently' ? 'Pausado' : 
                 'Não detectado'}
          badgeVariant={adsAnalysis.overallAdStatus === 'active' ? 'success' : 
                       adsAnalysis.overallAdStatus === 'paused_recently' ? 'warning' : 'default'}
        >
          <div className="pt-2 space-y-2">
            {/* Meta Ads */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-400">f</span>
                </div>
                <span className="text-sm">Meta Ads</span>
              </div>
              <div className="flex items-center gap-2">
                {adsAnalysis.metaPixelDetected && (
                  <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30">
                    Pixel ✓
                  </Badge>
                )}
                <StatusIndicator
                  status={adsAnalysis.hasMetaAds || adsAnalysis.metaPixelDetected ? 'success' : 'neutral'}
                  label={adsAnalysis.hasMetaAds ? 'Ativo' : adsAnalysis.metaPixelDetected ? 'Pixel detectado' : 'Não detectado'}
                />
              </div>
            </div>
            
            {/* Google Ads */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-400">G</span>
                </div>
                <span className="text-sm">Google Ads</span>
              </div>
              <div className="flex items-center gap-2">
                {adsAnalysis.googleTagDetected && (
                  <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/30">
                    Tag ✓
                  </Badge>
                )}
                <StatusIndicator
                  status={adsAnalysis.hasGoogleAds || adsAnalysis.googleTagDetected ? 'success' : 'neutral'}
                  label={adsAnalysis.hasGoogleAds ? 'Ativo' : adsAnalysis.googleTagDetected ? 'Tag detectado' : 'Não detectado'}
                />
              </div>
            </div>
            
            {/* Indicadores */}
            {(adsAnalysis.hasMetaAds || adsAnalysis.hasGoogleAds || adsAnalysis.metaPixelDetected || adsAnalysis.googleTagDetected) && (
              <div className="pt-2 flex flex-wrap gap-2">
                {adsAnalysis.investmentIndicator && adsAnalysis.investmentIndicator !== 'unknown' && (
                  <Badge variant="outline" className="text-[10px]">
                    {adsAnalysis.investmentIndicator === 'recurring' ? '💰 Recorrente' : 
                     adsAnalysis.investmentIndicator === 'sporadic' ? '📊 Esporádico' : 
                     '🚫 Sem investimento'}
                  </Badge>
                )}
                {adsAnalysis.campaignTypes?.map((type, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] bg-white/5">
                    {type}
                  </Badge>
                ))}
              </div>
            )}
            
            {!adsAnalysis.hasMetaAds && !adsAnalysis.hasGoogleAds && !adsAnalysis.metaPixelDetected && !adsAnalysis.googleTagDetected && (
              <div className="text-xs text-orange-400 bg-orange-500/10 rounded-lg p-2 mt-2">
                💡 Não investe em tráfego pago — oportunidade para oferecer serviços de marketing
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Análise IA */}
      {scoring && (
        <CollapsibleSection
          title="Análise Inteligente"
          icon={Lightbulb}
          badge={scoring.aiAnalysis?.urgencyLevel === 'high' ? 'Urgente' : undefined}
          badgeVariant={scoring.aiAnalysis?.urgencyLevel === 'high' ? 'destructive' : 'default'}
        >
          <div className="pt-2 space-y-3">
            {/* Pain Points */}
            {scoring.painPoints && scoring.painPoints.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-400 mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Dores identificadas
                </p>
                <ul className="space-y-1">
                  {scoring.painPoints.map((pain, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">•</span>
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Serviços Recomendados */}
            {scoring.recommendedServices && scoring.recommendedServices.length > 0 && (
              <div>
                <p className="text-xs font-medium text-emerald-400 mb-1.5 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Serviços recomendados
                </p>
                <div className="flex flex-wrap gap-1">
                  {scoring.recommendedServices.map((service, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pitch Sugerido */}
            {scoring.suggestedPitch && (
              <div>
                <p className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Pitch sugerido
                </p>
                <div className="text-xs bg-primary/10 border border-primary/20 rounded-lg p-2 text-muted-foreground italic">
                  "{scoring.suggestedPitch}"
                </div>
              </div>
            )}
            
            {/* SWOT simplificado */}
            {scoring.aiAnalysis && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {scoring.aiAnalysis.strengths && scoring.aiAnalysis.strengths.length > 0 && (
                  <div className="text-[10px] bg-emerald-500/10 rounded p-1.5">
                    <span className="text-emerald-400 font-medium">Forças:</span>
                    <ul className="text-muted-foreground mt-0.5">
                      {scoring.aiAnalysis.strengths.slice(0, 2).map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {scoring.aiAnalysis.opportunities && scoring.aiAnalysis.opportunities.length > 0 && (
                  <div className="text-[10px] bg-blue-500/10 rounded p-1.5">
                    <span className="text-blue-400 font-medium">Oportunidades:</span>
                    <ul className="text-muted-foreground mt-0.5">
                      {scoring.aiAnalysis.opportunities.slice(0, 2).map((o, i) => (
                        <li key={i}>• {o}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
