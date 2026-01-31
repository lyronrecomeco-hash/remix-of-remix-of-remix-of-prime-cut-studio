import { motion } from 'framer-motion';
import { 
  Settings, 
  Building2, 
  Bell, 
  Palette,
  Shield,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function GymAdminSettings() {
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-zinc-400 mt-1">Configure sua academia</p>
      </motion.div>

      {/* Academy Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Informações da Academia</h2>
            <p className="text-sm text-zinc-400">Dados básicos do estabelecimento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome da Academia</Label>
            <Input 
              placeholder="Academia Genesis" 
              className="bg-zinc-800 border-zinc-700"
              defaultValue="Academia Genesis"
            />
          </div>
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input 
              placeholder="00.000.000/0000-00" 
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input 
              placeholder="(11) 99999-9999" 
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              placeholder="contato@academia.com" 
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Endereço</Label>
            <Input 
              placeholder="Rua das Academias, 123" 
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>

        <Button className="mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
          Salvar Alterações
        </Button>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Notificações</h2>
            <p className="text-sm text-zinc-400">Configure as notificações</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Novo aluno cadastrado', description: 'Receba notificação quando um novo aluno se cadastrar' },
            { label: 'Check-in realizado', description: 'Notifique quando alunos fizerem check-in' },
            { label: 'Assinatura vencendo', description: 'Alerta quando assinaturas estiverem próximas do vencimento' },
            { label: 'Aula lotada', description: 'Notifique quando uma aula atingir capacidade máxima' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-zinc-400">{item.description}</p>
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
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Segurança</h2>
            <p className="text-sm text-zinc-400">Configurações de segurança</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
            <div>
              <p className="font-medium">Autenticação de dois fatores</p>
              <p className="text-sm text-zinc-400">Adicione uma camada extra de segurança</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
            <div>
              <p className="font-medium">Logs de acesso</p>
              <p className="text-sm text-zinc-400">Registre acessos ao painel</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
