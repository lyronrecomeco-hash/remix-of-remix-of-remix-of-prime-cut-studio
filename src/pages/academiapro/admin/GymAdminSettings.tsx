import { motion } from 'framer-motion';
import { 
  Building2, 
  Bell, 
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GymThemePersonalization } from '@/components/academiapro/admin/GymThemePersonalization';

export default function GymAdminSettings() {
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Configure sua academia</p>
      </motion.div>

      {/* Academy Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-foreground">Informações da Academia</h2>
            <p className="text-sm text-muted-foreground">Dados básicos do estabelecimento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome da Academia</Label>
            <Input 
              placeholder="Academia Genesis" 
              className="bg-muted border-border"
              defaultValue="Academia Genesis"
            />
          </div>
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input 
              placeholder="00.000.000/0000-00" 
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input 
              placeholder="(11) 99999-9999" 
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              placeholder="contato@academia.com" 
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Endereço</Label>
            <Input 
              placeholder="Rua das Academias, 123" 
              className="bg-muted border-border"
            />
          </div>
        </div>

        <Button className="mt-6">
          Salvar Alterações
        </Button>
      </motion.div>

      {/* Personalization Section */}
      <GymThemePersonalization />

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-foreground">Notificações</h2>
            <p className="text-sm text-muted-foreground">Configure as notificações</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Novo aluno cadastrado', description: 'Receba notificação quando um novo aluno se cadastrar' },
            { label: 'Check-in realizado', description: 'Notifique quando alunos fizerem check-in' },
            { label: 'Assinatura vencendo', description: 'Alerta quando assinaturas estiverem próximas do vencimento' },
            { label: 'Aula lotada', description: 'Notifique quando uma aula atingir capacidade máxima' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-foreground">Segurança</h2>
            <p className="text-sm text-muted-foreground">Configurações de segurança</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium text-foreground">Autenticação de dois fatores</p>
              <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium text-foreground">Logs de acesso</p>
              <p className="text-sm text-muted-foreground">Registre acessos ao painel</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
