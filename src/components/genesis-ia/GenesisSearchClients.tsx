import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Building2, 
  Loader2, 
  Phone, 
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
  Map
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

const ITEMS_PER_PAGE = 12;

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
  opportunityLevel?: 'basic' | 'intermediate' | 'advanced';
  estimatedValueMin?: number;
  estimatedValueMax?: number;
  monthlyRecurrence?: number;
  digitalPresenceStatus?: string;
  serviceTags?: string[];
  aiDescription?: string;
}

interface GenesisSearchClientsProps {
  userId: string;
}

// Timezone mapping for countries
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
  
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.slice(start, start + ITEMS_PER_PAGE);
  }, [results, currentPage]);

  // Get niches for selected country
  const availableNiches = useMemo(() => {
    return getNichesForCountry(countryCode);
  }, [countryCode]);

  // Reset niche and state when country changes
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
          affiliateName: 'Consultor Genesis'
        },
      });

      if (searchError) throw searchError;

      if (!searchData?.success || !searchData.results?.length) {
        toast.info('Nenhuma empresa encontrada. Tente outra busca.');
        setSearching(false);
        return;
      }

      let businessResults: SearchResult[] = searchData.results.map((r: any) => ({
        ...r,
        niche,
        localTime,
        opportunityLevel: Math.random() > 0.5 ? 'basic' : Math.random() > 0.5 ? 'intermediate' : 'advanced',
        estimatedValueMin: Math.floor(Math.random() * 300) + 200,
        estimatedValueMax: Math.floor(Math.random() * 400) + 400,
        monthlyRecurrence: Math.floor(Math.random() * 50) + 50,
        digitalPresenceStatus: !r.website ? 'Sem presença digital — oportunidade máxima' : 'Presença básica',
        serviceTags: ['orçamentos', 'gestão'],
        aiDescription: `${niche} precisa de sistema de orçamentos e controle de serviços.`,
      }));

      if (excludeWithWebsite) {
        const beforeCount = businessResults.length;
        businessResults = businessResults.filter(r => !r.website);
        if (businessResults.length < beforeCount) {
          toast.info(`${beforeCount - businessResults.length} empresas com site removidas`);
        }
      }

      if (businessResults.length === 0) {
        toast.info('Nenhuma empresa sem site encontrada. Desmarque o filtro.');
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

  const handleAcceptProject = (result: SearchResult) => {
    toast.success(`Projeto ${result.name} aceito!`);
  };

  return (
    <div className="space-y-4">
      {/* Search Form - Compact */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Country */}
            <div>
              <Label className="text-xs font-medium mb-1 block">🌍 País</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="h-9 text-sm bg-background/50">
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
                <Label className="text-xs font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" /> Estado
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="h-9 text-sm bg-background/50">
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
              <Label className="text-xs font-medium mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> Cidade
              </Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={countryCode === 'BR' ? 'Ex: São Paulo' : 'Ex: New York'}
                className="h-9 text-sm bg-background/50"
              />
            </div>

            {/* Niche */}
            <div>
              <Label className="text-xs font-medium mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-primary" /> Nicho
              </Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger className="h-9 text-sm bg-background/50">
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
                className="w-full h-9 text-sm gap-1.5"
              >
                {searching ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Buscando...</>
                ) : (
                  <><Search className="w-4 h-4" /> Buscar</>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Row */}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="excludeWebsite" 
                checked={excludeWithWebsite}
                onCheckedChange={(c) => setExcludeWithWebsite(c === true)}
              />
              <label htmlFor="excludeWebsite" className="text-xs cursor-pointer flex items-center gap-1">
                <GlobeIcon className="w-3 h-3 text-muted-foreground" />
                Apenas empresas <strong className="text-primary">sem site</strong>
              </label>
            </div>

            {selectedCountry && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                <Clock className="w-3 h-3" />
                <span>{selectedCountry.flag} {currentLocalTime}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Buscando empresas...</p>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !searching && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="w-7 h-7 text-primary/50" />
          </div>
          <h3 className="text-base font-semibold">Faça uma busca</h3>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            Preencha os campos acima e clique em buscar para encontrar oportunidades.
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !searching && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              {results.length} Empresas Encontradas
            </h3>
            <Badge variant="outline" className="text-xs">
              Página {currentPage} de {totalPages}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {paginatedResults.map((result, idx) => {
              const levelConfig = result.opportunityLevel ? LEVEL_CONFIG[result.opportunityLevel] : null;
              const nicheIcon = getNicheIcon(result.niche);

              return (
                <Card key={idx} className="overflow-hidden border-border hover:border-primary/50 transition-all">
                  <CardContent className="p-3">
                    {/* Header */}
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                        {nicheIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">{result.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{result.niche}</span>
                          {levelConfig && (
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", levelConfig.color)}>
                              {levelConfig.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Value & Recurrence - Compact */}
                    <div className="grid grid-cols-2 gap-2 mb-2 p-2 rounded-lg bg-muted/30">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                          <DollarSign className="w-3 h-3" /> VALOR
                        </div>
                        <div className="text-xs font-bold text-primary">
                          R$ {result.estimatedValueMin} - {result.estimatedValueMax}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                          <TrendingUp className="w-3 h-3" /> RECORRÊNCIA
                        </div>
                        <div className="text-xs font-bold text-emerald-500">
                          +R$ {result.monthlyRecurrence}/mês
                        </div>
                      </div>
                    </div>

                    {/* AI Description */}
                    {result.aiDescription && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
                        {result.aiDescription}
                      </p>
                    )}

                    {/* Address & Phone */}
                    <div className="text-xs text-muted-foreground space-y-0.5 mb-2">
                      <p className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {result.address}
                      </p>
                      {result.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {result.phone}
                        </p>
                      )}
                    </div>

                    {/* Digital Presence */}
                    {result.digitalPresenceStatus && (
                      <div className={cn(
                        "text-[10px] px-2 py-1 rounded mb-2",
                        result.digitalPresenceStatus.includes('máxima') ? "bg-orange-500/10 text-orange-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Globe className="w-3 h-3 inline mr-1" />
                        {result.digitalPresenceStatus}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button 
                        onClick={() => handleAcceptProject(result)}
                        size="sm"
                        className="flex-1 h-7 text-xs gap-1"
                      >
                        <Zap className="w-3 h-3" /> Aceitar
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        <Search className="w-3 h-3" /> Ver mais
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 text-xs gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Anterior
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 text-xs gap-1"
              >
                Próximo <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
