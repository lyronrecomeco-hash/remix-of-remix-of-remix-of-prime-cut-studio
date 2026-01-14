import { 
  Smartphone, 
  Menu,
  Home,
  User,
  Settings,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptBuilderState, NicheTemplate } from './types';

interface LivePreviewV2Props {
  state: PromptBuilderState;
  template: NicheTemplate;
}

export const LivePreviewV2 = ({ state, template }: LivePreviewV2Props) => {
  const { colors, typography, appName, pages } = state;

  return (
    <Card className="border border-border overflow-hidden bg-card/50 backdrop-blur">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          Pré-visualização da Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Phone Frame */}
        <div className="relative mx-auto w-full max-w-[260px] aspect-[9/18] bg-zinc-900 rounded-[2.5rem] p-2 shadow-2xl">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-b-2xl z-10" />
          
          {/* Phone Screen */}
          <div 
            className="w-full h-full rounded-[2rem] overflow-hidden flex flex-col relative"
            style={{ 
              backgroundColor: colors.background,
              fontFamily: typography,
            }}
          >
            {/* Status Bar */}
            <div 
              className="flex items-center justify-between px-6 py-2 pt-6 text-[10px]"
              style={{ color: colors.text }}
            >
              <span className="font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  <div className="w-1 h-2 bg-current rounded-sm opacity-30" />
                  <div className="w-1 h-2.5 bg-current rounded-sm opacity-50" />
                  <div className="w-1 h-3 bg-current rounded-sm opacity-70" />
                  <div className="w-1 h-3.5 bg-current rounded-sm" />
                </div>
                <span className="ml-1">5G</span>
                <span className="font-medium">100%</span>
              </div>
            </div>

            {/* Header */}
            <div 
              className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: colors.primary }}
            >
              <Menu className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-sm truncate max-w-[120px]">
                {appName || 'Meu App'}
              </span>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-white/80" />
                <Bell className="w-4 h-4 text-white/80" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 space-y-3 overflow-hidden">
              {/* Welcome Card */}
              <div 
                className="p-3 rounded-xl relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                }}
              >
                <div className="absolute inset-0 bg-white/10" />
                <p className="text-white/80 text-[9px]">Bem-vindo ao</p>
                <p className="text-white font-bold text-sm">{appName || 'Meu App'}</p>
                <Badge className="mt-2 text-[8px] bg-white/20 text-white border-0">
                  {template.niche}
                </Badge>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {pages.slice(0, 6).map((page, i) => (
                  <div 
                    key={i}
                    className="p-2 rounded-lg text-center"
                    style={{ 
                      backgroundColor: `${colors.primary}15`,
                    }}
                  >
                    <div 
                      className="w-7 h-7 rounded-lg mx-auto mb-1 flex items-center justify-center"
                      style={{ backgroundColor: i === 0 ? colors.primary : `${colors.primary}30` }}
                    >
                      <Home className="w-3.5 h-3.5" style={{ color: i === 0 ? 'white' : colors.primary }} />
                    </div>
                    <p className="text-[7px] truncate" style={{ color: colors.text }}>
                      {page.length > 10 ? page.substring(0, 10) + '...' : page}
                    </p>
                  </div>
                ))}
              </div>

              {/* Feature List Card */}
              {state.selectedSuggestedFeatures.length > 0 && (
                <div 
                  className="p-2.5 rounded-lg"
                  style={{ backgroundColor: `${colors.secondary}15` }}
                >
                  <p className="text-[8px] font-semibold mb-1.5" style={{ color: colors.text }}>
                    ✨ Recursos ativos
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {state.selectedSuggestedFeatures.slice(0, 3).map((f, i) => (
                      <span 
                        key={i}
                        className="text-[6px] px-1.5 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: colors.secondary }}
                      >
                        {f.length > 12 ? f.substring(0, 12) + '...' : f}
                      </span>
                    ))}
                    {state.selectedSuggestedFeatures.length > 3 && (
                      <span 
                        className="text-[6px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ 
                          backgroundColor: `${colors.primary}20`,
                          color: colors.primary,
                        }}
                      >
                        +{state.selectedSuggestedFeatures.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FAB Button */}
            <div 
              className="absolute bottom-16 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus className="w-5 h-5 text-white" />
            </div>

            {/* Bottom Navigation */}
            <div 
              className="flex items-center justify-around py-2.5 border-t"
              style={{ 
                borderColor: `${colors.text}15`,
                backgroundColor: colors.background,
              }}
            >
              <div className="flex flex-col items-center">
                <Home className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-[7px] font-medium mt-0.5" style={{ color: colors.primary }}>Início</span>
              </div>
              <div className="flex flex-col items-center opacity-40">
                <Menu className="w-4 h-4" style={{ color: colors.text }} />
                <span className="text-[7px] mt-0.5" style={{ color: colors.text }}>Menu</span>
              </div>
              <div className="flex flex-col items-center opacity-40">
                <User className="w-4 h-4" style={{ color: colors.text }} />
                <span className="text-[7px] mt-0.5" style={{ color: colors.text }}>Perfil</span>
              </div>
              <div className="flex flex-col items-center opacity-40">
                <Settings className="w-4 h-4" style={{ color: colors.text }} />
                <span className="text-[7px] mt-0.5" style={{ color: colors.text }}>Config</span>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="flex justify-center pb-1">
              <div 
                className="w-24 h-1 rounded-full"
                style={{ backgroundColor: `${colors.text}30` }}
              />
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>🎨 {typography}</span>
          <span className="text-muted-foreground/30">•</span>
          <span>🌐 {state.language.split('-')[0].toUpperCase()}</span>
          <span className="text-muted-foreground/30">•</span>
          <span>⚡ {state.platform}</span>
        </div>
      </CardContent>
    </Card>
  );
};
