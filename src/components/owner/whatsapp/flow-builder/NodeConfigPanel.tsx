import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Copy, Sparkles, Code, Eye, Wand2, Plus, Minus, AlertTriangle, Info, Zap, Tag, Globe, CornerDownRight, StickyNote, Link2, Shield, RefreshCw, Gauge, ListPlus, GitBranch, Calendar, Repeat, GitMerge, ExternalLink, Radio, Workflow, Server, LogOut, UserCog, ShieldAlert, HeartPulse, Lock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FlowNode, NodeType, NODE_COLORS } from './types';
import { cn } from '@/lib/utils';

interface NodeConfigPanelProps {
  node: FlowNode | null;
  onClose: () => void;
  onSave: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export const NodeConfigPanel = ({ node, onClose, onSave, onDelete, onDuplicate }: NodeConfigPanelProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('config');
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'main']);

  useEffect(() => {
    if (node) {
      setFormData({
        label: node.data.label,
        description: node.data.description || '',
        ...node.data.config
      });
      setHasChanges(false);
    }
  }, [node]);

  if (!node) return null;

  const nodeColor = NODE_COLORS[node.data.type as NodeType] || '#6b7280';

  const handleSave = () => {
    const { label, description, ...config } = formData;
    onSave(node.id, {
      ...node.data,
      label,
      description,
      config
    });
    setHasChanges(false);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const SectionHeader = ({ id, title, icon: Icon }: { id: string; title: string; icon: any }) => (
    <Collapsible open={expandedSections.includes(id)} onOpenChange={() => toggleSection(id)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="w-4 h-4" style={{ color: nodeColor }} />
          {title}
        </div>
        <motion.div animate={{ rotate: expandedSections.includes(id) ? 180 : 0 }}>
          <Minus className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </CollapsibleTrigger>
    </Collapsible>
  );

  const renderConfigFields = () => {
    const type = node.data.type as NodeType;

    switch (type) {
      case 'trigger':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo de Gatilho</Label>
              <Select value={formData.triggerType || 'keyword'} onValueChange={(v) => updateField('triggerType', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">🔑 Palavra-chave</SelectItem>
                  <SelectItem value="first_contact">👋 Primeiro Contato</SelectItem>
                  <SelectItem value="button_click">🖱️ Clique em Botão</SelectItem>
                  <SelectItem value="all">📬 Todas Mensagens</SelectItem>
                  <SelectItem value="scheduled">⏰ Agendado</SelectItem>
                  <SelectItem value="webhook">🔗 Webhook Externo</SelectItem>
                  <SelectItem value="inactivity">💤 Inatividade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <AnimatePresence mode="wait">
              {formData.triggerType === 'keyword' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Palavras-chave</Label>
                    <Textarea
                      value={formData.keywords || ''}
                      onChange={(e) => updateField('keywords', e.target.value)}
                      placeholder="oi, olá, bom dia, boa tarde"
                      className="bg-muted/50 resize-none"
                      rows={3}
                    />
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Sparkles className="w-3 h-3" /> Separe por vírgula</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Modo de Correspondência</Label>
                    <Select value={formData.matchMode || 'contains'} onValueChange={(v) => updateField('matchMode', v)}>
                      <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contém</SelectItem>
                        <SelectItem value="exact">Exato</SelectItem>
                        <SelectItem value="starts">Começa com</SelectItem>
                        <SelectItem value="ends">Termina com</SelectItem>
                        <SelectItem value="regex">Regex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div>
                      <Label className="text-sm">Case Sensitive</Label>
                      <p className="text-[11px] text-muted-foreground">Diferenciar maiúsculas/minúsculas</p>
                    </div>
                    <Switch checked={formData.caseSensitive || false} onCheckedChange={(v) => updateField('caseSensitive', v)} />
                  </div>
                </motion.div>
              )}
              
              {formData.triggerType === 'button_click' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID do Botão</Label>
                  <Input value={formData.buttonId || ''} onChange={(e) => updateField('buttonId', e.target.value)} placeholder="btn_confirm" className="bg-muted/50" />
                </motion.div>
              )}
              
              {formData.triggerType === 'inactivity' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tempo de Inatividade (minutos)</Label>
                  <Input type="number" min="1" max="1440" value={formData.inactivityMinutes || 5} onChange={(e) => updateField('inactivityMinutes', parseInt(e.target.value))} className="bg-muted/50" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Prioridade do Gatilho</p>
                  <p>Gatilhos são avaliados na ordem de prioridade. O primeiro match executa o fluxo.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'message':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mensagem</Label>
                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1"><Wand2 className="w-3 h-3" /> IA</Button>
              </div>
              <Textarea
                value={formData.text || ''}
                onChange={(e) => updateField('text', e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                className="bg-muted/50 resize-none min-h-[120px]"
              />
              <div className="flex flex-wrap gap-1.5">
                {['{{nome}}', '{{telefone}}', '{{email}}', '{{data}}', '{{hora}}'].map((variable) => (
                  <Badge key={variable} variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary/20" onClick={() => updateField('text', (formData.text || '') + ' ' + variable)}>{variable}</Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">⌨️</div>
                  <div>
                    <Label className="text-sm">Simular digitação</Label>
                    <p className="text-[11px] text-muted-foreground">Mostra "digitando..." antes de enviar</p>
                  </div>
                </div>
                <Switch checked={formData.typing || false} onCheckedChange={(v) => updateField('typing', v)} />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Duração digitando (ms)</Label>
                <Slider value={[formData.typingDuration || 2000]} onValueChange={(v) => updateField('typingDuration', v[0])} min={500} max={5000} step={100} className="py-2" />
                <p className="text-[11px] text-muted-foreground text-right">{formData.typingDuration || 2000}ms</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mídia (Opcional)</Label>
              <Select value={formData.mediaType || 'none'} onValueChange={(v) => updateField('mediaType', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="image">🖼️ Imagem</SelectItem>
                  <SelectItem value="video">🎬 Vídeo</SelectItem>
                  <SelectItem value="audio">🎵 Áudio</SelectItem>
                  <SelectItem value="document">📄 Documento</SelectItem>
                </SelectContent>
              </Select>
              {formData.mediaType && formData.mediaType !== 'none' && (
                <Input value={formData.mediaUrl || ''} onChange={(e) => updateField('mediaUrl', e.target.value)} placeholder="URL da mídia" className="bg-muted/50 mt-2" />
              )}
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Texto da Mensagem</Label>
              <Textarea value={formData.text || ''} onChange={(e) => updateField('text', e.target.value)} placeholder="Escolha uma opção abaixo:" className="bg-muted/50 resize-none" rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Título (Opcional)</Label>
              <Input value={formData.title || ''} onChange={(e) => updateField('title', e.target.value)} placeholder="Título do menu" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Rodapé (Opcional)</Label>
              <Input value={formData.footer || ''} onChange={(e) => updateField('footer', e.target.value)} placeholder="Texto do rodapé" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Botões (máx. 3)</Label>
              <Textarea
                value={formData.buttonsRaw || ''}
                onChange={(e) => updateField('buttonsRaw', e.target.value)}
                placeholder="btn_sim|✅ Confirmar&#10;btn_nao|❌ Cancelar&#10;btn_ajuda|❓ Ajuda"
                className="bg-muted/50 resize-none font-mono text-sm"
                rows={4}
              />
              <p className="text-[11px] text-muted-foreground">Formato: <code className="bg-muted px-1 rounded">id|texto</code> (um por linha)</p>
            </div>
            
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-xs text-muted-foreground">Máximo de 3 botões por mensagem. Use Lista para mais opções.</p>
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Texto da Mensagem</Label>
              <Textarea value={formData.text || ''} onChange={(e) => updateField('text', e.target.value)} placeholder="Selecione uma opção:" className="bg-muted/50 resize-none" rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Título da Lista</Label>
              <Input value={formData.title || ''} onChange={(e) => updateField('title', e.target.value)} placeholder="Menu de Opções" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Texto do Botão</Label>
              <Input value={formData.buttonText || ''} onChange={(e) => updateField('buttonText', e.target.value)} placeholder="Ver opções" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Seções e Itens</Label>
              <Textarea
                value={formData.sectionsRaw || ''}
                onChange={(e) => updateField('sectionsRaw', e.target.value)}
                placeholder="# Seção 1&#10;item1|Opção 1|Descrição&#10;item2|Opção 2|Descrição&#10;# Seção 2&#10;item3|Opção 3|Descrição"
                className="bg-muted/50 resize-none font-mono text-sm"
                rows={6}
              />
              <p className="text-[11px] text-muted-foreground"># para seção, id|título|descrição para itens</p>
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Campo a Verificar</Label>
              <Select value={formData.field || 'message'} onValueChange={(v) => updateField('field', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">💬 Mensagem</SelectItem>
                  <SelectItem value="phone">📱 Telefone</SelectItem>
                  <SelectItem value="name">👤 Nome</SelectItem>
                  <SelectItem value="state">📊 Estado da Conversa</SelectItem>
                  <SelectItem value="variable">📝 Variável</SelectItem>
                  <SelectItem value="time">⏰ Horário</SelectItem>
                  <SelectItem value="day">📅 Dia da Semana</SelectItem>
                  <SelectItem value="custom">⚙️ Campo Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.field === 'variable' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome da Variável</Label>
                <Input value={formData.variableName || ''} onChange={(e) => updateField('variableName', e.target.value)} placeholder="nome_variavel" className="bg-muted/50" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Operador</Label>
              <Select value={formData.operator || 'equals'} onValueChange={(v) => updateField('operator', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">= Igual a</SelectItem>
                  <SelectItem value="not_equals">≠ Diferente de</SelectItem>
                  <SelectItem value="contains">∈ Contém</SelectItem>
                  <SelectItem value="not_contains">∉ Não contém</SelectItem>
                  <SelectItem value="starts_with">^ Começa com</SelectItem>
                  <SelectItem value="ends_with">$ Termina com</SelectItem>
                  <SelectItem value="greater">{'>'} Maior que</SelectItem>
                  <SelectItem value="less">{'<'} Menor que</SelectItem>
                  <SelectItem value="regex">⟨⟩ Regex</SelectItem>
                  <SelectItem value="is_empty">∅ Está vazio</SelectItem>
                  <SelectItem value="is_not_empty">✓ Não está vazio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {!['is_empty', 'is_not_empty'].includes(formData.operator) && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Valor</Label>
                <Input value={formData.value || ''} onChange={(e) => updateField('value', e.target.value)} placeholder="Valor para comparação" className="bg-muted/50" />
              </div>
            )}
            
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400 font-medium">✓ SIM</span> = condição verdadeira
                <br />
                <span className="text-red-400 font-medium">✗ NÃO</span> = condição falsa
              </p>
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tempo de Espera</Label>
              <div className="flex gap-2">
                <Input type="number" min="1" max="3600" value={formData.seconds || 5} onChange={(e) => updateField('seconds', parseInt(e.target.value))} className="bg-muted/50 flex-1" />
                <Select value={formData.unit || 'seconds'} onValueChange={(v) => updateField('unit', v)}>
                  <SelectTrigger className="bg-muted/50 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Segundos</SelectItem>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Mostrar digitando</Label>
                <p className="text-[11px] text-muted-foreground">Exibe "digitando..." durante a espera</p>
              </div>
              <Switch checked={formData.showTyping ?? true} onCheckedChange={(v) => updateField('showTyping', v)} />
            </div>
            
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-primary">⏱️ O fluxo pausará por {formData.seconds || 5} {formData.unit || 'segundos'} antes de continuar</p>
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">URL do Webhook</Label>
              <Input value={formData.url || ''} onChange={(e) => updateField('url', e.target.value)} placeholder="https://api.exemplo.com/webhook" className="bg-muted/50 font-mono text-sm" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Método HTTP</Label>
              <Select value={formData.method || 'POST'} onValueChange={(v) => updateField('method', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Headers (JSON)</Label>
              <Textarea value={formData.headersRaw || ''} onChange={(e) => updateField('headersRaw', e.target.value)} placeholder='{"Authorization": "Bearer seu_token"}' className="bg-muted/50 resize-none font-mono text-sm" rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Body (JSON)</Label>
              <Textarea value={formData.bodyRaw || ''} onChange={(e) => updateField('bodyRaw', e.target.value)} placeholder='{"nome": "{{nome}}", "telefone": "{{telefone}}"}' className="bg-muted/50 resize-none font-mono text-sm" rows={4} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timeout (segundos)</Label>
              <Input type="number" min="5" max="120" value={formData.timeout || 30} onChange={(e) => updateField('timeout', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Salvar resposta</Label>
                <p className="text-[11px] text-muted-foreground">Armazena resposta em variável</p>
              </div>
              <Switch checked={formData.saveResponse || false} onCheckedChange={(v) => updateField('saveResponse', v)} />
            </div>
            
            {formData.saveResponse && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome da Variável</Label>
                <Input value={formData.responseVariable || ''} onChange={(e) => updateField('responseVariable', e.target.value)} placeholder="api_response" className="bg-muted/50" />
              </div>
            )}
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <Label className="text-sm font-medium">Configuração da API</Label>
              </div>
              <div className="space-y-2">
                <Input type="password" value={formData.openaiApiKey || ''} onChange={(e) => updateField('openaiApiKey', e.target.value)} placeholder="sk-... (sua chave OpenAI)" className="bg-background/50 text-xs font-mono" />
                <p className="text-[10px] text-muted-foreground">💡 Configure sua chave API do ChatGPT para usar IA neste nó</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Prompt do Sistema</Label>
              <Textarea value={formData.prompt || ''} onChange={(e) => updateField('prompt', e.target.value)} placeholder="Você é um assistente virtual especializado em..." className="bg-muted/50 resize-none min-h-[120px]" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Modelo de IA</Label>
              <Select value={formData.model || 'gpt-4o-mini'} onValueChange={(v) => updateField('model', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">⚡ GPT-4o Mini (Rápido)</SelectItem>
                  <SelectItem value="gpt-4o">🧠 GPT-4o (Inteligente)</SelectItem>
                  <SelectItem value="gpt-4-turbo">🚀 GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-5-mini">⭐ GPT-5 Mini (Novo)</SelectItem>
                  <SelectItem value="gemini-2.5-flash">💎 Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="gemini-2.5-pro">💎 Gemini 2.5 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Temperatura: {formData.temperature ?? 0.7}</Label>
              <Slider value={[formData.temperature ?? 0.7]} onValueChange={(v) => updateField('temperature', v[0])} min={0} max={1} step={0.1} className="py-2" />
              <p className="text-[11px] text-muted-foreground">0 = Preciso | 1 = Criativo</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Max Tokens</Label>
              <Input type="number" min="100" max="4000" value={formData.maxTokens || 500} onChange={(e) => updateField('maxTokens', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div>
                  <Label className="text-sm">Usar contexto</Label>
                  <p className="text-[11px] text-muted-foreground">Inclui histórico da conversa</p>
                </div>
                <Switch checked={formData.useContext ?? true} onCheckedChange={(v) => updateField('useContext', v)} />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div>
                  <Label className="text-sm">Streaming</Label>
                  <p className="text-[11px] text-muted-foreground">Envia resposta gradualmente</p>
                </div>
                <Switch checked={formData.streaming ?? false} onCheckedChange={(v) => updateField('streaming', v)} />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div>
                  <Label className="text-sm">Fallback</Label>
                  <p className="text-[11px] text-muted-foreground">Mensagem se IA falhar</p>
                </div>
                <Switch checked={formData.useFallback ?? false} onCheckedChange={(v) => updateField('useFallback', v)} />
              </div>
            </div>
            
            {formData.useFallback && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mensagem de Fallback</Label>
                <Textarea value={formData.fallbackMessage || ''} onChange={(e) => updateField('fallbackMessage', e.target.value)} placeholder="Desculpe, não consegui processar sua mensagem..." className="bg-muted/50 resize-none" rows={2} />
              </div>
            )}
          </div>
        );

      case 'split':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Distribuição do Tráfego</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm flex-1">Caminho A</span>
                  <Input type="number" min="1" max="99" value={formData.percentageA || 50} onChange={(e) => updateField('percentageA', parseInt(e.target.value))} className="bg-muted/50 w-20 text-center" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm flex-1">Caminho B</span>
                  <div className="w-20 text-center font-medium">{100 - (formData.percentageA || 50)}</div>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden flex">
              <div className="bg-green-500 transition-all duration-300" style={{ width: `${formData.percentageA || 50}%` }} />
              <div className="bg-red-500 transition-all duration-300" style={{ width: `${100 - (formData.percentageA || 50)}%` }} />
            </div>
          </div>
        );

      case 'goto':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <CornerDownRight className="w-4 h-4 text-amber-500 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-foreground mb-1">Redirecionar para outro nó</p>
                  <p className="text-muted-foreground">Permite criar loops e reaproveitar partes do fluxo.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID do Nó Destino</Label>
              <Input value={formData.targetNodeId || ''} onChange={(e) => updateField('targetNodeId', e.target.value)} placeholder="trigger-123456789" className="bg-muted/50 font-mono text-sm" />
              <p className="text-[11px] text-muted-foreground">Cole o ID do nó para onde deseja redirecionar</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Limite de Loops</Label>
              <Input type="number" min="1" max="100" value={formData.maxLoops || 10} onChange={(e) => updateField('maxLoops', parseInt(e.target.value))} className="bg-muted/50" />
              <p className="text-[11px] text-muted-foreground">Máximo de vezes que pode redirecionar</p>
            </div>
          </div>
        );

      case 'variable':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome da Variável</Label>
              <Input value={formData.variableName || ''} onChange={(e) => updateField('variableName', e.target.value)} placeholder="nome_variavel" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Origem do Valor</Label>
              <Select value={formData.source || 'static'} onValueChange={(v) => updateField('source', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">📝 Valor Fixo</SelectItem>
                  <SelectItem value="message">💬 Última Mensagem</SelectItem>
                  <SelectItem value="extract">🔍 Extrair do Texto</SelectItem>
                  <SelectItem value="api_response">🌐 Resposta de API</SelectItem>
                  <SelectItem value="expression">🔢 Expressão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <AnimatePresence mode="wait">
              {formData.source === 'static' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Valor</Label>
                  <Input value={formData.value || ''} onChange={(e) => updateField('value', e.target.value)} placeholder="Valor da variável" className="bg-muted/50" />
                </motion.div>
              )}
              
              {formData.source === 'extract' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Regex de Extração</Label>
                  <Input value={formData.extractRegex || ''} onChange={(e) => updateField('extractRegex', e.target.value)} placeholder="(\d{11})" className="bg-muted/50 font-mono" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'integration':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo de Integração</Label>
              <Select value={formData.integrationType || 'crm'} onValueChange={(v) => updateField('integrationType', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="crm">📊 CRM</SelectItem>
                  <SelectItem value="google_sheets">📗 Google Sheets</SelectItem>
                  <SelectItem value="notion">📓 Notion</SelectItem>
                  <SelectItem value="hubspot">🟠 HubSpot</SelectItem>
                  <SelectItem value="zapier">⚡ Zapier</SelectItem>
                  <SelectItem value="custom">🔧 Customizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ação</Label>
              <Select value={formData.action || 'create'} onValueChange={(v) => updateField('action', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">➕ Criar Registro</SelectItem>
                  <SelectItem value="update">✏️ Atualizar Registro</SelectItem>
                  <SelectItem value="read">👁️ Buscar Registro</SelectItem>
                  <SelectItem value="delete">🗑️ Excluir Registro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Dados (JSON)</Label>
              <Textarea value={formData.integrationData || ''} onChange={(e) => updateField('integrationData', e.target.value)} placeholder='{"nome": "{{nome}}", "email": "{{email}}"}' className="bg-muted/50 resize-none font-mono text-sm" rows={4} />
            </div>
          </div>
        );

      case 'note':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <StickyNote className="w-4 h-4 text-amber-500 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-foreground mb-1">Nota Visual</p>
                  <p className="text-muted-foreground">Adicione comentários para documentar seu fluxo. Não afeta a execução.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Texto da Nota</Label>
              <Textarea value={formData.noteText || ''} onChange={(e) => updateField('noteText', e.target.value)} placeholder="Escreva sua anotação aqui..." className="bg-muted/50 resize-none" rows={4} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Cor</Label>
              <div className="flex gap-2">
                {['yellow', 'blue', 'green', 'pink', 'purple'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateField('noteColor', color)}
                    className={cn(
                      'w-8 h-8 rounded-lg transition-all',
                      color === 'yellow' && 'bg-yellow-500',
                      color === 'blue' && 'bg-blue-500',
                      color === 'green' && 'bg-green-500',
                      color === 'pink' && 'bg-pink-500',
                      color === 'purple' && 'bg-purple-500',
                      formData.noteColor === color && 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'end':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo de Finalização</Label>
              <Select value={formData.endType || 'complete'} onValueChange={(v) => updateField('endType', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">✅ Concluído</SelectItem>
                  <SelectItem value="transfer">🔄 Transferir para Humano</SelectItem>
                  <SelectItem value="error">❌ Erro</SelectItem>
                  <SelectItem value="abandon">🚫 Abandonado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.endType === 'transfer' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Departamento</Label>
                <Input value={formData.department || ''} onChange={(e) => updateField('department', e.target.value)} placeholder="Vendas, Suporte, etc." className="bg-muted/50" />
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Enviar mensagem final</Label>
                <p className="text-[11px] text-muted-foreground">Mensagem de despedida</p>
              </div>
              <Switch checked={formData.sendFinalMessage ?? false} onCheckedChange={(v) => updateField('sendFinalMessage', v)} />
            </div>
            
            {formData.sendFinalMessage && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mensagem Final</Label>
                <Textarea value={formData.finalMessage || ''} onChange={(e) => updateField('finalMessage', e.target.value)} placeholder="Obrigado pelo contato!" className="bg-muted/50 resize-none" rows={2} />
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Marcar como atendido</Label>
                <p className="text-[11px] text-muted-foreground">Atualiza status no CRM</p>
              </div>
              <Switch checked={formData.markAsServed ?? true} onCheckedChange={(v) => updateField('markAsServed', v)} />
            </div>
          </div>
        );

      // ==================== WHATSAPP NATIVE NODES ====================
      case 'wa_start':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-lg">📱</div>
                <div>
                  <p className="text-sm font-medium">Início do Fluxo WhatsApp</p>
                  <p className="text-[11px] text-muted-foreground">Este nó inicia quando uma conversa começa</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Gatilho</Label>
              <Select value={formData.startTrigger || 'first_message'} onValueChange={(v) => updateField('startTrigger', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_message">💬 Primeira mensagem</SelectItem>
                  <SelectItem value="keyword">🔑 Palavra-chave específica</SelectItem>
                  <SelectItem value="any_message">📨 Qualquer mensagem</SelectItem>
                  <SelectItem value="menu_return">↩️ Retorno ao menu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.startTrigger === 'keyword' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Palavras-chave</Label>
                <Textarea
                  value={formData.keywords || ''}
                  onChange={(e) => updateField('keywords', e.target.value)}
                  placeholder="menu, início, oi, olá"
                  className="bg-muted/50 resize-none"
                  rows={2}
                />
                <p className="text-[11px] text-muted-foreground">Separe por vírgula</p>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Salvar dados do contato</Label>
                <p className="text-[11px] text-muted-foreground">Nome e telefone em variáveis</p>
              </div>
              <Switch checked={formData.saveContactData ?? true} onCheckedChange={(v) => updateField('saveContactData', v)} />
            </div>
          </div>
        );

      case 'wa_send_text':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">💬</div>
                <p className="text-sm font-medium">Enviar Mensagem de Texto</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mensagem</Label>
                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1"><Wand2 className="w-3 h-3" /> IA</Button>
              </div>
              <Textarea
                value={formData.message || ''}
                onChange={(e) => updateField('message', e.target.value)}
                placeholder="Olá {{nome}}! Como posso ajudar?"
                className="bg-muted/50 resize-none min-h-[120px]"
              />
              <div className="flex flex-wrap gap-1.5">
                {['{{nome}}', '{{telefone}}', '{{data}}', '{{hora}}'].map((variable) => (
                  <Badge key={variable} variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary/20" onClick={() => updateField('message', (formData.message || '') + ' ' + variable)}>{variable}</Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">⌨️</div>
                <div>
                  <Label className="text-sm">Simular digitação</Label>
                  <p className="text-[11px] text-muted-foreground">Mostra "digitando..."</p>
                </div>
              </div>
              <Switch checked={formData.showTyping ?? true} onCheckedChange={(v) => updateField('showTyping', v)} />
            </div>
            
            {formData.showTyping && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Duração (ms)</Label>
                <Slider value={[formData.typingDuration || 2000]} onValueChange={(v) => updateField('typingDuration', v[0])} min={500} max={5000} step={100} className="py-2" />
                <p className="text-[11px] text-muted-foreground text-right">{formData.typingDuration || 2000}ms</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Anexar mídia (Opcional)</Label>
              <Select value={formData.mediaType || 'none'} onValueChange={(v) => updateField('mediaType', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem mídia</SelectItem>
                  <SelectItem value="image">🖼️ Imagem</SelectItem>
                  <SelectItem value="video">🎬 Vídeo</SelectItem>
                  <SelectItem value="audio">🎵 Áudio</SelectItem>
                  <SelectItem value="document">📄 Documento</SelectItem>
                </SelectContent>
              </Select>
              {formData.mediaType && formData.mediaType !== 'none' && (
                <Input value={formData.mediaUrl || ''} onChange={(e) => updateField('mediaUrl', e.target.value)} placeholder="URL da mídia" className="bg-muted/50 mt-2" />
              )}
            </div>
          </div>
        );

      case 'wa_send_buttons':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔘</div>
                <div>
                  <p className="text-sm font-medium">Enviar Botões Interativos</p>
                  <p className="text-[11px] text-muted-foreground">Máximo 3 botões por mensagem</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Texto da Mensagem</Label>
              <Textarea value={formData.message || ''} onChange={(e) => updateField('message', e.target.value)} placeholder="Escolha uma opção:" className="bg-muted/50 resize-none" rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Título (Opcional)</Label>
              <Input value={formData.title || ''} onChange={(e) => updateField('title', e.target.value)} placeholder="Menu Principal" className="bg-muted/50" maxLength={60} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Rodapé (Opcional)</Label>
              <Input value={formData.footer || ''} onChange={(e) => updateField('footer', e.target.value)} placeholder="Powered by Genesis" className="bg-muted/50" maxLength={60} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Botões (máx. 3)</Label>
              <Textarea
                value={formData.buttonsConfig || ''}
                onChange={(e) => updateField('buttonsConfig', e.target.value)}
                placeholder="btn_1|✅ Confirmar&#10;btn_2|❌ Cancelar&#10;btn_3|❓ Ajuda"
                className="bg-muted/50 resize-none font-mono text-sm"
                rows={4}
              />
              <p className="text-[11px] text-muted-foreground">Formato: <code className="bg-muted px-1 rounded">id|texto</code> (um por linha, máx 20 caracteres)</p>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Aguardar resposta</Label>
                <p className="text-[11px] text-muted-foreground">Pausa fluxo até clique</p>
              </div>
              <Switch checked={formData.waitForResponse ?? true} onCheckedChange={(v) => updateField('waitForResponse', v)} />
            </div>
            
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-xs text-muted-foreground">Requer WhatsApp Business API ou backend v4.0.1+ conectado.</p>
              </div>
            </div>
          </div>
        );

      case 'wa_send_list':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📋</div>
                <div>
                  <p className="text-sm font-medium">Enviar Lista Interativa</p>
                  <p className="text-[11px] text-muted-foreground">Até 10 seções com 10 itens cada</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Texto da Mensagem</Label>
              <Textarea value={formData.message || ''} onChange={(e) => updateField('message', e.target.value)} placeholder="Veja nossas opções disponíveis:" className="bg-muted/50 resize-none" rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Título</Label>
              <Input value={formData.title || ''} onChange={(e) => updateField('title', e.target.value)} placeholder="Menu de Serviços" className="bg-muted/50" maxLength={60} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Texto do Botão</Label>
              <Input value={formData.buttonText || ''} onChange={(e) => updateField('buttonText', e.target.value)} placeholder="Ver opções" className="bg-muted/50" maxLength={20} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Seções e Itens</Label>
              <Textarea
                value={formData.sectionsConfig || ''}
                onChange={(e) => updateField('sectionsConfig', e.target.value)}
                placeholder="# Produtos&#10;prod_1|Produto 1|Descrição do produto&#10;prod_2|Produto 2|Descrição&#10;# Serviços&#10;serv_1|Serviço 1|Descrição do serviço"
                className="bg-muted/50 resize-none font-mono text-sm"
                rows={8}
              />
              <p className="text-[11px] text-muted-foreground"># para seção, <code className="bg-muted px-1 rounded">id|título|descrição</code> para itens</p>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Aguardar seleção</Label>
                <p className="text-[11px] text-muted-foreground">Pausa fluxo até seleção</p>
              </div>
              <Switch checked={formData.waitForSelection ?? true} onCheckedChange={(v) => updateField('waitForSelection', v)} />
            </div>
          </div>
        );

      case 'wa_wait_response':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">⏳</div>
                <div>
                  <p className="text-sm font-medium">Aguardar Resposta</p>
                  <p className="text-[11px] text-muted-foreground">Pausa o fluxo até receber mensagem</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo de Resposta Esperada</Label>
              <Select value={formData.expectedType || 'any'} onValueChange={(v) => updateField('expectedType', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">📨 Qualquer resposta</SelectItem>
                  <SelectItem value="text">💬 Texto</SelectItem>
                  <SelectItem value="button">🔘 Clique em botão</SelectItem>
                  <SelectItem value="list">📋 Seleção de lista</SelectItem>
                  <SelectItem value="media">🖼️ Mídia (imagem/vídeo/áudio)</SelectItem>
                  <SelectItem value="location">📍 Localização</SelectItem>
                  <SelectItem value="contact">👤 Contato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timeout (segundos)</Label>
              <Input type="number" min="30" max="86400" value={formData.timeout || 300} onChange={(e) => updateField('timeout', parseInt(e.target.value))} className="bg-muted/50" />
              <p className="text-[11px] text-muted-foreground">Tempo máximo de espera (5 min = 300s)</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Salvar resposta em variável</Label>
              <Input value={formData.saveAs || ''} onChange={(e) => updateField('saveAs', e.target.value)} placeholder="resposta_usuario" className="bg-muted/50" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Mensagem de timeout</Label>
                <p className="text-[11px] text-muted-foreground">Enviar se não responder</p>
              </div>
              <Switch checked={formData.sendTimeoutMessage ?? false} onCheckedChange={(v) => updateField('sendTimeoutMessage', v)} />
            </div>
            
            {formData.sendTimeoutMessage && (
              <div className="space-y-2">
                <Textarea value={formData.timeoutMessage || ''} onChange={(e) => updateField('timeoutMessage', e.target.value)} placeholder="Não recebi sua resposta. Digite algo para continuar." className="bg-muted/50 resize-none" rows={2} />
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Validação (Opcional)</Label>
              <Select value={formData.validation || 'none'} onValueChange={(v) => updateField('validation', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem validação</SelectItem>
                  <SelectItem value="email">📧 E-mail válido</SelectItem>
                  <SelectItem value="phone">📱 Telefone</SelectItem>
                  <SelectItem value="cpf">🆔 CPF</SelectItem>
                  <SelectItem value="number">🔢 Número</SelectItem>
                  <SelectItem value="regex">⟨⟩ Regex customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.validation === 'regex' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Padrão Regex</Label>
                <Input value={formData.validationRegex || ''} onChange={(e) => updateField('validationRegex', e.target.value)} placeholder="^\d{5}-?\d{3}$" className="bg-muted/50 font-mono" />
              </div>
            )}
            
            {formData.validation && formData.validation !== 'none' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mensagem de erro</Label>
                <Input value={formData.validationError || ''} onChange={(e) => updateField('validationError', e.target.value)} placeholder="Formato inválido. Tente novamente." className="bg-muted/50" />
              </div>
            )}
          </div>
        );

      case 'wa_receive':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📥</div>
                <div>
                  <p className="text-sm font-medium">Processar Entrada</p>
                  <p className="text-[11px] text-muted-foreground">Captura e processa dados recebidos</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">O que capturar</Label>
              <Select value={formData.captureType || 'message'} onValueChange={(v) => updateField('captureType', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">💬 Texto da mensagem</SelectItem>
                  <SelectItem value="button_id">🔘 ID do botão clicado</SelectItem>
                  <SelectItem value="list_id">📋 ID do item selecionado</SelectItem>
                  <SelectItem value="media_url">🖼️ URL da mídia</SelectItem>
                  <SelectItem value="location">📍 Coordenadas</SelectItem>
                  <SelectItem value="contact">👤 Dados do contato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Salvar como variável</Label>
              <Input value={formData.variableName || ''} onChange={(e) => updateField('variableName', e.target.value)} placeholder="dados_capturados" className="bg-muted/50" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Transformar dados</Label>
                <p className="text-[11px] text-muted-foreground">Aplicar formatação</p>
              </div>
              <Switch checked={formData.transform ?? false} onCheckedChange={(v) => updateField('transform', v)} />
            </div>
            
            {formData.transform && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Transformação</Label>
                <Select value={formData.transformType || 'none'} onValueChange={(v) => updateField('transformType', v)}>
                  <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uppercase">MAIÚSCULAS</SelectItem>
                    <SelectItem value="lowercase">minúsculas</SelectItem>
                    <SelectItem value="capitalize">Primeira Maiúscula</SelectItem>
                    <SelectItem value="trim">Remover espaços</SelectItem>
                    <SelectItem value="extract_numbers">Só números</SelectItem>
                    <SelectItem value="format_phone">Formatar telefone</SelectItem>
                    <SelectItem value="format_cpf">Formatar CPF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">Os dados capturados ficam disponíveis como <code className="bg-muted px-1 rounded">{'{{' + (formData.variableName || 'variavel') + '}}'}</code> nos próximos nós.</p>
              </div>
            </div>
          </div>
        );

      // =====================================================
      // STABILITY & RESILIENCE NODES
      // =====================================================

      case 'queue_message':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📤</div>
                <div>
                  <p className="text-sm font-medium">Fila de Envio Garantido</p>
                  <p className="text-[11px] text-muted-foreground">Mensagem persistida com retry automático</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mensagem</Label>
              <Textarea
                value={formData.message || ''}
                onChange={(e) => updateField('message', e.target.value)}
                placeholder="Mensagem a ser enviada via fila..."
                className="bg-muted/50 resize-none min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Prioridade</Label>
              <Select value={formData.priority || 'normal'} onValueChange={(v) => updateField('priority', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🔽 Baixa</SelectItem>
                  <SelectItem value="normal">➡️ Normal</SelectItem>
                  <SelectItem value="high">🔼 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tentativas</Label>
                <Input type="number" min="1" max="10" value={formData.retry_limit || 3} onChange={(e) => updateField('retry_limit', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Intervalo (seg)</Label>
                <Input type="number" min="5" max="300" value={formData.retry_interval_seconds || 30} onChange={(e) => updateField('retry_interval_seconds', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Expiração (segundos)</Label>
              <Input type="number" min="60" max="86400" value={formData.expiration_seconds || 3600} onChange={(e) => updateField('expiration_seconds', parseInt(e.target.value))} className="bg-muted/50" />
              <p className="text-[11px] text-muted-foreground">Tempo máximo na fila (1h = 3600s)</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ao Falhar</Label>
              <Select value={formData.on_fail || 'end'} onValueChange={(v) => updateField('on_fail', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="end">⏹️ Encerrar fluxo</SelectItem>
                  <SelectItem value="goto">↪️ Ir para outro nó</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.on_fail === 'goto' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID do Nó Destino</Label>
                <Input value={formData.fail_target_node || ''} onChange={(e) => updateField('fail_target_node', e.target.value)} placeholder="node-id" className="bg-muted/50 font-mono text-sm" />
              </div>
            )}
          </div>
        );

      case 'session_guard':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Proteção de Sessão</p>
                  <p className="text-[11px] text-muted-foreground">Previne spam e protege contra ban</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Msgs/minuto</Label>
                <Input type="number" min="1" max="60" value={formData.max_messages_per_minute || 20} onChange={(e) => updateField('max_messages_per_minute', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Burst Limit</Label>
                <Input type="number" min="1" max="20" value={formData.burst_limit || 5} onChange={(e) => updateField('burst_limit', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Cooldown (minutos)</Label>
              <Input type="number" min="1" max="60" value={formData.cooldown_minutes || 2} onChange={(e) => updateField('cooldown_minutes', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ao Violar Limite</Label>
              <Select value={formData.on_violation || 'pause'} onValueChange={(v) => updateField('on_violation', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pause">⏸️ Pausar temporariamente</SelectItem>
                  <SelectItem value="goto">↪️ Ir para outro nó</SelectItem>
                  <SelectItem value="end">⏹️ Encerrar fluxo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.on_violation === 'goto' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID do Nó Destino</Label>
                <Input value={formData.violation_target_node || ''} onChange={(e) => updateField('violation_target_node', e.target.value)} placeholder="node-id" className="bg-muted/50 font-mono text-sm" />
              </div>
            )}
            
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-xs text-muted-foreground">Limites muito altos podem resultar em ban. Recomendado: máx 20 msgs/min.</p>
              </div>
            </div>
          </div>
        );

      case 'timeout_handler':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">⏱️</div>
                <div>
                  <p className="text-sm font-medium">Tratamento de Timeout</p>
                  <p className="text-[11px] text-muted-foreground">Define ação quando tempo excede</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timeout (segundos)</Label>
              <Input type="number" min="5" max="3600" value={formData.timeout_seconds || 30} onChange={(e) => updateField('timeout_seconds', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ao Atingir Timeout</Label>
              <Select value={formData.on_timeout || 'goto'} onValueChange={(v) => updateField('on_timeout', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="goto">↪️ Ir para outro nó (SIM)</SelectItem>
                  <SelectItem value="end">⏹️ Encerrar fluxo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.on_timeout === 'goto' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID do Nó Destino (Timeout)</Label>
                <Input value={formData.timeout_target_node || ''} onChange={(e) => updateField('timeout_target_node', e.target.value)} placeholder="node-id" className="bg-muted/50 font-mono text-sm" />
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Mensagem de Fallback</Label>
                <p className="text-[11px] text-muted-foreground">Enviar se timeout ocorrer</p>
              </div>
              <Switch checked={formData.send_fallback ?? false} onCheckedChange={(v) => updateField('send_fallback', v)} />
            </div>
            
            {formData.send_fallback && (
              <div className="space-y-2">
                <Textarea value={formData.fallback_message || ''} onChange={(e) => updateField('fallback_message', e.target.value)} placeholder="Desculpe, o tempo de resposta expirou..." className="bg-muted/50 resize-none" rows={2} />
              </div>
            )}
            
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400 font-medium">✓ Sucesso</span> = continua normalmente
                <br />
                <span className="text-red-400 font-medium">✗ Timeout</span> = executa ação definida
              </p>
            </div>
          </div>
        );

      case 'if_instance_state':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-green-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔌</div>
                <div>
                  <p className="text-sm font-medium">Condição por Estado</p>
                  <p className="text-[11px] text-muted-foreground">Verifica estado da instância WhatsApp</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Verificar Estado</Label>
              <Select value={formData.check_state || 'connected'} onValueChange={(v) => updateField('check_state', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="connected">🟢 Conectado</SelectItem>
                  <SelectItem value="degraded">🟡 Degradado</SelectItem>
                  <SelectItem value="cooldown">🟠 Em Cooldown</SelectItem>
                  <SelectItem value="disconnected">🔴 Desconectado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Estado de Fallback</Label>
              <Select value={formData.fallback_state || 'disconnected'} onValueChange={(v) => updateField('fallback_state', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="connected">🟢 Conectado</SelectItem>
                  <SelectItem value="degraded">🟡 Degradado</SelectItem>
                  <SelectItem value="cooldown">🟠 Em Cooldown</SelectItem>
                  <SelectItem value="disconnected">🔴 Desconectado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400 font-medium">✓ Estado = {formData.check_state || 'connected'}</span> = caminho SIM
                <br />
                <span className="text-red-400 font-medium">✗ Outro estado</span> = caminho NÃO
              </p>
            </div>
            
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">Use para evitar envio quando instância não estiver pronta.</p>
              </div>
            </div>
          </div>
        );

      case 'retry_policy':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-blue-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Política de Retry</p>
                  <p className="text-[11px] text-muted-foreground">Retentativas com backoff controlado</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Máx. Tentativas</Label>
                <Input type="number" min="1" max="10" value={formData.max_attempts || 3} onChange={(e) => updateField('max_attempts', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Delay (seg)</Label>
                <Input type="number" min="1" max="300" value={formData.delay_seconds || 5} onChange={(e) => updateField('delay_seconds', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Jitter (aleatoriedade)</Label>
                <p className="text-[11px] text-muted-foreground">Adiciona variação ao delay</p>
              </div>
              <Switch checked={formData.jitter_enabled ?? true} onCheckedChange={(v) => updateField('jitter_enabled', v)} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ao Esgotar Tentativas</Label>
              <Select value={formData.on_exhausted || 'end'} onValueChange={(v) => updateField('on_exhausted', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="end">⏹️ Encerrar fluxo</SelectItem>
                  <SelectItem value="goto">↪️ Ir para outro nó</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.on_exhausted === 'goto' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID do Nó Destino</Label>
                <Input value={formData.exhausted_target_node || ''} onChange={(e) => updateField('exhausted_target_node', e.target.value)} placeholder="node-id" className="bg-muted/50 font-mono text-sm" />
              </div>
            )}
          </div>
        );

      case 'smart_delay':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">⏳</div>
                <div>
                  <p className="text-sm font-medium">Pausa Inteligente</p>
                  <p className="text-[11px] text-muted-foreground">Delay humanizado com aleatoriedade</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mínimo (seg)</Label>
                <Input type="number" min="1" max="300" value={formData.min_seconds || 2} onChange={(e) => updateField('min_seconds', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Máximo (seg)</Label>
                <Input type="number" min="1" max="600" value={formData.max_seconds || 8} onChange={(e) => updateField('max_seconds', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Aleatorizar</Label>
                <p className="text-[11px] text-muted-foreground">Valor aleatório entre min e max</p>
              </div>
              <Switch checked={formData.randomize ?? true} onCheckedChange={(v) => updateField('randomize', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Respeitar horário comercial</Label>
                <p className="text-[11px] text-muted-foreground">Delay maior fora do expediente</p>
              </div>
              <Switch checked={formData.respect_business_hours ?? false} onCheckedChange={(v) => updateField('respect_business_hours', v)} />
            </div>
            
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-primary">⏱️ Delay estimado: {formData.min_seconds || 2}-{formData.max_seconds || 8} segundos</p>
            </div>
          </div>
        );

      case 'rate_limit':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Limite de Taxa</p>
                  <p className="text-[11px] text-muted-foreground">Controla ritmo de execução</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Msgs/minuto</Label>
                <Input type="number" min="1" max="60" value={formData.messages_per_minute || 10} onChange={(e) => updateField('messages_per_minute', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Burst Limit</Label>
                <Input type="number" min="1" max="20" value={formData.burst_limit || 3} onChange={(e) => updateField('burst_limit', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Cooldown (minutos)</Label>
              <Input type="number" min="1" max="60" value={formData.cooldown_minutes || 1} onChange={(e) => updateField('cooldown_minutes', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ao Atingir Limite</Label>
              <Select value={formData.on_limit || 'pause'} onValueChange={(v) => updateField('on_limit', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pause">⏸️ Pausar até cooldown</SelectItem>
                  <SelectItem value="goto">↪️ Ir para outro nó</SelectItem>
                  <SelectItem value="end">⏹️ Encerrar fluxo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.on_limit === 'goto' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID do Nó Destino</Label>
                <Input value={formData.limit_target_node || ''} onChange={(e) => updateField('limit_target_node', e.target.value)} placeholder="node-id" className="bg-muted/50 font-mono text-sm" />
              </div>
            )}
          </div>
        );

      case 'enqueue_flow_step':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-cyan-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Enfileirar Passo</p>
                  <p className="text-[11px] text-muted-foreground">Execução assíncrona via fila</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome da Fila</Label>
              <Input value={formData.queue_name || 'default'} onChange={(e) => updateField('queue_name', e.target.value)} placeholder="default" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Prioridade</Label>
              <Select value={formData.priority || 'normal'} onValueChange={(v) => updateField('priority', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🔽 Baixa</SelectItem>
                  <SelectItem value="normal">➡️ Normal</SelectItem>
                  <SelectItem value="high">🔼 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Delay antes de executar (seg)</Label>
              <Input type="number" min="0" max="3600" value={formData.delay_seconds || 0} onChange={(e) => updateField('delay_seconds', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">O próximo nó será executado de forma assíncrona, liberando o fluxo atual imediatamente.</p>
              </div>
            </div>
          </div>
        );

      // =====================================================
      // GENERIC AUTOMATION ENGINE NODES
      // =====================================================

      case 'http_request_advanced':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">HTTP Request Avançado</p>
                  <p className="text-[11px] text-muted-foreground">Integração com APIs externas</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Método</Label>
                <Select value={formData.method || 'GET'} onValueChange={(v) => updateField('method', v)}>
                  <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timeout (seg)</Label>
                <Input type="number" min="5" max="120" value={formData.timeout_seconds || 30} onChange={(e) => updateField('timeout_seconds', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">URL</Label>
              <Input value={formData.url || ''} onChange={(e) => updateField('url', e.target.value)} placeholder="https://api.exemplo.com/endpoint" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Headers (JSON)</Label>
              <Textarea value={typeof formData.headers === 'string' ? formData.headers : JSON.stringify(formData.headers || {}, null, 2)} onChange={(e) => updateField('headers', e.target.value)} placeholder='{"Authorization": "Bearer token"}' className="bg-muted/50 resize-none font-mono text-xs" rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Query Params (JSON)</Label>
              <Textarea value={typeof formData.query_params === 'string' ? formData.query_params : JSON.stringify(formData.query_params || {}, null, 2)} onChange={(e) => updateField('query_params', e.target.value)} placeholder='{"page": 1, "limit": 10}' className="bg-muted/50 resize-none font-mono text-xs" rows={2} />
            </div>
            
            {formData.method !== 'GET' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Body (JSON)</Label>
                <Textarea value={formData.body || ''} onChange={(e) => updateField('body', e.target.value)} placeholder='{"key": "value"}' className="bg-muted/50 resize-none font-mono text-xs" rows={4} />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Retries</Label>
                <Input type="number" min="0" max="5" value={formData.retries || 3} onChange={(e) => updateField('retries', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Auth Type</Label>
                <Select value={formData.auth_type || 'none'} onValueChange={(v) => updateField('auth_type', v)}>
                  <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Salvar resposta em</Label>
              <Input value={formData.save_response_to || ''} onChange={(e) => updateField('save_response_to', e.target.value)} placeholder="response" className="bg-muted/50" />
            </div>
          </div>
        );

      case 'webhook_trigger':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Webhook Trigger</p>
                  <p className="text-[11px] text-muted-foreground">Gatilho por chamada HTTP externa</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Método HTTP</Label>
              <Select value={formData.method || 'POST'} onValueChange={(v) => updateField('method', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Path do Webhook</Label>
              <Input value={formData.path || ''} onChange={(e) => updateField('path', e.target.value)} placeholder="/meu-webhook" className="bg-muted/50 font-mono" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Secret (opcional)</Label>
              <Input value={formData.secret || ''} onChange={(e) => updateField('secret', e.target.value)} placeholder="secret_key_123" className="bg-muted/50 font-mono" type="password" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Validar Payload</Label>
                <p className="text-[11px] text-muted-foreground">Verificar estrutura do JSON</p>
              </div>
              <Switch checked={formData.validate_payload ?? true} onCheckedChange={(v) => updateField('validate_payload', v)} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Resposta Customizada (JSON)</Label>
              <Textarea value={typeof formData.custom_response === 'string' ? formData.custom_response : JSON.stringify(formData.custom_response || { status: 200, body: { success: true } }, null, 2)} onChange={(e) => updateField('custom_response', e.target.value)} placeholder='{"status": 200, "body": {"success": true}}' className="bg-muted/50 resize-none font-mono text-xs" rows={3} />
            </div>
          </div>
        );

      case 'cron_trigger':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📅</div>
                <div>
                  <p className="text-sm font-medium">Agendamento Cron</p>
                  <p className="text-[11px] text-muted-foreground">Execução programada</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Expressão Cron</Label>
              <Input value={formData.cron_expression || ''} onChange={(e) => updateField('cron_expression', e.target.value)} placeholder="0 9 * * *" className="bg-muted/50 font-mono" />
              <p className="text-[11px] text-muted-foreground">Formato: minuto hora dia mês diasemana</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timezone</Label>
              <Select value={formData.timezone || 'America/Sao_Paulo'} onValueChange={(v) => updateField('timezone', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                  <SelectItem value="America/New_York">New York (EST)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Início Janela</Label>
                <Input type="time" value={formData.active_window?.start || '08:00'} onChange={(e) => updateField('active_window', { ...formData.active_window, start: e.target.value })} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fim Janela</Label>
                <Input type="time" value={formData.active_window?.end || '18:00'} onChange={(e) => updateField('active_window', { ...formData.active_window, end: e.target.value })} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ao Falhar</Label>
              <Select value={formData.on_fail || 'retry'} onValueChange={(v) => updateField('on_fail', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="retry">🔄 Tentar novamente</SelectItem>
                  <SelectItem value="skip">⏭️ Pular execução</SelectItem>
                  <SelectItem value="alert">🔔 Alertar e parar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'set_variable':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Definir Variável</p>
                  <p className="text-[11px] text-muted-foreground">Manipula contexto do fluxo</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome da Variável</Label>
              <Input value={formData.name || ''} onChange={(e) => updateField('name', e.target.value)} placeholder="minha_variavel" className="bg-muted/50 font-mono" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Valor</Label>
              <Textarea value={formData.value || ''} onChange={(e) => updateField('value', e.target.value)} placeholder="Valor ou expressão..." className="bg-muted/50 resize-none" rows={3} />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Escopo</Label>
                <Select value={formData.scope || 'flow'} onValueChange={(v) => updateField('scope', v)}>
                  <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flow">🔄 Fluxo atual</SelectItem>
                    <SelectItem value="session">👤 Sessão</SelectItem>
                    <SelectItem value="global">🌍 Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</Label>
                <Select value={formData.type || 'string'} onValueChange={(v) => updateField('type', v)}>
                  <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="boolean">Booleano</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'if_expression':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Condição Avançada</p>
                  <p className="text-[11px] text-muted-foreground">Expressões lógicas complexas</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Expressão</Label>
              <Textarea value={formData.expression || ''} onChange={(e) => updateField('expression', e.target.value)} placeholder="{{variavel}} == 'valor' && {{outra}} > 10" className="bg-muted/50 resize-none font-mono text-xs" rows={3} />
              <p className="text-[11px] text-muted-foreground">Suporta: ==, !=, &gt;, &lt;, &gt;=, &lt;=, &&, ||, !</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Lógica entre Condições</Label>
              <Select value={formData.logic || 'and'} onValueChange={(v) => updateField('logic', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="and">E (AND) - Todas devem ser verdadeiras</SelectItem>
                  <SelectItem value="or">OU (OR) - Pelo menos uma verdadeira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fallback</Label>
              <Select value={formData.fallback || 'no'} onValueChange={(v) => updateField('fallback', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Seguir para "NÃO"</SelectItem>
                  <SelectItem value="end">Encerrar fluxo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'loop_for_each':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔁</div>
                <div>
                  <p className="text-sm font-medium">Loop For Each</p>
                  <p className="text-[11px] text-muted-foreground">Itera sobre uma lista de itens</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Array de Origem</Label>
              <Input value={formData.array_source || ''} onChange={(e) => updateField('array_source', e.target.value)} placeholder="{{lista_de_itens}}" className="bg-muted/50 font-mono" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Variável do Item</Label>
                <Input value={formData.item_variable || 'item'} onChange={(e) => updateField('item_variable', e.target.value)} placeholder="item" className="bg-muted/50 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Variável do Índice</Label>
                <Input value={formData.index_variable || 'index'} onChange={(e) => updateField('index_variable', e.target.value)} placeholder="index" className="bg-muted/50 font-mono" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Limite de Iterações</Label>
                <Input type="number" min="1" max="1000" value={formData.limit || 100} onChange={(e) => updateField('limit', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Delay Entre (seg)</Label>
                <Input type="number" min="0" max="60" value={formData.delay_between || 0} onChange={(e) => updateField('delay_between', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ao Erro</Label>
              <Select value={formData.on_error || 'continue'} onValueChange={(v) => updateField('on_error', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="continue">⏭️ Continuar próximo item</SelectItem>
                  <SelectItem value="break">⏹️ Parar loop</SelectItem>
                  <SelectItem value="retry">🔄 Tentar item novamente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'switch_case':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔀</div>
                <div>
                  <p className="text-sm font-medium">Switch/Case</p>
                  <p className="text-[11px] text-muted-foreground">Roteamento múltiplo por valor</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Expressão Base</Label>
              <Input value={formData.expression || ''} onChange={(e) => updateField('expression', e.target.value)} placeholder="{{status}}" className="bg-muted/50 font-mono" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Cases (valor|node_id por linha)</Label>
              <Textarea value={formData.cases_raw || ''} onChange={(e) => updateField('cases_raw', e.target.value)} placeholder="ativo|node_ativo&#10;inativo|node_inativo&#10;pendente|node_pendente" className="bg-muted/50 resize-none font-mono text-xs" rows={4} />
              <p className="text-[11px] text-muted-foreground">Um case por linha: valor|id_do_no_destino</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Caso Default</Label>
              <Select value={formData.default_case || 'end'} onValueChange={(v) => updateField('default_case', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="end">⏹️ Encerrar fluxo</SelectItem>
                  <SelectItem value="continue">➡️ Continuar próximo nó</SelectItem>
                  <SelectItem value="goto">↪️ Ir para nó específico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'subflow_call':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-rose-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📤</div>
                <div>
                  <p className="text-sm font-medium">Chamar Subfluxo</p>
                  <p className="text-[11px] text-muted-foreground">Executa outro fluxo como subrotina</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">ID do Fluxo</Label>
              <Input value={formData.flow_id || ''} onChange={(e) => updateField('flow_id', e.target.value)} placeholder="uuid-do-fluxo-alvo" className="bg-muted/50 font-mono text-xs" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Parâmetros (JSON)</Label>
              <Textarea value={typeof formData.parameters === 'string' ? formData.parameters : JSON.stringify(formData.parameters || {}, null, 2)} onChange={(e) => updateField('parameters', e.target.value)} placeholder='{"param1": "{{valor1}}", "param2": 123}' className="bg-muted/50 resize-none font-mono text-xs" rows={3} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Aguardar Conclusão</Label>
                <p className="text-[11px] text-muted-foreground">Espera o subfluxo terminar</p>
              </div>
              <Switch checked={formData.wait_for_completion ?? true} onCheckedChange={(v) => updateField('wait_for_completion', v)} />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timeout (seg)</Label>
                <Input type="number" min="5" max="3600" value={formData.timeout_seconds || 60} onChange={(e) => updateField('timeout_seconds', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Salvar Retorno</Label>
                <Input value={formData.return_variable || 'subflow_result'} onChange={(e) => updateField('return_variable', e.target.value)} placeholder="subflow_result" className="bg-muted/50 font-mono text-xs" />
              </div>
            </div>
          </div>
        );

      case 'event_emitter':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-amber-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📡</div>
                <div>
                  <p className="text-sm font-medium">Emitir Evento</p>
                  <p className="text-[11px] text-muted-foreground">Dispara evento interno para outros fluxos</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome do Evento</Label>
              <Input value={formData.event_name || ''} onChange={(e) => updateField('event_name', e.target.value)} placeholder="pedido_criado" className="bg-muted/50 font-mono" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Payload (JSON)</Label>
              <Textarea value={typeof formData.payload === 'string' ? formData.payload : JSON.stringify(formData.payload || {}, null, 2)} onChange={(e) => updateField('payload', e.target.value)} placeholder='{"order_id": "{{order_id}}", "customer": "{{nome}}"}' className="bg-muted/50 resize-none font-mono text-xs" rows={4} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Escopo</Label>
              <Select value={formData.scope || 'project'} onValueChange={(v) => updateField('scope', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">📁 Projeto atual</SelectItem>
                  <SelectItem value="instance">📱 Instância</SelectItem>
                  <SelectItem value="global">🌍 Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'data_transform':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-teal-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">⚙️</div>
                <div>
                  <p className="text-sm font-medium">Transformar Dados</p>
                  <p className="text-[11px] text-muted-foreground">Map, Filter, Reduce, Merge</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Operação</Label>
              <Select value={formData.operation || 'map'} onValueChange={(v) => updateField('operation', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">🔄 Map - Transformar cada item</SelectItem>
                  <SelectItem value="filter">🔍 Filter - Filtrar itens</SelectItem>
                  <SelectItem value="reduce">📊 Reduce - Agregar valores</SelectItem>
                  <SelectItem value="merge">🔗 Merge - Combinar objetos</SelectItem>
                  <SelectItem value="template">📝 Template - Aplicar modelo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fonte de Dados</Label>
              <Input value={formData.source || ''} onChange={(e) => updateField('source', e.target.value)} placeholder="{{dados}}" className="bg-muted/50 font-mono" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Expressão</Label>
              <Textarea value={formData.expression || ''} onChange={(e) => updateField('expression', e.target.value)} placeholder={formData.operation === 'map' ? 'item.nome.toUpperCase()' : formData.operation === 'filter' ? 'item.valor > 100' : formData.operation === 'reduce' ? 'acc + item.valor' : '{"merged": ...}'} className="bg-muted/50 resize-none font-mono text-xs" rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Variável de Saída</Label>
              <Input value={formData.output_variable || 'transformed'} onChange={(e) => updateField('output_variable', e.target.value)} placeholder="transformed" className="bg-muted/50 font-mono" />
            </div>
          </div>
        );

      // ============ INFRASTRUCTURE NODES ============
      case 'proxy_assign':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🌐</div>
                <div>
                  <p className="text-sm font-medium">Atribuir Proxy</p>
                  <p className="text-[11px] text-muted-foreground">Associa proxy à execução</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Pool de Proxy</Label>
              <Input value={formData.proxy_pool || 'default'} onChange={(e) => updateField('proxy_pool', e.target.value)} placeholder="default" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</Label>
              <Select value={formData.type || 'datacenter'} onValueChange={(v) => updateField('type', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="datacenter">🏢 Datacenter</SelectItem>
                  <SelectItem value="residential">🏠 Residencial</SelectItem>
                  <SelectItem value="mobile">📱 Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Sticky (manter mesmo proxy)</Label>
                <p className="text-[11px] text-muted-foreground">Usa mesmo IP durante sessão</p>
              </div>
              <Switch checked={formData.sticky ?? true} onCheckedChange={(v) => updateField('sticky', v)} />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">TTL (seg)</Label>
                <Input type="number" min="60" max="86400" value={formData.ttl_seconds || 3600} onChange={(e) => updateField('ttl_seconds', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fallback</Label>
                <Select value={formData.fallback_behavior || 'direct'} onValueChange={(v) => updateField('fallback_behavior', v)}>
                  <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">⚡ Conexão direta</SelectItem>
                    <SelectItem value="error">❌ Erro</SelectItem>
                    <SelectItem value="wait">⏳ Aguardar disponível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'proxy_rotate':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔄</div>
                <div>
                  <p className="text-sm font-medium">Rotacionar Proxy</p>
                  <p className="text-[11px] text-muted-foreground">Rotação controlada de proxy</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Rotacionar Quando</Label>
              <Select value={formData.rotate_on || 'error'} onValueChange={(v) => updateField('rotate_on', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">❌ Erro de conexão</SelectItem>
                  <SelectItem value="time">⏰ Por tempo</SelectItem>
                  <SelectItem value="load">📊 Alta carga</SelectItem>
                  <SelectItem value="manual">🖐️ Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Intervalo Mínimo (seg)</Label>
              <Input type="number" min="10" max="3600" value={formData.min_interval_seconds || 60} onChange={(e) => updateField('min_interval_seconds', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ação em Falha</Label>
              <Select value={formData.on_fail || 'continue'} onValueChange={(v) => updateField('on_fail', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="continue">➡️ Continuar sem proxy</SelectItem>
                  <SelectItem value="retry">🔄 Tentar novamente</SelectItem>
                  <SelectItem value="error">❌ Parar com erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'worker_assign':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🖥️</div>
                <div>
                  <p className="text-sm font-medium">Atribuir Worker</p>
                  <p className="text-[11px] text-muted-foreground">Seleciona VPS/worker para execução</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Região</Label>
              <Select value={formData.region || 'auto'} onValueChange={(v) => updateField('region', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">🌍 Automático</SelectItem>
                  <SelectItem value="br-south">🇧🇷 Brasil Sul</SelectItem>
                  <SelectItem value="br-east">🇧🇷 Brasil Leste</SelectItem>
                  <SelectItem value="us-east">🇺🇸 EUA Leste</SelectItem>
                  <SelectItem value="eu-west">🇪🇺 Europa Oeste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Capacidade Máxima (%)</Label>
              <Slider value={[formData.max_capacity || 100]} onValueChange={([v]) => updateField('max_capacity', v)} min={10} max={100} step={5} />
              <p className="text-[11px] text-muted-foreground text-center">{formData.max_capacity || 100}%</p>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Sticky (mesmo worker)</Label>
                <p className="text-[11px] text-muted-foreground">Mantém execuções no mesmo worker</p>
              </div>
              <Switch checked={formData.sticky ?? true} onCheckedChange={(v) => updateField('sticky', v)} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fallback</Label>
              <Select value={formData.fallback || 'any'} onValueChange={(v) => updateField('fallback', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">🔀 Qualquer disponível</SelectItem>
                  <SelectItem value="wait">⏳ Aguardar preferido</SelectItem>
                  <SelectItem value="error">❌ Erro se indisponível</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'worker_release':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-gray-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🚪</div>
                <div>
                  <p className="text-sm font-medium">Liberar Worker</p>
                  <p className="text-[11px] text-muted-foreground">Libera recursos após execução</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Liberar ao Concluir</Label>
                <p className="text-[11px] text-muted-foreground">Libera quando fluxo termina</p>
              </div>
              <Switch checked={formData.release_on_complete ?? true} onCheckedChange={(v) => updateField('release_on_complete', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Liberar em Erro</Label>
                <p className="text-[11px] text-muted-foreground">Libera mesmo com falha</p>
              </div>
              <Switch checked={formData.release_on_error ?? true} onCheckedChange={(v) => updateField('release_on_error', v)} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Timeout de Retenção (seg)</Label>
              <Input type="number" min="0" max="3600" value={formData.retention_timeout || 60} onChange={(e) => updateField('retention_timeout', parseInt(e.target.value))} className="bg-muted/50" />
              <p className="text-[11px] text-muted-foreground">Tempo para manter reservado após uso</p>
            </div>
          </div>
        );

      case 'dispatch_execution':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-green-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🚀</div>
                <div>
                  <p className="text-sm font-medium">Disparo Controlado</p>
                  <p className="text-[11px] text-muted-foreground">Disparo controlado de execuções</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Quantidade</Label>
                <Input type="number" min="1" max="1000" value={formData.quantity || 1} onChange={(e) => updateField('quantity', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Espaçamento (seg)</Label>
                <Input type="number" min="0" max="60" value={formData.spacing_seconds || 1} onChange={(e) => updateField('spacing_seconds', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Paralelismo Máximo</Label>
              <Slider value={[formData.max_parallel || 10]} onValueChange={([v]) => updateField('max_parallel', v)} min={1} max={50} step={1} />
              <p className="text-[11px] text-muted-foreground text-center">{formData.max_parallel || 10} execuções simultâneas</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Início Janela</Label>
                <Input type="time" value={formData.time_window_start || '00:00'} onChange={(e) => updateField('time_window_start', e.target.value)} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fim Janela</Label>
                <Input type="time" value={formData.time_window_end || '23:59'} onChange={(e) => updateField('time_window_end', e.target.value)} className="bg-muted/50" />
              </div>
            </div>
          </div>
        );

      case 'identity_rotate':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔄</div>
                <div>
                  <p className="text-sm font-medium">Rotacionar Identidade</p>
                  <p className="text-[11px] text-muted-foreground">Rotação de identidade operacional</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Rotacionar Proxy</Label>
                <p className="text-[11px] text-muted-foreground">Troca IP de saída</p>
              </div>
              <Switch checked={formData.rotate_proxy ?? false} onCheckedChange={(v) => updateField('rotate_proxy', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Rotacionar Worker</Label>
                <p className="text-[11px] text-muted-foreground">Muda servidor de execução</p>
              </div>
              <Switch checked={formData.rotate_worker ?? false} onCheckedChange={(v) => updateField('rotate_worker', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Rotacionar Instância</Label>
                <p className="text-[11px] text-muted-foreground">Troca instância WhatsApp</p>
              </div>
              <Switch checked={formData.rotate_instance ?? false} onCheckedChange={(v) => updateField('rotate_instance', v)} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Condição de Disparo</Label>
              <Select value={formData.trigger_condition || 'manual'} onValueChange={(v) => updateField('trigger_condition', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">🖐️ Manual</SelectItem>
                  <SelectItem value="error">❌ Após erro</SelectItem>
                  <SelectItem value="rate_limit">⚠️ Rate limit atingido</SelectItem>
                  <SelectItem value="time">⏰ Por tempo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      // ============ SECURITY NODES ============
      case 'execution_quota_guard':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🛡️</div>
                <div>
                  <p className="text-sm font-medium">Limite de Execução</p>
                  <p className="text-[11px] text-muted-foreground">Protege contra abuso</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Simultâneas</Label>
                <Input type="number" min="1" max="100" value={formData.max_concurrent || 10} onChange={(e) => updateField('max_concurrent', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Por Hora</Label>
                <Input type="number" min="1" max="10000" value={formData.max_per_hour || 1000} onChange={(e) => updateField('max_per_hour', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Máximo por Dia</Label>
              <Input type="number" min="1" max="100000" value={formData.max_per_day || 10000} onChange={(e) => updateField('max_per_day', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ação ao Violar</Label>
              <Select value={formData.on_violation || 'pause'} onValueChange={(v) => updateField('on_violation', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pause">⏸️ Pausar execução</SelectItem>
                  <SelectItem value="abort">⏹️ Abortar</SelectItem>
                  <SelectItem value="queue">📋 Enfileirar</SelectItem>
                  <SelectItem value="notify">🔔 Apenas notificar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'infra_rate_limit':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-yellow-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">⚡</div>
                <div>
                  <p className="text-sm font-medium">Limite de Infraestrutura</p>
                  <p className="text-[11px] text-muted-foreground">Limite de consumo de recursos</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Limite CPU (%)</Label>
              <Slider value={[formData.cpu_limit_percent || 80]} onValueChange={([v]) => updateField('cpu_limit_percent', v)} min={10} max={100} step={5} />
              <p className="text-[11px] text-muted-foreground text-center">{formData.cpu_limit_percent || 80}%</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Limite Memória (MB)</Label>
              <Input type="number" min="64" max="4096" value={formData.memory_limit_mb || 512} onChange={(e) => updateField('memory_limit_mb', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Throughput (Mbps)</Label>
              <Input type="number" min="1" max="1000" value={formData.throughput_mbps || 10} onChange={(e) => updateField('throughput_mbps', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Cooldown (min)</Label>
              <Input type="number" min="1" max="60" value={formData.cooldown_minutes || 5} onChange={(e) => updateField('cooldown_minutes', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
          </div>
        );

      case 'if_infra_health':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-green-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">💓</div>
                <div>
                  <p className="text-sm font-medium">Condição de Saúde</p>
                  <p className="text-[11px] text-muted-foreground">Decisão baseada em saúde da infra</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Verificar Saúde do Proxy</Label>
                <p className="text-[11px] text-muted-foreground">Checa se proxy está respondendo</p>
              </div>
              <Switch checked={formData.check_proxy_health ?? true} onCheckedChange={(v) => updateField('check_proxy_health', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Verificar Carga do Worker</Label>
                <p className="text-[11px] text-muted-foreground">Checa se worker não está sobrecarregado</p>
              </div>
              <Switch checked={formData.check_worker_load ?? true} onCheckedChange={(v) => updateField('check_worker_load', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Verificar Latência</Label>
                <p className="text-[11px] text-muted-foreground">Checa se latência está aceitável</p>
              </div>
              <Switch checked={formData.check_latency ?? true} onCheckedChange={(v) => updateField('check_latency', v)} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Limite de Latência (ms)</Label>
              <Input type="number" min="50" max="5000" value={formData.latency_threshold_ms || 500} onChange={(e) => updateField('latency_threshold_ms', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fallback</Label>
              <Select value={formData.fallback || 'pause'} onValueChange={(v) => updateField('fallback', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pause">⏸️ Pausar</SelectItem>
                  <SelectItem value="continue">➡️ Continuar</SelectItem>
                  <SelectItem value="rotate">🔄 Rotacionar recursos</SelectItem>
                  <SelectItem value="abort">⏹️ Abortar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'secure_context_guard':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔒</div>
                <div>
                  <p className="text-sm font-medium">Contexto Seguro</p>
                  <p className="text-[11px] text-muted-foreground">Proteção do contexto de execução</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Isolar Execução</Label>
                <p className="text-[11px] text-muted-foreground">Cada execução em ambiente isolado</p>
              </div>
              <Switch checked={formData.isolate_execution ?? true} onCheckedChange={(v) => updateField('isolate_execution', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Prevenir Vazamento</Label>
                <p className="text-[11px] text-muted-foreground">Bloqueia acesso entre contextos</p>
              </div>
              <Switch checked={formData.prevent_variable_leak ?? true} onCheckedChange={(v) => updateField('prevent_variable_leak', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Reset Automático em Erro</Label>
                <p className="text-[11px] text-muted-foreground">Limpa contexto após falha</p>
              </div>
              <Switch checked={formData.auto_reset_on_error ?? true} onCheckedChange={(v) => updateField('auto_reset_on_error', v)} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Variáveis Permitidas</Label>
              <Textarea value={formData.allowed_variables_raw || ''} onChange={(e) => updateField('allowed_variables_raw', e.target.value)} placeholder="nome&#10;telefone&#10;user_id" className="bg-muted/50 resize-none font-mono text-xs" rows={3} />
              <p className="text-[11px] text-muted-foreground">Uma por linha. Vazio = todas permitidas</p>
            </div>
          </div>
        );

      // ==========================================
      // WEBHOOK NODES - Universal Webhook Gateway
      // ==========================================
      
      case 'webhook_universal_trigger':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🌐</div>
                <div>
                  <p className="text-sm font-medium">Webhook Universal</p>
                  <p className="text-[11px] text-muted-foreground">Recebe webhooks de qualquer sistema</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome do Webhook</Label>
              <Input value={formData.webhook_name || ''} onChange={(e) => updateField('webhook_name', e.target.value)} placeholder="meu-webhook-pagamentos" className="bg-muted/50" />
              <p className="text-[11px] text-muted-foreground">Identificador único (sem espaços)</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Métodos Aceitos</Label>
              <div className="flex flex-wrap gap-2">
                {['POST', 'PUT', 'PATCH', 'GET', 'DELETE'].map((method) => (
                  <Badge 
                    key={method}
                    variant={formData.allowed_methods?.includes(method) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = formData.allowed_methods || ['POST'];
                      const updated = current.includes(method) 
                        ? current.filter((m: string) => m !== method)
                        : [...current, method];
                      updateField('allowed_methods', updated.length ? updated : ['POST']);
                    }}
                  >
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Content-Types Aceitos</Label>
              <Select value={formData.content_type || 'any'} onValueChange={(v) => updateField('content_type', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  <SelectItem value="application/json">JSON</SelectItem>
                  <SelectItem value="application/x-www-form-urlencoded">Form URL Encoded</SelectItem>
                  <SelectItem value="multipart/form-data">Multipart Form</SelectItem>
                  <SelectItem value="text/plain">Texto Plano</SelectItem>
                  <SelectItem value="application/xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Ativo</Label>
                <p className="text-[11px] text-muted-foreground">Webhook está recebendo eventos</p>
              </div>
              <Switch checked={formData.is_active ?? true} onCheckedChange={(v) => updateField('is_active', v)} />
            </div>
            
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Variáveis Disponíveis</p>
                  <code className="text-[10px] bg-muted px-1 rounded">{'{{webhook.body}}'}</code>{' '}
                  <code className="text-[10px] bg-muted px-1 rounded">{'{{webhook.headers}}'}</code>{' '}
                  <code className="text-[10px] bg-muted px-1 rounded">{'{{webhook.query}}'}</code>
                </div>
              </div>
            </div>
          </div>
        );

      case 'webhook_auth_guard':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-green-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔐</div>
                <div>
                  <p className="text-sm font-medium">Autenticação de Webhook</p>
                  <p className="text-[11px] text-muted-foreground">Valida credenciais do emissor</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tipo de Autenticação</Label>
              <Select value={formData.auth_type || 'token'} onValueChange={(v) => updateField('auth_type', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">🔑 Bearer Token</SelectItem>
                  <SelectItem value="header">📋 Header Customizado</SelectItem>
                  <SelectItem value="basic">👤 Basic Auth</SelectItem>
                  <SelectItem value="hmac">🔏 HMAC Signature</SelectItem>
                  <SelectItem value="ip_whitelist">🌐 IP Whitelist</SelectItem>
                  <SelectItem value="api_key">🗝️ API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <AnimatePresence mode="wait">
              {formData.auth_type === 'token' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Token Esperado</Label>
                    <Input type="password" value={formData.expected_token || ''} onChange={(e) => updateField('expected_token', e.target.value)} placeholder="sk_live_xxxxxx" className="bg-muted/50 font-mono" />
                  </div>
                </motion.div>
              )}
              
              {formData.auth_type === 'header' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome do Header</Label>
                    <Input value={formData.header_name || ''} onChange={(e) => updateField('header_name', e.target.value)} placeholder="X-Webhook-Secret" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Valor Esperado</Label>
                    <Input type="password" value={formData.header_value || ''} onChange={(e) => updateField('header_value', e.target.value)} placeholder="meu-segredo-123" className="bg-muted/50 font-mono" />
                  </div>
                </motion.div>
              )}
              
              {formData.auth_type === 'basic' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Usuário</Label>
                    <Input value={formData.basic_user || ''} onChange={(e) => updateField('basic_user', e.target.value)} placeholder="usuario" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Senha</Label>
                    <Input type="password" value={formData.basic_password || ''} onChange={(e) => updateField('basic_password', e.target.value)} placeholder="••••••••" className="bg-muted/50" />
                  </div>
                </motion.div>
              )}
              
              {formData.auth_type === 'hmac' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Segredo HMAC</Label>
                    <Input type="password" value={formData.hmac_secret || ''} onChange={(e) => updateField('hmac_secret', e.target.value)} placeholder="whsec_xxxxxx" className="bg-muted/50 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Header da Assinatura</Label>
                    <Input value={formData.signature_header || 'X-Signature'} onChange={(e) => updateField('signature_header', e.target.value)} placeholder="X-Signature" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Algoritmo</Label>
                    <Select value={formData.hmac_algorithm || 'sha256'} onValueChange={(v) => updateField('hmac_algorithm', v)}>
                      <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sha256">SHA-256</SelectItem>
                        <SelectItem value="sha512">SHA-512</SelectItem>
                        <SelectItem value="sha1">SHA-1 (legado)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
              
              {formData.auth_type === 'ip_whitelist' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">IPs Permitidos</Label>
                    <Textarea value={formData.allowed_ips || ''} onChange={(e) => updateField('allowed_ips', e.target.value)} placeholder="192.168.1.1&#10;10.0.0.0/8&#10;::1" className="bg-muted/50 resize-none font-mono text-xs" rows={4} />
                    <p className="text-[11px] text-muted-foreground">Um IP ou CIDR por linha</p>
                  </div>
                </motion.div>
              )}
              
              {formData.auth_type === 'api_key' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome do Parâmetro</Label>
                    <Input value={formData.api_key_param || 'api_key'} onChange={(e) => updateField('api_key_param', e.target.value)} placeholder="api_key" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Localização</Label>
                    <Select value={formData.api_key_location || 'header'} onValueChange={(v) => updateField('api_key_location', v)}>
                      <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="query">Query String</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">API Key</Label>
                    <Input type="password" value={formData.api_key_value || ''} onChange={(e) => updateField('api_key_value', e.target.value)} placeholder="pk_live_xxxxxx" className="bg-muted/50 font-mono" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Rejeitar Inválidos</Label>
                <p className="text-[11px] text-muted-foreground">Retorna 401 se falhar</p>
              </div>
              <Switch checked={formData.reject_unauthorized ?? true} onCheckedChange={(v) => updateField('reject_unauthorized', v)} />
            </div>
          </div>
        );

      case 'webhook_signature_verify':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">✅</div>
                <div>
                  <p className="text-sm font-medium">Verificar Assinatura</p>
                  <p className="text-[11px] text-muted-foreground">Valida integridade do payload</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Provider/Estilo</Label>
              <Select value={formData.signature_provider || 'custom'} onValueChange={(v) => updateField('signature_provider', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">💳 Stripe</SelectItem>
                  <SelectItem value="github">🐙 GitHub</SelectItem>
                  <SelectItem value="shopify">🛒 Shopify</SelectItem>
                  <SelectItem value="mercadopago">💰 Mercado Pago</SelectItem>
                  <SelectItem value="pagarme">💳 Pagar.me</SelectItem>
                  <SelectItem value="asaas">📊 Asaas</SelectItem>
                  <SelectItem value="hotmart">🔥 Hotmart</SelectItem>
                  <SelectItem value="custom">⚙️ Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <AnimatePresence mode="wait">
              {formData.signature_provider === 'stripe' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Webhook Signing Secret</Label>
                    <Input type="password" value={formData.stripe_secret || ''} onChange={(e) => updateField('stripe_secret', e.target.value)} placeholder="whsec_xxxxxx" className="bg-muted/50 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tolerância de Tempo (segundos)</Label>
                    <Input type="number" min="60" max="600" value={formData.tolerance_seconds || 300} onChange={(e) => updateField('tolerance_seconds', parseInt(e.target.value))} className="bg-muted/50" />
                  </div>
                </motion.div>
              )}
              
              {formData.signature_provider === 'github' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Webhook Secret</Label>
                    <Input type="password" value={formData.github_secret || ''} onChange={(e) => updateField('github_secret', e.target.value)} placeholder="seu-segredo-github" className="bg-muted/50 font-mono" />
                  </div>
                </motion.div>
              )}
              
              {['mercadopago', 'pagarme', 'asaas', 'hotmart', 'shopify'].includes(formData.signature_provider || '') && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Secret Key</Label>
                    <Input type="password" value={formData.provider_secret || ''} onChange={(e) => updateField('provider_secret', e.target.value)} placeholder="seu-secret-key" className="bg-muted/50 font-mono" />
                  </div>
                </motion.div>
              )}
              
              {formData.signature_provider === 'custom' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Header da Assinatura</Label>
                    <Input value={formData.custom_signature_header || 'X-Signature'} onChange={(e) => updateField('custom_signature_header', e.target.value)} placeholder="X-Signature" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Segredo</Label>
                    <Input type="password" value={formData.custom_secret || ''} onChange={(e) => updateField('custom_secret', e.target.value)} placeholder="meu-segredo" className="bg-muted/50 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Algoritmo</Label>
                    <Select value={formData.custom_algorithm || 'sha256'} onValueChange={(v) => updateField('custom_algorithm', v)}>
                      <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sha256">HMAC-SHA256</SelectItem>
                        <SelectItem value="sha512">HMAC-SHA512</SelectItem>
                        <SelectItem value="sha1">HMAC-SHA1</SelectItem>
                        <SelectItem value="md5">HMAC-MD5 (inseguro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Prefixo da Assinatura</Label>
                    <Input value={formData.signature_prefix || ''} onChange={(e) => updateField('signature_prefix', e.target.value)} placeholder="sha256=" className="bg-muted/50" />
                    <p className="text-[11px] text-muted-foreground">Ex: sha256= (GitHub), v1= (Stripe)</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Bloquear Assinatura Inválida</Label>
                <p className="text-[11px] text-muted-foreground">Interrompe fluxo se falhar</p>
              </div>
              <Switch checked={formData.block_invalid ?? true} onCheckedChange={(v) => updateField('block_invalid', v)} />
            </div>
          </div>
        );

      case 'webhook_rate_limit':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-orange-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">⏱️</div>
                <div>
                  <p className="text-sm font-medium">Rate Limit</p>
                  <p className="text-[11px] text-muted-foreground">Controle de frequência de requests</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Limite por Período</Label>
              <div className="flex gap-2">
                <Input type="number" min="1" max="10000" value={formData.max_requests || 100} onChange={(e) => updateField('max_requests', parseInt(e.target.value))} className="bg-muted/50 flex-1" placeholder="100" />
                <Select value={formData.period || 'minute'} onValueChange={(v) => updateField('period', v)}>
                  <SelectTrigger className="bg-muted/50 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="second">/ segundo</SelectItem>
                    <SelectItem value="minute">/ minuto</SelectItem>
                    <SelectItem value="hour">/ hora</SelectItem>
                    <SelectItem value="day">/ dia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Escopo do Limite</Label>
              <Select value={formData.limit_scope || 'webhook'} onValueChange={(v) => updateField('limit_scope', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="webhook">🌐 Por Webhook</SelectItem>
                  <SelectItem value="ip">📍 Por IP</SelectItem>
                  <SelectItem value="user">👤 Por Usuário</SelectItem>
                  <SelectItem value="global">🌍 Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Burst Limit</Label>
              <Input type="number" min="1" max="100" value={formData.burst_limit || 10} onChange={(e) => updateField('burst_limit', parseInt(e.target.value))} className="bg-muted/50" />
              <p className="text-[11px] text-muted-foreground">Máximo de requests simultâneos</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ação ao Exceder</Label>
              <Select value={formData.exceed_action || 'reject'} onValueChange={(v) => updateField('exceed_action', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reject">❌ Rejeitar (429)</SelectItem>
                  <SelectItem value="queue">📋 Enfileirar</SelectItem>
                  <SelectItem value="delay">⏳ Atrasar</SelectItem>
                  <SelectItem value="drop">🗑️ Descartar Silenciosamente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Enviar Headers</Label>
                <p className="text-[11px] text-muted-foreground">X-RateLimit-* na resposta</p>
              </div>
              <Switch checked={formData.send_headers ?? true} onCheckedChange={(v) => updateField('send_headers', v)} />
            </div>
          </div>
        );

      case 'webhook_queue':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📋</div>
                <div>
                  <p className="text-sm font-medium">Fila de Webhooks</p>
                  <p className="text-[11px] text-muted-foreground">Enfileira para processamento assíncrono</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome da Fila</Label>
              <Input value={formData.queue_name || 'default'} onChange={(e) => updateField('queue_name', e.target.value)} placeholder="fila-pagamentos" className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Prioridade</Label>
              <Select value={formData.priority || 'normal'} onValueChange={(v) => updateField('priority', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">🔴 Crítica</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="normal">🟡 Normal</SelectItem>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Delay Inicial (segundos)</Label>
              <Input type="number" min="0" max="3600" value={formData.delay_seconds || 0} onChange={(e) => updateField('delay_seconds', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Máx. Tentativas</Label>
              <Input type="number" min="1" max="10" value={formData.max_retries || 3} onChange={(e) => updateField('max_retries', parseInt(e.target.value))} className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Backoff Exponencial</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min="1" max="60" value={formData.backoff_base || 2} onChange={(e) => updateField('backoff_base', parseInt(e.target.value))} className="bg-muted/50 w-20" />
                <span className="text-xs text-muted-foreground">^ tentativa (segundos)</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Preservar Ordem</Label>
                <p className="text-[11px] text-muted-foreground">FIFO rigoroso</p>
              </div>
              <Switch checked={formData.preserve_order ?? false} onCheckedChange={(v) => updateField('preserve_order', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Resposta Imediata</Label>
                <p className="text-[11px] text-muted-foreground">Retorna 202 antes de processar</p>
              </div>
              <Switch checked={formData.immediate_response ?? true} onCheckedChange={(v) => updateField('immediate_response', v)} />
            </div>
          </div>
        );

      case 'webhook_deduplication':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-yellow-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔄</div>
                <div>
                  <p className="text-sm font-medium">Deduplicação</p>
                  <p className="text-[11px] text-muted-foreground">Previne processamento duplicado</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Chave de Deduplicação</Label>
              <Select value={formData.dedup_key || 'event_id'} onValueChange={(v) => updateField('dedup_key', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="event_id">📌 Event ID (header)</SelectItem>
                  <SelectItem value="body_field">📋 Campo do Body</SelectItem>
                  <SelectItem value="body_hash">🔐 Hash do Body</SelectItem>
                  <SelectItem value="custom_expression">⚙️ Expressão Customizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <AnimatePresence mode="wait">
              {formData.dedup_key === 'event_id' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome do Header</Label>
                    <Input value={formData.event_id_header || 'X-Event-ID'} onChange={(e) => updateField('event_id_header', e.target.value)} placeholder="X-Event-ID" className="bg-muted/50" />
                  </div>
                </motion.div>
              )}
              
              {formData.dedup_key === 'body_field' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Caminho do Campo (JSONPath)</Label>
                    <Input value={formData.body_field_path || '$.id'} onChange={(e) => updateField('body_field_path', e.target.value)} placeholder="$.data.id" className="bg-muted/50 font-mono" />
                  </div>
                </motion.div>
              )}
              
              {formData.dedup_key === 'custom_expression' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Expressão</Label>
                    <Textarea value={formData.custom_dedup_expr || ''} onChange={(e) => updateField('custom_dedup_expr', e.target.value)} placeholder="${{body.type}}_${{body.id}}" className="bg-muted/50 resize-none font-mono text-xs" rows={2} />
                    <p className="text-[11px] text-muted-foreground">Use variáveis do webhook</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Janela de Deduplicação</Label>
              <div className="flex gap-2">
                <Input type="number" min="1" max="86400" value={formData.dedup_window || 3600} onChange={(e) => updateField('dedup_window', parseInt(e.target.value))} className="bg-muted/50 flex-1" />
                <Select value={formData.dedup_window_unit || 'seconds'} onValueChange={(v) => updateField('dedup_window_unit', v)}>
                  <SelectTrigger className="bg-muted/50 w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">segundos</SelectItem>
                    <SelectItem value="minutes">minutos</SelectItem>
                    <SelectItem value="hours">horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ação em Duplicata</Label>
              <Select value={formData.duplicate_action || 'skip'} onValueChange={(v) => updateField('duplicate_action', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skip">⏭️ Ignorar Silenciosamente</SelectItem>
                  <SelectItem value="reject">❌ Rejeitar (409)</SelectItem>
                  <SelectItem value="log_only">📝 Apenas Logar</SelectItem>
                  <SelectItem value="update">🔄 Atualizar Existente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'webhook_payload_parser':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-green-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📦</div>
                <div>
                  <p className="text-sm font-medium">Parser de Payload</p>
                  <p className="text-[11px] text-muted-foreground">Extrai e transforma dados</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Método de Extração</Label>
              <Select value={formData.extraction_method || 'jsonpath'} onValueChange={(v) => updateField('extraction_method', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="jsonpath">📋 JSONPath</SelectItem>
                  <SelectItem value="jmespath">🔍 JMESPath</SelectItem>
                  <SelectItem value="xpath">📄 XPath (XML)</SelectItem>
                  <SelectItem value="regex">🔤 Regex</SelectItem>
                  <SelectItem value="template">📝 Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mapeamentos</Label>
              <Textarea 
                value={formData.mappings_raw || ''} 
                onChange={(e) => updateField('mappings_raw', e.target.value)} 
                placeholder="nome:$.customer.name&#10;email:$.customer.email&#10;valor:$.amount&#10;status:$.payment.status" 
                className="bg-muted/50 resize-none font-mono text-xs" 
                rows={6} 
              />
              <p className="text-[11px] text-muted-foreground">Formato: variavel:expressão (um por linha)</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Valor Padrão</Label>
              <Input value={formData.default_value || ''} onChange={(e) => updateField('default_value', e.target.value)} placeholder="(vazio se não encontrar)" className="bg-muted/50" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Preservar Payload Original</Label>
                <p className="text-[11px] text-muted-foreground">Mantém em webhook.raw_body</p>
              </div>
              <Switch checked={formData.preserve_original ?? true} onCheckedChange={(v) => updateField('preserve_original', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Falhar se Vazio</Label>
                <p className="text-[11px] text-muted-foreground">Erro se nenhum campo extraído</p>
              </div>
              <Switch checked={formData.fail_on_empty ?? false} onCheckedChange={(v) => updateField('fail_on_empty', v)} />
            </div>
          </div>
        );

      case 'webhook_event_router':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">🔀</div>
                <div>
                  <p className="text-sm font-medium">Roteador de Eventos</p>
                  <p className="text-[11px] text-muted-foreground">Direciona por tipo de evento</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Campo do Tipo de Evento</Label>
              <Input value={formData.event_type_field || '$.type'} onChange={(e) => updateField('event_type_field', e.target.value)} placeholder="$.type ou $.event" className="bg-muted/50 font-mono" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Rotas</Label>
              <Textarea 
                value={formData.routes_raw || ''} 
                onChange={(e) => updateField('routes_raw', e.target.value)} 
                placeholder="payment.approved:processar_pagamento&#10;payment.rejected:notificar_falha&#10;subscription.created:criar_assinatura&#10;*:rota_padrao" 
                className="bg-muted/50 resize-none font-mono text-xs" 
                rows={6} 
              />
              <p className="text-[11px] text-muted-foreground">evento:ação (* = default)</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ação para Evento Desconhecido</Label>
              <Select value={formData.unknown_action || 'default'} onValueChange={(v) => updateField('unknown_action', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">➡️ Usar Rota Padrão (*)</SelectItem>
                  <SelectItem value="skip">⏭️ Ignorar</SelectItem>
                  <SelectItem value="error">❌ Gerar Erro</SelectItem>
                  <SelectItem value="dead_letter">📬 Dead Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Case Insensitive</Label>
                <p className="text-[11px] text-muted-foreground">Ignora maiúsculas/minúsculas</p>
              </div>
              <Switch checked={formData.case_insensitive ?? true} onCheckedChange={(v) => updateField('case_insensitive', v)} />
            </div>
          </div>
        );

      case 'webhook_response':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📤</div>
                <div>
                  <p className="text-sm font-medium">Resposta HTTP</p>
                  <p className="text-[11px] text-muted-foreground">Configura resposta ao emissor</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Status Code</Label>
              <Select value={String(formData.status_code || 200)} onValueChange={(v) => updateField('status_code', parseInt(v))}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="200">✅ 200 - OK</SelectItem>
                  <SelectItem value="201">✅ 201 - Created</SelectItem>
                  <SelectItem value="202">⏳ 202 - Accepted</SelectItem>
                  <SelectItem value="204">✅ 204 - No Content</SelectItem>
                  <SelectItem value="400">❌ 400 - Bad Request</SelectItem>
                  <SelectItem value="401">🔐 401 - Unauthorized</SelectItem>
                  <SelectItem value="403">🚫 403 - Forbidden</SelectItem>
                  <SelectItem value="404">🔍 404 - Not Found</SelectItem>
                  <SelectItem value="409">⚠️ 409 - Conflict</SelectItem>
                  <SelectItem value="422">❌ 422 - Unprocessable</SelectItem>
                  <SelectItem value="429">⏱️ 429 - Too Many Requests</SelectItem>
                  <SelectItem value="500">💥 500 - Internal Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Content-Type</Label>
              <Select value={formData.response_content_type || 'application/json'} onValueChange={(v) => updateField('response_content_type', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="application/json">JSON</SelectItem>
                  <SelectItem value="text/plain">Texto</SelectItem>
                  <SelectItem value="text/html">HTML</SelectItem>
                  <SelectItem value="application/xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Body da Resposta</Label>
              <Textarea 
                value={formData.response_body || ''} 
                onChange={(e) => updateField('response_body', e.target.value)} 
                placeholder='{"success": true, "message": "Webhook recebido"}' 
                className="bg-muted/50 resize-none font-mono text-xs" 
                rows={4} 
              />
              <p className="text-[11px] text-muted-foreground">Suporta variáveis: {'{{execution_id}}'}, {'{{timestamp}}'}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Headers Customizados</Label>
              <Textarea 
                value={formData.custom_headers_raw || ''} 
                onChange={(e) => updateField('custom_headers_raw', e.target.value)} 
                placeholder="X-Request-Id:{{execution_id}}&#10;X-Processed-At:{{timestamp}}" 
                className="bg-muted/50 resize-none font-mono text-xs" 
                rows={3} 
              />
              <p className="text-[11px] text-muted-foreground">header:valor (um por linha)</p>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">CORS Headers</Label>
                <p className="text-[11px] text-muted-foreground">Inclui Access-Control-*</p>
              </div>
              <Switch checked={formData.include_cors ?? true} onCheckedChange={(v) => updateField('include_cors', v)} />
            </div>
          </div>
        );

      case 'webhook_dead_letter':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-red-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">📬</div>
                <div>
                  <p className="text-sm font-medium">Dead Letter Queue</p>
                  <p className="text-[11px] text-muted-foreground">Captura eventos com falha</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Condição de Captura</Label>
              <Select value={formData.capture_condition || 'all_errors'} onValueChange={(v) => updateField('capture_condition', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_errors">❌ Todos os Erros</SelectItem>
                  <SelectItem value="max_retries">🔄 Após Máx. Tentativas</SelectItem>
                  <SelectItem value="specific_errors">🎯 Erros Específicos</SelectItem>
                  <SelectItem value="timeout">⏱️ Timeout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.capture_condition === 'specific_errors' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Códigos de Erro</Label>
                <Textarea value={formData.error_codes || ''} onChange={(e) => updateField('error_codes', e.target.value)} placeholder="VALIDATION_ERROR&#10;AUTH_FAILED&#10;RATE_LIMITED" className="bg-muted/50 resize-none font-mono text-xs" rows={3} />
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Retenção</Label>
              <div className="flex gap-2">
                <Input type="number" min="1" max="365" value={formData.retention_days || 30} onChange={(e) => updateField('retention_days', parseInt(e.target.value))} className="bg-muted/50 flex-1" />
                <span className="text-sm text-muted-foreground self-center">dias</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Permitir Replay Manual</Label>
                <p className="text-[11px] text-muted-foreground">Reprocessar via painel</p>
              </div>
              <Switch checked={formData.allow_replay ?? true} onCheckedChange={(v) => updateField('allow_replay', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Notificar por Email</Label>
                <p className="text-[11px] text-muted-foreground">Alerta ao capturar erro</p>
              </div>
              <Switch checked={formData.notify_email ?? false} onCheckedChange={(v) => updateField('notify_email', v)} />
            </div>
            
            {formData.notify_email && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email para Notificação</Label>
                <Input type="email" value={formData.notification_email || ''} onChange={(e) => updateField('notification_email', e.target.value)} placeholder="admin@empresa.com" className="bg-muted/50" />
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Webhook de Notificação</Label>
                <p className="text-[11px] text-muted-foreground">Dispara para outro endpoint</p>
              </div>
              <Switch checked={formData.notify_webhook ?? false} onCheckedChange={(v) => updateField('notify_webhook', v)} />
            </div>
            
            {formData.notify_webhook && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">URL do Webhook</Label>
                <Input value={formData.notification_webhook_url || ''} onChange={(e) => updateField('notification_webhook_url', e.target.value)} placeholder="https://..." className="bg-muted/50" />
              </div>
            )}
          </div>
        );

      // ============ AI NATIVE NODES ============
      case 'ai_prompt_execute':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Executar Prompt IA</p>
                  <p className="text-[11px] text-muted-foreground">Usa Lovable AI (sem API Key)</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">System Prompt</Label>
              <Textarea value={formData.system_prompt || ''} onChange={(e) => updateField('system_prompt', e.target.value)} placeholder="Você é um assistente útil..." className="bg-muted/50 resize-none" rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Prompt</Label>
              <Textarea value={formData.prompt || ''} onChange={(e) => updateField('prompt', e.target.value)} placeholder="Responda à mensagem: {{message}}" className="bg-muted/50 resize-none min-h-[100px]" />
              <div className="flex flex-wrap gap-1.5">
                {['{{message}}', '{{nome}}', '{{telefone}}'].map((v) => (
                  <Badge key={v} variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary/20" onClick={() => updateField('prompt', (formData.prompt || '') + ' ' + v)}>{v}</Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Modelo</Label>
              <Select value={formData.model || 'google/gemini-2.5-flash'} onValueChange={(v) => updateField('model', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="google/gemini-2.5-flash">⚡ Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">💎 Gemini 2.5 Pro</SelectItem>
                  <SelectItem value="openai/gpt-5-mini">🤖 GPT-5 Mini</SelectItem>
                  <SelectItem value="openai/gpt-5">🧠 GPT-5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Max Tokens</Label>
                <Input type="number" min="100" max="4096" value={formData.max_tokens || 1024} onChange={(e) => updateField('max_tokens', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Temperatura</Label>
                <Input type="number" min="0" max="1" step="0.1" value={formData.temperature || 0.7} onChange={(e) => updateField('temperature', parseFloat(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Salvar resposta em</Label>
              <Input value={formData.save_response_to || 'ai_response'} onChange={(e) => updateField('save_response_to', e.target.value)} placeholder="ai_response" className="bg-muted/50 font-mono" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Usar contexto de chat</Label>
                <p className="text-[11px] text-muted-foreground">Inclui histórico da conversa</p>
              </div>
              <Switch checked={formData.use_context ?? true} onCheckedChange={(v) => updateField('use_context', v)} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Resposta Fallback</Label>
              <Input value={formData.fallback_response || ''} onChange={(e) => updateField('fallback_response', e.target.value)} placeholder="Desculpe, não consegui processar..." className="bg-muted/50" />
            </div>
          </div>
        );

      case 'ai_chat_context':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="text-lg">💬</div>
                <div>
                  <p className="text-sm font-medium">Contexto de Chat IA</p>
                  <p className="text-[11px] text-muted-foreground">Mantém histórico conversacional</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Escopo do Contexto</Label>
              <Select value={formData.context_scope || 'execution'} onValueChange={(v) => updateField('context_scope', v)}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="execution">🔄 Execução atual</SelectItem>
                  <SelectItem value="session">👤 Sessão do usuário</SelectItem>
                  <SelectItem value="global">🌍 Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Máx. Histórico</Label>
                <Input type="number" min="1" max="50" value={formData.max_history || 10} onChange={(e) => updateField('max_history', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Chave do Contexto</Label>
                <Input value={formData.context_key || 'chat_history'} onChange={(e) => updateField('context_key', e.target.value)} placeholder="chat_history" className="bg-muted/50 font-mono text-sm" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Incluir System Prompt</Label>
                <p className="text-[11px] text-muted-foreground">Adiciona instruções do sistema</p>
              </div>
              <Switch checked={formData.include_system ?? true} onCheckedChange={(v) => updateField('include_system', v)} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <Label className="text-sm">Auto-resumir</Label>
                <p className="text-[11px] text-muted-foreground">Resume conversas longas</p>
              </div>
              <Switch checked={formData.auto_summarize ?? false} onCheckedChange={(v) => updateField('auto_summarize', v)} />
            </div>
            
            {formData.auto_summarize && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Resumir após X mensagens</Label>
                <Input type="number" min="5" max="100" value={formData.summarize_after || 20} onChange={(e) => updateField('summarize_after', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
            )}
          </div>
        );

      case 'ai_decision':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-green-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Decisão IA</p>
                  <p className="text-[11px] text-muted-foreground">Retorna decisão estruturada</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Prompt de Decisão</Label>
              <Textarea value={formData.decision_prompt || ''} onChange={(e) => updateField('decision_prompt', e.target.value)} placeholder="Analise a mensagem e decida a melhor ação..." className="bg-muted/50 resize-none" rows={3} />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Opções de Decisão</Label>
              <Textarea 
                value={formData.options_raw || ''} 
                onChange={(e) => updateField('options_raw', e.target.value)} 
                placeholder="venda|Interesse em compra&#10;suporte|Precisa de ajuda&#10;informacao|Quer saber mais&#10;outro|Outro assunto" 
                className="bg-muted/50 resize-none font-mono text-xs" 
                rows={5} 
              />
              <p className="text-[11px] text-muted-foreground">Formato: valor|descrição (um por linha)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Opção Padrão</Label>
                <Input value={formData.default_option || 'outro'} onChange={(e) => updateField('default_option', e.target.value)} placeholder="outro" className="bg-muted/50 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Confiança Mín.</Label>
                <Input type="number" min="0" max="1" step="0.1" value={formData.confidence_threshold || 0.7} onChange={(e) => updateField('confidence_threshold', parseFloat(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Salvar decisão em</Label>
                <Input value={formData.save_decision_to || 'ai_decision'} onChange={(e) => updateField('save_decision_to', e.target.value)} placeholder="ai_decision" className="bg-muted/50 font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Salvar razão em</Label>
                <Input value={formData.save_reasoning_to || 'ai_reasoning'} onChange={(e) => updateField('save_reasoning_to', e.target.value)} placeholder="ai_reasoning" className="bg-muted/50 font-mono text-sm" />
              </div>
            </div>
            
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400 font-medium">✓ Decisão</span> = segue caminho correspondente
                <br />
                <span className="text-amber-400 font-medium">⚠ Baixa confiança</span> = usa opção padrão
              </p>
            </div>
          </div>
        );

      case 'ai_embedding':
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Embedding IA</p>
                  <p className="text-[11px] text-muted-foreground">Gera vetores para busca semântica</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Texto de Origem</Label>
              <Input value={formData.text_source || '{{message}}'} onChange={(e) => updateField('text_source', e.target.value)} placeholder="{{message}}" className="bg-muted/50 font-mono" />
              <div className="flex flex-wrap gap-1.5">
                {['{{message}}', '{{nome}}', '{{descricao}}'].map((v) => (
                  <Badge key={v} variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary/20" onClick={() => updateField('text_source', v)}>{v}</Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Salvar embedding em</Label>
              <Input value={formData.save_embedding_to || 'embedding'} onChange={(e) => updateField('save_embedding_to', e.target.value)} placeholder="embedding" className="bg-muted/50 font-mono" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Coleção de Busca (opcional)</Label>
              <Input value={formData.search_collection || ''} onChange={(e) => updateField('search_collection', e.target.value)} placeholder="produtos, faq, base_conhecimento" className="bg-muted/50" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Top K</Label>
                <Input type="number" min="1" max="20" value={formData.top_k || 5} onChange={(e) => updateField('top_k', parseInt(e.target.value))} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Similaridade Mín.</Label>
                <Input type="number" min="0" max="1" step="0.1" value={formData.similarity_threshold || 0.8} onChange={(e) => updateField('similarity_threshold', parseFloat(e.target.value))} className="bg-muted/50" />
              </div>
            </div>
            
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">Embeddings são úteis para buscar documentos similares, FAQs ou produtos baseado em significado semântico.</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Este nó não possui configurações adicionais.</p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="w-[360px] bg-card/95 backdrop-blur-xl border-l flex flex-col h-full shadow-2xl fixed right-0 top-0 z-50"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${nodeColor}20` }}>
                <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: nodeColor }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{formData.label || 'Configurar Nó'}</h3>
                <Badge variant="secondary" className="text-[10px]">{node.data.type}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
          </div>

          <TabsList className="w-full bg-muted/50 p-1 h-9">
            <TabsTrigger value="config" className="flex-1 text-xs gap-1.5 h-7"><Sparkles className="w-3 h-3" /> Configurar</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1 text-xs gap-1.5 h-7"><Eye className="w-3 h-3" /> Preview</TabsTrigger>
            <TabsTrigger value="code" className="flex-1 text-xs gap-1.5 h-7"><Code className="w-3 h-3" /> JSON</TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="config" className="m-0 space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome do Nó</Label>
                <Input value={formData.label || ''} onChange={(e) => updateField('label', e.target.value)} placeholder="Nome do nó" className="bg-muted/50" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Descrição</Label>
                <Input value={formData.description || ''} onChange={(e) => updateField('description', e.target.value)} placeholder="Breve descrição (opcional)" className="bg-muted/50" />
              </div>

              <div className="my-4 border-t" />

              {/* Type-specific config */}
              {renderConfigFields()}
            </TabsContent>

            <TabsContent value="preview" className="m-0">
              <div className="rounded-xl border bg-muted/30 p-4 min-h-[200px]">
                <p className="text-xs text-muted-foreground text-center">Preview da mensagem aparecerá aqui</p>
              </div>
            </TabsContent>

            <TabsContent value="code" className="m-0">
              <pre className="rounded-xl bg-muted/50 p-4 text-xs overflow-auto">{JSON.stringify(node.data, null, 2)}</pre>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-muted/20 space-y-2">
        {hasChanges && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-amber-500 text-center mb-2">⚠️ Alterações não salvas</motion.div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => onDuplicate?.(node.id)}><Copy className="w-3.5 h-3.5" />Duplicar</Button>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => onDelete(node.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
        <Button size="sm" className="w-full gap-1.5" onClick={handleSave} disabled={!hasChanges}><Save className="w-3.5 h-3.5" />Salvar Alterações</Button>
      </div>
    </motion.div>
  );
};
