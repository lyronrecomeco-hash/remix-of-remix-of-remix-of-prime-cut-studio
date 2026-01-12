import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart2, 
  Heart, 
  Mic, 
  Radio,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { PollManager } from './polls/PollManager';
import { ReactionManager } from './reactions/ReactionManager';
import { AudioRecorder } from './audio/AudioRecorder';
import { PresenceIndicator } from './presence/PresenceIndicator';
import { useConnectedInstances } from '../buttons/useConnectedInstances';

type FeatureId = 'polls' | 'reactions' | 'audio' | 'presence';

interface Feature {
  id: FeatureId;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const features: Feature[] = [
  { 
    id: 'polls', 
    label: 'Enquetes', 
    icon: BarChart2, 
    description: 'Crie enquetes e capture votos',
    color: 'bg-blue-500/10 text-blue-500'
  },
  { 
    id: 'reactions', 
    label: 'Reações', 
    icon: Heart, 
    description: 'Envie reações em mensagens',
    color: 'bg-pink-500/10 text-pink-500'
  },
  { 
    id: 'audio', 
    label: 'Áudio PTT', 
    icon: Mic, 
    description: 'Grave e envie mensagens de voz',
    color: 'bg-green-500/10 text-green-500'
  },
  { 
    id: 'presence', 
    label: 'Presença', 
    icon: Radio, 
    description: 'Digitando e gravando',
    color: 'bg-purple-500/10 text-purple-500'
  },
];

export const MessagingFeatures = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureId>('polls');
  const { instances, loading } = useConnectedInstances();
  
  const hasConnectedInstance = instances.length > 0;

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'polls':
        return <PollManager instances={instances} />;
      case 'reactions':
        return <ReactionManager instances={instances} />;
      case 'audio':
        return <AudioRecorder instances={instances} />;
      case 'presence':
        return <PresenceIndicator instances={instances} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Alert */}
      {!loading && !hasConnectedInstance && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma instância conectada. Conecte uma instância para usar esses recursos.
          </AlertDescription>
        </Alert>
      )}

      {/* Feature Navigation - Horizontal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          
          return (
            <Card 
              key={feature.id}
              className={cn(
                "cursor-pointer transition-all border-2 hover:shadow-md",
                isActive 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-transparent hover:border-muted-foreground/20"
              )}
              onClick={() => setActiveFeature(feature.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl shrink-0",
                    isActive ? "bg-primary text-primary-foreground" : feature.color
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{feature.label}</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 hidden sm:inline">
                        NEW
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate hidden md:block">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 shrink-0 transition-transform hidden lg:block",
                    isActive ? "text-primary rotate-90" : "text-muted-foreground"
                  )} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Content */}
      <div className="min-h-[500px]">
        {renderFeatureContent()}
      </div>
    </div>
  );
};
