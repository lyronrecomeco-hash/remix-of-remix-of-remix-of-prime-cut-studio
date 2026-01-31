import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Filter,
  Download,
  UserX,
  Edit,
  Dumbbell,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { CreateStudentDialog } from '@/components/academiapro/admin/CreateStudentDialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function GymAdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    
    // Fetch only gym users - those who have a role in gym_user_roles
    const { data, error } = await supabase
      .from('gym_profiles')
      .select(`
        *,
        gym_user_roles!inner(role),
        gym_subscriptions(status, plan_id, expires_at)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error);
      toast.error('Erro ao carregar alunos');
    }

    if (data) {
      setStudents(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getSubscriptionStatus = (student: any) => {
    const sub = student.gym_subscriptions?.[0];
    if (!sub) return { label: 'Sem plano', variant: 'secondary' as const };
    switch (sub.status) {
      case 'active': return { label: 'Ativo', variant: 'default' as const };
      case 'pending': return { label: 'Pendente', variant: 'outline' as const };
      case 'inactive': return { label: 'Inativo', variant: 'destructive' as const };
      default: return { label: sub.status, variant: 'secondary' as const };
    }
  };

  const getRoleBadge = (student: any) => {
    const role = student.gym_user_roles?.[0]?.role || student.gym_user_roles?.role;
    switch (role) {
      case 'admin': return { label: 'Admin', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'instrutor': return { label: 'Instrutor', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      default: return { label: 'Aluno', className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
    }
  };

  const handleDeactivate = async (studentId: string, userId: string) => {
    if (!confirm('Deseja realmente desativar este usuário?')) return;

    const { error } = await supabase
      .from('gym_user_roles')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) {
      toast.error('Erro ao desativar usuário');
      return;
    }

    toast.success('Usuário desativado');
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-zinc-400 mt-1">
            {filteredStudents.length} usuário{filteredStudents.length !== 1 ? 's' : ''} cadastrado{filteredStudents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchStudents}
            className="border-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <CreateStudentDialog onSuccess={fetchStudents} />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>
        <Button variant="outline" className="border-zinc-800">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
        <Button variant="outline" className="border-zinc-800">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="text-left p-4 font-medium text-zinc-400">Aluno</th>
                <th className="text-left p-4 font-medium text-zinc-400 hidden sm:table-cell">Contato</th>
                <th className="text-left p-4 font-medium text-zinc-400 hidden md:table-cell">Tipo</th>
                <th className="text-left p-4 font-medium text-zinc-400 hidden lg:table-cell">Status</th>
                <th className="text-left p-4 font-medium text-zinc-400 hidden xl:table-cell">Cadastro</th>
                <th className="text-right p-4 font-medium text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-zinc-800 animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800" />
                        <div>
                          <div className="h-4 bg-zinc-800 rounded w-32 mb-1" />
                          <div className="h-3 bg-zinc-800 rounded w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell"><div className="h-4 bg-zinc-800 rounded w-40" /></td>
                    <td className="p-4 hidden md:table-cell"><div className="h-6 bg-zinc-800 rounded w-20" /></td>
                    <td className="p-4 hidden lg:table-cell"><div className="h-6 bg-zinc-800 rounded w-16" /></td>
                    <td className="p-4 hidden xl:table-cell"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
                    <td className="p-4"><div className="h-8 bg-zinc-800 rounded w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const status = getSubscriptionStatus(student);
                  const roleBadge = getRoleBadge(student);
                  return (
                    <tr key={student.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={student.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                              {student.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-sm text-zinc-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Mail className="w-4 h-4" />
                            <span className="truncate max-w-[150px]">{student.email}</span>
                          </div>
                          {student.phone && (
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <Phone className="w-4 h-4" />
                              {student.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roleBadge.className}`}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4 hidden xl:table-cell text-zinc-400 text-sm">
                        {format(new Date(student.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Dumbbell className="w-4 h-4 mr-2" />
                              Criar treino
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem 
                              className="cursor-pointer text-red-500 focus:text-red-500"
                              onClick={() => handleDeactivate(student.id, student.user_id)}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Desativar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    {search ? 'Nenhum aluno encontrado com este filtro' : 'Nenhum aluno cadastrado ainda'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
