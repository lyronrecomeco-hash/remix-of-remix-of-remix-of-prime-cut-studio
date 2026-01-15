/**
 * PROSPECT AUTOMATION - Configuration Modal
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Clock,
  Shield,
  Settings,
  Play,
  AlertTriangle,
  CheckCircle,
  Building2,
  Calendar,
  Timer,
  Keyboard,
  Activity,
  Pause,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Prospect } from '../types';
import { AutomationConfig, DEFAULT_AUTOMATION_CONFIG, GenesisInstance } from './types';
import { format, addMinutes, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AutomationConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProspects: Prospect[];
  instances: GenesisInstance[];
  onStart: (config: AutomationConfig) => Promise<void>;
  creating: boolean;
}

const DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export const AutomationConfigModal = ({
  open,
  onOpenChange,
  selectedProspects,
  instances,
  onStart,
  creating,
}: AutomationConfigModalProps) => {
  const [config, setConfig] = useState<AutomationConfig>(DEFAULT_AUTOMATION_CONFIG);
  const [currentTab, setCurrentTab] = useState('schedule');

  useEffect(() => {
    if (instances.length > 0 && !config.genesisInstanceId) {
      setConfig(c => ({ ...c, genesisInstanceId: instances[0].id }));
    }
  }, [instances]);

  const toggleDay = (day: number) => {
    setConfig(c => ({
      ...c,
      sendDays: c.sendDays.includes(day)
        ? c.sendDays.filter(d => d !== day)
        : [...c.sendDays, day].sort(),
    }));
  };

  // Calculate estimated time
  const avgDelaySeconds = (config.minDelaySeconds + config.maxDelaySeconds) / 2;
  const messagesPerMinute = 60 / avgDelaySeconds;
  const estimatedMinutes = Math.ceil(selectedProspects.length / messagesPerMinute);
  const estimatedEndTime = addMinutes(new Date(), estimatedMinutes);

  // Effective limit with warmup
  const effectiveLimit = config.warmupEnabled
    ? Math.ceil(config.dailyLimit * (config.warmupDay * config.warmupIncrementPercent) / 100)
    : config.dailyLimit;

  const handleStart = async () => {
    if (!config.genesisInstanceId) {
      return;
    }
    await onStart(config);
  };

  const validProspects = selectedProspects.filter(
    p => p.status === 'analyzed' || p.status === 'proposal_ready'
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-6 h-6 text-primary" />
            Configurar Automação em Massa
          </DialogTitle>
          <DialogDescription>
            Configure os parâmetros anti-ban e inicie o envio para {validProspects.length} prospects
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="schedule" className="gap-2">
                <Clock className="w-4 h-4" />
                Agendamento
              </TabsTrigger>
              <TabsTrigger value="antiban" className="gap-2">
                <Shield className="w-4 h-4" />
                Anti-Ban
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2">
                <Settings className="w-4 h-4" />
                Avançado
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Target className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* AGENDAMENTO */}
            <TabsContent value="schedule" className="space-y-4">
              {/* Instância WhatsApp */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4 text-primary" />
                    Instância WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {instances.length === 0 ? (
                    <Alert className="bg-yellow-500/10 border-yellow-500/30">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <AlertDescription>
                        Nenhuma instância conectada. Conecte uma instância no painel Genesis.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Select
                      value={config.genesisInstanceId}
                      onValueChange={(v) => setConfig(c => ({ ...c, genesisInstanceId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma instância" />
                      </SelectTrigger>
                      <SelectContent>
                        {instances.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              {inst.name} {inst.phone_number && `(${inst.phone_number})`}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {/* Tipo de agendamento */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4 text-primary" />
                    Quando Iniciar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={config.scheduleType === 'immediate' ? 'default' : 'outline'}
                      className="h-auto py-4 flex flex-col gap-1"
                      onClick={() => setConfig(c => ({ ...c, scheduleType: 'immediate' }))}
                    >
                      <Play className="w-5 h-5" />
                      <span className="font-semibold">Iniciar Agora</span>
                      <span className="text-xs opacity-70">Começar imediatamente</span>
                    </Button>
                    <Button
                      type="button"
                      variant={config.scheduleType === 'scheduled' ? 'default' : 'outline'}
                      className="h-auto py-4 flex flex-col gap-1"
                      onClick={() => setConfig(c => ({ ...c, scheduleType: 'scheduled' }))}
                    >
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Agendar</span>
                      <span className="text-xs opacity-70">Definir data/hora</span>
                    </Button>
                  </div>

                  {config.scheduleType === 'scheduled' && (
                    <Alert className="bg-primary/10 border-primary/30">
                      <Clock className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-sm">
                        <strong>Início Automático:</strong> A automação iniciará automaticamente
                        no horário agendado, sem necessidade de ação manual.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Horários de envio - só mostra quando agendar */}
              {config.scheduleType === 'scheduled' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="w-4 h-4 text-primary" />
                      Data e Hora do Agendamento
                    </CardTitle>
                    <CardDescription>
                      O envio iniciará automaticamente nesta data/hora
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Data e Hora de Início</Label>
                      <Input
                        type="datetime-local"
                        value={config.scheduledAt || ''}
                        onChange={(e) => setConfig(c => ({ ...c, scheduledAt: e.target.value }))}
                        className="mt-1"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Janela de horários permitidos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Timer className="w-4 h-4 text-primary" />
                    Janela de Envio
                  </CardTitle>
                  <CardDescription>
                    O envio só acontece dentro destes horários (para todos os dias)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Início</Label>
                      <Select
                        value={String(config.sendStartHour)}
                        onValueChange={(v) => setConfig(c => ({ ...c, sendStartHour: parseInt(v) }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {String(i).padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Fim</Label>
                      <Select
                        value={String(config.sendEndHour)}
                        onValueChange={(v) => setConfig(c => ({ ...c, sendEndHour: parseInt(v) }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {String(i).padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Dias da Semana Permitidos</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => (
                        <Badge
                          key={day.value}
                          variant={config.sendDays.includes(day.value) ? 'default' : 'outline'}
                          className="cursor-pointer px-3 py-1"
                          onClick={() => toggleDay(day.value)}
                        >
                          {day.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ANTI-BAN */}
            <TabsContent value="antiban" className="space-y-4">
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <Shield className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-sm">
                  <strong>Proteção Anti-Ban:</strong> Configurações otimizadas para evitar bloqueios.
                  Valores mais conservadores = menor risco de ban.
                </AlertDescription>
              </Alert>

              {/* Limites */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="w-4 h-4 text-primary" />
                    Limites de Envio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Limite Diário: {config.dailyLimit}</Label>
                      <Badge variant="outline" className="bg-primary/10">
                        Efetivo: {effectiveLimit}
                      </Badge>
                    </div>
                    <Slider
                      value={[config.dailyLimit]}
                      onValueChange={([v]) => setConfig(c => ({ ...c, dailyLimit: v }))}
                      min={10}
                      max={200}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recomendado: 30-50 para números novos
                    </p>
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Mensagens por Hora: {config.messagesPerHour}
                    </Label>
                    <Slider
                      value={[config.messagesPerHour]}
                      onValueChange={([v]) => setConfig(c => ({ ...c, messagesPerHour: v }))}
                      min={3}
                      max={30}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delays */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Timer className="w-4 h-4 text-primary" />
                    Delay Entre Mensagens
                  </CardTitle>
                  <CardDescription>
                    Tempo de espera entre cada envio (em segundos)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Delay Mínimo (seg)</Label>
                      <Input
                        type="number"
                        value={config.minDelaySeconds}
                        onChange={(e) => setConfig(c => ({ 
                          ...c, 
                          minDelaySeconds: Math.max(10, parseInt(e.target.value) || 30) 
                        }))}
                        min={10}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Delay Máximo (seg)</Label>
                      <Input
                        type="number"
                        value={config.maxDelaySeconds}
                        onChange={(e) => setConfig(c => ({ 
                          ...c, 
                          maxDelaySeconds: Math.max(30, parseInt(e.target.value) || 120) 
                        }))}
                        min={30}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Delay Adaptativo</Label>
                      <p className="text-xs text-muted-foreground">
                        Aumenta delay automaticamente se detectar riscos
                      </p>
                    </div>
                    <Switch
                      checked={config.adaptiveDelay}
                      onCheckedChange={(v) => setConfig(c => ({ ...c, adaptiveDelay: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Jitter (Aleatoriedade): {config.jitterPercent}%</Label>
                      <p className="text-xs text-muted-foreground">
                        Variação aleatória no delay para parecer humano
                      </p>
                    </div>
                    <div className="w-32">
                      <Slider
                        value={[config.jitterPercent]}
                        onValueChange={([v]) => setConfig(c => ({ ...c, jitterPercent: v }))}
                        min={10}
                        max={50}
                        step={5}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warm-up */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Warm-up Gradual
                  </CardTitle>
                  <CardDescription>
                    Aumenta o limite aos poucos para aquecer o número
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ativar Warm-up</Label>
                    <Switch
                      checked={config.warmupEnabled}
                      onCheckedChange={(v) => setConfig(c => ({ ...c, warmupEnabled: v }))}
                    />
                  </div>

                  {config.warmupEnabled && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                      <div>
                        <Label>Dia do Warm-up</Label>
                        <Input
                          type="number"
                          value={config.warmupDay}
                          onChange={(e) => setConfig(c => ({ 
                            ...c, 
                            warmupDay: Math.max(1, parseInt(e.target.value) || 1) 
                          }))}
                          min={1}
                          max={30}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Incremento (%)</Label>
                        <Input
                          type="number"
                          value={config.warmupIncrementPercent}
                          onChange={(e) => setConfig(c => ({ 
                            ...c, 
                            warmupIncrementPercent: Math.max(10, parseInt(e.target.value) || 20) 
                          }))}
                          min={10}
                          max={50}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AVANÇADO */}
            <TabsContent value="advanced" className="space-y-4">
              {/* Simulação de digitação */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Keyboard className="w-4 h-4 text-primary" />
                    Simulação de Digitação
                  </CardTitle>
                  <CardDescription>
                    Simula que você está digitando antes de enviar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ativar Simulação</Label>
                    <Switch
                      checked={config.typingSimulation}
                      onCheckedChange={(v) => setConfig(c => ({ ...c, typingSimulation: v }))}
                    />
                  </div>

                  {config.typingSimulation && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                      <div>
                        <Label>Duração Mín (seg)</Label>
                        <Input
                          type="number"
                          value={config.typingDurationMin}
                          onChange={(e) => setConfig(c => ({ 
                            ...c, 
                            typingDurationMin: Math.max(1, parseInt(e.target.value) || 2) 
                          }))}
                          min={1}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Duração Máx (seg)</Label>
                        <Input
                          type="number"
                          value={config.typingDurationMax}
                          onChange={(e) => setConfig(c => ({ 
                            ...c, 
                            typingDurationMax: Math.max(2, parseInt(e.target.value) || 5) 
                          }))}
                          min={2}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pausas aleatórias */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Pause className="w-4 h-4 text-primary" />
                    Pausas Aleatórias
                  </CardTitle>
                  <CardDescription>
                    Faz pausas maiores periodicamente para parecer mais natural
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ativar Pausas</Label>
                    <Switch
                      checked={config.randomPause}
                      onCheckedChange={(v) => setConfig(c => ({ ...c, randomPause: v }))}
                    />
                  </div>

                  {config.randomPause && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                      <div>
                        <Label>Pausa a cada X mensagens</Label>
                        <Input
                          type="number"
                          value={config.pauseEveryMessages}
                          onChange={(e) => setConfig(c => ({ 
                            ...c, 
                            pauseEveryMessages: Math.max(5, parseInt(e.target.value) || 10) 
                          }))}
                          min={5}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Duração (min)</Label>
                        <Input
                          type="number"
                          value={config.pauseDurationMinutes}
                          onChange={(e) => setConfig(c => ({ 
                            ...c, 
                            pauseDurationMinutes: Math.max(1, parseInt(e.target.value) || 5) 
                          }))}
                          min={1}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detecção de erros */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    Detecção e Proteção
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Parar em Erros Consecutivos</Label>
                      <p className="text-xs text-muted-foreground">
                        Para automaticamente se houver muitos erros seguidos
                      </p>
                    </div>
                    <Switch
                      checked={config.stopOnErrors}
                      onCheckedChange={(v) => setConfig(c => ({ ...c, stopOnErrors: v }))}
                    />
                  </div>

                  {config.stopOnErrors && (
                    <div className="pl-4 border-l-2 border-primary/20">
                      <Label>Máximo de Erros: {config.maxConsecutiveErrors}</Label>
                      <Slider
                        value={[config.maxConsecutiveErrors]}
                        onValueChange={([v]) => setConfig(c => ({ ...c, maxConsecutiveErrors: v }))}
                        min={2}
                        max={10}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Detectar Blacklist</Label>
                      <p className="text-xs text-muted-foreground">
                        Pula números que já bloquearam você
                      </p>
                    </div>
                    <Switch
                      checked={config.detectBlacklist}
                      onCheckedChange={(v) => setConfig(c => ({ ...c, detectBlacklist: v }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PREVIEW */}
            <TabsContent value="preview" className="space-y-4">
              {/* Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="w-4 h-4 text-primary" />
                    Resumo da Automação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background rounded-lg p-3 border">
                      <p className="text-sm text-muted-foreground">Prospects Selecionados</p>
                      <p className="text-2xl font-bold text-foreground">{validProspects.length}</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <p className="text-sm text-muted-foreground">Tempo Estimado</p>
                      <p className="text-2xl font-bold text-foreground">~{estimatedMinutes} min</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <p className="text-sm text-muted-foreground">Delay Médio</p>
                      <p className="text-2xl font-bold text-foreground">{avgDelaySeconds}s</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <p className="text-sm text-muted-foreground">Previsão de Término</p>
                      <p className="text-lg font-bold text-foreground">
                        {format(estimatedEndTime, 'HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prospects list */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="w-4 h-4 text-primary" />
                    Prospects a Enviar ({validProspects.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {validProspects.map((prospect, index) => (
                        <div
                          key={prospect.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                        >
                          <span className="text-xs text-muted-foreground w-6">
                            #{index + 1}
                          </span>
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm flex-1 truncate">
                            {prospect.company_name}
                          </span>
                          {prospect.generated_proposal ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Proposta Pronta
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Analisado
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Warnings */}
              {validProspects.length !== selectedProspects.length && (
                <Alert className="bg-yellow-500/10 border-yellow-500/30">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription>
                    {selectedProspects.length - validProspects.length} prospect(s) não estão prontos 
                    para envio (ainda não analisados ou já enviados).
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleStart}
            disabled={creating || !config.genesisInstanceId || validProspects.length === 0}
            className="gap-2"
          >
            {creating ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Iniciar Automação ({validProspects.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
