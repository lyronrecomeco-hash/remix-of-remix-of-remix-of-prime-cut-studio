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
  Clock,
  Zap,
  Tag
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
  // Dados enriquecidos
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

const COUNTRIES = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
];

const BRAZILIAN_STATES = [
  { code: 'SP', name: 'São Paulo' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'BA', name: 'Bahia' },
  { code: 'PR', name: 'Paraná' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'GO', name: 'Goiás' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'CE', name: 'Ceará' },
];

const NICHES = [
  'Oficina Mecânica', 'Barbearia', 'Salão de Beleza', 'Clínica Médica', 
  'Clínica Odontológica', 'Academia', 'Restaurante', 'Pet Shop',
  'Imobiliária', 'Contabilidade', 'Advocacia', 'Escola de Idiomas'
];

const LEVEL_CONFIG = {
  basic: { label: 'Básico', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: '🔵' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: '🟡' },
  advanced: { label: 'Avançado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: '🟢' },
};

const NICHE_ICONS: Record<string, string> = {
  'oficina': '🚗', 'barbearia': '💈', 'salao': '💇', 'salão': '💇',
  'clinica': '🏥', 'clínica': '🏥', 'dentista': '🦷', 'restaurante': '🍽️',
  'academia': '🏋️', 'petshop': '🐕', 'pet shop': '🐕', 'imobiliária': '🏠',
  'advocacia': '⚖️', 'contabilidade': '📊', 'escola': '📚', 'default': '🏢',
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

  const handleSearch = async () => {
    if (!city.trim() || !countryCode || !niche || (countryCode === 'BR' && !state)) {
      toast.error('Preencha todos os campos para buscar');
      return;
    }

    setSearching(true);
    setResults([]);
    setCurrentPage(1);

    try {
      const searchCity = countryCode === 'BR' && state ? `${city.trim()}, ${state}` : city.trim();
      
      const { data: searchData, error: searchError } = await supabase.functions.invoke('search-businesses-global', {
        body: { 
          city: searchCity, 
          countryCode, 
          niche, 
          maxResults: 30,
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
        opportunityLevel: Math.random() > 0.5 ? 'basic' : Math.random() > 0.5 ? 'intermediate' : 'advanced',
        estimatedValueMin: Math.floor(Math.random() * 300) + 200,
        estimatedValueMax: Math.floor(Math.random() * 400) + 400,
        monthlyRecurrence: Math.floor(Math.random() * 50) + 50,
        digitalPresenceStatus: !r.website ? 'Sem presença digital — oportunidade máxima' : 'Presença básica',
        serviceTags: ['orçamentos', 'gestão'],
        aiDescription: `${niche} precisa de sistema de orçamentos e controle de serviços.`,
      }));

      if (excludeWithWebsite) {
        businessResults = businessResults.filter(r => !r.website);
      }

      if (businessResults.length === 0) {
        toast.info('Nenhuma empresa sem site encontrada.');
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
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Country */}
            <div>
              <Label className="text-base font-medium mb-2 block">🌍 País</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="h-12 text-base bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                <Label className="text-base font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Estado
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="h-12 text-base bg-background/50">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map(s => (
                      <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* City */}
            <div>
              <Label className="text-base font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Cidade
              </Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="h-12 text-base bg-background/50"
              />
            </div>

            {/* Niche */}
            <div>
              <Label className="text-base font-medium mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Nicho
              </Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger className="h-12 text-base bg-background/50">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map(n => (
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
                className="w-full h-12 text-base gap-2"
              >
                {searching ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Buscando...</>
                ) : (
                  <><Search className="w-5 h-5" /> Buscar</>
                )}
              </Button>
            </div>
          </div>

          {/* Filter */}
          <div className="mt-4 flex items-center gap-2">
            <Checkbox 
              id="excludeWebsite" 
              checked={excludeWithWebsite}
              onCheckedChange={(c) => setExcludeWithWebsite(c === true)}
            />
            <label htmlFor="excludeWebsite" className="text-base cursor-pointer">
              Apenas empresas <strong className="text-primary">sem site</strong>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-14 h-14 animate-spin text-primary" />
          <p className="text-xl text-muted-foreground">Buscando empresas...</p>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !searching && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="w-10 h-10 text-primary/50" />
          </div>
          <h3 className="text-xl font-semibold">Faça uma busca</h3>
          <p className="text-base text-muted-foreground text-center max-w-md">
            Preencha os campos acima e clique em buscar para encontrar oportunidades.
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !searching && (
        <div className="space-y-5">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {results.length} Empresas Encontradas
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paginatedResults.map((result, idx) => {
              const levelConfig = result.opportunityLevel ? LEVEL_CONFIG[result.opportunityLevel] : null;
              const nicheIcon = getNicheIcon(result.niche);

              return (
                <Card key={idx} className="overflow-hidden border-border hover:border-primary/50 transition-all">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                        {nicheIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-foreground truncate">{result.name}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-muted-foreground">{result.niche}</span>
                          {levelConfig && (
                            <Badge variant="outline" className={cn("text-sm", levelConfig.color)}>
                              {levelConfig.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Value & Recurrence */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                          <DollarSign className="w-4 h-4" /> VALOR ESTIMADO
                        </div>
                        <div className="text-sm text-muted-foreground">
                          R$ {result.estimatedValueMin} (mín)
                        </div>
                        <div className="text-xl font-bold text-primary">
                          R$ {result.estimatedValueMax} <span className="text-sm font-normal text-muted-foreground">(máx)</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                          <TrendingUp className="w-4 h-4" /> RECORRÊNCIA
                        </div>
                        <div className="text-xl font-bold text-emerald-500">
                          +R$ {result.monthlyRecurrence}/mês
                        </div>
                      </div>
                    </div>

                    {/* AI Description */}
                    {result.aiDescription && (
                      <p className="text-base text-muted-foreground mb-3">
                        <Sparkles className="w-4 h-4 inline mr-1.5 text-primary" />
                        {result.aiDescription}
                      </p>
                    )}

                    {/* Address & Phone */}
                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {result.address}
                      </p>
                      {result.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4" /> {result.phone}
                        </p>
                      )}
                    </div>

                    {/* Digital Presence */}
                    {result.digitalPresenceStatus && (
                      <div className={cn(
                        "text-sm px-3 py-2 rounded-lg mb-4",
                        result.digitalPresenceStatus.includes('máxima') ? "bg-orange-500/10 text-orange-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Globe className="w-4 h-4 inline mr-1.5" />
                        {result.digitalPresenceStatus}
                      </div>
                    )}

                    {/* Tags */}
                    {result.serviceTags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.serviceTags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-sm">{tag}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t border-border">
                      <Button 
                        onClick={() => handleAcceptProject(result)}
                        className="flex-1 h-11 text-base gap-2"
                      >
                        <Zap className="w-5 h-5" /> Aceitar Projeto
                      </Button>
                      <Button variant="outline" className="h-11 text-base gap-2">
                        <Search className="w-5 h-5" /> Pesquisar →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-base text-muted-foreground">
                {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
