import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Building2, 
  Loader2, 
  Phone, 
  Globe, 
  Star, 
  Plus,
  ExternalLink,
  CheckCircle,
  MapPinned,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SearchResult {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
}

interface SearchClientsTabProps {
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
  'Hamburgueria',
  'Padaria',
  'Cafeteria',
  'Loja de Roupas',
  'Pet Shop',
  'Clínica Veterinária',
  'Oficina Mecânica',
  'Lava Rápido',
  'Imobiliária',
  'Escritório de Advocacia',
  'Escritório de Contabilidade',
  'Estúdio de Tatuagem',
  'Estúdio de Pilates',
  'Escola de Idiomas',
  'Auto Escola',
  'Hotel',
  'Pousada',
  'Farmácia',
  'Ótica',
  'Joalheria',
  'Floricultura',
  'Supermercado',
  'Mercado',
  'Açougue',
  'Papelaria',
  'Loja de Eletrônicos',
  'Loja de Móveis',
  'Loja de Materiais de Construção',
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

export const SearchClientsTab = ({ affiliateId, onAddProspect }: SearchClientsTabProps) => {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [niche, setNiche] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!city.trim() || !state || !niche) {
      toast.error('Preencha todos os campos para buscar');
      return;
    }

    setSearching(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('search-businesses', {
        body: {
          city: city.trim(),
          state,
          niche,
        },
      });

      if (error) throw error;

      if (data?.success && data.results && data.results.length > 0) {
        setResults(data.results);
        toast.success(`${data.results.length} estabelecimentos encontrados!`);
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.info('Nenhum estabelecimento encontrado. Tente outra busca.');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar estabelecimentos. Verifique a configuração do Serper.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddToProspects = async (result: SearchResult) => {
    const id = result.name;
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
      
      setAddedNames(prev => new Set([...prev, result.name]));
      toast.success(`${result.name} adicionado aos prospects!`);
    } catch (error) {
      toast.error('Erro ao adicionar prospect');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            Buscar Estabelecimentos Reais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Cidade
              </Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="bg-background border-border"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Estado</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="bg-background border-border">
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
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Nicho
              </Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Selecione o nicho" />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
                disabled={searching || !city || !state || !niche}
                className="w-full gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Dados reais do Google Places via Serper.dev. Alta precisão.</span>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPinned className="w-5 h-5 text-blue-500" />
                Resultados ({results.length})
              </h3>
              <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                Dados Reais
              </Badge>
            </div>
            
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {results.map((result, idx) => {
                  const isAdded = addedNames.has(result.name);
                  const isAdding = addingId === result.name;
                  
                  return (
                    <div
                      key={idx}
                      className={`relative bg-background border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
                        isAdded 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : 'border-border hover:border-blue-500/50'
                      }`}
                    >
                      {isAdded && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-500 text-white gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Adicionado
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate pr-24">
                            {result.name}
                          </h4>
                          
                          <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{result.address}</span>
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {result.phone && (
                              <Badge variant="outline" className="text-xs gap-1 font-mono">
                                <Phone className="w-3 h-3" />
                                {result.phone}
                              </Badge>
                            )}
                            
                            {result.rating && (
                              <Badge variant="secondary" className="text-xs gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                <Star className="w-3 h-3 fill-current" />
                                {result.rating}
                                {result.reviews_count && ` (${result.reviews_count})`}
                              </Badge>
                            )}
                            
                            {result.website && (
                              <a 
                                href={result.website.startsWith('http') ? result.website : `https://${result.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Globe className="w-3 h-3" />
                                Site
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedResult(result)}
                              className="gap-1"
                            >
                              Ver Detalhes
                            </Button>
                            
                            {!isAdded && (
                              <Button
                                size="sm"
                                onClick={() => handleAddToProspects(result)}
                                disabled={isAdding}
                                className="gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                              >
                                {isAdding ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5" />
                                )}
                                Adicionar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!searching && results.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Busque Estabelecimentos Reais
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Digite a cidade, estado e nicho para encontrar estabelecimentos reais 
              com telefone, endereço e mais informações direto da web.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              {selectedResult?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-sm text-muted-foreground">{selectedResult.address}</p>
                  </div>
                </div>
                
                {selectedResult.phone && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground font-mono">{selectedResult.phone}</p>
                    </div>
                  </div>
                )}
                
                {selectedResult.website && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Globe className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a 
                        href={selectedResult.website.startsWith('http') ? selectedResult.website : `https://${selectedResult.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                      >
                        {selectedResult.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
                
                {selectedResult.rating && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Avaliação</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedResult.rating} estrelas
                        {selectedResult.reviews_count && ` (${selectedResult.reviews_count} avaliações)`}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedResult.category && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Building2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Categoria</p>
                      <p className="text-sm text-muted-foreground">{selectedResult.category}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                {!addedNames.has(selectedResult.name) && (
                  <Button
                    onClick={() => {
                      handleAddToProspects(selectedResult);
                      setSelectedResult(null);
                    }}
                    className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar aos Prospects
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedResult(null)}
                  className={addedNames.has(selectedResult.name) ? "flex-1" : ""}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
