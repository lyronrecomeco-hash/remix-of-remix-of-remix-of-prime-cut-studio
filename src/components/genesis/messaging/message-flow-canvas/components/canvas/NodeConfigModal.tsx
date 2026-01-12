// Node Configuration Modal - Enhanced with all node types
import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Type, LayoutGrid, List, Mic, BarChart2, Heart, Radio, Clock, GitBranch, 
  Plus, Trash2, Save, Play, Smartphone, Globe, Calendar, UserPlus, UserMinus,
  Filter, UserX, AlertTriangle, Bell, ShieldAlert, Link2Off, BookOpen, Hash,
  Variable, Square, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageNodeType } from '../../types';

interface NodeConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: Node;
  onSave: (config: Record<string, any>) => void;
}

const nodeIcons: Record<string, React.ElementType> = {
  'advanced-text': Type,
  'button-message': LayoutGrid,
  'list-message': List,
  'audio-ptt': Mic,
  'poll': BarChart2,
  'expected-reaction': Heart,
  'presence': Radio,
  'smart-delay': Clock,
  'condition': GitBranch,
  'start-trigger': Play,
  'instance-connector': Smartphone,
  'webhook-trigger': Globe,
  'schedule-trigger': Calendar,
  'group-welcome': UserPlus,
  'group-goodbye': UserMinus,
  'keyword-filter': Filter,
  'keyword-delete': Trash2,
  'member-kick': UserX,
  'member-warn': AlertTriangle,
  'group-reminder': Bell,
  'anti-spam': ShieldAlert,
  'anti-link': Link2Off,
  'group-rules': BookOpen,
  'member-counter': Hash,
  'http-request': Globe,
  'set-variable': Variable,
  'end-flow': Square,
};

const nodeLabels: Record<string, string> = {
  'advanced-text': 'Texto Avançado',
  'button-message': 'Mensagem com Botões',
  'list-message': 'Lista de Opções',
  'audio-ptt': 'Áudio PTT',
  'poll': 'Enquete',
  'expected-reaction': 'Reação Esperada',
  'presence': 'Presença',
  'smart-delay': 'Delay Inteligente',
  'condition': 'Condição',
  'start-trigger': 'Início do Flow',
  'instance-connector': 'Instância WhatsApp',
  'webhook-trigger': 'Webhook',
  'schedule-trigger': 'Agendamento',
  'group-welcome': 'Boas-vindas',
  'group-goodbye': 'Despedida',
  'keyword-filter': 'Filtro de Palavras',
  'keyword-delete': 'Apagar Mensagem',
  'member-kick': 'Remover Membro',
  'member-warn': 'Avisar Membro',
  'group-reminder': 'Lembrete',
  'anti-spam': 'Anti-Spam',
  'anti-link': 'Anti-Link',
  'group-rules': 'Regras do Grupo',
  'member-counter': 'Contador',
  'http-request': 'HTTP Request',
  'set-variable': 'Definir Variável',
  'end-flow': 'Fim do Flow',
};

