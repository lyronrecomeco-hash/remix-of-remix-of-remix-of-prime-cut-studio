import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, RotateCcw, HeadphonesIcon, XCircle } from 'lucide-react';
import { ChatbotFormState, FailAction } from '../types';

interface ErrorControlSectionProps {
  form: ChatbotFormState;
  setForm: (form: ChatbotFormState) => void;
}

const FAIL_ACTIONS: Array<{ value: FailAction; label: string; icon: any; description: string }> = [
  { value: 'end', label: 'Encerrar', icon: XCircle, description: 'Finaliza o atendimento' },
  { value: 'transfer', label: 'Transferir', icon: HeadphonesIcon, description: 'Transfere para atendente' },
  { value: 'restart', label: 'Reiniciar', icon: RotateCcw, description: 'Volta ao início do fluxo' },
];

export function ErrorControlSection({ form, setForm }: ErrorControlSectionProps) {
  return (
    <div className="space-y-4 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <span className="font-medium">Controle de Erros</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Max Attempts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Máximo de tentativas</Label>
            <span className="text-sm font-medium text-muted-foreground">{form.max_attempts}x</span>
          </div>
          <Slider
            value={[form.max_attempts]}
            onValueChange={([v]) => setForm({ ...form, max_attempts: v })}
            min={1}
            max={5}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Quantas vezes o bot tentará entender uma resposta inválida
          </p>
        </div>

        {/* Fail Action */}
        <div className="space-y-2">
          <Label className="text-sm">Ação ao estourar tentativas</Label>
          <Select
            value={form.fail_action}
            onValueChange={(v: FailAction) => setForm({ ...form, fail_action: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FAIL_ACTIONS.map((fa) => (
                <SelectItem key={fa.value} value={fa.value}>
                  <div className="flex items-center gap-2">
                    <fa.icon className="w-4 h-4" />
                    <span>{fa.label}</span>
                    <span className="text-xs text-muted-foreground">- {fa.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fallback Message */}
      <div className="space-y-2">
        <Label className="text-sm">Mensagem de erro (fallback)</Label>
        <Textarea
          value={form.fallback_message}
          onChange={(e) => setForm({ ...form, fallback_message: e.target.value })}
          placeholder="Não entendi sua resposta 😅
Por favor, digite apenas o *número* da opção desejada."
          rows={3}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Mensagem enviada quando o usuário digita algo que não corresponde a nenhuma opção
        </p>
      </div>
    </div>
  );
}
