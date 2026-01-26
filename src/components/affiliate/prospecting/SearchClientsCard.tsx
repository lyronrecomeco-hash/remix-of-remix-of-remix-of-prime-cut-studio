import { useState, useMemo } from 'react';
import { Search, MapPin, Building2, Loader2, Users, ExternalLink, ChevronLeft, ChevronRight, Target, Globe, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RadiusFilterModal } from './RadiusFilterModal';
import { BusinessDetailModal } from './BusinessDetailModal';

interface SearchResult {
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

interface SearchClientsCardProps {
  affiliateId: string;
  onAddProspect: (data: {
    company_name: string;
    company_phone?: string;
    company_website?: string;
    company_address?: string;
    company_city?: string;
    company_state?: string;
    niche?: string;
  }) => Promise<unknown>;
}

const NICHES = [
  'Barbearia',
  'Salão de Beleza',
  'Clínica Médica',
  'Clínica Odontológica',
  'Academia',
  'Restaurante',
  'Pizzaria',
  'Loja de Roupas',
  'Pet Shop',
  'Oficina Mecânica',
  'Imobiliária',
  'Escritório de Advocacia',
  'Contabilidade',
  'Estúdio de Tatuagem',
  'Escola/Curso',
  'Hotel/Pousada',
];

const STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const ITEMS_PER_PAGE = 10;
const MAX_RESULTS_OPTIONS = [
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '300', label: '300' },
  { value: '500', label: '500' },
];

const SEARCH_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'no_website', label: 'Sem Site' },
  { value: 'with_website', label: 'Com Site/Online' },
];

