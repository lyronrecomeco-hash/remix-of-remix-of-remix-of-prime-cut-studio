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
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Mail,
  Map,
  Clock,
  AlertCircle,
  GlobeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RadiusFilterModal } from '../RadiusFilterModal';
import { COUNTRIES, BRAZILIAN_STATES, getNichesForCountry, getCountryByCode } from '../global/globalSearchData';

const ITEMS_PER_PAGE = 12;

interface SearchResult {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  generatedMessage?: string;
  localTime?: string;
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

export const SearchClientsTab = ({ affiliateId, affiliateName, onAddProspect }: SearchClientsTabProps) => {
  // Search form state
  const [countryCode, setCountryCode] = useState('BR');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');
  const [excludeWithWebsite, setExcludeWithWebsite] = useState(false);
  
  // Results state
  const [searching, setSearching] = useState(false);
  const [generatingMessages, setGeneratingMessages] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [originalResults, setOriginalResults] = useState<SearchResult[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [radiusModalOpen, setRadiusModalOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  // Modal state
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set());
  const [editedMessage, setEditedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [sending, setSending] = useState(false);
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

  // Reset niche and state when country changes
  useEffect(() => {
    setNiche('');
    setState('');
  }, [countryCode]);

  // Update edited message when selecting a result
  useEffect(() => {
    if (selectedResult?.generatedMessage) {
      setEditedMessage(selectedResult.generatedMessage);
    }
  }, [selectedResult]);

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
    if (!city.trim() || !countryCode || !niche || (countryCode === 'BR' && !state)) {
      toast.error('Preencha todos os campos para buscar');
      return;
    }

    setSearching(true);
    setResults([]);
    setOriginalResults([]);
    setCurrentPage(1);
    setIsFiltered(false);

    const localTime = getLocalTime(countryCode);

    try {
      // Build search query with state for Brazil
      const searchCity = countryCode === 'BR' && state ? `${city.trim()}, ${state}` : city.trim();
      
      // Step 1: Search businesses (limited for speed)
      const { data: searchData, error: searchError } = await supabase.functions.invoke('search-businesses-global', {
        body: { city: searchCity, countryCode, niche, maxResults: 50 },
      });

      if (searchError) throw searchError;

      if (!searchData?.success || !searchData.results?.length) {
        toast.info('Nenhuma empresa encontrada. Tente outra busca.');
        setSearching(false);
        return;
      }

      let businessResults: SearchResult[] = searchData.results.map((r: SearchResult) => ({
        ...r,
        localTime
      }));

      // Filter out results with website if checkbox is checked
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

      toast.success(`${businessResults.length} empresas encontradas! Gerando mensagens...`);
      
      // Step 2: Generate messages in bulk (in parallel with UI update)
      setGeneratingMessages(true);
      
      // Show results immediately before messages
      setResults(businessResults);
      setOriginalResults(businessResults);
      
      const { data: messageData, error: messageError } = await supabase.functions.invoke('generate-bulk-proposals', {
        body: {
          businesses: businessResults.slice(0, 30).map(b => ({
            name: b.name,
            niche: b.category || niche,
            address: b.address,
            phone: b.phone,
            website: b.website,
            rating: b.rating,
          })),
          affiliateName: currentAffiliateName || 'Consultor Genesis',
          countryCode,
        },
      });

      // Merge messages with results
      let finalResults = businessResults;
      
      if (!messageError && messageData?.messages) {
        const messagesArray = messageData.messages as Array<{ name: string; message: string }>;
        const messageRecord: Record<string, string> = {};
        messagesArray.forEach((m) => { messageRecord[m.name] = m.message; });
        
        finalResults = businessResults.map(result => ({
          ...result,
          generatedMessage: messageRecord[result.name] || undefined,
        }));
        
        toast.success('Mensagens geradas com sucesso!');
      } else {
        console.error('Error generating messages:', messageError);
        toast.warning('Empresas encontradas, mas houve erro ao gerar mensagens.');
      }

      setResults(finalResults);
      setOriginalResults(finalResults);

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao buscar empresas');
    } finally {
      setSearching(false);
      setGeneratingMessages(false);
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
        company_state: countryCode === 'BR' ? state : countryCode,
        niche,
      });
      
      setAddedNames(prev => new Set([...prev, result.name]));
      toast.success(`${result.name} salvo nos prospectos!`);
    } catch (error) {
      toast.error('Erro ao salvar prospecto');
    } finally {
      setAddingId(null);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(editedMessage);
    setCopied(true);
    toast.success('Mensagem copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPhone = async () => {
    if (!selectedResult?.phone) return;
    await navigator.clipboard.writeText(selectedResult.phone);
    setPhoneCopied(true);
    toast.success('Telefone copiado!');
    setTimeout(() => setPhoneCopied(false), 2000);
  };

  const sendViaWhatsApp = async () => {
    if (!selectedResult?.phone || !editedMessage) {
      toast.error('Telefone ou mensagem não disponível');
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-genesis', {
        body: {
          affiliateId,
          phone: selectedResult.phone,
          message: editedMessage,
          countryCode,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Mensagem enviada com sucesso via WhatsApp!');
        setSelectedResult(null);
      } else {
        throw new Error(data?.error || 'Erro ao enviar');
      }
    } catch (error: any) {
      console.error('Send error:', error);
      
      // Fallback: Open WhatsApp Web
      const phone = selectedResult.phone.replace(/\D/g, '');
      const country = getCountryByCode(countryCode);
      const prefix = country?.searchParams.gl === 'br' ? '55' : '';
      const message = encodeURIComponent(editedMessage);
      window.open(`https://wa.me/${prefix}${phone}?text=${message}`, '_blank');
      
      toast.info('Abrindo WhatsApp Web (configure uma instância Genesis para envio automático)');
    } finally {
      setSending(false);
    }
  };

  const selectedCountry = getCountryByCode(countryCode);
  const currentLocalTime = getLocalTime(countryCode);

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Country Selector */}
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

            {/* State Selector (only for Brazil) */}
            {countryCode === 'BR' && (
              <div>
                <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Estado
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="bg-background/50 border-border focus:border-primary">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {BRAZILIAN_STATES.map(s => (
                      <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
            
            {/* Niche Selector */}
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
                disabled={searching || !city || !countryCode || !niche || (countryCode === 'BR' && !state)}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {generatingMessages ? 'Gerando...' : 'Buscando...'}
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

          {/* Filter options */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="excludeWebsite" 
                checked={excludeWithWebsite}
                onCheckedChange={(checked) => setExcludeWithWebsite(checked === true)}
              />
              <label 
                htmlFor="excludeWebsite" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1.5"
              >
                <GlobeIcon className="w-4 h-4 text-muted-foreground" />
                Apenas empresas <strong className="text-primary">sem site</strong>
              </label>
            </div>

            {selectedCountry && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                <Clock className="w-4 h-4" />
                <span>{selectedCountry.flag} {currentLocalTime}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {(searching || generatingMessages) && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground font-medium">
            {generatingMessages ? 'Gerando mensagens com IA...' : 'Buscando empresas...'}
          </p>
          <p className="text-sm text-muted-foreground">Máximo 5 segundos</p>
        </div>
      )}

      {/* Empty State - No search yet */}
      {results.length === 0 && !searching && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="w-10 h-10 text-primary/50" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Faça uma busca</h3>
            <p className="text-muted-foreground max-w-md">
              Preencha os campos acima e clique em buscar. Os resultados aparecerão aqui com mensagens personalizadas geradas por IA.
            </p>
          </div>
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
                  Filtrado
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
              <Badge className="bg-primary/10 text-primary border-primary/30 gap-1">
                <Clock className="w-3 h-3" />
                {currentLocalTime}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedResults.map((result, idx) => {
              const isAdded = addedNames.has(result.name);
              const isAdding = addingId === result.name;
              const hasMessage = !!result.generatedMessage;

              return (
                <Card
                  key={`${result.name}-${idx}`}
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
                    isAdded 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : hasMessage
                        ? 'border-primary/30 bg-primary/5'
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
                  
                  {hasMessage && !isAdded && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Mensagem
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate pr-20 group-hover:text-primary transition-colors">
                          {result.name}
                        </h4>

                        <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {result.address}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {result.localTime && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Clock className="w-3 h-3" />
                              {result.localTime}
                            </Badge>
                          )}

                          {result.rating && (
                            <Badge variant="secondary" className="text-xs gap-1 bg-amber-500/10 text-amber-500 border-amber-500/30">
                              <Star className="w-3 h-3 fill-current" />
                              {result.rating}
                            </Badge>
                          )}

                          {result.phone && (
                            <Badge variant="outline" className="text-xs gap-1 font-mono">
                              <Phone className="w-3 h-3" />
                            </Badge>
                          )}

                          {!result.website && (
                            <Badge variant="outline" className="text-xs gap-1 text-orange-500 border-orange-500/30">
                              <Globe className="w-3 h-3" />
                              Sem site
                            </Badge>
                          )}

                          {result.website && (
                            <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30">
                              <Globe className="w-3 h-3" />
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
                        <MessageSquare className="w-3 h-3" />
                        Ver Detalhes
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
              
              <span className="text-sm text-muted-foreground px-4">
                Página {currentPage} de {totalPages}
              </span>
              
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

      {/* Enhanced Business Detail Modal */}
      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          {selectedResult && (
            <div className="relative">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground sticky top-0 z-10">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold truncate">{selectedResult.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-white/20 border-0 text-white">
                        {niche}
                      </Badge>
                      {selectedResult.localTime && (
                        <Badge className="bg-white/20 border-0 text-white gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedResult.localTime}
                        </Badge>
                      )}
                    </div>
                    {selectedResult.rating && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{selectedResult.rating}</span>
                        </div>
                        <span className="text-primary-foreground/70 text-sm">
                          ({selectedResult.reviews_count || 0} avaliações)
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary-foreground hover:bg-white/20 shrink-0"
                    onClick={() => setSelectedResult(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Business Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Address */}
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Endereço</p>
                      <p className="text-sm mt-1">{selectedResult.address}</p>
                    </div>
                  </div>
                  
                  {/* Phone with Copy */}
                  {selectedResult.phone && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl border border-border/50 group/phone">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Telefone</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-mono">{selectedResult.phone}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover/phone:opacity-100 transition-opacity"
                            onClick={copyPhone}
                          >
                            {phoneCopied ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Email */}
                  {selectedResult.email && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">E-mail</p>
                        <a 
                          href={`mailto:${selectedResult.email}`}
                          className="text-sm mt-1 text-blue-500 hover:underline block truncate"
                        >
                          {selectedResult.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Website */}
                  {selectedResult.website ? (
                    <a 
                      href={`https://${selectedResult.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl border border-border/50 hover:bg-muted/80 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Website</p>
                        <p className="text-sm mt-1 text-primary group-hover:underline truncate">{selectedResult.website}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-3" />
                    </a>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Website</p>
                        <p className="text-sm mt-1 text-orange-700 dark:text-orange-400 font-medium">
                          ⚡ Sem site - Oportunidade!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Maps Link */}
                {selectedResult.place_id && (
                  <a 
                    href={`https://www.google.com/maps/place/?q=place_id:${selectedResult.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl border border-blue-500/20 hover:from-blue-500/20 hover:to-green-500/20 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <Map className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ver Perfil no Google Maps</p>
                      <p className="text-xs text-muted-foreground">Fotos, horários, avaliações e mais</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-blue-500" />
                  </a>
                )}

                {/* Message Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Mensagem de Prospecção
                    </Label>
                    {selectedResult.generatedMessage && (
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="w-3 h-3" />
                        Gerada com IA
                      </Badge>
                    )}
                  </div>

                  {selectedResult.generatedMessage ? (
                    <Textarea
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      className="min-h-[200px] resize-none rounded-xl border-2 focus:border-primary text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Mensagem não disponível. Faça uma nova busca para gerar mensagens automaticamente.
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 h-12 rounded-xl border-2"
                    onClick={copyToClipboard}
                    disabled={!editedMessage}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copiado!' : 'Copiar Mensagem'}
                  </Button>

                  <Button
                    className="flex-1 gap-2 h-12 rounded-xl bg-green-600 hover:bg-green-700"
                    onClick={sendViaWhatsApp}
                    disabled={!selectedResult.phone || !editedMessage || sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar WhatsApp
                      </>
                    )}
                  </Button>
                </div>

                {!selectedResult.phone && (
                  <p className="text-xs text-muted-foreground text-center">
                    ⚠️ Telefone não disponível para esta empresa
                  </p>
                )}
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
