import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Hash, MessageSquare, Users, Moon, Timer, List, LayoutGrid, Zap } from 'lucide-react';
import { ChatbotFormState } from '../types';

type ResponseType = 'text' | 'buttons' | 'list';

interface BasicInfoSectionProps {
  form: ChatbotFormState;
  setForm: (form: ChatbotFormState) => void;
  instances: Array<{ id: string; name: string; status: string }>;
}

const TRIGGER_TYPES = [
  { value: 'keyword', label: 'Palavra-chave', icon: Hash, description: 'Responde quando mensagem contém palavra' },
  { value: 'all', label: 'Todas as mensagens', icon: MessageSquare, description: 'Responde a qualquer mensagem' },
  { value: 'first_contact', label: 'Primeiro contato', icon: Users, description: 'Apenas na primeira mensagem' },
  { value: 'business_hours', label: 'Fora do expediente', icon: Moon, description: 'Responde fora do horário' },
  { value: 'inactivity', label: 'Inatividade', icon: Timer, description: 'Após X minutos sem resposta' },
];

const RESPONSE_TYPES: Array<{ value: ResponseType; label: string; icon: any; description: string }> = [
  { value: 'text', label: 'Texto', icon: MessageSquare, description: 'Resposta simples' },
  { value: 'list', label: 'Menu Lista', icon: List, description: 'Menu com opções' },
  { value: 'buttons', label: 'Botões', icon: LayoutGrid, description: 'Botões clicáveis' },
];

export function BasicInfoSection({ form, setForm, instances }: BasicInfoSectionProps) {
  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="p-4 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-xl border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">Informações Básicas</h4>
            <p className="text-xs text-muted-foreground">Configure nome, gatilho e tipo de resposta</p>
          </div>
        </div>
        
        {/* Name and Instance */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nome do Chatbot *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Atendimento Clínica"
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nome da Empresa</Label>
            <Input
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              placeholder="Ex: Clínica São Lucas"
              className="bg-background"
            />
          </div>
        </div>
        
        {instances.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium">Instância WhatsApp</Label>
            <Select
              value={form.instance_id || "__all__"}
              onValueChange={(v) => setForm({ ...form, instance_id: v === "__all__" ? "" : v })}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Todas as instâncias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span>Todas as instâncias</span>
                  </div>
                </SelectItem>
                {instances.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Trigger Configuration */}
      <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Gatilho de Ativação</span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm">Quando ativar</Label>
            <Select
              value={form.trigger_type}
              onValueChange={(v) => setForm({ ...form, trigger_type: v })}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <t.icon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span>{t.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">- {t.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {form.trigger_type === 'keyword' && (
            <div className="space-y-2">
              <Label className="text-sm">Palavras-chave *</Label>
              <Input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="oi, olá, bom dia, menu, *"
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Separe por vírgula. Use * para qualquer mensagem.</p>
            </div>
          )}
        </div>
      </div>

      {/* Response Type */}
      <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <span className="font-medium">Tipo de Resposta</span>
          <Badge variant="outline" className="text-xs ml-auto">
            {form.response_type === 'list' ? 'Recomendado' : form.response_type}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {RESPONSE_TYPES.map((rt) => (
            <Button
              key={rt.value}
              type="button"
              variant={form.response_type === rt.value ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setForm({ ...form, response_type: rt.value })}
            >
              <rt.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{rt.label}</span>
              <span className="text-[10px] opacity-70">{rt.description}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
