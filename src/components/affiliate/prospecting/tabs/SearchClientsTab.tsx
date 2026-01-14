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
import { COUNTRIES, getNichesForCountry, getCountryByCode } from '../global/globalSearchData';

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
  place_id?: string;
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

export const SearchClientsTab = ({ affiliateId, affiliateName, onAddProspect }: SearchClientsTabProps) => {
  // Search form state
  const [countryCode, setCountryCode] = useState('BR');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');
  const [maxResults, setMaxResults] = useState<string>('200');
  
  // Results state
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [originalResults, setOriginalResults] = useState<SearchResult[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [radiusModalOpen, setRadiusModalOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  // Modal state
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set());
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentAffiliateName, setCurrentAffiliateName] = useState(affiliateName || '');

  // Pagination
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

  // Reset niche when country changes
  useEffect(() => {
    setNiche('');
  }, [countryCode]);

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
    if (!city.trim() || !countryCode || !niche) {
      toast.error('Preencha todos os campos para buscar');
      return;
    }

    setSearching(true);
    setResults([]);
    setOriginalResults([]);
    setCurrentPage(1);
    setIsFiltered(false);

    try {
      const { data, error } = await supabase.functions.invoke('search-businesses-global', {
        body: { city: city.trim(), countryCode, niche, maxResults: parseInt(maxResults, 10) },
      });

      if (error) throw error;

      if (data?.success && data.results && data.results.length > 0) {
        setResults(data.results);
        setOriginalResults(data.results);
        toast.success(`${data.results.length} empresas encontradas!`);
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.info('Nenhuma empresa encontrada. Tente outra busca.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao buscar empresas');
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
      toast.success(`${filteredResults.length} empresas na área selecionada`);
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
        company_state: countryCode,
        niche,
      });
      
      setAddedNames(prev => new Set([...prev, result.name]));
      toast.success(`${result.name} added to prospects!`);
    } catch (error) {
      toast.error('Error adding prospect');
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
          affiliateName: currentAffiliateName || 'Genesis Consultant',
          countryCode,
        },
      });

      if (error) throw error;

      if (data?.message) {
        setGeneratedMessage(data.message);
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
      const country = getCountryByCode(countryCode);
      const isPortuguese = country?.language.startsWith('pt');
      
      const baseMessage = isPortuguese 
        ? `Olá, tudo bem?\n\nMe chamo ${currentAffiliateName || 'Consultor Genesis'} e trabalho ajudando negócios locais a ter presença no Google e automatizar agendamentos e atendimentos.\n\nHoje desenvolvemos:\n\n✅ Sites profissionais\n✅ Sistema de agendamento automático\n✅ Automação de WhatsApp, reduzindo atendimento manual\n\nEntrei em contato porque acredito que essas soluções podem otimizar o dia a dia do seu negócio e aumentar a conversão de clientes.\n\nSe fizer sentido, posso te explicar rapidamente como funciona.`
        : `Hello!\n\nMy name is ${currentAffiliateName || 'Genesis Consultant'} and I help local businesses improve their online presence and automate appointments and customer service.\n\nWe offer:\n\n✅ Professional websites\n✅ Automatic scheduling system\n✅ WhatsApp automation\n\nI'm reaching out because I believe these solutions can optimize your business operations and increase customer conversions.\n\nIf this sounds interesting, I can quickly explain how it works.`;
      setGeneratedMessage(baseMessage);
    } finally {
      setGeneratingProposal(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    toast.success('Message copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendViaWhatsApp = () => {
    if (selectedResult?.phone) {
      const phone = selectedResult.phone.replace(/\D/g, '');
      const country = getCountryByCode(countryCode);
      const prefix = country?.searchParams.gl === 'br' ? '55' : '';
      const message = encodeURIComponent(generatedMessage);
      window.open(`https://wa.me/${prefix}${phone}?text=${message}`, '_blank');
    }
  };

  const selectedCountry = getCountryByCode(countryCode);

  return (
    <div className="space-y-6">
      {/* Search Form - Global Theme */}
      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Country Selector - FIRST */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                🌍 País
              </Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="bg-background/50 border-border focus:border-primary">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Input */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                Cidade
              </Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={countryCode === 'BR' ? 'Ex: São Paulo' : 'Ex: Lisboa'}
                className="bg-background/50 border-border focus:border-primary"
              />
            </div>
            
            {/* Niche Selector - Adapts to country */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                Nicho
              </Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger className="bg-background/50 border-border focus:border-primary">
                  <SelectValue placeholder="Selecione o nicho" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
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
                disabled={searching || !city || !countryCode || !niche}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
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

          {/* Selected country indicator */}
          {selectedCountry && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedCountry.flag}</span>
              <span>Buscando em {selectedCountry.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground font-medium">Buscando empresas, aguarde...</p>
          <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && !searching && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {results.length} Empresas Encontradas
              {isFiltered && (
                <Badge variant="secondary" className="text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Filtrado por Área
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
                Filtrar por Área
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Badge className="bg-primary/10 text-primary border-primary/30">
                {selectedCountry?.flag} {selectedCountry?.code}
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
                          generateProposal(result);
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                        Gerar Mensagem
                      </Button>

                      <Button
                        size="sm"
                        variant={isAdded ? 'secondary' : 'default'}
                        className="gap-1"
                        disabled={isAdded || isAdding}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToProspects(result);
                        }}
                      >
                        {isAdding ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isAdded ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Salvo
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" />
                            Salvar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
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
                      variant={currentPage === pageNum ? 'default' : 'outline'}
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

      {/* Business Detail Modal - Modern Design */}
      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-0 shadow-2xl">
          {selectedResult && (
            <div className="relative">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold truncate">{selectedResult.name}</h2>
                    <p className="text-primary-foreground/80 text-sm mt-1">{niche}</p>
                    {selectedResult.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{selectedResult.rating}</span>
                        <span className="text-primary-foreground/70 text-sm">
                          ({selectedResult.reviews_count || 0} avaliações)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Business Info Cards */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">{selectedResult.address}</span>
                  </div>
                  
                  {selectedResult.phone && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Phone className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm font-mono">{selectedResult.phone}</span>
                    </div>
                  )}
                  
                  {selectedResult.website && (
                    <a 
                      href={`https://${selectedResult.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
                    >
                      <Globe className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm text-primary group-hover:underline flex-1 truncate">{selectedResult.website}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  )}

                  {/* Google Maps Link */}
                  {selectedResult.place_id && (
                    <a 
                      href={`https://www.google.com/maps/place/?q=place_id:${selectedResult.place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-colors group border border-blue-500/20"
                    >
                      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                        <span className="text-lg">📍</span>
                      </div>
                      <span className="text-sm text-blue-600 dark:text-blue-400 group-hover:underline flex-1">Ver no Google Maps</span>
                      <ExternalLink className="w-4 h-4 text-blue-500/70" />
                    </a>
                  )}
                </div>

                {/* Message Generation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <MessageSquare className="w-4 h-4" />
                      Mensagem
                    </Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateProposal(selectedResult)}
                      disabled={generatingProposal}
                      className="gap-1.5"
                    >
                      {generatingProposal ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          Gerar com IA
                        </>
                      )}
                    </Button>
                  </div>

                  <Textarea
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    placeholder="Clique em 'Gerar com IA' para criar uma mensagem personalizada..."
                    className="min-h-[180px] resize-none rounded-xl border-2 focus:border-primary"
                  />
                </div>

                {/* Action Buttons - Only Copy and WhatsApp */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 h-12 rounded-xl border-2"
                    onClick={copyToClipboard}
                    disabled={!generatedMessage}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>

                  <Button
                    className="flex-1 gap-2 h-12 rounded-xl bg-green-600 hover:bg-green-700"
                    onClick={sendViaWhatsApp}
                    disabled={!selectedResult.phone || !generatedMessage}
                  >
                    <Send className="w-5 h-5" />
                    Enviar WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Radius Filter Modal */}
      <RadiusFilterModal
        open={radiusModalOpen}
        onOpenChange={setRadiusModalOpen}
        results={originalResults}
        city={city}
        state={countryCode}
        onFilterResults={handleRadiusFilter}
      />
    </div>
  );
};
