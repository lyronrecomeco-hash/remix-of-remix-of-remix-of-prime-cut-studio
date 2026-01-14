import { 
  Smartphone, 
  Menu,
  Home,
  User,
  Settings,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PromptBuilderState, NicheTemplate } from './types';

interface LivePreviewProps {
  state: PromptBuilderState;
  template: NicheTemplate;
}

export const LivePreview = ({ state, template }: LivePreviewProps) => {
  const { colors, typography, appName, pages } = state;

  return (
    <Card className="border border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Preview em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Phone Frame */}
        <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] bg-black rounded-[2rem] p-2 shadow-xl">
          {/* Phone Screen */}
          <div 
            className="w-full h-full rounded-[1.5rem] overflow-hidden flex flex-col"
            style={{ 
              backgroundColor: colors.background,
              fontFamily: typography,
            }}
          >
            {/* Status Bar */}
            <div 
              className="flex items-center justify-between px-4 py-2 text-xs"
              style={{ color: colors.text }}
            >
              <span>9:41</span>
              <div className="w-16 h-5 rounded-full bg-black" />
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Header */}
            <div 
              className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: colors.primary }}
            >
              <Menu className="w-5 h-5 text-white" />
              <span className="font-semibold text-white text-sm truncate max-w-[150px]">
                {appName || 'Meu App'}
              </span>
              <Bell className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {/* Welcome Card */}
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                }}
              >
                <p className="text-white text-xs opacity-80">Bem-vindo ao</p>
                <p className="text-white font-semibold text-sm">{appName || 'Meu App'}</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                {pages.slice(0, 6).map((page, i) => (
                  <div 
                    key={i}
                    className="p-2 rounded-lg text-center"
                    style={{ 
                      backgroundColor: `${colors.primary}15`,
                      color: colors.text,
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-[8px] truncate" style={{ color: colors.text }}>
                      {page.length > 12 ? page.substring(0, 12) + '...' : page}
                    </p>
                  </div>
                ))}
              </div>

              {/* Feature List */}
              {state.selectedSuggestedFeatures.length > 0 && (
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${colors.secondary}10` }}
                >
                  <p className="text-[9px] font-medium mb-1" style={{ color: colors.text }}>
                    Recursos incluídos:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {state.selectedSuggestedFeatures.slice(0, 4).map((f, i) => (
                      <span 
                        key={i}
                        className="text-[7px] px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: colors.secondary }}
                      >
                        {f.length > 15 ? f.substring(0, 15) + '...' : f}
                      </span>
                    ))}
                    {state.selectedSuggestedFeatures.length > 4 && (
                      <span 
                        className="text-[7px] px-1.5 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: `${colors.primary}20`,
                          color: colors.primary,
                        }}
                      >
                        +{state.selectedSuggestedFeatures.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div 
              className="flex items-center justify-around py-2 border-t"
              style={{ 
                borderColor: `${colors.text}20`,
                backgroundColor: colors.background,
              }}
            >
              <div className="flex flex-col items-center">
                <Home className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-[8px]" style={{ color: colors.primary }}>Início</span>
              </div>
              <div className="flex flex-col items-center opacity-50">
                <Menu className="w-4 h-4" style={{ color: colors.text }} />
                <span className="text-[8px]" style={{ color: colors.text }}>Menu</span>
              </div>
              <div className="flex flex-col items-center opacity-50">
                <User className="w-4 h-4" style={{ color: colors.text }} />
                <span className="text-[8px]" style={{ color: colors.text }}>Perfil</span>
              </div>
              <div className="flex flex-col items-center opacity-50">
                <Settings className="w-4 h-4" style={{ color: colors.text }} />
                <span className="text-[8px]" style={{ color: colors.text }}>Config</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform & Language Info */}
        <div className="p-3 bg-muted/50 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>🎨 {typography}</span>
          <span>•</span>
          <span>🌐 {state.language}</span>
          <span>•</span>
          <span>⚡ {state.platform}</span>
        </div>
      </CardContent>
    </Card>
  );
};
