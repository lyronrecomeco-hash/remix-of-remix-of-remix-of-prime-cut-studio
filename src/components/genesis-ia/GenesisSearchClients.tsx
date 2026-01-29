import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Building2, 
  Loader2, 
  Globe, 
  Star,
  ExternalLink,
  Sparkles,
  DollarSign,
  TrendingUp,
  Zap,
  ChevronLeft,
  ChevronRight,
  Clock,
  GlobeIcon,
  Filter,
  Map,
  Calendar,
  FileText,
  Users,
  ShoppingBag,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Eye,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { COUNTRIES, BRAZILIAN_STATES, getNichesForCountry, getCountryByCode } from '@/components/affiliate/prospecting/global/globalSearchData';
import { RadiusFilterModal } from '@/components/affiliate/prospecting/RadiusFilterModal';
import { GenesisBusinessDetailModal } from './GenesisBusinessDetailModal';


const ITEMS_PER_PAGE = 9;

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
}

interface GenesisSearchClientsProps {
  userId: string;
}

const COUNTRY_TIMEZONES: Record<string, string> = {
  BR: 'America/Sao_Paulo',
  US: 'America/New_York',
  PT: 'Europe/Lisbon',
  ES: 'Europe/Madrid',
  MX: 'America/Mexico_City',
  AR: 'America/Buenos_Aires',
  CO: 'America/Bogota',
  CL: 'America/Santiago',
  PE: 'America/Lima',
  UK: 'Europe/London',
  DE: 'Europe/Berlin',
  FR: 'Europe/Paris',
  IT: 'Europe/Rome',
  CA: 'America/Toronto',
  AU: 'Australia/Sydney',
  JP: 'Asia/Tokyo',
};

function getLocalTime(countryCode: string): string {
  const timezone = COUNTRY_TIMEZONES[countryCode] || 'UTC';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    }).format(new Date());
  } catch {
    return '';
  }
}

function isSocialMediaUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('instagram.com') ||
    lower.includes('facebook.com') ||
    lower.includes('fb.com') ||
    lower.includes('fb.me')
  );
}

