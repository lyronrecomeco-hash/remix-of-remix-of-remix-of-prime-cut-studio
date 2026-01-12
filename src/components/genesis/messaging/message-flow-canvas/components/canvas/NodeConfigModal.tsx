// Node Configuration Modal
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
import { 
  Type, LayoutGrid, List, Mic, BarChart2, Heart, Radio, 
  Clock, GitBranch, Plus, Trash2, Save
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

  const NodeIcon = nodeIcons[node.type as string] || Type;
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

      case 'presence':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de presença</Label>
              <div className="grid grid-cols-2 gap-2">
                {['composing', 'recording'].map((type) => (
                  <Button
                    key={type}
                    variant={config.presenceType === type ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setConfig({ ...config, presenceType: type })}
                  >
                    {type === 'composing' ? 'Digitando...' : 'Gravando...'}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duração: {config.duration || 3}s</Label>
              <Slider
                value={[config.duration || 3]}
                min={1}
                max={15}
                step={1}
                onValueChange={([v]) => setConfig({ ...config, duration: v })}
              />
            </div>
          </div>
        );

      case 'expected-reaction':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reações esperadas</Label>
              <div className="flex flex-wrap gap-2">
                {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                  <Button
                    key={emoji}
                    variant={(config.expectedEmojis || []).includes(emoji) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const emojis = config.expectedEmojis || [];
                      const newEmojis = emojis.includes(emoji)
                        ? emojis.filter((e: string) => e !== emoji)
                        : [...emojis, emoji];
                      setConfig({ ...config, expectedEmojis: newEmojis });
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timeout: {config.timeout || 60}s</Label>
              <Slider
                value={[config.timeout || 60]}
                min={10}
                max={300}
                step={10}
                onValueChange={([v]) => setConfig({ ...config, timeout: v })}
              />
            </div>
          </div>
        );

      case 'audio-ptt':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Áudio da biblioteca</Label>
              <Button variant="outline" className="w-full">
                <Mic className="w-4 h-4 mr-2" />
                Selecionar da biblioteca
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Selecione um áudio previamente gravado na biblioteca para enviar como PTT.
            </p>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de condição</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'response', label: 'Por resposta do usuário' },
                  { id: 'reaction', label: 'Por reação recebida' },
                  { id: 'poll', label: 'Por voto em enquete' },
                ].map((type) => (
                  <Button
                    key={type.id}
                    variant={config.conditionType === type.id ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setConfig({ ...config, conditionType: type.id })}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'list-message':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título da lista</Label>
              <Input
                placeholder="Escolha uma opção"
                value={config.title || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
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
          </div>
        );

      default:
        return (
          <p className="text-muted-foreground text-sm">
            Configurações para este tipo de nó em breve.
          </p>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <NodeIcon className="w-5 h-5 text-primary" />
            </div>
            <span>{nodeLabels[nodeType] || 'Configurar Nó'}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="config" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="mt-4">
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do nó</Label>
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Nome identificador"
                  />
                </div>
                {renderConfigFields()}
              </div>
            </ScrollArea>
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
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
