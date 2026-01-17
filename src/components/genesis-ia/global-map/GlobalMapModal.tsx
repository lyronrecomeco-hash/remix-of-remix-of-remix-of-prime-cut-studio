import { useEffect, Suspense } from 'react';
import { X, Loader2, RefreshCw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Globe3D } from './Globe3D';
import { MapControlPanel } from './MapControlPanel';
import { MarkerDetailPanel } from './MarkerDetailPanel';
import { useGlobeData } from './useGlobeData';
import { toast } from 'sonner';

interface GlobalMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Loading fallback for 3D globe
const GlobeLoading = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-950">
    <Loader2 className="w-12 h-12 animate-spin text-primary" />
    <p className="text-muted-foreground">Carregando mapa 3D...</p>
  </div>
);

export const GlobalMapModal = ({ open, onOpenChange }: GlobalMapModalProps) => {
  const {
    markers,
    loading,
    loadMarkers,
    selectedMarker,
    setSelectedMarker,
    config,
    setConfig,
    stats
  } = useGlobeData();

  useEffect(() => {
    if (open && markers.length === 0) {
      loadMarkers();
    }
  }, [open, markers.length, loadMarkers]);

  const handleAddProspect = (marker: any) => {
    toast.success(`${marker.name} adicionado à lista de prospects!`);
    setSelectedMarker(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 bg-slate-950 border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-2xl">🌍</span>
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Mapa Global 3D</h2>
              <p className="text-xs text-muted-foreground">
                {stats.filtered} empresas visíveis de {stats.total} total
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800"
              onClick={loadMarkers}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-slate-800"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative w-full h-full">
          {loading ? (
            <GlobeLoading />
          ) : (
            <Suspense fallback={<GlobeLoading />}>
              <Globe3D
                markers={markers}
                onMarkerClick={setSelectedMarker}
                autoRotate={config.autoRotate}
                showAtmosphere={config.showAtmosphere}
              />
            </Suspense>
          )}

          {/* Control Panel */}
          <MapControlPanel
            config={config}
            onConfigChange={setConfig}
            stats={stats}
          />

          {/* Detail Panel */}
          <MarkerDetailPanel
            marker={selectedMarker}
            onClose={() => setSelectedMarker(null)}
            onAddProspect={handleAddProspect}
          />

          {/* Bottom Stats Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 px-6 py-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse" />
              <span className="text-sm text-white font-medium">{stats.critical}</span>
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
              <span className="text-sm text-white font-medium">{stats.warning}</span>
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <span className="text-sm text-white font-medium">{stats.good}</span>
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <div className="flex items-center gap-2">
              <span className="text-purple-400">🌙</span>
              <span className="text-sm text-white font-medium">{stats.nightBusinesses}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
