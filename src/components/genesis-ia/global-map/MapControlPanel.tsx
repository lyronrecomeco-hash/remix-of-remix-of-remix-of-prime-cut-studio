import { 
  Eye, 
  EyeOff, 
  Moon, 
  Sun, 
  RotateCcw, 
  Pause, 
  Cloud, 
  CloudOff,
  Circle,
  Clock,
  Building2,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapConfig } from './types';
import { cn } from '@/lib/utils';

interface MapControlPanelProps {
  config: MapConfig;
  onConfigChange: (config: MapConfig) => void;
  stats: {
    total: number;
    critical: number;
    warning: number;
    good: number;
    nightBusinesses: number;
    openNow: number;
    filtered: number;
  };
}

export const MapControlPanel = ({ config, onConfigChange, stats }: MapControlPanelProps) => {
  const toggleConfig = (key: keyof MapConfig) => {
    onConfigChange({ ...config, [key]: !config[key] });
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md border border-border rounded-xl p-4 shadow-2xl w-72">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Controles do Mapa
        </h3>
        <Badge variant="outline" className="text-xs">
          {stats.filtered}/{stats.total}
        </Badge>
      </div>

      {/* Status Filters */}
      <div className="space-y-3 mb-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Filtrar por Status
        </p>
        
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 fill-red-500 text-red-500" />
              <span className="text-sm">Alta Oportunidade</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs h-5 bg-red-500/10 text-red-500">
                {stats.critical}
              </Badge>
              <Switch
                checked={config.showCritical}
                onCheckedChange={() => toggleConfig('showCritical')}
              />
            </div>
          </label>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              <span className="text-sm">Média Oportunidade</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs h-5 bg-yellow-500/10 text-yellow-500">
                {stats.warning}
              </Badge>
              <Switch
                checked={config.showWarning}
                onCheckedChange={() => toggleConfig('showWarning')}
              />
            </div>
          </label>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 fill-green-500 text-green-500" />
              <span className="text-sm">Baixa Oportunidade</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs h-5 bg-green-500/10 text-green-500">
                {stats.good}
              </Badge>
              <Switch
                checked={config.showGood}
                onCheckedChange={() => toggleConfig('showGood')}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Special Filters */}
      <div className="space-y-3 mb-4 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Filtros Especiais
        </p>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-400" />
            <span className="text-sm">Apenas Noturnos</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs h-5 bg-purple-500/10 text-purple-400">
              {stats.nightBusinesses}
            </Badge>
            <Switch
              checked={config.showNightOnly}
              onCheckedChange={() => toggleConfig('showNightOnly')}
            />
          </div>
        </label>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">Abertos Agora</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs h-5 bg-emerald-500/10 text-emerald-400">
              {stats.openNow}
            </Badge>
            <Switch
              checked={config.showOpenNow}
              onCheckedChange={() => toggleConfig('showOpenNow')}
            />
          </div>
        </label>
      </div>

      {/* Visual Options */}
      <div className="space-y-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Opções Visuais
        </p>
        
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <RotateCcw className={cn(
              "w-4 h-4 transition-transform",
              config.autoRotate && "animate-spin"
            )} style={{ animationDuration: '3s' }} />
            <span className="text-sm">Rotação Automática</span>
          </div>
          <Switch
            checked={config.autoRotate}
            onCheckedChange={() => toggleConfig('autoRotate')}
          />
        </label>
        
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            {config.showAtmosphere ? (
              <Cloud className="w-4 h-4 text-blue-400" />
            ) : (
              <CloudOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm">Atmosfera</span>
          </div>
          <Switch
            checked={config.showAtmosphere}
            onCheckedChange={() => toggleConfig('showAtmosphere')}
          />
        </label>
      </div>

      {/* Stats Summary */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Exibindo:</span>
          <span className="font-bold text-primary">{stats.filtered} empresas</span>
        </div>
      </div>
    </div>
  );
};
