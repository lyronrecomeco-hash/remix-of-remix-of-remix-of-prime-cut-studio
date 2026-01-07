import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sun, Sunset, Moon, ChevronDown, MessageSquare } from 'lucide-react';
import { ChatbotFormState } from '../types';

interface GreetingSectionProps {
  form: ChatbotFormState;
  setForm: (form: ChatbotFormState) => void;
}

export function GreetingSection({ form, setForm }: GreetingSectionProps) {
  return (
    <div className="space-y-4 p-4 bg-green-500/5 rounded-xl border border-green-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <span className="font-medium">Mensagem de Boas-vindas</span>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="dynamic-greeting" className="text-sm text-muted-foreground">
            Saudação por horário
          </Label>
          <Switch
            id="dynamic-greeting"
            checked={form.use_dynamic_greeting}
            onCheckedChange={(checked) => setForm({ ...form, use_dynamic_greeting: checked })}
          />
        </div>
      </div>
      
      {form.use_dynamic_greeting ? (
        <Collapsible defaultOpen className="space-y-3">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronDown className="w-4 h-4" />
            Configurar saudações por período
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Sun className="w-4 h-4 text-yellow-500" />
                Manhã (6h - 12h)
              </Label>
              <Textarea
                value={form.morning_greeting}
                onChange={(e) => setForm({ ...form, morning_greeting: e.target.value })}
                placeholder="Bom dia! ☀️ Seja bem-vindo(a)!..."
                rows={2}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Sunset className="w-4 h-4 text-orange-500" />
                Tarde (12h - 18h)
              </Label>
              <Textarea
                value={form.afternoon_greeting}
                onChange={(e) => setForm({ ...form, afternoon_greeting: e.target.value })}
                placeholder="Boa tarde! 🌤️ Seja bem-vindo(a)!..."
                rows={2}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Moon className="w-4 h-4 text-indigo-500" />
                Noite (18h - 6h)
              </Label>
              <Textarea
                value={form.evening_greeting}
                onChange={(e) => setForm({ ...form, evening_greeting: e.target.value })}
                placeholder="Boa noite! 🌙 Seja bem-vindo(a)!..."
                rows={2}
                className="text-sm"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={form.greeting_message}
            onChange={(e) => setForm({ ...form, greeting_message: e.target.value })}
            placeholder="Olá! 👋 Seja bem-vindo(a)!

Como posso ajudar você hoje?"
            rows={4}
            className="font-mono text-sm"
          />
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
          {'{{nome}}'} - Nome do contato
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">
          {'{{empresa}}'} - Nome da empresa
        </Badge>
      </div>
    </div>
  );
}
