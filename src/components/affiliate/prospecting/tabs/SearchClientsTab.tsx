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
  CheckCircle,
  Sparkles,
  MessageSquare,
  Send,
  Copy,
  Check,
  Zap,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RadiusFilterModal } from '../RadiusFilterModal';

const ITEMS_PER_PAGE = 12;
const MAX_RESULTS_OPTIONS = [
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '300', label: '300' },
  { value: '500', label: '500' },
];

interface SearchResult {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
  latitude?: number;
  longitude?: number;
}

interface SearchClientsTabProps {
  affiliateId: string;
  affiliateName?: string;
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

export const SearchClientsTab = ({ affiliateId, affiliateName, onAddProspect }: SearchClientsTabProps) => {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [niche, setNiche] = useState('');
  const [maxResults, setMaxResults] = useState<string>('200');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [originalResults, setOriginalResults] = useState<SearchResult[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [radiusModalOpen, setRadiusModalOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set());
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentAffiliateName, setCurrentAffiliateName] = useState(affiliateName || '');

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.slice(start, start + ITEMS_PER_PAGE);
  }, [results, currentPage]);

  // Fetch affiliate name if not provided
  useEffect(() => {
    const fetchAffiliateName = async () => {
      if (!affiliateName && affiliateId) {
        const { data } = await supabase
          .from('affiliates')
          .select('name')
          .eq('id', affiliateId)
          .single();
        if (data?.name) {
          setCurrentAffiliateName(data.name);
        }
      }
    };
    fetchAffiliateName();
  }, [affiliateId, affiliateName]);

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
        body: { city: city.trim(), state, niche, maxResults: parseInt(maxResults, 10) },
      });

      if (error) throw error;

      if (data?.success && data.results && data.results.length > 0) {
        setResults(data.results);
        setOriginalResults(data.results);
        toast.success(`${data.results.length} estabelecimentos encontrados!`);
      } else if (data?.error) {
        toast.error(data.error);
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

  const generateProposal = async (result: SearchResult) => {
    setGeneratingProposal(true);
    setGeneratedMessage('');
    
    try {
      const { data, error } = await supabase.functions.invoke('luna-prospect-proposal', {
        body: {
          businessName: result.name,
          businessNiche: result.category || niche,
          businessAddress: result.address,
          businessPhone: result.phone,
          businessWebsite: result.website,
          businessRating: result.rating,
          affiliateName: currentAffiliateName || 'Consultor Genesis',
        },
      });

      if (error) throw error;

      if (data?.message) {
        setGeneratedMessage(data.message);
      }
    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      // Fallback to base template
      const baseMessage = `Olá, tudo bem?

Me chamo ${currentAffiliateName || 'Consultor Genesis'} e trabalho ajudando negócios locais a ter presença no Google e automatizar agendamentos e atendimentos.

Hoje desenvolvemos:

✅ Sites profissionais
✅ Sistema de agendamento automático
✅ Automação de WhatsApp, reduzindo atendimento manual

Entrei em contato porque acredito que essas soluções podem otimizar o dia a dia do seu negócio e aumentar a conversão de clientes.

Se fizer sentido, posso te explicar rapidamente como funciona.`;
      setGeneratedMessage(baseMessage);
    } finally {
      setGeneratingProposal(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    toast.success('Mensagem copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendViaWhatsApp = () => {
    if (selectedResult?.phone) {
      const phone = selectedResult.phone.replace(/\D/g, '');
      const message = encodeURIComponent(generatedMessage);
      window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form - Genesis Theme */}
      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                Cidade
              </Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="bg-background/50 border-border focus:border-primary"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Estado</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="bg-background/50 border-border focus:border-primary">
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
                <Building2 className="w-4 h-4 text-primary" />
                Nicho
              </Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger className="bg-background/50 border-border focus:border-primary">
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
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando, aguarde...
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
        </CardContent>
      </Card>

      {/* Loading State */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground font-medium">Buscando estabelecimentos, aguarde...</p>
          <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && !searching && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {results.length} Estabelecimentos Encontrados
              {isFiltered && (
                <Badge variant="secondary" className="text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Filtrado por Bairro
                </Badge>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRadiusModalOpen(true)}
                className="gap-1.5"
              >
                <MapPin className="w-4 h-4" />
                Filtrar por Bairro
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Badge className="bg-primary/10 text-primary border-primary/30">
                Google Places
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedResults.map((result, idx) => {
              const isAdded = addedNames.has(result.name);
              const isAdding = addingId === result.name;

              return (
                <Card
                  key={`${result.name}-${idx}`}
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
                    isAdded 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedResult(result)}
                >
                  {isAdded && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-green-500 text-white gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Salvo
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate pr-16 group-hover:text-primary transition-colors">
                          {result.name}
                        </h4>

                        <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {result.address}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {result.rating && (
                            <Badge variant="secondary" className="text-xs gap-1 bg-amber-500/10 text-amber-500 border-amber-500/30">
                              <Star className="w-3 h-3 fill-current" />
                              {result.rating}
                            </Badge>
                          )}

                          {result.phone && (
                            <Badge variant="outline" className="text-xs gap-1 font-mono">
                              <Phone className="w-3 h-3" />
                              {result.phone.slice(0, 14)}...
                            </Badge>
                          )}

                          {result.website && (
                            <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30">
                              <Globe className="w-3 h-3" />
                              Site
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResult(result);
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Ver Detalhes
                      </Button>

                      {!isAdded && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToProspects(result);
                          }}
                          disabled={isAdding}
                          className="flex-1 gap-1 text-xs bg-primary hover:bg-primary/90"
                        >
                          {isAdding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <TrendingUp className="w-3.5 h-3.5" />
                          )}
                          Salvar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-9 h-9 p-0"
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searching && results.length === 0 && (
        <Card className="border-dashed border-2 border-primary/20">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Encontre Clientes em Potencial
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Busque estabelecimentos reais por cidade e nicho. 
              Gere propostas personalizadas com IA e aumente suas conversões.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                Dados do Google
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-primary" />
                Proposta com IA
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal with Proposal Generator */}
      <Dialog open={!!selectedResult} onOpenChange={() => {
        setSelectedResult(null);
        setGeneratedMessage('');
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <span className="block">{selectedResult?.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {selectedResult?.category || niche}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedResult && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="info" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Informações
                </TabsTrigger>
                <TabsTrigger value="proposal" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Gerar Proposta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                {/* Business Info */}
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Endereço</p>
                      <p className="text-sm text-muted-foreground">{selectedResult.address}</p>
                    </div>
                  </div>
                  
                  {selectedResult.phone && (
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                      <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Telefone</p>
                        <p className="text-sm text-muted-foreground font-mono">{selectedResult.phone}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`tel:${selectedResult.phone}`, '_self')}
                        className="shrink-0"
                      >
                        Ligar
                      </Button>
                    </div>
                  )}
                  
                  {selectedResult.website && (
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                      <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Website</p>
                        <a 
                          href={selectedResult.website.startsWith('http') ? selectedResult.website : `https://${selectedResult.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {selectedResult.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {selectedResult.rating && (
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                      <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 fill-current" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Avaliação</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedResult.rating} estrelas
                          {selectedResult.reviews_count && ` • ${selectedResult.reviews_count} avaliações`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  {!addedNames.has(selectedResult.name) && (
                    <Button
                      onClick={() => {
                        handleAddToProspects(selectedResult);
                      }}
                      className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Salvar Prospect
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
              </TabsContent>

              <TabsContent value="proposal" className="space-y-4">
                {/* Generate Proposal */}
                {!generatedMessage ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Gerar Proposta Personalizada
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      A Luna AI vai criar uma mensagem personalizada para {selectedResult.name} 
                      baseada no perfil do negócio.
                    </p>
                    <Button
                      onClick={() => generateProposal(selectedResult)}
                      disabled={generatingProposal}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      {generatingProposal ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Luna está criando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Gerar com IA
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Mensagem Gerada
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copyToClipboard}
                          className="gap-1"
                        >
                          {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copied ? 'Copiado!' : 'Copiar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => generateProposal(selectedResult)}
                          disabled={generatingProposal}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      value={generatedMessage}
                      onChange={(e) => setGeneratedMessage(e.target.value)}
                      className="min-h-[250px] bg-muted/30 border-border resize-none"
                    />

                    <div className="flex gap-3">
                      {selectedResult.phone && (
                        <Button
                          onClick={sendViaWhatsApp}
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Send className="w-4 h-4" />
                          Enviar via WhatsApp
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={copyToClipboard}
                        className={!selectedResult.phone ? "flex-1" : ""}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Mensagem
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Filtro por Raio */}
      <RadiusFilterModal
        open={radiusModalOpen}
        onOpenChange={setRadiusModalOpen}
        results={originalResults}
        city={city}
        state={state}
        onFilterResults={handleRadiusFilter}
      />
    </div>
  );
};
