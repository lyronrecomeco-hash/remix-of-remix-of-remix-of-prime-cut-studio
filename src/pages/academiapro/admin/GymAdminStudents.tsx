import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Filter,
  Download
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
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function GymAdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('gym_profiles')
      .select(`
        *,
        gym_user_roles(role),
        gym_subscriptions(status, plan_id, expires_at)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setStudents(data);
    }
    setIsLoading(false);
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getSubscriptionStatus = (student: any) => {
    const sub = student.gym_subscriptions?.[0];
    if (!sub) return { label: 'Sem plano', color: 'text-zinc-400 bg-zinc-800' };
    switch (sub.status) {
      case 'active': return { label: 'Ativo', color: 'text-green-500 bg-green-500/20' };
      case 'pending': return { label: 'Pendente', color: 'text-yellow-500 bg-yellow-500/20' };
      case 'inactive': return { label: 'Inativo', color: 'text-red-500 bg-red-500/20' };
      default: return { label: sub.status, color: 'text-zinc-400 bg-zinc-800' };
    }
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
          <p className="text-zinc-400 mt-1">Gerencie os alunos da academia</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Aluno
        </Button>
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
            placeholder="Buscar aluno..."
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
                <th className="text-left p-4 font-medium text-zinc-400 hidden md:table-cell">Status</th>
                <th className="text-left p-4 font-medium text-zinc-400 hidden lg:table-cell">Cadastro</th>
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
                    <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
                    <td className="p-4"><div className="h-8 bg-zinc-800 rounded w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const status = getSubscriptionStatus(student);
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
                            {student.email}
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-zinc-400 text-sm">
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
                            <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Criar treino</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Desativar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
                    Nenhum aluno encontrado
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