export const SearchClientsCard = ({ affiliateId, onAddProspect }: SearchClientsCardProps) => {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [niche, setNiche] = useState('');
  const [maxResults, setMaxResults] = useState<string>('200');
  const [searchFilter, setSearchFilter] = useState<string>('all');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [originalResults, setOriginalResults] = useState<SearchResult[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [radiusModalOpen, setRadiusModalOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<SearchResult | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Filtrar resultados baseado no filtro de presença online
  const filteredResults = useMemo(() => {
    if (searchFilter === 'all') return results;
    if (searchFilter === 'no_website') {
      return results.filter(r => !r.website);
    }
    if (searchFilter === 'with_website') {
      return results.filter(r => !!r.website);
    }
    return results;
  }, [results, searchFilter]);

  // Contagens
  const counts = useMemo(() => {
    const withSite = results.filter(r => !!r.website).length;
    const withoutSite = results.filter(r => !r.website).length;
    return { withSite, withoutSite, total: results.length };
  }, [results]);

  // Paginação
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResults.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredResults, currentPage]);

  const handleSearch = async () => {
    if (!city.trim() || !state || !niche) {
      toast.error('Preencha todos os campos para buscar');
      return;
    }

    setSearching(true);
    setResults([]);
    setOriginalResults([]);
    setCurrentPage(1);
    setIsFiltered(false);

    try {
      const { data, error } = await supabase.functions.invoke('search-businesses', {
        body: {
          city: city.trim(),
          state,
          niche,
          maxResults: parseInt(maxResults, 10),
          affiliateId: affiliateId // Passa affiliateId para salvar histórico
        },
      });

      if (error) throw error;

      if (data?.results && data.results.length > 0) {
        setResults(data.results);
        setOriginalResults(data.results);
        const withSite = data.results.filter((r: SearchResult) => !!r.website).length;
        const withoutSite = data.results.length - withSite;
        toast.success(`${data.results.length} estabelecimentos encontrados! (${withSite} online, ${withoutSite} sem site)`);
      } else {
        toast.info('Nenhum estabelecimento encontrado. Tente outra busca.');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar estabelecimentos');
    } finally {
      setSearching(false);
    }
  };

  const handleRadiusFilter = (filteredResults: SearchResult[]) => {
    if (filteredResults.length === originalResults.length) {
      setResults(originalResults);
      setIsFiltered(false);
      toast.info('Filtro removido');
    } else {
      setResults(filteredResults);
      setIsFiltered(true);
      setCurrentPage(1);
      toast.success(`${filteredResults.length} estabelecimentos na área selecionada`);
    }
  };

  const handleAddToProspects = async (result: SearchResult) => {
    const id = result.name + result.address;
    setAddingId(id);

    try {
      await onAddProspect({
        company_name: result.name,
        company_phone: result.phone,
        company_website: result.website,
        company_address: result.address,
        company_city: city,
        company_state: state,
        niche,
      });
      
      // Remove from results
      setResults(prev => prev.filter(r => (r.name + r.address) !== id));
      setDetailModalOpen(false);
    } finally {
      setAddingId(null);
    }
  };

  const openBusinessDetail = (business: SearchResult) => {
    setSelectedBusiness(business);
    setDetailModalOpen(true);
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Search className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl">Buscar Clientes</CardTitle>
            <CardDescription>
              Encontre estabelecimentos por cidade e nicho (online e sem site)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Campos de Busca */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
              <MapPin className="w-3 h-3" />
              Cidade
            </Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: São Paulo"
              className="bg-background/50"
            />
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Estado</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
              <Building2 className="w-3 h-3" />
              Nicho
            </Label>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Selecione o nicho" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Limite</Label>
            <Select value={maxResults} onValueChange={setMaxResults}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="200" />
              </SelectTrigger>
              <SelectContent>
                {MAX_RESULTS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={searching || !city || !state || !niche}
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {searching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando, aguarde...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Buscar Estabelecimentos
            </>
          )}
        </Button>

        {/* Loading State */}
        {searching && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-base text-muted-foreground font-medium">Buscando estabelecimentos, aguarde...</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
          </div>
        )}

        {/* Resultados */}
        {!searching && results.length > 0 && (
          <div className="mt-4">
            {/* Header com estatísticas */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Resultados ({filteredResults.length})
                </h4>
                <div className="flex gap-1.5">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Globe className="w-3 h-3" />
                    {counts.withSite} online
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    {counts.withoutSite} sem site
                  </Badge>
                </div>
                {isFiltered && (
                  <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-600">
                    Filtrado por área
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select value={searchFilter} onValueChange={(v) => { setSearchFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEARCH_FILTER_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRadiusModalOpen(true)}
                  className="gap-1.5"
                >
                  <Target className="w-4 h-4" />
                  Filtrar por Bairro
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              Página {currentPage} de {totalPages}
            </div>
            
            <div className="space-y-2">
              {paginatedResults.map((result, idx) => {
                const hasWebsite = !!result.website;
                return (
                  <div
                    key={idx}
                    className="bg-background/80 border border-border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => openBusinessDetail(result)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-foreground truncate">
                            {result.name}
                          </h5>
                          {hasWebsite ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs shrink-0">
                              <Globe className="w-3 h-3 mr-1" />
                              Online
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs shrink-0">
                              Sem Site
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          📍 {result.address}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {result.phone && (
                            <Badge variant="outline" className="text-xs">
                              📞 {result.phone}
                            </Badge>
                          )}
                          {result.rating && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {result.rating}
                              {result.reviews_count && (
                                <span className="text-muted-foreground">({result.reviews_count})</span>
                              )}
                            </Badge>
                          )}
                          {result.website && (
                            <a 
                              href={result.website.startsWith('http') ? result.website : `https://${result.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3 h-3" />
                              {result.website.length > 25 ? result.website.substring(0, 25) + '...' : result.website}
                            </a>
                          )}
                          {result.category && (
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); openBusinessDetail(result); }}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleAddToProspects(result); }}
                          disabled={addingId === (result.name + result.address)}
                        >
                          {addingId === (result.name + result.address) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            '+ Adicionar'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Modal de Filtro por Raio */}
        <RadiusFilterModal
          open={radiusModalOpen}
          onOpenChange={setRadiusModalOpen}
          results={originalResults}
          city={city}
          state={state}
          onFilterResults={handleRadiusFilter}
        />

        {/* Modal de Detalhes do Negócio */}
        <BusinessDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          business={selectedBusiness}
          onAddProspect={() => selectedBusiness && handleAddToProspects(selectedBusiness)}
          isAdding={!!addingId}
        />
      </CardContent>
    </Card>
  );
};
