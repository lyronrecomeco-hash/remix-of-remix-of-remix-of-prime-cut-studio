import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Bot, Sparkles, ChevronDown, Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import { ChatbotFormState, AIMode } from '../types';

interface AISectionProps {
  form: ChatbotFormState;
  setForm: (form: ChatbotFormState) => void;
}

const AI_MODES: Array<{ value: AIMode; label: string; description: string; badge?: string }> = [
  { 
    value: 'disabled', 
    label: 'Desativado', 
    description: 'Fluxo 100% estruturado, sem IA',
  },
  { 
    value: 'support', 
    label: 'Apoio', 
    description: 'IA ajuda quando usuário sai do fluxo',
    badge: 'Recomendado',
  },
  { 
    value: 'full', 
    label: 'Atendimento completo', 
    description: 'IA responde todas as mensagens',
  },
];

const DEFAULT_RULES = [
  'Não invente informações que não possui',
  'Siga o fluxo estruturado do chatbot',
  'Seja cordial e profissional',
  'Não mencione que é uma IA',
  'Responda apenas sobre o escopo do atendimento',
];

export function AISection({ form, setForm }: AISectionProps) {
  const [newRule, setNewRule] = useState('');

  const addRule = () => {
    if (!newRule.trim()) return;
    setForm({
      ...form,
      ai_rules: [...form.ai_rules, newRule.trim()],
    });
    setNewRule('');
  };

  const removeRule = (index: number) => {
    setForm({
      ...form,
      ai_rules: form.ai_rules.filter((_, i) => i !== index),
    });
  };

  const loadDefaultRules = () => {
    setForm({ ...form, ai_rules: DEFAULT_RULES });
  };

  return (
    <div className="space-y-4 p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          <span className="font-medium">Luna IA</span>
          <Badge variant="outline" className="text-xs">
            Opcional
          </Badge>
        </div>
        {form.ai_mode !== 'disabled' && (
          <Badge className="bg-purple-500/20 text-purple-700 border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            {form.ai_mode === 'support' ? 'Modo Apoio' : 'Modo Completo'}
          </Badge>
        )}
      </div>

      {/* AI Mode Selection */}
      <div className="grid gap-2 md:grid-cols-3">
        {AI_MODES.map((mode) => (
          <Button
            key={mode.value}
            type="button"
            variant={form.ai_mode === mode.value ? 'default' : 'outline'}
            className="h-auto py-3 px-4 flex flex-col items-start text-left relative"
            onClick={() => setForm({ ...form, ai_mode: mode.value })}
          >
            {mode.badge && (
              <Badge className="absolute -top-2 -right-2 text-[10px] bg-green-500">
                {mode.badge}
              </Badge>
            )}
            <span className="font-medium">{mode.label}</span>
            <span className="text-xs opacity-70 font-normal">{mode.description}</span>
          </Button>
        ))}
      </div>

      {form.ai_mode !== 'disabled' && (
        <Collapsible defaultOpen className="space-y-4">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full">
            <ChevronDown className="w-4 h-4" />
            Configurações da IA
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4">
            {/* System Prompt */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                Prompt do Sistema
                <Badge variant="outline" className="text-[10px]">Importante</Badge>
              </Label>
              <Textarea
                value={form.ai_system_prompt}
                onChange={(e) => setForm({ ...form, ai_system_prompt: e.target.value })}
                placeholder={`Você é o assistente virtual da {{empresa}}.

Seu papel é:
- Ajudar clientes com dúvidas sobre produtos/serviços
- Direcionar para as opções corretas do menu
- Ser cordial e profissional

Informações da empresa:
- Nome: {{empresa}}
- Segmento: [descreva]
- Horário: [descreva]

Nunca invente informações. Se não souber, direcione para um atendente.`}
                rows={8}
                className="font-mono text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted text-xs"
                  onClick={() => setForm({ 
                    ...form, 
                    ai_system_prompt: form.ai_system_prompt + '\n\n{{empresa}} - Nome da empresa' 
                  })}
                >
                  + {'{{empresa}}'}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted text-xs"
                  onClick={() => setForm({ 
                    ...form, 
                    ai_system_prompt: form.ai_system_prompt + '\n\n{{nome}} - Nome do cliente' 
                  })}
                >
                  + {'{{nome}}'}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted text-xs"
                  onClick={() => setForm({ 
                    ...form, 
                    ai_system_prompt: form.ai_system_prompt + '\n\n{{dados_coletados}} - Dados da sessão' 
                  })}
                >
                  + {'{{dados_coletados}}'}
                </Badge>
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Temperatura (criatividade)</Label>
                <span className="text-sm font-medium">{form.ai_temperature}</span>
              </div>
              <Slider
                value={[form.ai_temperature]}
                onValueChange={([v]) => setForm({ ...form, ai_temperature: v })}
                min={0}
                max={1}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Preciso</span>
                <span>Criativo</span>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Regras da IA
                </Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadDefaultRules}
                  className="text-xs"
                >
                  Carregar padrão
                </Button>
              </div>
              
              <div className="space-y-2">
                {form.ai_rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="flex-1 text-sm">{rule}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Adicionar nova regra..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                />
                <Button type="button" variant="outline" size="sm" onClick={addRule}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <p className="text-xs text-orange-700 dark:text-orange-300">
                <strong>⚠️ Importante:</strong> A IA NUNCA quebra o fluxo estruturado. 
                Ela apenas responde dúvidas, interpreta respostas livres e ajuda na decisão de próxima etapa.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
