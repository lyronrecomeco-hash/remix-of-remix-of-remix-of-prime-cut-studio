import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart2, 
  Heart, 
  Mic, 
  Radio,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PollManager } from './polls/PollManager';
import { ReactionManager } from './reactions/ReactionManager';
import { AudioRecorder } from './audio/AudioRecorder';
import { PresenceIndicator } from './presence/PresenceIndicator';
import { useConnectedInstances } from '../buttons/useConnectedInstances';

export const MessagingFeatures = () => {
  const [activeTab, setActiveTab] = useState('polls');
  const { instances, loading } = useConnectedInstances();
  
  const hasConnectedInstance = instances.length > 0;

  const features = [
    { 
      id: 'polls', 
      label: 'Enquetes', 
      icon: BarChart2, 
      description: 'Crie enquetes e capture votos automaticamente',
      status: 'new'
    },
    { 
      id: 'reactions', 
      label: 'Reações', 
      icon: Heart, 
      description: 'Envie e monitore reações em mensagens',
      status: 'new'
    },
    { 
      id: 'audio', 
      label: 'Áudio PTT', 
      icon: Mic, 
      description: 'Grave e envie áudios como mensagem de voz',
      status: 'new'
    },
    { 
      id: 'presence', 
      label: 'Presença', 
      icon: Radio, 
      description: 'Indicadores de digitando/gravando',
      status: 'new'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Features Avançadas
          </h2>
          <p className="text-muted-foreground mt-1">
            Recursos avançados do WhatsApp via Baileys
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-3 h-3" />
          Fase 1
        </Badge>
      </div>

      {/* Connection Alert */}
      {!loading && !hasConnectedInstance && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma instância conectada. Conecte uma instância para usar esses recursos.
          </AlertDescription>
        </Alert>
      )}

      {/* Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {features.map((feature) => (
            <TabsTrigger 
              key={feature.id} 
              value={feature.id}
              className="flex items-center gap-2"
            >
              <feature.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{feature.label}</span>
              {feature.status === 'new' && (
                <Badge variant="default" className="text-[10px] px-1 py-0 hidden lg:inline">
                  NEW
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Feature Cards Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-6">
          {features.map((feature) => (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all ${
                activeTab === feature.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab(feature.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activeTab === feature.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{feature.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Contents */}
        <TabsContent value="polls" className="mt-0">
          <PollManager instances={instances} />
        </TabsContent>

        <TabsContent value="reactions" className="mt-0">
          <ReactionManager instances={instances} />
        </TabsContent>

        <TabsContent value="audio" className="mt-0">
          <AudioRecorder instances={instances} />
        </TabsContent>

        <TabsContent value="presence" className="mt-0">
          <PresenceIndicator instances={instances} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
