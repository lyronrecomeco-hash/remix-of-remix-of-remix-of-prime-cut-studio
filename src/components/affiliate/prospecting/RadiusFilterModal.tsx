import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Filter, Loader2 } from 'lucide-react';
import RadiusMap from './RadiusMap';
import 'leaflet/dist/leaflet.css';

interface SearchResult {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  latitude?: number;
  longitude?: number;
}

interface RadiusFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: SearchResult[];
  city: string;
  state: string;
  onFilterResults: (filteredResults: SearchResult[]) => void;
}

// Haversine formula to calculate distance between two points
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function RadiusFilterModal({
  open,
  onOpenChange,
  results,
  city,
  state,
  onFilterResults,
}: RadiusFilterModalProps) {
  const [center, setCenter] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo default
  const [radius, setRadius] = useState(5); // km
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Geocode the city/state on open
  useEffect(() => {
    if (open && city && state && !initialized) {
      geocodeLocation(`${city}, ${state}, Brasil`);
      setInitialized(true);
    }
  }, [open, city, state, initialized]);

  // Delay map rendering after dialog opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setShowMap(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowMap(false);
      setInitialized(false);
      setSearchQuery('');
    }
  }, [open]);

  // Calculate filtered count when center or radius changes
  useEffect(() => {
    const count = results.filter(r => {
      if (!r.latitude || !r.longitude) return false;
      const distance = haversineDistance(center[0], center[1], r.latitude, r.longitude);
      return distance <= radius;
    }).length;
    setFilteredCount(count);
  }, [center, radius, results]);

  const geocodeLocation = async (query: string) => {
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'LovableProspector/1.0',
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      geocodeLocation(`${searchQuery}, ${city}, ${state}, Brasil`);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCenter([lat, lng]);
  };

  const handleApplyFilter = () => {
    const filtered = results.filter(r => {
      if (!r.latitude || !r.longitude) return true; // Keep results without coords
      const distance = haversineDistance(center[0], center[1], r.latitude, r.longitude);
      return distance <= radius;
    });
    onFilterResults(filtered);
    onOpenChange(false);
  };

  const handleClearFilter = () => {
    onFilterResults(results);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Filtrar por Localização
          </DialogTitle>
          <DialogDescription>
            Clique no mapa ou busque um bairro para definir o centro. Ajuste o raio para filtrar os estabelecimentos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar bairro, rua ou local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <Button onClick={handleSearch} disabled={searching} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Map */}
          <div className="h-[400px] rounded-lg overflow-hidden border bg-muted/20">
            {showMap ? (
              <RadiusMap
                center={center}
                radius={radius}
                onMapClick={handleMapClick}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando mapa...</span>
              </div>
            )}
          </div>

          {/* Radius slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Raio de busca</Label>
              <span className="text-sm font-medium text-primary">{radius} km</span>
            </div>
            <Slider
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{filteredCount}</strong> de <strong>{results.length}</strong> estabelecimentos na área
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              (com coordenadas disponíveis)
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClearFilter}>
              Limpar Filtro
            </Button>
            <Button onClick={handleApplyFilter}>
              Aplicar Filtro ({filteredCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
