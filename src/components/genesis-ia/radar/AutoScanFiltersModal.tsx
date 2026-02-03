import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Filter,
  Globe2,
  Building2,
  MapPin,
  Save,
  X,
  Check,
  Play,
} from 'lucide-react';

export interface AutoScanFilters {
  countries: string[];
  citySizes: ('large' | 'medium' | 'small')[];
  niches: string[];
  enabled: boolean;
}

interface AutoScanFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AutoScanFilters;
  onSave: (filters: AutoScanFilters) => void;
}

// Países disponíveis para scan
const AVAILABLE_COUNTRIES = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
];

// Tamanhos de cidade
const CITY_SIZES = [
  { id: 'large', name: 'Grandes', description: 'Capitais e metrópoles (+1M hab)', icon: '🏙️' },
  { id: 'medium', name: 'Médias', description: 'Cidades regionais (100k-1M)', icon: '🌆' },
  { id: 'small', name: 'Pequenas', description: 'Cidades menores (-100k hab)', icon: '🏘️' },
];

// Nichos disponíveis
const AVAILABLE_NICHES = [
  { id: 'barbearia', name: 'Barbearia', icon: '💈' },
  { id: 'salao', name: 'Salão de Beleza', icon: '💇' },
  { id: 'manicure', name: 'Manicure/Pedicure', icon: '💅' },
  { id: 'mecanica', name: 'Oficina Mecânica', icon: '🔧' },
  { id: 'pizzaria', name: 'Pizzaria', icon: '🍕' },
  { id: 'padaria', name: 'Padaria', icon: '🥖' },
  { id: 'lanchonete', name: 'Lanchonete', icon: '🍔' },
  { id: 'petshop', name: 'Pet Shop', icon: '🐕' },
  { id: 'florista', name: 'Floricultura', icon: '💐' },
  { id: 'costureira', name: 'Costureira/Alfaiate', icon: '🧵' },
  { id: 'borracharia', name: 'Borracharia', icon: '🔩' },
  { id: 'clinica', name: 'Clínica/Consultório', icon: '🏥' },
  { id: 'academia', name: 'Academia', icon: '🏋️' },
  { id: 'restaurante', name: 'Restaurante', icon: '🍽️' },
  { id: 'lavanderia', name: 'Lavanderia', icon: '🧺' },
];

export const DEFAULT_AUTO_SCAN_FILTERS: AutoScanFilters = {
  countries: ['BR'],
  citySizes: ['large', 'medium'],
  niches: [],
  enabled: false,
};

export function AutoScanFiltersModal({
  open,
  onOpenChange,
  filters,
  onSave,
}: AutoScanFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<AutoScanFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const toggleCountry = (code: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      countries: prev.countries.includes(code)
        ? prev.countries.filter((c) => c !== code)
        : [...prev.countries, code],
    }));
  };

  const toggleCitySize = (size: 'large' | 'medium' | 'small') => {
    setLocalFilters((prev) => ({
      ...prev,
      citySizes: prev.citySizes.includes(size)
        ? prev.citySizes.filter((s) => s !== size)
        : [...prev.citySizes, size],
    }));
  };

  const toggleNiche = (niche: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      niches: prev.niches.includes(niche)
        ? prev.niches.filter((n) => n !== niche)
        : [...prev.niches, niche],
    }));
  };

  const selectAllNiches = () => {
    setLocalFilters((prev) => ({
      ...prev,
      niches: AVAILABLE_NICHES.map((n) => n.id),
    }));
  };

  const clearAllNiches = () => {
    setLocalFilters((prev) => ({
      ...prev,
      niches: [],
    }));
  };

  const handleSave = () => {
    onSave({ ...localFilters, enabled: true });
    onOpenChange(false);
  };

  const activeFiltersCount =
    localFilters.countries.length +
    localFilters.citySizes.length +
    localFilters.niches.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-[hsl(220,20%,8%)] border-white/10">
        <DialogHeader className="pb-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block text-white">Configure os Filtros do Auto-Scan</span>
              <span className="text-xs text-muted-foreground font-normal">
                Defina países, tamanho de cidade e nichos. Ao salvar, o auto-scan será ativado.
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Países */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-primary" />
                <Label className="text-sm font-semibold text-white">Países</Label>
                <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">
                  {localFilters.countries.length} selecionados
                </Badge>
              </div>
              <p className="text-xs text-white/50">
                Selecione os países onde o radar irá buscar oportunidades
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_COUNTRIES.map((country) => {
                  const isSelected = localFilters.countries.includes(country.code);
                  return (
                    <button
                      key={country.code}
                      onClick={() => toggleCountry(country.code)}
                      className={`
                        flex items-center gap-2 p-3 rounded-xl border transition-all
                        ${
                          isSelected
                            ? 'bg-primary/20 border-primary/50 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }
                      `}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-xs font-medium">{country.name}</span>
                      {isSelected && <Check className="w-3 h-3 ml-auto text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Tamanho de Cidade */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <Label className="text-sm font-semibold text-white">Tamanho das Cidades</Label>
                <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">
                  {localFilters.citySizes.length} tipos
                </Badge>
              </div>
              <p className="text-xs text-white/50">
                Filtre por porte das cidades - grandes capitais têm mais concorrência mas maior volume
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CITY_SIZES.map((size) => {
                  const isSelected = localFilters.citySizes.includes(
                    size.id as 'large' | 'medium' | 'small'
                  );
                  return (
                    <button
                      key={size.id}
                      onClick={() =>
                        toggleCitySize(size.id as 'large' | 'medium' | 'small')
                      }
                      className={`
                        flex flex-col items-start gap-1 p-4 rounded-xl border transition-all text-left
                        ${
                          isSelected
                            ? 'bg-primary/20 border-primary/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xl">{size.icon}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="text-sm font-semibold text-white">{size.name}</span>
                      <span className="text-[10px] text-white/50">{size.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Nichos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-semibold text-white">Nichos de Negócio</Label>
                  <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">
                    {localFilters.niches.length === 0
                      ? 'Todos'
                      : `${localFilters.niches.length} selecionados`}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllNiches}
                    className="h-7 text-xs text-white/50 hover:text-white"
                  >
                    Todos
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNiches}
                    className="h-7 text-xs text-white/50 hover:text-white"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              <p className="text-xs text-white/50">
                Deixe vazio para buscar todos os nichos ou selecione específicos
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_NICHES.map((niche) => {
                  const isSelected = localFilters.niches.includes(niche.id);
                  return (
                    <button
                      key={niche.id}
                      onClick={() => toggleNiche(niche.id)}
                      className={`
                        flex items-center gap-2 p-2.5 rounded-lg border transition-all
                        ${
                          isSelected
                            ? 'bg-primary/20 border-primary/50 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }
                      `}
                    >
                      <span className="text-base">{niche.icon}</span>
                      <span className="text-xs font-medium truncate">{niche.name}</span>
                      {isSelected && <Check className="w-3 h-3 ml-auto text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-xs text-white/50">
            {activeFiltersCount > 0
              ? `${activeFiltersCount} filtros ativos`
              : 'Nenhum filtro configurado'}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Play className="w-4 h-4" />
              Salvar e Ativar Auto-Scan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
