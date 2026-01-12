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
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da instância</Label>
              <Input
                placeholder="minha-instancia"
                value={config.instanceName || ''}
                onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Verificar conexão</Label>
              <Switch
                checked={config.checkConnection ?? true}
                onCheckedChange={(v) => setConfig({ ...config, checkConnection: v })}
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
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
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
