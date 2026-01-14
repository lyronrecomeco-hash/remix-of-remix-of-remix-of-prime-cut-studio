import { useState, useMemo } from 'react';
import { Search, MapPin, Building2, Loader2, Users, ExternalLink, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RadiusFilterModal } from './RadiusFilterModal';

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

export const SearchClientsCard = ({ affiliateId, onAddProspect }: SearchClientsCardProps) => {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [niche, setNiche] = useState('');
  const [maxResults, setMaxResults] = useState<string>('200');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [originalResults, setOriginalResults] = useState<SearchResult[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [radiusModalOpen, setRadiusModalOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  // Paginação
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.slice(start, start + ITEMS_PER_PAGE);
  }, [results, currentPage]);

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
        },
      });

      if (error) throw error;

      if (data?.results && data.results.length > 0) {
        setResults(data.results);
        setOriginalResults(data.results);
        toast.success(`${data.results.length} estabelecimentos encontrados!`);
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
    } finally {
      setAddingId(null);
    }
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
              Encontre estabelecimentos por cidade e nicho
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
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Resultados ({results.length})
                {isFiltered && (
                  <Badge variant="secondary" className="text-xs">
                    Filtrado
                  </Badge>
                )}
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRadiusModalOpen(true)}
                  className="gap-1.5"
                >
                  <Target className="w-4 h-4" />
                  Filtrar por Bairro
                </Button>
                <span className="text-xs text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {paginatedResults.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-background/80 border border-border rounded-lg p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground truncate">
                        {result.name}
                      </h5>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        📍 {result.address}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {result.phone && (
                          <Badge variant="outline" className="text-xs">
                            📞 {result.phone}
                          </Badge>
                        )}
                        {result.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {result.rating}
                          </Badge>
                        )}
                        {result.website && (
                          <a 
                            href={result.website.startsWith('http') ? result.website : `https://${result.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Site
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddToProspects(result)}
                      disabled={addingId === (result.name + result.address)}
                      className="shrink-0"
                    >
                      {addingId === (result.name + result.address) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        '+ Adicionar'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
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
      </CardContent>
    </Card>
  );
};