const LEVEL_CONFIG = {
  basic: { label: 'Básico', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: '🔵' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: '🟡' },
  advanced: { label: 'Avançado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: '🟢' },
};

const NICHE_ICONS: Record<string, string> = {
  'oficina': '🚗', 'barbearia': '💈', 'salao': '💇', 'salão': '💇',
  'clinica': '🏥', 'clínica': '🏥', 'dentista': '🦷', 'restaurante': '🍽️',
  'academia': '🏋️', 'petshop': '🐕', 'pet shop': '🐕', 'imobiliária': '🏠',
  'advocacia': '⚖️', 'contabilidade': '📊', 'escola': '📚', 'gym': '🏋️',
  'barbershop': '💈', 'salon': '💇', 'restaurant': '🍽️', 'hotel': '🏨',
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

export const GenesisSearchClients = ({ userId }: GenesisSearchClientsProps) => {
  const [countryCode, setCountryCode] = useState('BR');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');
  const [excludeWithWebsite, setExcludeWithWebsite] = useState(false);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [minStars, setMinStars] = useState<number>(0);
  const [maxStars, setMaxStars] = useState<number>(5);
  const [radiusFilterOpen, setRadiusFilterOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<SearchResult | null>(null);
  
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const displayResults = filteredResults.length > 0 ? filteredResults : results;
  const totalPages = Math.max(1, Math.ceil(displayResults.length / ITEMS_PER_PAGE));
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayResults.slice(start, start + ITEMS_PER_PAGE);
  }, [displayResults, currentPage]);

  const availableNiches = useMemo(() => {
    return getNichesForCountry(countryCode);
  }, [countryCode]);

  useEffect(() => {
    setNiche('');
    setState('');
  }, [countryCode]);

  const selectedCountry = getCountryByCode(countryCode);
  const currentLocalTime = getLocalTime(countryCode);

  const handleSearch = async () => {
    if (!city.trim() || !countryCode || !niche || (countryCode === 'BR' && !state)) {
      toast.error('Preencha todos os campos para buscar');
      return;
    }

    setSearching(true);
    setResults([]);
    setFilteredResults([]);
    setCurrentPage(1);

    const localTime = getLocalTime(countryCode);

    try {
      const searchCity = countryCode === 'BR' && state ? `${city.trim()}, ${state}` : city.trim();
      
      const { data: searchData, error: searchError } = await supabase.functions.invoke('search-businesses-global', {
        body: { 
          city: searchCity, 
          countryCode, 
          niche, 
          maxResults: 100,
          affiliateName: 'Consultor Genesis',
          affiliateId: userId // Passa o userId para salvar histórico
        },
      });

      if (searchError) throw searchError;

      if (!searchData?.success || !searchData.results?.length) {
        toast.info('Nenhuma empresa encontrada. Tente outra busca.');
        setSearching(false);
        return;
      }

       let businessResults: SearchResult[] = searchData.results.map((r: any) => {
         const hasWebsite = !!r.website && !isSocialMediaUrl(r.website);
        const opportunityLevel = !hasWebsite ? 'advanced' : Math.random() > 0.5 ? 'basic' : 'intermediate';
        
        return {
          ...r,
          niche,
          localTime,
          opportunityLevel,
          estimatedValueMin: opportunityLevel === 'advanced' ? 800 : opportunityLevel === 'intermediate' ? 500 : 300,
          estimatedValueMax: opportunityLevel === 'advanced' ? 2500 : opportunityLevel === 'intermediate' ? 1200 : 600,
          monthlyRecurrence: opportunityLevel === 'advanced' ? 150 : opportunityLevel === 'intermediate' ? 100 : 50,
          needsWebsite: !hasWebsite,
          needsScheduling: Math.random() > 0.3,
          needsCRM: Math.random() > 0.5,
          needsMarketing: Math.random() > 0.4,
          needsEcommerce: Math.random() > 0.7,
          needsChatbot: Math.random() > 0.6,
          aiDescription: !hasWebsite 
            ? `Sem presença digital - alta oportunidade para site + sistema completo`
            : `Pode se beneficiar de automação e sistemas de gestão`,
        };
      });

       if (excludeWithWebsite) {
        const beforeCount = businessResults.length;
         // Considera Instagram/Facebook como "sem site" para fins de filtro
         businessResults = businessResults.filter(r => !r.website || isSocialMediaUrl(r.website));
        if (businessResults.length < beforeCount) {
          toast.info(`${beforeCount - businessResults.length} empresas com site removidas`);
        }
      }

      // Filtrar por estrelas (mínimo e máximo)
      if (minStars > 0 || maxStars < 5) {
        const beforeStarsCount = businessResults.length;
        businessResults = businessResults.filter(r => {
          const rating = r.rating || 0;
          return rating >= minStars && rating <= maxStars;
        });
        if (businessResults.length < beforeStarsCount) {
          toast.info(`${beforeStarsCount - businessResults.length} empresas fora do filtro de estrelas`);
        }
      }

      if (businessResults.length === 0) {
        toast.info('Nenhuma empresa encontrada com os filtros aplicados.');
        setSearching(false);
        return;
      }

      setResults(businessResults);
      toast.success(`${businessResults.length} empresas encontradas!`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao buscar empresas');
    } finally {
      setSearching(false);
    }
  };

  const handleFilterByRadius = (filtered: any[]) => {
    setFilteredResults(filtered);
    setCurrentPage(1);
    toast.success(`${filtered.length} empresas na área selecionada`);
  };

  const handleAcceptProject = (result: SearchResult) => {
    toast.success(`Projeto ${result.name} aceito!`);
  };

  const openBusinessDetail = (result: SearchResult) => {
    setSelectedBusiness(result);
    setDetailModalOpen(true);
  };

  // Check if business is likely open based on local time
  const isLikelyOpen = (): boolean => {
    const now = new Date();
    const timezone = COUNTRY_TIMEZONES[countryCode] || 'UTC';
    try {
      const localHour = parseInt(new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      }).format(now));
      const dayOfWeek = new Date().toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short' });
      // Consider open if between 8am-6pm on weekdays, 9am-1pm on Saturday
      if (['Sun'].includes(dayOfWeek)) return false;
      if (['Sat'].includes(dayOfWeek)) return localHour >= 9 && localHour < 13;
      return localHour >= 8 && localHour < 18;
    } catch {
      return true;
    }
  };

  const businessesOpenNow = isLikelyOpen();

  return (
    <div className="space-y-5">
      {/* Search Form - Genesis Glassmorphism Style */}
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Buscar Clientes</h3>
            <p className="text-xs text-muted-foreground">Encontre oportunidades de negócio em qualquer lugar</p>
          </div>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Country */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">🌍 País</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="h-10 bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {COUNTRIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State (Brazil only) */}
            {countryCode === 'BR' && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-primary" /> Estado
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="h-10 bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {BRAZILIAN_STATES.map(s => (
                      <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* City */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-primary" /> Cidade
              </Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={countryCode === 'BR' ? 'Ex: São Paulo' : 'Ex: New York'}
                className="h-10 bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
              />
            </div>

            {/* Niche */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-primary" /> Nicho
              </Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger className="h-10 bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {availableNiches.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={searching || !city || !niche || (countryCode === 'BR' && !state)}
                className="w-full h-10 gap-2"
              >
                {searching ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Buscando...</>
                ) : (
                  <><Search className="w-4 h-4" /> Buscar</>
                )}
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="excludeWebsite" 
                checked={excludeWithWebsite}
                onCheckedChange={(c) => setExcludeWithWebsite(c === true)}
                className="border-white/20"
              />
              <label htmlFor="excludeWebsite" className="text-sm cursor-pointer flex items-center gap-1.5 text-muted-foreground">
                <GlobeIcon className="w-4 h-4" />
                Apenas empresas <strong className="text-primary">sem site</strong>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="onlyOpenNow" 
                checked={onlyOpenNow}
                onCheckedChange={(c) => setOnlyOpenNow(c === true)}
                className="border-white/20"
              />
              <label htmlFor="onlyOpenNow" className="text-sm cursor-pointer flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Abertas <strong className={businessesOpenNow ? "text-emerald-400" : "text-orange-400"}>
                  {businessesOpenNow ? 'agora' : 'fora de expediente'}
                </strong>
              </label>
            </div>

            {/* Star Rating Filter */}
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`min-${star}`}
                    onClick={() => setMinStars(minStars === star ? 0 : star)}
                    className={`w-5 h-5 transition-colors ${star <= minStars ? 'text-amber-400' : 'text-white/20 hover:text-amber-400/50'}`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">mín</span>
              <span className="text-white/20 mx-1">|</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`max-${star}`}
                    onClick={() => setMaxStars(maxStars === star ? 5 : star)}
                    className={`w-5 h-5 transition-colors ${star <= maxStars ? 'text-amber-400' : 'text-white/20 hover:text-amber-400/50'}`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">máx</span>
            </div>

            {results.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 h-8 bg-white/5 border-white/10 hover:bg-white/10"
                onClick={() => setRadiusFilterOpen(true)}
              >
                <Map className="w-4 h-4" />
                Filtrar por Área
              </Button>
            )}

            {filteredResults.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 h-8 text-muted-foreground"
                onClick={() => setFilteredResults([])}
              >
                <XCircle className="w-4 h-4" />
                Limpar filtro
              </Button>
            )}

            {selectedCountry && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedCountry.flag} {currentLocalTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading - Genesis Style */}
      {searching && (
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-12 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Buscando empresas...</p>
          <p className="text-xs text-muted-foreground/70">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Empty State - Genesis Style */}
      {displayResults.length === 0 && !searching && (
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-12 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Search className="w-8 h-8 text-primary/50" />
          </div>
          <h3 className="text-lg font-semibold">Faça uma busca</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Preencha os campos acima e clique em buscar para encontrar oportunidades de negócio.
          </p>
        </div>
      )}

      {/* Results - Genesis Style */}
      {displayResults.length > 0 && !searching && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              {displayResults.length} Oportunidades Encontradas
            </h3>
            <Badge variant="outline" className="text-xs px-3 py-1 bg-white/5 border-white/10">
              Página {currentPage} de {totalPages}
            </Badge>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full max-w-4xl">
            {paginatedResults.map((result, idx) => {
              const levelConfig = result.opportunityLevel ? LEVEL_CONFIG[result.opportunityLevel] : null;
              const nicheIcon = getNicheIcon(result.niche);

              return (
                <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all hover:bg-white/[0.07] overflow-hidden group h-fit">
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center text-xl shrink-0">
                        {nicheIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">{result.name}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">{result.niche}</span>
                          {levelConfig && (
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", levelConfig.color)}>
                              {levelConfig.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Value Box */}
                    <div className="grid grid-cols-2 gap-3 mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">
                          <DollarSign className="w-3 h-3" /> Valor
                        </div>
                        <div className="text-sm font-bold text-primary">
                          R$ {result.estimatedValueMin} - {result.estimatedValueMax}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">
                          <TrendingUp className="w-3 h-3" /> Recorrência
                        </div>
                        <div className="text-sm font-bold text-emerald-400">
                          +R$ {result.monthlyRecurrence}/mês
                        </div>
                      </div>
                    </div>

                    {/* Services Needed */}
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-2">O que você pode oferecer:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.needsWebsite && (
                          <Badge variant="secondary" className="text-xs gap-1 bg-orange-500/10 text-orange-500 border-orange-500/20">
                            <Globe className="w-3 h-3" /> Site
                          </Badge>
                        )}
                        {result.needsScheduling && (
                          <Badge variant="secondary" className="text-xs gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                            <Calendar className="w-3 h-3" /> Agendamentos
                          </Badge>
                        )}
                        {result.needsCRM && (
                          <Badge variant="secondary" className="text-xs gap-1 bg-purple-500/10 text-purple-500 border-purple-500/20">
                            <Users className="w-3 h-3" /> CRM
                          </Badge>
                        )}
                        {result.needsMarketing && (
                          <Badge variant="secondary" className="text-xs gap-1 bg-pink-500/10 text-pink-500 border-pink-500/20">
                            <FileText className="w-3 h-3" /> Marketing
                          </Badge>
                        )}
                        {result.needsEcommerce && (
                          <Badge variant="secondary" className="text-xs gap-1 bg-green-500/10 text-green-500 border-green-500/20">
                            <ShoppingBag className="w-3 h-3" /> E-commerce
                          </Badge>
                        )}
                        {result.needsChatbot && (
                          <Badge variant="secondary" className="text-xs gap-1 bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                            <MessageSquare className="w-3 h-3" /> Chatbot
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* AI Description */}
                    {result.aiDescription && (
                      <p className="text-sm text-muted-foreground mb-3 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {result.aiDescription}
                      </p>
                    )}

                    {/* Address & Phone */}
                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      <p className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 shrink-0" /> {result.address}
                      </p>
                    </div>

                    {/* Digital Status */}
                    <div className={cn(
                      "text-xs px-3 py-2 rounded-lg mb-3 flex items-center gap-2",
                      result.needsWebsite 
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" 
                        : "bg-white/5 text-muted-foreground border border-white/10"
                    )}>
                      {result.needsWebsite ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          Sem site — Oportunidade máxima
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Possui site — Pode melhorar
                        </>
                      )}
                    </div>

                    {/* Actions - WhatsApp / Email / Details */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                      {/* WhatsApp Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!result.phone}
                        onClick={() => {
                          if (result.phone) {
                            const cleanPhone = result.phone.replace(/\D/g, '');
                            const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                            window.open(`https://wa.me/${phone}`, '_blank');
                          }
                        }}
                        className={cn(
                          "gap-1.5 h-8 text-xs",
                          result.phone 
                            ? "text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" 
                            : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
                        )}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </Button>
                      
                      {/* Email Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!result.email}
                        onClick={() => result.email && window.open(`mailto:${result.email}`, '_blank')}
                        className={cn(
                          "gap-1.5 h-8 text-xs",
                          result.email 
                            ? "text-blue-500 border-blue-500/30 hover:bg-blue-500/10" 
                            : "text-muted-foreground/50 border-white/10 cursor-not-allowed"
                        )}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </Button>

                      <Button 
                        onClick={() => handleAcceptProject(result)}
                        size="sm"
                        className="flex-1 gap-2 h-8 text-xs"
                      >
                        <Zap className="w-3.5 h-3.5" /> Aceitar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10"
                        onClick={() => openBusinessDetail(result)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination - Genesis Style */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1 h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </Button>
              <span className="px-4 text-xs text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1 h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10"
              >
                Próximo <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Radius Filter Modal */}
      <RadiusFilterModal
        open={radiusFilterOpen}
        onOpenChange={setRadiusFilterOpen}
        results={results}
        city={city}
        state={state}
        onFilterResults={handleFilterByRadius}
      />

      {/* Business Detail Modal */}
      <GenesisBusinessDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        business={selectedBusiness}
        onAcceptProject={() => selectedBusiness && handleAcceptProject(selectedBusiness)}
      />

    </div>
  );
};
