import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UserPlus, Eye, EyeOff, Sparkles, X, User, Mail, Phone, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateStudentDialogProps {
  onSuccess: () => void;
}

export function CreateStudentDialog({ onSuccess }: CreateStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'aluno' as 'aluno' | 'instrutor' | 'admin'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('gym-create-user', {
        body: formData
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      toast.success('Usuário criado com sucesso!', {
        description: `${formData.full_name} pode fazer login com o email e senha cadastrados.`
      });
      
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'aluno'
      });
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error('Erro ao criar usuário', {
        description: error.message || 'Tente novamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    setShowPassword(true);
  };

  const roleConfig = {
    aluno: { icon: User, color: 'text-green-500', bg: 'bg-green-500/10' },
    instrutor: { icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    admin: { icon: Shield, color: 'text-orange-500', bg: 'bg-orange-500/10' }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg shadow-orange-500/20">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg p-0 overflow-hidden">
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 border-b border-zinc-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h20v20H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M10%200v20M0%2010h20%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.03)%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
          <DialogHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Criar Novo Usuário</DialogTitle>
                <p className="text-zinc-400 text-sm mt-1">Preencha os dados para criar um novo acesso</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome */}
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-500" />
              Nome Completo
            </Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-zinc-800/50 border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20 h-11"
              placeholder="João Silva"
              required
            />
          </div>
          
          {/* Email */}
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500" />
              Email
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-zinc-800/50 border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20 h-11"
              placeholder="joao@email.com"
              required
            />
          </div>
          
          {/* Telefone */}
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-zinc-500" />
              Telefone
            </Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-zinc-800/50 border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20 h-11"
              placeholder="(11) 99999-9999"
            />
          </div>
          
          {/* Senha */}
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-500" />
              Senha
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20 h-11 pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={generatePassword}
                className="border-zinc-700 hover:bg-zinc-800 hover:border-orange-500/50 h-11 px-4"
              >
                <Sparkles className="w-4 h-4 mr-2 text-orange-500" />
                Gerar
              </Button>
            </div>
          </div>
          
          {/* Tipo de Acesso */}
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-500" />
              Tipo de Acesso
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'aluno' | 'instrutor' | 'admin') => 
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 focus:border-orange-500 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="aluno" className="focus:bg-green-500/10">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-500" />
                    <span>Aluno</span>
                  </div>
                </SelectItem>
                <SelectItem value="instrutor" className="focus:bg-blue-500/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Instrutor</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin" className="focus:bg-orange-500/10">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-500" />
                    <span>Administrador</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={formData.role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg ${roleConfig[formData.role].bg} border border-zinc-700/50`}
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = roleConfig[formData.role].icon;
                  return <Icon className={`w-5 h-5 ${roleConfig[formData.role].color}`} />;
                })()}
                <div>
                  <p className={`font-medium ${roleConfig[formData.role].color}`}>
                    {formData.role === 'aluno' && 'Acesso de Aluno'}
                    {formData.role === 'instrutor' && 'Acesso de Instrutor'}
                    {formData.role === 'admin' && 'Acesso Administrativo'}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formData.role === 'aluno' && 'Pode acessar treinos, aulas e fazer check-in'}
                    {formData.role === 'instrutor' && 'Pode gerenciar treinos e alunos'}
                    {formData.role === 'admin' && 'Acesso total ao sistema'}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-zinc-700 hover:bg-zinc-800 h-11"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-11 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Usuário
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}