export const NodeConfigModal = ({ open, onOpenChange, node, onSave }: NodeConfigModalProps) => {
  const nodeData = node.data as Record<string, unknown>;
  const [config, setConfig] = useState<Record<string, any>>((nodeData?.config as Record<string, any>) || {});
  const [label, setLabel] = useState<string>((nodeData?.label as string) || '');

  useEffect(() => {
    const data = node.data as Record<string, unknown>;
    setConfig((data?.config as Record<string, any>) || {});
    setLabel((data?.label as string) || '');
  }, [node]);

  const NodeIcon = nodeIcons[node.type as string] || Zap;
  const nodeType = node.type as MessageNodeType;

  const handleSave = () => {
    onSave({ ...config, label });
  };

  const renderConfigFields = () => {
    switch (nodeType) {
      case 'advanced-text':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Digite sua mensagem... Use {{variavel}} para variáveis"
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Variáveis disponíveis</Label>
              <div className="flex flex-wrap gap-1.5">
                {['nome', 'telefone', 'email', 'empresa'].map((v) => (
                  <Badge key={v} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Formatação WhatsApp</Label>
              <Switch
                checked={config.useFormatting || false}
                onCheckedChange={(v) => setConfig({ ...config, useFormatting: v })}
              />
            </div>
          </div>
        );

      case 'button-message':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Texto da mensagem</Label>
              <Textarea
                placeholder="Mensagem que acompanha os botões"
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Botões (máx. 3)</Label>
                {(config.buttons?.length || 0) < 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfig({
                      ...config,
                      buttons: [...(config.buttons || []), { id: Date.now(), text: '' }]
                    })}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {(config.buttons || []).map((btn: any, i: number) => (
                  <div key={btn.id} className="flex gap-2">
                    <Input
                      placeholder={`Botão ${i + 1}`}
                      value={btn.text}
                      onChange={(e) => {
                        const buttons = [...config.buttons];
                        buttons[i] = { ...btn, text: e.target.value };
                        setConfig({ ...config, buttons });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const buttons = config.buttons.filter((_: any, j: number) => j !== i);
                        setConfig({ ...config, buttons });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'poll':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pergunta da enquete</Label>
              <Input
                placeholder="Qual opção você prefere?"
                value={config.question || ''}
                onChange={(e) => setConfig({ ...config, question: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opções</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfig({
                    ...config,
                    options: [...(config.options || []), '']
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              {(config.options || []).map((opt: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Opção ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const options = [...config.options];
                      options[i] = e.target.value;
                      setConfig({ ...config, options });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const options = config.options.filter((_: any, j: number) => j !== i);
                      setConfig({ ...config, options });
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Label>Permitir múltiplas respostas</Label>
              <Switch
                checked={config.allowMultiple || false}
                onCheckedChange={(v) => setConfig({ ...config, allowMultiple: v })}
              />
            </div>
          </div>
        );

      case 'smart-delay':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Delay base (segundos): {config.baseDelay || 3}s</Label>
              <Slider
                value={[config.baseDelay || 3]}
                min={1}
                max={30}
                step={1}
                onValueChange={([v]) => setConfig({ ...config, baseDelay: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Variação aleatória: ±{config.variation || 1}s</Label>
              <Slider
                value={[config.variation || 1]}
                min={0}
                max={10}
                step={0.5}
                onValueChange={([v]) => setConfig({ ...config, variation: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Anti-ban (delay adaptativo)</Label>
              <Switch
                checked={config.antiBan || false}
                onCheckedChange={(v) => setConfig({ ...config, antiBan: v })}
              />
            </div>
          </div>
        );

      // Group Management Nodes
      case 'group-welcome':
      case 'group-goodbye':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{nodeType === 'group-welcome' ? 'Mensagem de boas-vindas' : 'Mensagem de despedida'}</Label>
              <Textarea
                placeholder="Use {{nome}} para o nome do membro"
                value={config.welcomeMessage || config.goodbyeMessage || ''}
                onChange={(e) => setConfig({ 
                  ...config, 
                  [nodeType === 'group-welcome' ? 'welcomeMessage' : 'goodbyeMessage']: e.target.value 
                })}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mencionar membro</Label>
              <Switch
                checked={config.mentionMember || false}
                onCheckedChange={(v) => setConfig({ ...config, mentionMember: v })}
              />
            </div>
          </div>
        );

      case 'keyword-filter':
      case 'keyword-delete':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Palavras-chave (uma por linha)</Label>
              <Textarea
                placeholder="palavra1&#10;palavra2&#10;palavra3"
                value={(config.keywords || []).join('\n')}
                onChange={(e) => setConfig({ 
                  ...config, 
                  keywords: e.target.value.split('\n').filter(k => k.trim()) 
                })}
                className="min-h-[120px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ignorar maiúsculas/minúsculas</Label>
              <Switch
                checked={config.caseInsensitive ?? true}
                onCheckedChange={(v) => setConfig({ ...config, caseInsensitive: v })}
              />
            </div>
            {nodeType === 'keyword-delete' && (
              <div className="flex items-center justify-between">
                <Label>Avisar membro</Label>
                <Switch
                  checked={config.warnMember || false}
                  onCheckedChange={(v) => setConfig({ ...config, warnMember: v })}
                />
              </div>
            )}
          </div>
        );

      case 'member-kick':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Número máximo de avisos: {config.maxWarnings || 3}</Label>
              <Slider
                value={[config.maxWarnings || 3]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) => setConfig({ ...config, maxWarnings: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem ao expulsar</Label>
              <Input
                placeholder="Você foi removido por violar as regras"
                value={config.kickMessage || ''}
                onChange={(e) => setConfig({ ...config, kickMessage: e.target.value })}
              />
            </div>
          </div>
        );

      case 'member-warn':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mensagem de aviso</Label>
              <Textarea
                placeholder="⚠️ {{nome}}, essa é uma advertência!"
                value={config.warningMessage || ''}
                onChange={(e) => setConfig({ ...config, warningMessage: e.target.value })}
              />
            </div>
          </div>
        );

      case 'group-reminder':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mensagem do lembrete</Label>
              <Textarea
                placeholder="🔔 Lembrete: ..."
                value={config.reminderMessage || ''}
                onChange={(e) => setConfig({ ...config, reminderMessage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário do lembrete</Label>
              <Input
                type="time"
                value={config.reminderTime || ''}
                onChange={(e) => setConfig({ ...config, reminderTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Repetir</Label>
              <Select
                value={config.repeat || 'daily'}
                onValueChange={(v) => setConfig({ ...config, repeat: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Uma vez</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'anti-spam':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Máximo de mensagens por minuto: {config.maxMessages || 5}</Label>
              <Slider
                value={[config.maxMessages || 5]}
                min={2}
                max={20}
                step={1}
                onValueChange={([v]) => setConfig({ ...config, maxMessages: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ação ao detectar spam</Label>
              <Select
                value={config.action || 'warn'}
                onValueChange={(v) => setConfig({ ...config, action: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warn">Avisar</SelectItem>
                  <SelectItem value="mute">Silenciar</SelectItem>
                  <SelectItem value="kick">Remover</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'anti-link':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Bloquear todos os links</Label>
              <Switch
                checked={config.blockAll ?? true}
                onCheckedChange={(v) => setConfig({ ...config, blockAll: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Domínios permitidos (um por linha)</Label>
              <Textarea
                placeholder="youtube.com&#10;instagram.com"
                value={(config.allowedDomains || []).join('\n')}
                onChange={(e) => setConfig({ 
                  ...config, 
                  allowedDomains: e.target.value.split('\n').filter(d => d.trim()) 
                })}
              />
            </div>
          </div>
        );

      case 'http-request':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Método</Label>
              <Select
                value={config.method || 'GET'}
                onValueChange={(v) => setConfig({ ...config, method: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                placeholder="https://api.exemplo.com/endpoint"
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Body (JSON)</Label>
              <Textarea
                placeholder='{"key": "value"}'
                value={config.body || ''}
                onChange={(e) => setConfig({ ...config, body: e.target.value })}
              />
            </div>
          </div>
        );

      case 'set-variable':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da variável</Label>
              <Input
                placeholder="minha_variavel"
                value={config.variableName || ''}
                onChange={(e) => setConfig({ ...config, variableName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                placeholder="Valor ou expressão"
                value={config.value || ''}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
              />
            </div>
          </div>
        );

      case 'instance-connector':
        // Mock available instances - in production would come from API
        const availableInstances = [
          { id: 'inst-1', name: 'Vendas Principal', phone: '+55 11 99999-1234', status: 'connected' },
          { id: 'inst-2', name: 'Suporte', phone: '+55 11 88888-5678', status: 'connected' },
          { id: 'inst-3', name: 'Marketing', phone: '+55 21 77777-9012', status: 'disconnected' },
        ];
        
        return (
          <div className="space-y-4">
            {/* Auto-detect banner */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <Smartphone className="w-4 h-4" />
                Instâncias Detectadas Automaticamente
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {availableInstances.filter(i => i.status === 'connected').length} instância(s) conectada(s)
              </p>
            </div>

            {/* Instance selector */}
            <div className="space-y-2">
              <Label>Selecionar Instância</Label>
              <Select
                value={config.instanceId || ''}
                onValueChange={(v) => {
                  const inst = availableInstances.find(i => i.id === v);
                  setConfig({ 
                    ...config, 
                    instanceId: v,
                    instanceName: inst?.name || '',
                    instancePhone: inst?.phone || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma instância" />
                </SelectTrigger>
                <SelectContent>
                  {availableInstances.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id} disabled={inst.status === 'disconnected'}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          inst.status === 'connected' ? "bg-emerald-500" : "bg-gray-400"
                        )} />
                        <span>{inst.name}</span>
                        <span className="text-xs text-muted-foreground">({inst.phone})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected instance details */}
            {config.instanceId && (
              <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Instância Selecionada</Label>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                    Conectada
                  </Badge>
                </div>
                <p className="font-medium">{config.instanceName}</p>
                <p className="text-xs text-muted-foreground">{config.instancePhone}</p>
              </div>
            )}

            {/* Connection settings */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Verificar conexão ao iniciar</Label>
                  <p className="text-xs text-muted-foreground">Valida se a instância está online</p>
                </div>
                <Switch
                  checked={config.checkConnection ?? true}
                  onCheckedChange={(v) => setConfig({ ...config, checkConnection: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Reconectar automaticamente</Label>
                  <p className="text-xs text-muted-foreground">Tenta reconectar se perder conexão</p>
                </div>
                <Switch
                  checked={config.autoReconnect ?? true}
                  onCheckedChange={(v) => setConfig({ ...config, autoReconnect: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Timeout de conexão (segundos)</Label>
                </div>
                <Input
                  type="number"
                  className="w-20 h-8"
                  value={config.connectionTimeout || 30}
                  onChange={(e) => setConfig({ ...config, connectionTimeout: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Fallback para outra instância</Label>
                  <p className="text-xs text-muted-foreground">Usa outra instância se falhar</p>
                </div>
                <Switch
                  checked={config.enableFallback || false}
                  onCheckedChange={(v) => setConfig({ ...config, enableFallback: v })}
                />
              </div>

              {config.enableFallback && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  <Label className="text-xs">Instância de Fallback</Label>
                  <Select
                    value={config.fallbackInstanceId || ''}
                    onValueChange={(v) => setConfig({ ...config, fallbackInstanceId: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInstances
                        .filter(i => i.id !== config.instanceId && i.status === 'connected')
                        .map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        );

      case 'start-trigger':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Gatilho</Label>
              <Select
                value={config.triggerType || 'any_message'}
                onValueChange={(v) => setConfig({ ...config, triggerType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any_message">Qualquer mensagem</SelectItem>
                  <SelectItem value="new_contact">Novo contato</SelectItem>
                  <SelectItem value="keyword">Palavra-chave específica</SelectItem>
                  <SelectItem value="media">Mídia recebida</SelectItem>
                  <SelectItem value="group_join">Entrada em grupo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.triggerType === 'keyword' && (
              <div className="space-y-2">
                <Label>Palavras-chave (separadas por vírgula)</Label>
                <Input
                  placeholder="oi, olá, bom dia, ajuda"
                  value={config.keywords || ''}
                  onChange={(e) => setConfig({ ...config, keywords: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Ignorar mensagens de grupos</Label>
                <p className="text-xs text-muted-foreground">Só processa mensagens privadas</p>
              </div>
              <Switch
                checked={config.ignoreGroups || false}
                onCheckedChange={(v) => setConfig({ ...config, ignoreGroups: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Apenas primeira mensagem</Label>
                <p className="text-xs text-muted-foreground">Não processa contatos recorrentes</p>
              </div>
              <Switch
                checked={config.firstMessageOnly || false}
                onCheckedChange={(v) => setConfig({ ...config, firstMessageOnly: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Horário de funcionamento</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Início</Label>
                  <Input
                    type="time"
                    value={config.workingHoursStart || '08:00'}
                    onChange={(e) => setConfig({ ...config, workingHoursStart: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fim</Label>
                  <Input
                    type="time"
                    value={config.workingHoursEnd || '18:00'}
                    onChange={(e) => setConfig({ ...config, workingHoursEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Ativar fora do horário?</Label>
                <p className="text-xs text-muted-foreground">Executa 24/7</p>
              </div>
              <Switch
                checked={config.alwaysActive ?? true}
                onCheckedChange={(v) => setConfig({ ...config, alwaysActive: v })}
              />
            </div>
          </div>
        );

      case 'webhook-trigger':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Label className="text-blue-600 text-sm">URL do Webhook</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                  {config.webhookUrl || 'https://api.seusite.com/webhook/flow-xxx'}
                </code>
                <Button variant="ghost" size="sm" className="h-7">
                  Copiar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Método HTTP</Label>
              <Select
                value={config.httpMethod || 'POST'}
                onValueChange={(v) => setConfig({ ...config, httpMethod: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Secret Token (para validação)</Label>
              <Input
                type="password"
                placeholder="Token secreto para autenticar requests"
                value={config.secretToken || ''}
                onChange={(e) => setConfig({ ...config, secretToken: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Validar assinatura</Label>
                <p className="text-xs text-muted-foreground">Verifica HMAC do payload</p>
              </div>
              <Switch
                checked={config.validateSignature || false}
                onCheckedChange={(v) => setConfig({ ...config, validateSignature: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Campo do telefone no payload</Label>
              <Input
                placeholder="data.phone ou phone"
                value={config.phoneField || 'phone'}
                onChange={(e) => setConfig({ ...config, phoneField: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Campo do nome no payload</Label>
              <Input
                placeholder="data.name ou name"
                value={config.nameField || 'name'}
                onChange={(e) => setConfig({ ...config, nameField: e.target.value })}
              />
            </div>
          </div>
        );

      case 'schedule-trigger':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Agendamento</Label>
              <Select
                value={config.scheduleType || 'once'}
                onValueChange={(v) => setConfig({ ...config, scheduleType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Uma vez</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                  <SelectItem value="cron">Expressão Cron</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.scheduleType === 'once' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Data</Label>
                  <Input
                    type="date"
                    value={config.scheduleDate || ''}
                    onChange={(e) => setConfig({ ...config, scheduleDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Hora</Label>
                  <Input
                    type="time"
                    value={config.scheduleTime || ''}
                    onChange={(e) => setConfig({ ...config, scheduleTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            {(config.scheduleType === 'daily' || config.scheduleType === 'weekly' || config.scheduleType === 'monthly') && (
              <div className="space-y-2">
                <Label>Horário de Execução</Label>
                <Input
                  type="time"
                  value={config.scheduleTime || '09:00'}
                  onChange={(e) => setConfig({ ...config, scheduleTime: e.target.value })}
                />
              </div>
            )}

            {config.scheduleType === 'weekly' && (
              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <div className="flex flex-wrap gap-1">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
                    <Button
                      key={day}
                      variant={(config.weekDays || []).includes(i) ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-10"
                      onClick={() => {
                        const days = config.weekDays || [];
                        setConfig({
                          ...config,
                          weekDays: days.includes(i) ? days.filter((d: number) => d !== i) : [...days, i]
                        });
                      }}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {config.scheduleType === 'cron' && (
              <div className="space-y-2">
                <Label>Expressão Cron</Label>
                <Input
                  placeholder="0 9 * * 1-5"
                  value={config.cronExpression || ''}
                  onChange={(e) => setConfig({ ...config, cronExpression: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Exemplo: 0 9 * * 1-5 (9h de segunda a sexta)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={config.timezone || 'America/Sao_Paulo'}
                onValueChange={(v) => setConfig({ ...config, timezone: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Condição</Label>
              <Select
                value={config.conditionType || 'variable'}
                onValueChange={(v) => setConfig({ ...config, conditionType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="variable">Variável</SelectItem>
                  <SelectItem value="message_contains">Mensagem contém</SelectItem>
                  <SelectItem value="button_clicked">Botão clicado</SelectItem>
                  <SelectItem value="poll_answer">Resposta de enquete</SelectItem>
                  <SelectItem value="time_based">Baseado em horário</SelectItem>
                  <SelectItem value="contact_tag">Tag do contato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.conditionType === 'variable' && (
              <>
                <div className="space-y-2">
                  <Label>Nome da Variável</Label>
                  <Input
                    placeholder="minha_variavel"
                    value={config.variableName || ''}
                    onChange={(e) => setConfig({ ...config, variableName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Operador</Label>
                  <Select
                    value={config.operator || 'equals'}
                    onValueChange={(v) => setConfig({ ...config, operator: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Igual a</SelectItem>
                      <SelectItem value="not_equals">Diferente de</SelectItem>
                      <SelectItem value="contains">Contém</SelectItem>
                      <SelectItem value="greater_than">Maior que</SelectItem>
                      <SelectItem value="less_than">Menor que</SelectItem>
                      <SelectItem value="is_empty">Está vazio</SelectItem>
                      <SelectItem value="is_not_empty">Não está vazio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor para Comparar</Label>
                  <Input
                    placeholder="valor esperado"
                    value={config.compareValue || ''}
                    onChange={(e) => setConfig({ ...config, compareValue: e.target.value })}
                  />
                </div>
              </>
            )}

            {config.conditionType === 'message_contains' && (
              <div className="space-y-2">
                <Label>Texto a procurar</Label>
                <Textarea
                  placeholder="Digite as palavras ou frases (uma por linha)"
                  value={config.searchTexts || ''}
                  onChange={(e) => setConfig({ ...config, searchTexts: e.target.value })}
                />
                <div className="flex items-center justify-between mt-2">
                  <Label className="text-xs">Ignorar maiúsculas</Label>
                  <Switch
                    checked={config.caseInsensitive ?? true}
                    onCheckedChange={(v) => setConfig({ ...config, caseInsensitive: v })}
                  />
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">
                <strong>Saída SIM:</strong> Condição verdadeira → segue pela saída superior<br/>
                <strong>Saída NÃO:</strong> Condição falsa → segue pela saída inferior
              </p>
            </div>
          </div>
        );

      case 'list-message':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Texto da mensagem</Label>
              <Textarea
                placeholder="Escolha uma opção abaixo:"
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Texto do botão</Label>
              <Input
                placeholder="Ver opções"
                value={config.buttonText || ''}
                onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Seções da Lista</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfig({
                    ...config,
                    sections: [...(config.sections || []), { title: '', rows: [] }]
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Seção
                </Button>
              </div>

              {(config.sections || []).map((section: any, sIndex: number) => (
                <div key={sIndex} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Título da seção"
                      value={section.title}
                      onChange={(e) => {
                        const sections = [...config.sections];
                        sections[sIndex] = { ...section, title: e.target.value };
                        setConfig({ ...config, sections });
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const sections = config.sections.filter((_: any, i: number) => i !== sIndex);
                        setConfig({ ...config, sections });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const sections = [...config.sections];
                      sections[sIndex].rows = [...(section.rows || []), { id: Date.now().toString(), title: '', description: '' }];
                      setConfig({ ...config, sections });
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar item
                  </Button>

                  {(section.rows || []).map((row: any, rIndex: number) => (
                    <div key={rIndex} className="flex gap-2 pl-3 border-l-2 border-primary/20">
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder="Título do item"
                          value={row.title}
                          onChange={(e) => {
                            const sections = [...config.sections];
                            sections[sIndex].rows[rIndex] = { ...row, title: e.target.value };
                            setConfig({ ...config, sections });
                          }}
                          className="h-8"
                        />
                        <Input
                          placeholder="Descrição (opcional)"
                          value={row.description || ''}
                          onChange={(e) => {
                            const sections = [...config.sections];
                            sections[sIndex].rows[rIndex] = { ...row, description: e.target.value };
                            setConfig({ ...config, sections });
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const sections = [...config.sections];
                          sections[sIndex].rows = section.rows.filter((_: any, i: number) => i !== rIndex);
                          setConfig({ ...config, sections });
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'audio-ptt':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fonte do Áudio</Label>
              <Select
                value={config.audioSource || 'library'}
                onValueChange={(v) => setConfig({ ...config, audioSource: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="library">Biblioteca de áudios</SelectItem>
                  <SelectItem value="url">URL externa</SelectItem>
                  <SelectItem value="tts">Texto para fala (TTS)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.audioSource === 'url' && (
              <div className="space-y-2">
                <Label>URL do Áudio</Label>
                <Input
                  placeholder="https://exemplo.com/audio.mp3"
                  value={config.audioUrl || ''}
                  onChange={(e) => setConfig({ ...config, audioUrl: e.target.value })}
                />
              </div>
            )}

            {config.audioSource === 'tts' && (
              <>
                <div className="space-y-2">
                  <Label>Texto para converter</Label>
                  <Textarea
                    placeholder="Digite o texto que será convertido em áudio..."
                    value={config.ttsText || ''}
                    onChange={(e) => setConfig({ ...config, ttsText: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Voz</Label>
                  <Select
                    value={config.ttsVoice || 'pt-BR-female'}
                    onValueChange={(v) => setConfig({ ...config, ttsVoice: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR-female">Português BR - Feminina</SelectItem>
                      <SelectItem value="pt-BR-male">Português BR - Masculina</SelectItem>
                      <SelectItem value="en-US-female">Inglês US - Feminina</SelectItem>
                      <SelectItem value="en-US-male">Inglês US - Masculina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Velocidade: {config.ttsSpeed || 1}x</Label>
                  <Slider
                    value={[config.ttsSpeed || 1]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={([v]) => setConfig({ ...config, ttsSpeed: v })}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Simular gravação (PTT)</Label>
                <p className="text-xs text-muted-foreground">Mostra "gravando áudio..."</p>
              </div>
              <Switch
                checked={config.simulateRecording ?? true}
                onCheckedChange={(v) => setConfig({ ...config, simulateRecording: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Duração da simulação (segundos)</Label>
              <Slider
                value={[config.recordingDuration || 3]}
                min={1}
                max={15}
                step={1}
                onValueChange={([v]) => setConfig({ ...config, recordingDuration: v })}
              />
              <p className="text-xs text-muted-foreground text-right">{config.recordingDuration || 3}s</p>
            </div>
          </div>
        );

      case 'expected-reaction':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reações Esperadas</Label>
              <div className="flex flex-wrap gap-2">
                {['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏', '🎉', '💯'].map((emoji) => (
                  <Button
                    key={emoji}
                    variant={(config.expectedEmojis || []).includes(emoji) ? 'default' : 'outline'}
                    size="sm"
                    className="h-10 w-10 text-xl"
                    onClick={() => {
                      const emojis = config.expectedEmojis || [];
                      setConfig({
                        ...config,
                        expectedEmojis: emojis.includes(emoji) 
                          ? emojis.filter((e: string) => e !== emoji)
                          : [...emojis, emoji]
                      });
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timeout (segundos): {config.reactionTimeout || 60}s</Label>
              <Slider
                value={[config.reactionTimeout || 60]}
                min={10}
                max={300}
                step={10}
                onValueChange={([v]) => setConfig({ ...config, reactionTimeout: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Ação se não reagir</Label>
              <Select
                value={config.noReactionAction || 'continue'}
                onValueChange={(v) => setConfig({ ...config, noReactionAction: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continue">Continuar flow</SelectItem>
                  <SelectItem value="retry">Reenviar mensagem</SelectItem>
                  <SelectItem value="end">Encerrar flow</SelectItem>
                  <SelectItem value="branch">Ir para outro caminho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Qualquer reação</Label>
                <p className="text-xs text-muted-foreground">Aceita qualquer emoji</p>
              </div>
              <Switch
                checked={config.anyReaction || false}
                onCheckedChange={(v) => setConfig({ ...config, anyReaction: v })}
              />
            </div>
          </div>
        );

      case 'presence':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Presença</Label>
              <Select
                value={config.presenceType || 'composing'}
                onValueChange={(v) => setConfig({ ...config, presenceType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="composing">Digitando...</SelectItem>
                  <SelectItem value="recording">Gravando áudio...</SelectItem>
                  <SelectItem value="available">Online</SelectItem>
                  <SelectItem value="unavailable">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duração (segundos): {config.presenceDuration || 3}s</Label>
              <Slider
                value={[config.presenceDuration || 3]}
                min={1}
                max={20}
                step={1}
                onValueChange={([v]) => setConfig({ ...config, presenceDuration: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Duração proporcional</Label>
                <p className="text-xs text-muted-foreground">Ajusta com tamanho da mensagem</p>
              </div>
              <Switch
                checked={config.proportionalDuration || false}
                onCheckedChange={(v) => setConfig({ ...config, proportionalDuration: v })}
              />
            </div>
          </div>
        );

      case 'end-flow':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ação ao Finalizar</Label>
              <Select
                value={config.endAction || 'none'}
                onValueChange={(v) => setConfig({ ...config, endAction: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Apenas encerrar</SelectItem>
                  <SelectItem value="transfer_human">Transferir para humano</SelectItem>
                  <SelectItem value="add_tag">Adicionar tag ao contato</SelectItem>
                  <SelectItem value="remove_tag">Remover tag do contato</SelectItem>
                  <SelectItem value="webhook">Chamar webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.endAction === 'add_tag' && (
              <div className="space-y-2">
                <Label>Tag para adicionar</Label>
                <Input
                  placeholder="lead_qualificado"
                  value={config.tagToAdd || ''}
                  onChange={(e) => setConfig({ ...config, tagToAdd: e.target.value })}
                />
              </div>
            )}

            {config.endAction === 'webhook' && (
              <div className="space-y-2">
                <Label>URL do Webhook</Label>
                <Input
                  placeholder="https://api.seusite.com/flow-completed"
                  value={config.endWebhookUrl || ''}
                  onChange={(e) => setConfig({ ...config, endWebhookUrl: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Registrar conclusão</Label>
                <p className="text-xs text-muted-foreground">Salva no histórico do contato</p>
              </div>
              <Switch
                checked={config.logCompletion ?? true}
                onCheckedChange={(v) => setConfig({ ...config, logCompletion: v })}
              />
            </div>
          </div>
        );

      default:
        return (
          <p className="text-muted-foreground text-sm py-4 text-center">
            Nó configurado automaticamente
          </p>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col z-[200]">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <NodeIcon className="w-5 h-5 text-primary" />
            </div>
            <span>{nodeLabels[nodeType] || 'Configurar Nó'}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Tabs defaultValue="config" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">Configuração</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="config" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Nome do nó</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Nome identificador"
                />
              </div>
              {renderConfigFields()}
            </TabsContent>

            <TabsContent value="advanced" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Log de execução</Label>
                    <p className="text-xs text-muted-foreground">Registrar execuções deste nó</p>
                  </div>
                  <Switch
                    checked={config.enableLogging || false}
                    onCheckedChange={(v) => setConfig({ ...config, enableLogging: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Retry automático</Label>
                    <p className="text-xs text-muted-foreground">Tentar novamente em caso de erro</p>
                  </div>
                  <Switch
                    checked={config.enableRetry || false}
                    onCheckedChange={(v) => setConfig({ ...config, enableRetry: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Timeout</Label>
                    <p className="text-xs text-muted-foreground">Tempo máximo de execução</p>
                  </div>
                  <Input
                    type="number"
                    className="w-20"
                    value={config.timeout || 30}
                    onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
