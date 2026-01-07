import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Code, ChevronDown, AlertCircle, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ChatbotFormState, FlowConfig } from '../types';
import { safeParseFlowJson, validateFlowConfig } from '../FlowBuilder';

interface AdvancedSectionProps {
  form: ChatbotFormState;
  setForm: (form: ChatbotFormState) => void;
  generatedFlow: FlowConfig | null;
}

export function AdvancedSection({ form, setForm, generatedFlow }: AdvancedSectionProps) {
  const copyGeneratedFlow = () => {
    if (generatedFlow) {
      navigator.clipboard.writeText(JSON.stringify(generatedFlow, null, 2));
      toast.success('Flow copiado!');
    }
  };

  const validateJson = () => {
    const result = safeParseFlowJson(form.flow_config_json);
    if (!result.ok) {
      toast.error(`Erro: ${(result as { ok: false; error: string }).error}`);
      return;
    }
    const validation = validateFlowConfig((result as { ok: true; data: FlowConfig }).data);
    if (!validation.valid) {
      toast.error(`Problemas: ${validation.errors.join(', ')}`);
    } else {
      toast.success('Flow válido!');
    }
  };

  return (
    <Collapsible className="space-y-4 p-4 bg-muted/30 rounded-xl border">
      <CollapsibleTrigger className="flex items-center gap-2 w-full">
        <Code className="w-5 h-5 text-muted-foreground" />
        <span className="font-medium">Configuração Avançada</span>
        <Badge variant="outline" className="text-xs ml-auto mr-2">
          Para desenvolvedores
        </Badge>
        <ChevronDown className="w-4 h-4" />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 pt-4">
        {/* Company Name */}
        <div className="space-y-2">
          <Label className="text-sm">Nome da Empresa</Label>
          <Input
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            placeholder="Ex: Minha Empresa Ltda"
          />
          <p className="text-xs text-muted-foreground">
            Usado na variável {'{{empresa}}'} nas mensagens
          </p>
        </div>

        {/* JSON Editor Toggle */}
        <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
          <div>
            <Label className="text-sm font-medium">Editar Flow JSON manualmente</Label>
            <p className="text-xs text-muted-foreground">
              Para fluxos complexos ou importação
            </p>
          </div>
          <Switch
            checked={form.use_flow_json}
            onCheckedChange={(checked) => {
              if (checked && generatedFlow) {
                setForm({ 
                  ...form, 
                  use_flow_json: true,
                  flow_config_json: JSON.stringify(generatedFlow, null, 2)
                });
              } else {
                setForm({ ...form, use_flow_json: checked });
              }
            }}
          />
        </div>

        {form.use_flow_json ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Flow Config JSON</Label>
              <Button type="button" variant="outline" size="sm" onClick={validateJson}>
                <Check className="w-4 h-4 mr-1" />
                Validar
              </Button>
            </div>
            <Textarea
              value={form.flow_config_json}
              onChange={(e) => setForm({ ...form, flow_config_json: e.target.value })}
              placeholder='{"version": "2.0", "startStep": "greeting", "steps": {...}}'
              rows={15}
              className="font-mono text-xs"
            />
            <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Ao ativar esta opção, o JSON será usado diretamente, ignorando as configurações visuais acima.
              </p>
            </div>
          </div>
        ) : generatedFlow && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Flow Gerado (preview)</Label>
              <Button type="button" variant="ghost" size="sm" onClick={copyGeneratedFlow}>
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </Button>
            </div>
            <pre className="p-3 bg-muted rounded-lg text-xs overflow-auto max-h-48">
              {JSON.stringify(generatedFlow, null, 2)}
            </pre>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
