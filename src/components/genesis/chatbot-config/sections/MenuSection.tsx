import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  List, 
  Plus, 
  Trash2, 
  GripVertical,
  MessageSquare,
  ArrowRight,
  GitBranch,
  HeadphonesIcon,
  Bot,
  LogOut,
  ChevronDown,
  Database
} from 'lucide-react';
import { ChatbotFormState, MenuOptionForm, InputDataType } from '../types';

interface MenuSectionProps {
  form: ChatbotFormState;
  setForm: (form: ChatbotFormState) => void;
}

const ACTION_TYPES = [
  { value: 'message', label: 'Mensagem + Submenu', icon: MessageSquare },
  { value: 'step', label: 'Ir para etapa', icon: ArrowRight },
  { value: 'subflow', label: 'Subfluxo', icon: GitBranch },
  { value: 'transfer', label: 'Atendente humano', icon: HeadphonesIcon },
  { value: 'ai', label: 'Luna IA', icon: Bot },
  { value: 'end', label: 'Encerrar', icon: LogOut },
];

const DATA_TYPES: Array<{ value: InputDataType; label: string }> = [
  { value: 'name', label: 'Nome' },
  { value: 'phone', label: 'Telefone' },
  { value: 'email', label: 'E-mail' },
  { value: 'cpf', label: 'CPF' },
  { value: 'bank', label: 'Banco' },
  { value: 'company_type', label: 'Tipo de empresa' },
  { value: 'service', label: 'Serviço' },
  { value: 'custom', label: 'Personalizado' },
];

export function MenuSection({ form, setForm }: MenuSectionProps) {
  const addOption = () => {
    if (form.menu_options.length >= 10) return;
    setForm({
      ...form,
      menu_options: [
        ...form.menu_options,
        {
          id: String(form.menu_options.length + 1),
          text: '',
          description: '',
          action: 'message',
          next_step_id: '',
          response_message: '',
          collect_data: false,
        },
      ],
    });
  };

  const removeOption = (index: number) => {
    if (form.menu_options.length <= 1) return;
    setForm({
      ...form,
      menu_options: form.menu_options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, updates: Partial<MenuOptionForm>) => {
    setForm({
      ...form,
      menu_options: form.menu_options.map((opt, i) =>
        i === index ? { ...opt, ...updates } : opt
      ),
    });
  };

  return (
    <div className="space-y-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
      <div className="flex items-center gap-2">
        <List className="w-5 h-5 text-blue-600" />
        <span className="font-medium">Menu de Opções</span>
        <Badge variant="secondary" className="text-xs">
          {form.menu_options.filter(o => o.text.trim()).length}/10 opções
        </Badge>
      </div>

      {/* Menu Header */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm">Título do Menu</Label>
          <Input
            value={form.menu_title}
            onChange={(e) => setForm({ ...form, menu_title: e.target.value })}
            placeholder="📋 Menu Principal"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Descrição</Label>
          <Input
            value={form.menu_description}
            onChange={(e) => setForm({ ...form, menu_description: e.target.value })}
            placeholder="Escolha uma opção:"
          />
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Opções do Menu</Label>
        
        {form.menu_options.map((option, index) => (
          <Collapsible key={option.id} className="border rounded-lg bg-background">
            <div className="flex items-center gap-2 p-3">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <Badge variant="outline" className="font-mono">
                {index + 1}
              </Badge>
              <Input
                value={option.text}
                onChange={(e) => updateOption(index, { text: e.target.value })}
                placeholder={`Opção ${index + 1} - Ex: 📦 Ver produtos`}
                className="flex-1"
              />
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOption(index)}
                disabled={form.menu_options.length <= 1}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
            
            <CollapsibleContent className="px-3 pb-3 space-y-3 border-t pt-3">
              {/* Description (optional) */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Descrição (aparece no menu de lista)</Label>
                <Input
                  value={option.description}
                  onChange={(e) => updateOption(index, { description: e.target.value })}
                  placeholder="Descrição curta da opção..."
                />
              </div>
              
              {/* Action Type */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Ação ao selecionar</Label>
                <Select
                  value={option.action}
                  onValueChange={(v: any) => updateOption(index, { action: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map((at) => (
                      <SelectItem key={at.value} value={at.value}>
                        <div className="flex items-center gap-2">
                          <at.icon className="w-4 h-4" />
                          <span>{at.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Response Message */}
              {(option.action === 'message' || option.action === 'ai' || option.action === 'transfer' || option.action === 'end') && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {option.action === 'end' ? 'Mensagem de encerramento' : 
                     option.action === 'transfer' ? 'Mensagem de transferência' :
                     option.action === 'ai' ? 'Mensagem antes da IA' :
                     'Mensagem de resposta'}
                  </Label>
                  <Textarea
                    value={option.response_message}
                    onChange={(e) => updateOption(index, { response_message: e.target.value })}
                    placeholder={
                      option.action === 'end' ? '✅ Obrigado pelo contato! Volte sempre!' :
                      option.action === 'transfer' ? '🔄 Transferindo para um atendente...' :
                      option.action === 'ai' ? 'Vou te ajudar com isso! Me conte mais...' :
                      'Perfeito! Aqui está a informação que você pediu...'
                    }
                    rows={3}
                  />
                </div>
              )}
              
              {/* Subflow step ID */}
              {option.action === 'subflow' && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">ID da etapa de destino</Label>
                  <Input
                    value={option.next_step_id}
                    onChange={(e) => updateOption(index, { next_step_id: e.target.value })}
                    placeholder="Ex: produtos_menu, suporte_inicio"
                  />
                </div>
              )}
              
              {/* Data Collection */}
              {option.action === 'message' && (
                <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-xs">Coletar dado do usuário</Label>
                    </div>
                    <Switch
                      checked={option.collect_data || false}
                      onCheckedChange={(checked) => updateOption(index, { collect_data: checked })}
                    />
                  </div>
                  
                  {option.collect_data && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Tipo de dado</Label>
                        <Select
                          value={option.data_type || 'custom'}
                          onValueChange={(v: any) => updateOption(index, { data_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DATA_TYPES.map((dt) => (
                              <SelectItem key={dt.value} value={dt.value}>
                                {dt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Nome da variável</Label>
                        <Input
                          value={option.data_variable || ''}
                          onChange={(e) => updateOption(index, { data_variable: e.target.value })}
                          placeholder="Ex: nome_cliente"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        {form.menu_options.length < 10 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Opção
          </Button>
        )}
      </div>
    </div>
  );
}
