import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UserPlus, Sparkles, User, Mail, Phone, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStudentDialog({ onSuccess, open, onOpenChange }: CreateStudentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
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
      onOpenChange(false);
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
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'instrutor': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50 max-h-[90dvh] overflow-hidden flex flex-col"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-full">
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Novo Usuário</h2>
                    <p className="text-sm text-zinc-400">Criar acesso para aluno ou funcionário</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-zinc-500" />
                      Nome Completo
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="bg-zinc-800/50 border-zinc-700 focus:border-orange-500/50 h-11"
                      placeholder="João Silva"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-zinc-500" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-zinc-800/50 border-zinc-700 focus:border-orange-500/50 h-11"
                      placeholder="joao@email.com"
                      required
                    />
                  </div>
                  
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-zinc-500" />
                      Telefone <span className="text-zinc-500">(opcional)</span>
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-zinc-800/50 border-zinc-700 focus:border-orange-500/50 h-11"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-zinc-500" />
                      Senha
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="bg-zinc-800/50 border-zinc-700 focus:border-orange-500/50 h-11 flex-1"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={generatePassword}
                        className="border-zinc-700 hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-400 h-11 px-4"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Gerar
                      </Button>
                    </div>
                  </div>
                  
                  {/* Role */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-zinc-500" />
                      Tipo de Acesso
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'aluno' | 'instrutor' | 'admin') => 
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="aluno">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Aluno
                          </span>
                        </SelectItem>
                        <SelectItem value="instrutor">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Instrutor
                          </span>
                        </SelectItem>
                        <SelectItem value="admin">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Administrador
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 flex gap-3 flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 border-zinc-700 hover:bg-zinc-800 h-11"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 h-11"
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
