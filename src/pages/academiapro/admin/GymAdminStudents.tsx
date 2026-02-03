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
  RefreshCw,
  UserPlus,
  ChevronLeft,
  ChevronRight
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
import { CreateStudentWizard } from '@/components/academiapro/admin/CreateStudentWizard';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 10;

export default function GymAdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // First get all users with gym roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('gym_user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setStudents([]);
        setIsLoading(false);
        return;
      }

      const userIds = rolesData.map(r => r.user_id);

      // Then get profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('gym_profiles')
        .select('*')
        .in('user_id', userIds)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get subscriptions for those users
      const { data: subsData } = await supabase
        .from('gym_subscriptions')
        .select('user_id, status, plan_id, expires_at')
        .in('user_id', userIds);

      // Merge data
      const mergedData = profilesData?.map(profile => {
        const role = rolesData.find(r => r.user_id === profile.user_id);
        const subscription = subsData?.find(s => s.user_id === profile.user_id);
        return {
          ...profile,
          gym_user_roles: role ? { role: role.role } : null,
          gym_subscriptions: subscription ? [subscription] : []
        };
      }) || [];

      setStudents(mergedData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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

    try {
      toast.success('Usuário marcado para desativação');
      fetchStudents();
    } catch (error) {
      toast.error('Erro ao desativar usuário');
    }
  };

  const handleWizardSuccess = () => {
    // Recarregar lista após criar aluno
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
          <h1 className="text-2xl lg:text-3xl font-bold">Alunos</h1>
          <p className="text-zinc-400 mt-1 text-sm">
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
          <Button 
            onClick={() => setIsWizardOpen(true)}
            className="bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Aluno
          </Button>
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
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
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
        className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="text-left p-4 font-medium text-zinc-400 text-sm">Aluno</th>
                <th className="text-left p-4 font-medium text-zinc-400 text-sm hidden sm:table-cell">Contato</th>
                <th className="text-left p-4 font-medium text-zinc-400 text-sm hidden md:table-cell">Tipo</th>
                <th className="text-left p-4 font-medium text-zinc-400 text-sm hidden lg:table-cell">Status</th>
                <th className="text-left p-4 font-medium text-zinc-400 text-sm hidden xl:table-cell">Cadastro</th>
                <th className="text-right p-4 font-medium text-zinc-400 text-sm">Ações</th>
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
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => {
                  const status = getSubscriptionStatus(student);
                  const roleBadge = getRoleBadge(student);
                  return (
                    <tr key={student.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={student.avatar_url || ''} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {student.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate text-sm">{student.full_name}</p>
                            <p className="text-xs text-zinc-400 truncate">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{student.email}</span>
                          </div>
                          {student.phone && (
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <Phone className="w-3 h-3" />
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
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4 hidden xl:table-cell text-zinc-400 text-xs">
                        {format(new Date(student.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                            <DropdownMenuItem className="cursor-pointer text-sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-sm">
                              <Dumbbell className="w-4 h-4 mr-2" />
                              Criar treino
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem 
                              className="cursor-pointer text-red-500 focus:text-red-500 text-sm"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-400">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} de {filteredStudents.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-zinc-700 h-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-zinc-400 min-w-[80px] text-center">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-zinc-700 h-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Wizard Modal */}
      <CreateStudentWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onSuccess={handleWizardSuccess} 
      />
    </div>
  );
}
